"use strict";

var proxy = process.env.QUOTAGUARDSTATIC_URL;

var util = require('util');

var request = require('superagent');

require('superagent-proxy')(request);

var parseString = require('xml2js').parseString;

var parseStringPromise = util.promisify(parseString);

var _require = require('../config/deals'),
    setCurrency = _require.setCurrency;

var _require2 = require('../models/affiliate/index'),
    AffAccount = _require2.AffAccount,
    AffReport = _require2.AffReport,
    AffApplication = _require2.AffApplication,
    AffPartner = _require2.AffPartner;

var fetchPlayerRegistrationsReport = function fetchPlayerRegistrationsReport(_ref) {
  var brand = _ref.brand,
      month = _ref.month,
      date = _ref.date,
      url = _ref.url;
  console.log('here: ', brand, month, date, url);

  (function _callee() {
    var res;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return regeneratorRuntime.awrap(request.get(url).proxy(proxy));

          case 3:
            res = _context.sent;
            checkData(res.text, brand, month, date, url);
            _context.next = 11;
            break;

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);
            console.log(_context.t0);
            return _context.abrupt("return", _context.t0);

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, null, null, [[0, 7]]);
  })();
};

var checkData = function checkData(res, brand, month, date, url) {
  var reports, data;
  return regeneratorRuntime.async(function checkData$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(parseStringPromise(res));

        case 3:
          reports = _context2.sent;

          if (reports['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['reportresponse']) {
            _context2.next = 10;
            break;
          }

          if (!(reports['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['SOAP-ENV:Fault'][0].faultstring[0] === 'no permission 1' || reports['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['SOAP-ENV:Fault'][0].faultstring[0] === 'no permission 2')) {
            _context2.next = 9;
            break;
          }

          throw new Error('Permission denied');

        case 9:
          throw new Error('No reports');

        case 10:
          data = reports['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0].reportresponse[0].row;
          return _context2.abrupt("return", mapRawData(data, brand, month, date));

        case 14:
          _context2.prev = 14;
          _context2.t0 = _context2["catch"](0);
          console.log(_context2.t0);
          if (_context2.t0.message === 'Permission denied') setTimeout(function () {
            fetchPlayerRegistrationsReport({
              brand: brand,
              month: month,
              date: date,
              url: url
            }); // need to add fetchData parameters if it fails api fetch
          }, 500);

        case 18:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 14]]);
};

var mapRawData = function mapRawData(data, brand, month, date) {
  var results;
  return regeneratorRuntime.async(function mapRawData$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          results = data.reduce(function (acc, item) {
            // all VK accounts must have vk-
            var isValidSiteId = item.affcustomid[0].includes('vk-');

            if (isValidSiteId) {
              acc.push({
                currency: setCurrency(brand),
                memberId: item.memberid[0],
                siteId: item.siteid[0],
                playerId: item.playerid[0],
                accountId: item.Merchplayername[0],
                epi: null,
                country: item.playercountry[0] === '' ? '' : item.playercountry[0],
                commission: 0,
                cashback: 0,
                transValue: 0,
                deposits: 0,
                subAffCommission: 0,
                earnedFee: 0,
                cashbackRate: 0,
                commissionRate: 0,
                profit: 0
              });
            }

            return acc;
          }, []);
          return _context3.abrupt("return", mapPlayerRegistrations(results, brand, month, date));

        case 2:
        case "end":
          return _context3.stop();
      }
    }
  });
};

var mapPlayerRegistrations = function mapPlayerRegistrations(results, brand, month, date) {
  return regeneratorRuntime.async(function mapPlayerRegistrations$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(results.map(function _callee2(a) {
            var currency, memberId, siteId, playerId, accountId, country, transValue, commission, deposits, cashback, subAffCommission, profit, earnedFee, cashbackRate, commissionRate, defaultSiteIds, existingAccount, application, newAccount, newReport, partner, _newAccount, _newReport;

            return regeneratorRuntime.async(function _callee2$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    currency = a.currency, memberId = a.memberId, siteId = a.siteId, playerId = a.playerId, accountId = a.accountId, country = a.country, transValue = a.transValue, commission = a.commission, deposits = a.deposits, cashback = a.cashback, subAffCommission = a.subAffCommission, profit = a.profit, earnedFee = a.earnedFee, cashbackRate = a.cashbackRate, commissionRate = a.commissionRate; // console.log(siteId);

                    defaultSiteIds = ['75417', '75418', '40278', '56'];
                    _context4.prev = 2;
                    _context4.next = 5;
                    return regeneratorRuntime.awrap(AffAccount.exists({
                      accountId: accountId
                    }));

                  case 5:
                    existingAccount = _context4.sent;
                    _context4.next = 8;
                    return regeneratorRuntime.awrap(AffApplication.findOne({
                      accountId: accountId
                    }).select('accountId belongsTo').lean());

                  case 8:
                    application = _context4.sent;

                    if (!(!existingAccount && application)) {
                      _context4.next = 25;
                      break;
                    }

                    _context4.next = 12;
                    return regeneratorRuntime.awrap(AffAccount.create({
                      // create new account
                      brand: brand,
                      belongsTo: application.belongsTo,
                      accountId: accountId,
                      country: country
                    }));

                  case 12:
                    newAccount = _context4.sent;
                    _context4.next = 15;
                    return regeneratorRuntime.awrap(AffReport.create({
                      // create new report
                      date: date,
                      month: month,
                      brand: brand,
                      siteId: siteId,
                      memberId: memberId,
                      playerId: playerId,
                      country: country,
                      belongsTo: newAccount._id,
                      belongsToPartner: newAccount.belongsTo,
                      account: {
                        accountId: accountId,
                        deposits: deposits,
                        transValue: transValue,
                        commission: commission,
                        commissionRate: commissionRate,
                        earnedFee: earnedFee,
                        currency: currency,
                        cashbackRate: cashbackRate,
                        cashback: cashback,
                        subAffCommission: subAffCommission,
                        profit: profit
                      }
                    }));

                  case 15:
                    newReport = _context4.sent;
                    newAccount.reports.push(newReport); // Push new report to reports array

                    _context4.next = 19;
                    return regeneratorRuntime.awrap(newAccount.save());

                  case 19:
                    _context4.next = 21;
                    return regeneratorRuntime.awrap(AffApplication.findByIdAndUpdate(application._id, {
                      siteId: siteId
                    }));

                  case 21:
                    _context4.next = 23;
                    return regeneratorRuntime.awrap(AffPartner.findByIdAndUpdate(newAccount.belongsTo, {
                      $push: {
                        accounts: newAccount
                      }
                    }, {
                      select: 'accounts',
                      "new": true
                    }));

                  case 23:
                    _context4.next = 49;
                    break;

                  case 25:
                    if (!(!existingAccount && !application && !defaultSiteIds.includes(siteId))) {
                      _context4.next = 48;
                      break;
                    }

                    _context4.next = 28;
                    return regeneratorRuntime.awrap(AffPartner.findOne({
                      brandAssets: {
                        $elemMatch: {
                          brand: brand,
                          siteId: siteId
                        }
                      }
                    }).select('_id'));

                  case 28:
                    partner = _context4.sent;

                    if (!partner) {
                      _context4.next = 45;
                      break;
                    }

                    _context4.next = 32;
                    return regeneratorRuntime.awrap(AffAccount.create({
                      // create new account
                      brand: brand,
                      belongsTo: partner._id,
                      accountId: accountId,
                      country: country
                    }));

                  case 32:
                    _newAccount = _context4.sent;
                    _context4.next = 35;
                    return regeneratorRuntime.awrap(AffReport.create({
                      // create new report
                      date: date,
                      month: month,
                      brand: brand,
                      siteId: siteId,
                      memberId: memberId,
                      playerId: playerId,
                      country: country,
                      belongsTo: _newAccount._id,
                      belongsToPartner: _newAccount.belongsTo,
                      account: {
                        accountId: accountId,
                        deposits: deposits,
                        transValue: transValue,
                        commission: commission,
                        commissionRate: commissionRate,
                        earnedFee: earnedFee,
                        currency: currency,
                        cashbackRate: cashbackRate,
                        cashback: cashback,
                        subAffCommission: subAffCommission,
                        profit: profit
                      }
                    }));

                  case 35:
                    _newReport = _context4.sent;

                    _newAccount.reports.push(_newReport); // Push new report to reports array


                    _context4.next = 39;
                    return regeneratorRuntime.awrap(_newAccount.save());

                  case 39:
                    _context4.next = 41;
                    return regeneratorRuntime.awrap(AffApplication.create({
                      brand: brand,
                      accountId: accountId,
                      belongsTo: partner._id,
                      siteId: siteId
                    }));

                  case 41:
                    _context4.next = 43;
                    return regeneratorRuntime.awrap(AffPartner.findByIdAndUpdate(_newAccount.belongsTo, {
                      $push: {
                        accounts: _newAccount
                      }
                    }, {
                      select: 'accounts',
                      "new": true
                    }));

                  case 43:
                    _context4.next = 46;
                    break;

                  case 45:
                    return _context4.abrupt("return");

                  case 46:
                    _context4.next = 49;
                    break;

                  case 48:
                    return _context4.abrupt("return");

                  case 49:
                    _context4.next = 54;
                    break;

                  case 51:
                    _context4.prev = 51;
                    _context4.t0 = _context4["catch"](2);
                    return _context4.abrupt("return", _context4.t0);

                  case 54:
                  case "end":
                    return _context4.stop();
                }
              }
            }, null, null, [[2, 51]]);
          }));

        case 2:
        case "end":
          return _context5.stop();
      }
    }
  });
};

module.exports = {
  fetchPlayerRegistrationsReport: fetchPlayerRegistrationsReport
}; // https://stackoverflow.com/questions/31978347/fs-writefile-in-a-promise-asynchronous-synchronous-stuff