
const passport = require('passport');
require('../../auth/passport')(passport)
const express = require('express');
const router = express.Router();

const { getToken } = require('../../utils/token.utils')
const {
    AffApplication,
    AffPartner,
    AffUpgrade
} = require('../../models/affiliate/index');
const { Application } = require('../../models/personal/index')
const { mapRegexQueryFromObj } = require('../../utils/helper-functions');
const dayjs = require('dayjs');
const { createAffNotification } = require('../../utils/notifications-functions');
const { sendEmail } = require('../../utils/sib-helpers');
const { Quarter } = require('../../models/common');


// POST /affiliate/application/create
router.post('/create', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        try {
            const applications = await AffApplication.create(req.body.applications); // https://mongoosejs.com/docs/api.html#model_Model.create
            await applications.map(a =>  createAffNotification({ message: `Submitted application for ${a.brand} account ${a.accountId}`, type: 'Application', belongsTo: a.belongsTo }));            
            if (applications.length > 1) { // if greater than 1 then it is a bulk submit
                const partner = await AffPartner.findById(applications[0].belongsTo).select('email');
                await sendEmail({
                    templateId: 67, 
                    smtpParams: {
                        COUNT: applications.length,
                    }, 
                    tags: ['Application'], 
                    email: partner.email
                })
            } 
            return res.status(201).send(applications)
        } catch (err) {;
            return res.status(400).send({ success: false })
        }
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
});

// GET /affiliate/application/request-upgrade/:_id`
router.get('/request-upgrade/:_id', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        const vipRequest = await AffApplication.findByIdAndUpdate(req.params._id, {
            upgradeStatus: `Requested ${dayjs().format('DD/MM/YYYY')}`,
            'availableUpgrade.valid': false,
            $inc: { requestCount: 1 } 
        }, { new: true }).select('availableUpgrade.status accountId belongsTo').lean()
        return res.status(200).send(vipRequest);
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// GET /affiliate/application/check/:accountId
router.get('/check/:accountId', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const { accountId } = req.params;
    const token = getToken(req.headers);
    if (token) {
        const existsOne = await Application.countDocuments({ accountId }).select('accountId').lean();
        const existsTwo = await AffApplication.countDocuments({ accountId }).select('accountId').lean();       
        if (existsOne === 0 && existsTwo === 0) return res.send({ success: true })
        else return res.send({ success: false })
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
});

// POST /affiliate/application/fetch-applications?pageSize=${pageSize}&pageIndex=${pageIndex}
router.post('/fetch-applications', passport.authenticate('jwt', {
    session: false
}), getApplications);

// returns applications
async function getApplications (req, res) {
    const token = getToken(req.headers);
    if (token) {
        let pageSize = parseInt(req.query.pageSize);
        let pageIndex = parseInt(req.query.pageIndex);
        let { sort, query } = req.body;
        let skippage = pageSize * (pageIndex); // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table
        query = mapRegexQueryFromObj(query);  
        try {
            const applications = await AffApplication.find(query).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize).lean();
            const pageCount = await AffApplication.countDocuments(query);
            const brands = await AffApplication.distinct('brand');
            const statuses = await AffApplication.distinct('status');       
            return res.status(200).send({ applications, pageCount, brands, statuses  }); 
        } catch (err) {
            return res.status(400).send(err)
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' });
};

// POST /affiliate/application/request-extra-upgrade` { accountId, quarter, level }
router.post('/request-extra-upgrade', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        const { accountId, quarter, level } = req.body;
        await AffApplication.findOneAndUpdate({ accountId }, {
            upgradeStatus: `Requested ${dayjs().format('DD/MM/YYYY')}`,
            'availableUpgrade.valid': false,
            requestCount: 1
        }, { new: true }).select('availableUpgrade.status availableUpgrade.valid requestCount accountId belongsTo').lean()
        await AffUpgrade.deleteOne({ accountId, quarter, level })
        return res.status(200).send({ msg: `We have received your ${level} VIP request for ${accountId}` });
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

module.exports = router;
