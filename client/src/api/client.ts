import axios from 'axios';

let rawUrl = ((import.meta as any).env?.VITE_API_BASE_URL || '/api').trim();

// Remove trailing slashes
rawUrl = rawUrl.replace(/\/+$/, '');

// If URL is full HTTP(S) domain and missing /api suffix, automatically append /api
if (rawUrl.startsWith('http') && !rawUrl.endsWith('/api')) {
  rawUrl = `${rawUrl}/api`;
}

const baseURL = rawUrl;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agrilink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
