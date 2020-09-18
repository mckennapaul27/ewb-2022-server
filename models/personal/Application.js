const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Application = new Schema({ 
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
    dateAdded: {
        type: Date,
        default: Date.now
    },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner',
        required: false
    }
});

module.exports = mongoose.model('application', Application);
