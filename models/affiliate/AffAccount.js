const mongoose = require('mongoose')
const Schema = mongoose.Schema
const AffNotification = require('./AffNotification')
const AffPartner = require('./AffPartner')
const { User } = require('../common/index')
const dayjs = require('dayjs')

const { affAccountAdded } = require('../../utils/notifications-list')

const AffAccount = new Schema({
    brand: String,
    accountId: String,
    country: String,
    dateAdded: { type: Number, default: Date.now },
    monthAdded: String,
    reports: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'affreport',
        },
    ],
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner',
        required: false,
    },
})

AffAccount.pre('save', async function (next) {
    // https://medium.com/@justinmanalad/pre-save-hooks-in-mongoose-js-cf1c0959dba2
    const a = this
    try {
        if (a.isNew) {
            a.monthAdded = dayjs().format('MMMM YYYY')
            const partner = await AffPartner.findById(a.belongsTo)
                .select('email belongsTo')
                .lean()

            const { locale } = await User.findById(partner.belongsTo)
                .select('locale')
                .lean()
            await createAffNotification(
                // updated 1st April
                affAccountAdded({
                    locale,
                    belongsTo: a.belongsTo,
                    accountId: a.accountId,
                })
            )

            next()
        }
    } catch (error) {
        next()
    }
})

async function createAffNotification({ message, type, belongsTo }) {
    return Promise.resolve(AffNotification.create({ message, type, belongsTo }))
}

module.exports = mongoose.model('affaccount', AffAccount)
