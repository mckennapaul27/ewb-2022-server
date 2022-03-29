"use strict";

function _asyncIterator(iterable) { var method; if (typeof Symbol !== "undefined") { if (Symbol.asyncIterator) { method = iterable[Symbol.asyncIterator]; if (method != null) return method.call(iterable); } if (Symbol.iterator) { method = iterable[Symbol.iterator]; if (method != null) return method.call(iterable); } } throw new TypeError("Object is not async iterable"); }

var passport = require('passport');

require('../../auth/passport')(passport);

var express = require('express');

var router = express.Router();

var mongoose = require('mongoose');

var _require = require('../../utils/token.utils'),
    getToken = _require.getToken;

var _require2 = require('../../models/affiliate/index'),
    AffAccount = _require2.AffAccount,
    AffReport = _require2.AffReport,
    AffSubReport = _require2.AffSubReport,
    AffReportDaily = _require2.AffReportDaily,
    AffReportMonthly = _require2.AffReportMonthly,
    AffPartner = _require2.AffPartner,
    AffApplication = _require2.AffApplication,
    AffUpgrade = _require2.AffUpgrade,
    AffMonthlySummary = _require2.AffMonthlySummary;

var _require3 = require('../../utils/helper-functions'),
    mapRegexQueryFromObj = _require3.mapRegexQueryFromObj,
    mapQueryForAggregate = _require3.mapQueryForAggregate;

var _require4 = require('../../queries/map-aff-dashboard-data'),
    getCashbackRate = _require4.getCashbackRate,
    getVolumeByBrand = _require4.getVolumeByBrand,
    getCashBackByBrand = _require4.getCashBackByBrand;

var _require5 = require('../../models/common'),
    Quarter = _require5.Quarter; // POST /affiliate/application/create


router.post('/create', passport.authenticate('jwt', {
  session: false
}), function _callee(req, res) {
  var token, applications;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context.next = 14;
            break;
          }

          _context.prev = 2;
          _context.next = 5;
          return regeneratorRuntime.awrap(AffReport.create(req.body.applications));

        case 5:
          applications = _context.sent;
          return _context.abrupt("return", res.status(201).send(applications));

        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](2);
          return _context.abrupt("return", res.status(400).send({
            success: false
          }));

        case 12:
          _context.next = 15;
          break;

        case 14:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[2, 9]]);
}); // POST /affiliate/report/fetch-reports

router.post('/fetch-reports', passport.authenticate('jwt', {
  session: false
}), function _callee2(req, res) {
  var token, pageSize, pageIndex, _req$body, sort, query, skippage, aggregateQuery, reports, pageCount, brands, months, totals;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context2.next = 32;
            break;
          }

          pageSize = parseInt(req.query.pageSize);
          pageIndex = parseInt(req.query.pageIndex);
          _req$body = req.body, sort = _req$body.sort, query = _req$body.query;
          skippage = pageSize * pageIndex; // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table

          query = mapRegexQueryFromObj(query);
          aggregateQuery = mapQueryForAggregate(query); // have to create this for aggregation query because need to make it mongoose.Types.ObjectId

          _context2.prev = 8;
          _context2.next = 11;
          return regeneratorRuntime.awrap(AffReport.find(query).collation({
            locale: 'en',
            strength: 1
          }).sort(sort).skip(skippage).limit(pageSize));

        case 11:
          reports = _context2.sent;
          _context2.next = 14;
          return regeneratorRuntime.awrap(AffReport.countDocuments(query));

        case 14:
          pageCount = _context2.sent;
          _context2.next = 17;
          return regeneratorRuntime.awrap(AffReport.distinct('brand'));

        case 17:
          brands = _context2.sent;
          _context2.next = 20;
          return regeneratorRuntime.awrap(AffReport.distinct('month'));

        case 20:
          months = _context2.sent;
          _context2.next = 23;
          return regeneratorRuntime.awrap(AffReport.aggregate([{
            $match: {
              $and: [aggregateQuery]
            }
          }, {
            $group: {
              _id: {
                currency: '$account.currency'
              },
              cashback: {
                $sum: '$account.cashback'
              },
              volume: {
                $sum: '$account.transValue'
              },
              deposits: {
                $sum: '$account.deposits'
              }
            }
          }]));

        case 23:
          totals = _context2.sent;
          return _context2.abrupt("return", res.status(200).send({
            reports: reports,
            pageCount: pageCount,
            brands: brands,
            months: months,
            totals: totals
          }));

        case 27:
          _context2.prev = 27;
          _context2.t0 = _context2["catch"](8);
          return _context2.abrupt("return", res.status(400).send(_context2.t0));

        case 30:
          _context2.next = 33;
          break;

        case 32:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 33:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[8, 27]]);
}); // POST /affiliate/report/fetch-sub-reports

router.post('/fetch-sub-reports', passport.authenticate('jwt', {
  session: false
}), function _callee3(req, res) {
  var token, pageSize, pageIndex, _req$body2, sort, query, skippage, aggregateQuery, reports, pageCount, brands, months, totals;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context3.next = 32;
            break;
          }

          pageSize = parseInt(req.query.pageSize);
          pageIndex = parseInt(req.query.pageIndex);
          _req$body2 = req.body, sort = _req$body2.sort, query = _req$body2.query;
          skippage = pageSize * pageIndex; // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table

          query = mapRegexQueryFromObj(query);
          aggregateQuery = mapQueryForAggregate(query); // have to create this for aggregation query because need to make it mongoose.Types.ObjectId

          _context3.prev = 8;
          _context3.next = 11;
          return regeneratorRuntime.awrap(AffSubReport.find(query).collation({
            locale: 'en',
            strength: 1
          }).sort(sort).skip(skippage).limit(pageSize));

        case 11:
          reports = _context3.sent;
          _context3.next = 14;
          return regeneratorRuntime.awrap(AffSubReport.countDocuments(query));

        case 14:
          pageCount = _context3.sent;
          _context3.next = 17;
          return regeneratorRuntime.awrap(AffSubReport.distinct('brand'));

        case 17:
          brands = _context3.sent;
          _context3.next = 20;
          return regeneratorRuntime.awrap(AffSubReport.distinct('month'));

        case 20:
          months = _context3.sent;
          _context3.next = 23;
          return regeneratorRuntime.awrap(AffSubReport.aggregate([{
            $match: {
              $and: [aggregateQuery]
            }
          }, {
            $group: {
              _id: {
                currency: '$currency'
              },
              cashback: {
                $sum: '$cashback'
              },
              volume: {
                $sum: '$transValue'
              },
              deposits: {
                $sum: '$deposits'
              },
              subAffCommission: {
                $sum: '$subAffCommission'
              }
            }
          }]));

        case 23:
          totals = _context3.sent;
          return _context3.abrupt("return", res.status(200).send({
            reports: reports,
            pageCount: pageCount,
            brands: brands,
            months: months,
            totals: totals
          }));

        case 27:
          _context3.prev = 27;
          _context3.t0 = _context3["catch"](8);
          return _context3.abrupt("return", res.status(400).send(_context3.t0));

        case 30:
          _context3.next = 33;
          break;

        case 32:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 33:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[8, 27]]);
}); // POST /affiliate/report/fetch-daily-reports

router.post('/fetch-daily-reports', passport.authenticate('jwt', {
  session: false
}), function _callee4(req, res) {
  var token, _req$body3, _id, startDate, endDate, brand, reports;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context4.next = 17;
            break;
          }

          console.log('called');
          _req$body3 = req.body, _id = _req$body3._id, startDate = _req$body3.startDate, endDate = _req$body3.endDate, brand = _req$body3.brand;
          _context4.prev = 4;
          _context4.next = 7;
          return regeneratorRuntime.awrap(AffReportDaily.find({
            brand: brand,
            belongsTo: _id,
            date: {
              $gte: startDate,
              $lte: endDate
            }
          }).sort({
            date: 'asc'
          }));

        case 7:
          reports = _context4.sent;
          console.log(reports);
          return _context4.abrupt("return", res.send({
            reports: reports
          }));

        case 12:
          _context4.prev = 12;
          _context4.t0 = _context4["catch"](4);
          return _context4.abrupt("return", res.status(403).send({
            success: false,
            msg: _context4.t0
          }));

        case 15:
          _context4.next = 18;
          break;

        case 17:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 18:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[4, 12]]);
}); // POST /affiliate/report/fetch-daily-reports
// router.post(
//     '/fetch-daily-reports',
//     passport.authenticate('jwt', {
//         session: false,
//     }),
//     async (req, res) => {
//         const token = getToken(req.headers)
//         if (token) {
//             const { _id, startDate, endDate, brand } = req.body
//             try {
//                 const reports = await AffReportDaily.find({
//                     brand,
//                     belongsTo: _id,
//                     date: { $gte: startDate, $lte: endDate },
//                 }).sort({ date: 'asc' })
//                 return res.status(200).send({ reports })
//             } catch (error) {
//                 return res.status(403).send({ success: false, msg: error })
//             }
//         } else res.status(403).send({ success: false, msg: 'Unauthorised' })
//     }
// )
// POST /affiliate/report/fetch-monthly-reports

router.post('/fetch-monthly-reports', passport.authenticate('jwt', {
  session: false
}), function _callee5(req, res) {
  var token, _req$body4, _id, months, brand, reports;

  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context5.next = 15;
            break;
          }

          _req$body4 = req.body, _id = _req$body4._id, months = _req$body4.months, brand = _req$body4.brand;
          _context5.prev = 3;
          _context5.next = 6;
          return regeneratorRuntime.awrap(AffReportMonthly.find({
            belongsTo: _id,
            brand: brand
          }).where({
            month: {
              $in: months
            }
          }).sort({
            date: 'asc'
          }));

        case 6:
          reports = _context5.sent;
          return _context5.abrupt("return", res.status(200).send({
            reports: reports
          }));

        case 10:
          _context5.prev = 10;
          _context5.t0 = _context5["catch"](3);
          return _context5.abrupt("return", res.status(403).send({
            success: false,
            msg: _context5.t0
          }));

        case 13:
          _context5.next = 16;
          break;

        case 15:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 16:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[3, 10]]);
}); // POST /affiliate/report/fetch-monthly-summary

router.post('/fetch-monthly-summary', passport.authenticate('jwt', {
  session: false
}), function _callee6(req, res) {
  var token, _req$body5, _id, month, start, end, _ref, isSubPartner, nCashback, nSubCashback, sCashback, sSubCashback, data, nRegs, sRegs, nClicks, sClicks, nApplications, sApplications;

  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context6.next = 41;
            break;
          }

          _req$body5 = req.body, _id = _req$body5._id, month = _req$body5.month, start = _req$body5.start, end = _req$body5.end;
          _context6.prev = 3;
          _context6.next = 6;
          return regeneratorRuntime.awrap(AffPartner.findById(_id).select('referredBy isSubPartner subPartnerRate').lean());

        case 6:
          _ref = _context6.sent;
          isSubPartner = _ref.isSubPartner;
          _context6.next = 10;
          return regeneratorRuntime.awrap(getCashBackByBrand({
            _id: _id
          }, 'Neteller', month));

        case 10:
          nCashback = _context6.sent;
          _context6.next = 13;
          return regeneratorRuntime.awrap(getSubPartnerCashbackByBrand({
            _id: _id,
            isSubPartner: isSubPartner,
            month: month,
            brand: 'Neteller'
          }));

        case 13:
          nSubCashback = _context6.sent;
          _context6.next = 16;
          return regeneratorRuntime.awrap(getCashBackByBrand({
            _id: _id
          }, 'Skrill', month));

        case 16:
          sCashback = _context6.sent;
          _context6.next = 19;
          return regeneratorRuntime.awrap(getSubPartnerCashbackByBrand({
            _id: _id,
            isSubPartner: isSubPartner,
            month: month,
            brand: 'Skrill'
          }));

        case 19:
          sSubCashback = _context6.sent;
          _context6.next = 22;
          return regeneratorRuntime.awrap(AffReportDaily.aggregate([{
            $match: {
              $and: [{
                belongsTo: mongoose.Types.ObjectId(_id)
              }, {
                date: {
                  $gte: start,
                  $lte: end
                }
              }]
            }
          }, {
            $project: {
              clicks: 1,
              registrations: 1,
              brand: 1
            }
          }, {
            $group: {
              _id: {
                brand: '$brand'
              },
              clicks: {
                $sum: '$clicks'
              },
              registrations: {
                $sum: '$registrations'
              }
            }
          }]));

        case 22:
          data = _context6.sent;
          nRegs = data.reduce(function (acc, i) {
            return i._id.brand === 'Neteller' ? (acc += i.clicks, acc) : acc;
          }, 0);
          sRegs = data.reduce(function (acc, i) {
            return i._id.brand === 'Skrill' ? (acc += i.clicks, acc) : acc;
          }, 0);
          nClicks = data.reduce(function (acc, i) {
            return i._id.brand === 'Neteller' ? (acc += i.registrations, acc) : acc;
          }, 0);
          sClicks = data.reduce(function (acc, i) {
            return i._id.brand === 'Skrill' ? (acc += i.registrations, acc) : acc;
          }, 0);
          _context6.next = 29;
          return regeneratorRuntime.awrap(AffApplication.countDocuments({
            belongsTo: _id,
            brand: 'Neteller',
            dateAdded: {
              $gte: start,
              $lte: end
            }
          }));

        case 29:
          nApplications = _context6.sent;
          _context6.next = 32;
          return regeneratorRuntime.awrap(AffApplication.countDocuments({
            belongsTo: _id,
            brand: 'Skrill',
            dateAdded: {
              $gte: start,
              $lte: end
            }
          }));

        case 32:
          sApplications = _context6.sent;
          return _context6.abrupt("return", res.status(200).send({
            nCashback: nCashback,
            nSubCashback: nSubCashback,
            sCashback: sCashback,
            sSubCashback: sSubCashback,
            nApplications: nApplications,
            sApplications: sApplications,
            sRegs: sRegs,
            nRegs: nRegs,
            nClicks: nClicks,
            sClicks: sClicks
          }));

        case 36:
          _context6.prev = 36;
          _context6.t0 = _context6["catch"](3);
          return _context6.abrupt("return", res.status(403).send({
            success: false,
            msg: _context6.t0
          }));

        case 39:
          _context6.next = 42;
          break;

        case 41:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 42:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[3, 36]]);
}); // POST /affiliate/report/accountId/table

router.post('/accountId/table', passport.authenticate('jwt', {
  session: false
}), function _callee7(req, res) {
  var token, pageSize, pageIndex, _req$body6, sort, query, skippage, reports, pageCount;

  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context7.next = 15;
            break;
          }

          pageSize = parseInt(req.query.pageSize);
          pageIndex = parseInt(req.query.pageIndex);
          _req$body6 = req.body, sort = _req$body6.sort, query = _req$body6.query;
          skippage = pageSize * pageIndex;
          _context7.next = 8;
          return regeneratorRuntime.awrap(AffReport.find(query).collation({
            locale: 'en',
            strength: 1
          }).sort(sort).skip(skippage).limit(pageSize));

        case 8:
          reports = _context7.sent;
          _context7.next = 11;
          return regeneratorRuntime.awrap(AffReport.countDocuments(query));

        case 11:
          pageCount = _context7.sent;
          return _context7.abrupt("return", res.send({
            reports: reports,
            pageCount: pageCount
          }));

        case 15:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 16:
        case "end":
          return _context7.stop();
      }
    }
  });
}); // POST /affiliate/report/accountId/chart

router.post('/accountId/chart', passport.authenticate('jwt', {
  session: false
}), function _callee8(req, res) {
  var token, _req$body7, months, query, reports;

  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context8.next = 9;
            break;
          }

          _req$body7 = req.body, months = _req$body7.months, query = _req$body7.query;
          _context8.next = 5;
          return regeneratorRuntime.awrap(AffReport.find(query).where({
            month: {
              $in: months
            }
          }).sort({
            date: 1
          }));

        case 5:
          reports = _context8.sent;
          return _context8.abrupt("return", res.send({
            reports: reports
          }));

        case 9:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 10:
        case "end":
          return _context8.stop();
      }
    }
  });
}); // POST /affiliate/report/fetch-deal-progress

router.post('/fetch-deal-progress', passport.authenticate('jwt', {
  session: false
}), function _callee9(req, res) {
  var token, _req$body8, _id, month, brand, partner, referredBy, deals, isSubPartner, revShareActive, rate;

  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context9.next = 19;
            break;
          }

          _req$body8 = req.body, _id = _req$body8._id, month = _req$body8.month, brand = _req$body8.brand;
          _context9.prev = 3;
          _context9.next = 6;
          return regeneratorRuntime.awrap(AffPartner.findById(req.body._id).select('referredBy deals isSubPartner revShareActive').lean());

        case 6:
          partner = _context9.sent;
          referredBy = partner.referredBy, deals = partner.deals, isSubPartner = partner.isSubPartner, revShareActive = partner.revShareActive;
          _context9.next = 10;
          return regeneratorRuntime.awrap(getCashbackRate({
            _id: _id,
            referredBy: referredBy,
            deals: deals,
            isSubPartner: isSubPartner,
            brand: brand,
            month: month
          }));

        case 10:
          rate = _context9.sent;
          return _context9.abrupt("return", res.status(200).send({
            rate: rate,
            deals: deals,
            revShareActive: revShareActive
          }));

        case 14:
          _context9.prev = 14;
          _context9.t0 = _context9["catch"](3);
          return _context9.abrupt("return", res.status(403).send({
            success: false,
            msg: _context9.t0
          }));

        case 17:
          _context9.next = 20;
          break;

        case 19:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 20:
        case "end":
          return _context9.stop();
      }
    }
  }, null, null, [[3, 14]]);
}); // POST /affiliate/report/fetch-quarter-data

router.post('/fetch-quarter-data', passport.authenticate('jwt', {
  session: false
}), function _callee10(req, res) {
  var token, _req$body9, accountId, quarter, q, upgrades;

  return regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context10.next = 18;
            break;
          }

          _req$body9 = req.body, accountId = _req$body9.accountId, quarter = _req$body9.quarter;
          _context10.prev = 3;
          _context10.next = 6;
          return regeneratorRuntime.awrap(Quarter.findOne({
            accountId: accountId,
            quarter: quarter
          }));

        case 6:
          q = _context10.sent;
          _context10.next = 9;
          return regeneratorRuntime.awrap(AffUpgrade.find({
            accountId: accountId,
            quarter: quarter
          }));

        case 9:
          upgrades = _context10.sent;
          return _context10.abrupt("return", res.status(200).send({
            q: q,
            upgrades: upgrades
          }));

        case 13:
          _context10.prev = 13;
          _context10.t0 = _context10["catch"](3);
          return _context10.abrupt("return", res.status(403).send({
            success: false,
            msg: _context10.t0
          }));

        case 16:
          _context10.next = 19;
          break;

        case 18:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 19:
        case "end":
          return _context10.stop();
      }
    }
  }, null, null, [[3, 13]]);
}); // POST /affiliate/report/fetch-monthly-statement

router.post('/fetch-monthly-statement', passport.authenticate('jwt', {
  session: false
}), function _callee11(req, res) {
  var token, _req$body10, _id, month, partner, referredBy, isSubPartner, subPartnerRate, nVolume, nCashback, nSubVol, nSubCashback, nNetworkShare, sVolume, sCashback, sSubVol, sSubCashback, sNetworkShare, eVolume, eCashback, eSubVol, eSubCashback, eNetworkShare;

  return regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context11.next = 61;
            break;
          }

          _req$body10 = req.body, _id = _req$body10._id, month = _req$body10.month;
          _context11.prev = 3;
          _context11.next = 6;
          return regeneratorRuntime.awrap(AffPartner.findById(req.body._id).select('referredBy isSubPartner subPartnerRate').lean());

        case 6:
          partner = _context11.sent;
          referredBy = partner.referredBy, isSubPartner = partner.isSubPartner, subPartnerRate = partner.subPartnerRate;
          _context11.next = 10;
          return regeneratorRuntime.awrap(getVolumeByBrand({
            _id: _id
          }, 'Neteller', month));

        case 10:
          nVolume = _context11.sent;
          _context11.next = 13;
          return regeneratorRuntime.awrap(getCashBackByBrand({
            _id: _id
          }, 'Neteller', month));

        case 13:
          nCashback = _context11.sent;
          _context11.next = 16;
          return regeneratorRuntime.awrap(getSubPartnerVolumeByBrand({
            _id: _id,
            isSubPartner: isSubPartner,
            month: month,
            brand: 'Neteller'
          }));

        case 16:
          nSubVol = _context11.sent;
          _context11.next = 19;
          return regeneratorRuntime.awrap(getSubPartnerCashbackByBrand({
            _id: _id,
            isSubPartner: isSubPartner,
            month: month,
            brand: 'Neteller'
          }));

        case 19:
          nSubCashback = _context11.sent;
          _context11.next = 22;
          return regeneratorRuntime.awrap(getNetworkShareVolumeByBrand({
            referredBy: referredBy,
            month: month,
            brand: 'Neteller'
          }));

        case 22:
          nNetworkShare = _context11.sent;
          _context11.next = 25;
          return regeneratorRuntime.awrap(getVolumeByBrand({
            _id: _id
          }, 'Skrill', month));

        case 25:
          sVolume = _context11.sent;
          _context11.next = 28;
          return regeneratorRuntime.awrap(getCashBackByBrand({
            _id: _id
          }, 'Skrill', month));

        case 28:
          sCashback = _context11.sent;
          _context11.next = 31;
          return regeneratorRuntime.awrap(getSubPartnerVolumeByBrand({
            _id: _id,
            isSubPartner: isSubPartner,
            month: month,
            brand: 'Skrill'
          }));

        case 31:
          sSubVol = _context11.sent;
          _context11.next = 34;
          return regeneratorRuntime.awrap(getSubPartnerCashbackByBrand({
            _id: _id,
            isSubPartner: isSubPartner,
            month: month,
            brand: 'Skrill'
          }));

        case 34:
          sSubCashback = _context11.sent;
          _context11.next = 37;
          return regeneratorRuntime.awrap(getNetworkShareVolumeByBrand({
            referredBy: referredBy,
            month: month,
            brand: 'Skrill'
          }));

        case 37:
          sNetworkShare = _context11.sent;
          _context11.next = 40;
          return regeneratorRuntime.awrap(getVolumeByBrand({
            _id: _id
          }, 'ecoPayz', month));

        case 40:
          eVolume = _context11.sent;
          _context11.next = 43;
          return regeneratorRuntime.awrap(getCashBackByBrand({
            _id: _id
          }, 'ecoPayz', month));

        case 43:
          eCashback = _context11.sent;
          _context11.next = 46;
          return regeneratorRuntime.awrap(getSubPartnerVolumeByBrand({
            _id: _id,
            isSubPartner: isSubPartner,
            month: month,
            brand: 'ecoPayz'
          }));

        case 46:
          eSubVol = _context11.sent;
          _context11.next = 49;
          return regeneratorRuntime.awrap(getSubPartnerCashbackByBrand({
            _id: _id,
            isSubPartner: isSubPartner,
            month: month,
            brand: 'ecoPayz'
          }));

        case 49:
          eSubCashback = _context11.sent;
          _context11.next = 52;
          return regeneratorRuntime.awrap(getNetworkShareVolumeByBrand({
            referredBy: referredBy,
            month: month,
            brand: 'ecoPayz'
          }));

        case 52:
          eNetworkShare = _context11.sent;
          return _context11.abrupt("return", res.status(200).send({
            subPartnerRate: subPartnerRate,
            nVolume: nVolume,
            nCashback: nCashback,
            nSubVol: nSubVol,
            nSubCashback: nSubCashback,
            nNetworkShare: nNetworkShare,
            sVolume: sVolume,
            sCashback: sCashback,
            sSubVol: sSubVol,
            sSubCashback: sSubCashback,
            sNetworkShare: sNetworkShare,
            eVolume: eVolume,
            eCashback: eCashback,
            eSubVol: eSubVol,
            eSubCashback: eSubCashback,
            eNetworkShare: eNetworkShare
          }));

        case 56:
          _context11.prev = 56;
          _context11.t0 = _context11["catch"](3);
          return _context11.abrupt("return", res.status(403).send({
            success: false,
            msg: _context11.t0
          }));

        case 59:
          _context11.next = 62;
          break;

        case 61:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 62:
        case "end":
          return _context11.stop();
      }
    }
  }, null, null, [[3, 56]]);
});

var getSubPartnerVolumeByBrand = function getSubPartnerVolumeByBrand(_ref2) {
  var _id = _ref2._id,
      isSubPartner = _ref2.isSubPartner,
      brand = _ref2.brand,
      month = _ref2.month;

  // this is used for /affiliate/report/fetch-monthly-statement in router/affiliate/report.router.js
  if (isSubPartner) {
    return new Promise(function (resolve) {
      resolve(AffPartner.find({
        referredBy: _id
      }).select('_id').lean() // get all partners that have BEEN referredBy this partner
      .then(function (subPartners) {
        return subPartners.reduce(function _callee12(total, nextSubPartner) {
          var acc, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, report;

          return regeneratorRuntime.async(function _callee12$(_context12) {
            while (1) {
              switch (_context12.prev = _context12.next) {
                case 0:
                  _context12.next = 2;
                  return regeneratorRuntime.awrap(total);

                case 2:
                  acc = _context12.sent;
                  _iteratorNormalCompletion = true;
                  _didIteratorError = false;
                  _context12.prev = 5;
                  _iterator = _asyncIterator(AffReport.find({
                    belongsToPartner: nextSubPartner._id,
                    brand: brand,
                    month: month,
                    'account.transValue': {
                      $gt: 0
                    }
                  }).select('account.transValue').lean());

                case 7:
                  _context12.next = 9;
                  return regeneratorRuntime.awrap(_iterator.next());

                case 9:
                  _step = _context12.sent;
                  _iteratorNormalCompletion = _step.done;
                  _context12.next = 13;
                  return regeneratorRuntime.awrap(_step.value);

                case 13:
                  _value = _context12.sent;

                  if (_iteratorNormalCompletion) {
                    _context12.next = 20;
                    break;
                  }

                  report = _value;
                  acc += report.account.transValue;

                case 17:
                  _iteratorNormalCompletion = true;
                  _context12.next = 7;
                  break;

                case 20:
                  _context12.next = 26;
                  break;

                case 22:
                  _context12.prev = 22;
                  _context12.t0 = _context12["catch"](5);
                  _didIteratorError = true;
                  _iteratorError = _context12.t0;

                case 26:
                  _context12.prev = 26;
                  _context12.prev = 27;

                  if (!(!_iteratorNormalCompletion && _iterator["return"] != null)) {
                    _context12.next = 31;
                    break;
                  }

                  _context12.next = 31;
                  return regeneratorRuntime.awrap(_iterator["return"]());

                case 31:
                  _context12.prev = 31;

                  if (!_didIteratorError) {
                    _context12.next = 34;
                    break;
                  }

                  throw _iteratorError;

                case 34:
                  return _context12.finish(31);

                case 35:
                  return _context12.finish(26);

                case 36:
                  return _context12.abrupt("return", acc);

                case 37:
                case "end":
                  return _context12.stop();
              }
            }
          }, null, null, [[5, 22, 26, 36], [27,, 31, 35]]);
        }, Promise.resolve(0));
      }));
    });
  } else return 0;
};

var getSubPartnerVolumeByMonth = function getSubPartnerVolumeByMonth(_ref3) {
  var _id = _ref3._id,
      isSubPartner = _ref3.isSubPartner,
      month = _ref3.month;

  // this is used for /affiliate/report/fetch-monthly-statement in router/affiliate/report.router.js
  if (isSubPartner) {
    return new Promise(function (resolve) {
      resolve(AffPartner.find({
        referredBy: _id
      }).select('_id').lean() // get all partners that have BEEN referredBy this partner
      .then(function (subPartners) {
        return subPartners.reduce(function _callee13(total, nextSubPartner) {
          var acc, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _value2, report;

          return regeneratorRuntime.async(function _callee13$(_context13) {
            while (1) {
              switch (_context13.prev = _context13.next) {
                case 0:
                  _context13.next = 2;
                  return regeneratorRuntime.awrap(total);

                case 2:
                  acc = _context13.sent;
                  _iteratorNormalCompletion2 = true;
                  _didIteratorError2 = false;
                  _context13.prev = 5;
                  _iterator2 = _asyncIterator(AffReport.find({
                    belongsToPartner: nextSubPartner._id,
                    month: month,
                    'account.transValue': {
                      $gt: 0
                    }
                  }).select('account.transValue').lean());

                case 7:
                  _context13.next = 9;
                  return regeneratorRuntime.awrap(_iterator2.next());

                case 9:
                  _step2 = _context13.sent;
                  _iteratorNormalCompletion2 = _step2.done;
                  _context13.next = 13;
                  return regeneratorRuntime.awrap(_step2.value);

                case 13:
                  _value2 = _context13.sent;

                  if (_iteratorNormalCompletion2) {
                    _context13.next = 20;
                    break;
                  }

                  report = _value2;
                  acc += report.account.transValue;

                case 17:
                  _iteratorNormalCompletion2 = true;
                  _context13.next = 7;
                  break;

                case 20:
                  _context13.next = 26;
                  break;

                case 22:
                  _context13.prev = 22;
                  _context13.t0 = _context13["catch"](5);
                  _didIteratorError2 = true;
                  _iteratorError2 = _context13.t0;

                case 26:
                  _context13.prev = 26;
                  _context13.prev = 27;

                  if (!(!_iteratorNormalCompletion2 && _iterator2["return"] != null)) {
                    _context13.next = 31;
                    break;
                  }

                  _context13.next = 31;
                  return regeneratorRuntime.awrap(_iterator2["return"]());

                case 31:
                  _context13.prev = 31;

                  if (!_didIteratorError2) {
                    _context13.next = 34;
                    break;
                  }

                  throw _iteratorError2;

                case 34:
                  return _context13.finish(31);

                case 35:
                  return _context13.finish(26);

                case 36:
                  return _context13.abrupt("return", acc);

                case 37:
                case "end":
                  return _context13.stop();
              }
            }
          }, null, null, [[5, 22, 26, 36], [27,, 31, 35]]);
        }, Promise.resolve(0));
      }));
    });
  } else return 0;
};

var getNetworkShareVolumeByBrand = function getNetworkShareVolumeByBrand(_ref4) {
  var referredBy = _ref4.referredBy,
      month = _ref4.month,
      brand = _ref4.brand;

  if (referredBy) {
    return new Promise(function (resolve) {
      resolve(AffPartner.find({
        referredBy: referredBy
      }).select('_id').lean() // get all partners that have the SAME referredBy as this partner
      .then(function (partnersReferredBySameNetwork) {
        return partnersReferredBySameNetwork.reduce(function _callee14(total, nextPartner) {
          var acc, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _value3, report;

          return regeneratorRuntime.async(function _callee14$(_context14) {
            while (1) {
              switch (_context14.prev = _context14.next) {
                case 0:
                  _context14.next = 2;
                  return regeneratorRuntime.awrap(total);

                case 2:
                  acc = _context14.sent;
                  _iteratorNormalCompletion3 = true;
                  _didIteratorError3 = false;
                  _context14.prev = 5;
                  _iterator3 = _asyncIterator(AffReport.find({
                    belongsToPartner: nextPartner._id,
                    brand: brand,
                    month: month,
                    'account.transValue': {
                      $gt: 0
                    }
                  }).select('account.transValue').lean());

                case 7:
                  _context14.next = 9;
                  return regeneratorRuntime.awrap(_iterator3.next());

                case 9:
                  _step3 = _context14.sent;
                  _iteratorNormalCompletion3 = _step3.done;
                  _context14.next = 13;
                  return regeneratorRuntime.awrap(_step3.value);

                case 13:
                  _value3 = _context14.sent;

                  if (_iteratorNormalCompletion3) {
                    _context14.next = 20;
                    break;
                  }

                  report = _value3;
                  acc += report.account.transValue;

                case 17:
                  _iteratorNormalCompletion3 = true;
                  _context14.next = 7;
                  break;

                case 20:
                  _context14.next = 26;
                  break;

                case 22:
                  _context14.prev = 22;
                  _context14.t0 = _context14["catch"](5);
                  _didIteratorError3 = true;
                  _iteratorError3 = _context14.t0;

                case 26:
                  _context14.prev = 26;
                  _context14.prev = 27;

                  if (!(!_iteratorNormalCompletion3 && _iterator3["return"] != null)) {
                    _context14.next = 31;
                    break;
                  }

                  _context14.next = 31;
                  return regeneratorRuntime.awrap(_iterator3["return"]());

                case 31:
                  _context14.prev = 31;

                  if (!_didIteratorError3) {
                    _context14.next = 34;
                    break;
                  }

                  throw _iteratorError3;

                case 34:
                  return _context14.finish(31);

                case 35:
                  return _context14.finish(26);

                case 36:
                  return _context14.abrupt("return", acc);

                case 37:
                case "end":
                  return _context14.stop();
              }
            }
          }, null, null, [[5, 22, 26, 36], [27,, 31, 35]]);
        }, Promise.resolve(0));
      }));
    });
  } else return 0;
};

var getNetworkShareVolumeByMonth = function getNetworkShareVolumeByMonth(_ref5) {
  var referredBy = _ref5.referredBy,
      month = _ref5.month;

  if (referredBy) {
    return new Promise(function (resolve) {
      resolve(AffPartner.find({
        referredBy: referredBy
      }).select('_id').lean() // get all partners that have the SAME referredBy as this partner
      .then(function (partnersReferredBySameNetwork) {
        return partnersReferredBySameNetwork.reduce(function _callee15(total, nextPartner) {
          var acc, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _value4, report;

          return regeneratorRuntime.async(function _callee15$(_context15) {
            while (1) {
              switch (_context15.prev = _context15.next) {
                case 0:
                  _context15.next = 2;
                  return regeneratorRuntime.awrap(total);

                case 2:
                  acc = _context15.sent;
                  _iteratorNormalCompletion4 = true;
                  _didIteratorError4 = false;
                  _context15.prev = 5;
                  _iterator4 = _asyncIterator(AffReport.find({
                    belongsToPartner: nextPartner._id,
                    month: month,
                    'account.transValue': {
                      $gt: 0
                    }
                  }).select('account.transValue').lean());

                case 7:
                  _context15.next = 9;
                  return regeneratorRuntime.awrap(_iterator4.next());

                case 9:
                  _step4 = _context15.sent;
                  _iteratorNormalCompletion4 = _step4.done;
                  _context15.next = 13;
                  return regeneratorRuntime.awrap(_step4.value);

                case 13:
                  _value4 = _context15.sent;

                  if (_iteratorNormalCompletion4) {
                    _context15.next = 20;
                    break;
                  }

                  report = _value4;
                  acc += report.account.transValue;

                case 17:
                  _iteratorNormalCompletion4 = true;
                  _context15.next = 7;
                  break;

                case 20:
                  _context15.next = 26;
                  break;

                case 22:
                  _context15.prev = 22;
                  _context15.t0 = _context15["catch"](5);
                  _didIteratorError4 = true;
                  _iteratorError4 = _context15.t0;

                case 26:
                  _context15.prev = 26;
                  _context15.prev = 27;

                  if (!(!_iteratorNormalCompletion4 && _iterator4["return"] != null)) {
                    _context15.next = 31;
                    break;
                  }

                  _context15.next = 31;
                  return regeneratorRuntime.awrap(_iterator4["return"]());

                case 31:
                  _context15.prev = 31;

                  if (!_didIteratorError4) {
                    _context15.next = 34;
                    break;
                  }

                  throw _iteratorError4;

                case 34:
                  return _context15.finish(31);

                case 35:
                  return _context15.finish(26);

                case 36:
                  return _context15.abrupt("return", acc);

                case 37:
                case "end":
                  return _context15.stop();
              }
            }
          }, null, null, [[5, 22, 26, 36], [27,, 31, 35]]);
        }, Promise.resolve(0));
      }));
    });
  } else return 0;
};

var getSubPartnerCashbackByBrand = function getSubPartnerCashbackByBrand(_ref6) {
  var _id = _ref6._id,
      brand = _ref6.brand,
      month = _ref6.month,
      isSubPartner = _ref6.isSubPartner;

  if (isSubPartner) {
    return new Promise(function (resolve) {
      resolve(AffPartner.find({
        referredBy: _id
      }).select('_id').lean() // get all partners that have BEEN referredBy this partner
      .then(function (subPartners) {
        return subPartners.reduce(function _callee16(total, nextSubPartner) {
          var acc, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, _value5, report;

          return regeneratorRuntime.async(function _callee16$(_context16) {
            while (1) {
              switch (_context16.prev = _context16.next) {
                case 0:
                  _context16.next = 2;
                  return regeneratorRuntime.awrap(total);

                case 2:
                  acc = _context16.sent;
                  _iteratorNormalCompletion5 = true;
                  _didIteratorError5 = false;
                  _context16.prev = 5;
                  _iterator5 = _asyncIterator(AffReport.find({
                    belongsToPartner: nextSubPartner._id,
                    brand: brand,
                    month: month,
                    'account.transValue': {
                      $gt: 0
                    }
                  }).select('account.subAffCommission').lean());

                case 7:
                  _context16.next = 9;
                  return regeneratorRuntime.awrap(_iterator5.next());

                case 9:
                  _step5 = _context16.sent;
                  _iteratorNormalCompletion5 = _step5.done;
                  _context16.next = 13;
                  return regeneratorRuntime.awrap(_step5.value);

                case 13:
                  _value5 = _context16.sent;

                  if (_iteratorNormalCompletion5) {
                    _context16.next = 20;
                    break;
                  }

                  report = _value5;
                  acc += report.account.subAffCommission;

                case 17:
                  _iteratorNormalCompletion5 = true;
                  _context16.next = 7;
                  break;

                case 20:
                  _context16.next = 26;
                  break;

                case 22:
                  _context16.prev = 22;
                  _context16.t0 = _context16["catch"](5);
                  _didIteratorError5 = true;
                  _iteratorError5 = _context16.t0;

                case 26:
                  _context16.prev = 26;
                  _context16.prev = 27;

                  if (!(!_iteratorNormalCompletion5 && _iterator5["return"] != null)) {
                    _context16.next = 31;
                    break;
                  }

                  _context16.next = 31;
                  return regeneratorRuntime.awrap(_iterator5["return"]());

                case 31:
                  _context16.prev = 31;

                  if (!_didIteratorError5) {
                    _context16.next = 34;
                    break;
                  }

                  throw _iteratorError5;

                case 34:
                  return _context16.finish(31);

                case 35:
                  return _context16.finish(26);

                case 36:
                  return _context16.abrupt("return", acc);

                case 37:
                case "end":
                  return _context16.stop();
              }
            }
          }, null, null, [[5, 22, 26, 36], [27,, 31, 35]]);
        }, Promise.resolve(0));
      }));
    });
  } else return 0;
};

var getSubPartnerCashbackByCurrencyAndMonth = function getSubPartnerCashbackByCurrencyAndMonth(_ref7) {
  var _id = _ref7._id,
      currency = _ref7.currency,
      month = _ref7.month,
      isSubPartner = _ref7.isSubPartner;

  if (isSubPartner) {
    return new Promise(function (resolve) {
      resolve(AffPartner.find({
        referredBy: _id
      }).select('_id').lean() // get all partners that have BEEN referredBy this partner
      .then(function (subPartners) {
        return subPartners.reduce(function _callee17(total, nextSubPartner) {
          var acc, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _value6, report;

          return regeneratorRuntime.async(function _callee17$(_context17) {
            while (1) {
              switch (_context17.prev = _context17.next) {
                case 0:
                  _context17.next = 2;
                  return regeneratorRuntime.awrap(total);

                case 2:
                  acc = _context17.sent;
                  _iteratorNormalCompletion6 = true;
                  _didIteratorError6 = false;
                  _context17.prev = 5;
                  _iterator6 = _asyncIterator(AffReport.find({
                    belongsToPartner: nextSubPartner._id,
                    'account.currency': currency,
                    month: month,
                    'account.transValue': {
                      $gt: 0
                    }
                  }).select('account.subAffCommission').lean());

                case 7:
                  _context17.next = 9;
                  return regeneratorRuntime.awrap(_iterator6.next());

                case 9:
                  _step6 = _context17.sent;
                  _iteratorNormalCompletion6 = _step6.done;
                  _context17.next = 13;
                  return regeneratorRuntime.awrap(_step6.value);

                case 13:
                  _value6 = _context17.sent;

                  if (_iteratorNormalCompletion6) {
                    _context17.next = 20;
                    break;
                  }

                  report = _value6;
                  acc += report.account.subAffCommission;

                case 17:
                  _iteratorNormalCompletion6 = true;
                  _context17.next = 7;
                  break;

                case 20:
                  _context17.next = 26;
                  break;

                case 22:
                  _context17.prev = 22;
                  _context17.t0 = _context17["catch"](5);
                  _didIteratorError6 = true;
                  _iteratorError6 = _context17.t0;

                case 26:
                  _context17.prev = 26;
                  _context17.prev = 27;

                  if (!(!_iteratorNormalCompletion6 && _iterator6["return"] != null)) {
                    _context17.next = 31;
                    break;
                  }

                  _context17.next = 31;
                  return regeneratorRuntime.awrap(_iterator6["return"]());

                case 31:
                  _context17.prev = 31;

                  if (!_didIteratorError6) {
                    _context17.next = 34;
                    break;
                  }

                  throw _iteratorError6;

                case 34:
                  return _context17.finish(31);

                case 35:
                  return _context17.finish(26);

                case 36:
                  return _context17.abrupt("return", acc);

                case 37:
                case "end":
                  return _context17.stop();
              }
            }
          }, null, null, [[5, 22, 26, 36], [27,, 31, 35]]);
        }, Promise.resolve(0));
      }));
    });
  } else return 0;
};
/* NEW ROUTES FOR VOLUMEKINGS */

/* NEW FOR VOLUMEKINGS */


var getCashBackByCurrencyAndMonth = function getCashBackByCurrencyAndMonth(_ref8, currency, month) {
  var _id, cashback, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, _value7, report;

  return regeneratorRuntime.async(function getCashBackByCurrencyAndMonth$(_context18) {
    while (1) {
      switch (_context18.prev = _context18.next) {
        case 0:
          _id = _ref8._id;
          cashback = 0;
          _iteratorNormalCompletion7 = true;
          _didIteratorError7 = false;
          _context18.prev = 4;
          _iterator7 = _asyncIterator(AffReport.find({
            belongsToPartner: _id,
            'account.currency': currency,
            month: month,
            'account.transValue': {
              $gt: 0
            }
          }).select('account.cashback').lean());

        case 6:
          _context18.next = 8;
          return regeneratorRuntime.awrap(_iterator7.next());

        case 8:
          _step7 = _context18.sent;
          _iteratorNormalCompletion7 = _step7.done;
          _context18.next = 12;
          return regeneratorRuntime.awrap(_step7.value);

        case 12:
          _value7 = _context18.sent;

          if (_iteratorNormalCompletion7) {
            _context18.next = 19;
            break;
          }

          report = _value7;
          cashback += report.account.cashback;

        case 16:
          _iteratorNormalCompletion7 = true;
          _context18.next = 6;
          break;

        case 19:
          _context18.next = 25;
          break;

        case 21:
          _context18.prev = 21;
          _context18.t0 = _context18["catch"](4);
          _didIteratorError7 = true;
          _iteratorError7 = _context18.t0;

        case 25:
          _context18.prev = 25;
          _context18.prev = 26;

          if (!(!_iteratorNormalCompletion7 && _iterator7["return"] != null)) {
            _context18.next = 30;
            break;
          }

          _context18.next = 30;
          return regeneratorRuntime.awrap(_iterator7["return"]());

        case 30:
          _context18.prev = 30;

          if (!_didIteratorError7) {
            _context18.next = 33;
            break;
          }

          throw _iteratorError7;

        case 33:
          return _context18.finish(30);

        case 34:
          return _context18.finish(25);

        case 35:
          return _context18.abrupt("return", cashback);

        case 36:
        case "end":
          return _context18.stop();
      }
    }
  }, null, null, [[4, 21, 25, 35], [26,, 30, 34]]);
};

var getVolumeByMonth = function getVolumeByMonth(_ref9, month) {
  var _id, transValue, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, _value8, report;

  return regeneratorRuntime.async(function getVolumeByMonth$(_context19) {
    while (1) {
      switch (_context19.prev = _context19.next) {
        case 0:
          _id = _ref9._id;
          // get volume for ALL BRANDS for current and previous - this is for VK points
          transValue = 0;
          _iteratorNormalCompletion8 = true;
          _didIteratorError8 = false;
          _context19.prev = 4;
          _iterator8 = _asyncIterator(AffReport.find({
            belongsToPartner: _id,
            month: month,
            'account.transValue': {
              $gt: 0
            }
          }).select('account.transValue').lean());

        case 6:
          _context19.next = 8;
          return regeneratorRuntime.awrap(_iterator8.next());

        case 8:
          _step8 = _context19.sent;
          _iteratorNormalCompletion8 = _step8.done;
          _context19.next = 12;
          return regeneratorRuntime.awrap(_step8.value);

        case 12:
          _value8 = _context19.sent;

          if (_iteratorNormalCompletion8) {
            _context19.next = 19;
            break;
          }

          report = _value8;
          transValue += report.account.transValue;

        case 16:
          _iteratorNormalCompletion8 = true;
          _context19.next = 6;
          break;

        case 19:
          _context19.next = 25;
          break;

        case 21:
          _context19.prev = 21;
          _context19.t0 = _context19["catch"](4);
          _didIteratorError8 = true;
          _iteratorError8 = _context19.t0;

        case 25:
          _context19.prev = 25;
          _context19.prev = 26;

          if (!(!_iteratorNormalCompletion8 && _iterator8["return"] != null)) {
            _context19.next = 30;
            break;
          }

          _context19.next = 30;
          return regeneratorRuntime.awrap(_iterator8["return"]());

        case 30:
          _context19.prev = 30;

          if (!_didIteratorError8) {
            _context19.next = 33;
            break;
          }

          throw _iteratorError8;

        case 33:
          return _context19.finish(30);

        case 34:
          return _context19.finish(25);

        case 35:
          return _context19.abrupt("return", transValue);

        case 36:
        case "end":
          return _context19.stop();
      }
    }
  }, null, null, [[4, 21, 25, 35], [26,, 30, 34]]);
};

var getClicksByMonth = function getClicksByMonth(_ref10) {
  var _id, month, clickData;

  return regeneratorRuntime.async(function getClicksByMonth$(_context20) {
    while (1) {
      switch (_context20.prev = _context20.next) {
        case 0:
          _id = _ref10._id, month = _ref10.month;
          _context20.next = 3;
          return regeneratorRuntime.awrap(AffReportDaily.aggregate([// gets all the clicks from Neteller/Skrill - still need to do for ecoPayz
          {
            $match: {
              $and: [{
                belongsTo: mongoose.Types.ObjectId(_id)
              }, {
                month: month
              }]
            }
          }, {
            $project: {
              clicks: 1
            }
          }, {
            $group: {
              _id: null,
              clicks: {
                $sum: '$clicks'
              }
            }
          }]));

        case 3:
          clickData = _context20.sent;
          return _context20.abrupt("return", clickData.length === 0 ? 0 : clickData[0].clicks);

        case 5:
        case "end":
          return _context20.stop();
      }
    }
  });
};

var getAffAccountsAddedByMonth = function getAffAccountsAddedByMonth(_ref11) {
  var _id, monthAdded, accountData;

  return regeneratorRuntime.async(function getAffAccountsAddedByMonth$(_context21) {
    while (1) {
      switch (_context21.prev = _context21.next) {
        case 0:
          _id = _ref11._id, monthAdded = _ref11.monthAdded;
          _context21.next = 3;
          return regeneratorRuntime.awrap(AffAccount.countDocuments({
            belongsTo: _id,
            monthAdded: monthAdded
          }));

        case 3:
          accountData = _context21.sent;
          return _context21.abrupt("return", accountData);

        case 5:
        case "end":
          return _context21.stop();
      }
    }
  });
}; // POST /affiliate/report/fetch-aff-monthly-summaries


router.post('/fetch-aff-monthly-summaries', passport.authenticate('jwt', {
  session: false
}), function _callee18(req, res) {
  var token, _req$body11, _id, months, reports;

  return regeneratorRuntime.async(function _callee18$(_context22) {
    while (1) {
      switch (_context22.prev = _context22.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context22.next = 15;
            break;
          }

          _req$body11 = req.body, _id = _req$body11._id, months = _req$body11.months;
          _context22.prev = 3;
          _context22.next = 6;
          return regeneratorRuntime.awrap(AffMonthlySummary.find({
            belongsTo: _id
          }).where({
            month: {
              $in: months
            }
          }).sort({
            date: 'asc'
          }));

        case 6:
          reports = _context22.sent;
          return _context22.abrupt("return", res.status(200).send({
            reports: reports
          }));

        case 10:
          _context22.prev = 10;
          _context22.t0 = _context22["catch"](3);
          return _context22.abrupt("return", res.status(403).send({
            success: false,
            msg: _context22.t0
          }));

        case 13:
          _context22.next = 16;
          break;

        case 15:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 16:
        case "end":
          return _context22.stop();
      }
    }
  }, null, null, [[3, 10]]);
}); // POST /affiliate/report/fetch-monthly-summary-vk

router.post('/fetch-monthly-summary-vk', passport.authenticate('jwt', {
  session: false
}), function _callee19(req, res) {
  var token, _req$body12, _id, curMonth, preMonth, _ref12, isSubPartner, referredBy, curClicks, preClicks, clickChange, preConversions, curConversions, convChange, preSubCashbackUSD, curSubCashbackUSD, preSubCashbackEUR, curSubCashbackEUR, preCashbackUSD, curCashbackUSD, preCashbackEUR, curCashbackEUR, preCashbackTotalUSD, curCashbackTotalUSD, cashbackTotalUSDChange, preCashbackTotalEUR, curCashbackTotalEUR, cashbackTotalEURChange, prePersonalVol, curPersonalVol, preSubVol, curSubVol, preNetworkShare, curNetworkShare, preVK, curVK, VKChange;

  return regeneratorRuntime.async(function _callee19$(_context23) {
    while (1) {
      switch (_context23.prev = _context23.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context23.next = 82;
            break;
          }

          _req$body12 = req.body, _id = _req$body12._id, curMonth = _req$body12.curMonth, preMonth = _req$body12.preMonth;
          _context23.prev = 3;
          _context23.next = 6;
          return regeneratorRuntime.awrap(AffPartner.findById(_id).select('referredBy isSubPartner subPartnerRate').lean());

        case 6:
          _ref12 = _context23.sent;
          isSubPartner = _ref12.isSubPartner;
          referredBy = _ref12.referredBy;
          _context23.next = 11;
          return regeneratorRuntime.awrap(getClicksByMonth({
            _id: _id,
            month: curMonth
          }));

        case 11:
          curClicks = _context23.sent;
          _context23.next = 14;
          return regeneratorRuntime.awrap(getClicksByMonth({
            _id: _id,
            month: preMonth
          }));

        case 14:
          preClicks = _context23.sent;
          clickChange = preClicks === 0 ? 0 : (curClicks - preClicks) / preClicks * 100;
          /* CONVERSIONS */

          _context23.next = 18;
          return regeneratorRuntime.awrap(getAffAccountsAddedByMonth({
            _id: _id,
            monthAdded: preMonth
          }));

        case 18:
          preConversions = _context23.sent;
          _context23.next = 21;
          return regeneratorRuntime.awrap(getAffAccountsAddedByMonth({
            _id: _id,
            monthAdded: curMonth
          }));

        case 21:
          curConversions = _context23.sent;
          convChange = preConversions === 0 ? 0 : (curConversions - preConversions) / preConversions * 100;
          /* SUBCASHBACK CALCULATIONS */

          _context23.next = 25;
          return regeneratorRuntime.awrap(getSubPartnerCashbackByCurrencyAndMonth({
            _id: _id,
            currency: 'USD',
            month: preMonth,
            isSubPartner: isSubPartner
          }));

        case 25:
          preSubCashbackUSD = _context23.sent;
          _context23.next = 28;
          return regeneratorRuntime.awrap(getSubPartnerCashbackByCurrencyAndMonth({
            _id: _id,
            currency: 'USD',
            month: curMonth,
            isSubPartner: isSubPartner
          }));

        case 28:
          curSubCashbackUSD = _context23.sent;
          _context23.next = 31;
          return regeneratorRuntime.awrap(getSubPartnerCashbackByCurrencyAndMonth({
            _id: _id,
            currency: 'EUR',
            month: preMonth,
            isSubPartner: isSubPartner
          }));

        case 31:
          preSubCashbackEUR = _context23.sent;
          _context23.next = 34;
          return regeneratorRuntime.awrap(getSubPartnerCashbackByCurrencyAndMonth({
            _id: _id,
            currency: 'EUR',
            month: curMonth,
            isSubPartner: isSubPartner
          }));

        case 34:
          curSubCashbackEUR = _context23.sent;
          _context23.next = 37;
          return regeneratorRuntime.awrap(getCashBackByCurrencyAndMonth({
            _id: _id
          }, 'USD', preMonth));

        case 37:
          preCashbackUSD = _context23.sent;
          _context23.next = 40;
          return regeneratorRuntime.awrap(getCashBackByCurrencyAndMonth({
            _id: _id
          }, 'USD', curMonth));

        case 40:
          curCashbackUSD = _context23.sent;
          _context23.next = 43;
          return regeneratorRuntime.awrap(getCashBackByCurrencyAndMonth({
            _id: _id
          }, 'EUR', preMonth));

        case 43:
          preCashbackEUR = _context23.sent;
          _context23.next = 46;
          return regeneratorRuntime.awrap(getCashBackByCurrencyAndMonth({
            _id: _id
          }, 'EUR', curMonth));

        case 46:
          curCashbackEUR = _context23.sent;

          /* CASHBACK TOTAL CALCULATIONS */
          // - USD
          preCashbackTotalUSD = preSubCashbackUSD + preCashbackUSD;
          curCashbackTotalUSD = curSubCashbackUSD + curCashbackUSD;
          cashbackTotalUSDChange = preCashbackTotalUSD === 0 ? 0 : (curCashbackTotalUSD - preCashbackTotalUSD) / preCashbackTotalUSD * 100; // - EUR

          preCashbackTotalEUR = preSubCashbackEUR + preCashbackEUR;
          curCashbackTotalEUR = curSubCashbackEUR + curCashbackEUR;
          cashbackTotalEURChange = preCashbackTotalEUR === 0 ? 0 : (curCashbackTotalEUR - preCashbackTotalEUR) / preCashbackTotalEUR * 100;
          /* VK POINTS */

          _context23.next = 55;
          return regeneratorRuntime.awrap(getVolumeByMonth({
            _id: _id
          }, preMonth));

        case 55:
          prePersonalVol = _context23.sent;
          _context23.next = 58;
          return regeneratorRuntime.awrap(getVolumeByMonth({
            _id: _id
          }, curMonth));

        case 58:
          curPersonalVol = _context23.sent;
          _context23.next = 61;
          return regeneratorRuntime.awrap(getSubPartnerVolumeByMonth({
            _id: _id,
            isSubPartner: isSubPartner,
            month: preMonth
          }));

        case 61:
          preSubVol = _context23.sent;
          _context23.next = 64;
          return regeneratorRuntime.awrap(getSubPartnerVolumeByMonth({
            _id: _id,
            isSubPartner: isSubPartner,
            month: curMonth
          }));

        case 64:
          curSubVol = _context23.sent;
          _context23.next = 67;
          return regeneratorRuntime.awrap(getNetworkShareVolumeByMonth({
            referredBy: referredBy,
            month: preMonth
          }));

        case 67:
          preNetworkShare = _context23.sent;
          _context23.next = 70;
          return regeneratorRuntime.awrap(getNetworkShareVolumeByMonth({
            referredBy: referredBy,
            month: curMonth
          }));

        case 70:
          curNetworkShare = _context23.sent;
          preVK = prePersonalVol + preSubVol + preNetworkShare;
          curVK = curPersonalVol + curSubVol + curNetworkShare;
          VKChange = preVK === 0 ? 0 : (curVK - preVK) / preVK * 100;
          return _context23.abrupt("return", res.status(200).send({
            curClicks: curClicks,
            clickChange: clickChange,
            curConversions: curConversions,
            convChange: convChange,
            curCashbackTotalUSD: curCashbackTotalUSD,
            cashbackTotalUSDChange: cashbackTotalUSDChange,
            curCashbackTotalEUR: curCashbackTotalEUR,
            cashbackTotalEURChange: cashbackTotalEURChange,
            curVK: curVK,
            VKChange: VKChange
          }));

        case 77:
          _context23.prev = 77;
          _context23.t0 = _context23["catch"](3);
          return _context23.abrupt("return", res.status(403).send({
            success: false,
            msg: _context23.t0
          }));

        case 80:
          _context23.next = 83;
          break;

        case 82:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 83:
        case "end":
          return _context23.stop();
      }
    }
  }, null, null, [[3, 77]]);
}); // POST /affiliate/report/fetch-aff-accounts?pageSize=${pageSize}&pageIndex=${pageIndex}

router.post('/fetch-aff-accounts', passport.authenticate('jwt', {
  session: false
}), getAffAcounts); // returns applications

function getAffAcounts(req, res) {
  var token, pageSize, pageIndex, _req$body13, sort, query, skippage, accounts, pageCount, brands, months;

  return regeneratorRuntime.async(function getAffAcounts$(_context24) {
    while (1) {
      switch (_context24.prev = _context24.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context24.next = 29;
            break;
          }

          pageSize = parseInt(req.query.pageSize);
          pageIndex = parseInt(req.query.pageIndex);
          _req$body13 = req.body, sort = _req$body13.sort, query = _req$body13.query;
          skippage = pageSize * pageIndex; // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table

          query = mapRegexQueryFromObj(query);
          _context24.prev = 7;
          _context24.next = 10;
          return regeneratorRuntime.awrap(AffAccount.find(query).collation({
            locale: 'en',
            strength: 1
          }).sort(sort).skip(skippage).limit(pageSize).lean());

        case 10:
          accounts = _context24.sent;
          _context24.next = 13;
          return regeneratorRuntime.awrap(AffAccount.countDocuments(query));

        case 13:
          pageCount = _context24.sent;
          _context24.next = 16;
          return regeneratorRuntime.awrap(AffAccount.distinct('brand'));

        case 16:
          brands = _context24.sent;
          _context24.next = 19;
          return regeneratorRuntime.awrap(AffAccount.distinct('monthAdded'));

        case 19:
          months = _context24.sent;
          return _context24.abrupt("return", res.status(200).send({
            accounts: accounts,
            pageCount: pageCount,
            brands: brands,
            months: months
          }));

        case 23:
          _context24.prev = 23;
          _context24.t0 = _context24["catch"](7);
          console.log(_context24.t0);
          return _context24.abrupt("return", res.status(400).send(_context24.t0));

        case 27:
          _context24.next = 30;
          break;

        case 29:
          return _context24.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 30:
        case "end":
          return _context24.stop();
      }
    }
  }, null, null, [[7, 23]]);
}

module.exports = router;