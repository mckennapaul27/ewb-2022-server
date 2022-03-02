const express = require('express')
const router = express.Router()
const passport = require('passport')
require('../../auth/passport')(passport)
const dayjs = require('dayjs')
const { getToken } = require('../../utils/token.utils')
const { Application, ActiveUser } = require('../../models/personal')
const { AffApplication } = require('../../models/affiliate/index')
const {
    createUserNotification,
} = require('../../utils/notifications-functions')
const {
    updateApplication,
    hasApplied,
} = require('../../utils/notifications-list')
const { mapRegexQueryFromObj } = require('../../utils/helper-functions')
const { sendEmail } = require('../../utils/sib-helpers')
const { err7 } = require('../../utils/error-messages')
const {
    msgVIPRequestSubmitted,
    msgApplicationSubmitted,
} = require('../../utils/success-messages')
const {
    sibPersonalApplicationSubmit,
} = require('../../utils/sib-transactional-templates')

//  /personal/application/request-upgrade/:_id`) - THIS IS UP-TO-DATE 2/3/22
router.post(
    '/request-upgrade/:_id',
    passport.authenticate('jwt', {
        session: false,
    }),
    async (req, res, next) => {
        const token = getToken(req.headers)
        if (token) {
            const vipRequest = await Application.findByIdAndUpdate(
                req.params._id,
                {
                    upgradeStatus: `Requested ${dayjs().format('DD/MM/YYYY')}`,
                    'availableUpgrade.valid': false,
                    $inc: { requestCount: 1 },
                },
                { new: true }
            ).select('availableUpgrade.status accountId belongsTo')

            if (vipRequest.belongsTo) {
                let _id = (
                    await ActiveUser.findById(vipRequest.belongsTo)
                        .select('belongsTo')
                        .lean()
                ).belongsTo // get the _id of the user that activeuser belongsTo
                createUserNotification(
                    updateApplication({
                        status: vipRequest.availableUpgrade.status,
                        accountId: vipRequest.accountId,
                        _id,
                        locale: req.body.locale,
                    })
                )
            }
            req.vipRequest = vipRequest
            next()
        } else return res.status(403).send({ msg: 'Unauthorised' })
    },
    getApplications
)

// /personal/application/create-personal-application-from-dashboard - THIS IS UP-TO-DATE 2/3/22 (for use when submitting from new dashboard FORM)
router.post(
    '/create-personal-application-from-dashboard',
    passport.authenticate('jwt', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            const { accountId, activeUser, brand, upgrade, locale } = req.body
            let existsOne = await Application.countDocuments({ accountId })
                .select('accountId')
                .lean() // check if application exists
            let existsTwo = await AffApplication.countDocuments({ accountId })
                .select('accountId')
                .lean() // check if affapplication exists
            if (existsOne > 0 || existsTwo > 0)
                return res.status(400).send(err7({ accountId, locale }))
            const newApp = await Application.create({
                brand,
                accountId,
                email: req.body.email, // using req.body as need to access email from activeuser below
                belongsTo: activeUser,
                'availableUpgrade.status': upgrade,
            })
            let { belongsTo, email } = await ActiveUser.findById(
                newApp.belongsTo
            )
                .select('belongsTo email')
                .lean() // get the _id of the user that activeuser belongsTo

            createUserNotification(
                hasApplied({
                    accountId: newApp.accountId,
                    _id: belongsTo,
                    locale,
                })
            )
            await sendEmail(
                sibPersonalApplicationSubmit({
                    locale,
                    smtpParams: {
                        BRAND: brand,
                        ACCOUNTID: accountId,
                        EMAIL: req.body.email, // different 'email' to one used below
                        STATUS: newApp.status,
                    },
                    email: email,
                })
            )
            return res
                .status(201)
                .send(msgApplicationSubmitted({ locale, accountId }))
        } else return res.status(403).send({ msg: 'Unauthorised' })
    }
)

// returns applications - THIS IS UP-TO-DATE 2/3/22
async function getApplications(req, res) {
    const token = getToken(req.headers)
    if (token) {
        const vipRequest = req.vipRequest ? req.vipRequest : null
        const newApp = req.newApp ? req.newApp : null

        const msg = req.vipRequest
            ? msgVIPRequestSubmitted({
                  locale: req.body.locale,
                  status: req.vipRequest.availableUpgrade.status,
                  accountId: req.vipRequest.accountId,
              })
            : req.newApp
            ? msgVIPRequestSubmitted({
                  locale: req.body.locale,
                  status: req.newApp.availableUpgrade.status,
                  accountId: req.newApp.accountId,
              })
            : ''

        try {
            const applications = await Application.find({
                belongsTo: req.body.activeUser,
                status: { $in: ['Approved', 'Confirmed'] },
            })
                .sort({ dateAdded: 'desc' })
                .lean()
            return res
                .status(200)
                .send({ applications, vipRequest, newApp, msg: msg.msg })
        } catch (error) {
            return res.status(500).send(serverErr({ locale: req.body.locale }))
        }
    } else return res.status(403).send({ msg: 'Unauthorised' })
}

// POST /personal/application/fetch-applications - THIS IS UP-TO-DATE 2/3/22
router.post(
    '/fetch-applications',
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
            query = mapRegexQueryFromObj(query)
            try {
                const applications = await Application.find(query)
                    .collation({ locale: 'en', strength: 2 })
                    .sort(sort)
                    .skip(skippage)
                    .limit(pageSize)
                const pageCount = await Application.countDocuments(query)
                const brands = await Application.distinct('brand')
                const statuses = await Application.distinct('status')
                return res
                    .status(200)
                    .send({ applications, pageCount, brands, statuses })
            } catch (err) {
                return res.status(400).send(err)
            }
        } else return res.status(403).send({ msg: 'Unauthorised' })
    }
)

module.exports = router
