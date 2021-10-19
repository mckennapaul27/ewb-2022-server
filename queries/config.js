let dayjs = require('dayjs')
let advancedFormat = require('dayjs/plugin/advancedFormat')
dayjs.extend(advancedFormat)

let netKey =
    'https://affiliates.neteller.com/api/affreporting.asp?key=1a76f23b338c47f7834c9063e6f2d141'
let skrillKey =
    'https://affiliates.skrill.com/api/affreporting.asp?key=d321fcf05c67ad9bf6d5e6c1ebba8d65'

let displayBy = '&reportdisplayby=Date'
let acidReport = '&reportname=ACIDReport'
let reportFormat = '&reportformat=xml'
let accountReport = '&reportname=AccountReport'
let accountReportDetailed = '&reportname=AccountReportDetailed'
let playerRegistrations = '&reportname=PlayerRegistrations'
// let netMerchantId = '&reportmerchantid=0';
// let skrillMerchantId = '&reportmerchantid=8';

// let startOfMonthYYYYMMDD = () => dayjs().startOf('month').format('YYYY/MM/DD');
// let endOfMonthYYYYMMDD = () => dayjs().endOf('month').format('YYYY/MM/DD');

let startDate = (num) =>
    `&reportstartdate=${dayjs()
        .subtract(num, 'months')
        .startOf('month')
        .format('YYYY/MM/DD')}`
let endDate = (num) =>
    `&reportenddate=${dayjs()
        .subtract(num, 'months')
        .endOf('month')
        .format('YYYY/MM/DD')}`

let yesterday = () => dayjs().subtract(1, 'days').format('YYYY/MM/DD')
let reportPeriod = () =>
    `&reportstartdate=${yesterday()}` + `&reportenddate=${yesterday()}`

// https://affiliates.skrill.com/api/affreporting.asp?key=d321fcf05c67ad9bf6d5e6c1ebba8d65&reportname=PlayerRegistrations&reportformat=xml&reportmerchantid=0&reportstartdate=2020/11/1&reportenddate=2020/11/12

let NET_ACCOUNT_REPORT = (num) =>
    netKey + accountReport + reportFormat + startDate(num) + endDate(num)
let NET_PLAYER_REGISTRATIONS_REPORT = (num) =>
    netKey + playerRegistrations + reportFormat + +startDate(num) + endDate(num)
let YESTERDAY_ACID_NET_URL = () =>
    netKey + acidReport + reportFormat + reportPeriod() + displayBy

let SKRILL_ACCOUNT_REPORT = (num) =>
    skrillKey + accountReport + reportFormat + +startDate(num) + endDate(num)
let SKRILL_PLAYER_REGISTRATIONS_REPORT = (num) =>
    skrillKey +
    playerRegistrations +
    reportFormat +
    +startDate(num) +
    endDate(num)
let YESTERDAY_ACID_SKRILL_URL = () =>
    skrillKey + acidReport + reportFormat + reportPeriod() + displayBy

let startOfMonthX = (num) =>
    Number(dayjs().subtract(num, 'months').startOf('month').format('x')) // https://day.js.org/docs/en/plugin/advanced-format

module.exports = {
    startOfMonthX,

    NET_ACCOUNT_REPORT,
    NET_PLAYER_REGISTRATIONS_REPORT,
    YESTERDAY_ACID_NET_URL,

    SKRILL_ACCOUNT_REPORT,
    SKRILL_PLAYER_REGISTRATIONS_REPORT,
    YESTERDAY_ACID_SKRILL_URL,
}
