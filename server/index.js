import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();

app.use(express.json());

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Atlas Connected Successfully!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

// routes 
const auctionRoutes = require('./routes/auctionRoutes');
app.use('/api/auctions', auctionRoutes);