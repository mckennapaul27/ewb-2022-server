const secret = process.env.SECRET_KEY
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const FB_APP_ID = process.env.FB_APP_ID
const RECAPTCHA_KEY = process.env.RECAPTCHA_KEY
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET

const express = require('express')
const router = express.Router()

const passport = require('passport')
require('../../auth/passport')(passport)
require('../../auth/oauth-passport')()

const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const axios = require('axios')

const { User } = require('../../models/common/index')
const { AffPartner, AffApplication } = require('../../models/affiliate/index')
const {
    createUserNotification,
    createAffNotification,
} = require('../../utils/notifications-functions')
const { generateToken, sendToken } = require('../../utils/token.utils')
const {
    welcome,
    welcomeSocial,
    newSubPartnerRegistered,
    hasApplied,
    linksRequested,
} = require('../../utils/notifications-list')
const { sendEmail, createNewContact } = require('../../utils/sib-helpers')
const { Application, ActiveUser } = require('../../models/personal')
const {
    err5,
    serverErr,
    err6,
    err1,
    err2,
    err3,
    err4,
    err7,
} = require('../../utils/error-messages')
const { success1 } = require('../../utils/success-messages')
const dayjs = require('dayjs')
const { createAdminJob } = require('../../utils/admin-job-functions')
const {
    sibApplicationApply,
    sibRequestLinks,
} = require('../../utils/sib-transactional-templates')

// /common/auth/create-new-user
router.post('/create-new-user', createUser, createApplication)

async function createUser(req, res, next) {
    let {
        name,
        email,
        password,
        country,
        locale,
        referredByUser,
        networkCode,
        accountId,
        links,
    } = req.body // referredByPartner here is the network code such as 566

    let exists = await User.countDocuments({ email: req.body.email })
        .select('email')
        .lean()

    if (!name) return res.status(500).send(err1({ locale }))
    else if (!email) return res.status(500).send(err2({ locale }))
    else if (!password) return res.status(500).send(err3({ locale }))
    else if (!country) return res.status(500).send(err4({ locale }))
    else if (!locale) return res.status(500).send(err5({ locale }))
    else if (exists > 0) return res.status(400).send(err6({ locale, email }))
    else {
        // check account Id exists before continuing with user registration
        let existsOne = await Application.countDocuments({ accountId })
            .select('accountId')
            .lean() // check if application exists
        let existsTwo = await AffApplication.countDocuments({ accountId })
            .select('accountId')
            .lean() // check if affapplication exists

        if (accountId && (existsOne > 0 || existsTwo > 0))
            return res.status(400).send(err7({ accountId, locale }))
        // end of error checks
        const { activeUser, userId } = referredByUser
            ? await User.findOne({ userId: referredByUser })
                  .select('userId activeUser')
                  .lean()
            : { userId: undefined, activeUser: undefined } // using default object values otherwise it is impossible to destructure { activeUser, userId }
        const referredByPartner = networkCode
            ? await AffPartner.findOne({ epi: networkCode })
                  .select('_id')
                  .lean()
            : undefined
        return User.create({
            name,
            email,
            password,
            country,
            locale,
            referredBy: userId,
            referredByActiveUser: activeUser,
            referredByPartner,
        })
            .then(async (user) => {
                if (links.length > 0) {
                    // once user is created, check if links were requested and then set them to brand assets
                    const brandAssets = links.reduce((acc, brand) => {
                        const requested = `Requested - ${dayjs().format(
                            'DD MMM YYYY'
                        )}`
                        acc.push({ brand, link: requested, siteId: requested })
                        createAffNotification(
                            linksRequested({
                                locale,
                                brand,
                                belongsTo: user.partner,
                            })
                        )
                        sendEmail(
                            sibRequestLinks({
                                locale,
                                smtpParams: {
                                    BRAND: brand,
                                },
                                email: user.email,
                            })
                        )
                        return acc
                    }, [])
                    const partner = await AffPartner.findByIdAndUpdate(
                        user.partner,
                        { brandAssets },
                        { new: true, select: 'brandAssets email epi' }
                    )
                    createAdminJob({
                        message: `Partner ${partner.email} / ${partner.epi} has requested  links`,
                        status: 'Pending',
                        partner: partner._id,
                        type: 'Links',
                    })
                }
                const token = jwt.sign(user.toJSON(), secret)
                return User.findById(user._id)
                    .select('name email userId _id activeUser partner')
                    .populate({
                        path: 'partner',
                        select: 'isSubPartner epi siteId referredBy',
                    })
                    .lean() // .populate({ path: 'activeUser', select: 'belongsTo dealTier _id' }) // not needed as we return activeUser _id from user
                    .then(async (user) => {
                        const {
                            email,
                            name,
                            userId,
                            country,
                            regDate,
                            locale,
                        } = user

                        await createUserNotification(welcome({ user, locale }))
                        // await createNewContact({
                        //     user,
                        // })
                        if (referredByPartner)
                            createAffNotification(
                                newSubPartnerRegistered({
                                    user,
                                    referredByPartner,
                                    locale,
                                })
                            )

                        req.body = {
                            ...req.body,
                            ...user,
                            token,
                        }
                        next() // calling createApplication()
                    })
                    .catch((err) => {
                        console.log(err)
                        return res.status(500).send(serverErr({ locale }))
                    })
            })
            .catch((err) => {
                console.log(err)
                return res.status(500).send(serverErr({ locale }))
            })
    }
}

async function createApplication(req, res) {
    const {
        brand,
        accountId,
        accountEmail,
        activeUser,
        locale,
        partner,
        userId,
        _id,
        email,
        name,
        upgrade, // comes from strapi form data
        token,
    } = req.body

    try {
        if (accountId) {
            // check if accountId as no accountId is provided on affiliate system so we shouldn't call it
            let applyObj = {
                brand,
                accountId,
                email: accountEmail,
                belongsTo: activeUser,
                'availableUpgrade.status': upgrade,
            }
            const newApp = new Application(applyObj)
            await Application.create(newApp)
            let _id = (
                await ActiveUser.findById(newApp.belongsTo)
                    .select('belongsTo')
                    .lean()
            ).belongsTo // get the _id of the user that activeuser belongsTo because usernotificatyions are atatched to User not ActiveUser
            if (_id) createUserNotification(hasApplied({ newApp, _id, locale }))
            // await sendEmail({
            //     // send email ( doesn't matter if belongsTo or not because it is just submitting );
            //     templateId: 1,
            //     smtpParams: {
            //         BRAND: brand,
            //         ACCOUNTID: accountId,
            //         EMAIL: email,
            //         STATUS: newApp.status,
            //     },
            //     tags: ['Application'],
            //     email: email,
            // })
        }

        return res.status(201).send(
            success1({
                token: 'jwt ' + token,
                user: {
                    activeUser,
                    email,
                    name,
                    partner,
                    userId,
                    _id,
                },
                locale,
            })
        ) // send user or something as well
    } catch (error) {
        console.log(error)
        return res.status(500).send(serverErr({ locale }))
    }
}
// /common/auth/validate-account-Id
// router.post('/validate-account-Id', validateAccountId)
// async function validateAccountId(req, res) {
//     const { accountId } = req.body
//     let existsOne = await Application.countDocuments({ accountId })
//         .select('accountId')
//         .lean() // check if application exists
//     let existsTwo = await AffApplication.countDocuments({ accountId })
//         .select('accountId')
//         .lean() // check if affapplication exists
//     if (existsOne > 0 || existsTwo > 0) {
//         return res.status(400).send(err7({ accountId, locale }))
//     } else return res.status(200)
// }

// /common/auth/user-login
router.post('/user-login', (req, res) => {
    User.findOne({ email: req.body.email })
        .select('password')
        .then((user) => {
            if (!user) return res.status(401).send({ msg: 'User not found' })
            else {
                user.checkPassword(req.body.password, function (err, isMatch) {
                    if (isMatch && !err) {
                        const token = jwt.sign(user.toJSON(), secret)
                        return User.findById(user._id)
                            .select('name email userId _id activeUser partner')
                            .populate({
                                path: 'partner',
                                select: 'isSubPartner epi siteId referredBy',
                            })
                            .lean()
                            .then((user) =>
                                res
                                    .status(200)
                                    .send({ user, token: 'jwt ' + token })
                            ) // we need to include jwt + token rather than just send token on it's on because passport authenticates by looking for jwt in the middleware)
                    } else return res.status(401).send({ msg: 'Authentication failed. Incorrect password' })
                })
            }
        })
        .catch((err) =>
            res
                .status(500)
                .send({ msg: 'Server error: Please contact support' })
        )
})

// /common/auth/forgot-password
router.post('/forgot-password', (req, res) => {
    User.findOne({ email: req.body.email })
        .lean()
        .select('_id')
        .then((user) => {
            if (!user)
                return res.status(401).send({
                    msg: `No account exists with email address ${req.body.email}`,
                })
            return Promise.all([user, crypto.randomBytes(20)]).then(
                ([user, buffer]) => {
                    const token = buffer.toString('hex')
                    return Promise.all([
                        token,
                        User.findByIdAndUpdate(
                            user._id,
                            {
                                resetPasswordToken: token,
                                resetPasswordExpires: Date.now() + 86400000,
                            },
                            { upsert: true, new: true }
                        ).lean(),
                    ])
                        .then(([token, user]) => {
                            // send email /reset-password?token=' + token;
                            sendEmail({
                                // send email ( doesn't matter if belongsTo or not because it is just submitting );
                                templateId: 12,
                                smtpParams: {
                                    TOKEN: `${token}`,
                                },
                                tags: ['Auth'],
                                email: user.email,
                            })
                            return res.status(201).send({
                                msg: 'Kindly check your email for further instructions',
                                _id: user._id,
                                token,
                            }) // sending _id for testing purposes
                        })
                        .catch((err) =>
                            res.status(500).send({
                                msg: 'Server error: Please contact support',
                            })
                        )
                }
            )
        })
        .catch((err) =>
            res
                .status(500)
                .send({ msg: 'Server error: Please contact support' })
        )
})

// /common/auth/reset-password
router.post('/reset-password', (req, res) => {
    User.findOne({
        resetPasswordToken: req.body.token,
        resetPasswordExpires: {
            $gt: Date.now(),
        },
    })
        .lean()
        .select('_id')
        .then((user) => {
            if (!user)
                return res.status(401).send({
                    msg: 'Password reset token is invalid or has expired',
                })
            return bcrypt
                .hash(req.body.password, 10)
                .then((hash) => {
                    User.findByIdAndUpdate(
                        user._id,
                        {
                            password: hash,
                            resetPasswordExpires: null,
                            resetPasswordToken: null,
                        },
                        { new: true }
                    )
                        .then((user) =>
                            res.status(201).send({
                                msg: 'Password successfully reset. Please login',
                                user,
                            })
                        )
                        .catch((err) =>
                            res.status(500).send({
                                msg: 'Server error: Please contact support',
                            })
                        )
                })
                .catch((err) =>
                    res
                        .status(500)
                        .send({ msg: 'Server error: Please contact support' })
                )
        })
})

// const resetPassword = async () => {
//     console.log('called');
//     return bcrypt.hash('abcdef', 10)
//     .then(hash => {
//         User.findOneAndUpdate({ email: 'lucybandy1993@gmail.com' }, { password: hash }, { new: true })
//         .then(user => {
//             console.log('updatedUser: ', user);
//         })
//     })
// };

// resetPassword();

// /common/auth/google-login - test using ngrok by cd /usr/local/bin > ./ngrok http 3000 > get url > enter in google developers console
router
    .route('/google-login') // Login to google using support@ewalletbooster.com and go to https://console.developers.google.com/apis/credentials?folder=&organizationId=&project=ewalletbooster-login
    .post(
        passport.authenticate('google-token', {
            session: false,
        }),
        async (req, res, next) => {
            if (!req.user) return res.send(401, 'User not authenticated')
            req.auth = { id: req.user.id }
            await createUserNotification(welcomeSocial(req.user))
            next()
        },
        generateToken,
        sendToken
    )

// /common/auth/facebook-login
router
    .route('/facebook-login') // Go to https://developers.facebook.com/apps/298620334131060/fb-login/settings/ and remember to check callback URI's - /common/auth or /oauth ?
    .post(
        passport.authenticate('facebook-token', {
            session: false,
        }),
        async (req, res, next) => {
            if (!req.user) return res.send(401, 'User not authenticated')
            req.auth = { id: req.user.id }
            await createUserNotification(welcomeSocial(req.user))
            next()
        },
        generateToken,
        sendToken
    )

// /common/auth/client-ids
router.get('/client-ids', (req, res) => {
    return res.status(200).send({ RECAPTCHA_KEY, GOOGLE_CLIENT_ID, FB_APP_ID })
})

// /common/auth/verify-recaptcha
router.post('/verify-recaptcha', (req, res) => {
    // https://www.google.com/recaptcha/admin/site/343237064 using mckennapaul27@gmail.com
    return axios
        .post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${req.body['g-recaptcha-response']}`
        )
        .then((google) => res.status(200).send(google.data.success))
        .catch((err) => {
            return res
                .status(500)
                .send({ msg: 'Server error: Please contact support' })
        })
})

// /common/auth/player-registration-postback
router.post('/player-registration-postback', (req, res) => {
    User.findOne({
        resetPasswordToken: req.body.token,
        resetPasswordExpires: {
            $gt: Date.now(),
        },
    })
        .lean()
        .select('_id')
        .then((user) => {
            if (!user)
                return res.status(401).send({
                    msg: 'Password reset token is invalid or has expired',
                })
            return bcrypt
                .hash(req.body.password, 10)
                .then((hash) => {
                    User.findByIdAndUpdate(
                        user._id,
                        {
                            password: hash,
                            resetPasswordExpires: null,
                            resetPasswordToken: null,
                        },
                        { new: true }
                    )
                        .then((user) =>
                            res.status(201).send({
                                msg: 'Password successfully reset. Please login',
                                user,
                            })
                        )
                        .catch((err) =>
                            res.status(500).send({
                                msg: 'Server error: Please contact support',
                            })
                        )
                })
                .catch((err) =>
                    res
                        .status(500)
                        .send({ msg: 'Server error: Please contact support' })
                )
        })
})

module.exports = router
