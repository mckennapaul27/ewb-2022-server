const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AffCounter = new Schema({ 
    _id: String,
    seq: Number
});

module.exports = mongoose.model('affcounter', AffCounter);
