const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AffSubReport = new Schema({ 
    date: Date,
    month: String,
    brand: String,
    email: String,
    epi: Number,
    transValue: Number,
    commission: Number,
    cashback: Number,
    subAffCommission: Number,
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner',
        required: false
    }
});

module.exports = mongoose.model('affsubreport', AffSubReport);
