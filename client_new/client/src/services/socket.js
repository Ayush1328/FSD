import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('token');
    socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('⚡ Socket connected to server:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }
  return socket;
};

export const reconnectSocketWithToken = (token) => {
  if (socket) {
    socket.disconnect();
  }
  socket = io(SOCKET_URL, {
    auth: { token },
    withCredentials: true
  });
  return socket;
};

export const joinAuctionRoom = (auctionId) => {
  const s = getSocket();
  if (s) {
    s.emit('join_auction', auctionId);
  }
};

export const leaveAuctionRoom = (auctionId) => {
  const s = getSocket();
  if (s) {
    s.emit('leave_auction', auctionId);
  }
};
