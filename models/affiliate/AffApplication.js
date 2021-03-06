const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { defaultSiteId } = require('../../config/deals')
const dayjs = require('dayjs')

const AffApplication = new Schema({
    brand: String,
    accountId: { type: String, unique: true },
    email: String,
    siteId: Number,
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
        ref: 'affpartner',
        required: false,
    },
})

AffApplication.pre('validate', async function (next) {
    // https://stackoverflow.com/questions/30141492/mongoose-presave-does-not-trigger
    const a = this // a = affApplication
    if (!a.siteId) a.siteId = defaultSiteId[a.brand] // if no siteId is provided on creation - use defauly siteIds
    // const { initialUpgrade } = await Brand.findOne({ brand: a.brand }).select('initialUpgrade').lean();
    a.availableUpgrade.status = initialUpgrade[a.brand]
    a.availableUpgrade.valid = false
    a.upgradeStatus = `Requested ${dayjs().format('DD/MM/YYYY')}`
    next()
})

const initialUpgrade = {
    Neteller: 'Fast Silver',
    Skrill: 'Fast Silver',
    ecoPayz: 'Gold',
}

module.exports = mongoose.model('affapplication', AffApplication)
