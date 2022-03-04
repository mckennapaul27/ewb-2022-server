const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '/.env') })

const MONGO_PROD_URI = process.env.MONGO_PROD_URI
const TEST_DATA_TRANSFER_URL = process.env.TEST_DATA_TRANSFER_URL
const LOCAL_DB_URL = process.env.MONGO_DEV_URI
const SECRET = process.env.SECRET_KEY
const PORT = process.env.PORT || 4000

// const DB_URL = process.env.NODE_ENV !== 'dev' ? MONGODB_ATLAS_URI : TEST_DATA_TRANSFER_URL;
const DB_URL = MONGO_PROD_URI

const options = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
    // autoIndex: true,
}
const whiteList = () => {
    let allowed = [
        'https://ewalletbooster.com',
        'https://ewalletbooster.co.uk',
        'https://www.ewalletbooster.com',
        'https://www.ewalletbooster.co.uk',
        'https://ewalletbooster-admin.herokuapp.com',
        'https://ewalletbooster-new-2019.herokuapp.com',
        'https://ewalletbooster.eu.ngrok.io',
        'https://ewalletbooster.eu.ngrok.io',
        'https://ewb-admin-2021.herokuapp.com',
        'https://ewb-frontend-2021.herokuapp.com',
        'http://www.ewalletbroker.com',
        'https://www.ewalletbroker.com',
        'https://ewalletbroker.com',
        'https://ewalletbroker.com',
        'https://www.volumekings.com',
        'https:/volumekings.com',
    ]
    if (process.env.NODE_ENV === 'dev') {
        allowed.push('http://localhost:3000')
        allowed.push('http://localhost:3001')
        allowed.push('http://localhost:3002')
    }
    return allowed
}

const corsOptions = {
    origin: function (origin, callback) {
        if (whiteList().indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error(`Origin: ${origin} Not allowed by CORS`))
        }
    },
}

module.exports = {
    DB_URL,
    LOCAL_DB_URL,
    TEST_DATA_TRANSFER_URL,
    SECRET,
    PORT,
    options,
    corsOptions,
}
