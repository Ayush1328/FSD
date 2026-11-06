const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

// Get current user's wallet with recent transactions
exports.getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user.userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user.userId, balance: 5000, held: 0 });
    }

    const transactions = await Transaction.find({ user: req.user.userId })
      .populate('auction', 'title currentBid status')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      wallet: {
        balance: wallet.balance,
        held: wallet.held,
        available: Math.max(0, wallet.balance - wallet.held)
      },
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wallet', error: error.message });
  }
};

// Top up wallet balance
exports.topUpWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const topUpAmount = Number(amount);
    if (!topUpAmount || topUpAmount <= 0) {
      return res.status(400).json({ message: 'Invalid top-up amount. Must be greater than 0.' });
    }

    let wallet = await Wallet.findOne({ user: req.user.userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user.userId, balance: 0, held: 0 });
    }

    wallet.balance += topUpAmount;
    await wallet.save();

    const transaction = await Transaction.create({
      user: req.user.userId,
      type: 'topup',
      amount: topUpAmount,
      description: `Manual deposit of ₹${topUpAmount.toLocaleString()}`
    });

    res.json({
      message: `Wallet topped up by ₹${topUpAmount.toLocaleString()} successfully!`,
      wallet: {
        balance: wallet.balance,
        held: wallet.held,
        available: Math.max(0, wallet.balance - wallet.held)
      },
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during top-up', error: error.message });
  }
};
