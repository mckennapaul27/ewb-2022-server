"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var passport = require('passport');

require('../../auth/admin-passport')(passport);

var express = require('express');

var router = express.Router();

var fs = require('fs');

var path = require('path');

var csv = require('csv-parser');

var crypto = require('crypto');

var dayjs = require('dayjs');

var advancedFormat = require('dayjs/plugin/advancedFormat');

dayjs.extend(advancedFormat);

var _require = require('../../utils/token.utils'),
    getToken = _require.getToken;

var _require2 = require('../../queries/paysafe-account-report'),
    fetchAccountReport = _require2.fetchAccountReport;

var _require3 = require('../../queries/paysafe-player-registrations-report'),
    fetchPlayerRegistrationsReport = _require3.fetchPlayerRegistrationsReport;

var _require4 = require('../../queries/paysafe-acid-report'),
    fetchACIDReport = _require4.fetchACIDReport;

var _require5 = require('../../models/affiliate/index'),
    AffPartner = _require5.AffPartner,
    AffReport = _require5.AffReport,
    AffApplication = _require5.AffApplication,
    AffPayment = _require5.AffPayment,
    AffAccount = _require5.AffAccount,
    AffReportMonthly = _require5.AffReportMonthly,
    AffSubReport = _require5.AffSubReport,
    AffNotification = _require5.AffNotification;

var _require6 = require('../../models/personal/index'),
    Application = _require6.Application,
    ActiveUser = _require6.ActiveUser;

var _require7 = require('../../models/common/index'),
    User = _require7.User;

var _require8 = require('../../utils/account-functions'),
    createAccountReport = _require8.createAccountReport,
    createAffAccAffReport = _require8.createAffAccAffReport;

var _require9 = require('../../utils/notifications-list'),
    applicationYY = _require9.applicationYY,
    applicationYN = _require9.applicationYN,
    applicationNN = _require9.applicationNN;

var _require10 = require('../../utils/notifications-functions'),
    createUserNotification = _require10.createUserNotification,
    createAffNotification = _require10.createAffNotification;

var _require11 = require('../../queries/ecopayz-account-report'),
    uploadAffReports = _require11.uploadAffReports;

var _require12 = require('../../utils/sib-helpers'),
    sendEmail = _require12.sendEmail;

var _require13 = require('../../models/common'),
    Brand = _require13.Brand,
    Allow = _require13.Allow;

var _require14 = require('../../utils/sib-transactional-templates'),
    sibApplicationYY = _require14.sibApplicationYY,
    sibApplicationYN = _require14.sibApplicationYN,
    sibApplicationNN = _require14.sibApplicationNN; // POST /admin/api/call-daily-functions


router.post('/call-daily-functions', passport.authenticate('admin', {
  session: false
}), function _callee(req, res) {
  var token, _req$body, brand, month, date, fetchUrl, callFunction, url;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context.next = 17;
            break;
          }

          _req$body = req.body, brand = _req$body.brand, month = _req$body.month, date = _req$body.date, fetchUrl = _req$body.fetchUrl, callFunction = _req$body.callFunction;
          url = fetchUrl;
          _context.prev = 4;
          if (callFunction === 'ACR') fetchAccountReport({
            brand: brand,
            month: month,
            date: date,
            url: url
          });
          if (callFunction === 'PRR') fetchPlayerRegistrationsReport({
            brand: brand,
            month: month,
            date: date,
            url: url
          });
          if (callFunction === 'ACI') fetchACIDReport({
            brand: brand,
            url: url
          });
          return _context.abrupt("return", res.status(200).send({
            msg: 'Successfully called API'
          }));

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](4);
          console.log(_context.t0);
          return _context.abrupt("return", res.status(400).send({
            msg: 'Error calling API'
          }));

        case 15:
          _context.next = 18;
          break;

        case 17:
          return _context.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[4, 11]]);
}); // POST /admin/api/fetch-applications-csv

router.post('/fetch-applications-csv', passport.authenticate('admin', {
  session: false
}), function _callee2(req, res) {
  var token, sort, query, affApplications, dashApplications, applications;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context2.next = 20;
            break;
          }

          sort = req.body.sort;
          query = {
            $or: [{
              status: 'Pending'
            }, {
              upgradeStatus: {
                $regex: /.*Requested.*/
              }
            }]
          };
          _context2.prev = 4;
          _context2.next = 7;
          return regeneratorRuntime.awrap(AffApplication.find(query).sort(sort));

        case 7:
          affApplications = _context2.sent;
          _context2.next = 10;
          return regeneratorRuntime.awrap(Application.find(query).sort(sort));

        case 10:
          dashApplications = _context2.sent;
          applications = [].concat(_toConsumableArray(affApplications), _toConsumableArray(dashApplications));
          return _context2.abrupt("return", res.status(200).send({
            applications: applications
          }));

        case 15:
          _context2.prev = 15;
          _context2.t0 = _context2["catch"](4);
          return _context2.abrupt("return", res.status(400).send(_context2.t0));

        case 18:
          _context2.next = 21;
          break;

        case 20:
          return _context2.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 21:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[4, 15]]);
}); // POST /admin/api/add-notification

router.post('/add-notification', passport.authenticate('admin', {
  session: false
}), function _callee3(req, res) {
  var token, _req$body2, isGeneral, type, message;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context3.next = 14;
            break;
          }

          _req$body2 = req.body, isGeneral = _req$body2.isGeneral, type = _req$body2.type, message = _req$body2.message;
          _context3.prev = 3;
          _context3.next = 6;
          return regeneratorRuntime.awrap(AffNotification.create({
            isGeneral: isGeneral,
            message: message,
            type: type
          }));

        case 6:
          return _context3.abrupt("return", res.status(200).send({
            msg: 'Successfully added notification'
          }));

        case 9:
          _context3.prev = 9;
          _context3.t0 = _context3["catch"](3);
          return _context3.abrupt("return", res.status(400).send(err));

        case 12:
          _context3.next = 15;
          break;

        case 14:
          return _context3.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 15:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[3, 9]]);
}); // POST /admin/api/upload-application-results

router.post('/upload-application-results', passport.authenticate('admin', {
  session: false
}), function _callee5(req, res) {
  var token, transactionFile, fileName;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context5.next = 7;
            break;
          }

          transactionFile = req.files.file;
          fileName = path.join(__dirname, '../../csv/application-results.csv');
          transactionFile.mv(fileName, function (err) {
            if (err) return res.status(500).send(err);
            var applicationData = [];
            var inputStream = fs.createReadStream(fileName, 'utf8');
            inputStream.pipe(csv(['accountId', 'Tagged', 'Upgraded'])) // set headers manually
            .on('data', function (data) {
              return applicationData.push(data);
            }).on('end', function () {
              applicationData = applicationData.reduce(function (acc, item) {
                return acc.some(function (a) {
                  return a.accountId === item.accountId;
                }) ? acc : (acc.push(item), acc);
              }, []); // remove duplicates - have to put second return of acc inside brackets (acc.push(item), acc) otherwise it will not return acc

              applicationData.map(function _callee4(app) {
                var today, update, workOutAction, action, existingAffApplication, existingDashApplication, aa, brand, belongsTo, accountId, partner, _ref, locale, _ref2, initialUpgrade, ab, _brand, _belongsTo, _accountId, email, currency, availableUpgrade, activeUser;

                return regeneratorRuntime.async(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        today = dayjs().format('DD/MM/YYYY');
                        update = {
                          status: app.Tagged === 'Y' ? 'Approved' : 'Declined',
                          upgradeStatus: app.Upgraded === 'Y' ? "Upgraded ".concat(today) : app.Tagged === 'Y' && app.Upgraded === 'N' ? "Not verified ".concat(today) : "Declined ".concat(today),
                          'availableUpgrade.valid': app.Upgraded === 'Y' ? false : app.Tagged === 'N' ? false : true
                        };
                        if (app.Upgraded === 'Y' || app.Tagged === 'N') update['availableUpgrade.status'] = '-';

                        workOutAction = function workOutAction(tagged, upgraded) {
                          return tagged === 'Y' && upgraded === 'Y' ? 'YY' : tagged === 'Y' && upgraded === 'N' ? 'YN' : 'NN';
                        };

                        action = workOutAction(app.Tagged, app.Upgraded);
                        _context4.prev = 5;
                        _context4.next = 8;
                        return regeneratorRuntime.awrap(AffApplication.findOne({
                          accountId: app.accountId
                        }).select('accountId brand').lean());

                      case 8:
                        existingAffApplication = _context4.sent;
                        _context4.next = 11;
                        return regeneratorRuntime.awrap(Application.findOne({
                          accountId: app.accountId
                        }).select('accountId brand').lean());

                      case 11:
                        existingDashApplication = _context4.sent;

                        if (!existingAffApplication) {
                          _context4.next = 51;
                          break;
                        }

                        // AFFILIATE APPLICATIONS
                        // THIS SECTION BELOW IS TO BE USED WHILST WE HAVE NO VIP UPGRADE - UPDATING UPDATE OBJECT TO Confirmed instead of Upgraded.
                        if (existingAffApplication.brand === 'Skrill') update['upgradeStatus'] = "Confirmed ".concat(today); // THIS SECTION BELOW IS TO BE USED WHILST WE HAVE NO VIP UPGRADE- UPDATING UPDATE OBJECT TO Confirmed instead of Upgraded.

                        _context4.next = 16;
                        return regeneratorRuntime.awrap(AffApplication.findByIdAndUpdate(existingAffApplication._id, update, {
                          "new": true
                        }));

                      case 16:
                        aa = _context4.sent;
                        brand = aa.brand, belongsTo = aa.belongsTo, accountId = aa.accountId; // deconstruct updated application

                        _context4.next = 20;
                        return regeneratorRuntime.awrap(AffPartner.findById(belongsTo).select('email belongsTo').lean());

                      case 20:
                        partner = _context4.sent;
                        _context4.next = 23;
                        return regeneratorRuntime.awrap(User.findById(partner.belongsTo).select('locale').lean());

                      case 23:
                        _ref = _context4.sent;
                        locale = _ref.locale;

                        if (!(action === 'YY')) {
                          _context4.next = 35;
                          break;
                        }

                        // template 65 needs params.OFFER
                        createAffNotification(applicationYY({
                          brand: brand,
                          accountId: accountId,
                          belongsTo: belongsTo,
                          locale: locale
                        }));
                        _context4.next = 29;
                        return regeneratorRuntime.awrap(Brand.findOne({
                          brand: brand
                        }).select('initialUpgrade').lean());

                      case 29:
                        _ref2 = _context4.sent;
                        initialUpgrade = _ref2.initialUpgrade;
                        _context4.next = 33;
                        return regeneratorRuntime.awrap(sendEmail({
                          templateId: 65,
                          smtpParams: {
                            BRAND: brand,
                            ACCOUNTID: accountId,
                            EMAIL: '-',
                            CURRENCY: '-',
                            OFFER: initialUpgrade
                          },
                          tags: ['Application'],
                          email: partner.email
                        }));

                      case 33:
                        _context4.next = 48;
                        break;

                      case 35:
                        if (!(action === 'YN')) {
                          _context4.next = 41;
                          break;
                        }

                        createAffNotification(applicationYN({
                          brand: brand,
                          accountId: accountId,
                          belongsTo: belongsTo,
                          locale: locale
                        }));
                        _context4.next = 39;
                        return regeneratorRuntime.awrap(sendEmail({
                          templateId: 2,
                          smtpParams: {
                            BRAND: brand,
                            ACCOUNTID: accountId,
                            EMAIL: '-',
                            CURRENCY: '-'
                          },
                          tags: ['Application'],
                          email: partner.email
                        }));

                      case 39:
                        _context4.next = 48;
                        break;

                      case 41:
                        if (!(action === 'NN')) {
                          _context4.next = 47;
                          break;
                        }

                        createAffNotification(applicationNN({
                          brand: brand,
                          accountId: accountId,
                          belongsTo: belongsTo,
                          locale: locale
                        })); // Do not send email as covering NN below

                        _context4.next = 45;
                        return regeneratorRuntime.awrap(sendEmail({
                          templateId: 3,
                          smtpParams: {
                            BRAND: brand,
                            ACCOUNTID: accountId,
                            EMAIL: '-'
                          },
                          tags: ['Application'],
                          email: partner.email
                        }));

                      case 45:
                        _context4.next = 48;
                        break;

                      case 47:
                        null;

                      case 48:
                        if (!(action === 'YY' || action === 'YN')) {
                          _context4.next = 51;
                          break;
                        }

                        _context4.next = 51;
                        return regeneratorRuntime.awrap(createAffAccAffReport({
                          accountId: accountId,
                          brand: brand,
                          belongsTo: belongsTo
                        }));

                      case 51:
                        if (!existingDashApplication) {
                          _context4.next = 80;
                          break;
                        }

                        // PERSONAL APPLICATIONS
                        // THIS SECTION BELOW IS TO BE USED WHILST WE HAVE NO VIP UPGRADE - UPDATING UPDATE OBJECT TO Confirmed instead of Upgraded.
                        if (existingDashApplication.brand === 'Skrill') update['upgradeStatus'] = "Confirmed ".concat(today); // THIS SECTION BELOW IS TO BE USED WHILST WE HAVE NO VIP UPGRADE- UPDATING UPDATE OBJECT TO Confirmed instead of Upgraded.

                        _context4.next = 55;
                        return regeneratorRuntime.awrap(Application.findByIdAndUpdate(existingDashApplication._id, update));

                      case 55:
                        ab = _context4.sent;
                        _brand = ab.brand, _belongsTo = ab.belongsTo, _accountId = ab.accountId, email = ab.email, currency = ab.currency, availableUpgrade = ab.availableUpgrade; // deconstruct updated application

                        _context4.next = 59;
                        return regeneratorRuntime.awrap(ActiveUser.findById(_belongsTo).select('belongsTo').populate({
                          path: 'belongsTo',
                          select: 'locale'
                        }).lean());

                      case 59:
                        activeUser = _context4.sent;

                        if (!(activeUser && activeUser.belongsTo)) {
                          _context4.next = 74;
                          break;
                        }

                        if (!(action === 'YY')) {
                          _context4.next = 67;
                          break;
                        }

                        createUserNotification(applicationYY({
                          brand: _brand,
                          accountId: _accountId,
                          belongsTo: activeUser.belongsTo,
                          locale: activeUser.belongsTo.locale
                        }));
                        _context4.next = 65;
                        return regeneratorRuntime.awrap(sendEmail(sibApplicationYY({
                          locale: activeUser.belongsTo.locale,
                          smtpParams: {
                            BRAND: _brand,
                            ACCOUNTID: _accountId,
                            EMAIL: email,
                            OFFER: availableUpgrade.status
                          },
                          email: activeUser.email
                        })));

                      case 65:
                        _context4.next = 74;
                        break;

                      case 67:
                        if (!(action === 'YN')) {
                          _context4.next = 73;
                          break;
                        }

                        createUserNotification(applicationYN({
                          brand: _brand,
                          accountId: _accountId,
                          belongsTo: activeUser.belongsTo,
                          locale: activeUser.belongsTo.locale
                        }));
                        _context4.next = 71;
                        return regeneratorRuntime.awrap(sendEmail(sibApplicationYN({
                          locale: aciveUser.belongsTo.locale,
                          smtpParams: {
                            BRAND: _brand,
                            ACCOUNTID: _accountId,
                            EMAIL: email,
                            OFFER: availableUpgrade.status
                          },
                          email: activeUser.email
                        })));

                      case 71:
                        _context4.next = 74;
                        break;

                      case 73:
                        if (action === 'NN') {
                          createUserNotification(applicationNN({
                            brand: _brand,
                            accountId: _accountId,
                            belongsTo: activeUser.belongsTo,
                            locale: activeUser.belongsTo.locale
                          })); // Do not send email as covering NN below
                        } else null;

                      case 74:
                        if (!(action === 'NN')) {
                          _context4.next = 77;
                          break;
                        }

                        _context4.next = 77;
                        return regeneratorRuntime.awrap(sendEmail(sibApplicationNN({
                          locale: aciveUser.belongsTo.locale,
                          smtpParams: {
                            BRAND: _brand,
                            ACCOUNTID: _accountId,
                            EMAIL: email,
                            OFFER: availableUpgrade.status
                          },
                          email: activeUser.email
                        })));

                      case 77:
                        if (!((action === 'YY' || action === 'YN') && _belongsTo)) {
                          _context4.next = 80;
                          break;
                        }

                        _context4.next = 80;
                        return regeneratorRuntime.awrap(createAccountReport({
                          accountId: _accountId,
                          brand: _brand,
                          belongsTo: _belongsTo
                        }));

                      case 80:
                        _context4.next = 86;
                        break;

                      case 82:
                        _context4.prev = 82;
                        _context4.t0 = _context4["catch"](5);
                        console.log(_context4.t0);
                        return _context4.abrupt("return", _context4.t0);

                      case 86:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, null, null, [[5, 82]]);
              });
              return res.status(201).send({
                msg: 'Successfully updated applications'
              });
            });
          });
          _context5.next = 8;
          break;

        case 7:
          return _context5.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 8:
        case "end":
          return _context5.stop();
      }
    }
  });
}); // POST /admin/api/upload-reports - uploading applications using CSV

router.post('/upload-reports', passport.authenticate('admin', {
  session: false
}), uploadAffReports); // POST /admin/api/toggle-allowed

router.post('/toggle-allowed', passport.authenticate('admin', {
  session: false
}), function _callee6(req, res) {
  var allowed;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return regeneratorRuntime.awrap(Allow.findByIdAndUpdate('1', {
            status: req.body.allowed
          }));

        case 3:
          allowed = _context6.sent;
          return _context6.abrupt("return", res.status(201).send(allowed));

        case 7:
          _context6.prev = 7;
          _context6.t0 = _context6["catch"](0);
          return _context6.abrupt("return", res.status(400).send(err));

        case 10:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // GET /admin/api/get-allowed

router.get('/get-allowed', passport.authenticate('admin', {
  session: false
}), function _callee7(req, res) {
  var allowed;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return regeneratorRuntime.awrap(Allow.findById('1'));

        case 3:
          allowed = _context7.sent;
          return _context7.abrupt("return", res.status(201).send(allowed));

        case 7:
          _context7.prev = 7;
          _context7.t0 = _context7["catch"](0);
          return _context7.abrupt("return", res.status(400).send(err));

        case 10:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 7]]);
});
module.exports = router;