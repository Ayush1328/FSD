const mongoose = require('mongoose');

// Fallback to a local MongoDB instance if MONGO_URI is not defined or connection fails.
const DEFAULT_URI = 'mongodb://127.0.0.1:27017/auctiondb';

const connectDB = async () => {
  const uri = process.env.MONGO_URI || DEFAULT_URI;
  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected successfully to host: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // If the first attempt used a remote Atlas URI and failed, retry with the default local URI.
    if (process.env.MONGO_URI && uri !== DEFAULT_URI) {
      console.log('Attempting fallback to local MongoDB instance...');
      try {
        await mongoose.connect(DEFAULT_URI);
        console.log('Fallback to local MongoDB succeeded.');
        return;
      } catch (fallbackError) {
        console.error('Fallback MongoDB connection error:', fallbackError.message);
      }
    }
    process.exit(1);
  }
};

module.exports = connectDB;
