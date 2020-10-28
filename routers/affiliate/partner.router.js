
const passport = require('passport');
require('../../auth/passport')(passport)
const express = require('express');
const router = express.Router();

const { getToken } = require('../../utils/token.utils')
const {
    AffApplication,
    AffAccount,
    AffPartner
} = require('../../models/affiliate/index');
const dayjs = require('dayjs')


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
            const partner = await AffPartner.findByIdAndUpdate(req.params._id, update, { new: true }).select(req.body.select).lean();
            return res.status(200).send(partner);
        } catch (err) {
            return res.status(400).send({ success: false })
        }
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
})


module.exports = router;
