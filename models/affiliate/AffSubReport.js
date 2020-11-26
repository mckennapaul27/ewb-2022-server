const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AffSubReport = new Schema({ 
    date: Number, // first day of month
    month: String,
    lastUpdate: { type: Number, default: Date.now }, // The static Date.now() method returns the number of milliseconds elapsed since January 1, 1970 00:00:00 UTC
    brand: String,
    email: String,
    epi: Number,
    transValue: Number,
    deposits: Number,
    commission: Number,
    cashback: Number,
    subAffCommission: Number,
    cashbackRate: Number,
    currency: String,
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner',
        required: false
    }
});

module.exports = mongoose.model('affsubreport', AffSubReport);
