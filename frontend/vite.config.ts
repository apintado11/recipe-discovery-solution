import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const api = process.env.VITE_PROXY_TARGET ?? 'http://localhost:5080';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/graphql': { target: api, changeOrigin: true },
      '/recipes': { target: api, changeOrigin: true },
      '/cuisines': { target: api, changeOrigin: true },
      '/users': { target: api, changeOrigin: true },
      '/swagger': { target: api, changeOrigin: true },
    },
  },
});
