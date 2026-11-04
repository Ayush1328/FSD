const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startingPrice: { type: Number, required: true, min: 0 },
  currentBid: { type: Number, required: true, min: 0 },
  highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  endsAt: { type: Date, required: true },
  status: { type: String, enum: ['scheduled', 'active', 'ended'], default: 'scheduled' },
  bidCount: { type: Number, default: 0 }
}, { timestamps: true });

// Composite index for fast querying of active/scheduled auctions by expiration time
auctionSchema.index({ status: 1, endsAt: 1 });

module.exports = mongoose.model('Auction', auctionSchema);