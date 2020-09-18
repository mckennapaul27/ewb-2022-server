const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AffNotification = new Schema({ 
    message: String,
    read: {
        type: Boolean,
        default: false
    },
    type: String,
    createDate: Date,
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner',
        required: false
    }
});


module.exports = mongoose.model('affnotification', AffNotification);
