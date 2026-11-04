const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectDB = require('./db');
const initSocket = require('./socket/socketServer');
const initAuctionScheduler = require('./services/auctionScheduler');

const authRoutes = require('./routes/authRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const bidRoutes = require('./routes/bidRoutes');
const walletRoutes = require('./routes/walletRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB Atlas
connectDB();

// 1. Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});
app.set('io', io);

// Initialize Socket events and Auction Scheduler
initSocket(io);
initAuctionScheduler(io);

// 2. Global Security & Parsing Middleware
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading images cross-origin
}));

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Rate limiting on sensitive bidding endpoint
const bidLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many bidding requests from this IP, please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// 4. API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Auction API is healthy', serverTime: Date.now() });
});

app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidLimiter, bidRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);

// 5. Global Error Handling
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 Auction Server running on http://localhost:${PORT}`);
  });
}

module.exports = { app, server };
