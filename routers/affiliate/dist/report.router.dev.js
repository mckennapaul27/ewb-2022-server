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
    AffUpgrade = _require2.AffUpgrade;

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
  var token, _req$body3, _id, startDate, endDate, reports;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context4.next = 15;
            break;
          }

          _req$body3 = req.body, _id = _req$body3._id, startDate = _req$body3.startDate, endDate = _req$body3.endDate;
          _context4.prev = 3;
          _context4.next = 6;
          return regeneratorRuntime.awrap(AffReportDaily.find({
            belongsTo: _id,
            date: {
              $gte: startDate,
              $lte: endDate
            }
          }).sort({
            date: 'asc'
          }));

        case 6:
          reports = _context4.sent;
          return _context4.abrupt("return", res.send({
            reports: reports
          }));

        case 10:
          _context4.prev = 10;
          _context4.t0 = _context4["catch"](3);
          return _context4.abrupt("return", res.status(403).send({
            success: false,
            msg: _context4.t0
          }));

        case 13:
          _context4.next = 16;
          break;

        case 15:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 16:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[3, 10]]);
}); // POST /affiliate/report/fetch-daily-reports

router.post('/fetch-daily-reports', passport.authenticate('jwt', {
  session: false
}), function _callee5(req, res) {
  var token, _req$body4, _id, startDate, endDate, reports;

  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context5.next = 15;
            break;
          }

          _req$body4 = req.body, _id = _req$body4._id, startDate = _req$body4.startDate, endDate = _req$body4.endDate;
          _context5.prev = 3;
          _context5.next = 6;
          return regeneratorRuntime.awrap(AffReportDaily.find({
            belongsTo: _id,
            date: {
              $gte: startDate,
              $lte: endDate
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
}); // POST /affiliate/report/fetch-monthly-reports

router.post('/fetch-monthly-reports', passport.authenticate('jwt', {
  session: false
}), function _callee6(req, res) {
  var token, _req$body5, _id, months, brand, reports;

  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context6.next = 15;
            break;
          }

          _req$body5 = req.body, _id = _req$body5._id, months = _req$body5.months, brand = _req$body5.brand;
          _context6.prev = 3;
          _context6.next = 6;
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
          reports = _context6.sent;
          return _context6.abrupt("return", res.status(200).send({
            reports: reports
          }));

        case 10:
          _context6.prev = 10;
          _context6.t0 = _context6["catch"](3);
          return _context6.abrupt("return", res.status(403).send({
            success: false,
            msg: _context6.t0
          }));

        case 13:
          _context6.next = 16;
          break;

        case 15:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 16:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[3, 10]]);
}); // POST /affiliate/report/fetch-monthly-summary

router.post('/fetch-monthly-summary', passport.authenticate('jwt', {
  session: false
}), function _callee7(req, res) {
  var token, _req$body6, _id, month, start, end, _ref, isSubPartner, nCashback, nSubCashback, sCashback, sSubCashback, data, nRegs, sRegs, nClicks, sClicks, nApplications, sApplications;

  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context7.next = 41;
            break;
          }

          _req$body6 = req.body, _id = _req$body6._id, month = _req$body6.month, start = _req$body6.start, end = _req$body6.end;
          _context7.prev = 3;
          _context7.next = 6;
          return regeneratorRuntime.awrap(AffPartner.findById(_id).select('referredBy isSubPartner subPartnerRate').lean());

        case 6:
          _ref = _context7.sent;
          isSubPartner = _ref.isSubPartner;
          _context7.next = 10;
          return regeneratorRuntime.awrap(getCashBackByBrand({
            _id: _id
          }, 'Neteller', month));

        case 10:
          nCashback = _context7.sent;
          _context7.next = 13;
          return regeneratorRuntime.awrap(getSubPartnerCashbackByBrand({
            _id: _id,
            isSubPartner: isSubPartner,
            month: month,
            brand: 'Neteller'
          }));

        case 13:
          nSubCashback = _context7.sent;
          _context7.next = 16;
          return regeneratorRuntime.awrap(getCashBackByBrand({
            _id: _id
          }, 'Skrill', month));

        case 16:
          sCashback = _context7.sent;
          _context7.next = 19;
          return regeneratorRuntime.awrap(getSubPartnerCashbackByBrand({
            _id: _id,
            isSubPartner: isSubPartner,
            month: month,
            brand: 'Skrill'
          }));

        case 19:
          sSubCashback = _context7.sent;
          _context7.next = 22;
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
          data = _context7.sent;
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
          _context7.next = 29;
          return regeneratorRuntime.awrap(AffApplication.countDocuments({
            belongsTo: _id,
            brand: 'Neteller',
            dateAdded: {
              $gte: start,
              $lte: end
            }
          }));

        case 29:
          nApplications = _context7.sent;
          _context7.next = 32;
          return regeneratorRuntime.awrap(AffApplication.countDocuments({
            belongsTo: _id,
            brand: 'Skrill',
            dateAdded: {
              $gte: start,
              $lte: end
            }
          }));

        case 32:
          sApplications = _context7.sent;
          return _context7.abrupt("return", res.status(200).send({
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
          _context7.prev = 36;
          _context7.t0 = _context7["catch"](3);
          return _context7.abrupt("return", res.status(403).send({
            success: false,
            msg: _context7.t0
          }));

        case 39:
          _context7.next = 42;
          break;

        case 41:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 42:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[3, 36]]);
}); // POST /affiliate/report/accountId/table

router.post('/accountId/table', passport.authenticate('jwt', {
  session: false
}), function _callee8(req, res) {
  var token, pageSize, pageIndex, _req$body7, sort, query, skippage, reports, pageCount;

  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context8.next = 15;
            break;
          }

          pageSize = parseInt(req.query.pageSize);
          pageIndex = parseInt(req.query.pageIndex);
          _req$body7 = req.body, sort = _req$body7.sort, query = _req$body7.query;
          skippage = pageSize * pageIndex;
          _context8.next = 8;
          return regeneratorRuntime.awrap(AffReport.find(query).collation({
            locale: 'en',
            strength: 1
          }).sort(sort).skip(skippage).limit(pageSize));

        case 8:
          reports = _context8.sent;
          _context8.next = 11;
          return regeneratorRuntime.awrap(AffReport.countDocuments(query));

        case 11:
          pageCount = _context8.sent;
          return _context8.abrupt("return", res.send({
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
          return _context8.stop();
      }
    }
  });
}); // POST /affiliate/report/accountId/chart

router.post('/accountId/chart', passport.authenticate('jwt', {
  session: false
}), function _callee9(req, res) {
  var token, _req$body8, months, query, reports;

  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context9.next = 9;
            break;
          }

          _req$body8 = req.body, months = _req$body8.months, query = _req$body8.query;
          _context9.next = 5;
          return regeneratorRuntime.awrap(AffReport.find(query).where({
            month: {
              $in: months
            }
          }).sort({
            date: 1
          }));

        case 5:
          reports = _context9.sent;
          return _context9.abrupt("return", res.send({
            reports: reports
          }));

        case 9:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 10:
        case "end":
          return _context9.stop();
      }
    }
  });
}); // POST /affiliate/report/fetch-deal-progress

router.post('/fetch-deal-progress', passport.authenticate('jwt', {
  session: false
}), function _callee10(req, res) {
  var token, _req$body9, _id, month, partner, referredBy, deals, isSubPartner, revShareActive, nRate, sRate, eRate;

  return regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context10.next = 25;
            break;
          }

          _req$body9 = req.body, _id = _req$body9._id, month = _req$body9.month;
          _context10.prev = 3;
          _context10.next = 6;
          return regeneratorRuntime.awrap(AffPartner.findById(req.body._id).select('referredBy deals isSubPartner revShareActive').lean());

        case 6:
          partner = _context10.sent;
          referredBy = partner.referredBy, deals = partner.deals, isSubPartner = partner.isSubPartner, revShareActive = partner.revShareActive;
          _context10.next = 10;
          return regeneratorRuntime.awrap(getCashbackRate({
            _id: _id,
            referredBy: referredBy,
            deals: deals,
            isSubPartner: isSubPartner,
            brand: 'Neteller',
            month: month
          }));

        case 10:
          nRate = _context10.sent;
          _context10.next = 13;
          return regeneratorRuntime.awrap(getCashbackRate({
            _id: _id,
            referredBy: referredBy,
            deals: deals,
            isSubPartner: isSubPartner,
            brand: 'Skrill',
            month: month
          }));

        case 13:
          sRate = _context10.sent;
          _context10.next = 16;
          return regeneratorRuntime.awrap(getCashbackRate({
            _id: _id,
            referredBy: referredBy,
            deals: deals,
            isSubPartner: isSubPartner,
            brand: 'ecoPayz',
            month: month
          }));

        case 16:
          eRate = _context10.sent;
          return _context10.abrupt("return", res.status(200).send({
            nRate: nRate,
            sRate: sRate,
            eRate: eRate,
            deals: deals,
            revShareActive: revShareActive
          }));

        case 20:
          _context10.prev = 20;
          _context10.t0 = _context10["catch"](3);
          return _context10.abrupt("return", res.status(403).send({
            success: false,
            msg: _context10.t0
          }));

        case 23:
          _context10.next = 26;
          break;

        case 25:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 26:
        case "end":
          return _context10.stop();
      }
    }
  }, null, null, [[3, 20]]);
}); // POST /affiliate/report/fetch-quarter-data

router.post('/fetch-quarter-data', passport.authenticate('jwt', {
  session: false
}), function _callee11(req, res) {
  var token, _req$body10, accountId, quarter, q, upgrades;

  return regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context11.next = 18;
            break;
          }

          _req$body10 = req.body, accountId = _req$body10.accountId, quarter = _req$body10.quarter;
          _context11.prev = 3;
          _context11.next = 6;
          return regeneratorRuntime.awrap(Quarter.findOne({
            accountId: accountId,
            quarter: quarter
          }));

        case 6:
          q = _context11.sent;
          _context11.next = 9;
          return regeneratorRuntime.awrap(AffUpgrade.find({
            accountId: accountId,
            quarter: quarter
          }));

        case 9:
          upgrades = _context11.sent;
          return _context11.abrupt("return", res.status(200).send({
            q: q,
            upgrades: upgrades
          }));

        case 13:
          _context11.prev = 13;
          _context11.t0 = _context11["catch"](3);
          return _context11.abrupt("return", res.status(403).send({
            success: false,
            msg: _context11.t0
          }));

        case 16:
          _context11.next = 19;
          break;

        case 18:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 19:
        case "end":
          return _context11.stop();
      }
    }
  }, null, null, [[3, 13]]);
}); // POST /affiliate/report/fetch-monthly-statement

router.post('/fetch-monthly-statement', passport.authenticate('jwt', {
  session: false
}), function _callee12(req, res) {
  var token, _req$body11, _id, month, partner, referredBy, isSubPartner, subPartnerRate, nVolume, nCashback, nSubVol, nSubCashback, nNetworkShare, sVolume, sCashback, sSubVol, sSubCashback, sNetworkShare, eVolume, eCashback, eSubVol, eSubCashback, eNetworkShare;

  return regeneratorRuntime.async(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context12.next = 61;
            break;
          }

          _req$body11 = req.body, _id = _req$body11._id, month = _req$body11.month;
          _context12.prev = 3;
          _context12.next = 6;
          return regeneratorRuntime.awrap(AffPartner.findById(req.body._id).select('referredBy isSubPartner subPartnerRate').lean());

        case 6:
          partner = _context12.sent;
          referredBy = partner.referredBy, isSubPartner = partner.isSubPartner, subPartnerRate = partner.subPartnerRate;
          _context12.next = 10;
          return regeneratorRuntime.awrap(getVolumeByBrand({
            _id: _id
          }, 'Neteller', month));

        case 10:
          nVolume = _context12.sent;
          _context12.next = 13;
          return regeneratorRuntime.awrap(getCashBackByBrand({
            _id: _id
          }, 'Neteller', month));

        case 13:
          nCashback = _context12.sent;
          _context12.next = 16;
          return regeneratorRuntime.awrap(getSubPartnerVolumeByBrand({
            _id: _id,
            isSubPartner: isSubPartner,
            month: month,
            brand: 'Neteller'
          }));

        case 16:
          nSubVol = _context12.sent;
          _context12.next = 19;
          return regeneratorRuntime.awrap(getSubPartnerCashbackByBrand({
            _id: _id,
            isSubPartner: isSubPartner,
            month: month,
            brand: 'Neteller'
          }));

        case 19:
          nSubCashback = _context12.sent;
          _context12.next = 22;
          return regeneratorRuntime.awrap(getNetworkShareVolumeByBrand({
            referredBy: referredBy,
            month: month,
            brand: 'Neteller'
          }));

        case 22:
          nNetworkShare = _context12.sent;
          _context12.next = 25;
          return regeneratorRuntime.awrap(getVolumeByBrand({
            _id: _id
          }, 'Skrill', month));

        case 25:
          sVolume = _context12.sent;
          _context12.next = 28;
          return regeneratorRuntime.awrap(getCashBackByBrand({
            _id: _id
          }, 'Skrill', month));

        case 28:
          sCashback = _context12.sent;
          _context12.next = 31;
          return regeneratorRuntime.awrap(getSubPartnerVolumeByBrand({
            _id: _id,
            isSubPartner: isSubPartner,
            month: month,
            brand: 'Skrill'
          }));

        case 31:
          sSubVol = _context12.sent;
          _context12.next = 34;
          return regeneratorRuntime.awrap(getSubPartnerCashbackByBrand({
            _id: _id,
            isSubPartner: isSubPartner,
            month: month,
            brand: 'Skrill'
          }));

        case 34:
          sSubCashback = _context12.sent;
          _context12.next = 37;
          return regeneratorRuntime.awrap(getNetworkShareVolumeByBrand({
            referredBy: referredBy,
            month: month,
            brand: 'Skrill'
          }));

        case 37:
          sNetworkShare = _context12.sent;
          _context12.next = 40;
          return regeneratorRuntime.awrap(getVolumeByBrand({
            _id: _id
          }, 'ecoPayz', month));

        case 40:
          eVolume = _context12.sent;
          _context12.next = 43;
          return regeneratorRuntime.awrap(getCashBackByBrand({
            _id: _id
          }, 'ecoPayz', month));

        case 43:
          eCashback = _context12.sent;
          _context12.next = 46;
          return regeneratorRuntime.awrap(getSubPartnerVolumeByBrand({
            _id: _id,
            isSubPartner: isSubPartner,
            month: month,
            brand: 'ecoPayz'
          }));

        case 46:
          eSubVol = _context12.sent;
          _context12.next = 49;
          return regeneratorRuntime.awrap(getSubPartnerCashbackByBrand({
            _id: _id,
            isSubPartner: isSubPartner,
            month: month,
            brand: 'ecoPayz'
          }));

        case 49:
          eSubCashback = _context12.sent;
          _context12.next = 52;
          return regeneratorRuntime.awrap(getNetworkShareVolumeByBrand({
            referredBy: referredBy,
            month: month,
            brand: 'ecoPayz'
          }));

        case 52:
          eNetworkShare = _context12.sent;
          return _context12.abrupt("return", res.status(200).send({
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
          _context12.prev = 56;
          _context12.t0 = _context12["catch"](3);
          return _context12.abrupt("return", res.status(403).send({
            success: false,
            msg: _context12.t0
          }));

        case 59:
          _context12.next = 62;
          break;

        case 61:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 62:
        case "end":
          return _context12.stop();
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
        return subPartners.reduce(function _callee13(total, nextSubPartner) {
          var acc, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, report;

          return regeneratorRuntime.async(function _callee13$(_context13) {
            while (1) {
              switch (_context13.prev = _context13.next) {
                case 0:
                  _context13.next = 2;
                  return regeneratorRuntime.awrap(total);

                case 2:
                  acc = _context13.sent;
                  _iteratorNormalCompletion = true;
                  _didIteratorError = false;
                  _context13.prev = 5;
                  _iterator = _asyncIterator(AffReport.find({
                    belongsToPartner: nextSubPartner._id,
                    brand: brand,
                    month: month,
                    'account.transValue': {
                      $gt: 0
                    }
                  }).select('account.transValue').lean());

                case 7:
                  _context13.next = 9;
                  return regeneratorRuntime.awrap(_iterator.next());

                case 9:
                  _step = _context13.sent;
                  _iteratorNormalCompletion = _step.done;
                  _context13.next = 13;
                  return regeneratorRuntime.awrap(_step.value);

                case 13:
                  _value = _context13.sent;

                  if (_iteratorNormalCompletion) {
                    _context13.next = 20;
                    break;
                  }

                  report = _value;
                  acc += report.account.transValue;

                case 17:
                  _iteratorNormalCompletion = true;
                  _context13.next = 7;
                  break;

                case 20:
                  _context13.next = 26;
                  break;

                case 22:
                  _context13.prev = 22;
                  _context13.t0 = _context13["catch"](5);
                  _didIteratorError = true;
                  _iteratorError = _context13.t0;

                case 26:
                  _context13.prev = 26;
                  _context13.prev = 27;

                  if (!(!_iteratorNormalCompletion && _iterator["return"] != null)) {
                    _context13.next = 31;
                    break;
                  }

                  _context13.next = 31;
                  return regeneratorRuntime.awrap(_iterator["return"]());

                case 31:
                  _context13.prev = 31;

                  if (!_didIteratorError) {
                    _context13.next = 34;
                    break;
                  }

                  throw _iteratorError;

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

var getNetworkShareVolumeByBrand = function getNetworkShareVolumeByBrand(_ref3) {
  var referredBy = _ref3.referredBy,
      month = _ref3.month,
      brand = _ref3.brand;

  if (referredBy) {
    return new Promise(function (resolve) {
      resolve(AffPartner.find({
        referredBy: referredBy
      }).select('_id').lean() // get all partners that have the SAME referredBy as this partner
      .then(function (partnersReferredBySameNetwork) {
        return partnersReferredBySameNetwork.reduce(function _callee14(total, nextPartner) {
          var acc, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _value2, report;

          return regeneratorRuntime.async(function _callee14$(_context14) {
            while (1) {
              switch (_context14.prev = _context14.next) {
                case 0:
                  _context14.next = 2;
                  return regeneratorRuntime.awrap(total);

                case 2:
                  acc = _context14.sent;
                  _iteratorNormalCompletion2 = true;
                  _didIteratorError2 = false;
                  _context14.prev = 5;
                  _iterator2 = _asyncIterator(AffReport.find({
                    belongsToPartner: nextPartner._id,
                    brand: brand,
                    month: month,
                    'account.transValue': {
                      $gt: 0
                    }
                  }).select('account.transValue').lean());

                case 7:
                  _context14.next = 9;
                  return regeneratorRuntime.awrap(_iterator2.next());

                case 9:
                  _step2 = _context14.sent;
                  _iteratorNormalCompletion2 = _step2.done;
                  _context14.next = 13;
                  return regeneratorRuntime.awrap(_step2.value);

                case 13:
                  _value2 = _context14.sent;

                  if (_iteratorNormalCompletion2) {
                    _context14.next = 20;
                    break;
                  }

                  report = _value2;
                  acc += report.account.transValue;

                case 17:
                  _iteratorNormalCompletion2 = true;
                  _context14.next = 7;
                  break;

                case 20:
                  _context14.next = 26;
                  break;

                case 22:
                  _context14.prev = 22;
                  _context14.t0 = _context14["catch"](5);
                  _didIteratorError2 = true;
                  _iteratorError2 = _context14.t0;

                case 26:
                  _context14.prev = 26;
                  _context14.prev = 27;

                  if (!(!_iteratorNormalCompletion2 && _iterator2["return"] != null)) {
                    _context14.next = 31;
                    break;
                  }

                  _context14.next = 31;
                  return regeneratorRuntime.awrap(_iterator2["return"]());

                case 31:
                  _context14.prev = 31;

                  if (!_didIteratorError2) {
                    _context14.next = 34;
                    break;
                  }

                  throw _iteratorError2;

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

var getSubPartnerCashbackByBrand = function getSubPartnerCashbackByBrand(_ref4) {
  var _id = _ref4._id,
      brand = _ref4.brand,
      month = _ref4.month,
      isSubPartner = _ref4.isSubPartner;

  if (isSubPartner) {
    return new Promise(function (resolve) {
      resolve(AffPartner.find({
        referredBy: _id
      }).select('_id').lean() // get all partners that have BEEN referredBy this partner
      .then(function (subPartners) {
        return subPartners.reduce(function _callee15(total, nextSubPartner) {
          var acc, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _value3, report;

          return regeneratorRuntime.async(function _callee15$(_context15) {
            while (1) {
              switch (_context15.prev = _context15.next) {
                case 0:
                  _context15.next = 2;
                  return regeneratorRuntime.awrap(total);

                case 2:
                  acc = _context15.sent;
                  _iteratorNormalCompletion3 = true;
                  _didIteratorError3 = false;
                  _context15.prev = 5;
                  _iterator3 = _asyncIterator(AffReport.find({
                    belongsToPartner: nextSubPartner._id,
                    brand: brand,
                    month: month,
                    'account.transValue': {
                      $gt: 0
                    }
                  }).select('account.subAffCommission').lean());

                case 7:
                  _context15.next = 9;
                  return regeneratorRuntime.awrap(_iterator3.next());

                case 9:
                  _step3 = _context15.sent;
                  _iteratorNormalCompletion3 = _step3.done;
                  _context15.next = 13;
                  return regeneratorRuntime.awrap(_step3.value);

                case 13:
                  _value3 = _context15.sent;

                  if (_iteratorNormalCompletion3) {
                    _context15.next = 20;
                    break;
                  }

                  report = _value3;
                  acc += report.account.subAffCommission;

                case 17:
                  _iteratorNormalCompletion3 = true;
                  _context15.next = 7;
                  break;

                case 20:
                  _context15.next = 26;
                  break;

                case 22:
                  _context15.prev = 22;
                  _context15.t0 = _context15["catch"](5);
                  _didIteratorError3 = true;
                  _iteratorError3 = _context15.t0;

                case 26:
                  _context15.prev = 26;
                  _context15.prev = 27;

                  if (!(!_iteratorNormalCompletion3 && _iterator3["return"] != null)) {
                    _context15.next = 31;
                    break;
                  }

                  _context15.next = 31;
                  return regeneratorRuntime.awrap(_iterator3["return"]());

                case 31:
                  _context15.prev = 31;

                  if (!_didIteratorError3) {
                    _context15.next = 34;
                    break;
                  }

                  throw _iteratorError3;

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

module.exports = router;