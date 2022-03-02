const express = require('express')
const router = express.Router()
const passport = require('passport')
require('../../auth/passport')(passport)
const { getToken } = require('../../utils/token.utils')
const { ActiveUser, Payment } = require('../../models/personal')
const {
    createUserNotification,
} = require('../../utils/notifications-functions')
const { requestedPayment } = require('../../utils/notifications-list')
const { mapRegexQueryFromObj } = require('../../utils/helper-functions')
const { updatePersonalBalance } = require('../../utils/balance-helpers')
const { sendEmail } = require('../../utils/sib-helpers')
const { sibPaymentRequest } = require('../../utils/sib-transactional-templates')
const { msgPaymentRequest } = require('../../utils/success-messages')
const { formatMoney } = require('accounting')
const { serverErr } = require('../../utils/error-messages')

// /personal/payment/create-payment/:_id - THIS IS UP-TO-DATE 1/3/22
router.post(
    '/create-payment/:_id',
    passport.authenticate('jwt', {
        session: false,
    }),
    createPayment,
    updateBalances
) // returns activeUser

async function createPayment(req, res, next) {
    // - THIS IS UP-TO-DATE 1/3/22
    const token = getToken(req.headers)
    if (token) {
        const current = (
            await ActiveUser.findById(req.params._id).select('balances')
        ).balances.find((a) => a.brand === req.body.brand).current

        if (current < req.body.amount) {
            // check if duplicate request - if so, update balance and then send err message
            return res.status(403).send({
                msg: 'You have insufficient funds to request this amount',
            })
        } else {
            const newPayment = await Payment.create({
                amount: req.body.amount,
                currency: req.body.currency,
                brand: req.body.brand,
                paymentAccount: req.body.paymentAccount,
                belongsTo: req.params._id,
            })

            const { currency, amount, brand, paymentAccount, belongsTo } =
                newPayment

            let activeUser = await ActiveUser.findById(belongsTo)
                .select('belongsTo')
                .populate({ path: 'belongsTo', select: 'email' })

            createUserNotification(
                requestedPayment({
                    symbol: currency === 'USD' ? '$' : '€',
                    amount,
                    brand,
                    paymentAccount,
                    locale: req.body.locale,
                    belongsTo: activeUser.belongsTo._id,
                })
            )

            sendEmail(
                sibPaymentRequest({
                    locale: req.body.locale,
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
                    email: activeUser.belongsTo.email,
                })
            )

            req.newPayment = newPayment // creates new payment and then adds it to req object before calling return next()
            next()
        }
    } else return res.status(403).send({ msg: 'Unauthorised' })
}

function updateBalances(req, res) {
    // After next() is called on createPayment() it comes next to updateBalances()

    return updatePersonalBalance({ _id: req.params._id, brand: req.body.brand })
        .then(() =>
            res.status(201).send(
                msgPaymentRequest({
                    locale: req.body.locale,
                    currency: req.body.currency,
                    amount: formatMoney(
                        req.body.amount,
                        req.body.currency === 'USD'
                            ? '$'
                            : req.body.currency === 'EUR'
                            ? '€'
                            : '$',
                        2
                    ),
                    newPayment: req.newPayment,
                })
            )
        )
        .catch((err) => {
            return res.status(500).send(serverErr({ locale: req.body.locale }))
        })
}

// POST /personal/payment/fetch-payments - THIS IS UP-TO-DATE 1/3/22
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
                const payments = await Payment.find(query)
                    .collation({ locale: 'en', strength: 1 })
                    .sort(sort)
                    .skip(skippage)
                    .limit(pageSize)
                const pageCount = await Payment.countDocuments(query)
                const brands = await Payment.distinct('brand')
                const statuses = await Payment.distinct('status')
                const currencies = await Payment.distinct('currency')

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
