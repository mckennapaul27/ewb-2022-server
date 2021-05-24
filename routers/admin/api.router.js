
const passport = require('passport');
require('../../auth/admin-passport')(passport);

const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const crypto = require('crypto');

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
    AffSubReport,
    AffNotification
} = require('../../models/affiliate/index');
const {
    Application,
    ActiveUser
} = require('../../models/personal/index');
const { createAccountReport, createAffAccAffReport } = require('../../utils/account-functions');
const { applicationYY, applicationYN, applicationNN } = require('../../utils/notifications-list');
const { createUserNotification, createAffNotification } = require('../../utils/notifications-functions');
const { uploadAffReports } = require('../../queries/ecopayz-account-report');
const { sendEmail } = require('../../utils/sib-helpers');
const { Brand } = require('../../models/common');


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
            console.log(err);
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
        let { sort } = req.body;
        let query = {
            $or: [
                { status: 'Pending' },
                { upgradeStatus: { $regex: /.*Requested.*/ } }
            ]
        }
        try {
            let affApplications = await AffApplication.find(query).sort(sort);
            let dashApplications = await Application.find(query).sort(sort);
            let applications = [...affApplications, ...dashApplications];
            return res.status(200).send({ applications }); 
        } catch (err) {
            return res.status(400).send(err)
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// POST /admin/api/add-notification
router.post('/add-notification', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        const { isGeneral, type, message } = req.body;
        try {
            await AffNotification.create({ isGeneral, message, type })
            return res.status(200).send({ msg: 'Successfully added notification' });
        } catch (error) {
            return res.status(400).send(err)
        }
    } else return res.status(403).send({ msg: 'Unauthorised' });
})
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
                    let update = {
                        'status': app.Tagged === 'Y' ? 'Approved' : 'Declined',
                        'upgradeStatus': (app.Upgraded === 'Y') ? `Upgraded ${today}` : (app.Tagged === 'Y' && app.Upgraded === 'N') ? `Not verified ${today}` : `Declined ${today}`,
                        'availableUpgrade.valid': (app.Upgraded === 'Y') ? false : ( app.Tagged === 'N') ? false : true 
                    };
                    if (app.Upgraded === 'Y' || app.Tagged === 'N') update['availableUpgrade.status'] = '-';
                    let workOutAction = (tagged, upgraded) => (tagged === 'Y' && upgraded === 'Y') ? 'YY' : (tagged === 'Y' && upgraded === 'N') ? 'YN' : 'NN';
                    let action = workOutAction(app.Tagged, app.Upgraded);
                    
                    try {
                        const existingAffApplication = await AffApplication.findOne({ 'accountId': app.accountId }).select('accountId brand').lean();
                        const existingDashApplication = await Application.findOne({ 'accountId': app.accountId }).select('accountId brand').lean();

                        if (existingAffApplication) { // AFFILIATE APPLICATIONS
                            
                            // THIS SECTION BELOW IS TO BE USED WHILST WE HAVE NO VIP UPGRADE - UPDATING UPDATE OBJECT TO Confirmed instead of Upgraded.
                            if (existingAffApplication.brand === 'Skrill') update['upgradeStatus'] = `Confirmed ${today}`;
                            // THIS SECTION BELOW IS TO BE USED WHILST WE HAVE NO VIP UPGRADE- UPDATING UPDATE OBJECT TO Confirmed instead of Upgraded.

                            const aa = await AffApplication.findByIdAndUpdate(existingAffApplication._id, update, { new: true });
                            const { brand, belongsTo, accountId } = aa; // deconstruct updated application

                            const partner = await AffPartner.findById(belongsTo).select('email').lean()

                             // /* emails section */
                            if (action === 'YY') { // template 65 needs params.OFFER
                                createAffNotification(applicationYY({ brand, accountId, belongsTo }));
                                const { initialUpgrade } = await Brand.findOne({ brand }).select('initialUpgrade').lean();
                                await sendEmail({
                                    templateId: 65, 
                                    smtpParams: {
                                        BRAND: brand,
                                        ACCOUNTID: accountId,
                                        EMAIL: '-',
                                        CURRENCY: '-',
                                        OFFER: initialUpgrade
                                    }, 
                                    tags: ['Application'], 
                                    email: partner.email
                                })
                            } else if (action === 'YN') {
                                createAffNotification(applicationYN({ brand, accountId, belongsTo }));
                                await sendEmail({
                                    templateId: 2, 
                                    smtpParams: {
                                        BRAND: brand,
                                        ACCOUNTID: accountId,
                                        EMAIL: '-',
                                        CURRENCY: '-'
                                    }, 
                                    tags: ['Application'], 
                                    email: partner.email
                                })
                            } else if (action === 'NN') {
                                createAffNotification(applicationNN({ brand, accountId, belongsTo })); // Do not send email as covering NN below 
                                await sendEmail({
                                    templateId: 3, 
                                    smtpParams: {
                                        BRAND: brand,
                                        ACCOUNTID: accountId,
                                        EMAIL: '-'
                                    }, 
                                    tags: ['Application'], 
                                    email: partner.email
                                });

                            } else null;
                            // /* emails section */
                            if (action === 'YY' || action === 'YN') await createAffAccAffReport ({ accountId, brand, belongsTo }); // create affaccount and affreport if not already created (Only if YY or YN)
                        };
                        
                        if (existingDashApplication) { // PERSONAL APPLICATIONS

                            // THIS SECTION BELOW IS TO BE USED WHILST WE HAVE NO VIP UPGRADE - UPDATING UPDATE OBJECT TO Confirmed instead of Upgraded.
                            if (existingDashApplication.brand === 'Skrill') update['upgradeStatus'] = `Confirmed ${today}`;
                            // THIS SECTION BELOW IS TO BE USED WHILST WE HAVE NO VIP UPGRADE- UPDATING UPDATE OBJECT TO Confirmed instead of Upgraded.

                            const ab = await Application.findByIdAndUpdate(existingDashApplication._id, update, { new: true });
                            const { brand, belongsTo, accountId, email, currency } = ab; // deconstruct updated application
                            const activeUser = await ActiveUser.findById(belongsTo).select('belongsTo').lean(); // get the _id of the user that activeuser belongsTo
                            if (activeUser && activeUser.belongsTo) {
                                if (action === 'YY') {
                                    createUserNotification(applicationYY({ brand, accountId, belongsTo: activeUser.belongsTo }));
                                    const { initialUpgrade } = await Brand.findOne({ brand }).select('initialUpgrade').lean();
                                    await sendEmail({
                                        templateId: 65, 
                                        smtpParams: {
                                            BRAND: brand,
                                            ACCOUNTID: accountId,
                                            EMAIL: email,
                                            CURRENCY: currency,
                                            OFFER: initialUpgrade
                                        }, 
                                        tags: ['Application'], 
                                        email: email
                                    })
                                } else if (action === 'YN') {
                                    createUserNotification(applicationYN({ brand, accountId, belongsTo: activeUser.belongsTo }));
                                    await sendEmail({
                                        templateId: 2, 
                                        smtpParams: {
                                            BRAND: brand,
                                            ACCOUNTID: accountId,
                                            EMAIL: email,
                                            CURRENCY: currency
                                        }, 
                                        tags: ['Application'], 
                                        email: email
                                    })
                                } else if (action === 'NN') {
                                    createUserNotification(applicationNN({ brand, accountId, belongsTo: activeUser.belongsTo })); // Do not send email as covering NN below                    
                                } else null;
                            };

                            // email if application is "light" application - only sent if YY or YN
                            if (!belongsTo && (action === 'YY' || action === 'YN'))  {
                                const buffer = await crypto.randomBytes(20);
                                const token = buffer.toString('hex');
                                await Application.findByIdAndUpdate(existingDashApplication._id, { applicationToken: token, applicationExpires: Date.now() + 86400000 }, { new: true })
                                await sendEmail({
                                    templateId: 4, 
                                    smtpParams: {
                                        BRAND: brand,
                                        ACCOUNTID: accountId,
                                        ID: token,
                                        EMAIL: email,
                                        CURRENCY: currency
                                    }, 
                                    tags: ['Application'], 
                                    email: email
                                })
                            };

                            if (action === 'NN') await sendEmail({
                                templateId: 3, 
                                smtpParams: {
                                    BRAND: brand,
                                    ACCOUNTID: accountId,
                                    EMAIL: email
                                }, 
                                tags: ['Application'], 
                                email: email
                            });

                            // if YY or YN call this function which will only create account and report if doesn't already exist
                            if ((action === 'YY' || action === 'YN') && belongsTo) await createAccountReport({ accountId, brand, belongsTo }); // create affaccount and affreport if not already created (Only if YY or YN)
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

// POST /admin/api/upload-reports - uploading applications using CSV
router.post('/upload-reports', passport.authenticate('admin', {
    session: false
}), uploadAffReports);





module.exports = router;
