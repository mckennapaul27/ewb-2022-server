'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const passport = require('passport');

const User = require('../models/common/User');
const FacebookTokenStrategy = require('passport-facebook-token');
const GoogleTokenStrategy = require('passport-google-token').Strategy;

module.exports = function () {
    // google
    passport.use(new GoogleTokenStrategy({
       clientID: process.env.GOOGLE_CLIENT_ID,
       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
       passReqToCallback: true // passing in extra params
    }, async function (req, accessToken, refreshToken, profile, done) {

        const { referredByUser } = req.body;

        const referredBy = referredByUser ? (await User.findOne({ userId: referredByUser }).select('userId').lean()).userId : null; // referred by userId
        const referredByActiveUser = referredByUser ? (await User.findOne({ userId: referredByUser }).select('activeUser').lean()).activeUser : null; // referred by activeuser _id
        
        User.upsertGoogleUser(referredBy, referredByActiveUser, accessToken, refreshToken, profile, function (err, user) {
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

        const { referredByUser } = req.body;

        const referredBy = referredByUser ? (await User.findOne({ userId: referredByUser }).select('userId').lean()).userId : null;
        const referredByActiveUser = referredByUser ? (await User.findOne({ userId: referredByUser }).select('activeUser').lean()).activeUser : null;

        User.upsertFbUser(referredBy, referredByActiveUser, accessToken, refreshToken, profile, function (err, user) {
            return done(err, user);
        });
    }));
};

