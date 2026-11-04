const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

exports.topUpWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid top-up amount.' });
    }

    const wallet = await Wallet.findOne({ user: req.user.userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found.' });
    }

    wallet.balance += amount;
    await wallet.save();

    await Transaction.create({
      user: req.user.userId,
      type: 'topup',
      amount
    });

    res.json({ message: 'Wallet topped up successfully', balance: wallet.balance, held: wallet.held });
  } catch (error) {
    res.status(500).json({ message: 'Server error during top-up', error: error.message });
  }
};