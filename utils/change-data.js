const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const C = require('chance')
const moment = require('moment')
const chance = new C();
const {
    UserCounter,
    Notification,
    App
} = require('../models/common/index')
const {
    Report,
    Application
} = require('../models/personal/index')
const {
    AffAccount,
    AffReport
} = require('../models/affiliate/index')
const {
    LOCAL_DB_URL,
    SECRET,
    PORT,
    options,
    corsOptions
} = require('../config/config');
const AffCounter = require('../models/affiliate/AffCounter');

const AffPartner = require('../models/affiliate/AffPartner');
const { updateApplication } = require('../utils/notifications-list');

const dayjs = require('dayjs');
const advancedFormat = require('dayjs/plugin/advancedFormat');
const AffApplication = require('../models/affiliate/AffApplication');
dayjs.extend(advancedFormat);




setAffApplicationStatus()







  
module.exports = {
    seedDatabase,
}