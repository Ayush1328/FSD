import { create } from 'zustand';
import API from '../services/api';
import { reconnectSocketWithToken } from '../services/socket';

export const useAuthStore = create((set, get) => ({
  user: null,
  wallet: { balance: 0, held: 0, available: 0 },
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  // Fetch current user and wallet state
  fetchMe: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, wallet: { balance: 0, held: 0, available: 0 } });
      return;
    }

    try {
      set({ isLoading: true });
      const res = await API.get('/auth/me');
      const { user, wallet } = res.data;
      const available = Math.max(0, (wallet?.balance || 0) - (wallet?.held || 0));
      set({
        user,
        wallet: { ...wallet, available },
        isLoading: false
      });
      reconnectSocketWithToken(token);
    } catch (err) {
      console.warn('Session expired or invalid:', err.message);
      localStorage.removeItem('token');
      set({ user: null, token: null, isLoading: false });
    }
  },

  // Login
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const res = await API.post('/auth/login', { email, password });
      const { accessToken, user, wallet } = res.data;

      localStorage.setItem('token', accessToken);
      const available = Math.max(0, (wallet?.balance || 0) - (wallet?.held || 0));

      set({
        user,
        token: accessToken,
        wallet: { ...wallet, available },
        isLoading: false
      });

      reconnectSocketWithToken(accessToken);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  // Register
  register: async (name, email, password) => {
    try {
      set({ isLoading: true, error: null });
      const res = await API.post('/auth/register', { name, email, password });
      const { accessToken, user, wallet } = res.data;

      localStorage.setItem('token', accessToken);
      const available = Math.max(0, (wallet?.balance || 0) - (wallet?.held || 0));

      set({
        user,
        token: accessToken,
        wallet: { ...wallet, available },
        isLoading: false
      });

      reconnectSocketWithToken(accessToken);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Registration failed.';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  // Logout
  logout: async () => {
    try {
      await API.post('/auth/logout');
    } catch {
      // Ignore
    }
    localStorage.removeItem('token');
    reconnectSocketWithToken(null);
    set({ user: null, token: null, wallet: { balance: 0, held: 0, available: 0 } });
  },

  // Update wallet balance in real-time
  updateWallet: (walletData) => {
    const available = Math.max(0, (walletData.balance || 0) - (walletData.held || 0));
    set({ wallet: { ...walletData, available } });
  }
}));
