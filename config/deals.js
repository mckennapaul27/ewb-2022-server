const defaultDealOne = [
    { level: 1, minVol: 0, maxVol: 10000, cashback: 0.15 },
    { level: 2, minVol: 10000, maxVol: 100000, cashback: 0.175 },
    { level: 3, minVol: 100001, maxVol: 250000, cashback: 0.20 },
    { level: 4, minVol: 250001, maxVol: 500000, cashback: 0.225 },
    { level: 5, minVol: 500001, maxVol: 1500000, cashback: 0.25 }
];

const defaultDealTwo = [
    { level: 1, minVol: 0, maxVol: 10000, cashback: 0.175 },
    { level: 2, minVol: 10000, maxVol: 100000, cashback: 0.20 },
    { level: 3, minVol: 100001, maxVol: 250000, cashback: 0.225 },
    { level: 4, minVol: 250001, maxVol: 500000, cashback: 0.25 },
    { level: 5, minVol: 500001, maxVol: 1500000, cashback: 0.275 }
];

const activeUserStats = {
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
    ]
};

const initialUpgrades = {
    Neteller: 'Fast Silver',
    Skrill: 'Bronze',
    ecoPayz: 'Gold',
    MuchBetter: 'None'
}

module.exports = {
    defaultDealOne,
    defaultDealTwo,
    activeUserStats,
    initialUpgrades
}