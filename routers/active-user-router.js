const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../auth/passport')(passport);
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { getToken } = require('../utils/token.utils')
const {
    User,
    Notification,
} = require('../models/common/index');
const {
    ActiveUser,
    Payment,
    Report
} = require('../models/personal');
const { compareSync } = require('bcrypt');


// /active-user/get-active-user/:_id
router.get('/get-active-user/:_id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        ActiveUser.findById(req.params._id).select('stats paymentDetails').lean()
        .then(activeUser => res.status(200).send(activeUser))
        .catch(() => res.status(500).send({ msg: 'Server error: Please contact support' }))
    } else return res.status(403).send({ msg: 'Unauthorised' })
});

// /active-user/update-payment-details/:_id
router.post('/update-payment-details/:_id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        ActiveUser.findByIdAndUpdate(req.params._id, {
            paymentDetails: req.body.paymentDetails
        }, { new: true }).select('paymentDetails').lean()
        .then(activeUser => res.status(201).send({ activeUser, msg: 'You have successfully updated your payment details.' }))
        .catch(() => res.status(500).send({ msg: 'Server error: Please contact support' }))
    } else return res.status(403).send({ msg: 'Unauthorised' })
});

// /active-user/fetch-deal-data/:_id

router.post('/fetch-deal-data/:_id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const token = getToken(req.headers);
    if (token) {

        Promise.all([
            ActiveUser.findById(req.params._id).select('dealTier _id').lean(),
            Report.aggregate([ // including month and brand in query
                // { $match: { $and: [ { belongsToActiveUser: mongoose.Types.ObjectId(req.params._id) }, { month: req.body.brand }, { brand: req.body.brand } ] } }, 
                { $project: { 'account.transValue': 1 } }, // selected values to return 1 = true, 0 = false
                { $group: { 
                    '_id': null, 
                    transValue: { $sum: '$account.transValue' }
                }}
            ]),
            // Also need volume of referrals
        ])
        .then(([ activeUser, reports ])=> {

            const isValid = (arr, value) => arr.length > 0 ? arr[0][value] : 0; // used when _id = null | arr is the aggregate result | value is either cashback or commission
            
            const transValue = isValid(reports, 'transValue');
            const dealTier = activeUser.dealTier[req.body.brand];            
           
            let achievedRate = dealTier.reduce((acc, d) => (transValue >= d.minVol && transValue <= d.maxVol) ? acc += d.cashback : acc, 0);
            let percentage = (dealTier.map(t => t.cashback).indexOf(achievedRate) + 1) / dealTier.length;
          
            achievedRate = achievedRate * 100;
            percentage = percentage * 100;

            return res.status(200).send({ dealTier, achievedRate, percentage });
        })
        .catch(() => res.status(500).send({ msg: 'Server error: Please contact support' }))
    } else return res.status(403).send({ msg: 'Unauthorised' })
})










module.exports = router;
