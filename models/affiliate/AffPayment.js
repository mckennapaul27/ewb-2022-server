const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');

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

AffPayment.pre('validate', async function (next) {
    const a = this;
    if (a.isNew && !a.transactionId) {
        a.transactionId = uuidv4();
        next();
    };
    next();
});


module.exports = mongoose.model('affpayment', AffPayment);
