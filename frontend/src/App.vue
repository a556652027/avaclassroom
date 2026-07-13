<template>
  <!-- 靜態 Loading 元素 (原 #initial-loader，防閃爍邏輯由 core/loader.js 控制) -->
  <div id="initial-loader">
    <div class="scan">
      <img
        src="/assets/images/Group (3).svg"
        alt="Loading..."
        @error="$event.target.style.display = 'none'"
      />
      <div class="fingerprint">
        <span class="loading-text">Loading...</span>
      </div>
    </div>
  </div>

  <!-- 以 fullPath 為 key：任何換頁 (含 query 變化) 都重新掛載頁面元件，
       比照舊版 change_page 整頁重載的行為 (例：側欄切換公司後 dashboard 重新抓資料) -->
  <router-view :key="$route.fullPath" />
</template>

<script setup>
import { onMounted } from 'vue'
import { VisibleLoaderElement } from '@/core/loader'
import { idleTimer } from '@/core/inactivity'

onMounted(() => {
  // 原 index.html: JS 就緒後移除靜態 Loading 遮罩
  VisibleLoaderElement(false)
  // 30 分鐘閒置自動登出
  idleTimer()
})
</script>

<style>
/* 原 modules/app.module.def.js 注入的 Critical CSS，解決 Loading 跑版 (FOUC) */
#initial-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  transition: opacity 0.3s ease-out;
}
#initial-loader .scan {
  text-align: center;
}
#initial-loader img {
  width: 300px;
  height: 300px;
  margin-bottom: 10px;
}
#initial-loader .loading-text {
  font-size: 60px;
  color: #92bfff;
  font-family: sans-serif;
  font-weight: bold;
  animation: blink 1.5s infinite;
}
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
/* 覆寫 loader.css 中可能引發 404 的指紋背景 */
.fingerprint {
  background-image: none !important;
}
</style>
