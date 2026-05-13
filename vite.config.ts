// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,

        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('❌ proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('➡️  Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('⬅️  Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
});
