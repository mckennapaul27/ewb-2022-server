const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Account = new Schema({
    brand: String,
    account: {
        accountId: {
            type: String,
            unique: true
        },
        regDate: { type: Number, default: Date.now },
        country: String,
        currency: String
    },
    accountEmail: String,
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'activeuser'
    },
    reports: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'report'
    }]
});

module.exports = mongoose.model('account', Account);