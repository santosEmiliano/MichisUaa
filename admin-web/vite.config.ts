import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path para producción: el admin vive en /michisuaa/admin/
  // Sin esto, los assets JS/CSS se buscan en / y dan 404
  base: '/michisuaa/admin/',
  server: {
    proxy: {
      '/michisuaa/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/michisuaa\/api/, '/api')
      }
    }
  }
})
