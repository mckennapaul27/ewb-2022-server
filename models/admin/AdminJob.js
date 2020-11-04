const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminJob = new Schema({ // 
    date: { type: Number, default: Date.now },
    message: String,
    completed: Boolean,
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: false
    }
});

module.exports = mongoose.model('adminjob', AdminJob);
