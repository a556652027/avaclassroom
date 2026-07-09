<template>
  <!-- AVA Classroom 專用導覽列 (原 components/avaclassroom-nav/avaclassroom.js) -->
  <nav v-if="product === 'avaclassroom'" class="frame-nav">
    <div style="display: flex">
      <div class="nav-item" :class="{ active: activeId === 'dashboard' }" @click="go('dashboard')">
        <div class="nav-icon dashboard-icon" id="dashboard"></div>
        <span class="nav-text">{{ t('sidebarnav.dashboard') }}</span>
      </div>
      <div class="nav-item nav-item-second" :class="{ active: activeId === 'list' }" @click="go('list')">
        <div class="nav-icon list-icon" id="list"></div>
        <span class="nav-text">{{ t('license.title_list_license') }}</span>
      </div>
    </div>
    <div
      v-if="userTier !== '3'"
      class="nav-item nav-item-third"
      :class="{ active: activeId === 'management' }"
      @click="go('management')"
    >
      <div class="nav-icon management-icon" id="management"></div>
      <span class="nav-text">{{ t('sidebarnav.management') }}</span>
    </div>
  </nav>

  <!-- 標準導覽列 (原 components/app.component.frame.nav.js) -->
  <nav v-else class="frame-nav">
    <div style="display: flex">
      <div class="nav-item" :class="{ active: activeId === 'dashboard' }" @click="go('dashboard')">
        <div class="nav-icon dashboard-icon" id="dashboard"></div>
        <span class="nav-text">{{ t('sidebarnav.dashboard') }}</span>
      </div>
      <div class="nav-item nav-item-second" :class="{ active: activeId === 'license' }" @click="go('license')">
        <div class="nav-icon list-icon" id="license"></div>
        <span class="nav-text">{{ t('sidebarnav.license') }}</span>
      </div>
      <div class="nav-item nav-item-third" :class="{ active: activeId === 'device' }" @click="go('device')">
        <div class="nav-icon license-icon" id="device"></div>
        <span class="nav-text">{{ t('sidebarnav.device') }}</span>
      </div>
    </div>
    <div
      v-if="userTier !== '3'"
      class="nav-item nav-item-fourth"
      :class="{ active: activeId === 'management' }"
      @click="go('management')"
    >
      <div class="nav-icon management-icon" id="management"></div>
      <span class="nav-text">{{ t('sidebarnav.management') }}</span>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { t } from '@/locales'
import { changePage } from '@/core/navigation'
import { useProduct } from '@/composables/useProduct'

const route = useRoute()
const product = useProduct()
const userTier = window.sessionStorage.getItem('tier')

// 高亮邏輯 (原 updateActiveNavItem: 依當前頁面對應)
const activeId = computed(() => {
  switch (route.name) {
    case 'dashboard':
      return 'dashboard'
    case 'license':
      return product.value === 'avaclassroom' ? 'list' : 'license'
    case 'device':
      return 'device'
    case 'member':
      return 'management'
    default:
      return ''
  }
})

// 點擊導覽 (原 nav click 事件委派邏輯)
function go(id) {
  const productType = window.sessionStorage.getItem('product_type') || 'avacast'
  console.log('✅ Nav: Product Type:', productType, 'Clicked:', id)

  if (product.value === 'avaclassroom') {
    if (id === 'dashboard') changePage('dashboard.html', { params: { product: 'avaclassroom' } })
    else if (id === 'list') changePage('license.html', { params: { product: 'avaclassroom' } })
    else if (id === 'management') changePage('member.html', { params: { product: 'avaclassroom' } })
    return
  }

  if (id === 'dashboard') changePage('dashboard.html', { params: { product: productType } })
  else if (id === 'management') changePage('member.html')
  else if (id === 'license') changePage('license.html', { params: { product: productType } })
  else if (id === 'device') changePage('device.html', { params: { product: productType } })
}
</script>
