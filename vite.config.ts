import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192.png', 'pwa-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Mark',
        short_name: 'Mark',
        description: 'Upload and serve logos and icons at any size',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b1220',
        theme_color: '#0284c7',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,webmanifest}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/auth'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ request, url }) =>
              request.method === 'GET' && url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'mark-api-get',
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/m/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'mark-images',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 86400,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5180,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8130',
        changeOrigin: true,
      },
      '/m': {
        target: 'http://127.0.0.1:8130',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:8130',
        changeOrigin: true,
      },
    },
  },
})
