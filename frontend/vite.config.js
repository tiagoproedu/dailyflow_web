import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react( ),
    VitePWA({
      registerType: 'autoUpdate',
      // O service worker gerado automaticamente não aceita handler de `push`. Com
      // `injectManifest` o ficheiro é o nosso (`src/sw.js`) e o plugin só injeta nele a
      // lista de ficheiros a pré-carregar.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'DailyFlow — hábitos, rotinas e produtividade',
        short_name: 'DailyFlow',
        description: 'Seu assistente de hábitos, rotinas e produtividade.',
        lang: 'pt-BR',
        start_url: '/dashboard',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#7C3AED',
        theme_color: '#7C3AED',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          // O ícone maskable tem zona segura para não ser cortado no Android
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      // Regras de cache e tratamento do push vivem em `src/sw.js`.
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,png,woff2}'],
      },
    }),
  ],
})
