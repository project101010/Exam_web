import axios from 'axios';
import { getToken } from './helpers';

const api = axios.create({
  baseURL: "https://exam-web-server.onrender.com/api", // Placeholder API base URL
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, logout
      localStorage.removeItem('token');
      window.location.href = '/signin-signup';
    }
    return Promise.reject(error);
  }
);

export default api;


