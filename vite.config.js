import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Quest System',
        short_name: 'System',
        description: 'Votre application de gestion de quêtes personnelles.',
        theme_color: '#1f1f1f',
        icons: [
          {
            src: 'pwa-192x192.png', // Vous devrez créer cette icône
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png', // Et celle-ci aussi
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
