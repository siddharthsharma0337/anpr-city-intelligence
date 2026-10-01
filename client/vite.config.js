import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    server: {
      port: 5173,
      // Only apply proxy in development (not used in production Vercel build)
      proxy: isProduction ? {} : {
        '/api': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true
        },
        '/uploads': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true
        },
        '/socket.io': {
          target: 'http://127.0.0.1:5000',
          ws: true
        }
      }
    }
  };
})

