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
const { createAdminJob } = require('../../utils/admin-job-functions');
const { updatePersonalBalance } = require('../../utils/balance-helpers');
const { sendEmail } = require('../../utils/sib-helpers');

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
        let activeUser = await ActiveUser.findById(belongsTo).select('belongsTo').populate({ path: 'belongsTo', select: 'email' }) // get the _id and email of the user that activeuser belongsTo;
        createUserNotification({ 
            message: `You have requested ${currency === 'USD' ? '$': '€'}${amount.toFixed(2)} to be sent to ${brand} account ${paymentAccount}`, 
            type: 'Payment', 
            belongsTo: activeUser.belongsTo._id 
        });
        // createAdminJob({
        //     message: `Activeuser payout request: ${currency === 'USD' ? '$': '€'}${amount.toFixed(2)} with method ${brand}`,
        //     status: 'Pending',
        //     type: 'Payouts',
        //     activeUser: belongsTo
        // });
        sendEmail({ // send email ( doesn't matter if belongsTo or not because it is just submitting );
            templateId: 23, 
            smtpParams: {
                AMOUNT: amount.toFixed(2),
                CURRENCY: currency,
                SYMBOL: currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '$',
                BRAND: brand,
                ACCOUNT: paymentAccount
            }, 
            tags: ['Payment'], 
            email: activeUser.belongsTo.email
        });
        req.newPayment = newPayment; // creates new payment and then adds it to req object before calling return next()
        next();
    } else return res.status(403).send({ msg: 'Unauthorised' })
}

function updateBalances (req, res) { // After next() is called on createPayment() it comes next to updateBalances()
    return updatePersonalBalance({ _id: req.params._id })
    .then(() => res.status(201).send({ newPayment: req.newPayment, msg: `You have requested ${req.body.currency} ${req.body.amount.toFixed(2)} ` }))
    .catch((err) => {
        return res.status(500).send({ msg: 'Server error: Please contact support' })
    });
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
