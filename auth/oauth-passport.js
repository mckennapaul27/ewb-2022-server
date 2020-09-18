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
       clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    function (accessToken, refreshToken, profile, done) {
        User.upsertGoogleUser(accessToken, refreshToken, profile, function (err, user) {
            return done(err, user);
        });
    }));
    // facebook
    passport.use(new FacebookTokenStrategy({
        clientID: process.env.FB_APP_ID,
        clientSecret: process.env.FB_APP_SECRET,
        callbackURL: process.env.FB_CALLBACK
    },
    function (accessToken, refreshToken, profile, done) {
            User.upsertFbUser(accessToken, refreshToken, profile, function (err, user) {
            return done(err, user);
        });
    }));
};

