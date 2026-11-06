const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['hold', 'release', 'payout', 'topup', 'refund'], 
    required: true 
  },
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
