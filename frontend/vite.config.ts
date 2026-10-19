import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const api = process.env.VITE_PROXY_TARGET ?? 'http://localhost:5080';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/graphql': { target: api, changeOrigin: true },
      // Recipe pages live at /recipes/:id. Only forward API calls; a browser
      // navigation must stay on the React app so refresh and shared links work.
      '/recipes': {
        target: api,
        changeOrigin: true,
        bypass(req) {
          const accept = req.headers.accept ?? '';
          if (accept.includes('text/html')) {
            return '/index.html';
          }
        },
      },
      '/cuisines': { target: api, changeOrigin: true },
      '/users': { target: api, changeOrigin: true },
      '/auth': { target: api, changeOrigin: true },
      '/swagger': { target: api, changeOrigin: true },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
