let dayjs = require('dayjs');
let advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);

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
        // { 
        //     level: 'Silver',
        //     minVol: 6200, // conversion €5000 to USD
        //     maxVol: 19000 // conversion €15,000 to USD
        // },
        // { 
        //     level: 'Gold',
        //     minVol: 28000, // conversion €22,500 to USD
        //     maxVol: 56000 // conversion €45,000 to USD
        // },
        // { 
        //     level: 'Diamond',
        //     minVol: 56000, // conversion €45,000 to USD 
        //     maxVol: 111000 // conversion €90,000 to USD
        // },
    ]
};

const checkUpgradeOffer = ({ brand, transValue }) => Promise.resolve( // this function either returns false or string of upgrade eg false || 'Gold'
    nextUpgrades[brand].reduce((acc, a) => {
        if (transValue > a.minVol && transValue <= a.maxVol) acc = a.level;
        return acc;
    }, false
));

const getQuarterData = ({ month }) => { // use this to find current quarter from month input // for some reaspon have to include this function here instead of requiring it from /quarter-helpers.js - otherwise Affreport in quarter-helpers.js does not work
    try {
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
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    quarters,
    quartersArr,
    getQuarterData,
    checkUpgradeOffer
}