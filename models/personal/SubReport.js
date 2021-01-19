const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubReport = new Schema({ 
    date: Number, // first day of month
    month: String,
    lastUpdate: { type: Number, default: Date.now }, // The static Date.now() method returns the number of milliseconds elapsed since January 1, 1970 00:00:00 UTC
    userId: Number,
    transValue: Number,
    deposits: Number,
    commission: Number,
    cashback: Number,
    rafCommission: Number,
    cashbackRate: Number,
    currency: String,
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'activeuser',
        required: false
    }
});

module.exports = mongoose.model('subreport', SubReport);
