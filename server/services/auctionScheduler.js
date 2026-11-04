const cron = require('node-cron');
const mongoose = require('mongoose');
const Auction = require('../models/Auction');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

function initAuctionScheduler(io) {
  // Runs every 5 seconds to check for expired auctions
  cron.schedule('*/5 * * * * *', async () => {
    try {
      const now = new Date();

      // Find all active auctions that have passed their end time
      const expiredAuctions = await Auction.find({
        status: 'active',
        endsAt: { $lte: now }
      });

      for (const targetAuction of expiredAuctions) {
        // ATOMIC FLIP: Ensure only one worker/instance successfully closes this auction
        const auction = await Auction.findOneAndUpdate(
          { _id: targetAuction._id, status: 'active' },
          { $set: { status: 'ended' } },
          { new: true }
        );

        if (!auction) continue; // Already processed by another worker instance

        // Begin Escrow Settlement Transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          if (auction.highestBidder) {
            const winnerWallet = await Wallet.findOne({ user: auction.highestBidder }).session(session);
            const sellerWallet = await Wallet.findOne({ user: auction.seller }).session(session);

            if (winnerWallet && sellerWallet) {
              // Deduct from winner balance & release escrow held funds
              winnerWallet.balance -= auction.currentBid;
              winnerWallet.held -= auction.currentBid;
              await winnerWallet.save({ session });

              // Credit seller balance with final payout
              sellerWallet.balance += auction.currentBid;
              await sellerWallet.save({ session });

              // Record payout transaction ledger
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

          // Broadcast real-time auction closure to room clients
          if (io) {
            io.to(`auction:${auction._id}`).emit('auction:ended', {
              auctionId: auction._id,
              highestBidder: auction.highestBidder,
              finalPrice: auction.currentBid,
              message: 'Auction has officially ended!'
            });
          }

          console.log(`Successfully closed and settled auction: ${auction._id}`);
        } catch (settleError) {
          await session.abortTransaction();
          session.endSession();
          console.error(`Failed to settle auction ${auction._id}:`, settleError.message);
        }
      }
    } catch (error) {
      console.error('Error running auction scheduler cron job:', error.message);
    }
  });
}

module.exports = initAuctionScheduler;