let dayjs = require('dayjs')
let advancedFormat = require('dayjs/plugin/advancedFormat')
dayjs.extend(advancedFormat)
const {
    AffReport,
    AffApplication,
    AffUpgrade,
} = require('../models/affiliate/index')
const { Quarter } = require('../models/common/index')
const { Report, Upgrade, Application } = require('../models/personal/index')

const { getQuarterData, checkUpgradeOffer } = require('./quarter-data')

// Affiliate system quarter data
const setAffQuarterData = ({ month, brand, accountId, _id }) => {
    return new Promise((resolve) => {
        resolve(
            (async () => {
                try {
                    const { months, quarter, startDate, endDate } =
                        await getQuarterData({
                            month,
                        }) // find current quarter details based on { month } only.
                    const transValue = await getQuarterVolumeByAffReport({
                        accountId,
                        months,
                    }) // work out transvalue
                    const existingQuarter = await Quarter.findOne({
                        accountId,
                        quarter,
                    }) // check if existing Quarter by { accountId, quarter }
                    const currentQuarter = (
                        await getQuarterData({
                            month: dayjs().format('MMMM YYYY'),
                        })
                    ).quarter // find non-account specific current quarter - simply gives us the current quarter for today

                    if (existingQuarter) {
                        // if existing quarter
                        await Quarter.findByIdAndUpdate(
                            existingQuarter._id,
                            {
                                transValue,
                            },
                            {
                                new: true,
                                select: 'transValue',
                            }
                        )
                        const level = await checkUpgradeOffer({
                            brand,
                            transValue,
                        })
                        if (level && quarter === currentQuarter) {
                            // if transvalue qualfies for an upgrade && quarter is equal to the current quarter  - if it is not current quarter, it will delete all affupgrades from different quarters. only affupgrades in the current quarter are valid
                            const existingLevelUpgrade =
                                await AffUpgrade.findOne({
                                    level,
                                    quarter,
                                    accountId,
                                }).lean() // check if upgrade offer exists for THIS LEVEL i.e Gold and this QUARTER such as Q2 2021
                            if (!existingLevelUpgrade) {
                                // if existingLevelUpgrade for THIS LEVEL does not exist
                                let affApplication =
                                    await AffApplication.findOne({
                                        accountId,
                                    })
                                        .select('_id accountId')
                                        .lean() // find affApplication
                                if (!affApplication) {
                                    // Having affapplication is essential to process so if it is not found, we need to create.
                                    affApplication =
                                        await AffApplication.create({
                                            brand,
                                            accountId,
                                            belongsTo: _id,
                                            status: 'Approved',
                                        })
                                }
                                await AffUpgrade.deleteMany({
                                    quarter,
                                    accountId,
                                }) // firstly delete other LEVEL upgrades so we don't have Diamond & Exclusive duplicate upgrades etc
                                const a = await AffUpgrade.create({
                                    // create newAffUpgrade which we can use for isNew to send email
                                    level,
                                    quarter,
                                    accountId,
                                    brand,
                                    belongsTo: affApplication, // need this to find partner details
                                    startDate,
                                    endDate,
                                })
                                const today = Number(dayjs().format('x'))
                                const check = () =>
                                    today > startDate && today < endDate
                                        ? true
                                        : false // check if expired
                                const availableUpgrade = {
                                    // create object - if upgrade has expired, set valid to false
                                    status: check() ? level : '-', // Silver, Gold, Diamond etc
                                    valid: check() ? true : false, // make clickable on front end by setting to true
                                }
                                await AffApplication.findByIdAndUpdate(
                                    affApplication._id,
                                    {
                                        // update affapplication so that partner can request it
                                        availableUpgrade,
                                        upgradeStatus: check()
                                            ? `Available from ${dayjs().format(
                                                  'DD/MM/YYYY'
                                              )}`
                                            : '-',
                                        requestCount: 1, // update requestcount back to 1
                                    },
                                    {
                                        new: true,
                                    }
                                )
                            }
                        } else {
                            // if transvalue does not qualify for a level (this can also mean when user does NOT claim their offer and makes it naturally e.g offer is added for Daimond after 75000 - they don't claim it and then make 150000 on their own)
                            await AffUpgrade.deleteMany({
                                quarter,
                                accountId,
                            })
                            await AffApplication.updateOne(
                                {
                                    accountId,
                                },
                                {
                                    'availableUpgrade.valid': false,
                                    'availableUpgrade.status': '-',
                                    upgradeStatus: `-`,
                                },
                                {
                                    new: true,
                                }
                            )
                        }
                    } else {
                        // if no existing quarter, create it
                        return Quarter.create({
                            brand,
                            accountId,
                            quarter,
                            months,
                            transValue,
                        })
                    }
                } catch (error) {
                    console.log(error)
                }
            })()
        )
    })
}
// Affiliate report transfer volume
const getQuarterVolumeByAffReport = async ({ accountId, months }) => {
    let transValue = 0
    try {
        for await (const report of AffReport.find({
            'account.accountId': accountId,
            month: {
                $in: months,
            },
            'account.transValue': {
                $gt: 0,
            },
        })
            .select('account.transValue')
            .lean()) {
            transValue += report.account.transValue
        }
        return Promise.resolve(transValue)
    } catch (error) {
        console.log(error)
    }
}

// Personal system quarter data
const setPersonalQuarterData = ({ month, brand, accountId }) => {
    return new Promise((resolve) => {
        resolve(
            (async () => {
                const { months, quarter, startDate, endDate } =
                    await getQuarterData({
                        month,
                    }) // find current quarter details based on { month } only.
                const transValue = await getQuarterVolumeByReport({
                    accountId,
                    months,
                }) // work out transvalue
                const existingQuarter = await Quarter.findOne({
                    accountId,
                    quarter,
                }) // check if existing Quarter by { accountId, quarter }
                const currentQuarter = (
                    await getQuarterData({
                        month: dayjs().format('MMMM YYYY'),
                    })
                ).quarter // find non-account specific current quarter - simply gives us the current quarter for today
                if (existingQuarter) {
                    // if existing quarter
                    await Quarter.findByIdAndUpdate(
                        existingQuarter._id,
                        {
                            transValue,
                        },
                        {
                            new: true,
                            select: 'transValue',
                        }
                    )
                    const level = await checkUpgradeOffer({
                        brand,
                        transValue,
                    })
                    if (level && quarter === currentQuarter) {
                        // if transvalue qualfies for an upgrade && quarter is equal to the current quarter  - if it is not current quarter, it will delete all affupgrades from different quarters. only affupgrades in the current quarter are valid
                        const existingLevelUpgrade = await Upgrade.findOne({
                            level,
                            quarter,
                            accountId,
                        }).lean() // check if upgrade offer exists for THIS LEVEL i.e Gold and this QUARTER such as Q2 2021

                        if (!existingLevelUpgrade) {
                            // if existingLevelUpgrade for THIS LEVEL does not exist
                            const existingApplication =
                                await Application.findOne({
                                    accountId,
                                })
                                    .select('_id accountId')
                                    .lean() // find existinApplication
                            await Upgrade.deleteMany({
                                quarter,
                                accountId,
                            }) // firstly delete other LEVEL upgrades so we don't have Diamond & Exclusive duplicate upgrades etc
                            await Upgrade.create({
                                // create Upgrade which we can use for isNew to send email
                                level,
                                quarter,
                                accountId,
                                brand,
                                belongsTo: existingApplication,
                                startDate,
                                endDate,
                            })
                            const today = Number(dayjs().format('x'))
                            const check = () =>
                                today > startDate && today < endDate
                                    ? true
                                    : false // check if expired
                            const availableUpgrade = {
                                // create object - if upgrade has expired, set valid to false
                                status: check() ? level : '-', // Silver, Gold, Diamond etc
                                valid: check() ? true : false, // make clickable on front end by setting to true
                            }
                            await Application.findByIdAndUpdate(
                                existingApplication._id,
                                {
                                    // update affapplication so that partner can request it
                                    availableUpgrade,
                                    upgradeStatus: check()
                                        ? `Available from ${dayjs().format(
                                              'DD/MM/YYYY'
                                          )}`
                                        : '-',
                                    requestCount: 1, // update requestcount back to 1
                                },
                                {
                                    new: true,
                                }
                            )
                        }
                    } else {
                        // if transvalue does not qualify for a level (this can also mean when user does NOT claim their offer and makes it naturally e.g offer is added for Daimond after 75000 - they don't claim it and then make 150000 on their own)
                        await Upgrade.deleteMany({
                            quarter,
                            accountId,
                        })
                        await Application.updateOne(
                            {
                                accountId,
                            },
                            {
                                'availableUpgrade.valid': false,
                                'availableUpgrade.status': '-',
                                upgradeStatus: `-`,
                            },
                            {
                                new: true,
                            }
                        )
                    }
                } else {
                    // if no existing quarter, create it
                    return Quarter.create({
                        brand,
                        accountId,
                        quarter,
                        months,
                        transValue,
                    })
                }
            })()
        )
    })
}
// Personal report transfer volume
const getQuarterVolumeByReport = async ({ accountId, months }) => {
    let transValue = 0
    try {
        for await (const report of Report.find({
            'account.accountId': accountId,
            month: {
                $in: months,
            },
            'account.transValue': {
                $gt: 0,
            },
        })
            .select('account.transValue')
            .lean()) {
            transValue += report.account.transValue
        }
        return Promise.resolve(transValue)
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    setAffQuarterData,
    setPersonalQuarterData,
}
