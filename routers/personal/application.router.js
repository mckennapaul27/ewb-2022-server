const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../../auth/passport')(passport);
const dayjs = require('dayjs')
const { getToken } = require('../../utils/token.utils')
const {
    Application,
    ActiveUser
} = require('../../models/personal');
const {
    AffApplication
} = require('../../models/affiliate/index')
const { createUserNotification } = require('../../utils/notifications-functions');
const { createApplication, updateApplication } = require('../../utils/notifications-list');
const { mapRegexQueryFromObj } = require('../../utils/helper-functions');

// /personal/application/get-applications
router.post('/get-applications', passport.authenticate('jwt', {
    session: false
}), getApplications);

//  /personal/application/request-upgrade/:_id`)
router.post('/request-upgrade/:_id', passport.authenticate('jwt', {
    session: false
}), async (req, res, next) => {
    const token = getToken(req.headers);
    if (token) {
        const vipRequest = await Application.findByIdAndUpdate(req.params._id, {
            upgradeStatus: `Requested ${dayjs().format('DD/MM/YYYY')}`,
            'availableUpgrade.valid': false,
            $inc: { requestCount: 1 } 
        }, { new: true }).select('availableUpgrade.status accountId belongsTo');
        
        if (vipRequest.belongsTo) {
            let _id = (await ActiveUser.findById(vipRequest.belongsTo).select('belongsTo').lean()).belongsTo; // get the _id of the user that activeuser belongsTo
            createUserNotification(updateApplication(vipRequest, _id));
        }
        req.vipRequest = vipRequest;
        next();
    } else return res.status(403).send({ msg: 'Unauthorised' });
}, getApplications);

// /personal/application/create-new-application
router.post('/create-new-application', passport.authenticate('jwt', {
    session: false
}), async (req, res, next) => {
    const token = getToken(req.headers);
    if (token) {
        const { accountId, email, currency, activeUser, brand } = req.body; 
        let existsOne = await Application.countDocuments({ accountId }).select('accountId').lean() // check if application exists     
        let existsTwo = await AffApplication.countDocuments({ accountId }).select('accountId').lean() // check if affapplication exists     
        if (existsOne > 0 || existsTwo > 0) return res.status(400).send({ msg: `Application already exists for ${accountId}` });
        const newApp = await Application.create({
            brand,
            accountId,
            email, 
            currency,
            belongsTo: activeUser
        });
        if (newApp.belongsTo) {
            let _id = (await ActiveUser.findById(newApp.belongsTo).select('belongsTo').lean()).belongsTo; // get the _id of the user that activeuser belongsTo
            createUserNotification(createApplication(newApp, _id));
        }; 
        req.newApp = newApp;        
        next();
    } else return res.status(403).send({ msg: 'Unauthorised' });
}, getApplications);


// returns applications
async function getApplications (req, res) {
    const token = getToken(req.headers);
    if (token) {
        const vipRequest = req.vipRequest ? req.vipRequest : null;
        const newApp = req.newApp ? req.newApp : null;
        const msg = 
            req.vipRequest 
            ? `Requested ${req.vipRequest.availableUpgrade.status} for ${req.vipRequest.accountId}` 
            : req.newApp 
            ? `Requested ${req.newApp.availableUpgrade.status} for ${req.newApp.accountId}` 
            : '';
        try {
            const applications = await Application.find({ belongsTo: req.body.activeUser, status: 'Approved' }).sort({ dateAdded: 'desc' }).lean();
            return res.status(200).send({ applications, vipRequest, newApp, msg });
        } catch (error) {
            return res.status(500).send({ msg: 'Server error: Please contact support' })
        }
    } else return res.status(403).send({ msg: 'Unauthorised' });
};

// POST /personal/application/fetch-applications
router.post('/fetch-applications', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        let pageSize = parseInt(req.query.pageSize);
        let pageIndex = parseInt(req.query.pageIndex);
        let { sort, query } = req.body;
        let skippage = pageSize * (pageIndex); // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table
        query = mapRegexQueryFromObj(query); 
        try {
            const applications = await Application.find(query).collation({ locale: 'en', strength: 2 }).sort(sort).skip(skippage).limit(pageSize)
            const pageCount = await Application.countDocuments(query);
            const brands = await Application.distinct('brand');
            const statuses = await Application.distinct('status');       
            return res.status(200).send({ applications, pageCount, brands, statuses  }); 
        } catch (err) {
            return res.status(400).send(err)
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' });
});


module.exports = router;
