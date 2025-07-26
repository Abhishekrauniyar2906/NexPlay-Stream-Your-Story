import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL, // ✅ Now env is defined
          changeOrigin: true,
          secure: true,
        },
      },
    },
    plugins: [react(), tailwindcss()],
  };
});
