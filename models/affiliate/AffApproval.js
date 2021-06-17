const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AffApproval = new Schema({
    brand: String,
    accountId: String,
    name: String,
    dateAdded: { type: Number, default: Date.now },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner',
        required: false,
    },
})

module.exports = mongoose.model('affapproval', AffApproval)
