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
const { createUserNotification } = require('../../utils/notifications-functions');
const { createApplication, updateApplication } = require('../../utils/notifications-list');
const AffApplication = require('../../models/affiliate/AffApplication');

// /personal/application/get-applications
router.get('/get-applications', passport.authenticate('jwt', {
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
function getApplications (req, res) {
    const token = getToken(req.headers);
    if (token) {
        const vipRequest = req.vipRequest ? req.vipRequest : null;
        const newApp = req.newApp ? req.newApp : null;
        const msg = 
            req.vipRequest 
            ? `${req.vipRequest.availableUpgrade.status} for ${req.vipRequest.accountId}` 
            : req.newApp 
            ? `${req.newApp.availableUpgrade.status} for ${req.newApp.accountId}` 
            : '';
        Application.find({  }) // need to include belongsTo
        .then(applications => res.status(200).send({ applications, vipRequest, newApp, msg }))
        .catch(() => res.status(500).send({ msg: 'Server error: Please contact support' }))
    } else return res.status(403).send({ msg: 'Unauthorised' });
};

module.exports = router;
