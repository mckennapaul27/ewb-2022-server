const aJwtStrategy = require('passport-jwt').Strategy,
aExtractJwt = require('passport-jwt').ExtractJwt;
const Admin = require('../models/Admin');
const secret = process.env.SECRET_KEY;

module.exports = function(apassport) {
    const opts = {};
    opts.jwtFromRequest = aExtractJwt.fromAuthHeaderWithScheme('jwt');   
    opts.secretOrKey = secret;
    apassport.use('admin', new aJwtStrategy(opts, function (jwt_payload, done) {
        Admin.findById(jwt_payload._id, function (err, user) {            
            if (err) {                
                return done(err, false);
            } else if (user) {  
                // when we return done(null, user) this adds the user details to the req object and we can access it in the controller in req.user          
                done(null, user);
            } else {
                done(null, false);
            }
         });
    }));
};
