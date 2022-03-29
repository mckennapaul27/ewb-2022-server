const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AffMonthlySummary = new Schema({
    date: {
        type: Number,
        required: true, // first day of month
    },
    month: String,
    clicks: Number,
    conversions: Number,
    points: Number,
    epi: Number,
    commissionEUR: Number,
    commissionUSD: Number,
    subCommissionEUR: Number,
    subCommissionUSD: Number,
    lastUpdate: Date,

    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner',
        required: true,
    },
})

AffMonthlySummary.pre('save', async function (next) {
    // https://medium.com/@justinmanalad/pre-save-hooks-in-mongoose-js-cf1c0959dba2
    const a = this
    try {
        if (a.isNew) {
            next()
        } else {
            next()
        }
    } catch (error) {
        next()
    }
})

module.exports = mongoose.model('affmonthlysummary', AffMonthlySummary)
