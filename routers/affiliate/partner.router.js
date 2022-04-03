const passport = require('passport')
require('../../auth/passport')(passport)
const express = require('express')
const router = express.Router()

const { getToken } = require('../../utils/token.utils')
const {
    AffPartner,
    AffNotification,
    AffApproval,
} = require('../../models/affiliate/index')
const { User } = require('../../models/common')

const { mapRegexQueryFromObj } = require('../../utils/helper-functions')
const { createAffNotification } = require('../../utils/notifications-functions')
const { createAdminJob } = require('../../utils/admin-job-functions')
const { sendEmail } = require('../../utils/sib-helpers')
const {
    sibRequestLinks,
    sibPaymentDetailsUpdate,
} = require('../../utils/sib-transactional-templates')
const {
    updatedPaymentDetails,
    linksRequested,
} = require('../../utils/notifications-list')
const { msgRequestedLinks } = require('../../utils/success-messages')
const { errRequestNotSuccess } = require('../../utils/error-messages')

// POST /affiliate/partner/fetch-details/:_id
router.post(
    '/fetch-details/:_id',
    passport.authenticate('jwt', {
        // with this function we can return any fields we need by sending req.body.select
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            try {
                const partner = await AffPartner.findById(req.params._id)
                    .select(req.body.select)
                    .lean()
                return res.status(200).send(partner)
            } catch (err) {
                return res.status(400).send({ success: false })
            }
        } else res.status(403).send({ success: false, msg: 'Unauthorised' })
    }
)

// POST /affiliate/partner/update-partner-payment-details/:_id
router.post(
    '/update-payment-details/:_id',
    passport.authenticate('jwt', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            try {
                const partner = await AffPartner.findByIdAndUpdate(
                    req.params._id,
                    { paymentDetails: req.body.paymentDetails },
                    { new: true, select: 'paymentDetails email belongsTo' }
                )
                const { locale } = await User.findById(partner.belongsTo)
                createAffNotification(
                    updatedPaymentDetails({
                        locale,
                        brand: req.body.brand,
                        belongsTo: req.params._id,
                    })
                )
                sendEmail(
                    // checked 3-4-22
                    sibPaymentDetailsUpdate({
                        locale,
                        smtpParams: {},
                        email: partner.email,
                    })
                )
                return res.status(200).send(partner)
            } catch (err) {
                return res.status(400).send({ success: false })
            }
        } else res.status(403).send({ success: false, msg: 'Unauthorised' })
    }
)

// POST /affiliate/partner/request-links/:_id
router.post(
    '/request-links/:_id',
    passport.authenticate('jwt', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            try {
                const partner = await AffPartner.findByIdAndUpdate(
                    req.params._id,
                    { brandAssets: req.body.brandAssets },
                    { new: true, select: 'brandAssets email epi belongsTo' }
                )
                const { locale } = await User.findById(partner.belongsTo)
                createAffNotification(
                    linksRequested({
                        brand: req.body.brand,
                        locale,
                        belongsTo: req.params._id,
                    })
                )
                createAdminJob({
                    message: `Partner ${partner.email} / ${partner.epi} has requested additional links for ${req.body.brand}`,
                    status: 'Pending',
                    partner: req.params._id,
                    type: 'Links',
                })
                sendEmail(
                    // checked 3-4-22
                    sibRequestLinks({
                        locale,
                        email: partner.email,
                        smtpParams: {
                            BRAND: req.body.brand,
                        },
                    })
                )
                return res.status(200).send(
                    msgRequestedLinks({
                        locale,
                        brand: req.body.brand,
                        partner,
                    })
                )
            } catch (err) {
                return res.status(400).send(errRequestNotSuccess({ locale }))
            }
        } else res.status(403).send({ success: false, msg: 'Unauthorised' })
    }
)

// POST /affiliate/partner/request-approval/:_id
// 2/4/22 - Not active route for VK
// router.post(
//     '/request-approval/:_id',
//     passport.authenticate('jwt', {
//         session: false,
//     }),
//     async (req, res) => {
//         const token = getToken(req.headers)
//         if (token) {
//             try {
//                 const { brand, accountId, name, _id } = req.body.data
//                 const partner = await AffPartner.findByIdAndUpdate(
//                     req.params._id,
//                     { requestedApproval: true, isPermitted: null },
//                     { new: true, select: 'requestedApproval email epi' }
//                 )
//                 await AffApproval.create({
//                     brand,
//                     accountId,
//                     name,
//                     belongsTo: _id,
//                 })
//                 createAdminJob({
//                     message: `Partner ${partner.email} / ${partner.epi} requested approval for BD and IN`,
//                     status: 'Pending',
//                     partner: req.params._id,
//                     type: 'Links',
//                 })
//                 sendEmail({
//                     templateId: 76,
//                     smtpParams: {
//                         NAME: name,
//                         BRAND: brand,
//                         ACCOUNTID: accountId,
//                     },
//                     tags: ['Account'],
//                     email: partner.email,
//                 })
//                 return res.status(200).send(partner)
//             } catch (err) {
//                 return res.status(400).send({ success: false })
//             }
//         } else res.status(403).send({ success: false, msg: 'Unauthorised' })
//     }
// )

// POST /affiliate/partner/fetch-notifications?pageSize=${pageSize}&pageIndex=${pageIndex}
router.post(
    '/fetch-notifications',
    passport.authenticate('jwt', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            let pageSize = parseInt(req.query.pageSize)
            let pageIndex = parseInt(req.query.pageIndex)
            let { sort, query } = req.body
            let skippage = pageSize * pageIndex // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table
            let regDate = (
                await AffPartner.findById(query.belongsTo)
                    .select('belongsTo')
                    .populate({ path: 'belongsTo', select: 'regDate' })
            ).belongsTo.regDate
            let orQuery = {
                isGeneral: true,
                createdAt: { $gte: regDate },
            }
            query = mapRegexQueryFromObj(query)
            if (query.type) orQuery['type'] = query.type // we need orQuery to look for general notifications. We also only add 'type' to the orQuery if it exists in query, otherwise it will just return all isGeneral: true messages despite the filter
            let searchQuery = query.message ? query : { $or: [query, orQuery] } // only use orQuery if no 'message' is queried.
            try {
                const notifications = await AffNotification.find(searchQuery)
                    .collation({ locale: 'en', strength: 1 })
                    .sort(sort)
                    .skip(skippage)
                    .limit(pageSize)
                    .lean()
                // make all notifications read
                // await AffNotification.updateMany(
                //     { belongsTo: query.belongsTo },
                //     { read: true }
                // )
                const pageCount = await AffNotification.countDocuments(query)
                const types = await AffNotification.distinct('type')
                return res.status(200).send({ notifications, pageCount, types })
            } catch (err) {
                return res.status(400).send(err)
            }
        } else return res.status(403).send({ msg: 'Unauthorised' })
    }
)

// POST /affiliate/partner/fetch-notifications-new
router.post(
    '/fetch-notifications-new',
    passport.authenticate('jwt', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            const { _id } = req.body
            try {
                const count = await AffNotification.countDocuments({
                    belongsTo: _id,
                    read: false,
                })
                return res.status(200).send({ count })
            } catch (err) {
                return res.status(400).send(err)
            }
        } else return res.status(403).send({ msg: 'Unauthorised' })
    }
)

// POST /affiliate/partner/update-notifications
router.post(
    '/update-notifications',
    passport.authenticate('jwt', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            const { _id } = req.body
            try {
                await AffNotification.updateMany(
                    { belongsTo: _id, read: false },
                    { read: true }
                )
                const count = await AffNotification.countDocuments({
                    belongsTo: _id,
                    read: false,
                })
                return res.status(200).send({ count })
            } catch (err) {
                return res.status(400).send(err)
            }
        } else return res.status(403).send({ msg: 'Unauthorised' })
    }
)

// GET /affiliate/partner/accept-terms/:_id
router.get(
    '/accept-terms/:_id',
    passport.authenticate('jwt', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            const { _id } = req.params
            try {
                const partner = await AffPartner.findByIdAndUpdate(
                    _id,
                    { termsAccepted: true },
                    { new: true, select: 'termsAccepted' }
                )
                return res.status(200).send(partner)
            } catch (err) {
                return res.status(400).send(err)
            }
        } else return res.status(403).send({ msg: 'Unauthorised' })
    }
)

module.exports = router
