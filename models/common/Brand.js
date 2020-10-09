const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Brand = new Schema({
    name: String,
    branding: {
        colorHex: String,
        colorClass: String,
        currencyValue: String,
        currencySymbol: String,
    },
    properties: {
        accountId: RegExp,
        link: String
    },
    benefits: [{
        text: String 
    }]
});

module.exports = mongoose.model('brand', Brand);