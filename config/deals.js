const defaultDealOne = (brand) => {
    return {
        brand: brand,
        rates: [
            { level: 1, minVol: 0, maxVol: 10000, cashback: 0.15 },
            { level: 2, minVol: 10000, maxVol: 100000, cashback: 0.175 },
            { level: 3, minVol: 100001, maxVol: 250000, cashback: 0.20 },
            { level: 4, minVol: 250001, maxVol: 500000, cashback: 0.225 },
            { level: 5, minVol: 500001, maxVol: 1500000, cashback: 0.25 }
        ]
    }
};

const defaultDealTwo = (brand) => {
    return {
        brand: brand,
        rates: [
            { level: 1, minVol: 0, maxVol: 10000, cashback: 0.175 },
            { level: 2, minVol: 10000, maxVol: 100000, cashback: 0.20 },
            { level: 3, minVol: 100001, maxVol: 250000, cashback: 0.225 },
            { level: 4, minVol: 250001, maxVol: 500000, cashback: 0.25 },
            { level: 5, minVol: 500001, maxVol: 1500000, cashback: 0.275 }
        ]
    }
};

const defaultAffStats = {
    balance: [
        { amount: 0, currency: 'EUR' },
        { amount: 0, currency: 'USD' }
    ],
    commission: [
        { amount: 0, currency: 'EUR' },
        { amount: 0, currency: 'USD' }
    ],
    cashback: [
        { amount: 0, currency: 'EUR' },
        { amount: 0, currency: 'USD' }
    ],
    payments: [
        { amount: 0, currency: 'EUR' },
        { amount: 0, currency: 'USD' }
    ],
    requested: [
        { amount: 0, currency: 'EUR' },
        { amount: 0, currency: 'USD' }
    ],
    subCommission: [
        { amount: 0, currency: 'EUR' },
        { amount: 0, currency: 'USD' }
    ]
};

const defaultActStats = {
    balance: [
        { amount: 0, currency: 'EUR' },
        { amount: 0, currency: 'USD' }
    ],
    commission: [
        { amount: 0, currency: 'EUR' },
        { amount: 0, currency: 'USD' }
    ],
    cashback: [
        { amount: 0, currency: 'EUR' },
        { amount: 0, currency: 'USD' }
    ],
    payments: [
        { amount: 0, currency: 'EUR' },
        { amount: 0, currency: 'USD' }
    ],
    requested: [
        { amount: 0, currency: 'EUR' },
        { amount: 0, currency: 'USD' }
    ],
    raf: [
        { amount: 0, currency: 'EUR' },
        { amount: 0, currency: 'USD' }
    ]
};

const initialUpgrades = {
    Neteller: 'Fast Silver',
    Skrill: 'Bronze',
    ecoPayz: 'Gold',
    MuchBetter: '-'
};

const nextUpgrades = {
    Neteller: [
        { Gold: 50000, Platinum: 500000, Diamond: 1000000 }
    ],
    Skrill: [],
    ecoPayz: [],
    MuchBetter: []
};

const defaultSiteId = {
    'Neteller': 75417,
    'Skrill': 75418,
    'ecoPayz': 100 // Just using 100 as no need for this for ecoPayz
};

const brandCurrency = {
    'Neteller': 'USD',
    'Skrill': 'USD',
    'ecoPayz': 'EUR',
    'MuchBetter': 'EUR'
}

const setCurrency = (b) => brandCurrency[b];

const affiliateDealOne = (brand) => {
    return {
        brand: brand,
        rates: [
            { level: 1, minVol: 0, maxVol: 100000, cashback: 0.0040 },
            { level: 2, minVol: 100001, maxVol: 500000, cashback: 0.0045 },
            { level: 3, minVol: 500001, maxVol: 1000000, cashback: 0.0050 },
            { level: 4, minVol: 1000001, maxVol: 10000000, cashback: 0.0055 }
        ]
    }
};

const affiliateDealTwo = (brand) => {
    return {
        brand: brand,
        rates: [
            { level: 1, minVol: 0, maxVol: 100000, cashback: 0.0050 },
            { level: 2, minVol: 100001, maxVol: 500000, cashback: 0.0055 },
            { level: 3, minVol: 500001, maxVol: 1000000, cashback: 0.0060 },
            { level: 4, minVol: 1000001, maxVol: 10000000, cashback: 0.0065 }
        ]
    }
};

const quarterOne = ['January', 'February', 'March'];
const quarterTwo = ['April', 'May', 'June'];
const quarterThree = ['July', 'August', 'September'];
const quarterFour = ['October', 'November', 'December'];

const quarterMonths = [
    { month: 'January', quarter: 1, expires: quarterOne[2]}
]


module.exports = {
    defaultDealOne,
    defaultDealTwo,
    defaultAffStats,
    defaultActStats,
    affiliateDealOne,
    affiliateDealTwo,
    initialUpgrades,
    setCurrency,
    nextUpgrades,
    defaultSiteId
}