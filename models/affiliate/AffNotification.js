const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AffNotification = new Schema({ 
    message: String,
    read: { type: Boolean, default: false },
    type: String,
    createdAt: { 
        type: Number, 
        default: Date.now, // we don't call this function with Date.now() otherwise it would store it once,       
    },   
    isGeneral: { type: Boolean, default: false }, // so we can add general notification from admin which shows in everybody's accounts
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner',
        required: false
    }
});


module.exports = mongoose.model('affnotification', AffNotification);
