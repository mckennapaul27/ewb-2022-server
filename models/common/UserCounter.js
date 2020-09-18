const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const UserCounter = new Schema({ 
    _id: String,
    seq: Number
});

module.exports = mongoose.model('usercounter', UserCounter);
