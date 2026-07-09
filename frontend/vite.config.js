import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 開發時將 /orbital 與 /backend 轉發至本地 API (與舊版 www 的 127.0.0.1:8023 行為一致)
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
      '/orbital': { target: 'http://127.0.0.1:8023', changeOrigin: true },
      '/backend': { target: 'http://127.0.0.1:8023', changeOrigin: true },
    },
  },
})
