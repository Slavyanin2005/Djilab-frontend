import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        headers: {
          Origin: 'http://localhost:5173',
        },
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('❌ proxy error:', err);
          });
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('➡️ Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('⬅️ Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
    host: true,
    port: 5173,
  },
});
