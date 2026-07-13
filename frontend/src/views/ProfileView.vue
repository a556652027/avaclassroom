<template>
  <AppLayout>
    <!-- 原 profile.html：頁面本身無內容，Profile Modal 透過 component 自動開啟 -->
    <div class="content"></div>
  </AppLayout>
</template>

<script setup>
// 原 views/app.view.profile.js：進入頁面自動開啟 Profile Modal (GotoPageUpdateProfileOne)，
// 關閉/取消時導回 dashboard (navigateToDashboard)
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { emitter } from '@/core/emitter'

const router = useRouter()

function onModalHidden() {
  router.push('/dashboard')
}

const off = emitter.on('profile-modal:hidden', onModalHidden)

onMounted(() => {
  emitter.emit('profile-modal:show')
})

onBeforeUnmount(() => {
  off()
})
</script>
