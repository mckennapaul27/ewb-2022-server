const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { setCurrency } = require('../../config/deals');

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

const getQuarterData = ({ month }) => { // use this to find current quarter from month input // for some reaspon have to include this function here instead of requiring it from /quarter-helpers.js - otherwise Affreport in quarter-helpers.js does not work
    const m = month.slice(0, -5);
    const year = month.slice(-4);
    const quarter = `${quarters[m]} ${year}`;
    const months = quartersArr[quarters[m]].map(x => `${x} ${year}`);
    const startDate = Number(dayjs(months[0]).startOf('month').format('x'));
    const endDate = Number(dayjs(months[2]).endOf('month').format('x'));
    return Promise.resolve({
        months,
        quarter,
        startDate,
        endDate
    });
};

module.exports = mongoose.model('report', Report);