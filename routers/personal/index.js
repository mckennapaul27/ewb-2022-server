const express = require('express');
const router = express.Router();

const activeUserRouter = require('./active-user-router');
const applicationRouter = require('./application.router');
const paymentRouter = require('./payment.router');
const reportRouter = require('./report.router');

router.use('/active-user', activeUserRouter);
router.use('/application', applicationRouter);
router.use('/payment', paymentRouter);
router.use('/report', reportRouter);

module.exports = router;