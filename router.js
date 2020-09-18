const express = require('express');
const router = express.Router();

const authRouter = require('./routers/auth.router');
const userRouter = require('./routers/user.router');
const reportRouter = require('./routers/report.router');

// routers
router.use('/auth', authRouter);

router.use('/user', userRouter);

router.use('/report', reportRouter);

module.exports = router;