"use strict";

var defaultDealOne = function defaultDealOne(brand) {
  return {
    brand: brand,
    rates: [{
      level: 1,
      minVol: 0,
      maxVol: 10000,
      cashback: 0.155
    }, {
      level: 2,
      minVol: 10000,
      maxVol: 100000,
      cashback: 0.175
    }, {
      level: 3,
      minVol: 100001,
      maxVol: 250000,
      cashback: 0.2
    }, {
      level: 4,
      minVol: 250001,
      maxVol: 500000,
      cashback: 0.215
    }, {
      level: 5,
      minVol: 500001,
      maxVol: 1500000,
      cashback: 0.225
    }]
  };
};

var defaultDealTwo = function defaultDealTwo(brand) {
  return {
    brand: brand,
    rates: [{
      level: 1,
      minVol: 0,
      maxVol: 10000,
      cashback: 0.2
    }, {
      level: 2,
      minVol: 10000,
      maxVol: 100000,
      cashback: 0.22
    }, {
      level: 3,
      minVol: 100001,
      maxVol: 250000,
      cashback: 0.23
    }, {
      level: 4,
      minVol: 250001,
      maxVol: 500000,
      cashback: 0.24
    }, {
      level: 5,
      minVol: 500001,
      maxVol: 1500000,
      cashback: 0.25
    }]
  };
};

var defaultBalances = [{
  brand: 'Neteller',
  currency: 'USD',
  current: 0,
  commission: 0,
  raf: 0,
  cashback: 0,
  payments: 0,
  requested: 0
}, {
  brand: 'Skrill',
  currency: 'USD',
  current: 0,
  commission: 0,
  raf: 0,
  cashback: 0,
  payments: 0,
  requested: 0
}, {
  brand: 'ecoPayz',
  currency: 'EUR',
  current: 0,
  commission: 0,
  raf: 0,
  cashback: 0,
  payments: 0,
  requested: 0
}];
var defaultAffStats = {
  balance: [{
    amount: 0,
    currency: 'EUR'
  }, {
    amount: 0,
    currency: 'USD'
  }, {
    amount: 0,
    currency: 'GBP'
  }],
  commission: [{
    amount: 0,
    currency: 'EUR'
  }, {
    amount: 0,
    currency: 'USD'
  }, {
    amount: 0,
    currency: 'GBP'
  }],
  cashback: [{
    amount: 0,
    currency: 'EUR'
  }, {
    amount: 0,
    currency: 'USD'
  }, {
    amount: 0,
    currency: 'GBP'
  }],
  payments: [{
    amount: 0,
    currency: 'EUR'
  }, {
    amount: 0,
    currency: 'USD'
  }, {
    amount: 0,
    currency: 'GBP'
  }],
  requested: [{
    amount: 0,
    currency: 'EUR'
  }, {
    amount: 0,
    currency: 'USD'
  }, {
    amount: 0,
    currency: 'GBP'
  }],
  subCommission: [{
    amount: 0,
    currency: 'EUR'
  }, {
    amount: 0,
    currency: 'USD'
  }, {
    amount: 0,
    currency: 'GBP'
  }]
};
var defaultActStats = {
  balance: [{
    amount: 0,
    currency: 'EUR'
  }, {
    amount: 0,
    currency: 'USD'
  }],
  commission: [{
    amount: 0,
    currency: 'EUR'
  }, {
    amount: 0,
    currency: 'USD'
  }],
  cashback: [{
    amount: 0,
    currency: 'EUR'
  }, {
    amount: 0,
    currency: 'USD'
  }],
  payments: [{
    amount: 0,
    currency: 'EUR'
  }, {
    amount: 0,
    currency: 'USD'
  }],
  requested: [{
    amount: 0,
    currency: 'EUR'
  }, {
    amount: 0,
    currency: 'USD'
  }],
  raf: [{
    amount: 0,
    currency: 'EUR'
  }, {
    amount: 0,
    currency: 'USD'
  }]
};
var initialUpgrades = {
  Neteller: 'Fast Silver',
  Skrill: 'Bronze',
  ecoPayz: 'Gold',
  MuchBetter: '-'
};
var nextUpgrades = {
  Neteller: [{
    Gold: 50000,
    Platinum: 500000,
    Diamond: 1000000
  }],
  Skrill: [],
  ecoPayz: [],
  MuchBetter: []
};
var defaultSiteId = {
  Neteller: 75417,
  Skrill: 75418,
  ecoPayz: 100 // Just using 100 as no need for this for ecoPayz

};
var brandCurrency = {
  Neteller: 'USD',
  Skrill: 'USD',
  ecoPayz: 'EUR',
  MuchBetter: 'EUR'
};

var setCurrency = function setCurrency(b) {
  return brandCurrency[b];
};

var affiliateDealOne = function affiliateDealOne(brand) {
  return {
    brand: brand,
    rates: [{
      level: 1,
      minVol: 0,
      maxVol: 100000,
      cashback: 0.003
    }, {
      level: 2,
      minVol: 100001,
      maxVol: 500000,
      cashback: 0.00375
    }, {
      level: 3,
      minVol: 500001,
      maxVol: 1000000,
      cashback: 0.00425
    }, {
      level: 4,
      minVol: 1000001,
      maxVol: 10000000,
      cashback: 0.0045
    }]
  };
};

var affiliateDealTwo = function affiliateDealTwo(brand) {
  return {
    brand: brand,
    rates: [{
      level: 1,
      minVol: 0,
      maxVol: 100000,
      cashback: 0.004
    }, {
      level: 2,
      minVol: 100001,
      maxVol: 500000,
      cashback: 0.0045
    }, {
      level: 3,
      minVol: 500001,
      maxVol: 1000000,
      cashback: 0.005
    }, {
      level: 4,
      minVol: 1000001,
      maxVol: 10000000,
      cashback: 0.0055
    }]
  };
};

var quarterOne = ['January', 'February', 'March'];
var quarterTwo = ['April', 'May', 'June'];
var quarterThree = ['July', 'August', 'September'];
var quarterFour = ['October', 'November', 'December'];
var quarterMonths = [{
  month: 'January',
  quarter: 1,
  expires: quarterOne[2]
}];
var initialUpgrade = {
  Neteller: 'Fast Silver',
  Skrill: 'Fast Silver',
  ecoPayz: 'Gold'
};
module.exports = {
  defaultDealOne: defaultDealOne,
  defaultDealTwo: defaultDealTwo,
  defaultAffStats: defaultAffStats,
  defaultActStats: defaultActStats,
  affiliateDealOne: affiliateDealOne,
  affiliateDealTwo: affiliateDealTwo,
  initialUpgrades: initialUpgrades,
  setCurrency: setCurrency,
  nextUpgrades: nextUpgrades,
  defaultSiteId: defaultSiteId,
  defaultBalances: defaultBalances,
  initialUpgrade: initialUpgrade
};