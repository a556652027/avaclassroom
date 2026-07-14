import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { t } from '@/locales'
import { changePage } from '@/core/navigation'
import { useProduct } from '@/composables/useProduct'

// 原 SecondaryNav.vue <script setup> 的邏輯，模板繫結經由 useSecondaryNav() 回傳
export function useSecondaryNav() {

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

  return {
    route,
    product,
    userTier,
    activeId,
    go,
    t,
  }
}
