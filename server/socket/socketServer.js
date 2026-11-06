const jwt = require('jsonwebtoken');
const User = require('../models/User');

function initSocket(io) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');
        socket.user = decoded; // { userId, role }
        const userDoc = await User.findById(decoded.userId).select('name email role');
        if (userDoc) {
          socket.userName = userDoc.name;
        }
      } catch (err) {
        console.warn('Socket token verification failed, treating as guest:', err.message);
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.user?.userId;
    const userName = socket.userName || `Bidder_${socket.id.slice(0, 4)}`;
    const role = socket.user?.role;

    if (userId) {
      socket.join(`user:${userId}`);
      if (role === 'admin') {
        socket.join('admin_room');
      }
    }

    // ==========================================
    // AUCTION ROOM SYNC & LIVE REACTIONS
    // ==========================================
    socket.on('join_auction', (auctionId) => {
      socket.join(`auction:${auctionId}`);
    });

    socket.on('leave_auction', (auctionId) => {
      socket.leave(`auction:${auctionId}`);
    });

    // Support camelCase legacy aliases
    socket.on('joinAuction', (auctionId) => {
      socket.join(`auction:${auctionId}`);
    });

    socket.on('leaveAuction', (auctionId) => {
      socket.leave(`auction:${auctionId}`);
    });

    // Broadcast live emoji reactions (🔥, 🔨, 💰, 🚀, 😱)
    socket.on('auction:send_reaction', ({ auctionId, emoji }) => {
      io.to(`auction:${auctionId}`).emit('auction:new_reaction', {
        id: `rx-${Date.now()}-${Math.random()}`,
        emoji,
        sender: userName,
        timestamp: Date.now()
      });
    });

    // Broadcast live chat messages in auction room
    socket.on('auction:send_chat', ({ auctionId, message }) => {
      if (!message || !message.trim()) return;
      io.to(`auction:${auctionId}`).emit('auction:new_chat', {
        id: `chat-${Date.now()}`,
        sender: userName,
        message: message.trim().slice(0, 140),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
}

module.exports = initSocket;
