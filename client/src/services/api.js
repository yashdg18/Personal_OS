import axios from 'axios';

const isLocalPreview = !import.meta.env.DEV
  && ['localhost', '127.0.0.1'].includes(window.location.hostname);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (isLocalPreview ? 'http://127.0.0.1:5000/api' : '/api'),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.error?.message || error?.message || fallback;
}

export default api;
