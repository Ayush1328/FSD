const mongoose = require('mongoose');
const Auction = require('../models/Auction');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

exports.settleAuction = async (auctionId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const auction = await Auction.findById(auctionId).session(session);
    if (!auction || auction.status === 'ended') {
      await session.abortTransaction();
      session.endSession();
      return;
    }

    auction.status = 'ended';
    await auction.save({ session });

    if (auction.highestBidder) {
      // 1. Winner's held funds convert to final deduction & seller payout
      const winnerWallet = await Wallet.findOne({ user: auction.highestBidder }).session(session);
      const sellerWallet = await Wallet.findOne({ user: auction.seller }).session(session);

      if (winnerWallet && sellerWallet) {
        // Deduct from winner's total balance and held escrow
        winnerWallet.balance -= auction.currentBid;
        winnerWallet.held -= auction.currentBid;
        await winnerWallet.save({ session });

        // Add payout to seller's balance
        sellerWallet.balance += auction.currentBid;
        await sellerWallet.save({ session });

        // Log payout transaction
        await Transaction.create([{
          user: auction.seller,
          type: 'payout',
          amount: auction.currentBid,
          auction: auction._id
        }], { session });
      }
    }

    await session.commitTransaction();
    session.endSession();
    console.log(`Auction ${auctionId} settled successfully.`);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(`Error settling auction ${auctionId}:`, error.message);
  }
};