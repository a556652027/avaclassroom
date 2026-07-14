import { createRouter, createWebHashHistory } from 'vue-router'
import { setRouter } from '@/core/navigation'

// 頁面採 lazy import，維持與舊版「逐頁載入」相同的載入粒度
const routes = [
  {
    path: '/',
    name: 'index',
    // 原 index.html 自動登入檢查：有 session 直接進 dashboard，否則進登入頁
    redirect: () => {
      const token = window.sessionStorage.getItem('session_token')
      if (token && token !== 'undefined' && token !== 'null') {
        return '/dashboard'
      }
      return '/login'
    },
  },
  { path: '/login', name: 'login', component: () => import('@/views/LoginView/LoginView.vue'), meta: { public: true } },
  { path: '/logout', name: 'logout', component: () => import('@/views/LogoutView/LogoutView.vue'), meta: { public: true } },
  { path: '/reset-password', name: 'reset-password', component: () => import('@/views/ResetPasswordView/ResetPasswordView.vue'), meta: { public: true } },
  { path: '/home', name: 'home', component: () => import('@/views/HomeView/HomeView.vue') },
  { path: '/dashboard', name: 'dashboard', component: () => import('@/views/DashboardView/DashboardView.vue') },
  // list_dashboard.html 與 dashboard.html 共用同一份 view 邏輯，直接重用
  { path: '/list-dashboard', name: 'list-dashboard', component: () => import('@/views/DashboardView/DashboardView.vue') },
  { path: '/device', name: 'device', component: () => import('@/views/DeviceView/DeviceView.vue') },
  { path: '/member', name: 'member', component: () => import('@/views/MemberView/MemberView.vue') },
  { path: '/organization', name: 'organization', component: () => import('@/views/OrganizationView/OrganizationView.vue') },
  { path: '/license', name: 'license', component: () => import('@/views/LicenseView/LicenseView.vue') },
  { path: '/permission', name: 'permission', component: () => import('@/views/PermissionView/PermissionView.vue') },
  { path: '/profile', name: 'profile', component: () => import('@/views/ProfileView/ProfileView.vue') },
  { path: '/admin-tools', name: 'admin-tools', component: () => import('@/views/AdminToolsView/AdminToolsView.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 換頁時回收全域巨大快取與 Chart 實例 (原 lib.html.pagecontainer.js 的清理邏輯)
router.beforeEach((to, from, next) => {
  if (typeof window._allDeviceRecordsCache !== 'undefined')
    window._allDeviceRecordsCache = null
  if (typeof window._revokedDeviceRecordsCache !== 'undefined')
    window._revokedDeviceRecordsCache = null
  if (typeof window._allLicenseRecordsCache !== 'undefined')
    window._allLicenseRecordsCache = null
  if (typeof window._revokedLicenseRecordsCache !== 'undefined')
    window._revokedLicenseRecordsCache = null

  window.dispatchEvent(
    new CustomEvent('spa:page-change-before', {
      detail: { nextPage: to.path, targetPageId: null },
    }),
  )
  next()
})

setRouter(router)

export default router
