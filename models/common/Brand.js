const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Brand = new Schema({
    brand: String,
    branding: {
        colorHex: String,
        colorClass: String,
        currencyValue: String,
        currencySymbol: String,
    },
    link: String,
    infoLink: String,
    initialUpgrade: String,
    benefits: [String],
    terms: [String]
});

module.exports = mongoose.model('brand', Brand);