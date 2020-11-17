const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AffReportDaily = new Schema({ 
    epi: Number,
    date: Number,
    period: String,
    clicks: Number,
    registrations: Number,
    deposits: Number,
    transValue: Number,
    commission: Number,
    brand: String,
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner',
        required: false
    }
});

module.exports = mongoose.model('affreportdaily', AffReportDaily);
