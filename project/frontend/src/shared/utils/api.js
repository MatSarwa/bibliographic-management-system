import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only an authenticated request getting 401 means the session expired.
    // A 401 from the auth forms (wrong password) must reach the form, even if a stale token was sent.
    const isAuthFormRequest = /^\/?auth\/(login|register|forgot-password|reset-password|resend-verification)/
      .test(error.config?.url || '');
    if (error.response?.status === 401 && error.config?.headers?.Authorization && !isAuthFormRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;