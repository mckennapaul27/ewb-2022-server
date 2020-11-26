const path = require('path');
require('dotenv').config({ path: path.join( __dirname, '/.env' ) });;

const express = require('express');
const app = express();
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');

const mongoose = require('mongoose');
// mongoose.set('debug', true);
mongoose.Promise = global.Promise;

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const moment = require('moment-timezone');
const fileUpload = require('express-fileupload');
const dayjs = require('dayjs');
var localizedFormat = require('dayjs/plugin/localizedFormat')
dayjs.extend(localizedFormat)
dayjs().format('L LT')
const cron = require('node-cron');
const routes = require('./router');

const {
    DB_URL,
    SECRET,
    PORT,
    options,
    corsOptions
} = require('./config/config');

const {
    fetchAccountReport
} = require('./queries/paysafe-account-report');
const {
    fetchPlayerRegistrationsReport
} = require('./queries/paysafe-player-registrations-report');
const {
    fetchACIDReport
} = require('./queries/paysafe-acid-report')
const { 
    startOfMonthX,
    CURRENT_MONTH_NET_ACCOUNT_REPORT 
} = require('./queries/config');


app.use(fileUpload());
app.use(cors(corsOptions));
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());                                     
app.use(bodyParser.urlencoded({ extended: false }));               
app.use(bodyParser.text());                                    
app.use(express.static('public'));
app.use(passport.initialize());
app.use('/', routes); 

// cron.schedule('*/10 * * * * *', () => {
//     console.log('running a task every 10 seconds');
    
//     let time = dayjs(Date.now()).format('LTS');
//     let date = startOfMonthX(0);
//     let month = dayjs(Date.now()).subtract(1, 'months').format('MMMM YYYY')
//     // dayjs(Date.now()).subtract(1, 'months').format('MMMM YYYY')
//     // console.log(time, dayjs(date).format('DD/MM/YYYY'), month);
//     console.log(CURRENT_MONTH_NET_ACCOUNT_REPORT())
//     // fetchAccountReport(brand = 'Neteller', month, date)
// }, { timezone: 'Europe/London' });

// let date = startOfMonthX(0);
// let month = dayjs(Date.now()).subtract(1, 'months').format('MMMM YYYY')
// fetchPlayerRegistrationsReport (brand = 'Skrill', month, date);

// fetchAccountReport(brand = 'Neteller', month = 'November 2020', date = Number(startOfMonthX(0))) // need to configure this so that it resets date
// fetchACIDReport(brand = 'Neteller')
// fetchPlayerRegistrationsReport(brand = 'Neteller', month = 'October 2020', date = Number(startOfMonthX(6)))


// You can create a database variable outside of the database connection callback to reuse the connection pool in your app.
// let db;
// Connect to the database before starting the application server.
mongoose.connect(DB_URL, options)
.then(database => {
    app.listen(PORT, () => console.log('App listening on port...' + PORT))
}).catch(e => console.log(e));

module.exports = app;


