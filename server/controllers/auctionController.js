const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

// 1. Create Auction
exports.createAuction = async (req, res) => {
  try {
    const { title, description, startingPrice, endsAt, imageUrl } = req.body;

    if (!title || !description || !startingPrice || !endsAt) {
      return res.status(400).json({ message: 'Title, description, starting price, and end time are required.' });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
    } else if (imageUrl) {
      images = [imageUrl];
    } else if (req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    } else {
      images = ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'];
    }

    const price = Number(startingPrice);
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ message: 'Starting price must be a valid positive number.' });
    }

    const auction = new Auction({
      title,
      description,
      images,
      seller: req.user.userId,
      startingPrice: price,
      currentBid: price,
      endsAt: new Date(endsAt),
      status: 'active'
    });

    await auction.save();
    res.status(201).json({ message: 'Auction created successfully', auction });
  } catch (error) {
    res.status(500).json({ message: 'Error creating auction', error: error.message });
  }
};

// 2. List Auctions (with Search, Filtering, and Pagination)
exports.getAuctions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, seller } = req.query;
    
    let query = {};
    if (status && status !== 'all') query.status = status;
    if (seller) query.seller = seller;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const auctions = await Auction.find(query)
      .populate('seller', 'name email riskScore')
      .populate('highestBidder', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Auction.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      auctions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching auctions', error: error.message });
  }
};

// 3. Get Single Auction by ID
exports.getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('seller', 'name email riskScore')
      .populate('highestBidder', 'name email');

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching auction', error: error.message });
  }
};

// 4. Cancel Auction (Only if there are no bids)
exports.cancelAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.seller.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to cancel this auction' });
    }

    if (auction.bidCount > 0) {
      return res.status(400).json({ message: 'Cannot cancel an auction that already has active bids.' });
    }

    auction.status = 'ended';
    await auction.save();

    res.json({ message: 'Auction cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling auction', error: error.message });
  }
};

// 5. Get User's created auctions & bids
exports.getUserAuctionsAndBids = async (req, res) => {
  try {
    const userId = req.user.userId;

    const myAuctions = await Auction.find({ seller: userId })
      .populate('highestBidder', 'name email')
      .sort({ createdAt: -1 });

    const userBids = await Bid.find({ bidder: userId })
      .populate({
        path: 'auction',
        populate: { path: 'highestBidder', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    res.json({
      myAuctions,
      myBids: userBids
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user auctions and bids', error: error.message });
  }
};

// 6. Delete a single auction (Owner or Admin)
exports.deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.seller.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this auction' });
    }

    await Auction.findByIdAndDelete(req.params.id);
    await Bid.deleteMany({ auction: req.params.id });

    res.json({ message: 'Auction removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting auction', error: error.message });
  }
};

// 7. Bulk Delete multiple auctions (Owner or Admin)
exports.bulkDeleteAuctions = async (req, res) => {
  try {
    const { auctionIds } = req.body;

    if (!Array.isArray(auctionIds) || auctionIds.length === 0) {
      return res.status(400).json({ message: 'Please provide a list of auction IDs to delete.' });
    }

    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';

    const filter = isAdmin
      ? { _id: { $in: auctionIds } }
      : { _id: { $in: auctionIds }, seller: userId };

    const matching = await Auction.find(filter).select('_id');
    const matchedIds = matching.map(m => m._id);

    if (matchedIds.length === 0) {
      return res.status(404).json({ message: 'No matching auctions found to remove.' });
    }

    const result = await Auction.deleteMany({ _id: { $in: matchedIds } });
    await Bid.deleteMany({ auction: { $in: matchedIds } });

    res.json({
      message: `Successfully removed ${result.deletedCount} auction item(s).`,
      deletedCount: result.deletedCount,
      deletedIds: matchedIds
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in bulk removal', error: error.message });
  }
};

// 8. Bulk Create multiple auctions
exports.bulkCreateAuctions = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Please provide a list of items to list.' });
    }

    const created = [];
    for (const item of items) {
      if (!item.title || !item.startingPrice || !item.endsAt) continue;

      const price = Number(item.startingPrice);
      if (isNaN(price) || price < 0) continue;

      const auction = new Auction({
        title: item.title,
        description: item.description || 'Verified auction listing on BidVault.',
        images: item.imageUrl ? [item.imageUrl] : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
        seller: req.user.userId,
        startingPrice: price,
        currentBid: price,
        endsAt: new Date(item.endsAt),
        status: 'active'
      });

      await auction.save();
      created.push(auction);
    }

    res.status(201).json({
      message: `Successfully listed ${created.length} auction item(s).`,
      count: created.length,
      auctions: created
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in bulk auction creation', error: error.message });
  }
};
