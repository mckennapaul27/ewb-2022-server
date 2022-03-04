"use strict";

var proxy = process.env.QUOTAGUARDSTATIC_URL;

var util = require('util');

var request = require('superagent');

require('superagent-proxy')(request);

var parseString = require('xml2js').parseString;

var parseStringPromise = util.promisify(parseString);

var _require = require('../utils/helper-functions'),
    formatEpi = _require.formatEpi;

var _require2 = require('./map-aff-accounts-reports'),
    affDataReducer = _require2.affDataReducer;

var _require3 = require('./map-act-accounts-reports'),
    actDataReducer = _require3.actDataReducer;

var count = 0;

var fetchAccountReport = function fetchAccountReport(_ref) {
  var brand, month, date, url;
  return regeneratorRuntime.async(function fetchAccountReport$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          brand = _ref.brand, month = _ref.month, date = _ref.date, url = _ref.url;
          console.log('here: ', brand, month, date, url);

          (function _callee() {
            var res;
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.prev = 0;
                    _context.next = 3;
                    return regeneratorRuntime.awrap(request.get(url));

                  case 3:
                    res = _context.sent;
                    // .proxy(proxy)
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

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  });
};

var checkData = function checkData(res, brand, month, date, url) {
  var reports, data;
  return regeneratorRuntime.async(function checkData$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(parseStringPromise(res));

        case 3:
          reports = _context3.sent;

          if (reports['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['reportresponse']) {
            _context3.next = 10;
            break;
          }

          if (!(reports['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['SOAP-ENV:Fault'][0].faultstring[0] === 'no permission 1' || reports['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['SOAP-ENV:Fault'][0].faultstring[0] === 'no permission 2')) {
            _context3.next = 9;
            break;
          }

          throw new Error('Permission denied');

        case 9:
          throw new Error('No reports');

        case 10:
          data = reports['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0].reportresponse[0].row;
          console.log(data);
          return _context3.abrupt("return", mapRawData(data, brand, month, date));

        case 15:
          _context3.prev = 15;
          _context3.t0 = _context3["catch"](0);
          if (_context3.t0.message === 'Permission denied') setTimeout(function () {
            console.log(_context3.t0);
            count++;
            console.log("count: ".concat(count));
            fetchAccountReport({
              brand: brand,
              month: month,
              date: date,
              url: url
            }); // need to add fetchData parameters
          }, 500);

        case 18:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 15]]);
};

var mapRawData = function mapRawData(data, brand, month, date) {
  var siteIDs, results;
  return regeneratorRuntime.async(function mapRawData$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          siteIDs = ['109890', // Neteller Dashboard Form,
          '109887', // Neteller Landing Page Form,
          '109889', // Skrill Dashboard Form,
          '109888' // Skrill Landing Page Form,
          ];
          results = data.reduce(function (acc, item) {
            // all VK accounts must have vk-
            var isValidSiteId = item.affcustomid[0].includes('vk-');

            if (isValidSiteId) {
              acc.push({
                memberId: item.memberid[0],
                siteId: item.siteid[0],
                playerId: item.playerid[0],
                accountId: item.merchplayername[0],
                epi: parseInt(item.affcustomid[0].slice(item.affcustomid[0].lastIndexOf('-') + 1)),
                country: item.playercountry[0] === '' ? '' : item.playercountry[0],
                commission: Number(item.Commission[0]),
                //
                transValue: Number(item.Commission[0]) === 0 ? 0 : Number(item.trans_value[0]),
                deposits: Number(item.Deposits[0]),
                earnedFee: Number(item.Nettrans_to_fee[0])
              });
            }

            return acc;
          }, []); //

          actDataReducer(results, brand, month, date);
          affDataReducer(results, brand, month, date);

        case 4:
        case "end":
          return _context4.stop();
      }
    }
  });
};

module.exports = {
  fetchAccountReport: fetchAccountReport
}; // https://stackoverflow.com/questions/31978347/fs-writefile-in-a-promise-asynchronous-synchronous-stuff