const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '/.env') })

const express = require('express')
const app = express()
const session = require('express-session')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')

const mongoose = require('mongoose')
// mongoose.set('debug', true);
mongoose.Promise = global.Promise
const MongoStore = require('connect-mongo')(session)

const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const passport = require('passport')
const fileUpload = require('express-fileupload')

const routes = require('./router')

const {
    DB_URL,
    SECRET,
    PORT,
    options,
    corsOptions,
} = require('./config/config')
const {
    setPersonalQuarterData,
    setAffQuarterData,
} = require('./utils/quarter-helpers')
const { changeIsPermitted } = require('./utils/change-data')
const { updatePartnerStats } = require('./queries/map-aff-dashboard-data')

app.use(compression())
app.use(fileUpload())
app.use(cors(corsOptions))
app.use(helmet())
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.text())
app.use(express.static('public'))
app.use(passport.initialize())
app.use('/', routes)

// console.log(DB_URL);

if (process.env.NODE_ENV !== 'dev') {
    app.use(
        session({
            secret: SECRET,
            saveUninitialized: false, // don't create session until something stored
            resave: false, // don't save session if unmodified
            store: new MongoStore({
                url: DB_URL,
                touchAfter: 24 * 3600, // time period in seconds
            }),
        })
    )
}

// changeIsPermitted()

// updatePartnerStats('Neteller', 'July 2021', 1625094000000)

// setPersonalQuarterData({ month: 'May 2021', accountId: '107423543', brand: 'Skrill' });
// setAffQuarterData({ month: 'May 2021', accountId: '552526513171', brand: 'Neteller', _id: '5ec92bf37a156f00049926e5' })
// You can create a database variable outside of the database connection callback to reuse the connection pool in your app.
// let db;
// Connect to the database before starting the application server.
mongoose
    .connect(DB_URL, options)
    .then((database) => {
        app.listen(PORT, () => console.log('App listening on port...' + PORT)) // listen to the app before doing anything else
    })
    .catch((e) => e)

module.exports = app
