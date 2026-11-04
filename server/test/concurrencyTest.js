const axios = require('axios');

// Replace with a valid running backend URL, active auction ID, and a valid Bearer token
const API_URL = 'http://localhost:5000/api/bids/YOUR_AUCTION_ID';
const TOKEN = 'YOUR_BEARER_ACCESS_TOKEN'; 

async function runConcurrencyTest() {
  console.log('Firing 100 concurrent bids...');
  
  // Create an array of 100 concurrent axios promises with increasing bid amounts
  const requests = [];
  for (let i = 1; i <= 100; i++) {
    const bidAmount = 100 + (i * 5); // Ensuring they climb past minimum requirements
    requests.push(
      axios.post(API_URL, { amount: bidAmount }, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      }).then(res => ({ status: 'SUCCESS', data: res.data }))
        .catch(err => ({ status: 'REJECTED', error: err.response?.data?.message || err.message }))
    );
  }

  const results = await Promise.all(requests);
  
  const successful = results.filter(r => r.status === 'SUCCESS');
  const rejected = results.filter(r => r.status === 'REJECTED');

  console.log('-----------------------------------');
  console.log(`Total Requests Sent: 100`);
  console.log(`Successful Bids: ${successful.length}`);
  console.log(`Rejected Bids: ${rejected.length}`);
  console.log('-----------------------------------');
  
  if (successful.length === 1) {
    console.log('✅ CONCURRENCY TEST PASSED: Atomic lock successfully prevented race conditions!');
  } else {
    console.log('❌ TEST FAILED: Multiple bids succeeded concurrently.');
  }
}

// Run using: node server/test/concurrencyTest.js (with server running)
// runConcurrencyTest();