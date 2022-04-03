const mongoose = require('mongoose')
const { affUpgradeEligible } = require('../../utils/notifications-list')
const Schema = mongoose.Schema
const AffNotification = require('./AffNotification')
const AffPartner = require('./AffPartner')

const AffUpgrade = new Schema({
    level: String,
    quarter: String,
    accountId: String,
    brand: String,
    startDate: Number,
    endDate: Number,
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affapplication',
        required: false,
    },
})

AffUpgrade.pre('save', async function (next) {
    // https://medium.com/@justinmanalad/pre-save-hooks-in-mongoose-js-cf1c0959dba2
    const a = this
    const { isNew, accountId, quarter, brand, level } = a
    try {
        if (isNew) {
            const partner = await AffPartner.findById(a.belongsTo)
                .select('email belongsTo')
                .lean()
            const { locale } = await User.findById(partner.belongsTo)
                .select('locale')
                .lean()

            await createAffNotification(
                affUpgradeEligible({
                    locale,
                    accountId,
                    level,
                    quarter,
                    belongsTo: a.belongsTo,
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

module.exports = mongoose.model('affupgrade', AffUpgrade)
