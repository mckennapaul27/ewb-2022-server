const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AffApproval = new Schema({
    brand: String,
    accountId: String,
    name: String,
    status: {
        type: String,
        default: 'Pending',
    },
    dateAdded: { type: Number, default: Date.now },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner',
        required: false,
    },
})

module.exports = mongoose.model('affapproval', AffApproval)
