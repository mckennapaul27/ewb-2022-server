const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../../auth/passport')(passport);
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { getToken } = require('../../utils/token.utils')
const {
    AffPartner,
    AffReport,
    AffPayment,
    AffSubReport
} = require('../../models/affiliate');
const { mapRegexQueryFromObj } = require('../../utils/helper-functions');
const { createAffNotification } = require('../../utils/notifications-functions');

// /affiliate/payment/create-payment/:_id
router.post('/create-payment/:_id', passport.authenticate('jwt', {
    session: false
}), createPayment, updateBalances); // returns activeUser

async function createPayment (req, res, next) {
    const token = getToken(req.headers);    
    if (token) {        
        const newPayment = await AffPayment.create({
            amount: req.body.amount,
            transactionId: uuidv4(),
            currency: req.body.currency,            
            brand: req.body.brand,
            paymentAccount: req.body.paymentAccount,
            belongsTo: req.params._id
        });
        const { currency, amount, brand, paymentAccount, belongsTo } = newPayment;
        createAffNotification({ message: `You have requested ${currency === 'USD' ? '$': '€'}${amount.toFixed(2)} to be sent to ${brand} account ${paymentAccount}`, type: 'Payment', belongsTo });
        // >>>>>>>> send email
        req.newPayment = newPayment; // creates new payment and then adds it to req object before calling return next()
        next();
    } else return res.status(403).send({ msg: 'Unauthorised' })
};

function updateBalances (req, res) { // After next() is called on createPayment() it comes next to updateBalances()
    return Promise.all([
        AffPayment.aggregate([
            { $match: { $and: [ { belongsTo: mongoose.Types.ObjectId(req.params._id) }, { currency: req.body.currency } ] } }, // matching belongsTo 'partner'
            { $project: { status: 1, amount: 1, currency: 1 } }, // selected values to return 1 = true, 0 = false
            { $group: { 
                '_id': '$status', 
                amount: { $sum: '$amount' }
            }}, // using '_id': '$status' in group to group by status Requested : Paid
        ]),
        AffReport.aggregate([
            { $match: { $and: [ { belongsToPartner: mongoose.Types.ObjectId(req.params._id) }, { 'account.currency': req.body.currency } ] } }, // need to choose currency to update that balance
            { $project: { 'account.cashback': 1, 'account.commission': 1 } }, // selected values to return 1 = true, 0 = false
            { $group: { 
                '_id': null, 
                cashback: { $sum: '$account.cashback' },
                commission: { $sum: '$account.commission' }
            }}, 
        ]),
        AffSubReport.aggregate([
            { $match: { $and: [ { belongsTo: mongoose.Types.ObjectId(req.params._id) }, { 'currency': req.body.currency } ] } },
            { $project: { 'subAffCommission': 1 } }, // selected values to return 1 = true, 0 = false
            { $group: { 
                '_id': null, 
                subAffCommission: { $sum: '$subAffCommission' },
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
        const subCommission = isValid(subreports, 'subAffCommission');
        const balance = (cashback + subCommission) - (requested + paid);

        AffPartner.findByIdAndUpdate(req.params._id, {
            $set: { 
                'stats.balance.$[el].amount': balance,
                'stats.commission.$[el].amount': commission, 
                'stats.cashback.$[el].amount': cashback,
                'stats.payments.$[el].amount': paid, 
                'stats.requested.$[el].amount': requested, 
                'stats.subCommission.$[el].amount': subCommission
            }}, {
                arrayFilters: [{ 'el.currency': req.body.currency }],
                new: true
        })
        .then(() => res.status(201).send({ newPayment: req.newPayment, msg: `You have requested ${req.body.currency} ${req.body.amount.toFixed(2)} ` }))
        .catch(() => res.status(500).send({ msg: 'Server error: Please contact support' }))
    })
};

// POST /affiliate/payment/fetch-payments
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
            const payments = await AffPayment.find(query).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize)
            const pageCount = await AffPayment.countDocuments(query);
            const brands = await AffPayment.distinct('brand'); 
            const statuses = await AffPayment.distinct('status');   
            const currencies = await AffPayment.distinct('currency')
           
            return res.status(200).send({ payments, pageCount, brands, statuses, currencies }); 
        } catch (err) {
            return res.status(400).send(err)
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' })
});







// useful links 
// https://stackoverflow.com/questions/18875292/passing-variables-to-the-next-middleware-using-next-in-express-js

module.exports = router;
