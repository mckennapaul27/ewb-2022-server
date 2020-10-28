const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../../auth/passport')(passport);
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { getToken } = require('../../utils/token.utils')
const {
    User,
    Notification,
} = require('../../models/common/index');
const {
    ActiveUser,
    Payment,
    Report
} = require('../../models/personal');
const { request } = require('chai');

// /personal/payment/create-payment/:_id
router.post('/create-payment/:_id', passport.authenticate('jwt', {
    session: false
}), createPayment, updateBalances); // returns activeUser

async function createPayment (req, res, next) {
    const token = getToken(req.headers);    
    if (token) {        
        const newPayment = await Payment.create({
            amount: req.body.amount,
            transactionId: uuidv4(),
            currency: req.body.currency,
            belongsTo: req.params._id
        });
        req.newPayment = newPayment; // creates new payment and then adds it to req object before calling return next()
        next();
    } else return res.status(403).send({ msg: 'Unauthorised' })
}

function updateBalances (req, res) { // After next() is called on createPayment() it comes next to updateBalances()
    return Promise.all([
        Payment.aggregate([
            { $match: { $and: [ { belongsTo: mongoose.Types.ObjectId(req.params._id) }, { currency: req.body.currency } ] } }, // matching belongsTo 'activeuser'
            { $project: { status: 1, amount: 1, currency: 1 } }, // selected values to return 1 = true, 0 = false
            { $group: { '_id': '$status', amount: { $sum: '$amount' }}}, // using '_id': '$status' in group to group by status Requested : pENDING
        ]),
        Report.aggregate([
            { $match: { $and: [ { belongsToActiveUser: mongoose.Types.ObjectId(req.params._id) }, { 'account.currency': req.body.currency } ] } }, // need to choose currency to update that balance
            { $project: { 'account.cashback': 1, 'account.commission': 1 } }, // selected values to return 1 = true, 0 = false
            { $group: { 
                '_id': null, 
                cashback: { $sum: '$account.cashback' },
                commission: { $sum: '$account.commission' }
            }}, 
        ])
    ])
    .then(([ payments, reports ]) => {
        
        const isValidCalculate = (arr, query, value) => 
            arr.length > 0 
            ? arr.find(a => a._id === query) 
                ? arr.find(a => a._id === query)[value] 
                    : 0
            : 0; // used when grouping by field such as { $group: { '_id': '$status' } } | query is used because the way we have grouped according the status so it will return array of objects with each object having the sum of the commission according to the status

        const isValid = (arr, value) => arr.length > 0 ? arr[0][value] : 0; // used when _id = null | arr is the aggregate result | value is either cashback or commission

        const requested = isValidCalculate(payments, 'Requested', 'amount');
        const paid = isValidCalculate(payments, 'Paid', 'amount');
        const commission = isValid(reports, 'commission');
        const cashback = isValid(reports, 'cashback');
        const balance = cashback - (requested + paid);

        ActiveUser.findByIdAndUpdate(req.params._id, {
            $set: { 
                'stats.balance.$[el].amount': balance,
                'stats.commission.$[el].amount': commission, 
                'stats.cashback.$[el].amount': cashback,
                'stats.payments.$[el].amount': paid, 
                'stats.requested.$[el].amount': requested, 
            }}, {
                arrayFilters: [{ 'el.currency': req.body.currency }],
                new: true
        })
        .then(() => res.status(201).send({ newPayment: req.newPayment, msg: `You have requested ${req.body.currency} ${req.body.amount} ` }))
        .catch(() => res.status(500).send({ msg: 'Server error: Please contact support' }))
    })
}

// useful links 
// https://stackoverflow.com/questions/18875292/passing-variables-to-the-next-middleware-using-next-in-express-js










module.exports = router;
