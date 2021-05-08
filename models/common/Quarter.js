const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Quarter = new Schema({ 
    brand: String,
    accountId: String,
    quarter: String, // Q1 2020
    months: [], //  'January 2020', 'February 2020', 'March 2020' 
    transValue: Number
});

module.exports = mongoose.model('quarter', Quarter);



