const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { setCurrency } = require('../../config/deals');
const { getQuarterData } = require('../../utils/quarter-data');

const Report = new Schema({
    date: Number, // first day of month
    month: String, // Format as August 2020
    lastUpdate: { type: Number, default: Date.now },
    brand: String,
    country: String,
    account: {
        accountId: String,  
        deposits: Number,
        transValue: Number,
        commission: Number,
        cashback: Number, // Y
        cashbackRate: Number, 
        commissionRate: Number, // need to start storing this in data so that we can access in react-table filters
        rafCashback: Number, // Y
        earnedFee: Number,
        currency: String, // this is so we can calculate balances per currency,
        profit: Number // Y // need to start storing this in data so that we can access in react-table filters
    },
    quarter: String,
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
    },
    belongsToActiveUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'activeuser'
    }
});

// using pre validate to set report currency - very important for calculating balances.
Report.pre('validate', async function (next) { // https://stackoverflow.com/questions/30141492/mongoose-presave-does-not-trigger
    const report = this;
    report.account.currency = setCurrency(report.brand);
    report.quarter = (report.brand === 'Skrill' || report.brand === 'Neteller') ? (await getQuarterData({ month: report.month })).quarter : '-'; // if brand is skrill or neteller, set the quarter of the report
    next();
});



module.exports = mongoose.model('report', Report);