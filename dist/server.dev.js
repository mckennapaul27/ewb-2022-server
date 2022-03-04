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
} // Admin.create({ // still need to set this up in production
//     name: 'Paul McKenna',
//     username: 'superadmin',
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
module.exports = app;