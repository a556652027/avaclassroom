import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/core/net' // 初始化 window.Cyberspace (網路底層)
import '@/locales' // 初始化 window.localeData (多語系)

createApp(App).use(router).mount('#app')
