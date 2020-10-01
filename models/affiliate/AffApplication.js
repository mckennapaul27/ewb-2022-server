const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AffApplication = new Schema({ 
    brand: String,
    accountId: {
        type: String,
        unique: true
    },
    email: String,
    status: {
        type: String,
        default: 'Pending'
    },
    upgradeStatus: {
        type: String,
        default: 'Not upgraded'
    },
    currency: String,
    dateAdded: { type: Number, default: Date.now },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner',
        required: false
    }
});

module.exports = mongoose.model('affapplication', AffApplication);
