const Auction = require('../models/Auction');

// 1. Create Auction
exports.createAuction = async (req, res) => {
  try {
    const { title, description, startingPrice, endsAt } = req.body;

    // Map uploaded files from Multer-Cloudinary to an array of URLs
    const images = req.files ? req.files.map(file => file.path) : [];

    const auction = new Auction({
      title,
      description,
      images,
      seller: req.user.userId,
      startingPrice: Number(startingPrice),
      currentBid: Number(startingPrice),
      endsAt: new Date(endsAt),
      status: 'active' // or 'scheduled' based on start time
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
    const { page = 1, limit = 10, status, search, seller } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (seller) query.seller = seller;
    if (search) {
      query.title = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

    const auctions = await Auction.find(query)
      .populate('seller', 'name email')
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

    // Check if the requester is the seller (or an admin)
    if (auction.seller.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to cancel this auction' });
    }

    // Rule: Cannot cancel or modify once bids exist
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