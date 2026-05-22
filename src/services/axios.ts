// src/services/axios.ts
import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: '/api', // ← Проксируется через Vite
  withCredentials: true, // ✅ Обязательно для сессий
  headers: {
    'Content-Type': 'application/json',
  },
});

// CSRF интерцептор
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
