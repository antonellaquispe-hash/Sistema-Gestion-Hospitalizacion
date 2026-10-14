import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy al backend. En desarrollo usa el proxy por defecto.
// Para apuntar a otro backend: VITE_PROXY_TARGET=http://localhost:8081 npm run dev
const backendTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:8081';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
});
