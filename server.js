const path = require('path');
require('dotenv').config({ path: path.join( __dirname, '/.env' ) });;

const express = require('express');
const app = express();
const session = require('express-session');
const cors = require('cors');

const mongoose = require('mongoose');
// mongoose.set('debug', true);
mongoose.Promise = global.Promise;

const bodyParser = require('body-parser');
const passport = require('passport');
const moment = require('moment-timezone');

const routes = require('./router');

const {
    DB_URL,
    SECRET,
    PORT,
    options,
    corsOptions
} = require('./config')

app.use(cors(corsOptions));
app.use(bodyParser.json());                                     
app.use(bodyParser.urlencoded({ extended: true }));               
app.use(bodyParser.text());                                    
app.use(bodyParser.json({ type: 'application/json'})); 
app.use(express.static('public'));
app.use(passport.initialize());
app.use('/', routes); 

// You can create a database variable outside of the database connection callback to reuse the connection pool in your app.
// let db;
// Connect to the database before starting the application server.
mongoose.connect(DB_URL, options)
.then(database => {
    return app.listen(PORT, () => console.log('App listening on port...' + PORT))
}).catch(e => console.log(e));

module.exports = app;


