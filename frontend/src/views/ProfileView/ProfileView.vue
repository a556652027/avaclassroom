<template>
  <AppLayout>
    <!-- 原 profile.html：頁面本身無內容，Profile Modal 透過 component 自動開啟 -->
    <div class="content"></div>
  </AppLayout>
</template>

<script setup>
// 邏輯抽離至 ProfileView.js，此處僅保留模板繫結
import AppLayout from '@/layouts/AppLayout/AppLayout.vue'
import { useProfileView } from './ProfileView.js'

const {
  router,
  onModalHidden,
  off,
} = useProfileView()
</script>
