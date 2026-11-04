const jwt = require('jsonwebtoken');

function initSocket(io) {
  // Optional / Soft authentication during handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');
        socket.user = decoded; // { userId, role }
      } catch (err) {
        console.warn('Socket token verification failed, treating as guest:', err.message);
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.user?.userId;
    const role = socket.user?.role;

    if (userId) {
      console.log(`Socket connected: User ${userId} (${role})`);
      // Join user's private notification channel
      socket.join(`user:${userId}`);

      // If user is an admin, join the admin alert room for real-time fraud alerts
      if (role === 'admin') {
        socket.join('admin_room');
        console.log(`Admin user ${userId} joined admin_room`);
      }
    } else {
      console.log('Socket connected: Guest viewer');
    }

    // Join specific auction room for live bid streams
    socket.on('join_auction', (auctionId) => {
      socket.join(`auction:${auctionId}`);
    });

    // Leave auction room
    socket.on('leave_auction', (auctionId) => {
      socket.leave(`auction:${auctionId}`);
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
}

module.exports = initSocket;
