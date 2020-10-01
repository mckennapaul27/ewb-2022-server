const secret = process.env.SECRET_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const FB_APP_ID = process.env.FB_APP_ID;
const RECAPTCHA_KEY = process.env.RECAPTCHA_KEY;
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;

const express = require('express');
const router = express.Router();

const passport = require('passport');
require('../auth/passport')(passport);
require('../auth/oauth-passport')();

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const axios = require('axios');

const { User } = require('../models/common/index');
const { createUserNotification } = require('../utils/controller-functions');
const { generateToken, sendToken } = require('../utils/token.utils');
const { welcome, welcomeSocial } = require('../utils/notifications-list')


// /auth/create-new-user 
router.post('/create-new-user', async (req, res) => {
    let { name, email, password } = req.body;
    let exists = await User.countDocuments({ email: req.body.email }).select('email').lean() // check if user exists
    if (!name || !password || !email) return res.status(500).send({ msg: 'Missing fields. Please enter and try again' });    
    else if (exists > 0) return res.status(400).send({ msg: `${email} already exists. Please login.` })
    else {
        return User.create({
            name,
            email,
            password
        })
        .then(user => {
            const token = jwt.sign(user.toJSON(), secret);
            return User.findById(user._id).select('name email userId _id activeUser').lean()
            // .populate({ path: 'activeUser', select: 'belongsTo dealTier _id' }) // not needed as we return activeUser _id from user 
            .then(async user => {
                await createUserNotification(welcome(user))
                return res.status(201).send({ user, token: 'jwt ' + token, msg: 'You have successfully registered.' })
            })
            .catch(() => res.status(500).send({ msg: 'Server error: Please contact support' }))
        })
        .catch(() => res.status(500).send({ msg: 'Server error: Please contact support' }))
    }
});

// /auth/user-login
router.post('/user-login', (req, res) => {
    User.findOne({ email: req.body.email }).select('password')
    .then(user => {
       if (!user) return res.status(401).send({ msg: 'User not found' })
        else {
            user.checkPassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    const token = jwt.sign(user.toJSON(), secret);
                    return User.findById(user._id).select('name email userId _id').lean()
                   
                    .then(user => res.status(200).send({ user, token: 'jwt ' + token })) // we need to include jwt + token rather than just send token on it's on because passport authenticates by looking for jwt in the middleware)                    
                } else return res.status(401).send({ msg: 'Authentication failed. Incorrect password' })
            })
        }
    }).catch(() => res.status(500).send({ msg: 'Server error: Please contact support' }))
});

// /auth/forgot-password
router.post('/forgot-password', (req, res) => {
    User.findOne({ email: req.body.email }).lean().select('_id')
    .then(user => {
        if (!user) return res.status(401).send({ msg: `No account exists with email address ${req.body.email}` })
        return Promise.all([ user, crypto.randomBytes(20) ])
        .then(([user, buffer]) => {
            const token = buffer.toString('hex');
            return Promise.all([
                token,
                User.findByIdAndUpdate(user._id, {
                    resetPasswordToken: token,
                    resetPasswordExpires: Date.now() + 86400000
                }, { upsert: true, new: true }).lean().select('_id')
            ])
            .then(([ token, user ]) => {
                // send email /reset-password?token=' + token;
                return res.status(201).send({ msg: 'Kindly check your email for further instructions', _id: user._id, token }) // sending _id for testing purposes
            }).catch(() => res.status(500).send({ msg: 'Server error: Please contact support' }))
        })
    }).catch(() => res.status(500).send({ msg: 'Server error: Please contact support' }))
});

// /auth/reset-password
router.post('/reset-password', (req, res) => {
    User.findOne({ 
        resetPasswordToken: req.body.token,
        resetPasswordExpires: {
            $gt: Date.now()
    }}).lean().select('_id')
    .then(user => {
        if (!user) return res.status(401).send({ msg: 'Password reset token is invalid or has expired' })
        return bcrypt.hash(req.body.password, 10)
        .then(hash => {
            User.findByIdAndUpdate(user._id, {
                password: hash,
                resetPasswordExpires: null,
                resetPasswordToken: null
            }, { new: true })
            .then((user) => res.status(201).send({ msg: 'Password successfully reset. Please login', user }))
            .catch(() => res.status(500).send({ msg: 'Server error: Please contact support' }))
        }).catch(() => res.status(500).send({ msg: 'Server error: Please contact support' }))
    })
});

// /auth/google-login - test using ngrok by cd /usr/local/bin > ./ngrok http 3000 > get url > enter in google developers console
router.route('/google-login') // Login to google using support@ewalletbooster.com and go to https://console.developers.google.com/apis/credentials?folder=&organizationId=&project=ewalletbooster-login
.post(passport.authenticate('google-token', {
    session: false
}), async (req, res, next) => {
    if (!req.user) return res.send(401, 'User not authenticated');
    req.auth = { id: req.user.id };    
    await createUserNotification(welcomeSocial(req.user))
    next();
}, generateToken, sendToken);

// /auth/facebook-login
router.route('/facebook-login') // Go to https://developers.facebook.com/apps/298620334131060/fb-login/settings/ and remember to check callback URI's - /auth or /oauth ?
    .post(passport.authenticate('facebook-token', {
        session: false
    }), async (req, res, next) => {
        if (!req.user) return res.send(401, 'User not authenticated')
        req.auth = { id: req.user.id };
        await createUserNotification(welcomeSocial(req.user))
        next();
    }, generateToken, sendToken);

// /auth/client-ids
router.get('/client-ids', (req, res) => {
    return res.status(200).send({ RECAPTCHA_KEY, GOOGLE_CLIENT_ID, FB_APP_ID })
});

// /auth/verify-recaptcha
router.post('/verify-recaptcha', (req, res) => { // https://www.google.com/recaptcha/admin/site/343237064 using mckennapaul27@gmail.com
    return axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${req.body['g-recaptcha-response']}`)
    .then((google) => res.status(200).send(google.data.success))
    .catch(() => res.status(500).send({ msg: 'Server error: Please contact support' }))
});

module.exports = router;
