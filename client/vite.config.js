import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000/api/v1', // The URL of your backend
        changeOrigin: true,
        secure: false, // Set to true if you're using HTTPS
      },

    }
  },
  plugins: [react(), tailwindcss()],
})

