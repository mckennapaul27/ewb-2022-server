"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _asyncIterator(iterable) { var method; if (typeof Symbol !== "undefined") { if (Symbol.asyncIterator) { method = iterable[Symbol.asyncIterator]; if (method != null) return method.call(iterable); } if (Symbol.iterator) { method = iterable[Symbol.iterator]; if (method != null) return method.call(iterable); } } throw new TypeError("Object is not async iterable"); }

var express = require('express');

var router = express.Router();

var passport = require('passport');

require('../../auth/passport')(passport);

var mongoose = require('mongoose');

var _require = require('../../utils/token.utils'),
    getToken = _require.getToken;

var _require2 = require('../../models/common/index'),
    User = _require2.User,
    Notification = _require2.Notification;

var _require3 = require('../../models/personal'),
    ActiveUser = _require3.ActiveUser,
    Payment = _require3.Payment,
    Report = _require3.Report;

var _require4 = require('../../utils/notifications-functions'),
    createUserNotification = _require4.createUserNotification;

var _require5 = require('../../utils/sib-helpers'),
    sendEmail = _require5.sendEmail;

var _require6 = require('../../utils/error-messages'),
    serverErr = _require6.serverErr; // /personal/active-user/get-active-user/:_id


router.get('/get-active-user/:_id', passport.authenticate('jwt', {
  session: false
}), function (req, res) {
  var token = getToken(req.headers);

  if (token) {
    ActiveUser.findById(req.params._id).select('stats paymentDetails').lean().then(function (activeUser) {
      return res.status(200).send(activeUser);
    })["catch"](function () {
      return res.status(500).send({
        msg: 'Server error: Please contact support'
      });
    });
  } else return res.status(403).send({
    msg: 'Unauthorised'
  });
}); // /personal/active-user/get-active-user-balance-brand/:_id/:brand

router.get('/get-active-user-balances-brand/:_id/:brand', passport.authenticate('jwt', {
  session: false
}), function _callee(req, res) {
  var token, balance;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context.next = 15;
            break;
          }

          _context.prev = 2;
          _context.next = 5;
          return regeneratorRuntime.awrap(ActiveUser.findById(req.params._id).select('balances'));

        case 5:
          _context.t0 = function (a) {
            return a.brand === req.params.brand;
          };

          balance = _context.sent.balances.find(_context.t0);
          return _context.abrupt("return", res.status(200).send(balance));

        case 10:
          _context.prev = 10;
          _context.t1 = _context["catch"](2);
          return _context.abrupt("return", res.status(500).send(serverErr({
            locale: 'en'
          })));

        case 13:
          _context.next = 16;
          break;

        case 15:
          return _context.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 16:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[2, 10]]);
}); // /personal/active-user/update-payment-details/:_id

router.post('/update-payment-details/:_id', passport.authenticate('jwt', {
  session: false
}), function _callee2(req, res) {
  var token, update, activeUser;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context2.next = 15;
            break;
          }

          update = req.body; // doing it this way so we can submit anything to it to update and therefore provide less routes

          _context2.prev = 3;
          _context2.next = 6;
          return regeneratorRuntime.awrap(ActiveUser.findByIdAndUpdate(req.params._id, update, {
            "new": true,
            select: req.body.select
          }).populate({
            path: 'belongsTo',
            select: 'email'
          }));

        case 6:
          activeUser = _context2.sent;
          return _context2.abrupt("return", res.status(200).send(activeUser));

        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](3);
          return _context2.abrupt("return", res.status(400).send({
            success: false
          }));

        case 13:
          _context2.next = 16;
          break;

        case 15:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 16:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[3, 10]]);
}); // /personal/active-user/fetch-deal-data/:_id

router.post('/fetch-deal-data/:_id', passport.authenticate('jwt', {
  session: false
}), function (req, res) {
  var token = getToken(req.headers);

  if (token) {
    var _req$body = req.body,
        month = _req$body.month,
        brand = _req$body.brand;
    console.log(req.body, req.params, 'hi');
    Promise.all([ActiveUser.findById(req.params._id).select('deals _id').lean(), Report.aggregate([// including month and brand in query
    {
      $match: {
        $and: [{
          belongsToActiveUser: mongoose.Types.ObjectId(req.params._id)
        }, {
          month: month
        }, {
          brand: brand
        }]
      }
    }, {
      $project: {
        'account.transValue': 1
      }
    }, // selected values to return 1 = true, 0 = false
    {
      $group: {
        _id: null,
        transValue: {
          $sum: '$account.transValue'
        }
      }
    }]), ActiveUser.find({
      referredBy: req.params._id
    }).select('_id').lean() // get all partners that have BEEN referredBy this activeuser
    .then(function (subUsers) {
      return subUsers.reduce(function _callee3(total, nextSubUser) {
        var acc, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, report;

        return regeneratorRuntime.async(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return regeneratorRuntime.awrap(total);

              case 2:
                acc = _context3.sent;
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _context3.prev = 5;
                _iterator = _asyncIterator(Report.find({
                  belongsToActiveUser: nextSubUser._id,
                  brand: brand,
                  month: month,
                  'account.transValue': {
                    $gt: 0
                  }
                }).select('account.transValue').lean());

              case 7:
                _context3.next = 9;
                return regeneratorRuntime.awrap(_iterator.next());

              case 9:
                _step = _context3.sent;
                _iteratorNormalCompletion = _step.done;
                _context3.next = 13;
                return regeneratorRuntime.awrap(_step.value);

              case 13:
                _value = _context3.sent;

                if (_iteratorNormalCompletion) {
                  _context3.next = 20;
                  break;
                }

                report = _value;
                acc += report.account.transValue;

              case 17:
                _iteratorNormalCompletion = true;
                _context3.next = 7;
                break;

              case 20:
                _context3.next = 26;
                break;

              case 22:
                _context3.prev = 22;
                _context3.t0 = _context3["catch"](5);
                _didIteratorError = true;
                _iteratorError = _context3.t0;

              case 26:
                _context3.prev = 26;
                _context3.prev = 27;

                if (!(!_iteratorNormalCompletion && _iterator["return"] != null)) {
                  _context3.next = 31;
                  break;
                }

                _context3.next = 31;
                return regeneratorRuntime.awrap(_iterator["return"]());

              case 31:
                _context3.prev = 31;

                if (!_didIteratorError) {
                  _context3.next = 34;
                  break;
                }

                throw _iteratorError;

              case 34:
                return _context3.finish(31);

              case 35:
                return _context3.finish(26);

              case 36:
                return _context3.abrupt("return", acc);

              case 37:
              case "end":
                return _context3.stop();
            }
          }
        }, null, null, [[5, 22, 26, 36], [27,, 31, 35]]);
      }, Promise.resolve(0));
    })]).then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 3),
          activeUser = _ref2[0],
          myVol = _ref2[1],
          mySubVol = _ref2[2];

      var isValid = function isValid(arr, value) {
        return arr.length > 0 ? arr[0][value] : 0;
      }; // used when _id = null | arr is the aggregate result | value is either cashback or commission


      var transValue = isValid(myVol, 'transValue');
      var deal = activeUser.deals.find(function (d) {
        return d.brand === req.body.brand;
      }).rates;
      var achievedRate = deal.reduce(function (acc, d) {
        return transValue >= d.minVol && transValue <= d.maxVol ? acc += d.cashback : acc;
      }, 0);
      var percentage = (deal.map(function (t) {
        return t.cashback;
      }).indexOf(achievedRate) + 1) / deal.length;
      achievedRate = achievedRate * 100;
      percentage = percentage * 100;
      var level = deal.find(function (d) {
        return d.cashback * 100 === achievedRate;
      }) ? deal.find(function (d) {
        return d.cashback * 100 === achievedRate;
      }).level : 1;
      console.log(deal, achievedRate, percentage, transValue, mySubVol, level);
      return res.status(200).send({
        deal: deal,
        achievedRate: achievedRate,
        percentage: percentage,
        myVol: transValue,
        mySubVol: mySubVol,
        level: level
      });
    })["catch"](function (err) {
      console.log(err);
      return res.status(500).send({
        msg: 'Server error: Please contact support'
      });
    });
  } else return res.status(403).send({
    msg: 'Unauthorised'
  });
});
module.exports = router;