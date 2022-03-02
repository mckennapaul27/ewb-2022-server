const {
    AffPartner,
    AffReport,
    AffAccount,
    AffReportMonthly,
    AffSubReport,
} = require('../models/affiliate/index')
const {
    ActiveUser,
    Account,
    Report,
    SubReport,
} = require('../models/personal/index')
const { User } = require('../models/common')

let dayjs = require('dayjs')
let advancedFormat = require('dayjs/plugin/advancedFormat')
dayjs.extend(advancedFormat)

const createAccountReport = ({ accountId, brand, belongsTo }) => {
    return new Promise((resolve) => {
        // have to return a promise to be able to await it. E.G  await createAccountReport ({ accountId, brand, belongsTo });
        resolve(
            (async () => {
                const existingAccount = await Account.findOne({
                    accountId,
                }).select('accountId') // select accounts
                if (!existingAccount) {
                    const newAccount = await Account.create({
                        brand,
                        accountId,
                        belongsTo,
                    }) // calls .pre('save') middleware here [1]
                    const newReport = await Report.create({
                        date: Number(dayjs().startOf('month').format('x')),
                        month: dayjs().format('MMMM YYYY'),
                        brand,
                        belongsTo: newAccount._id,
                        belongsToActiveUser: newAccount.belongsTo,
                        'account.accountId': accountId,
                        'account.deposits': 0,
                        'account.transValue': 0,
                        'account.commission': 0,
                        'account.commissionRate': 0,
                        'account.earnedFee': 0,
                        'account.cashbackRate': 0,
                    })
                    newAccount.reports.push(newReport) // Push new report to reports array
                    await newAccount.save() // calls .pre('save') middleware here again [2]
                    await ActiveUser.findByIdAndUpdate(
                        newAccount.belongsTo,
                        { $push: { accounts: newAccount } },
                        { select: 'accounts', new: true }
                    )
                } else return
            })()
        )
    })
}

const createAffAccAffReport = ({ accountId, brand, belongsTo }) => {
    return new Promise((resolve) => {
        // have to return a promise to be able to await it. E.G  await createAffAccAffReport ({ accountId, brand, belongsTo });
        resolve(
            (async () => {
                const existingAccount = await AffAccount.findOne({
                    accountId,
                }).select('accountId') // select accounts
                if (!existingAccount) {
                    const newAccount = await AffAccount.create({
                        brand,
                        accountId,
                        belongsTo,
                    }) // calls .pre('save') middleware here [1]
                    const newReport = await AffReport.create({
                        date: Number(dayjs().startOf('month').format('x')),
                        month: dayjs().format('MMMM YYYY'),
                        brand,
                        belongsTo: newAccount._id,
                        belongsToPartner: newAccount.belongsTo,
                        'account.accountId': accountId,
                        'account.deposits': 0,
                        'account.transValue': 0,
                        'account.commission': 0,
                        'account.commissionRate': 0,
                        'account.earnedFee': 0,
                        'account.cashbackRate': 0,
                    })
                    newAccount.reports.push(newReport) // Push new report to reports array
                    await newAccount.save() // calls .pre('save') middleware here again [2]
                    await AffPartner.findByIdAndUpdate(
                        newAccount.belongsTo,
                        { $push: { accounts: newAccount } },
                        { select: 'accounts', new: true }
                    )
                } else return
            })()
        )
    })
}

// deleting after wrong month upload
const deleteReportsWrongMonth = async () => {
    try {
        const affreports = await AffReport.deleteMany({
            month: 'March 2021',
            brand: 'ecoPayz',
        })
        const affreportsmonthly = await AffReportMonthly.deleteMany({
            month: 'March 2021',
            brand: 'ecoPayz',
        })
        const affsubreports = await AffSubReport.find({
            month: 'March 2021',
            brand: 'ecoPayz',
        })
        const reports = await Report.deleteMany({
            month: 'March 2021',
            brand: 'ecoPayz',
        })
        const subreport = await SubReport.deleteMany({
            month: 'March 2021',
            brand: 'ecoPayz',
        })
    } catch (error) {
        console.log(error)
    }
}

// connecting accountid to user
const connectAccountIdToUser = async () => {
    try {
        const user = await User.findOne({ email: 'sigsun95@gmail.com' })
        console.log(user)
        const updatedAccount = await Account.findOneAndUpdate(
            { accountId: '1100896201' },
            {
                belongsTo: user.activeUser,
            },
            { new: true }
        )
        const activeUserUpdate = await ActiveUser.findByIdAndUpdate(
            user.activeUser,
            {
                $push: {
                    accounts: updatedAccount,
                },
            }
        )
        const updatedReport = await Report.updateMany(
            { 'account.accountId': '1100896201' },
            {
                belongsTo: updatedAccount._id,
                belongsToActiveUser: updatedAccount.belongsTo,
            },
            { new: true }
        )
        console.log(updatedAccount)
        console.log(updatedReport)
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    createAccountReport,
    createAffAccAffReport,
    deleteReportsWrongMonth,
    connectAccountIdToUser,
}
