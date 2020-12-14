
const passport = require('passport');
require('../../auth/admin-passport')(passport);

const express = require('express');
const router = express.Router();

const { getToken } = require('../../utils/token.utils');
const { fetchAccountReport } = require('../../queries/paysafe-account-report');
const { fetchPlayerRegistrationsReport } = require('../../queries/paysafe-player-registrations-report');
const { fetchACIDReport } = require('../../queries/paysafe-acid-report');

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







module.exports = router;
