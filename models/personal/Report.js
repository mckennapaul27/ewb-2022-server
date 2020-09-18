const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Report = new Schema({
    date: Date,
    month: String,
    lastUpdate: Number,
    brand: String,
    account: {
        accountId: String,  
        deposits: Number,
        transValue: Number,
        commission: Number,
        cashback: Number,
        cashbackRate: Number,
        rafCashback: Number,
        earnedFee: Number
    },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        // required: false
    },
    belongsToActiveUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'activeuser'
    }
});

module.exports = mongoose.model('report', Report);