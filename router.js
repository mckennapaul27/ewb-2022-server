const express = require('express');
const router = express.Router();

const adminRouter = require('./routers/admin/index');
const affiliateRouter = require('./routers/affiliate/index');
const commonRouter = require('./routers/common/index');
const personalRouter = require('./routers/personal/index');

router.use('/admin', adminRouter);
router.use('/affiliate', affiliateRouter);
router.use('/common', commonRouter);
router.use('/personal', personalRouter);

module.exports = router;