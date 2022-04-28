const express = require('express')
const router = express.Router()
const passport = require('passport')
require('../../auth/passport')(passport)
const { getToken } = require('../../utils/token.utils')
const { User, UserNotification } = require('../../models/common/index')
const {
    serverErr,
    errSibContactExists,
    errExistingEmail,
} = require('../../utils/error-messages')
const { createNewSubscriber } = require('../../utils/sib-helpers')
const {
    msgSubscribed,
    msgUpdatedDetails,
} = require('../../utils/success-messages')

// /common/user/get-user/:_id
router.get(
    '/get-user/:_id',
    passport.authenticate('jwt', {
        session: false,
    }),
    (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            try {
                User.findById(req.params._id)
                    .select('name email skype telegram phone locale')
                    .lean()
                    .then((user) => res.status(200).send(user))
                    .catch((err) => {
                        return res.status(500).send({
                            msg: 'Server error: Please contact support',
                        })
                    })
            } catch (error) {
                console.log(error)
            }
        } else return res.status(403).send({ msg: 'Unauthorised' })
    }
)

// /common/user/update-user/:_id
router.post(
    '/update-user/:_id',
    passport.authenticate('jwt', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            const { email } = req.body // receives these regardless of any change through
            const { _id } = req.params
            let update = req.body

            let exists = false
            if (update['email']) {
                let count = await User.countDocuments({
                    email: update['email'],
                    _id: { $ne: { _id } },
                })
                    .select('email')
                    .lean() // check if user exists
                if (count > 0) exists = true
            } //
            if (exists > 0) {
                const { locale } = await User.findById(_id).select('locale')
                return res.status(400).send(
                    errExistingEmail({
                        locale,
                        email: update['email'],
                    })
                )
            }

            User.findByIdAndUpdate(_id, update, { new: true })
                .select(
                    'name email skype telegram phone locale userId _id activeUser partner isAffiliate'
                )
                .populate({
                    path: 'partner',
                    select: 'isSubPartner epi siteId referredBy',
                })
                .lean()
                .then((updatedUser) =>
                    res.status(201).send(
                        msgUpdatedDetails({
                            updatedUser,
                            locale: updatedUser.locale,
                        })
                    )
                )
                .catch((err) => {
                    return res
                        .status(500)
                        .send({ msg: 'Server error: Please contact support' })
                })
        } else return res.status(403).send({ msg: 'Unauthorised' })
    }
)

// /common/user/get-new-notifications/:_id
router.get(
    '/get-new-notifications/:_id',
    passport.authenticate('jwt', {
        session: false,
    }),
    async (req, res) => {
        const unRead = await UserNotification.countDocuments({
            belongsTo: req.params._id,
            read: false,
        })
            .select('read')
            .lean()
        return res.status(200).send({ unRead })
    }
)

// /common/user/get-notifications/:_id?page=number
router.get(
    '/get-notifications/:_id',
    passport.authenticate('jwt', {
        session: false,
    }),
    getNotifications
)

// /common/user/update-notifications/:_id'
router.get(
    '/update-notifications/:_id',
    passport.authenticate('jwt', {
        session: false,
    }),
    updateNotifications,
    getNotifications
)

async function updateNotifications(req, res, next) {
    const token = getToken(req.headers)
    if (token) {
        await UserNotification.updateMany(
            { belongsTo: req.params._id },
            { read: true }
        )
        next()
    } else return res.status(403).send({ msg: 'Unauthorised' })
}

function getNotifications(req, res) {
    const token = getToken(req.headers)
    if (token) {
        let pageLimit = 10 // 4, 4, 4
        let skippage = pageLimit * (req.query.page - 1) // with increments of one = 5 * (1 - 1) = 0 |  5 * (2 - 1) = 5 | 5 * (3 - 1) = 10;
        UserNotification.find({ belongsTo: req.params._id })
            .select('message read type createdAt')
            .sort('-createdAt')
            .skip(skippage)
            .limit(pageLimit)
            .lean()
            .then(async (notifications) => {
                const total = await UserNotification.countDocuments({
                    belongsTo: req.params._id,
                })
                    .select('read')
                    .lean()
                const unRead = await UserNotification.countDocuments({
                    belongsTo: req.params._id,
                    read: false,
                })
                    .select('read')
                    .lean()
                return res.status(200).send({ notifications, total, unRead })
            })
            .catch((err) =>
                res
                    .status(500)
                    .send({ msg: 'Server error: Please contact support' })
            )
    } else return res.status(403).send({ msg: 'Unauthorised' })
}

// /common/user/subscribe-to-list - THIS IS UP-TO-DATE 1/3/22
router.post('/subscribe-to-list', async (req, res) => {
    try {
        await createNewSubscriber({
            email: req.body.email,
            locale: req.body.locale,
        })
        return res.status(201).send(msgSubscribed({ locale: req.body.locale }))
    } catch (error) {
        const msg = JSON.parse(error.message)
        if (msg.code === 'duplicate_parameter') {
            return res
                .status(401)
                .send(errSibContactExists({ locale: req.body.locale }))
        }
        return res.status(500).send(serverErr({ locale: req.body.locale }))
    }
})

module.exports = router
