const mongoose = require('mongoose');

const fraudFlagSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
  rule: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  evidence: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['open', 'dismissed', 'confirmed'], default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model('FraudFlag', fraudFlagSchema);