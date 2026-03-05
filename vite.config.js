import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  root: 'frontend',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'frontend/src')
    }
  },
  server: {
    port: 3457,
    host: '0.0.0.0',
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '192.168.3.67',
      'maydaychenhome.top',
      'www.maydaychenhome.top'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../dist',
    assetsDir: 'static'
  },
  publicDir: 'public'
})
