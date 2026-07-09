//  按需載入原 www 的頁面級 CSS (對應舊版各頁 <link> 的行為)
import { onMounted } from 'vue'

export function useLegacyCss(href) {
  onMounted(() => {
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.type = 'text/css'
      link.href = href
      document.head.appendChild(link)
    }
  })
}
