const express = require('express');
const router = express.Router();
const { getWallet, topUpWallet } = require('../controllers/walletController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getWallet);
router.post('/topup', topUpWallet);

module.exports = router;
