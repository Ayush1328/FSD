const express = require('express');
const router = express.Router();
const { 
  createAuction, 
  getAuctions, 
  getAuctionById, 
  cancelAuction,
  getUserAuctionsAndBids
} = require('../controllers/auctionController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/', getAuctions);
router.get('/user/activity', authMiddleware, getUserAuctionsAndBids);
router.get('/:id', getAuctionById);

// Protected routes (Requires valid JWT Access Token)
router.post('/', authMiddleware, upload.array('images', 5), createAuction);
router.patch('/:id/cancel', authMiddleware, cancelAuction);

module.exports = router;
