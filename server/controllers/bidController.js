const mongoose = require('mongoose');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const runFraudEngine = require('../services/fraudEngine');

exports.placeBid = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { auctionId } = req.params;
    const { amount } = req.body;
    const userId = req.user.userId;
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const bidAmount = Number(amount);

    if (!bidAmount || isNaN(bidAmount) || bidAmount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Invalid bid amount.' });
    }

    // 1. Fetch current auction snapshot within transaction
    const auction = await Auction.findById(auctionId).session(session);
    if (!auction || auction.status !== 'active' || new Date() > new Date(auction.endsAt)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Auction is not active or has already ended.' });
    }

    if (auction.seller.toString() === userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Sellers cannot bid on their own auctions.' });
    }

    // Minimum 1% increment rule
    const baselinePrice = auction.currentBid > 0 ? auction.currentBid : auction.startingPrice;
    const minRequiredBid = Math.ceil((baselinePrice * 1.01) * 100) / 100; // at least 1% higher

    if (bidAmount < minRequiredBid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: `Bid too low. Minimum required bid is $${minRequiredBid.toFixed(2)}.` 
      });
    }

    // 2. Check bidder's wallet available balance (balance - held)
    const bidderWallet = await Wallet.findOne({ user: userId }).session(session);
    if (!bidderWallet) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Bidder wallet not found. Please top up your wallet.' });
    }

    const availableBalance = bidderWallet.balance - bidderWallet.held;
    if (availableBalance < bidAmount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: `Insufficient available funds. Available: $${availableBalance.toFixed(2)}, Bid requires: $${bidAmount.toFixed(2)}` 
      });
    }

    // 3. Anti-Sniping Check: If bid arrives in last 30 seconds, extend by 30 seconds
    const now = Date.now();
    const remainingTimeMs = new Date(auction.endsAt).getTime() - now;
    const thirtySecondsMs = 30 * 1000;
    let isExtended = false;
    let newEndsAt = auction.endsAt;

    if (remainingTimeMs <= thirtySecondsMs && remainingTimeMs > 0) {
      isExtended = true;
      newEndsAt = new Date(new Date(auction.endsAt).getTime() + thirtySecondsMs);
    }

    // 4. ATOMIC CONDITIONAL UPDATE:
    // Guarantees no two concurrent bids can race and succeed at the same or lower amount
    const updatedAuction = await Auction.findOneAndUpdate(
      {
        _id: auctionId,
        status: 'active',
        endsAt: { $gt: new Date() },
        currentBid: { $lt: bidAmount },
        seller: { $ne: userId }
      },
      {
        $set: {
          currentBid: bidAmount,
          highestBidder: userId,
          endsAt: newEndsAt
        },
        $inc: { bidCount: 1 }
      },
      { new: true, session }
    );

    if (!updatedAuction) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ message: 'Bid rejected: Outbid by another user or auction just ended.' });
    }

    // 5. Escrow Hold: Lock current bidder's funds into 'held'
    bidderWallet.held += bidAmount;
    await bidderWallet.save({ session });

    // 6. Escrow Release: Release previous highest bidder's held funds
    const previousHighestBidderId = auction.highestBidder;
    if (previousHighestBidderId && previousHighestBidderId.toString() !== userId) {
      const prevWallet = await Wallet.findOne({ user: previousHighestBidderId }).session(session);
      if (prevWallet) {
        const prevHeldAmount = auction.currentBid;
        prevWallet.held = Math.max(0, prevWallet.held - prevHeldAmount);
        await prevWallet.save({ session });

        await Transaction.create([{
          user: previousHighestBidderId,
          type: 'release',
          amount: prevHeldAmount,
          auction: auctionId
        }], { session });
      }
    }

    // 7. Create Bid and Transaction record
    await Bid.create([{
      auction: auctionId,
      bidder: userId,
      amount: bidAmount,
      ip: clientIp
    }], { session });

    await Transaction.create([{
      user: userId,
      type: 'hold',
      amount: bidAmount,
      auction: auctionId
    }], { session });

    // 8. Run Fraud Detection Rules Engine
    const io = req.app.get('io');
    const bidData = {
      bidderId: userId,
      auctionId,
      auction: updatedAuction,
      amount: bidAmount,
      clientIp
    };
    await runFraudEngine(bidData, session, io);

    // 9. Commit transaction securely
    await session.commitTransaction();
    session.endSession();

    // 10. Real-time Socket.IO Broadcasts
    if (io) {
      const roomName = `auction:${auctionId}`;

      io.to(roomName).emit('bid:new', {
        auctionId,
        currentBid: bidAmount,
        highestBidder: { _id: userId, name: req.user.name || 'Bidder' },
        bidCount: updatedAuction.bidCount,
        endsAt: updatedAuction.endsAt,
        serverTime: Date.now()
      });

      if (isExtended) {
        io.to(roomName).emit('auction:extended', {
          auctionId,
          newEndsAt: updatedAuction.endsAt,
          message: '⚡ Anti-sniping activated! Auction extended by 30 seconds.'
        });
      }

      if (previousHighestBidderId && previousHighestBidderId.toString() !== userId) {
        io.to(`user:${previousHighestBidderId}`).emit('outbid', {
          auctionId,
          auctionTitle: auction.title,
          newBid: bidAmount,
          message: `⚠️ You have been outbid on "${auction.title}"! Current bid: $${bidAmount}`
        });
      }
    }

    res.status(201).json({
      message: 'Bid placed successfully with escrow lock!',
      auction: {
        id: updatedAuction._id,
        currentBid: updatedAuction.currentBid,
        highestBidder: updatedAuction.highestBidder,
        bidCount: updatedAuction.bidCount,
        endsAt: updatedAuction.endsAt,
        isExtended
      }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Bid placement error:', error);
    res.status(500).json({ message: 'Transaction rolled back.', error: error.message });
  }
};

exports.getAuctionBids = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const bids = await Bid.find({ auction: auctionId })
      .populate('bidder', 'name email riskScore')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bids', error: error.message });
  }
};
