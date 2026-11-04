const FraudFlag = require('../models/FraudFlag');
const User = require('../models/User');
const Bid = require('../models/Bid');

// Configurable thresholds for rules
const fraudConfig = {
  bidBurst: { maxBids: 5, windowMinutes: 2 },
  lastSecondSniping: { thresholdSeconds: 15, minOccurrences: 3 },
  newAccountHighBid: { hoursOld: 24, highAmountThreshold: 5000 },
  pingPong: { minAlternatingBids: 4 }
};

// Rule 1: Shill Bidding (IP/Fingerprint overlap between bidder & seller)
async function checkShillBidding(bidData, session) {
  const { bidderId, auction, clientIp } = bidData;
  const sellerId = auction.seller?._id || auction.seller;

  if (bidderId.toString() === sellerId.toString()) {
    return {
      triggered: true,
      rule: 'SHILL_BIDDING',
      severity: 'critical',
      evidence: { clientIp, message: 'Seller attempted to place bid on their own auction' }
    };
  }

  const bidderObj = await User.findById(bidderId).session(session);
  const sellerObj = await User.findById(sellerId).session(session);

  if (bidderObj && sellerObj) {
    const sharedIp = (bidderObj.fingerprints?.some(f => f.ip === clientIp) &&
                      sellerObj.fingerprints?.some(f => f.ip === clientIp)) ||
                     (clientIp !== '127.0.0.1' && bidderObj.fingerprints?.some(f => sellerObj.fingerprints?.some(sf => sf.ip === f.ip)));

    if (sharedIp) {
      return {
        triggered: true,
        rule: 'SHILL_BIDDING',
        severity: 'high',
        evidence: { clientIp, message: 'Bidder shares IP/device fingerprint with seller' }
      };
    }
  }
  return { triggered: false };
}

// Rule 2: Bid Burst (Too many bids from one user in a short timeframe)
async function checkBidBurst(bidData, session) {
  const { bidderId, auctionId } = bidData;
  const windowTime = new Date(Date.now() - fraudConfig.bidBurst.windowMinutes * 60 * 1000);

  const recentBidsCount = await Bid.countDocuments({
    bidder: bidderId,
    auction: auctionId,
    createdAt: { $gte: windowTime }
  }).session(session);

  if (recentBidsCount >= fraudConfig.bidBurst.maxBids) {
    return {
      triggered: true,
      rule: 'BID_BURST',
      severity: 'medium',
      evidence: { count: recentBidsCount + 1, windowMinutes: fraudConfig.bidBurst.windowMinutes }
    };
  }
  return { triggered: false };
}

// Rule 3: Ping-Pong Bidding (Two users repeatedly outbidding each other to inflate price)
async function checkPingPongBidding(bidData, session) {
  const { bidderId, auctionId } = bidData;
  
  const lastBids = await Bid.find({ auction: auctionId })
    .sort({ createdAt: -1 })
    .limit(fraudConfig.pingPong.minAlternatingBids)
    .session(session);

  if (lastBids.length >= fraudConfig.pingPong.minAlternatingBids - 1) {
    const biddersSequence = [bidderId.toString(), ...lastBids.map(b => b.bidder.toString())];
    const uniqueBidders = new Set(biddersSequence);
    
    // Exactly 2 bidders alternating back and forth
    if (uniqueBidders.size === 2) {
      let isAlternating = true;
      for (let i = 0; i < biddersSequence.length - 1; i++) {
        if (biddersSequence[i] === biddersSequence[i + 1]) {
          isAlternating = false;
          break;
        }
      }
      if (isAlternating) {
        return {
          triggered: true,
          rule: 'PING_PONG_COLLUSION',
          severity: 'high',
          evidence: {
            bidders: Array.from(uniqueBidders),
            sequenceLength: biddersSequence.length,
            message: 'Two bidders repeatedly outbidding each other in alternation'
          }
        };
      }
    }
  }
  return { triggered: false };
}

// Rule 4: New Account, Large Bid
async function checkNewAccountHighBid(bidData, session) {
  const { bidderId, amount } = bidData;
  const bidder = await User.findById(bidderId).session(session);

  if (bidder) {
    const accountAgeHours = (Date.now() - new Date(bidder.createdAt).getTime()) / (1000 * 60 * 60);

    if (accountAgeHours <= fraudConfig.newAccountHighBid.hoursOld && amount >= fraudConfig.newAccountHighBid.highAmountThreshold) {
      return {
        triggered: true,
        rule: 'NEW_ACCOUNT_HIGH_BID',
        severity: 'high',
        evidence: { accountAgeHours: Number(accountAgeHours.toFixed(1)), amount }
      };
    }
  }
  return { triggered: false };
}

// Rule 5: Last-Second Sniping Frequency
async function checkSnipingPattern(bidData, session) {
  const { bidderId, auction } = bidData;
  const now = Date.now();
  const endsAt = new Date(auction.endsAt).getTime();
  const remainingSeconds = (endsAt - now) / 1000;

  if (remainingSeconds <= fraudConfig.lastSecondSniping.thresholdSeconds && remainingSeconds > 0) {
    // Check user's history of last-second bids across all auctions
    const userBids = await Bid.find({ bidder: bidderId })
      .populate('auction', 'endsAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .session(session);

    let snipingCount = 1;
    for (const b of userBids) {
      if (b.auction?.endsAt) {
        const diff = (new Date(b.auction.endsAt).getTime() - new Date(b.createdAt).getTime()) / 1000;
        if (diff <= fraudConfig.lastSecondSniping.thresholdSeconds && diff >= 0) {
          snipingCount++;
        }
      }
    }

    if (snipingCount >= fraudConfig.lastSecondSniping.minOccurrences) {
      return {
        triggered: true,
        rule: 'REPEATED_SNIPING_PATTERN',
        severity: 'low',
        evidence: { occurrences: snipingCount, lastRemainingSeconds: Math.round(remainingSeconds) }
      };
    }
  }
  return { triggered: false };
}

// Master Engine Runner
async function runFraudEngine(bidData, session, io) {
  const rules = [
    checkShillBidding,
    checkBidBurst,
    checkPingPongBidding,
    checkNewAccountHighBid,
    checkSnipingPattern
  ];
  
  for (const ruleFn of rules) {
    try {
      const result = await ruleFn(bidData, session);
      if (result.triggered) {
        // Save Fraud Flag
        const flag = new FraudFlag({
          user: bidData.bidderId,
          auction: bidData.auctionId,
          rule: result.rule,
          severity: result.severity,
          evidence: result.evidence,
          status: 'open'
        });
        await flag.save({ session });

        // Increase User Risk Score
        const severityWeights = { low: 1, medium: 3, high: 5, critical: 10 };
        const scoreInc = severityWeights[result.severity] || 1;
        await User.findByIdAndUpdate(bidData.bidderId, {
          $inc: { riskScore: scoreInc }
        }).session(session);

        // Emit real-time alert to admin room
        if (io) {
          io.to('admin_room').emit('fraud:alert', {
            flagId: flag._id,
            userId: bidData.bidderId,
            auctionId: bidData.auctionId,
            rule: result.rule,
            severity: result.severity,
            evidence: result.evidence,
            createdAt: new Date()
          });
        }
      }
    } catch (err) {
      console.error(`Fraud rule error (${ruleFn.name}):`, err.message);
    }
  }
}

module.exports = runFraudEngine;
