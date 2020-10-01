const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Payment = new Schema({ 
    amount: Number,
    status: { // we need status for back end filtering
        type: String,
        default: 'Requested'
    },
    requestDate: { type: Number, default: Date.now },
    paidDate: Number,
    transactionId: String,
    currency: String,
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'activeuser',
        required: false
    }
});


module.exports = mongoose.model('payment', Payment);
