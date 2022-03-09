"use strict";

var passport = require('passport');

require('../../auth/admin-passport')(passport);

var secret = process.env.SECRET_KEY;

var express = require('express');

var router = express.Router();

var jwt = require('jsonwebtoken');

var crypto = require('crypto');

var bcrypt = require('bcrypt');

var Admin = require('../../models/admin/Admin');

var _require = require('../../utils/token.utils'),
    getToken = _require.getToken; // POST /admin/auth/register
// router.post('/register', async (req, res, next) => {
//     try {
//         const admin = await Admin.create({ name: req.body.name, username: req.body.username, email: req.body.email, password: req.body.password });
//         const token = await jwt.sign(admin.toJSON(), secret);
//         return res.status(201).send({ admin, token: 'jwt' + token, msg: 'You have successfully registered.' });
//     } catch (err) {
//         return res.status(500).send({ msg: 'Server error: Please contact support' })
//     }
// });
// POST /admin/auth/login


router.post('/login', function _callee(req, res, next) {
  var admin;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(Admin.findOne({
            username: req.body.username
          }).select('password'));

        case 3:
          admin = _context.sent;

          if (admin) {
            _context.next = 8;
            break;
          }

          return _context.abrupt("return", res.status(401).send({
            msg: 'Admin not found'
          }));

        case 8:
          admin.checkPassword(req.body.password, function (err, isMatch) {
            if (isMatch && !err) {
              var token = jwt.sign(admin.toJSON(), secret);
              return res.status(200).send({
                admin: admin,
                token: 'jwt ' + token
              });
            } else return res.status(401).send({
              msg: 'Authentication failed. Incorrect password'
            });
          });

        case 9:
          _context.next = 14;
          break;

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](0);
          return _context.abrupt("return", res.status(500).send({
            msg: 'Server error: Please contact support'
          }));

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 11]]);
});
module.exports = router;