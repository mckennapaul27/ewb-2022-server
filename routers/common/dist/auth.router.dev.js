"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var secret = process.env.SECRET_KEY;
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var FB_APP_ID = process.env.FB_APP_ID;
var RECAPTCHA_KEY = process.env.RECAPTCHA_KEY;
var RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;

var express = require('express');

var router = express.Router();

var passport = require('passport');

require('../../auth/passport')(passport);

var jwt = require('jsonwebtoken');

var crypto = require('crypto');

var bcrypt = require('bcrypt');

var axios = require('axios');

var _require = require('../../models/common/index'),
    User = _require.User;

var _require2 = require('../../models/affiliate/index'),
    AffPartner = _require2.AffPartner,
    AffApplication = _require2.AffApplication;

var _require3 = require('../../utils/notifications-functions'),
    createUserNotification = _require3.createUserNotification,
    createAffNotification = _require3.createAffNotification;

var _require4 = require('../../utils/notifications-list'),
    welcome = _require4.welcome,
    newSubPartnerRegistered = _require4.newSubPartnerRegistered,
    hasApplied = _require4.hasApplied,
    linksRequested = _require4.linksRequested;

var _require5 = require('../../utils/sib-helpers'),
    sendEmail = _require5.sendEmail,
    createNewContact = _require5.createNewContact;

var _require6 = require('../../models/personal'),
    Application = _require6.Application,
    ActiveUser = _require6.ActiveUser;

var _require7 = require('../../utils/error-messages'),
    err5 = _require7.err5,
    serverErr = _require7.serverErr,
    err6 = _require7.err6,
    err1 = _require7.err1,
    err2 = _require7.err2,
    err3 = _require7.err3,
    err4 = _require7.err4,
    err7 = _require7.err7,
    errNoAccountExists = _require7.errNoAccountExists,
    errInvalidToken = _require7.errInvalidToken;

var _require8 = require('../../utils/success-messages'),
    msgRegistered = _require8.msgRegistered,
    msgForgotPassword = _require8.msgForgotPassword,
    msgPasswordReset = _require8.msgPasswordReset;

var dayjs = require('dayjs');

var _require9 = require('../../utils/admin-job-functions'),
    createAdminJob = _require9.createAdminJob;

var _require10 = require('../../utils/sib-transactional-templates'),
    sibRequestLinks = _require10.sibRequestLinks,
    sibPersonalApplicationSubmit = _require10.sibPersonalApplicationSubmit,
    sibForgotPassword = _require10.sibForgotPassword; // /common/auth/create-new-user - THIS IS UP-TO-DATE 1/3/22


router.post('/create-new-user', createUser, createApplication);

function createUser(req, res, next) {
  var _req$body, name, email, password, country, locale, referredByUser, networkCode, accountId, links, exists, existsOne, existsTwo, _ref, activeUser, userId, referredByPartner;

  return regeneratorRuntime.async(function createUser$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          // THIS IS UP-TO-DATE 1/3/22
          _req$body = req.body, name = _req$body.name, email = _req$body.email, password = _req$body.password, country = _req$body.country, locale = _req$body.locale, referredByUser = _req$body.referredByUser, networkCode = _req$body.networkCode, accountId = _req$body.accountId, links = _req$body.links; // referredByPartner here is the network code such as 566

          _context3.next = 3;
          return regeneratorRuntime.awrap(User.countDocuments({
            email: req.body.email
          }).select('email').lean());

        case 3:
          exists = _context3.sent;

          if (name) {
            _context3.next = 8;
            break;
          }

          return _context3.abrupt("return", res.status(500).send(err1({
            locale: locale
          })));

        case 8:
          if (email) {
            _context3.next = 12;
            break;
          }

          return _context3.abrupt("return", res.status(500).send(err2({
            locale: locale
          })));

        case 12:
          if (password) {
            _context3.next = 16;
            break;
          }

          return _context3.abrupt("return", res.status(500).send(err3({
            locale: locale
          })));

        case 16:
          if (country) {
            _context3.next = 20;
            break;
          }

          return _context3.abrupt("return", res.status(500).send(err4({
            locale: locale
          })));

        case 20:
          if (locale) {
            _context3.next = 24;
            break;
          }

          return _context3.abrupt("return", res.status(500).send(err5({
            locale: locale
          })));

        case 24:
          if (!(exists > 0)) {
            _context3.next = 28;
            break;
          }

          return _context3.abrupt("return", res.status(400).send(err6({
            locale: locale,
            email: email
          })));

        case 28:
          _context3.next = 30;
          return regeneratorRuntime.awrap(Application.countDocuments({
            accountId: accountId
          }).select('accountId').lean());

        case 30:
          existsOne = _context3.sent;
          _context3.next = 33;
          return regeneratorRuntime.awrap(AffApplication.countDocuments({
            accountId: accountId
          }).select('accountId').lean());

        case 33:
          existsTwo = _context3.sent;

          if (!(accountId && (existsOne > 0 || existsTwo > 0))) {
            _context3.next = 36;
            break;
          }

          return _context3.abrupt("return", res.status(400).send(err7({
            accountId: accountId,
            locale: locale
          })));

        case 36:
          if (!referredByUser) {
            _context3.next = 42;
            break;
          }

          _context3.next = 39;
          return regeneratorRuntime.awrap(User.findOne({
            userId: referredByUser
          }).select('userId activeUser').lean());

        case 39:
          _context3.t0 = _context3.sent;
          _context3.next = 43;
          break;

        case 42:
          _context3.t0 = {
            userId: undefined,
            activeUser: undefined
          };

        case 43:
          _ref = _context3.t0;
          activeUser = _ref.activeUser;
          userId = _ref.userId;

          if (!networkCode) {
            _context3.next = 52;
            break;
          }

          _context3.next = 49;
          return regeneratorRuntime.awrap(AffPartner.findOne({
            epi: networkCode
          }).select('_id').lean());

        case 49:
          _context3.t1 = _context3.sent;
          _context3.next = 53;
          break;

        case 52:
          _context3.t1 = undefined;

        case 53:
          referredByPartner = _context3.t1;
          return _context3.abrupt("return", User.create({
            name: name,
            email: email,
            password: password,
            country: country,
            locale: locale,
            referredBy: userId,
            referredByActiveUser: activeUser,
            referredByPartner: referredByPartner
          }).then(function _callee2(user) {
            var brandAssets, partner, token;
            return regeneratorRuntime.async(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    if (!(links.length > 0)) {
                      _context2.next = 6;
                      break;
                    }

                    // once user is created, check if links were requested and then set them to brand assets
                    brandAssets = links.reduce(function (acc, brand) {
                      var requested = "Requested - ".concat(dayjs().format('DD MMM YYYY'));
                      acc.push({
                        brand: brand,
                        link: requested,
                        siteId: requested
                      });
                      createAffNotification( // THIS IS UP-TO-DATE 1/3/22
                      linksRequested({
                        locale: locale,
                        brand: brand,
                        belongsTo: user.partner
                      }));
                      sendEmail( // THIS IS UP-TO-DATE 1/3/22
                      sibRequestLinks({
                        locale: locale,
                        smtpParams: {
                          BRAND: brand
                        },
                        email: user.email
                      }));
                      return acc;
                    }, []);
                    _context2.next = 4;
                    return regeneratorRuntime.awrap(AffPartner.findByIdAndUpdate(user.partner, {
                      brandAssets: brandAssets
                    }, {
                      "new": true,
                      select: 'brandAssets email epi'
                    }));

                  case 4:
                    partner = _context2.sent;
                    createAdminJob({
                      // THIS IS UP-TO-DATE 1/3/22
                      message: "Partner ".concat(partner.email, " / ").concat(partner.epi, " has requested  links"),
                      status: 'Pending',
                      partner: partner._id,
                      type: 'Links'
                    });

                  case 6:
                    token = jwt.sign(user.toJSON(), secret);
                    return _context2.abrupt("return", User.findById(user._id).select('name email userId _id activeUser partner locale regDate country').populate({
                      path: 'partner',
                      select: 'isSubPartner epi siteId referredBy'
                    }).lean() // .populate({ path: 'activeUser', select: 'belongsTo dealTier _id' }) // not needed as we return activeUser _id from user
                    .then(function _callee(user) {
                      return regeneratorRuntime.async(function _callee$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              _context.next = 2;
                              return regeneratorRuntime.awrap(createUserNotification(welcome({
                                user: user,
                                locale: locale
                              })));

                            case 2:
                              _context.next = 4;
                              return regeneratorRuntime.awrap(createNewContact({
                                // THIS IS UP-TO-DATE 1/3/22
                                user: user
                              }));

                            case 4:
                              if (referredByPartner) createAffNotification( // THIS IS UP-TO-DATE 1/3/22
                              newSubPartnerRegistered({
                                user: user,
                                referredByPartner: referredByPartner,
                                locale: locale
                              }));
                              req.body = _objectSpread({}, req.body, {}, user, {
                                token: token
                              });
                              next(); // calling createApplication()

                            case 7:
                            case "end":
                              return _context.stop();
                          }
                        }
                      });
                    })["catch"](function (err) {
                      console.log(err);
                      return res.status(500).send(serverErr({
                        locale: locale
                      }));
                    }));

                  case 8:
                  case "end":
                    return _context2.stop();
                }
              }
            });
          })["catch"](function (err) {
            console.log(err);
            return res.status(500).send(serverErr({
              locale: locale
            }));
          }));

        case 55:
        case "end":
          return _context3.stop();
      }
    }
  });
}

function createApplication(req, res) {
  var _req$body2, brand, accountId, accountEmail, activeUser, locale, partner, userId, _id, email, name, upgrade, token, applyObj, newApp, _id2;

  return regeneratorRuntime.async(function createApplication$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          // THIS IS UP-TO-DATE 1/3/22
          _req$body2 = req.body, brand = _req$body2.brand, accountId = _req$body2.accountId, accountEmail = _req$body2.accountEmail, activeUser = _req$body2.activeUser, locale = _req$body2.locale, partner = _req$body2.partner, userId = _req$body2.userId, _id = _req$body2._id, email = _req$body2.email, name = _req$body2.name, upgrade = _req$body2.upgrade, token = _req$body2.token;
          _context4.prev = 1;

          if (!accountId) {
            _context4.next = 13;
            break;
          }

          // check if accountId as no accountId is provided on affiliate system so we shouldn't call it
          applyObj = {
            brand: brand,
            accountId: accountId,
            email: accountEmail,
            belongsTo: activeUser,
            'availableUpgrade.status': upgrade
          };
          newApp = new Application(applyObj);
          _context4.next = 7;
          return regeneratorRuntime.awrap(Application.create(newApp));

        case 7:
          _context4.next = 9;
          return regeneratorRuntime.awrap(ActiveUser.findById(newApp.belongsTo).select('belongsTo').lean());

        case 9:
          _id2 = _context4.sent.belongsTo;
          // get the _id of the user that activeuser belongsTo because usernotificatyions are atatched to User not ActiveUser
          if (_id2) createUserNotification(hasApplied({
            accountId: newApp.accountId,
            _id: _id2,
            locale: locale
          }));
          _context4.next = 13;
          return regeneratorRuntime.awrap(sendEmail( // THIS IS UP-TO-DATE 1/3/22
          sibPersonalApplicationSubmit({
            locale: locale,
            smtpParams: {
              BRAND: brand,
              ACCOUNTID: accountId,
              EMAIL: email,
              STATUS: newApp.status
            },
            email: email
          })));

        case 13:
          return _context4.abrupt("return", res.status(201).send(msgRegistered({
            token: 'jwt ' + token,
            user: {
              activeUser: activeUser,
              email: email,
              name: name,
              partner: partner,
              userId: userId,
              _id: _id
            },
            locale: locale
          })));

        case 16:
          _context4.prev = 16;
          _context4.t0 = _context4["catch"](1);
          console.log(_context4.t0);
          return _context4.abrupt("return", res.status(500).send(serverErr({
            locale: locale
          })));

        case 20:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[1, 16]]);
} // /common/auth/user-login - THIS IS UP-TO-DATE 2/3/22


router.post('/user-login', function (req, res) {
  User.findOne({
    email: req.body.email
  }).select('password').then(function (user) {
    if (!user) return res.status(401).send({
      msg: 'User not found'
    });else {
      user.checkPassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          var token = jwt.sign(user.toJSON(), secret);
          return User.findById(user._id).select('name email userId _id activeUser partner').populate({
            path: 'partner',
            select: 'isSubPartner epi siteId referredBy'
          }).lean().then(function (user) {
            return res.status(200).send({
              user: user,
              token: 'jwt ' + token
            });
          }); // we need to include jwt + token rather than just send token on it's on because passport authenticates by looking for jwt in the middleware)
        } else return res.status(401).send({
          msg: 'Authentication failed. Incorrect password'
        });
      });
    }
  })["catch"](function (err) {
    return res.status(500).send({
      msg: 'Server error: Please contact support'
    });
  });
}); // /common/auth/forgot-password - THIS IS UP-TO-DATE 2/3/22

router.post('/forgot-password', function (req, res) {
  // THIS IS UP-TO-DATE 1/3/22
  User.findOne({
    email: req.body.email
  }).lean().select('_id').then(function (user) {
    if (!user) return res.status(401).send(errNoAccountExists({
      locale: req.body.locale,
      email: req.body.email
    }));
    return Promise.all([user, crypto.randomBytes(20)]).then(function (_ref2) {
      var _ref3 = _slicedToArray(_ref2, 2),
          user = _ref3[0],
          buffer = _ref3[1];

      var token = buffer.toString('hex');
      return Promise.all([token, User.findByIdAndUpdate(user._id, {
        resetPasswordToken: token,
        resetPasswordExpires: Date.now() + 86400000
      }, {
        upsert: true,
        "new": true
      }).lean()]).then(function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 2),
            token = _ref5[0],
            user = _ref5[1];

        // send email /reset-password?token=' + token;
        sendEmail(sibForgotPassword({
          locale: user.locale,
          smtpParams: {
            TOKEN: "".concat(token)
          },
          email: user.email
        }));
        return res.status(201).send(msgForgotPassword({
          locale: user.locale,
          token: token
        }));
      })["catch"](function (err) {
        return res.status(500).send(serverErr({
          locale: user.locale
        }));
      });
    });
  })["catch"](function (err) {
    return res.status(500).send({
      msg: 'Server error: Please contact support'
    });
  });
}); // /common/auth/reset-password - THIS IS UP-TO-DATE 2/3/22

router.post('/reset-password', function (req, res) {
  User.findOne({
    resetPasswordToken: req.body.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }).lean().select('_id').then(function (user) {
    if (!user) return res.status(401).send(errInvalidToken({
      locale: req.body.locale
    }));
    return bcrypt.hash(req.body.password, 10).then(function (hash) {
      User.findByIdAndUpdate(user._id, {
        password: hash,
        resetPasswordExpires: null,
        resetPasswordToken: null
      }, {
        "new": true
      }).then(function (user) {
        return res.status(201).send(msgPasswordReset({
          locale: req.body.locale,
          user: user
        }));
      })["catch"](function (err) {
        return res.status(500).send(serverErr({
          locale: req.body.locale
        }));
      });
    })["catch"](function (err) {
      return res.status(500).send(serverErr({
        locale: req.body.locale
      }));
    });
  });
}); // /common/auth/client-ids

router.get('/client-ids', function (req, res) {
  return res.status(200).send({
    RECAPTCHA_KEY: RECAPTCHA_KEY,
    GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID,
    FB_APP_ID: FB_APP_ID
  });
}); // /common/auth/verify-recaptcha

router.post('/verify-recaptcha', function (req, res) {
  // https://www.google.com/recaptcha/admin/site/343237064 using mckennapaul27@gmail.com
  return axios.post("https://www.google.com/recaptcha/api/siteverify?secret=".concat(RECAPTCHA_SECRET, "&response=").concat(req.body['g-recaptcha-response'])).then(function (google) {
    return res.status(200).send(google.data.success);
  })["catch"](function (err) {
    return res.status(500).send({
      msg: 'Server error: Please contact support'
    });
  });
}); // /common/auth/player-registration-postback

router.post('/player-registration-postback', function (req, res) {
  User.findOne({
    resetPasswordToken: req.body.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }).lean().select('_id').then(function (user) {
    if (!user) return res.status(401).send({
      msg: 'Password reset token is invalid or has expired'
    });
    return bcrypt.hash(req.body.password, 10).then(function (hash) {
      User.findByIdAndUpdate(user._id, {
        password: hash,
        resetPasswordExpires: null,
        resetPasswordToken: null
      }, {
        "new": true
      }).then(function (user) {
        return res.status(201).send({
          msg: 'Password successfully reset. Please login',
          user: user
        });
      })["catch"](function (err) {
        return res.status(500).send({
          msg: 'Server error: Please contact support'
        });
      });
    })["catch"](function (err) {
      return res.status(500).send({
        msg: 'Server error: Please contact support'
      });
    });
  });
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