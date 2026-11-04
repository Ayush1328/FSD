const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
  bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  ip: { type: String, required: true }
}, { timestamps: true });

// Index for retrieving bid history chronologically per auction
bidSchema.index({ auction: 1, createdAt: -1 });

module.exports = mongoose.model('Bid', bidSchema);