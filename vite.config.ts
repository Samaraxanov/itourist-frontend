import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Allow HTTPS tunnel hosts (ngrok/cloudflared) so the Telegram Mini App can load in dev.
    allowedHosts: true,
    proxy: { '/api': 'http://localhost:4000' }, // dev: proxy API to backend
  },
});
