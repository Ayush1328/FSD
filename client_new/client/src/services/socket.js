import { io } from 'socket.io-client';

const DEFAULT_PROD_API = 'https://bidvault-api-o6dt.onrender.com/api';
const DEFAULT_DEV_API = 'http://localhost:5001/api';
const DEFAULT_PROD_SOCKET = 'https://bidvault-api-o6dt.onrender.com';
const DEFAULT_DEV_SOCKET = 'http://localhost:5001';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? DEFAULT_PROD_API : DEFAULT_DEV_API);
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD ? DEFAULT_PROD_SOCKET : DEFAULT_DEV_SOCKET);

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
