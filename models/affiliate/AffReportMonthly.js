const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { setCurrency } = require('../../config/deals');
const AffPartner = require('./AffPartner');

const AffReportMonthly = new Schema({ 
    date: {
        type: Number,
        required: true // first day of month
    },
    month: String,
    lastUpdate: Date,
    brand: String,
    transValue: Number,
    commission: Number,
    cashback: Number,
    cashbackRate: Number,
    subAffCommission: Number,
    commissionRate: Number,
    currency: { type: String, required: true },
    profit: Number,
    epi: Number,
    referredByEpi: Number,
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner',
        required: false
    }
});

// using pre validate to set report currency - very important for calculating balances.
AffReportMonthly.pre('validate', async function (next) { // https://stackoverflow.com/questions/30141492/mongoose-presave-does-not-trigger
    try {
        const report = this;
        const partner = await AffPartner.findById(report.belongsTo).select('epi referredBy').populate({ path: 'referredBy', select: 'epi' });
        report.epi = partner.epi; // setting epi
        report.referredByEpi = partner.referredBy ? partner.referredBy.epi : null; // setting referredByEpi
        report.currency = setCurrency(report.brand); // setting currency (this does not always work because when we set account: {} object properties in map-dashboard-data etc we update full object)
        next();
    } catch (error) {
        console.log('error: ', error);
        next(error);
    } 
});

module.exports = mongoose.model('affmonthly', AffReportMonthly);
