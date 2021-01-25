
const passport = require('passport');
require('../../auth/admin-passport')(passport);

const secret = process.env.SECRET_KEY;

const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const Admin = require('../../models/admin/Admin')
const { getToken } = require('../../utils/token.utils')

// POST /admin/auth/register
router.post('/register', async (req, res, next) => {
    try {
        const admin = await Admin.create({ name: req.body.name, username: req.body.username, email: req.body.email, password: req.body.password });
        const token = await jwt.sign(admin.toJSON(), secret);
        return res.status(201).send({ admin, token: 'jwt' + token, msg: 'You have successfully registered.' });
    } catch (err) {
        return res.status(500).send({ msg: 'Server error: Please contact support' })
    }
});

// POST /admin/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const admin = await Admin.findOne({ username: req.body.username }).select('password')
        if (!admin) return res.status(401).send({ msg: 'Admin not found' });
        else {
            admin.checkPassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    const token = jwt.sign(admin.toJSON(), secret);
                    return res.status(200).send({ admin, token: 'jwt ' + token });              
                } else return res.status(401).send({ msg: 'Authentication failed. Incorrect password' });
            })
        }
    } catch (err) {
        return res.status(500).send({ msg: 'Server error: Please contact support' })
    }
});





module.exports = router;
