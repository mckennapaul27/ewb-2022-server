
const passport = require('passport');
require('../../auth/admin-passport')(passport);

const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

let dayjs = require('dayjs');
let advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);

const { getToken } = require('../../utils/token.utils');

const {
    Application,
    ActiveUser,
    Account,
    Report,
    Payment,
    SubReport
} = require('../../models/personal/index');

const { mapRegexQueryFromObj, mapQueryForAggregate } = require('../../utils/helper-functions');
const { createUserNotification } = require('../../utils/notifications-functions');
const { applicationYY, applicationYN, applicationNN } = require('../../utils/notifications-list');
const { createAccountReport } = require('../../utils/account-functions');

// POST /admin/active-user/get-active-user
router.post('/get-active-user', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        try {
            const partner = await ActiveUser.findById(req.body._id).select(req.body.select).lean()
            return res.status(200).send(partner);
        } catch (err) {
            return res.status(400).send({ msg: 'Server error' })
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// POST /admin/active-user/update-active-user/:_id
router.post('/update-active-user/:_id', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    const update = req.body;
    if (token) {
        try {
            const partner = await ActiveUser.findByIdAndUpdate(req.params._id, update, { new: true });
            return res.status(200).send(partner);
        } catch (err) {
            return res.status(400).send({ msg: 'Server error' })
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// POST /admin/active-user/fetch-reports
router.post('/fetch-reports', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {

        let pageSize = parseInt(req.query.pageSize);
        let pageIndex = parseInt(req.query.pageIndex);
        let { sort, query } = req.body;
        let skippage = pageSize * (pageIndex); // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table
        let searchQuery = mapRegexQueryFromObj(query);  
        let aggregateQuery = mapQueryForAggregate(query); // have to create this for aggregation query because need to make it mongoose.Types.ObjectId
        try {
            const reports = await Report.find(searchQuery).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize)
            const pageCount = await Report.countDocuments(searchQuery);
            const brands = await Report.distinct('brand'); 
            const months = await Report.distinct('month');   
            const currencies = await Report.distinct('account.currency');
            const totals = await Report.aggregate([ 
                { $match: { $and: [ aggregateQuery ] } }, 
                { $group: { 
                        '_id': null, 
                        commission: { $sum: '$account.commission' }, 
                        cashback: { $sum: '$account.cashback' }, 
                        volume: { $sum: '$account.transValue' },
                        deposits: { $sum: '$account.deposits' },
                        rafCashback: { $sum: '$account.rafCashback' }, 
                        profit: { $sum: '$account.profit' } 
                    } 
                }
            ]);  
            const allTotals = await Report.aggregate([ // all time totals = excludes the $match pipe
                { $group: { 
                        '_id': null, 
                        allCommission: { $sum: '$account.commission' }, 
                        allCashback: { $sum: '$account.cashback' }, 
                        allVolume: { $sum: '$account.transValue' },
                        allDeposits: { $sum: '$account.deposits' },
                        allRafCashback: { $sum: '$account.rafCashback' }, 
                        allProfit: { $sum: '$account.profit' } 
                    } 
                }
            ]);  
            return res.status(200).send({ reports, pageCount, brands, months, currencies, totals, allTotals  }); 
        } catch (err) {
            return res.status(400).send(err)
        }    
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
});

// POST /admin/active-user/fetch-applications
router.post('/fetch-applications', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        let pageSize = parseInt(req.query.pageSize);
        let pageIndex = parseInt(req.query.pageIndex);
        let { sort, query } = req.body;
        let skippage = pageSize * (pageIndex); // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table
        try {
            const applications = await Application.find(query).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize);
            const pageCount = await Application.countDocuments(query);
            const brands = await Application.distinct('brand');
            const statuses = await Application.distinct('status');      
            return res.status(200).send({ applications, pageCount, brands, statuses  }); 
        } catch (err) {
            return res.status(400).send(err)
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// POST /admin/active-user/update-application/:_id`, { accountId, action });
router.post('/update-application/:_id', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        try {
            const { action } = req.body;
            const today = dayjs().format('DD/MM/YYYY');
            const update = {
                'status': (action === 'YY' || action === 'YN') ? 'Approved' : 'Declined',
                'upgradeStatus': (action === 'YY') ? `Upgraded ${today}` : (action === 'YN') ? `Not verified ${today}` : `Declined ${today}`,
                'availableUpgrade.valid': (action === 'YY' || action === 'NN') ? false : true 
            };
            if (action === 'YY' || action === 'NN') update['availableUpgrade.status'] = '-';        
    
            const aa = await Application.findByIdAndUpdate(req.params._id, update, { new: true }); // find and update application and return new application
    
            const { brand, belongsTo, accountId } = aa; // deconstruct updated application

            let _id = (await ActiveUser.findById(belongsTo).select('belongsTo').lean()).belongsTo; // get the _id of the user that activeuser belongsTo
    
            // notifications
            if (action === 'YY') createUserNotification(applicationYY({ brand, accountId, belongsTo: _id }));
            if (action === 'YN') createUserNotification(applicationYN({ brand, accountId, belongsTo: _id }));
            if (action === 'NN') createUserNotification(applicationNN({ brand, accountId, belongsTo: _id }));

            // send emails >>>>>>>>>> 
            if (action === 'YY' || action === 'YN') await createAccountReport({ accountId, brand, belongsTo }); // create affaccount and affreport if not already created (Only if YY or YN)

            return res.status(201).send(aa);
        } catch (error) {
            return res.status(400).send({ msg: 'Error whilst updating application' })
        }
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// POST /admin/active-user/fetch-payments
router.post('/fetch-payments', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);    
    if (token) {        
        let pageSize = parseInt(req.query.pageSize);
        let pageIndex = parseInt(req.query.pageIndex);
        let { sort, query } = req.body;
        let skippage = pageSize * (pageIndex); // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table
        let searchQuery = mapRegexQueryFromObj(query); 
        try {
            const payments = await Payment.find(searchQuery).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize)
            const pageCount = await Payment.countDocuments(searchQuery);
            const brands = await Payment.distinct('brand'); 
            const statuses = await Payment.distinct('status');   
            const currencies = await Payment.distinct('currency');           
            return res.status(200).send({ payments, pageCount, brands, statuses, currencies }); 
        } catch (err) {
            return res.status(400).send(err)
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' })
});

// POST /admin/active-user/update-payment/:_id`, { status });
router.post('/update-payment/:_id', passport.authenticate('admin', {
    session: false
}), async (req, res, next) => {
    const token = getToken(req.headers);
    if (token) {
        const { status } = req.body;
        const update = {
            'status': `${status}`,
            'paidDate': status === 'Paid' ? Date.now() : null
        }
        try {
            const updatedPayment = await Payment.findByIdAndUpdate(req.params._id, update, { new: true });
            const { currency, amount, belongsTo } = updatedPayment;
            let _id = (await ActiveUser.findById(belongsTo).select('belongsTo').lean()).belongsTo; // get the _id of the user that activeuser belongsTo
            createUserNotification({
                message: `Your payout request for ${currency === 'USD' ? '$': '€'}${amount.toFixed(2)} has been ${status.toLowerCase()}`,
                type: 'Payment',
                belongsTo: _id
            });
            // send email >>>>>>>>>>>>>
            req.body = updatedPayment;
            req.params._id = updatedPayment.belongsTo; // changing req.params._id to belongsTo to keep update balance function consistent
            next();
        } catch (err) {
            return res.status(400).send(err)
        }
    } else return res.status(403).send({ msg: 'Unauthorised' });
}, updateBalances);



function updateBalances (req, res) { // After next() is called on /update-payment/:_id it comes next to updateBalances()
    return Promise.all([
        Payment.aggregate([
            { $match: { $and: [ { belongsTo: mongoose.Types.ObjectId(req.params._id) }, { currency: req.body.currency } ] } }, // matching belongsTo 'partner'
            { $project: { status: 1, amount: 1, currency: 1 } }, // selected values to return 1 = true, 0 = false // this is just short format to select which values to return so is essentially the same as using .select()
            { $group: { 
                '_id': '$status', 
                amount: { $sum: '$amount' }
            }}, // using '_id': '$status' in group to group by status Requested : Paid
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
            { $group: { 
                '_id': null, 
                rafCommission: { $sum: '$rafCommission' },
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
        .then(() => res.status(201).send({ msg: `You have paid  ${req.body.currency} ${req.body.amount.toFixed(2)} ` }))
        .catch(() => res.status(500).send({ msg: 'Server error: Please contact support' }))
    })
};








module.exports = router;