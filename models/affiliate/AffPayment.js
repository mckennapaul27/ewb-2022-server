const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AffPayment = new Schema({ 
    amount: Number,
    status: { // we need status for back end filtering
        type: String,
        default: 'Requested'
    },
    requestDate: { type: Number, default: Date.now },
    paidDate: Number,
    transactionId: String,
    currency: String,
    brand: String,
    paymentAccount: String, // can be email for Skrill, Neteller & ecoPayz and phoneCode + phoneNumber for MuchBetter and wallet address for BTC
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner',
        required: false
    }
});


module.exports = mongoose.model('affpayment', AffPayment);
