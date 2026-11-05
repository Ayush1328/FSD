const jwt = require('jsonwebtoken');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// In-memory multiplayer casino tables
const rooms = new Map();

function getPublicRooms() {
  const list = [];
  for (const [id, r] of rooms.entries()) {
    list.push({
      id: r.id,
      name: r.name,
      gameType: r.gameType,
      wager: r.wager,
      maxPlayers: r.maxPlayers,
      playerCount: r.players.length,
      players: r.players.map(p => ({ id: p.userId, name: p.name, ready: p.ready })),
      status: r.status,
      pot: r.pot
    });
  }
  return list;
}

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
    const userName = socket.userName || `Player_${socket.id.slice(0, 4)}`;
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

    // ==========================================
    // MULTIPLAYER CASINO & WAGER ENGINE (2-4P)
    // ==========================================
    
    // Request list of active tables
    socket.on('mp:get_rooms', () => {
      socket.emit('mp:rooms_updated', getPublicRooms());
    });

    // Create a new multiplayer table
    socket.on('mp:create_room', async ({ name, gameType, wager, maxPlayers }) => {
      const roomId = `table-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const safeWager = Math.max(50, Number(wager) || 500);
      const safeMax = Math.min(4, Math.max(2, Number(maxPlayers) || 4));

      const newRoom = {
        id: roomId,
        name: name || `${userName}'s Table`,
        gameType: gameType || 'dice', // 'dice' | 'rocket' | 'cards'
        wager: safeWager,
        maxPlayers: safeMax,
        status: 'waiting', // 'waiting' | 'starting' | 'playing' | 'ended'
        pot: 0,
        players: [
          {
            socketId: socket.id,
            userId: userId || socket.id,
            name: userName,
            ready: false,
            score: 0,
            dice: [],
            cashedOut: false,
            cashoutMultiplier: 0
          }
        ],
        gameData: null
      };

      rooms.set(roomId, newRoom);
      socket.join(`mp_room:${roomId}`);
      socket.currentRoomId = roomId;

      socket.emit('mp:room_joined', newRoom);
      io.emit('mp:rooms_updated', getPublicRooms());
    });

    // Join an existing multiplayer table
    socket.on('mp:join_room', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) {
        return socket.emit('mp:error', { message: 'Room not found or expired.' });
      }

      if (room.players.length >= room.maxPlayers) {
        return socket.emit('mp:error', { message: 'Table is full (Maximum 4 players).' });
      }

      if (room.status !== 'waiting') {
        return socket.emit('mp:error', { message: 'Game already in progress.' });
      }

      const existing = room.players.find(p => p.socketId === socket.id || (userId && p.userId === userId));
      if (!existing) {
        room.players.push({
          socketId: socket.id,
          userId: userId || socket.id,
          name: userName,
          ready: false,
          score: 0,
          dice: [],
          cashedOut: false,
          cashoutMultiplier: 0
        });
      }

      socket.join(`mp_room:${roomId}`);
      socket.currentRoomId = roomId;

      io.to(`mp_room:${roomId}`).emit('mp:room_state', room);
      io.emit('mp:rooms_updated', getPublicRooms());
    });

    // Toggle Ready status
    socket.on('mp:toggle_ready', async ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room || room.status !== 'waiting') return;

      const player = room.players.find(p => p.socketId === socket.id);
      if (player) {
        player.ready = !player.ready;
      }

      // Check if all players (min 2) are ready
      const allReady = room.players.length >= 2 && room.players.every(p => p.ready);

      if (allReady) {
        // Start countdown and deduct wager from all players
        room.status = 'starting';
        room.pot = room.wager * room.players.length;

        // Deduct wager from database if logged in
        for (const p of room.players) {
          if (p.userId && p.userId.length === 24) {
            try {
              let w = await Wallet.findOne({ user: p.userId });
              if (w && w.balance >= room.wager) {
                w.balance -= room.wager;
                await w.save();
                await Transaction.create({
                  user: p.userId,
                  type: 'game_wager',
                  amount: room.wager,
                  description: `Wager placed at table "${room.name}" (${room.gameType})`
                });
                io.to(`user:${p.userId}`).emit('wallet:updated', { balance: w.balance, available: w.balance - w.held });
              }
            } catch (err) {
              console.warn('Wager deduction note:', err.message);
            }
          }
        }

        io.to(`mp_room:${roomId}`).emit('mp:game_starting', {
          countdown: 3,
          pot: room.pot,
          room
        });

        setTimeout(() => {
          room.status = 'playing';
          if (room.gameType === 'rocket') {
            startMultiplayerRocket(io, room);
          } else {
            // Dice / Cards: wait for players to roll or reveal
            io.to(`mp_room:${roomId}`).emit('mp:game_started', room);
          }
        }, 3000);

      } else {
        io.to(`mp_room:${roomId}`).emit('mp:room_state', room);
      }
    });

    // Action: Roll Dice in High Roller Royale
    socket.on('mp:roll_dice', async ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room || room.status !== 'playing' || room.gameType !== 'dice') return;

      const player = room.players.find(p => p.socketId === socket.id);
      if (!player || player.dice.length > 0) return;

      // Roll 3 dice (1 to 6)
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const d3 = Math.floor(Math.random() * 6) + 1;
      player.dice = [d1, d2, d3];
      player.score = d1 + d2 + d3;

      io.to(`mp_room:${roomId}`).emit('mp:player_rolled', {
        userId: player.userId,
        name: player.name,
        dice: player.dice,
        score: player.score
      });

      // If all players rolled, determine winner!
      const allRolled = room.players.every(p => p.dice.length > 0);
      if (allRolled) {
        room.status = 'ended';

        // Sort by highest score
        const sorted = [...room.players].sort((a, b) => b.score - a.score);
        const topScore = sorted[0].score;
        const winners = sorted.filter(p => p.score === topScore);

        const winAmount = Math.floor(room.pot / winners.length);

        // Credit pot to winner(s)
        for (const wPlayer of winners) {
          if (wPlayer.userId && wPlayer.userId.length === 24) {
            try {
              let w = await Wallet.findOne({ user: wPlayer.userId });
              if (w) {
                w.balance += winAmount;
                await w.save();
                await Transaction.create({
                  user: wPlayer.userId,
                  type: 'game_payout',
                  amount: winAmount,
                  description: `🏆 Won Dice Royale pot at table "${room.name}" (+₹${winAmount.toLocaleString()})`
                });
                io.to(`user:${wPlayer.userId}`).emit('wallet:updated', { balance: w.balance, available: w.balance - w.held });
              }
            } catch (err) {
              console.warn('Payout note:', err.message);
            }
          }
        }

        io.to(`mp_room:${roomId}`).emit('mp:game_ended', {
          winners: winners.map(w => ({ name: w.name, userId: w.userId, score: w.score })),
          winAmount,
          room
        });
      }
    });

    // Action: Cash Out in Rocket Royale
    socket.on('mp:cashout_rocket', async ({ roomId, currentMultiplier }) => {
      const room = rooms.get(roomId);
      if (!room || room.status !== 'playing' || room.gameType !== 'rocket') return;

      const player = room.players.find(p => p.socketId === socket.id);
      if (!player || player.cashedOut) return;

      const mult = Number(currentMultiplier) || 1.0;
      player.cashedOut = true;
      player.cashoutMultiplier = mult;
      const winAmount = Math.floor(room.wager * mult);

      // Credit winnings
      if (player.userId && player.userId.length === 24) {
        try {
          let w = await Wallet.findOne({ user: player.userId });
          if (w) {
            w.balance += winAmount;
            await w.save();
            await Transaction.create({
              user: player.userId,
              type: 'game_payout',
              amount: winAmount,
              description: `🚀 Cashed out at ${mult}x in Crash Royale (+₹${winAmount.toLocaleString()})`
            });
            io.to(`user:${player.userId}`).emit('wallet:updated', { balance: w.balance, available: w.balance - w.held });
          }
        } catch (err) {
          console.warn('Crash cashout error:', err.message);
        }
      }

      io.to(`mp_room:${roomId}`).emit('mp:player_cashed_out', {
        userId: player.userId,
        name: player.name,
        multiplier: mult,
        winAmount
      });
    });

    // Table Chat
    socket.on('mp:chat', ({ roomId, message }) => {
      if (!message || !message.trim()) return;
      io.to(`mp_room:${roomId}`).emit('mp:new_chat', {
        sender: userName,
        message: message.trim().slice(0, 100),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    });

    // Leave room
    socket.on('mp:leave_room', ({ roomId }) => {
      handleLeaveRoom(socket, roomId, io);
    });

    socket.on('disconnect', () => {
      if (socket.currentRoomId) {
        handleLeaveRoom(socket, socket.currentRoomId, io);
      }
    });
  });
}

function handleLeaveRoom(socket, roomId, io) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.players = room.players.filter(p => p.socketId !== socket.id);
  socket.leave(`mp_room:${roomId}`);
  socket.currentRoomId = null;

  if (room.players.length === 0) {
    rooms.delete(roomId);
  } else {
    io.to(`mp_room:${roomId}`).emit('mp:room_state', room);
  }
  io.emit('mp:rooms_updated', getPublicRooms());
}

// Server-controlled Multi-Rocket Crash Game
function startMultiplayerRocket(io, room) {
  let multiplier = 1.0;
  // Generate a realistic crash point between 1.20x and 35.00x
  const rand = Math.random();
  const crashPoint = rand < 0.1 ? 1.15 : rand < 0.6 ? +(1.2 + Math.random() * 2.8).toFixed(2) : +(2.5 + Math.random() * 12.0).toFixed(2);

  io.to(`mp_room:${room.id}`).emit('mp:rocket_tick', { multiplier: 1.0, isCrashed: false });

  const interval = setInterval(() => {
    multiplier = +(multiplier + 0.05 + multiplier * 0.02).toFixed(2);

    if (multiplier >= crashPoint) {
      clearInterval(interval);
      room.status = 'ended';

      io.to(`mp_room:${room.id}`).emit('mp:rocket_tick', {
        multiplier: crashPoint,
        isCrashed: true
      });

      io.to(`mp_room:${room.id}`).emit('mp:game_ended', {
        crashPoint,
        room
      });
    } else {
      io.to(`mp_room:${room.id}`).emit('mp:rocket_tick', {
        multiplier,
        isCrashed: false
      });
    }
  }, 150);
}

module.exports = initSocket;
