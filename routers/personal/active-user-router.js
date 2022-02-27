const express = require('express')
const router = express.Router()
const passport = require('passport')
require('../../auth/passport')(passport)
const mongoose = require('mongoose')
const { getToken } = require('../../utils/token.utils')
const { User, Notification } = require('../../models/common/index')
const { ActiveUser, Payment, Report } = require('../../models/personal')
const {
    createUserNotification,
} = require('../../utils/notifications-functions')
const { sendEmail } = require('../../utils/sib-helpers')
const { serverErr } = require('../../utils/error-messages')

// /personal/active-user/get-active-user/:_id
router.get(
    '/get-active-user/:_id',
    passport.authenticate('jwt', {
        session: false,
    }),
    (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            ActiveUser.findById(req.params._id)
                .select('stats paymentDetails')
                .lean()
                .then((activeUser) => res.status(200).send(activeUser))
                .catch(() =>
                    res
                        .status(500)
                        .send({ msg: 'Server error: Please contact support' })
                )
        } else return res.status(403).send({ msg: 'Unauthorised' })
    }
)

// /personal/active-user/get-active-user-balance-brand/:_id/:brand
router.get(
    '/get-active-user-balances-brand/:_id/:brand',
    passport.authenticate('jwt', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            try {
                const balance = (
                    await ActiveUser.findById(req.params._id).select('balances')
                ).balances.find((a) => a.brand === req.params.brand)

                return res.status(200).send(balance)
            } catch (error) {
                return res.status(500).send(serverErr({ locale: 'en' }))
            }
        } else return res.status(403).send({ msg: 'Unauthorised' })
    }
)

// /personal/active-user/update-payment-details/:_id
router.post(
    '/update-payment-details/:_id',
    passport.authenticate('jwt', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            const update = req.body // doing it this way so we can submit anything to it to update and therefore provide less routes

            try {
                const activeUser = await ActiveUser.findByIdAndUpdate(
                    req.params._id,
                    update,
                    { new: true, select: req.body.select }
                ).populate({ path: 'belongsTo', select: 'email' })

                // sendEmail({
                //     // send email ( doesn't matter if belongsTo or not because it is just submitting );
                //     templateId: 19,
                //     smtpParams: {
                //         NONE: null,
                //     },
                //     tags: ['Account'],
                //     email: activeUser.belongsTo.email,
                // })
                return res.status(200).send(activeUser)
            } catch (err) {
                return res.status(400).send({ success: false })
            }
        } else res.status(403).send({ success: false, msg: 'Unauthorised' })
    }
)

// /personal/active-user/fetch-deal-data/:_id
router.post(
    '/fetch-deal-data/:_id',
    passport.authenticate('jwt', {
        session: false,
    }),
    (req, res) => {
        const token = getToken(req.headers)

        if (token) {
            const { month, brand } = req.body
            console.log(req.body, req.params, 'hi')
            Promise.all([
                ActiveUser.findById(req.params._id).select('deals _id').lean(),
                Report.aggregate([
                    // including month and brand in query
                    {
                        $match: {
                            $and: [
                                {
                                    belongsToActiveUser:
                                        mongoose.Types.ObjectId(req.params._id),
                                },
                                { month },
                                { brand },
                            ],
                        },
                    },
                    { $project: { 'account.transValue': 1 } }, // selected values to return 1 = true, 0 = false
                    {
                        $group: {
                            _id: null,
                            transValue: { $sum: '$account.transValue' },
                        },
                    },
                ]),
                ActiveUser.find({ referredBy: req.params._id })
                    .select('_id')
                    .lean() // get all partners that have BEEN referredBy this activeuser
                    .then((subUsers) => {
                        return subUsers.reduce(async (total, nextSubUser) => {
                            let acc = await total
                            for await (const report of Report.find({
                                belongsToActiveUser: nextSubUser._id,
                                brand,
                                month,
                                'account.transValue': { $gt: 0 },
                            })
                                .select('account.transValue')
                                .lean()) {
                                acc += report.account.transValue
                            }
                            return acc
                        }, Promise.resolve(0))
                    }),
            ])
                .then(([activeUser, myVol, mySubVol]) => {
                    const isValid = (arr, value) =>
                        arr.length > 0 ? arr[0][value] : 0 // used when _id = null | arr is the aggregate result | value is either cashback or commission

                    const transValue = isValid(myVol, 'transValue')

                    const deal = activeUser.deals.find(
                        (d) => d.brand === req.body.brand
                    ).rates

                    let achievedRate = deal.reduce(
                        (acc, d) =>
                            transValue >= d.minVol && transValue <= d.maxVol
                                ? (acc += d.cashback)
                                : acc,
                        0
                    )
                    let percentage =
                        (deal.map((t) => t.cashback).indexOf(achievedRate) +
                            1) /
                        deal.length

                    achievedRate = achievedRate * 100
                    percentage = percentage * 100
                    const level = deal.find(
                        (d) => d.cashback * 100 === achievedRate
                    )
                        ? deal.find((d) => d.cashback * 100 === achievedRate)
                              .level
                        : 1

                    console.log(
                        deal,
                        achievedRate,
                        percentage,
                        transValue,
                        mySubVol,
                        level
                    )
                    return res.status(200).send({
                        deal,
                        achievedRate,
                        percentage,
                        myVol: transValue,
                        mySubVol,
                        level,
                    })
                })
                .catch((err) => {
                    console.log(err)
                    return res
                        .status(500)
                        .send({ msg: 'Server error: Please contact support' })
                })
        } else return res.status(403).send({ msg: 'Unauthorised' })
    }
)

module.exports = router
