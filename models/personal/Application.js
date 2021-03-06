const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Brand = require('../common/Brand')
const dayjs = require('dayjs')

const Application = new Schema({
    brand: String,
    accountId: { type: String, unique: true },
    email: String,
    status: {
        type: String,
        default: 'Pending',
    },
    upgradeStatus: { type: String, default: 'Not upgraded' },
    availableUpgrade: {
        status: String,
        valid: { type: Boolean, default: false },
    },
    requestCount: { type: Number, default: 1 }, // every time user requests we can  $inc: { requestCount: 1 } }, to make sure they don't keep requesting
    currency: String,
    dateAdded: { type: Number, default: Date.now },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'activeuser',
        required: false,
    },
    applicationToken: String,
    applicationExpires: Date,
})

Application.pre('save', async function (next) {
    // https://stackoverflow.com/questions/30141492/mongoose-presave-does-not-trigger
    const a = this // a = affApplicatiom
    a.availableUpgrade.valid = false
    a.upgradeStatus = `Requested ${dayjs().format('DD/MM/YYYY')}`
    next()
})

module.exports = mongoose.model('application', Application)

// a.availableUpgrade.status = initialUpgrades[a.brand],
