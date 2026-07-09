<template>
  <div></div>
</template>

<script setup>
// 原 app.view.logout.js: 清除 Session 後回到入口 (入口再導向登入頁)
import { onMounted } from 'vue'
import { changePage } from '@/core/navigation'
import { VisibleLoaderElement } from '@/core/loader'

onMounted(() => {
  console.log('Logout View Initializing...')
  // 強制清除 SessionStorage，確保登出後無法透過 URL 返回
  window.sessionStorage.clear()
  VisibleLoaderElement(false)
  changePage('index.html')
})
</script>
