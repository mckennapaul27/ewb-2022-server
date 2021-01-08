const express = require('express');
const router = express.Router();

const authRouter = require('./auth.router');
const userRouter = require('./user.router');
const brandRouter = require('./brand-router');

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/brand', brandRouter)

module.exports = router;