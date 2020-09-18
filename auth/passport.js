const JwtStrategy = require('passport-jwt').Strategy,
ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/common/User');
const secret = process.env.SECRET_KEY;

module.exports = function(passport) {
    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt'); 
    opts.secretOrKey = secret;
    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
        User.findById(jwt_payload._id, function (err, user) {            
            if (err) return done(err, false);
            else if (user) done(null, user); // when we return done(null, user) this adds the user details to the req object and we can access it in the controller in req.user 
            else done(null, false);
         });
    }));
};

