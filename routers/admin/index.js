const express = require('express');
const router = express.Router();

const authRouter = require('./auth.router');
// const accountRouter = require('./account.router');
const userRouter = require('./user.router');
// const cashbackRouter = require('./cashback.router');
// const bonusRouter = require('./bonus.router');
// const payoutRouter = require('./payout.router');
// const staticRouter = require('./static.router');
const partnerRouter = require('./partner.router');
// const rafRouter = require('./raf.router');
const apiRouter = require('./api.router');
const activeUserRouter = require('./active-user-router');

// routes
router.use('/auth', authRouter);

// router.use('/account', accountRouter);

router.use('/user', userRouter);

// router.use('/cashback', cashbackRouter);

// router.use('/payout', payoutRouter);

// router.use('/static', staticRouter);

// router.use('/bonuses', bonusRouter);

router.use('/partner', partnerRouter);

router.use('/active-user', activeUserRouter);

router.use('/api', apiRouter);

module.exports = router;
