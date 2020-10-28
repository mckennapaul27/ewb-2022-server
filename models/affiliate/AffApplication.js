const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { initialUpgrades } = require('../../config/deals');
const dayjs = require('dayjs');

const AffApplication = new Schema({ 
    brand: String,
    accountId: { type: String, unique: true },
    email: String,
    status: {
        type: String,
        default: 'Pending'
    },
    upgradeStatus: { type: String, default: 'Not upgraded' },
    availableUpgrade: {
        status: String,
        valid: { type: Boolean, default: true }
    }, 
    vipExpiry: Number, 
    requestCount: { type: Number, default: 1 }, // every time user requests we can  $inc: { requestCount: 1 } }, to make sure they don't keep requesting
    currency: String,
    dateAdded: { type: Number, default: Date.now },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner',
        required: false
    }
});

AffApplication.pre('save', function (next) { // https://stackoverflow.com/questions/30141492/mongoose-presave-does-not-trigger
    const a = this; // a = affApplication
    a.availableUpgrade.status = initialUpgrades[a.brand],
    a.availableUpgrade.valid = false;
    a.upgradeStatus = `Requested ${dayjs().format('DD/MM/YYYY')}`; 
    next();   
});

AffApplication.pre('findOneAndUpdate', async function () { // https://stackoverflow.com/questions/44614734/modifying-mongoose-document-on-pre-hook-of-findoneandupdate
    // const docToUpdate = await this.model.findOne(this.getQuery())
})

module.exports = mongoose.model('affapplication', AffApplication);

