
const passport = require('passport');
require('../../auth/admin-passport')(passport);

const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

let dayjs = require('dayjs');
let advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);

const { getToken } = require('../../utils/token.utils');
const { fetchAccountReport } = require('../../queries/paysafe-account-report');
const { fetchPlayerRegistrationsReport } = require('../../queries/paysafe-player-registrations-report');
const { fetchACIDReport } = require('../../queries/paysafe-acid-report');
const {
    AffPartner,
    AffReport,
    AffApplication,
    AffPayment,
    AffAccount,
    AffReportMonthly,
    AffSubReport
} = require('../../models/affiliate/index');
const {
    Application,
    ActiveUser
} = require('../../models/personal/index');
const { createAccountReport, createAffAccAffReport } = require('../../utils/account-functions');
const { applicationYY, applicationYN, applicationNN } = require('../../utils/notifications-list');
const { createUserNotification, createAffNotification } = require('../../utils/notifications-functions');


// POST /admin/api/call-daily-functions
router.post('/call-daily-functions', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        const { brand, month, date, fetchUrl, callFunction } = req.body;
        const url = fetchUrl;
        try {
            if (callFunction === 'ACR') fetchAccountReport({ brand, month, date, url });
            if (callFunction === 'PRR') fetchPlayerRegistrationsReport({ brand, month, date, url });
            if (callFunction === 'ACI') fetchACIDReport({ brand, url });
            return res.status(200).send({ msg: 'Successfully called API' });
        } catch (err) {
            console.log(err)
            return res.status(400).send({ msg: 'Error calling API' })
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// POST /admin/api/fetch-applications-csv
router.post('/fetch-applications-csv', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {    
        let { sort, query } = req.body;
        try {
            let affApplications = await AffApplication.find(query).sort(sort);
            let dashApplications = await Application.find(query).sort(sort);
            let applications = [...affApplications, ...dashApplications]
            return res.status(200).send({ applications }); 
        } catch (err) {
            console.log(err);
            return res.status(400).send(err)
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// POST /admin/api/upload-application-results
router.post('/upload-application-results', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        let transactionFile = req.files.file;
        let fileName = path.join(__dirname, '../../csv/application-results.csv');
        transactionFile.mv(fileName, function (err) {
            if (err) return res.status(500).send(err);
            let applicationData = [];
            let inputStream = fs.createReadStream(fileName, 'utf8');
            inputStream.pipe(csv(['accountId', 'Tagged', 'Upgraded'])) // set headers manually
            .on('data', data => applicationData.push(data))
            .on('end', () => {
                applicationData = applicationData.reduce((acc, item) => acc.some(a => a.accountId === item.accountId) ? acc : (acc.push(item), acc), []); // remove duplicates - have to put second return of acc inside brackets (acc.push(item), acc) otherwise it will not return acc
                applicationData.map(async app => {
                    const today = dayjs().format('DD/MM/YYYY');
                    const update = {
                        'status': app.Tagged === 'Y' ? 'Approved' : 'Declined',
                        'upgradeStatus': (app.Upgraded === 'Y') ? `Upgraded ${today}` : (app.Tagged === 'Y' && app.Upgraded === 'N') ? `Not verified ${today}` : `Declined ${today}`,
                        'availableUpgrade.valid': (app.Upgraded === 'Y') ? false : ( app.Tagged === 'N') ? false : true 
                    };
                    if (app.Upgraded === 'Y' || app.Tagged === 'N') update['availableUpgrade.status'] = '-';
                    let workOutAction = (tagged, upgraded) => (tagged === 'Y' && upgraded === 'Y') ? 'YY' : (tagged === 'Y' && upgraded === 'N') ? 'YN' : 'NN';
                    let action = workOutAction(app.Tagged, app.Upgraded);
                    
                    try {
                        const existingAffApplication = await AffApplication.findOne({ 'accountId': app.accountId }).select('accountId').lean();
                        const existingDashApplication = await Application.findOne({ 'accountId': app.accountId }).select('accountId').lean();
                        if (existingAffApplication) { // updating affiliate applications
                            const aa = await AffApplication.findByIdAndUpdate(existingAffApplication._id, update, { new: true });
                            console.log('aa: ', aa);
                            const { brand, belongsTo, accountId } = aa; // deconstruct updated application
                            // notifications
                            if (action === 'YY') createAffNotification(applicationYY({ brand, accountId, belongsTo }));
                            if (action === 'YN') createAffNotification(applicationYN({ brand, accountId, belongsTo }));
                            if (action === 'NN') createAffNotification(applicationNN({ brand, accountId, belongsTo }));
                            // send emails  >>>>>>>>>>>>>
                            if (action === 'YY' || action === 'YN') await createAffAccAffReport ({ accountId, brand, belongsTo }); // create affaccount and affreport if not already created (Only if YY or YN)
                        };
                        if (existingDashApplication) { // updating dash / personal applications
                            const ab = await Application.findByIdAndUpdate(existingDashApplication._id, update, { new: true });
                            console.log('ab: ', ab);
                            const { brand, belongsTo, accountId } = ab; // deconstruct updated application
                            let _id = (await ActiveUser.findById(belongsTo).select('belongsTo').lean()).belongsTo; // get the _id of the user that activeuser belongsTo
                            if (action === 'YY') createUserNotification(applicationYY({ brand, accountId, belongsTo: _id }));
                            if (action === 'YN') createUserNotification(applicationYN({ brand, accountId, belongsTo: _id }));
                            if (action === 'NN') createUserNotification(applicationNN({ brand, accountId, belongsTo: _id }));
                            // send emails >>>>>>>
                            if (action === 'YY' || action === 'YN') await createAccountReport({ accountId, brand, belongsTo })
                        }
                    } catch (error) {
                        console.log(error);
                        return error;
                    }
                })
                return res.status(201).send({ msg: 'Successfully updated applications' });
            })  
        });        
    } else return res.status(403).send({ msg: 'Unauthorised' });
});






module.exports = router;
