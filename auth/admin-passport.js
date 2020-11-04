const JwtStrategy = require('passport-jwt').Strategy,
ExtractJwt = require('passport-jwt').ExtractJwt;
const Admin = require('../models/admin/Admin');
const secret = process.env.SECRET_KEY;

module.exports = function(adminPassport) {
    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');   
    opts.secretOrKey = secret;
    adminPassport.use('admin', new JwtStrategy(opts, function (jwt_payload, done) {
        Admin.findById(jwt_payload._id, function (err, admin) {            
            if (err) done(err, false);
            else if (admin) done(null, admin); 
            else done(null, false);
         });
    }));
};
