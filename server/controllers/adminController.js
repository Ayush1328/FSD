const FraudFlag = require('../models/FraudFlag');
const Auction = require('../models/Auction');
const User = require('../models/User');

// Get Live Fraud Flags Feed
exports.getFraudFlags = async (req, res) => {
  try {
    const flags = await FraudFlag.find({ status: 'open' })
      .populate('user', 'name email riskScore')
      .populate('auction', 'title currentBid endsAt')
      .sort({ createdAt: -1 });
    res.json(flags);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fraud flags', error: error.message });
  }
};

// Review Action: Dismiss, Confirm & Suspend, or Cancel Auction
exports.resolveFraudFlag = async (req, res) => {
  try {
    const { flagId } = req.params;
    const { action } = req.body; // 'dismiss', 'suspend_user', 'cancel_auction'

    const flag = await FraudFlag.findById(flagId);
    if (!flag) return res.status(404).json({ message: 'Flag not found' });

    if (action === 'dismiss') {
      flag.status = 'dismissed';
      await flag.save();
    } else if (action === 'suspend_user') {
      flag.status = 'confirmed';
      await flag.save();
      await User.findByIdAndUpdate(flag.user, { role: 'suspended' });
    } else if (action === 'cancel_auction') {
      flag.status = 'confirmed';
      await flag.save();
      await Auction.findByIdAndUpdate(flag.auction, { status: 'ended' });
    }

    res.json({ message: `Fraud flag resolved with action: ${action}` });
  } catch (error) {
    res.status(500).json({ message: 'Error resolving fraud flag', error: error.message });
  }
};

// Admin Metrics for Charts (Recharts backend data supplier)
exports.getAdminMetrics = async (req, res) => {
  try {
    const totalAuctions = await Auction.countDocuments();
    const activeAuctions = await Auction.countDocuments({ status: 'active' });
    const totalUsers = await User.countDocuments();
    const openFlags = await FraudFlag.countDocuments({ status: 'open' });

    // Aggregate flags by rule type
    const flagsByType = await FraudFlag.aggregate([
      { $group: { _id: '$rule', count: { $sum: 1 } } }
    ]);

    // Top risky users
    const topRiskyUsers = await User.find().sort({ riskScore: -1 }).limit(5).select('name email riskScore');

    res.json({
      summary: { totalAuctions, activeAuctions, totalUsers, openFlags },
      flagsByType,
      topRiskyUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching metrics', error: error.message });
  }
};