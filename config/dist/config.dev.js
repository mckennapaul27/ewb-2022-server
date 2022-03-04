"use strict";

var path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '/.env')
});

var LOCAL_DB_URL = process.env.MONGO_DEV_URI;
var DB_URL = process.env.MONGO_PROD_URI;
var SECRET = process.env.SECRET_KEY;
var PORT = process.env.PORT || 4000;
var options = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true // autoIndex: true,

};

var whiteList = function whiteList() {
  var allowed = ['https://ewalletbooster.com', 'https://ewalletbooster.co.uk', 'https://www.ewalletbooster.com', 'https://www.ewalletbooster.co.uk', 'https://ewalletbooster-admin.herokuapp.com', 'https://ewalletbooster-new-2019.herokuapp.com', 'https://ewalletbooster.eu.ngrok.io', 'https://ewalletbooster.eu.ngrok.io', 'https://ewb-admin-2021.herokuapp.com', 'https://ewb-frontend-2021.herokuapp.com', 'http://www.ewalletbroker.com', 'https://www.ewalletbroker.com', 'https://ewalletbroker.com', 'https://ewalletbroker.com', 'https://www.volumekings.com', 'https:/volumekings.com'];

  if (process.env.NODE_ENV === 'dev') {
    allowed.push('http://localhost:3000');
    allowed.push('http://localhost:3001');
    allowed.push('http://localhost:3002');
  }

  return allowed;
};

var corsOptions = {
  origin: function origin(_origin, callback) {
    if (whiteList().indexOf(_origin) !== -1 || !_origin) {
      callback(null, true);
    } else {
      callback(new Error("Origin: ".concat(_origin, " Not allowed by CORS")));
    }
  }
};
module.exports = {
  DB_URL: DB_URL,
  LOCAL_DB_URL: LOCAL_DB_URL,
  TEST_DATA_TRANSFER_URL: TEST_DATA_TRANSFER_URL,
  SECRET: SECRET,
  PORT: PORT,
  options: options,
  corsOptions: corsOptions
};