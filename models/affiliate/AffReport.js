const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { setCurrency } = require('../../config/deals');

const AffReport = new Schema({ 
    date: {
        type: Number,
        required: true // first day of month
    },
    month: String,
    lastUpdate: { type: Number, default: Date.now },
    brand: String,
    email: String,
    account: {
        accountId: String,  
        deposits: Number,
        transValue: Number,
        commission: Number,
        cashback: Number,
        commissionRate: Number, // need to start storing this in data so that we can access in react-table filters
        cashbackRate: Number,
        subAffCommission: Number,
        earnedFee: Number,
        currency: String, // this is so we can calculate balances on the aggregation. Very important that we set this according to the brand!!
        profit: Number // need to start storing this in data so that we can access in react-table filters
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

// using pre validate to set report currency - very important for calculating balances.
AffReport.pre('validate', function (next) { // https://stackoverflow.com/questions/30141492/mongoose-presave-does-not-trigger
    const report = this;
    report.account.currency = setCurrency(report.brand);
    next();
})

module.exports = mongoose.model('affreport', AffReport);
