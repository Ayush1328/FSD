const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const User = require('./models/User');
const Wallet = require('./models/Wallet');
const Auction = require('./models/Auction');
const Bid = require('./models/Bid');
const Transaction = require('./models/Transaction');
const FraudFlag = require('./models/FraudFlag');

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Wallet.deleteMany({});
    await Auction.deleteMany({});
    await Bid.deleteMany({});
    await Transaction.deleteMany({});
    await FraudFlag.deleteMany({});

    console.log('Cleared existing collections.');

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('password123', salt);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);

    // 1. Create Users
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@auction.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      riskScore: 0,
      fingerprints: [{ ip: '127.0.0.1', deviceId: 'admin-machine' }]
    });

    const seller = await User.create({
      name: 'David Vance (Verified Seller)',
      email: 'seller@auction.com',
      passwordHash: defaultPasswordHash,
      role: 'user',
      riskScore: 0,
      fingerprints: [{ ip: '192.168.1.10', deviceId: 'seller-macbook' }]
    });

    const alice = await User.create({
      name: 'Alice Johnson',
      email: 'alice@auction.com',
      passwordHash: defaultPasswordHash,
      role: 'user',
      riskScore: 2,
      fingerprints: [{ ip: '192.168.1.50', deviceId: 'alice-iphone' }]
    });

    const bob = await User.create({
      name: 'Bob Miller',
      email: 'bob@auction.com',
      passwordHash: defaultPasswordHash,
      role: 'user',
      riskScore: 5,
      fingerprints: [{ ip: '192.168.1.75', deviceId: 'bob-thinkpad' }]
    });

    const charlie = await User.create({
      name: 'Charlie Shady (Flagged)',
      email: 'charlie@auction.com',
      passwordHash: defaultPasswordHash,
      role: 'user',
      riskScore: 24, // High risk score!
      fingerprints: [{ ip: '192.168.1.10', deviceId: 'shared-device' }] // Shared IP with seller!
    });

    console.log('Created Users (Admin, Seller, Alice, Bob, Charlie).');

    // 2. Provision Wallets with Initial Funds
    await Wallet.create({ user: admin._id, balance: 100000, held: 0 });
    await Wallet.create({ user: seller._id, balance: 2500, held: 0 });
    await Wallet.create({ user: alice._id, balance: 20000, held: 1450 }); // holds for current bids
    await Wallet.create({ user: bob._id, balance: 15000, held: 920 });
    await Wallet.create({ user: charlie._id, balance: 8000, held: 0 });

    console.log('Provisioned User Wallets with balances.');

    // 3. Create Sample Auctions
    const now = Date.now();

    // Auction 1: Ending in 10 minutes (Active, high engagement)
    const auction1 = await Auction.create({
      title: 'Rolex Submariner Date 41mm (Oystersteel)',
      description: 'Brand new in box with papers, 2024 model. Unworn ceramic bezel, 300m waterproof.',
      images: [
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1547996160-01ff69a285bf?w=800&auto=format&fit=crop&q=80'
      ],
      seller: seller._id,
      startingPrice: 8000,
      currentBid: 9200,
      highestBidder: bob._id,
      endsAt: new Date(now + 10 * 60 * 1000), // 10 minutes from now
      status: 'active',
      bidCount: 4
    });

    // Auction 2: Ending in 45 seconds (Perfect for testing anti-sniping extension!)
    const auction2 = await Auction.create({
      title: 'Charizard 1st Edition Shadowless Base Set PSA 9',
      description: 'Ultra rare vintage collectible Pokemon card in gem mint condition casing.',
      images: [
        'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=800&auto=format&fit=crop&q=80'
      ],
      seller: seller._id,
      startingPrice: 1200,
      currentBid: 1450,
      highestBidder: alice._id,
      endsAt: new Date(now + 50 * 1000), // 50 seconds from now
      status: 'active',
      bidCount: 3
    });

    // Auction 3: Apple MacBook Pro M3 Max 64GB
    const auction3 = await Auction.create({
      title: 'Apple MacBook Pro 16" M3 Max (64GB RAM, 1TB SSD)',
      description: 'Space Black, factory sealed. 16-core CPU, 40-core GPU, Liquid Retina XDR.',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'
      ],
      seller: seller._id,
      startingPrice: 2000,
      currentBid: 2400,
      highestBidder: alice._id,
      endsAt: new Date(now + 3 * 3600 * 1000), // 3 hours from now
      status: 'active',
      bidCount: 2
    });

    // Auction 4: Vintage 1968 Gibson Les Paul Custom
    const auction4 = await Auction.create({
      title: 'Vintage 1968 Gibson Les Paul Custom Ebony',
      description: 'Original finish with mild checking. Gold hardware, patent number humbuckers with original case.',
      images: [
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'
      ],
      seller: seller._id,
      startingPrice: 4500,
      currentBid: 4500,
      highestBidder: null,
      endsAt: new Date(now + 24 * 3600 * 1000), // 24 hours from now
      status: 'active',
      bidCount: 0
    });

    // Auction 5: Sony PlayStation 5 Pro (Ended & Settled)
    const auction5 = await Auction.create({
      title: 'Sony PlayStation 5 Pro 2TB 30th Anniversary Edition',
      description: 'Collector limited release console. Auction successfully concluded and settled.',
      images: [
        'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80'
      ],
      seller: seller._id,
      startingPrice: 700,
      currentBid: 950,
      highestBidder: alice._id,
      endsAt: new Date(now - 3600 * 1000), // Ended 1 hour ago
      status: 'ended',
      bidCount: 5
    });

    console.log('Created sample auctions with various states.');

    // 4. Create Historical Bids
    await Bid.create([
      { auction: auction1._id, bidder: alice._id, amount: 8200, ip: '192.168.1.50', createdAt: new Date(now - 30 * 60 * 1000) },
      { auction: auction1._id, bidder: bob._id, amount: 8500, ip: '192.168.1.75', createdAt: new Date(now - 20 * 60 * 1000) },
      { auction: auction1._id, bidder: alice._id, amount: 8800, ip: '192.168.1.50', createdAt: new Date(now - 10 * 60 * 1000) },
      { auction: auction1._id, bidder: bob._id, amount: 9200, ip: '192.168.1.75', createdAt: new Date(now - 2 * 60 * 1000) },

      { auction: auction2._id, bidder: bob._id, amount: 1300, ip: '192.168.1.75', createdAt: new Date(now - 15 * 60 * 1000) },
      { auction: auction2._id, bidder: alice._id, amount: 1450, ip: '192.168.1.50', createdAt: new Date(now - 1 * 60 * 1000) }
    ]);

    // 5. Create Transactions
    await Transaction.create([
      { user: alice._id, type: 'topup', amount: 20000 },
      { user: bob._id, type: 'topup', amount: 15000 },
      { user: alice._id, type: 'hold', amount: 1450, auction: auction2._id },
      { user: bob._id, type: 'hold', amount: 920, auction: auction1._id },
      { user: seller._id, type: 'payout', amount: 950, auction: auction5._id }
    ]);

    // 6. Create Demo Fraud Flags for Admin Dashboard
    await FraudFlag.create([
      {
        user: charlie._id,
        auction: auction1._id,
        rule: 'SHILL_BIDDING',
        severity: 'high',
        evidence: { clientIp: '192.168.1.10', message: 'Bidder shares identical IP fingerprint with seller David Vance' },
        status: 'open'
      },
      {
        user: charlie._id,
        auction: auction2._id,
        rule: 'BID_BURST',
        severity: 'medium',
        evidence: { count: 6, windowMinutes: 2, message: 'Rapid automated bid sequence detected' },
        status: 'open'
      },
      {
        user: charlie._id,
        auction: auction3._id,
        rule: 'NEW_ACCOUNT_HIGH_BID',
        severity: 'high',
        evidence: { accountAgeHours: 3.5, amount: 6500, message: 'Account created under 24 hours ago placed high-value bid' },
        status: 'open'
      },
      {
        user: bob._id,
        auction: auction1._id,
        rule: 'PING_PONG_COLLUSION',
        severity: 'high',
        evidence: { message: 'Repeated alternating bid patterns detected between two accounts' },
        status: 'dismissed'
      }
    ]);

    console.log('Created sample fraud flags for Admin Dashboard.');
    console.log('\n========================================');
    console.log('SEEDING COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log('Login credentials:');
    console.log('  Admin:   admin@auction.com   / admin123');
    console.log('  Seller:  seller@auction.com  / password123');
    console.log('  Alice:   alice@auction.com   / password123');
    console.log('  Bob:     bob@auction.com     / password123');
    console.log('  Charlie: charlie@auction.com / password123 (Flagged)');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDB();
