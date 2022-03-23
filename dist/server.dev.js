"use strict";

var path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '/.env')
});

var express = require('express');

var app = express();

var session = require('express-session');

var cors = require('cors');

var helmet = require('helmet');

var compression = require('compression');

var mongoose = require('mongoose'); // mongoose.set('debug', true)


mongoose.Promise = global.Promise;

var MongoStore = require('connect-mongo')(session);

var cookieParser = require('cookie-parser');

var bodyParser = require('body-parser');

var passport = require('passport');

var fileUpload = require('express-fileupload');

var routes = require('./router');

var _require = require('./config/config'),
    DB_URL = _require.DB_URL,
    LOCAL_DB_URL = _require.LOCAL_DB_URL,
    SECRET = _require.SECRET,
    PORT = _require.PORT,
    options = _require.options,
    corsOptions = _require.corsOptions;

var Admin = require('./models/admin/Admin'); // const { UserCounter } = require('./models/common')
// const { AffCounter } = require('./models/affiliate')


var DB = process.env.NODE_ENV === 'dev' ? LOCAL_DB_URL : DB_URL; // const DB = DB_URL

var dayjs = require('dayjs');

var advancedFormat = require('dayjs/plugin/advancedFormat');

dayjs.extend(advancedFormat);

var _require2 = require('./models/affiliate/index'),
    AffAccount = _require2.AffAccount,
    AffReport = _require2.AffReport,
    AffReportDaily = _require2.AffReportDaily;

app.use(compression());
app.use(fileUpload());
app.use(cors(corsOptions));
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.text());
app.use(express["static"]('public'));
app.use(passport.initialize());
app.use('/', routes); // console.log(DB_URL);

if (process.env.NODE_ENV !== 'dev') {
  app.use(session({
    secret: SECRET,
    saveUninitialized: false,
    // don't create session until something stored
    resave: false,
    // don't save session if unmodified
    store: new MongoStore({
      url: DB_URL,
      touchAfter: 24 * 3600 // time period in seconds

    })
  }));
} //
// AffReportDaily.create({
//     epi: 100721,
//     date: Number(dayjs().subtract(1, 'days').format('x')),
//     period: '1-3-22',
//     clicks: 5,
//     registrations: 13,
//     deposits: 0,
//     transValue: 500,
//     commission: 100,
//     brand: 'Neteller',
//     belongsTo: '6203dbf7a48a5250152b7d5c',
// })
// Admin.create({ // still need to set this up in production
//     name: 'Paul McKenna',
//     username: 'superadmin',I f
//     email: 'mckennapaul27@gmail.com',
//     password: 'n5_YG`)>TdY&,up',
// })
// const newCounter = UserCounter.create({ _id: 'userid', seq: 212150 })
// AffCounter.create({ _id: 'partnerid', seq: 138945 })
// You can create a database variable outside of the database connection callback to reuse the connection pool in your app.
// let db;
// Connect to the database before starting the application server.


mongoose.connect(DB, options).then(function (database) {
  app.listen(PORT, function () {
    return console.log('App listening on port...' + PORT);
  }); // listen to the app before doing anything else
})["catch"](function (e) {
  return console.log(e);
});
module.exports = app; // ;(async () => {
//     const accs = [
//         '451312341331',
//         '451412341432',
//         '451512341533',
//         '451612341634',
//         '451712341735',
//         '451712341836',
//     ]
//     accs.map(async (acc) => {
//         const affaccount = await AffAccount.create({
//             brand: 'Neteller',
//             accountId: acc,
//             country: 'GB',
//             belongsTo: '6203dbf7a48a5250152b7d5c',
//             // reports: [
//             //     {
//             //         type: mongoose.Schema.Types.ObjectId,
//             //         ref: 'affreport',
//             //     },
//             // ],
//         })
//         const months = [('January 2022', 'February 2022')]
//         months.map(async (month) => {
//             const deposits = Number((Math.random() * 1000).toFixed(2))
//             const transValue = Number((Math.random() * 100000).toFixed(2))
//             const commission = transValue * Number(Math.random().toFixed(2))
//             const cashback = commission * 0.785
//             const commissionRate = commission / transValue
//             const cashbackRate = cashback / transValue
//             const subAffCommission = cashback * 0.1
//             const earnedFee = commission * 5
//             const profit = commission - (cashback + subAffCommission)
//             const a = await AffReport.create({
//                 date: dayjs().startOf('month').format('x'),
//                 month,
//                 brand: 'Neteller',
//                 account: {
//                     accountId: affaccount.accountId,
//                     deposits,
//                     transValue,
//                     commission,
//                     cashback,
//                     commissionRate, // need to start storing this in data so that we can access in react-table filters
//                     cashbackRate,
//                     subAffCommission,
//                     earnedFee,
//                     profit, // need to start storing this in data so that we can access in react-table filters
//                 },
//                 siteId: 105205,
//                 country: 'GB',
//                 epi: 100721,
//                 belongsTo: affaccount._id,
//                 belongsToPartner: '6203dbf7a48a5250152b7d5c',
//             })
//         })
//     })
// })()