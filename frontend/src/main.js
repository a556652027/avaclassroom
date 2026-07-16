import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/styles/variables.css' // 全站設計 Token (顏色/陰影/圓角/字體)
import '@/styles/ui.css' // 共用元件樣式 (按鈕三層級/卡片/輸入框)
import '@/core/net' // 初始化 window.Cyberspace (網路底層)
import '@/locales' // 初始化 window.localeData (多語系)
import { installAlertBridge } from '@/services/notify'

// 原生 alert() 全面改為右上角 Toast (自動判斷成功/錯誤/警告，短暫顯示後消失)
installAlertBridge()

createApp(App).use(router).mount('#app')
