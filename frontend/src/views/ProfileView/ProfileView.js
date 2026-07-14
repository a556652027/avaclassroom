import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { emitter } from '@/core/emitter'

// 原 ProfileView.vue <script setup> 的邏輯，模板繫結經由 useProfileView() 回傳
export function useProfileView() {
// 原 views/app.view.profile.js：進入頁面自動開啟 Profile Modal (GotoPageUpdateProfileOne)，
// 關閉/取消時導回 dashboard (navigateToDashboard)

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

  return {
    router,
    onModalHidden,
    off,
  }
}
