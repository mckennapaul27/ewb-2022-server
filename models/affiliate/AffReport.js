const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AffReport = new Schema({ 
    date: {
        type: Date,
        required: true
    },
    month: String,
    lastUpdate: Date,
    brand: String,
    email: String,
    account: {
        accountId: String,  
        deposits: Number,
        transValue: Number,
        commission: Number,
        cashback: Number,
        cashbackRate: Number,
        subAffCommission: Number,
        earnedFee: Number
    },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affaccount',
        required: false
    },
    belongsToPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner',
        required: false
    }
});

module.exports = mongoose.model('affreport', AffReport);
