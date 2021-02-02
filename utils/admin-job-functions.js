const {
    AdminJob
} = require('../models/admin/index');


let dayjs = require('dayjs');
let advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);

const createAdminJob = ({ message, status, type, partner, activeUser, completed }) => Promise.resolve(AdminJob.create({ message, status, type, partner, activeUser, completed }))

module.exports = {
    createAdminJob
}