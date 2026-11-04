const express = require('express');
const router = express.Router();
const { placeBid, getAuctionBids } = require('../controllers/bidController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/:auctionId', authMiddleware, placeBid);
router.get('/:auctionId', getAuctionBids);

module.exports = router;