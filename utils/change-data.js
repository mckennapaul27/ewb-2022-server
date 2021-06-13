const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const C = require('chance')
const moment = require('moment')
const chance = new C();
const {
    UserCounter,
    Notification,
    App
} = require('../models/common/index')
const {
    Report,
    Application
} = require('../models/personal/index')
const {
    AffAccount,
    AffReport,
    AffPayment,
    AffPartner
} = require('../models/affiliate/index')
const {
    LOCAL_DB_URL,
    SECRET,
    PORT,
    options,
    corsOptions
} = require('../config/config');
const AffCounter = require('../models/affiliate/AffCounter');

const { updateApplication } = require('../utils/notifications-list');

const dayjs = require('dayjs');
const advancedFormat = require('dayjs/plugin/advancedFormat');
const AffApplication = require('../models/affiliate/AffApplication');
dayjs.extend(advancedFormat);

const arr = [
    60,
    67,
    85,
    106,
    108,
    493,
    495,
    497,
    547,
    550,
    552,
    586,
    589,
    591,
    592,
    593,
    609,
    619,
    620,
    643,
    649,
    659,
    676,
    678,
    679,
    681,
    683,
    687,
    688,
    690,
    691,
    692,
    694,
    698,
    700,
    702,
    707,
    708,
    710,
    718,
    722,
    727,
    736,
    739,
    743,
    746,
    758,
    759,
    760,
    761,
    764,
    765,
    766,
    768,
    772,
    773,
    774,
    776,
    778,
    779,
    787,
    789,
    790,
    791,
    803,
    806,
    807,
    809,
    811,
    814,
    816,
    817,
    818,
    820,
    821,
    831,
    832,
    834,
    838,
    839,
    841,
    843,
    844,
    845,
    846,
    847,
    853,
    855,
    861,
    865,
    866,
    868,
    870,
    876,
    878,
    879,
    881,
    882,
    883,
    886,
    889,
    890,
    892,
    893,
    895,
    898,
    900,
    902,
    905,
    912,
    913,
    916,
    918,
    919,
    920,
    921,
    922,
    924,
    925,
    927,
    928,
    929,
    930,
    931,
    934,
    937,
    938,
    940,
    941,
    943,
    944,
    945,
    947,
    950,
    954,
    957,
    959,
    961,
    966,
    967,
    968,
    969,
    970,
    972,
    984,
    986,
    988,
    992,
    997,
    998,
    999,
    1000,
    1004,
    1007,
    1008,
    1010,
    1016,
    1017,
    1018,
    1027,
    1031,
    1035,
    1036,
    1040,
    1048,
    1051,
    1053,
    1057,
    1060,
    1061,
    1064,
    1071,
    1075,
    1076,
    1077,
    1079,
    1080,
    1081,
    1091,
    1093,
    1100,
    1123,
    1124,
    1126,
    1131,
    1132,
    1142,
    1150,
    2825,
    3569,
    3618,
    3633,
    3634,
    3643,
    3657,
    3674,
    3683,
    3685,
    3693,
    3708,
    3719,
    3733,
    3770,
    3788,
    3796,
    3800,
    3809,
    3833,
    3836,
    3855,
    3862,
    3864,
    3868,
];

const changeIsPermitted = () => {
    return arr.map(async epi => {
        await AffPartner.findOneAndUpdate({ epi }, {
            isPermitted: false
        }, {
            new: true,
            select: 'isPermitted'
        })
    })
}


module.exports = {
    changeIsPermitted
}

// setAffApplicationStatus()







  
// module.exports = {
//     seedDatabase,
// }