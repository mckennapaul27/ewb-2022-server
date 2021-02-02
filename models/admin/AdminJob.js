const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminJob = new Schema({ // 
    date: { type: Number, default: Date.now },
    message: String,
    completed: { type: Boolean, default: false },
    status: String,
    type: String,
    partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner'
    },
    activeUser: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'activepartner'
    } 
});

module.exports = mongoose.model('adminjob', AdminJob);

// statuses
// Pending, Completed, Error