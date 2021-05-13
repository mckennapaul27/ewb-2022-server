
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
    Report,
    Payment,
    Upgrade,
} = require('../../models/personal/index');

const crypto = require('crypto');

const { mapRegexQueryFromObj, mapQueryForAggregate, mapQueryForPopulate, isPopulatedValue } = require('../../utils/helper-functions');
const { createUserNotification } = require('../../utils/notifications-functions');
const { applicationYY, applicationYN, applicationNN } = require('../../utils/notifications-list');
const { createAccountReport } = require('../../utils/account-functions');
const { updatePersonalBalance } = require('../../utils/balance-helpers');
const { sendEmail } = require('../../utils/sib-helpers');
const { Brand, Quarter } = require('../../models/common');

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
                // { $match: { belongsToActiveUser: mongoose.Types.ObjectId(query.belongsToActiveUser) } }, 
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
            const { brand, belongsTo, accountId, email, currency } = aa; // deconstruct updated application
            const activeUser = await ActiveUser.findById(belongsTo).select('belongsTo').lean(); // get the _id of the user that activeuser belongsTo
            // notifications ( if it belongs to activeuser )
            if (activeUser && activeUser.belongsTo) {
                if (action === 'YY') {
                    createUserNotification(applicationYY({ brand, accountId, belongsTo: activeUser.belongsTo }));
                    const { initialUpgrade } = await Brand.findOne({ brand }).select('initialUpgrade').lean();
                    await sendEmail({
                        templateId: 65, 
                        smtpParams: {
                            BRAND: brand,
                            ACCOUNTID: accountId,
                            EMAIL: email,
                            CURRENCY: currency,
                            OFFER: initialUpgrade
                        }, 
                        tags: ['Application'], 
                        email: email
                    })
                } else if (action === 'YN') {
                    createUserNotification(applicationYN({ brand, accountId, belongsTo: activeUser.belongsTo }));
                    await sendEmail({
                        templateId: 2, 
                        smtpParams: {
                            BRAND: brand,
                            ACCOUNTID: accountId,
                            EMAIL: email,
                            CURRENCY: currency
                        }, 
                        tags: ['Application'], 
                        email: email
                    })
                } else if (action === 'NN') {
                    createUserNotification(applicationNN({ brand, accountId, belongsTo: activeUser.belongsTo })); // Do not send email as covering NN below                    
                } else null;
            };
            // email if application is "light" application - only sent if YY or YN
            if (!belongsTo && (action === 'YY' || action === 'YN'))  {
                const buffer = await crypto.randomBytes(20);
                const token = buffer.toString('hex');
                await Application.findByIdAndUpdate(req.params._id, { applicationToken: token, applicationExpires: Date.now() + 86400000 }, { new: true })
                await sendEmail({
                    templateId: 4, 
                    smtpParams: {
                        BRAND: brand,
                        ACCOUNTID: accountId,
                        ID: token,
                        EMAIL: email,
                        CURRENCY: currency
                    }, 
                    tags: ['Application'], 
                    email: email
                })
            };
            // if application was rejected
            if (action === 'NN') await sendEmail({
                templateId: 3, 
                smtpParams: {
                    BRAND: brand,
                    ACCOUNTID: accountId,
                    EMAIL: email
                }, 
                tags: ['Application'], 
                email: email
            });

            // if YY or YN call this function which will only create account and report if doesn't already exist
            if ((action === 'YY' || action === 'YN') && belongsTo) await createAccountReport({ accountId, brand, belongsTo }); // create affaccount and affreport if not already created (Only if YY or YN)

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
        let populateQuery = mapQueryForPopulate(query); 
        let payments;
        try {
            if (isPopulatedValue(query)) {
                payments = (await Payment.find(searchQuery).
                collation({ locale: 'en', strength: 1 })
                .sort(sort)
                .skip(skippage)
                .limit(pageSize)
                .populate({ path: 'belongsTo', select: 'belongsTo', populate: { path: 'belongsTo', match: populateQuery } })).filter(a => a.belongsTo.belongsTo)
            } else {
                payments = await Payment.find(searchQuery).
                collation({ locale: 'en', strength: 1 })
                .sort(sort)
                .skip(skippage)
                .limit(pageSize)
                .populate({ path: 'belongsTo', select: 'belongsTo', populate: { path: 'belongsTo', select: 'userId' } })
            }
            const pageCount = await Payment.countDocuments(searchQuery);
            const brands = await Payment.distinct('brand'); 
            const statuses = await Payment.distinct('status');   
            const currencies = await Payment.distinct('currency');           
            return res.status(200).send({ payments, pageCount, brands, statuses, currencies }); 
        } catch (err) {
            console.log(err);
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
            const { currency, amount, belongsTo, brand, paymentAccount } = updatedPayment;
            let activeUser = await ActiveUser.findById(belongsTo).select('belongsTo email') // get the _id of the user that activeuser belongsTo
            createUserNotification({
                message: `Your payout request for ${currency === 'USD' ? '$': '€'}${amount.toFixed(2)} has been ${status.toLowerCase()}`,
                type: 'Payment',
                belongsTo: activeUser.belongsTo
            });
            if (status === 'Paid') sendEmail({
                templateId: 68, 
                smtpParams: {
                    AMOUNT: amount.toFixed(2),
                    CURRENCY: currency,
                    SYMBOL: currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '$',
                    BRAND: brand,
                    ACCOUNT: paymentAccount
                }, 
                tags: ['Payment'], 
                email: activeUser.email
            });
            if (status === 'Rejected') sendEmail({
                templateId: 69, 
                smtpParams: {
                    AMOUNT: amount.toFixed(2),
                    CURRENCY: currency,
                    SYMBOL: currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '$',
                    BRAND: brand,
                    ACCOUNT: paymentAccount
                }, 
                tags: ['Payment'], 
                email: activeUser.email
            })
            
            req.body = updatedPayment;
            req.params._id = updatedPayment.belongsTo; // changing req.params._id to belongsTo to keep update balance function consistent
            next();
        } catch (err) {
            return res.status(400).send(err)
        }
    } else return res.status(403).send({ msg: 'Unauthorised' });
}, updateBalances);


function updateBalances (req, res) { // After next() is called on /update-payment/:_id it comes next to updateBalances()
    return updatePersonalBalance({ _id: req.params._id })
    .then(() => res.status(201).send({ msg: `You have paid  ${req.body.currency} ${req.body.amount.toFixed(2)} ` }))
    .catch(() => res.status(500).send({ msg: 'Server error: Please contact support' }))
};

// POST /admin/active-user/delete-application { _id }
router.post('/delete-application', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    try { 
        const application = await Application.findByIdAndDelete(req.body._id);
        return res.status(200).send(application); 
    } catch (err) {
        return res.status(400).send(err)
    }    
});

// POST /admin/active-user/fetch-quarter-data
router.post('/fetch-quarter-data', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        const { accountId, quarter } = req.body;
        try {
            const q = await Quarter.findOne({ accountId, quarter });
            const upgrades = await Upgrade.find({ accountId, quarter })
            return res.status(200).send({ q, upgrades });
        } catch (error) {
            return res.status(403).send({ success: false, msg: error });
        }
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
});








module.exports = router;
