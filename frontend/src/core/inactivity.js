//  閒置自動登出 (原 www/scripts/inactivity.js，30 分鐘無操作即清除 session 回登入頁)
import { navigateToLogin } from './navigation'

export function idleTimer() {
  var t

  // 使用 AbortController 統一管理全域事件生命週期，避免 Memory Leak
  if (window._idleEventController) window._idleEventController.abort()
  window._idleEventController = new AbortController()
  const signal = window._idleEventController.signal

  window.addEventListener('click', resetTimer, { signal })
  window.addEventListener('scroll', resetTimer, { signal })
  window.addEventListener('keypress', resetTimer, { signal })

  function logout() {
    sessionStorage.clear()
    navigateToLogin()
  }

  function resetTimer() {
    clearTimeout(t)
    t = setTimeout(logout, 1800 * 1000) // 30 分鐘 (1800 秒)
  }
}
