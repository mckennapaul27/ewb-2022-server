const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { setCurrency } = require('../../config/deals');

const Report = new Schema({
    date: Number, // first day of month
    month: String, // Format as August 2020
    lastUpdate: { type: Number, default: Date.now },
    brand: String,
    account: {
        accountId: String,  
        deposits: { type: Number, default: 0 },
        transValue: { type: Number, default: 0 },
        commission: { type: Number, default: 0 },
        cashback: { type: Number, default: 0 },
        cashbackRate: { type: Number, default: 0 },
        rafCashback: { type: Number, default: 0 },
        earnedFee: { type: Number, default: 0 },
        currency: String // this is so we can calculate balances per currency
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

// using pre validate to set report currency - very important for calculating balances.
Report.pre('validate', function (next) { // https://stackoverflow.com/questions/30141492/mongoose-presave-does-not-trigger
    const report = this;
    report.account.currency = setCurrency(report.brand);
    next();
})

module.exports = mongoose.model('report', Report);