const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dayjs = require('dayjs');

const AffAccount = new Schema({ 
    brand: String,
    accountId: String,
    upgradeStatus: {
        type: String,
        default: 'Click to request VIP'
    },
    dateAdded: { type: Number, default: Date.now },
    reports: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affreport'
    }],
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner',
        required: false
    }
});

AffAccount.pre('save', function (next) { // https://stackoverflow.com/questions/30141492/mongoose-presave-does-not-trigger
    const a = this; // a = affApplication
    a.upgradeStatus = `Requested ${dayjs().format('DD/MM/YYYY')}`; 
    next();   
});

module.exports = mongoose.model('affaccount', AffAccount);