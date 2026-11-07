const express = require('express');
const router = express.Router();
const { 
  createAuction, 
  getAuctions, 
  getAuctionById, 
  cancelAuction,
  deleteAuction,
  bulkDeleteAuctions,
  bulkCreateAuctions,
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
router.post('/bulk-create', authMiddleware, bulkCreateAuctions);
router.post('/bulk-delete', authMiddleware, bulkDeleteAuctions);
router.patch('/:id/cancel', authMiddleware, cancelAuction);
router.delete('/:id', authMiddleware, deleteAuction);

module.exports = router;
