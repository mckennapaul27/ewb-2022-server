const mongoose = require('mongoose')
const Schema = mongoose.Schema
const dayjs = require('dayjs')

const AffReportDaily = new Schema({
    epi: Number,
    date: Number,
    month: String,
    period: String,
    clicks: Number,
    registrations: Number,
    deposits: Number,
    transValue: Number,
    commission: Number,
    brand: String,
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner',
        required: false,
    },
})

AffReportDaily.pre('save', async function (next) {
    // https://medium.com/@justinmanalad/pre-save-hooks-in-mongoose-js-cf1c0959dba2
    const a = this
    try {
        if (a.isNew) {
            a.month = dayjs().subtract(1, 'days').format('MMMM YYYY')
            next()
        }
    } catch (error) {
        next()
    }
})

module.exports = mongoose.model('affreportdaily', AffReportDaily)
