/// <reference types="node" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig(({ mode, command }) => {
  const isTauriBuild = mode === 'tauri' || process.env.TAURI_PLATFORM;

  console.log('🔍 Vite config:', {
    mode,
    command,
    isTauriBuild,
    TAURI_PLATFORM: process.env.TAURI_PLATFORM,
  });

  // Базовая конфигурация прокси (переиспользуемая)
  const apiProxy = {
    target: process.env.DOCKER_MODE ? 'https://backend:8000' : 'https://192.168.0.107:8000',
    changeOrigin: true,
    secure: false,
    rewrite: (path: string) => path,
    headers: { Origin: 'http://localhost:5173' },
  };

  return {
    base: './',
    plugins: [
      react(),
      ...(isTauriBuild
        ? []
        : [
            VitePWA({
              registerType: 'autoUpdate',
              includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png'],
              manifest: {
                name: 'DJI Lab',
                short_name: 'DJILab',
                description: 'Система заказа лабораторного оборудования',
                theme_color: '#0971ce',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: '/',
                scope: '/',
                id: '/',
                icons: [
                  { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
                  { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
                  {
                    src: 'pwa-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'maskable',
                  },
                ],
              },
              workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                navigateFallbackDenylist: [/^\/api\//],
                runtimeCaching: [
                  {
                    urlPattern: ({ url }) => !url.pathname.startsWith('/api/'),
                    handler: 'NetworkFirst',
                    options: {
                      cacheName: 'static-cache',
                      expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
                      networkTimeoutSeconds: 10,
                    },
                  },
                ],
              },
            }),
          ]),
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
      proxy: { '/api': apiProxy },
      host: true,
      port: 5173,
    },
    preview: {
      proxy: { '/api': apiProxy },
      host: true,
      port: 4173,
    },
  };
});
