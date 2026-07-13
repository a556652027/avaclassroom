//  舊版 change_page("xxx.html") 與 Vue Router 之間的對應層
//  底層跳轉行為不變：session 過期 → 登入頁；各頁互跳 → 對應路由
let _router = null

const PAGE_ROUTE_MAP = {
  'index.html': '/',
  'login.html': '/login',
  'logout.html': '/logout',
  'home.html': '/home',
  'dashboard.html': '/dashboard',
  'list_dashboard.html': '/list-dashboard',
  'device.html': '/device',
  'member.html': '/member',
  'organization.html': '/organization',
  'license.html': '/license',
  'permission.html': '/permission',
  'profile.html': '/profile',
  'admin_tools.html': '/admin-tools',
  'reset_password.html': '/reset-password',
}

export function setRouter(router) {
  _router = router
}

// 對應舊版 change_page(page, { params })
export function changePage(page, options) {
  const clean = String(page).replace(/^\.\//, '')
  const route = PAGE_ROUTE_MAP[clean]
  if (!route) {
    console.error('[navigation] Unknown page: ' + page)
    return
  }
  const query = options && options.params ? { ...options.params } : {}
  if (_router) {
    // 原版 change_page 是整頁重載；SPA 若目標與當前 path+query 完全相同，
    // Vue Router 不會觸發任何變化 (例：已在 dashboard 又點側欄另一家公司、產品相同)。
    // 加上遞增參數讓 fullPath 改變，配合 App.vue 的 :key 強制頁面重新掛載。
    const cur = _router.currentRoute.value
    const sameQuery =
      JSON.stringify(Object.assign({}, cur.query, { _r: undefined })) ===
      JSON.stringify(Object.assign({}, query, { _r: undefined }))
    if (cur.path === route && sameQuery) {
      query._r = Date.now()
    }
    _router.push({ path: route, query })
  } else {
    window.location.hash = '#' + route
  }
}

export function navigateToLogin() {
  changePage('login.html')
}
