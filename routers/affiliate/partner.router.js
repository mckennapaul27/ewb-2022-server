
const passport = require('passport');
require('../../auth/passport')(passport)
const express = require('express');
const router = express.Router();

const { getToken } = require('../../utils/token.utils')
const {
    AffApplication,
    AffAccount,
    AffPartner,
    AffNotification
} = require('../../models/affiliate/index');
const { mapRegexQueryFromObj } = require('../../utils/helper-functions');


// POST /affiliate/partner/fetch-details/:_id
router.post('/fetch-details/:_id', passport.authenticate('jwt', { // with this function we can return any fields we need by sending req.body.select
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        try {
            const partner = await AffPartner.findById(req.params._id).select(req.body.select).lean();
            return res.status(200).send(partner);
        } catch (err) {
            return res.status(400).send({ success: false })
        }
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
});


// POST /affiliate/partner/update-partner/:_id
router.post('/update-partner/:_id', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        const update = req.body; // doing it this way so we can submit anything to it to update and therefore provide less routes
        try {
            const partner = await AffPartner.findByIdAndUpdate(req.params._id, update, { new: true, select: req.body.select });
            return res.status(200).send(partner);
        } catch (err) {
            return res.status(400).send({ success: false });
        }
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
});

// POST /affiliate/partner/fetch-notifications?pageSize=${pageSize}&pageIndex=${pageIndex}
router.post('/fetch-notifications', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        let pageSize = parseInt(req.query.pageSize);
        let pageIndex = parseInt(req.query.pageIndex);
        let { sort, query } = req.body;
        let skippage = pageSize * (pageIndex); // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table
        let orQuery = { isGeneral: true };
        query = mapRegexQueryFromObj(query);  
        if (query.type) orQuery['type'] = query.type; // we need orQuery to look for general notifications. We also only add 'type' to the orQuery if it exists in query
        try {
            const notifications = await AffNotification.find({ $or: [ query, orQuery ] }).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize).lean();
            const pageCount = await AffNotification.countDocuments(query);
            const types = await AffNotification.distinct('type');
            return res.status(200).send({ notifications, pageCount, types }); 
        } catch (err) {
            return res.status(400).send(err)
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' });
});






module.exports = router;
