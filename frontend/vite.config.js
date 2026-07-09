import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 開發時將 /orbital 與 /backend 代理到可用的後端服務，讓前端可直接測試登入與管理功能
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/orbital': { target: 'https://lms.narvitech.com', changeOrigin: true, secure: false },
      '/backend': { target: 'https://lms.narvitech.com', changeOrigin: true, secure: false },
    },
  },
})
