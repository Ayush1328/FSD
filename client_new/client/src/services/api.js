import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

API.interceptors.request.use((config) => {
  // Public auth endpoints must not receive a stale token from local storage.
  const isPublicAuthRoute = ['/auth/register', '/auth/login', '/auth/demo-login']
    .some((route) => config.url?.includes(route));
  if (!isPublicAuthRoute) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  // Ensure JSON payloads are sent with correct header
  if (config.method && ['post', 'put', 'patch'].includes(config.method) && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
}, (error) => Promise.reject(error));

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      // Optional: Auto logout or token refresh
    }
    return Promise.reject(error);
  }
);

export default API;
