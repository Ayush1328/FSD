const express = require('express');
const router = express.Router();
const { getFraudFlags, resolveFraudFlag, getAdminMetrics } = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

router.use(authMiddleware, requireRole('admin'));

router.get('/flags', getFraudFlags);
router.patch('/flags/:flagId', resolveFraudFlag);
router.get('/metrics', getAdminMetrics);

module.exports = router;