const express = require('express')
const router = express.Router()
const passport = require('passport')
require('../../auth/passport')(passport)
const { getToken } = require('../../utils/token.utils')
const { AffPayment, AffPartner } = require('../../models/affiliate')
const { User } = require('../../models/common')
const { mapRegexQueryFromObj } = require('../../utils/helper-functions')
const { createAffNotification } = require('../../utils/notifications-functions')
const { createAdminJob } = require('../../utils/admin-job-functions')
const { updateAffiliateBalance } = require('../../utils/balance-helpers')
const { sendEmail } = require('../../utils/sib-helpers')
const { requestedPayment } = require('../../utils/notifications-list')

// /affiliate/payment/create-payment/:_id
router.post(
    '/create-payment/:_id',
    passport.authenticate('jwt', {
        session: false,
    }),
    createPayment,
    updateBalances
) // returns activeUser

async function createPayment(req, res, next) {
    const token = getToken(req.headers)
    if (token) {
        const balance = (
            await AffPartner.findById(req.params._id).select('stats')
        ).stats.balance.find((a) => a.currency === req.body.currency).amount
        if (balance < req.body.amount)
            return res.status(403).send({
                msg: 'You have insufficient funds to request this amount',
            })

        const newPayment = await AffPayment.create({
            amount: req.body.amount,
            currency: req.body.currency,
            brand: req.body.brand,
            paymentAccount: req.body.paymentAccount,
            belongsTo: req.params._id,
        })
        const { currency, amount, brand, paymentAccount, belongsTo } =
            newPayment
        const partner = await AffPartner.findById(belongsTo)
            .select('belongsTo')
            .lean()
        const { locale } = await User.findById(partner.belongsTo)
        createAffNotification(
            requestedPayment({
                symbol: currency === 'USD' ? '$' : '€',
                amount,
                brand,
                paymentAccount,
                belongsTo,
                locale,
            })
        )
        const email = (
            await AffPartner.findById(req.params._id)
                .select('belongsTo')
                .populate({ path: 'belongsTo', select: 'email' })
        ).belongsTo.email
        sendEmail({
            // send email ( doesn't matter if belongsTo or not because it is just submitting );
            templateId: 23,
            smtpParams: {
                AMOUNT: amount.toFixed(2),
                CURRENCY: currency,
                SYMBOL:
                    currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '$',
                BRAND: brand,
                ACCOUNT: paymentAccount,
            },
            tags: ['Payment'],
            email,
        })
        const cryptos = ['BitCoin']
        if (cryptos.includes(req.body.brand)) {
            sendEmail({
                // send email ( doesn't matter if belongsTo or not because it is just submitting );
                templateId: 70,
                smtpParams: {
                    AMOUNT: amount.toFixed(2),
                    CURRENCY: currency,
                    SYMBOL:
                        currency === 'USD'
                            ? '$'
                            : currency === 'EUR'
                            ? '€'
                            : '$',
                    BRAND: brand,
                    ACCOUNT: paymentAccount,
                },
                tags: ['Payment'],
                email,
            })
        }
        req.newPayment = newPayment // creates new payment and then adds it to req object before calling return next()
        next()
    } else return res.status(403).send({ msg: 'Unauthorised' })
}

function updateBalances(req, res) {
    // After next() is called on createPayment() it comes next to updateBalances()
    return updateAffiliateBalance({ _id: req.params._id })
        .then(() =>
            res.status(201).send({
                newPayment: req.newPayment,
                msg: `You have requested ${
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

// POST /affiliate/payment/fetch-payments
router.post(
    '/fetch-payments',
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
                const payments = await AffPayment.find(query)
                    .collation({ locale: 'en', strength: 1 })
                    .sort(sort)
                    .skip(skippage)
                    .limit(pageSize)
                const pageCount = await AffPayment.countDocuments(query)
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

// useful links
// https://stackoverflow.com/questions/18875292/passing-variables-to-the-next-middleware-using-next-in-express-js

module.exports = router
