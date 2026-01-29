import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const backendAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include auth token
backendAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('guest_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add interceptor to handle auth errors
backendAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('guest_token');
      localStorage.removeItem('token_expires_at');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default backendAxios;
