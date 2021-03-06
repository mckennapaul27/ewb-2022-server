const passport = require('passport')
require('../../auth/admin-passport')(passport)

const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')

let dayjs = require('dayjs')
let advancedFormat = require('dayjs/plugin/advancedFormat')
dayjs.extend(advancedFormat)

const { getToken } = require('../../utils/token.utils')

const {
    AffPartner,
    AffReport,
    AffApplication,
    AffPayment,
    AffReportMonthly,
    AffSubReport,
    AffUpgrade,
    AffApproval,
} = require('../../models/affiliate/index')

const {
    mapRegexQueryFromObj,
    isPopulatedValue,
    mapQueryForAggregate,
    mapQueryForPopulate,
    getLocaleFromPartnerUser,
} = require('../../utils/helper-functions')
const { createAffNotification } = require('../../utils/notifications-functions')
const {
    applicationYY,
    applicationYN,
    applicationNN,
    paymentResult,
} = require('../../utils/notifications-list')
const { createAffAccAffReport } = require('../../utils/account-functions')
const { updateAffiliateBalance } = require('../../utils/balance-helpers')
const { Brand, Quarter, User } = require('../../models/common')
const { initialUpgrade } = require('../../config/deals')
const { sendEmail } = require('../../utils/sib-helpers')
const {
    sibActiveLinksFromAdmin,
    sibApplicationYY,
    sibApplicationYN,
    sibApplicationNN,
    sibPaymentResult,
} = require('../../utils/sib-transactional-templates')

// POST /admin/partner/get-partner
router.post(
    '/get-partner',
    passport.authenticate('admin', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            try {
                const partner = await AffPartner.findById(req.body._id)
                    .select(req.body.select)
                    .lean()
                return res.status(200).send(partner)
            } catch (err) {
                return res.status(400).send({ msg: 'Server error' })
            }
        } else return res.status(403).send({ msg: 'Unauthorised' })
    }
)

// POST /admin/partner/update-partner/:_id
router.post(
    '/update-partner/:_id',
    passport.authenticate('admin', {
        // this function is used to update brand deals and brand assets from admin
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        const update = req.body
        if (token) {
            try {
                const partner = await AffPartner.findByIdAndUpdate(
                    req.params._id,
                    update,
                    { new: true }
                )
                const locale = await getLocaleFromPartnerUser(req.params._id)
                if (update.brandAssets) {
                    // if the update includes brandAssets, send confirmation email
                    await sendEmail(
                        sibActiveLinksFromAdmin({
                            locale,
                            smtpParams: {
                                BRAND: req.query.brand,
                            },
                            email: partner.email,
                        })
                    )
                }
                return res.status(200).send(partner)
            } catch (err) {
                return res.status(400).send({ msg: 'Server error' })
            }
        } else return res.status(403).send({ msg: 'Unauthorised' })
    }
)

// POST /admin/partner/fetch-reports
router.post(
    '/fetch-reports',
    passport.authenticate('admin', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            let pageSize = parseInt(req.query.pageSize)
            let pageIndex = parseInt(req.query.pageIndex)
            let { sort, query } = req.body
            let skippage = pageSize * pageIndex // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table
            let searchQuery = mapRegexQueryFromObj(query)
            let populateQuery = mapQueryForPopulate(query) // not needed anymore because we added epi and referredByEpi to reports
            let aggregateQuery = mapQueryForAggregate(query) // have to create this for aggregation query because need to make it mongoose.Types.ObjectId

            try {
                const reports = await AffReport.find(searchQuery)
                    .collation({ locale: 'en', strength: 1 })
                    .sort(sort)
                    .skip(skippage)
                    .limit(pageSize)
                    .populate({ path: 'belongsToPartner', select: '_id' })
                const pageCount = await AffReport.countDocuments(searchQuery)
                const brands = await AffReport.distinct('brand')
                const months = await AffReport.distinct('month')
                const siteIds = await AffReport.distinct('siteId')
                const currencies = await AffReport.distinct('account.currency')
                const totals = await AffReport.aggregate([
                    { $match: { $and: [aggregateQuery] } },
                    {
                        $group: {
                            _id: null,
                            commission: { $sum: '$account.commission' },
                            cashback: { $sum: '$account.cashback' },
                            volume: { $sum: '$account.transValue' },
                            deposits: { $sum: '$account.deposits' },
                            subAffCommission: {
                                $sum: '$account.subAffCommission',
                            },
                            profit: { $sum: '$account.profit' },
                        },
                    },
                ])
                const allTotals = await AffReport.aggregate([
                    // all time totals = excludes the $match pipe
                    {
                        $group: {
                            _id: null,
                            allCommission: { $sum: '$account.commission' },
                            allCashback: { $sum: '$account.cashback' },
                            allVolume: { $sum: '$account.transValue' },
                            allDeposits: { $sum: '$account.deposits' },
                            allSubAffCommission: {
                                $sum: '$account.subAffCommission',
                            },
                            allProfit: { $sum: '$account.profit' },
                        },
                    },
                ])
                return res.status(200).send({
                    reports,
                    pageCount,
                    brands,
                    siteIds,
                    months,
                    currencies,
                    totals,
                    allTotals,
                })
            } catch (err) {
                return res.status(400).send(err)
            }
        } else res.status(403).send({ success: false, msg: 'Unauthorised' })
    }
)

// POST /admin/partner/fetch-applications
router.post(
    '/fetch-applications',
    passport.authenticate('admin', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            let pageSize = parseInt(req.query.pageSize)
            let pageIndex = parseInt(req.query.pageIndex)
            let { sort, query } = req.body
            let skippage = pageSize * pageIndex // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table

            let searchQuery = mapRegexQueryFromObj(query)
            let populateQuery = mapQueryForPopulate(query)

            let applications

            try {
                if (isPopulatedValue(query)) {
                    // use this way to query for a populated field - in this case, belongsTo.epi
                    applications = (
                        await AffApplication.find(searchQuery)
                            .collation({ locale: 'en', strength: 1 })
                            .sort(sort)
                            .skip(skippage)
                            .limit(pageSize)
                            .populate({
                                path: 'belongsTo',
                                match: populateQuery,
                            })
                    ).filter((a) => a.belongsTo) // this works because we are only populating partner where the epi matches the query epi so it firstly returns all the users and then filters out all where the belongsTo is null. the belongsTo field will be null if it does not match the query
                } else {
                    applications = await AffApplication.find(searchQuery)
                        .collation({ locale: 'en', strength: 1 })
                        .sort(sort)
                        .skip(skippage)
                        .limit(pageSize)
                        .populate({ path: 'belongsTo', select: 'epi' })
                        .lean()
                }
                const pageCount = await AffApplication.countDocuments(
                    searchQuery
                )
                const brands = await AffApplication.distinct('brand')
                const statuses = await AffApplication.distinct('status')
                // const upgrades = ( // haven't got Upgrade data and DON'T NEED upgrade data
                //     await AffApplication.aggregate([
                //         {
                //             $group: {
                //                 _id: null,
                //                 values: {
                //                     $addToSet: '$availableUpgrade.status',
                //                 },
                //             },
                //         },
                //     ])
                // )[0].values
                return res.status(200).send({
                    applications,
                    pageCount,
                    brands,
                    statuses,
                    upgrades: [],
                })
            } catch (err) {
                console.log(err)
                return res.status(400).send(err)
            }
        } else return res.status(403).send({ msg: 'Unauthorised' })
    }
)

// POST /admin/partner/update-application/:_id`, { accountId, action });
router.post(
    '/update-application/:_id',
    passport.authenticate('admin', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            try {
                const { action, status } = req.body
                const today = dayjs().format('DD/MM/YYYY')
                const update = {
                    status:
                        action === 'YY' || action === 'YN'
                            ? 'Approved'
                            : 'Declined',
                    upgradeStatus:
                        action === 'YY'
                            ? `Upgraded ${today}`
                            : action === 'YN'
                            ? `Not verified ${today}`
                            : `Declined ${today}`,
                    'availableUpgrade.valid':
                        action === 'YY' || action === 'NN' ? false : true,
                }
                if (action === 'YY' || action === 'NN')
                    update['availableUpgrade.status'] = '-'

                const aa = await AffApplication.findByIdAndUpdate(
                    req.params._id,
                    update,
                    { new: true }
                ) // find and update application and return new application

                const { brand, belongsTo, accountId } = aa // deconstruct updated application

                const partner = await AffPartner.findById(belongsTo)
                    .select('email belongsTo')
                    .lean()
                const { locale } = await User.findById(partner.belongsTo)
                    .select('locale')
                    .lean()

                // emails and notifications >>>>>
                if (action === 'YY') {
                    // template 65 needs params.OFFER
                    createAffNotification(
                        applicationYY({ brand, accountId, belongsTo, locale })
                    )
                    await sendEmail(
                        sibApplicationYY({
                            locale,
                            smtpParams: {
                                BRAND: brand,
                                ACCOUNTID: accountId,
                                EMAIL: '-',
                                CURRENCY: '-',
                                OFFER: status ? status : initialUpgrade[brand],
                            },
                            email: partner.email,
                        })
                    )
                } else if (action === 'YN') {
                    createAffNotification(
                        applicationYN({ brand, accountId, belongsTo, locale })
                    )
                    await sendEmail(
                        sibApplicationYN({
                            locale,
                            smtpParams: {
                                BRAND: brand,
                                ACCOUNTID: accountId,
                                EMAIL: '-',
                                CURRENCY: '-',
                                OFFER: status ? status : initialUpgrade[brand],
                            },
                            email: partner.email,
                        })
                    )
                } else if (action === 'NN') {
                    createAffNotification(
                        applicationNN({ brand, accountId, belongsTo, locale })
                    ) // Do not send email as covering NN below
                    await sendEmail(
                        sibApplicationNN({
                            locale,
                            smtpParams: {
                                BRAND: brand,
                                ACCOUNTID: accountId,
                                EMAIL: '-',
                                CURRENCY: '-',
                                OFFER: status ? status : initialUpgrade[brand],
                            },
                            email: partner.email,
                        })
                    )
                } else null

                if (action === 'YY' || action === 'YN')
                    await createAffAccAffReport({ accountId, brand, belongsTo }) // create affaccount and affreport if not already created (Only if YY or YN)

                return res.status(201).send(aa)
            } catch (error) {
                console.log(error)
                return res
                    .status(400)
                    .send({ msg: 'Error whilst updating application' })
            }
        } else return res.status(403).send({ msg: 'Unauthorised' })
    }
)

// POST /admin/partner/fetch-payments
router.post(
    '/fetch-payments',
    passport.authenticate('admin', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            let pageSize = parseInt(req.query.pageSize)
            let pageIndex = parseInt(req.query.pageIndex)
            let { sort, query } = req.body
            let skippage = pageSize * pageIndex // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table

            let searchQuery = mapRegexQueryFromObj(query)
            let populateQuery = mapQueryForPopulate(query)

            let payments

            try {
                if (isPopulatedValue(query)) {
                    // use this way to query for a populated field - in this case, belongsTo.epi
                    payments = (
                        await AffPayment.find(searchQuery)
                            .collation({ locale: 'en', strength: 1 })
                            .sort(sort)
                            .skip(skippage)
                            .limit(pageSize)
                            .populate({
                                path: 'belongsTo',
                                match: populateQuery,
                            })
                    ).filter((a) => a.belongsTo) // this works because we are only populating partner where the epi matches the query epi so it firstly returns all the users and then filters out all where the belongsTo is null. the belongsTo field will be null if it does not match the query
                } else {
                    payments = await AffPayment.find(searchQuery)
                        .collation({ locale: 'en', strength: 1 })
                        .sort(sort)
                        .skip(skippage)
                        .limit(pageSize)
                        .populate({ path: 'belongsTo', select: 'epi' })
                }
                const pageCount = await AffPayment.countDocuments(searchQuery)
                const brands = await AffPayment.distinct('brand')
                const statuses = await AffPayment.distinct('status')
                const currencies = await AffPayment.distinct('currency')
                return res
                    .status(200)
                    .send({ payments, pageCount, brands, statuses, currencies })
            } catch (err) {
                return res.status(400).send(err)
            }
        } else return res.status(403).send({ msg: 'Unauthorised' })
    }
)

// POST /admin/partner/fetch-monthly-reports
router.post(
    '/fetch-monthly-reports',
    passport.authenticate('admin', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            let pageSize = parseInt(req.query.pageSize)
            let pageIndex = parseInt(req.query.pageIndex)
            let { sort, query } = req.body
            let skippage = pageSize * pageIndex // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table
            let searchQuery = mapRegexQueryFromObj(query)
            let aggregateQuery = mapQueryForAggregate(query) // have to create this for aggregation query because need to make it mongoose.Types.ObjectId

            try {
                const reports = await AffReportMonthly.find(searchQuery)
                    .collation({ locale: 'en', strength: 1 })
                    .sort(sort)
                    .skip(skippage)
                    .limit(pageSize)
                    .populate({ path: 'belongsTo', select: '_id' })
                const pageCount = await AffReportMonthly.countDocuments(
                    searchQuery
                )
                const brands = await AffReportMonthly.distinct('brand')
                const months = await AffReportMonthly.distinct('month')
                const currencies = await AffReportMonthly.distinct('currency')
                const totals = await AffReportMonthly.aggregate([
                    { $match: { $and: [aggregateQuery] } },
                    {
                        $group: {
                            _id: null,
                            commission: { $sum: '$commission' },
                            cashback: { $sum: '$cashback' },
                            volume: { $sum: '$transValue' },
                            subAffCommission: { $sum: '$subAffCommission' },
                            profit: { $sum: '$profit' },
                            deposits: { $sum: '$account.deposits' },
                        },
                    },
                ])
                const allTotals = await AffReportMonthly.aggregate([
                    // all time totals = excludes the $match pipe
                    {
                        $group: {
                            _id: null,
                            allCommission: { $sum: '$commission' },
                            allCashback: { $sum: '$cashback' },
                            allVolume: { $sum: '$transValue' },
                            allSubAffCommission: { $sum: '$subAffCommission' },
                            allProfit: { $sum: '$profit' },
                            allDeposits: { $sum: '$account.deposits' },
                        },
                    },
                ])
                return res.status(200).send({
                    reports,
                    pageCount,
                    brands,
                    months,
                    currencies,
                    totals,
                    allTotals,
                })
            } catch (err) {
                return res.status(400).send(err)
            }
        } else res.status(403).send({ success: false, msg: 'Unauthorised' })
    }
)

// POST /admin/partner/create-payment-paid/:_id
router.post(
    '/create-payment-paid/:_id',
    passport.authenticate('admin', {
        session: false,
    }),
    async (req, res, next) => {
        const token = getToken(req.headers)
        if (token) {
            const {
                amount,
                status,
                requestDate,
                paidDate,
                currency,
                brand,
                paymentAccount,
                belongsTo,
            } = req.body
            try {
                const newPayment = AffPayment.create({
                    amount,
                    status,
                    requestDate,
                    paidDate,
                    currency,
                    brand,
                    paymentAccount,
                    belongsTo,
                })
                req.newPayment = newPayment // creates new payment and then adds it to req object before calling return next()
                next()
            } catch (error) {
                return res.status(400).send(error)
            }
        } else return res.status(403).send({ msg: 'Unauthorised' })
    },
    updateBalances
)

function updateBalances(req, res) {
    // After next() is called on createPayment() it comes next to updateBalances()
    return updateAffiliateBalance({ _id: req.params._id })
        .then(() =>
            res.status(201).send({
                newPayment: req.newPayment,
                msg: `You have paid ${
                    req.body.currency
                } ${req.body.amount.toFixed(2)} `,
            })
        )
        .catch(() =>
            res
                .status(500)
                .send({ msg: 'Server error: Please contact support' })
        )
}

// POST /admin/partner/update-payment/:_id`, { status });
router.post(
    '/update-payment/:_id',
    passport.authenticate('admin', {
        session: false,
    }),
    async (req, res, next) => {
        const token = getToken(req.headers)
        if (token) {
            const { status } = req.body
            const update = {
                status: `${status}`,
                paidDate: status === 'Paid' ? Date.now() : null,
            }
            try {
                const updatedPayment = await AffPayment.findByIdAndUpdate(
                    req.params._id,
                    update,
                    { new: true }
                )
                const { currency, amount, belongsTo, brand, paymentAccount } =
                    updatedPayment
                const partner = await AffPartner.findById(belongsTo).select(
                    'email belongsTo'
                )
                const { locale } = await User.findById(partner.belongsTo)
                    .select('locale')
                    .lean()

                createAffNotification(
                    paymentResult({
                        symbol: currency === 'USD' ? '$' : '???',
                        amount,
                        status,
                        belongsTo,
                        locale,
                    })
                )
                await sendEmail(
                    sibPaymentResult({
                        locale,
                        smtpParams: {
                            AMOUNT: amount.toFixed(2),
                            CURRENCY: currency,
                            SYMBOL:
                                currency === 'USD'
                                    ? '$'
                                    : currency === 'EUR'
                                    ? '???'
                                    : '$',
                            BRAND: brand,
                            ACCOUNT: paymentAccount,
                        },
                        email: partner.email,
                        status,
                    })
                )

                req.body = updatedPayment
                req.params._id = updatedPayment.belongsTo // changing req.params._id to belongsTo to keep update balance function consistent
                next()
            } catch (err) {
                return res.status(400).send(err)
            }
        } else return res.status(403).send({ msg: 'Unauthorised' })
    },
    updateBalances
)

// POST /admin/partner/delete-application { _id }
router.post(
    '/delete-application',
    passport.authenticate('admin', {
        session: false,
    }),
    async (req, res) => {
        try {
            const application = await AffApplication.findByIdAndDelete(
                req.body._id
            )
            return res.status(200).send(application)
        } catch (err) {
            return res.status(400).send(err)
        }
    }
)

// POST /admin/partner/toggle-rev-share { _id, revShareActive }
router.post(
    '/toggle-rev-share',
    passport.authenticate('admin', {
        session: false,
    }),
    async (req, res) => {
        try {
            await AffPartner.findByIdAndUpdate(
                req.body._id,
                {
                    revShareActive: req.body.revShareActive,
                },
                { new: true, select: 'revShareActive' }
            )
            return res.status(201).send({ success: true })
        } catch (err) {
            return res.status(400).send(err)
        }
    }
)
function updateBalances(req, res) {
    // After next() is called on /update-payment/:_id it comes next to updateBalances()
    return updateAffiliateBalance({ _id: req.params._id })
        .then(() =>
            res.status(201).send({
                msg: `You have paid  ${req.body.currency} ${req.body.amount} `,
            })
        )
        .catch(() =>
            res
                .status(500)
                .send({ msg: 'Server error: Please contact support' })
        )
}

// POST /admin/partner/toggle-pause-partner { _id, isDisabled }
// not currently needed 3-4-22
// router.post(
//     '/toggle-pause-partner',
//     passport.authenticate('admin', {
//         session: false,
//     }),
//     async (req, res) => {
//         try {
//             const partner = await AffPartner.findByIdAndUpdate(
//                 req.body._id,
//                 {
//                     isDisabled: req.body.isDisabled,
//                 },
//                 { new: true, select: 'email isDisabled' }
//             )
//             if (req.body.isDisabled) {
//                 await sendEmail({
//                     templateId: 0,
//                     tags: ['Application'],
//                     email: partner.email,
//                 })
//             }
//             return res.status(201).send({
//                 success: true,
//                 msg: `${partner.email} has been ${
//                     req.body.isDisabled ? 'disabled' : 're-activated'
//                 }`,
//             })
//         } catch (error) {
//             return res.status(400).send(err)
//         }
//     }
// )

// POST /admin/partner/toggle-permitted { _id, isPermitted }
// not currently needed 3-4-22
// router.post(
//     '/toggle-permitted',
//     passport.authenticate('admin', {
//         session: false,
//     }),
//     async (req, res) => {
//         try {
//             const partner = await AffPartner.findByIdAndUpdate(
//                 req.body._id,
//                 {
//                     isPermitted: req.body.isPermitted,
//                 },
//                 { new: true, select: 'email isPermitted' }
//             )
//             if (req.body.isPermitted) {
//                 // send email saying referral of IN and BD accounts are permitted
//                 await sendEmail({
//                     templateId: 71,
//                     tags: ['Partner'],
//                     email: partner.email,
//                 })
//             }
//             return res.status(201).send({
//                 success: true,
//                 msg: `${partner.email} has been ${
//                     req.body.isPermitted
//                         ? 'made eligible'
//                         : 'refused eligibility'
//                 }`,
//             })
//         } catch (error) {
//             return res.status(400).send(err)
//         }
//     }
// )

// POST /admin/partner/fetch-quarter-data
router.post(
    '/fetch-quarter-data',
    passport.authenticate('admin', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            const { accountId, quarter } = req.body
            try {
                const q = await Quarter.findOne({ accountId, quarter })
                const upgrades = await AffUpgrade.find({ accountId, quarter })
                return res.status(200).send({ q, upgrades })
            } catch (error) {
                return res.status(403).send({ success: false, msg: error })
            }
        } else res.status(403).send({ success: false, msg: 'Unauthorised' })
    }
)

// POST /admin/partner/fetch-approvals
router.post(
    '/fetch-approvals',
    passport.authenticate('admin', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            let pageSize = parseInt(req.query.pageSize)
            let pageIndex = parseInt(req.query.pageIndex)
            let { sort, query } = req.body
            let skippage = pageSize * pageIndex // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table

            let searchQuery = mapRegexQueryFromObj(query)
            let populateQuery = mapQueryForPopulate(query)

            let applications

            try {
                if (isPopulatedValue(query)) {
                    // use this way to query for a populated field - in this case, belongsTo.epi
                    applications = (
                        await AffApproval.find(searchQuery)
                            .collation({ locale: 'en', strength: 1 })
                            .sort(sort)
                            .skip(skippage)
                            .limit(pageSize)
                            .populate({
                                path: 'belongsTo',
                                match: populateQuery,
                            })
                    ).filter((a) => a.belongsTo) // this works because we are only populating partner where the epi matches the query epi so it firstly returns all the users and then filters out all where the belongsTo is null. the belongsTo field will be null if it does not match the query
                } else {
                    applications = await AffApproval.find(searchQuery)
                        .collation({ locale: 'en', strength: 1 })
                        .sort(sort)
                        .skip(skippage)
                        .limit(pageSize)
                        .populate({ path: 'belongsTo', select: 'epi' })
                        .lean()
                }
                const pageCount = await AffApproval.countDocuments(searchQuery)
                const brands = await AffApproval.distinct('brand')
                const statuses = await AffApproval.distinct('status')

                return res.status(200).send({
                    applications,
                    pageCount,
                    brands,
                    statuses,
                })
            } catch (err) {
                console.log(err)
                return res.status(400).send(err)
            }
        } else return res.status(403).send({ msg: 'Unauthorised' })
    }
)

// POST /admin/partner/delete-approval { _id }
router.post(
    '/delete-approval',
    passport.authenticate('admin', {
        session: false,
    }),
    async (req, res) => {
        try {
            const application = await AffApproval.findByIdAndDelete(
                req.body._id
            )
            return res.status(200).send(application)
        } catch (err) {
            return res.status(400).send(err)
        }
    }
)

// if approved
// set permitted to true
// set status of approval to 'Approved'
// send email and Notification
// Route to partner manager to set up site links

// POST /admin/partner/update-approval { _id, belongsTo }
// not currently needed - 3/4/22
// router.post(
//     '/update-approval',
//     passport.authenticate('admin', {
//         session: false,
//     }),
//     async (req, res) => {
//         try {
//             const { decision, _id, belongsTo } = req.body
//             const approval = await AffApproval.findByIdAndUpdate(
//                 _id,
//                 {
//                     status: decision ? 'Approved' : 'Rejected',
//                 },
//                 { new: true }
//             )
//             const partner = await AffPartner.findByIdAndUpdate(
//                 belongsTo,
//                 {
//                     isPermitted: decision ? true : false,
//                 },
//                 { new: true, select: 'isPermitted email' }
//             )

//             // send email saying referral of IN and BD accounts are permitted
//             await sendEmail({
//                 templateId: decision ? 71 : 80,
//                 tags: ['Partner'],
//                 email: partner.email,
//             })

//             return res.status(201).send({
//                 success: decision ? true : false,
//                 msg: `${partner.email} has been ${
//                     decision ? 'made eligible' : 'refused eligibility'
//                 }`,
//             })
//         } catch (error) {
//             return res.status(400).send(error)
//         }
//     }
// )

module.exports = router
