//  目前產品類型 (原邏輯: URL ?product=... 優先，其次 sessionStorage product_type，保底 avacast)
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export function useProduct() {
  const route = useRoute()
  return computed(
    () =>
      route.query.product ||
      window.sessionStorage.getItem('product_type') ||
      'avacast',
  )
}
