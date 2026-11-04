const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function runConcurrencyTest() {
  try {
    console.log('--- STARTING CONCURRENCY RACE-CONDITION TEST ---');
    console.log(`Connecting to backend at ${BASE_URL}...`);

    // 1. Authenticate as Alice to get a token
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'alice@auction.com',
      password: 'password123'
    });
    const token = loginRes.data.accessToken;
    console.log('✓ Authenticated as Alice Johnson');

    // 2. Fetch active auctions
    const auctionsRes = await axios.get(`${BASE_URL}/auctions?status=active`);
    const auctions = auctionsRes.data.auctions;
    if (!auctions || auctions.length === 0) {
      console.error('No active auctions found. Please run seed script first: node server/seed.js');
      return;
    }

    const targetAuction = auctions.find(a => a.status === 'active') || auctions[0];
    const auctionId = targetAuction._id;
    const currentPrice = targetAuction.currentBid || targetAuction.startingPrice;
    console.log(`✓ Targeting auction "${targetAuction.title}" (Current bid: $${currentPrice})`);

    console.log('\nFiring 50 simultaneous concurrent bids with identical amounts ($' + (currentPrice + 100) + ')...');

    // Test 1: Identical bid race condition (All bidders attempt to bid the exact same amount at the exact same millisecond)
    const identicalBids = [];
    const targetAmount = Math.ceil(currentPrice * 1.05);

    for (let i = 0; i < 50; i++) {
      identicalBids.push(
        axios.post(`${BASE_URL}/bids/${auctionId}`, { amount: targetAmount }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => ({ status: 'SUCCESS', data: res.data }))
        .catch(err => ({ status: 'REJECTED', error: err.response?.data?.message || err.message }))
      );
    }

    const results = await Promise.all(identicalBids);
    const successful = results.filter(r => r.status === 'SUCCESS');
    const rejected = results.filter(r => r.status === 'REJECTED');

    console.log('----------------------------------------------------');
    console.log(`Total Concurrent Requests: 50`);
    console.log(`Successful Bids Accepted:  ${successful.length}`);
    console.log(`Rejected Bids (Conflict):  ${rejected.length}`);
    console.log('----------------------------------------------------');

    if (successful.length === 1 && rejected.length === 49) {
      console.log('✅ TEST PASSED: Atomic lock & MongoDB transaction successfully prevented race condition! Exactly 1 bid won.');
    } else if (successful.length === 0) {
      console.log('⚠️ No bids succeeded (target amount might have been too low or insufficient funds).');
    } else {
      console.log(`❌ TEST FAILED: ${successful.length} concurrent bids succeeded simultaneously.`);
    }

  } catch (error) {
    console.error('Concurrency test error:', error.response?.data || error.message);
  }
}

runConcurrencyTest();
