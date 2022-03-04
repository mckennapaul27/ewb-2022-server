"use strict";

var express = require('express');

var _require = require('../../utils/error-messages'),
    serverErr = _require.serverErr;

var _require2 = require('../../utils/sib-helpers'),
    sendEmail = _require2.sendEmail;

var _require3 = require('../../utils/sib-transactional-templates'),
    sibSupportSubmitted = _require3.sibSupportSubmitted;

var _require4 = require('../../utils/success-messages'),
    msgSupportSubmitted = _require4.msgSupportSubmitted;

var router = express.Router(); // /common/support/submit-ticket - THIS IS UP-TO-DATE 1/3/22

router.post('/submit-ticket', function _callee(req, res) {
  var _req$body, locale, name, email, subject, message;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, locale = _req$body.locale, name = _req$body.name, email = _req$body.email, subject = _req$body.subject, message = _req$body.message;
          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap(sendEmail(sibSupportSubmitted({
            locale: locale,
            email: email,
            smtpParams: {
              NAME: name,
              EMAIL: email,
              SUBJECT: subject,
              MESSAGE: message
            }
          })));

        case 4:
          _context.next = 6;
          return regeneratorRuntime.awrap(sendEmail({
            templateId: 144,
            smtpParams: {
              NAME: name,
              EMAIL: email,
              SUBJECT: subject,
              MESSAGE: message
            },
            tags: ['Admin'],
            email: 'support@ewalletbooster.com' // need to change this as soft bouncing in SIB

          }));

        case 6:
          return _context.abrupt("return", res.status(201).send(msgSupportSubmitted({
            locale: locale
          })));

        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](1);
          return _context.abrupt("return", res.status(500).send(serverErr({
            locale: locale
          })));

        case 12:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 9]]);
}); // /common/support/player-registration-postback

router.post('/player-registration-postback', function (req, res) {
  try {
    console.log(req.body);
    console.log(req.params);
    res.status(200).send({
      msg: 'Successfully posted data'
    });
  } catch (error) {
    res.status(500).send({
      msg: 'Error: Please contact support'
    });
  }
}); // /common/auth/validate-account-Id
// router.post('/validate-account-Id', validateAccountId)
// async function validateAccountId(req, res) {
//     const { accountId } = req.body
//     let existsOne = await Application.countDocuments({ accountId })
//         .select('accountId')
//         .lean() // check if application exists
//     let existsTwo = await AffApplication.countDocuments({ accountId })
//         .select('accountId')
//         .lean() // check if affapplication exists
//     if (existsOne > 0 || existsTwo > 0) {
//         return res.status(400).send(err7({ accountId, locale }))
//     } else return res.status(200)
// }

module.exports = router;