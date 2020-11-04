const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { initialUpgrades } = require('../../config/deals');
const dayjs = require('dayjs');

const Application = new Schema({ 
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
        valid: { type: Boolean, default: false }
    }, 
    requestCount: { type: Number, default: 1 }, // every time user requests we can  $inc: { requestCount: 1 } }, to make sure they don't keep requesting
    currency: String,
    dateAdded: { type: Number, default: Date.now },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'activeuser',
        required: false
    }
});

Application.pre('save', function (next) { // https://stackoverflow.com/questions/30141492/mongoose-presave-does-not-trigger
    const a = this; // a = affApplication
    a.availableUpgrade.status = initialUpgrades[a.brand],
    a.availableUpgrade.valid = false;
    a.upgradeStatus = `Requested ${dayjs().format('DD/MM/YYYY')}`; 
    next();   
});

module.exports = mongoose.model('application', Application);
