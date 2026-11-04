const mongoose = require('mongoose');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

exports.placeBid = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { auctionId } = req.params;
    const { amount } = req.body;
    const userId = req.user.userId;
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Invalid bid amount.' });
    }

    // 1. Fetch auction within the session
    const auction = await Auction.findById(auctionId).session(session);
    if (!auction || auction.status !== 'active' || new Date() > auction.endsAt) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Auction is not active or has ended.' });
    }

    if (auction.seller.toString() === userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Sellers cannot bid on their own auctions.' });
    }

    const baselinePrice = auction.currentBid > 0 ? auction.currentBid : auction.startingPrice;
    const minRequiredBid = baselinePrice * 1.01; // Minimum 1% increment

    if (amount < minRequiredBid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: `Bid too low. Minimum required is ${minRequiredBid.toFixed(2)}.` 
      });
    }

    // 2. Check bidder's wallet balance
    const bidderWallet = await Wallet.findOne({ user: userId }).session(session);
    if (!bidderWallet) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Bidder wallet not found. Please top up.' });
    }

    const availableBalance = bidderWallet.balance - bidderWallet.held;
    if (availableBalance < amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: `Insufficient available funds. Available: ${availableBalance.toFixed(2)}, Bid: ${amount}` 
      });
    }

    const previousHighestBidderId = auction.highestBidder;

    // 3. Lock new bidder's money into 'held'
    bidderWallet.held += amount;
    await bidderWallet.save({ session });

    // 4. Release previous highest bidder's money from 'held' (if any)
    if (previousHighestBidderId) {
      const prevWallet = await Wallet.findOne({ user: previousHighestBidderId }).session(session);
      if (prevWallet) {
        // Find their previous active bid amount on this auction to release the exact locked amount
        const prevBid = await Bid.findOne({ auction: auctionId, bidder: previousHighestBidderId })
          .sort({ createdAt: -1 })
          .session(session);
        
        const heldReleaseAmount = prevBid ? prevBid.amount : auction.currentBid;
        prevWallet.held = Math.max(0, prevWallet.held - heldReleaseAmount);
        await prevWallet.save({ session });

        // Log release transaction
        await Transaction.create([{
          user: previousHighestBidderId,
          type: 'release',
          amount: heldReleaseAmount,
          auction: auctionId
        }], { session });
      }
    }

    // 5. Update auction and insert Bid and Transaction documents
    auction.currentBid = amount;
    auction.highestBidder = userId;
    auction.bidCount += 1;
    await auction.save({ session });

    await Bid.create([{
      auction: auctionId,
      bidder: userId,
      amount,
      ip: clientIp
    }], { session });

    await Transaction.create([{
      user: userId,
      type: 'hold',
      amount,
      auction: auctionId
    }], { session });

    // 6. Commit transaction successfully
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Bid placed successfully with escrow hold!',
      auction: {
        id: auction._id,
        currentBid: auction.currentBid,
        highestBidder: auction.highestBidder,
        bidCount: auction.bidCount
      }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Transaction failed, rolled back securely.', error: error.message });
  }
};