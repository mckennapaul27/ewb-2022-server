const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AffReportMonthly = new Schema({ 
    date: Date,
    month: String,
    lastUpdate: Date,
    brand: String,
    transValue: Number,
    commission: Number,
    cashback: Number,
    cashbackRate: Number,
    subAffCommission: Number,
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner',
        required: false
    }
});

module.exports = mongoose.model('affmonthly', AffReportMonthly);
