'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const passport = require('passport');

const User = require('../models/common/User');
const AffPartner = require('../models/affiliate/AffPartner');

const FacebookTokenStrategy = require('passport-facebook-token');
const GoogleTokenStrategy = require('passport-google-token').Strategy;

module.exports = function () {
    // google
    passport.use(new GoogleTokenStrategy({
       clientID: process.env.GOOGLE_CLIENT_ID,
       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
       passReqToCallback: true // passing in extra params
    }, async function (req, accessToken, refreshToken, profile, done) {

        const { referredByUser, networkCode } = req.body;
        const { activeUser, userId } = referredByUser ? (await User.findOne({ userId: referredByUser }).select('userId activeUser').lean()) : { userId: null, activeUser: null  }; // using default object values otherwise it is impossible to destructure { activeUser, userId }
        const referredByPartner = networkCode ? await AffPartner.findOne({ epi: networkCode }).select('_id').lean() : undefined;

        User.upsertGoogleUser(userId, activeUser, referredByPartner, accessToken, refreshToken, profile, function (err, user) {
            return done(err, user);
        });
    }));

    // facebook
    passport.use(new FacebookTokenStrategy({
        clientID: process.env.FB_APP_ID,
        clientSecret: process.env.FB_APP_SECRET,
        callbackURL: process.env.FB_CALLBACK,
        passReqToCallback: true // passing in extra params
    }, async function (req, accessToken, refreshToken, profile, done) {

        const { referredByUser, networkCode } = req.body;
        const { activeUser, userId } = referredByUser ? (await User.findOne({ userId: referredByUser }).select('userId activeUser').lean()) : { userId: null, activeUser: null  }; // using default object values otherwise it is impossible to destructure { activeUser, userId }
        const referredByPartner = networkCode ? await AffPartner.findOne({ epi: networkCode }).select('_id').lean() : undefined;

        User.upsertFbUser(userId, activeUser, referredByPartner, accessToken, refreshToken, profile, function (err, user) {
            return done(err, user);
        });
    }));
};

