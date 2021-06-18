const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Allow = new Schema({
    _id: String,
    status: Boolean,
})

module.exports = mongoose.model('allow', Allow)
