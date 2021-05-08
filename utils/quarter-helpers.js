let dayjs = require('dayjs');
let advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);
const { 
    AffPartner,
    AffPayment,
    AffReport,
    AffReportMonthly,
    AffSubReport,
    AffApplication, 
    AffUpgrade
} = require('../models/affiliate/index');
const {
    Quarter
} = require('../models/common/index');
const {
    Report
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

// add simple string field to affreport with quarter such as 'Q2 2021' which can then be used alongside accountId to fetch Quarter model
// **Maybe** send email when new Quarter is created isNew && brand === Skrill || brand === Neteller
// Send email out to everybody at the start of every quarter
// send email if user qualifies for additional upgrade

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

const setAffQuarterData = ({ month, brand, accountId }) => { 
    return new Promise(resolve => {
        resolve (
            (async () => {
                const { months, quarter, startDate, endDate } = (await getQuarterData({ month })); // find current quarter details based on { month } only.
                const transValue = await getQuarterVolumeByAffReport({ accountId, months }); // work out transvalue

                const existingQuarter = await Quarter.findOne({ accountId, quarter }); // check if existing Quarter by { accountId, quarter }
                const currentQuarter = (await getQuarterData({ month: dayjs().format('MMMM YYYY') })).quarter; // find non-account specific current quarter - simply gives us the current quarter for today
                
                if (existingQuarter && quarter === currentQuarter) { // if existing quarter && quarter is equal to the current quarter (don't want to fetch upgrade when calling last momnths stats which may be in a different quarter - for example on ), do following actions
                    await Quarter.findByIdAndUpdate(existingQuarter._id, { transValue }, { new: true, select: 'transValue' });
                    const level = await checkUpgradeOffer({ brand, transValue });
                    if (level) { // if transvalue qualfies for an upgrade
                        const existingLevelUpgrade = await AffUpgrade.findOne({ level, quarter, accountId }).lean(); // check if upgrade offer exists for THIS LEVEL i.e Gold and this QUARTER such as Q2 2021
                        if (!existingLevelUpgrade) { // if existingLevelUpgrade for THIS LEVEL does not exist
                            const existingAffApplication = await AffApplication.findOne({ accountId }).select('_id accountId').lean(); // find existingAffApplication
                            await AffUpgrade.deleteMany({ quarter, accountId }) // firstly delete other LEVEL upgrades so we don't have Diamond & Exclusive etc
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

// const getQuarterVolumeByReport = async ({ accountId, months }) => { 
//     let transValue = 0;
//     for await (const report of Report.find({ 'account.accountId': accountId, month: { $in: months }, 'account.transValue': { $gt: 0 } }).select('account.transValue').lean()) {
//         transValue += report.account.transValue;
//     };
//     return Promise.resolve(transValue);
// };

// do we have a AffQuarter model?
// Add field to affreport 'quarter' which would be Q2 2021, Q1 2022 etc
// When user clicks on the quarter, it can load up current quarter stats  - how much done so far, how much needed for 



// check current quarter
// work out current volume for current quarter
// estimate current VIP status
// show expiry date of current VIP period
// show requirement to trigger next upgrade
// if eligible, send out email 
// at start of last month of quarter, if not upgraded, send email with reminder
// on front end, only show upgrade request button if current quarter

module.exports = {
    setAffQuarterData,
    getQuarterData
}