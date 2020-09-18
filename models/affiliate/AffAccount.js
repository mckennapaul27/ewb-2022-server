const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AffAccount = new Schema({ 
    brand: String,
    account: { // this is all time stats for this account
        accountId: String,
        country: String,
        currency: String,  
        transValue: Number,     
        commission: Number,
        cashback: Number
    },
    upgradeStatus: {
        type: String,
        default: 'Click to request VIP'
    },
    dateAdded: Date, // date added is when they linked to ewalletbooster partner account so essentially when the applicaion is confirmed.
    accountEmail: String,
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

module.exports = mongoose.model('affaccount', AffAccount);