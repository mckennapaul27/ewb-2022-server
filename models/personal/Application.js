const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Application = new Schema({ 
    brand: String,
    accountId: {
        type: String,
        unique: true
    },
    email: String,
    tagged: {
        type: String,
        default: 'Pending'
    },
    upgradeStatus: { type: String, default: 'Not upgraded' }, 
    availableUpgrade: {
        status: String,
        valid: { type: Boolean, default: true }
    }, 
    requestCount: { type: Number, default: 1 }, // every time user requests we can  $inc: { requestCount: 1 } }, to make sure they don't keep requesting
    currency: String,
    dateAdded: { type: Number, default: Date.now },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'activeuser',
        required: false
    }
});

module.exports = mongoose.model('application', Application);
