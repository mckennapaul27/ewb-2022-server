const jwt = require('jsonwebtoken');
const User = require('../models/common/User');
const secret = process.env.SECRET_KEY;

const getToken = (headers) => {
    if (headers && headers.authorization) {
        const parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

const createToken = function (auth) {
    return jwt.sign({
        id: auth.id
    }, secret, {
        expiresIn: 60 * 120
    });
};

module.exports = {
    getToken,
    generateToken: function (req, res, next) {
        req.token = createToken(req.auth);
        return next();
    },
    sendToken: function (req, res) {
        const token = jwt.sign(req.user.toJSON(), secret);
        res.setHeader('x-auth-token', req.token);
        return User.findById(req.user._id).select('name email userId _id').lean()
        .then(user => {
            return res.status(200).send({ token: 'jwt ' + token, user });
        })
    }
};