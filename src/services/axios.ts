// src/services/axios.ts
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrftoken='))
    ?.split('=')[1];

  if (csrfToken && config.headers) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

export default axiosInstance;
