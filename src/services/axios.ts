import axios from 'axios';

const isTauri =
  typeof window !== 'undefined' &&
  ('__TAURI__' in window ||
    window.location.protocol === 'tauri:' ||
    window.location.hostname === 'tauri.localhost');

const API_BASE = isTauri
  ? 'https://192.168.0.107:8000/api'
  : import.meta.env.VITE_API_URL || 'https://192.168.0.107:8000/api';

console.log('[axios] API_BASE:', API_BASE);

export const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  // 🔹 Всегда берём токен из localStorage (универсально для веб + Tauri)
  const csrfToken = localStorage.getItem('csrftoken');

  if (csrfToken && config.headers) {
    config.headers['X-CSRFToken'] = csrfToken;
    console.log('[axios] X-CSRFToken header set:', csrfToken.substring(0, 10) + '...');
  } else if (!csrfToken) {
    console.warn('[axios] CSRF token NOT found, request may fail with 403');
  }

  return config;
});

axiosInstance.interceptors.response.use((response) => {
  if (response.headers) {
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
      for (const cookie of cookies) {
        if (cookie.startsWith('csrftoken=')) {
          const token = cookie.split(';')[0].split('=')[1];
          if (token) {
            localStorage.setItem('csrftoken', token);
            console.log('[axios] Saved csrftoken to localStorage:', token.substring(0, 10) + '...');
          }
          break;
        }
      }
    }
  }
  return response;
});

export default axiosInstance;
