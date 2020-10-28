const express = require('express');
const router = express.Router();

const partnerRouter = require('./partner.router');
const applicationRouter = require('./application.router');
const reportRouter = require('./report.router');
// const accountRouter = require('./account.router');
const paymentRouter = require('./payment.router')
// const subRouter = require('./sub.router');

router.use('/partner', partnerRouter);

router.use('/application', applicationRouter);

router.use('/report', reportRouter);

// router.use('/account', accountRouter);

router.use('/payment', paymentRouter);

// router.use('/sub', subRouter);

module.exports = router;