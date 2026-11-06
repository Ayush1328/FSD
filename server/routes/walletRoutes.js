const express = require('express');
const router = express.Router();
const { getWallet, topUpWallet, claimFaucet, settleGame } = require('../controllers/walletController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getWallet);
router.post('/topup', topUpWallet);
router.post('/faucet', claimFaucet);
router.post('/settle-game', settleGame);

module.exports = router;
