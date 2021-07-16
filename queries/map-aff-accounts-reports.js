const {
    AffAccount,
    AffReport,
    AffApplication,
    AffPartner,
} = require('../models/affiliate/index')
const { setCurrency } = require('../config/deals')
const { updatePartnerStats } = require('./map-aff-dashboard-data')

const affDataReducer = (results, brand, month, date) => {
    let completedAccountMapping = results.reduce(
        (previousAccount, nextAccount) => {
            return previousAccount.then(() => {
                return mapAccountReports(nextAccount, brand, month, date) // need to update properly
            })
        },
        Promise.resolve()
    )
    completedAccountMapping
        .then(() => {
            return updatePartnerStats(brand, month, date)
        })
        .catch((e) => e)
}

const mapAccountReports = async (a, brand, month, date) => {
    const dateAdded = Date.now()
    const lastUpdate = Date.now()
    return new Promise((resolve) => {
        resolve(
            (async () => {
                // anonymous async function
                // NOTE: DO NOT USE { new: true } on .create()
                // NOTE: can only use the .save() method on newly created documents - cannot use it on findOne() such as AffPartner.findOne({ epi }).select('epi').lean();
                let {
                    currency,
                    memberId,
                    siteId,
                    playerId,
                    accountId,
                    epi,
                    country,
                    transValue,
                    commission,
                    deposits,
                    earnedFee,
                } = a

                currency = currency ? currency : await setCurrency(brand)
                let commissionRate =
                    transValue > 0 ? commission / transValue : 0
                let cashbackRate = 0
                const defaultSiteIds = ['75417', '75418', '40278', '56']

                try {
                    const existingAccount = await AffAccount.findOne({
                        accountId,
                    }).select('accountId reports belongsTo') // select accounts
                    if (existingAccount) {
                        // if affaccount already exists in db
                        const report = await AffReport.findOne({
                            'account.accountId': accountId,
                            month,
                        })
                            .select('account.accountId')
                            .lean()
                        if (report) {
                            // if existing report for the month = UPDATE IT
                            return AffReport.findByIdAndUpdate(report._id, {
                                lastUpdate,
                                siteId,
                                memberId,
                                playerId,
                                country,
                                account: {
                                    // these is resetting full account object so remeber to include ALL fields
                                    accountId,
                                    deposits,
                                    transValue,
                                    commission,
                                    commissionRate,
                                    earnedFee,
                                    currency,
                                    cashbackRate,
                                },
                            })
                        } else {
                            // if NO existing report for the month = CREATE IT
                            const newReport = await AffReport.create({
                                date,
                                month,
                                lastUpdate,
                                brand,
                                siteId,
                                memberId,
                                playerId,
                                country,
                                belongsTo: existingAccount._id,
                                belongsToPartner: existingAccount.belongsTo,
                                account: {
                                    // these is resetting full account object so remeber to include ALL fields
                                    accountId,
                                    deposits,
                                    transValue,
                                    commission,
                                    cashback: 0,
                                    cashbackRate: 0,
                                    commissionRate,
                                    earnedFee,
                                    currency,
                                    cashbackRate,
                                },
                            })

                            existingAccount.reports.push(newReport._id) // selected reports from line 139 as need to push it
                            await existingAccount.save() // Push new report to reports array and save
                        }
                    } else {
                        // if affaccount does not exist in db
                        const application = await AffApplication.findOne({
                            accountId,
                        })
                            .select('accountId belongsTo')
                            .lean()
                        if (application) {
                            // if application for account ID exists

                            const newAccount = await AffAccount.create({
                                // create new account
                                brand,
                                dateAdded,
                                belongsTo: application.belongsTo,
                                accountId,
                                country,
                            })
                            const newReport = await AffReport.create({
                                // create new report
                                date,
                                month,
                                lastUpdate,
                                brand,
                                siteId,
                                memberId,
                                playerId,
                                country,
                                belongsTo: newAccount._id,
                                belongsToPartner: newAccount.belongsTo,
                                account: {
                                    // these is resetting full account object so remeber to include ALL fields
                                    accountId,
                                    deposits,
                                    transValue,
                                    commission,
                                    commissionRate,
                                    cashback: 0,
                                    cashbackRate: 0,
                                    earnedFee,
                                    currency,
                                    cashbackRate,
                                },
                            })

                            newAccount.reports.push(newReport) // Push new report to reports array
                            await newAccount.save() //  and save it
                            await AffApplication.findByIdAndUpdate(
                                application._id,
                                { siteId }
                            ) // update original application with siteId
                            await AffPartner.findByIdAndUpdate(
                                newAccount.belongsTo,
                                { $push: { accounts: newAccount } },
                                { select: 'accounts', new: true }
                            ) // Put select into options // push new account to partner array of accounts
                        } else if (!application && epi) {
                            // If no application exists but EPI is found
                            const partner = await AffPartner.findOne({ epi })
                                .select('epi')
                                .lean() // Check if epi matches a partner
                            if (partner) {
                                const newAccount = await AffAccount.create({
                                    // create new account
                                    brand,
                                    dateAdded,
                                    belongsTo: partner._id,
                                    accountId,
                                    country,
                                })
                                const newReport = await AffReport.create({
                                    // create new report
                                    date,
                                    month,
                                    lastUpdate,
                                    brand,
                                    siteId,
                                    memberId,
                                    playerId,
                                    country,
                                    belongsTo: newAccount._id,
                                    belongsToPartner: newAccount.belongsTo,
                                    account: {
                                        // these is resetting full account object so remeber to include ALL fields
                                        accountId,
                                        deposits,
                                        transValue,
                                        commission,
                                        commissionRate,
                                        cashback: 0,
                                        cashbackRate: 0,
                                        earnedFee,
                                        currency,
                                        cashbackRate,
                                    },
                                })
                                newAccount.reports.push(newReport) // Push new report to reports array
                                await newAccount.save() //  and save it
                                await AffPartner.findByIdAndUpdate(
                                    partner._id,
                                    { $push: { accounts: newAccount } },
                                    { select: 'accounts', new: true }
                                ) // push new account to partner array of accounts
                                // await AffApplication.create({
                                //     brand,
                                //     accountId,
                                //     belongsTo: partner._id,
                                //     siteId,
                                // }) // Create new application with siteId
                            }
                        } else if (
                            // if no application and site ID is not a default ['75417', '75418', '40278', '56']
                            !application &&
                            !defaultSiteIds.includes(siteId)
                        ) {
                            const partner = await AffPartner.findOne({
                                brandAssets: { $elemMatch: { brand, siteId } },
                            }).select('_id')

                            if (partner) {
                                const newAccount = await AffAccount.create({
                                    // create new account
                                    brand,
                                    dateAdded,
                                    belongsTo: partner._id,
                                    accountId,
                                    country,
                                })
                                const newReport = await AffReport.create({
                                    // create new report
                                    date,
                                    month,
                                    lastUpdate,
                                    brand,
                                    siteId,
                                    memberId,
                                    playerId,
                                    country,
                                    belongsTo: newAccount._id,
                                    belongsToPartner: newAccount.belongsTo,
                                    account: {
                                        // these is resetting full account object so remeber to include ALL fields
                                        accountId,
                                        deposits,
                                        transValue,
                                        commission,
                                        commissionRate,
                                        cashback: 0,
                                        cashbackRate: 0,
                                        earnedFee,
                                        currency,
                                        cashbackRate,
                                    },
                                })
                                newAccount.reports.push(newReport) // Push new report to reports array
                                await newAccount.save() //  and save it
                                await AffPartner.findByIdAndUpdate(
                                    partner._id,
                                    { $push: { accounts: newAccount } },
                                    { select: 'accounts', new: true }
                                ) // push new account to partner array of accounts
                                // await AffApplication.create({
                                //     brand,
                                //     accountId,
                                //     belongsTo: partner._id,
                                //     siteId,
                                // }) // Create new application with siteId
                            }
                        } else return
                    }
                } catch (error) {
                    return error
                }
            })() // which we have to call
        )
    })
}

const createAffAccount = async () => {
    const newAccount = await AffAccount.create({
        // create new account
        brand,
        dateAdded,
        belongsTo: partner._id,
        accountId,
        country,
    })
    return newAccount
}

module.exports = {
    affDataReducer,
}
