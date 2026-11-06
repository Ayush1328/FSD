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

// Free demo deposit faucet (Instant ₹10,000 chips)
exports.claimFaucet = async (req, res) => {
  try {
    const faucetAmount = 10000;
    let wallet = await Wallet.findOne({ user: req.user.userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user.userId, balance: 0, held: 0 });
    }

    wallet.balance += faucetAmount;
    await wallet.save();

    const transaction = await Transaction.create({
      user: req.user.userId,
      type: 'faucet',
      amount: faucetAmount,
      description: 'Free Demo Chips Faucet (+₹10,000)'
    });

    res.json({
      message: `🎉 ₹${faucetAmount.toLocaleString()} Free Demo Chips credited! Play & win!`,
      wallet: {
        balance: wallet.balance,
        held: wallet.held,
        available: Math.max(0, wallet.balance - wallet.held)
      },
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Error claiming faucet', error: error.message });
  }
};

// Settle Single-Player Casino Game (Mines, Crash, Plinko, Wheel)
exports.settleGame = async (req, res) => {
  try {
    const { betAmount, payout, gameName, multiplier } = req.body;
    const bet = Number(betAmount);
    const win = Number(payout);

    if (isNaN(bet) || bet <= 0) {
      return res.status(400).json({ message: 'Invalid wager amount' });
    }

    let wallet = await Wallet.findOne({ user: req.user.userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user.userId, balance: 5000, held: 0 });
    }

    const available = wallet.balance - wallet.held;
    if (available < bet) {
      return res.status(400).json({ 
        message: 'Insufficient balance. Claim free demo chips or top up!',
        needsDeposit: true 
      });
    }

    // Deduct bet and add payout atomically
    const netChange = win - bet;
    wallet.balance += netChange;
    await wallet.save();

    // Log transaction
    const transaction = await Transaction.create({
      user: req.user.userId,
      type: win > bet ? 'game_payout' : 'game_wager',
      amount: win > 0 ? win : bet,
      description: `${gameName || 'Casino Game'} ${win > bet ? `Win (${multiplier || ''}x)` : 'Bust'} - Net: ₹${netChange >= 0 ? '+' : ''}${netChange.toLocaleString()}`
    });

    res.json({
      success: true,
      netChange,
      wallet: {
        balance: wallet.balance,
        held: wallet.held,
        available: Math.max(0, wallet.balance - wallet.held)
      },
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Error settling game wager', error: error.message });
  }
};
