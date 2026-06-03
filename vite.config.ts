import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Vite forwards /rnm/... to franceagrimer.fr, bypassing browser CORS
      '/rnm': {
        target: 'https://rnm.franceagrimer.fr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rnm/, ''),
      },
    },
  },
});
