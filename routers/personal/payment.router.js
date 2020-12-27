const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../../auth/passport')(passport);
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { getToken } = require('../../utils/token.utils')
const {
    ActiveUser,
    Payment,
    Report,
    SubReport
} = require('../../models/personal');
const { createUserNotification } = require('../../utils/notifications-functions');
const { mapRegexQueryFromObj } = require('../../utils/helper-functions');

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
            brand: req.body.brand,
            paymentAccount: req.body.paymentAccount,
            belongsTo: req.params._id
        });
        const { currency, amount, brand, paymentAccount, belongsTo } = newPayment;
        let _id = (await ActiveUser.findById(belongsTo).select('belongsTo').lean()).belongsTo; // get the _id of the user that activeuser belongsTo
        createUserNotification({ 
            message: `You have requested ${currency === 'USD' ? '$': '€'}${amount.toFixed(2)} to be sent to ${brand} account ${paymentAccount}`, 
            type: 'Payment', 
            belongsTo: _id 
        })
        // send email
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
        ]),
        SubReport.aggregate([
            { $match: { $and: [ { belongsTo: mongoose.Types.ObjectId(req.params._id) }, { 'currency': req.body.currency } ] } },
            { $project: { 'rafCommission': 1 } }, // selected values to return 1 = true, 0 = false
            { $group: { // https://docs.mongodb.com/manual/reference/operator/aggregation/group/
                '_id': null,
                rafCommission: { $sum: '$rafCommission' }
            }},
        ])
    ])
    .then(([ payments, reports, subreports ]) => {
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
        const rafCommission = isValid(subreports, 'rafCommission');
        const balance = (cashback + rafCommission) - (requested + paid);

        ActiveUser.findByIdAndUpdate(req.params._id, {
            $set: { 
                'stats.balance.$[el].amount': balance,
                'stats.commission.$[el].amount': commission, 
                'stats.cashback.$[el].amount': cashback,
                'stats.payments.$[el].amount': paid, 
                'stats.requested.$[el].amount': requested, 
                'stats.raf.$[el].amount': rafCommission
            }}, {
                arrayFilters: [{ 'el.currency': req.body.currency }],
                new: true
        })
        .then(() => res.status(201).send({ newPayment: req.newPayment, msg: `You have requested ${req.body.currency} ${req.body.amount.toFixed(2)} ` }))
        .catch((err) => {
            console.log(err);
            return res.status(500).send({ msg: 'Server error: Please contact support' })
        })
    })
};

// POST /personal/payment/fetch-payments
router.post('/fetch-payments', passport.authenticate('jwt', {
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
            const payments = await Payment.find(query).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize)
            const pageCount = await Payment.countDocuments(query);
            const brands = await Payment.distinct('brand'); 
            const statuses = await Payment.distinct('status');   
            const currencies = await Payment.distinct('currency')
           
            return res.status(200).send({ payments, pageCount, brands, statuses, currencies }); 
        } catch (err) {
            return res.status(400).send(err)
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' })
});


// useful links 
// https://stackoverflow.com/questions/18875292/passing-variables-to-the-next-middleware-using-next-in-express-js










module.exports = router;
