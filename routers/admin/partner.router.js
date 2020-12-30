
const passport = require('passport');
require('../../auth/admin-passport')(passport);

const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

let dayjs = require('dayjs');
let advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);

const { getToken } = require('../../utils/token.utils');

const {
    AffPartner,
    AffReport,
    AffApplication,
    AffPayment,
    AffReportMonthly,
    AffSubReport
} = require('../../models/affiliate/index');

const { mapRegexQueryFromObj, isPopulatedValue, mapQueryForAggregate, mapQueryForPopulate } = require('../../utils/helper-functions');
const { createAffNotification } = require('../../utils/notifications-functions');
const { applicationYY, applicationYN, applicationNN } = require('../../utils/notifications-list');
const { createAffAccAffReport } = require('../../utils/account-functions');


// POST /admin/partner/get-partner
router.post('/get-partner', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        try {
            const partner = await AffPartner.findById(req.body._id).select(req.body.select).lean()
            return res.status(200).send(partner);
        } catch (err) {
            return res.status(400).send({ msg: 'Server error' })
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// POST /admin/partner/update-partner/:_id
router.post('/update-partner/:_id', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    const update = req.body;
    if (token) {
        try {
            const partner = await AffPartner.findByIdAndUpdate(req.params._id, update, { new: true });
            return res.status(200).send(partner);
        } catch (err) {
            return res.status(400).send({ msg: 'Server error' })
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// POST /admin/partner/fetch-reports
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
        let populateQuery = mapQueryForPopulate(query); // not needed anymore because we added epi and referredByEpi to reports
        let aggregateQuery = mapQueryForAggregate(query); // have to create this for aggregation query because need to make it mongoose.Types.ObjectId   
        
        try {
            const reports = await AffReport.find(searchQuery).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize).populate({ path: 'belongsToPartner', select: '_id' })
            const pageCount = await AffReport.countDocuments(searchQuery);
            const brands = await AffReport.distinct('brand'); 
            const months = await AffReport.distinct('month');   
            const currencies = await AffReport.distinct('account.currency');
            const totals = await AffReport.aggregate([ 
                { $match: { $and: [ aggregateQuery ] } }, 
                { $group: { 
                        '_id': null, 
                        commission: { $sum: '$account.commission' }, 
                        cashback: { $sum: '$account.cashback' }, 
                        volume: { $sum: '$account.transValue' },
                        deposits: { $sum: '$account.deposits' },
                        subAffCommission: { $sum: '$account.subAffCommission' }, 
                        profit: { $sum: '$account.profit' } 
                    } 
                }
            ]);  
            const allTotals = await AffReport.aggregate([ // all time totals = excludes the $match pipe
                { $group: { 
                        '_id': null, 
                        allCommission: { $sum: '$account.commission' }, 
                        allCashback: { $sum: '$account.cashback' }, 
                        allVolume: { $sum: '$account.transValue' },
                        allDeposits: { $sum: '$account.deposits' },
                        allSubAffCommission: { $sum: '$account.subAffCommission' }, 
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

// POST /admin/partner/fetch-applications
router.post('/fetch-applications', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        let pageSize = parseInt(req.query.pageSize);
        let pageIndex = parseInt(req.query.pageIndex);
        let { sort, query } = req.body;
        let skippage = pageSize * (pageIndex); // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table

        let searchQuery = mapRegexQueryFromObj(query);  
        let populateQuery = mapQueryForPopulate(query);
        
        let applications;

        try {
            if (isPopulatedValue(query)) { // use this way to query for a populated field - in this case, belongsTo.epi
                applications = (await AffApplication.find(searchQuery).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize).populate({ path: 'belongsTo', match: populateQuery })).filter(a => a.belongsTo);  // this works because we are only populating partner where the epi matches the query epi so it firstly returns all the users and then filters out all where the belongsTo is null. the belongsTo field will be null if it does not match the query
            } else {
                applications = await AffApplication.find(searchQuery).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize).populate({ path: 'belongsTo', select: 'epi' }).lean();
            };
            const pageCount = await AffApplication.countDocuments(searchQuery);
            const brands = await AffApplication.distinct('brand');
            const statuses = await AffApplication.distinct('status');      
            return res.status(200).send({ applications, pageCount, brands, statuses  }); 
        } catch (err) {
            return res.status(400).send(err)
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// POST /admin/partner/update-application/:_id`, { accountId, action });
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
    
            const aa = await AffApplication.findByIdAndUpdate(req.params._id, update, { new: true }); // find and update application and return new application
    
            const { brand, belongsTo, accountId } = aa; // deconstruct updated application
    
            // notifications
            if (action === 'YY') createAffNotification(applicationYY({ brand, accountId, belongsTo }));
            if (action === 'YN') createAffNotification(applicationYN({ brand, accountId, belongsTo }));
            if (action === 'NN') createAffNotification(applicationNN({ brand, accountId, belongsTo }));

            // send emails >>>>>>>>>> 

            if (action === 'YY' || action === 'YN') await createAffAccAffReport ({ accountId, brand, belongsTo }); // create affaccount and affreport if not already created (Only if YY or YN)


            return res.status(201).send(aa);
        } catch (error) {
            console.log(error);
            return res.status(400).send({ msg: 'Error whilst updating application' })
        }
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// POST /admin/partner/fetch-payments
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
        let populateQuery = mapQueryForPopulate(query);

        let payments;

        try {
            if (isPopulatedValue(query)) { // use this way to query for a populated field - in this case, belongsTo.epi
                payments = (await AffPayment.find(searchQuery).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize).populate({ path: 'belongsTo', match: populateQuery })).filter(a => a.belongsTo);  // this works because we are only populating partner where the epi matches the query epi so it firstly returns all the users and then filters out all where the belongsTo is null. the belongsTo field will be null if it does not match the query
            } else {
                payments = await AffPayment.find(searchQuery).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize).populate({ path: 'belongsTo', select: 'epi' })
            };
            const pageCount = await AffPayment.countDocuments(searchQuery);
            const brands = await AffPayment.distinct('brand'); 
            const statuses = await AffPayment.distinct('status');   
            const currencies = await AffPayment.distinct('currency');           
            return res.status(200).send({ payments, pageCount, brands, statuses, currencies }); 
        } catch (err) {
            return res.status(400).send(err)
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' })
});

// POST /admin/partner/fetch-monthly-reports
router.post('/fetch-monthly-reports', passport.authenticate('admin', {
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
            const reports = await AffReportMonthly.find(searchQuery).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize).populate({ path: 'belongsTo', select: '_id' })
            const pageCount = await AffReportMonthly.countDocuments(searchQuery);
            const brands = await AffReportMonthly.distinct('brand'); 
            const months = await AffReportMonthly.distinct('month');   
            const currencies = await AffReportMonthly.distinct('currency');
            const totals = await AffReportMonthly.aggregate([ 
                { $match: { $and: [ aggregateQuery ] } }, 
                { $group: { 
                        '_id': null, 
                        commission: { $sum: '$commission' }, 
                        cashback: { $sum: '$cashback' }, 
                        volume: { $sum: '$transValue' },
                        subAffCommission: { $sum: '$subAffCommission' }, 
                        profit: { $sum: '$profit' },
                        deposits: { $sum: '$account.deposits' }, 
                    } 
                }
            ]);  
            const allTotals = await AffReportMonthly.aggregate([ // all time totals = excludes the $match pipe
                { $group: { 
                        '_id': null, 
                        allCommission: { $sum: '$commission' }, 
                        allCashback: { $sum: '$cashback' }, 
                        allVolume: { $sum: '$transValue' },
                        allSubAffCommission: { $sum: '$subAffCommission' }, 
                        allProfit: { $sum: '$profit' },
                        allDeposits: { $sum: '$account.deposits' },
                    } 
                }
            ]);  
            return res.status(200).send({ reports, pageCount, brands, months, currencies, totals, allTotals  }); 
        } catch (err) {
            return res.status(400).send(err)
        }    
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
});

// POST /admin/partner/update-payment/:_id`, { status });
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
            const updatedPayment = await AffPayment.findByIdAndUpdate(req.params._id, update, { new: true });
            const { currency, amount, belongsTo } = updatedPayment;
            // send email >>>>>>>>>>>>>
            createAffNotification({ message: `Your payout request for ${currency === 'USD' ? '$': '€'}${amount.toFixed(2)} has been ${status.toLowerCase()}`, type: 'Payment', belongsTo })
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
        AffPayment.aggregate([
            { $match: { $and: [ { belongsTo: mongoose.Types.ObjectId(req.params._id) }, { currency: req.body.currency } ] } }, // matching belongsTo 'partner'
            { $project: { status: 1, amount: 1, currency: 1 } }, // selected values to return 1 = true, 0 = false // this is just short format to select which values to return so is essentially the same as using .select()
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
        .then(() => res.status(201).send({ msg: `You have paid  ${req.body.currency} ${req.body.amount} ` }))
        .catch(() => res.status(500).send({ msg: 'Server error: Please contact support' }))
    })
};








module.exports = router;
