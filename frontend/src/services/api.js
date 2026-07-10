import axios from 'axios';

const api = axios.create({
  baseURL: '', // Empty because we proxy to backend in development and use relative paths in production
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if exists
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

// Response Interceptor: Format error responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize error reporting
    const message =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : error.message || 'An unexpected error occurred';
    
    // Add custom key to easily extract message
    error.customMessage = message;
    
    return Promise.reject(error);
  }
);

export default api;
