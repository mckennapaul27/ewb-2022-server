let dayjs = require('dayjs');
let advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);
const { 
    AffReport,
    AffApplication, 
    AffUpgrade
} = require('../models/affiliate/index');
const {
    Quarter
} = require('../models/common/index');
const {
    Report, 
    Upgrade, 
    Application
} = require('../models/personal/index');

const quartersArr = {
    Q1: [
        'January', 'February', 'March'
    ],
    Q2: [
        'April', 'May', 'June'
    ],
    Q3: [
        'July', 'August', 'September'
    ],
    Q4: [
        'October', 'November', 'December'
    ]
};

const quarters = {
    'January': 'Q1',
    'February': 'Q1', 
    'March': 'Q1',
    'April': 'Q2',
    'May': 'Q2',
    'June': 'Q2',
    'July': 'Q3',
    'August': 'Q3',
    'September': 'Q3',
    'October': 'Q4',
    'November': 'Q4',
    'December': 'Q4'
};

const nextUpgrades = {
    Neteller: [
        { 
            level: 'Gold',
            minVol: 22500, // minimum is the min volume that early upgrade becomes available
            maxVol: 45000 // maximum is when they would automatically get upgraded anyway so no point offering early upgrade
        },
        { 
            level: 'Diamond',
            minVol: 75000, 
            maxVol: 150000
        },
        { 
            level: 'Exclusive',
            minVol: 300000, 
            maxVol: 600000 
        },
    ],
    Skrill: [ // For all conversions to USD I have added a bit extra to factor currency conversions
        { 
            level: 'Silver',
            minVol: 6200, // conversion €5000 to USD
            maxVol: 19000 // conversion €15,000 to USD
        },
        { 
            level: 'Gold',
            minVol: 28000, // conversion €22,500 to USD
            maxVol: 56000 // conversion €45,000 to USD
        },
        { 
            level: 'Diamond',
            minVol: 56000, // conversion €45,000 to USD 
            maxVol: 111000 // conversion €90,000 to USD
        },
    ]
};

const checkUpgradeOffer = ({ brand, transValue }) => Promise.resolve( // this function either returns false or string of upgrade eg false || 'Gold'
    nextUpgrades[brand].reduce((acc, a) => {
        if (transValue > a.minVol && transValue <= a.maxVol) acc = a.level;
        return acc;
    }, false
));

const getQuarterData = ({ month }) => { // use this to find current quarter from month input
    const m = month.slice(0, -5);
    const year = month.slice(-4);
    const quarter = `${quarters[m]} ${year}`;
    const months = quartersArr[quarters[m]].map(x => `${x} ${year}`);
    const startDate = Number(dayjs(months[0]).startOf('month').format('x'));
    const endDate = Number(dayjs(months[2]).endOf('month').format('x'));
    return Promise.resolve({
        months,
        quarter,
        startDate,
        endDate
    });
};

// Affiliate system quarter data
const setAffQuarterData = ({ month, brand, accountId }) => { 
    return new Promise(resolve => {
        resolve (
            (async () => {
                const { months, quarter, startDate, endDate } = (await getQuarterData({ month })); // find current quarter details based on { month } only.
                const transValue = await getQuarterVolumeByAffReport({ accountId, months }); // work out transvalue
                
                const existingQuarter = await Quarter.findOne({ accountId, quarter }); // check if existing Quarter by { accountId, quarter }
                const currentQuarter = (await getQuarterData({ month: dayjs().format('MMMM YYYY') })).quarter; // find non-account specific current quarter - simply gives us the current quarter for today
                if (existingQuarter ) { // if existing quarter 
                    await Quarter.findByIdAndUpdate(existingQuarter._id, { transValue }, { new: true, select: 'transValue' });
                    const level = await checkUpgradeOffer({ brand, transValue });

                    if (level && (quarter === currentQuarter)) { // if transvalue qualfies for an upgrade && quarter is equal to the current quarter  - if it is not current quarter, it will delete all affupgrades from different quarters. only affupgrades in the current quarter are valid
                        const existingLevelUpgrade = await AffUpgrade.findOne({ level, quarter, accountId }).lean(); // check if upgrade offer exists for THIS LEVEL i.e Gold and this QUARTER such as Q2 2021
                        if (!existingLevelUpgrade) { // if existingLevelUpgrade for THIS LEVEL does not exist
                            const existingAffApplication = await AffApplication.findOne({ accountId }).select('_id accountId').lean(); // find existingAffApplication
                            await AffUpgrade.deleteMany({ quarter, accountId }) // firstly delete other LEVEL upgrades so we don't have Diamond & Exclusive duplicate upgrades etc
                            await AffUpgrade.create({ // create newAffUpgrade which we can use for isNew to send email
                                level,
                                quarter,
                                accountId,
                                brand,
                                belongsTo: existingAffApplication,
                                startDate,
                                endDate
                            })
                            const today = Number(dayjs().format('x'));
                            const check = () => today > startDate && today < endDate ? true : false; // check if expired
                            const availableUpgrade = { // create object - if upgrade has expired, set valid to false
                                status: check() ? level : '-', // Silver, Gold, Diamond etc
                                valid: check() ? true : false // make clickable on front end by setting to true
                            };
                            await AffApplication.findByIdAndUpdate(existingAffApplication._id, { // update affapplication so that partner can request it
                                availableUpgrade,
                                upgradeStatus: check() ? `Available from ${dayjs().format('DD/MM/YYYY')}` : '-',
                                requestCount: 1, // update requestcount back to 1
                            }, { new: true });
                        };
                    } else { // if transvalue does not qualify for a level (this can also mean when user does NOT claim their offer and makes it naturally e.g offer is added for Daimond after 75000 - they don't claim it and then make 150000 on their own)
                        await AffUpgrade.deleteMany({ quarter, accountId }) 
                        await AffApplication.updateOne({ accountId }, {
                            'availableUpgrade.valid': false,
                            'availableUpgrade.status': '-',
                            'upgradeStatus': `-`,
                        }, { new: true })
                    } 
                } else { // if no existing quarter, create it
                    return Quarter.create({
                        brand,
                        accountId,
                        quarter,
                        months,
                        transValue
                    })
                }
            })()
        )
    })
};
// Affiliate report transfer volume
const getQuarterVolumeByAffReport = async ({ accountId, months }) => { 
    let transValue = 0;
    try {
        for await (const report of AffReport.find({ 'account.accountId': accountId, month: { $in: months }, 'account.transValue': { $gt: 0 } }).select('account.transValue').lean()) {
            transValue += report.account.transValue;
        };
        return Promise.resolve(transValue);
    } catch (error) {
        console.log(error);
    }
};

// Personal system quarter data
const setPersonalQuarterData = ({ month, brand, accountId }) => { 
    return new Promise(resolve => {
        resolve (
            (async () => {
                const { months, quarter, startDate, endDate } = (await getQuarterData({ month })); // find current quarter details based on { month } only.
                const transValue = await getQuarterVolumeByReport({ accountId, months }); // work out transvalue
                
                const existingQuarter = await Quarter.findOne({ accountId, quarter }); // check if existing Quarter by { accountId, quarter }
                const currentQuarter = (await getQuarterData({ month: dayjs().format('MMMM YYYY') })).quarter; // find non-account specific current quarter - simply gives us the current quarter for today
                if (existingQuarter ) { // if existing quarter 
                    await Quarter.findByIdAndUpdate(existingQuarter._id, { transValue }, { new: true, select: 'transValue' });
                    const level = await checkUpgradeOffer({ brand, transValue });

                    if (level && (quarter === currentQuarter)) { // if transvalue qualfies for an upgrade && quarter is equal to the current quarter  - if it is not current quarter, it will delete all affupgrades from different quarters. only affupgrades in the current quarter are valid
                        const existingLevelUpgrade = await Upgrade.findOne({ level, quarter, accountId }).lean(); // check if upgrade offer exists for THIS LEVEL i.e Gold and this QUARTER such as Q2 2021
                        if (!existingLevelUpgrade) { // if existingLevelUpgrade for THIS LEVEL does not exist
                            const existingApplication = await Application.findOne({ accountId }).select('_id accountId').lean(); // find existinApplication
                            await Upgrade.deleteMany({ quarter, accountId }) // firstly delete other LEVEL upgrades so we don't have Diamond & Exclusive duplicate upgrades etc
                            await Upgrade.create({ // create Upgrade which we can use for isNew to send email
                                level,
                                quarter,
                                accountId,
                                brand,
                                belongsTo: existingApplication,
                                startDate,
                                endDate
                            })
                            const today = Number(dayjs().format('x'));
                            const check = () => today > startDate && today < endDate ? true : false; // check if expired
                            const availableUpgrade = { // create object - if upgrade has expired, set valid to false
                                status: check() ? level : '-', // Silver, Gold, Diamond etc
                                valid: check() ? true : false // make clickable on front end by setting to true
                            };
                            await Application.findByIdAndUpdate(existingApplication._id, { // update affapplication so that partner can request it
                                availableUpgrade,
                                upgradeStatus: check() ? `Available from ${dayjs().format('DD/MM/YYYY')}` : '-',
                                requestCount: 1, // update requestcount back to 1
                            }, { new: true });
                        };
                    } else { // if transvalue does not qualify for a level (this can also mean when user does NOT claim their offer and makes it naturally e.g offer is added for Daimond after 75000 - they don't claim it and then make 150000 on their own)
                        await Upgrade.deleteMany({ quarter, accountId }) 
                        await Application.updateOne({ accountId }, {
                            'availableUpgrade.valid': false,
                            'availableUpgrade.status': '-',
                            'upgradeStatus': `-`,
                        }, { new: true })
                    } 
                } else { // if no existing quarter, create it
                    return Quarter.create({
                        brand,
                        accountId,
                        quarter,
                        months,
                        transValue
                    })
                }
            })()
        )
    })
};
// Personal report transfer volume
const getQuarterVolumeByReport = async ({ accountId, months }) => { 
    let transValue = 0;
    try {
        for await (const report of Report.find({ 'account.accountId': accountId, month: { $in: months }, 'account.transValue': { $gt: 0 } }).select('account.transValue').lean()) {
            transValue += report.account.transValue;
        };
        return Promise.resolve(transValue);
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    setAffQuarterData,
    setPersonalQuarterData,
    getQuarterData
}