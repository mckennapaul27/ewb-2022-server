const express = require('express');
const router = express.Router();

const authRouter = require('./routers/auth.router');
const userRouter = require('./routers/user.router');
const reportRouter = require('./routers/report.router');
const activeUserRouter = require('./routers/active-user-router');
const paymentRouter = require('./routers/payment.router');
const applicationRouter = require('./routers/application.router');

// routers
router.use('/auth', authRouter);

router.use('/user', userRouter);

router.use('/report', reportRouter);

router.use('/active-user', activeUserRouter);

router.use('/payment', paymentRouter);

router.use('/application', applicationRouter);

module.exports = router;