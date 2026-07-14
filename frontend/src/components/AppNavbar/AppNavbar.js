import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { t } from '@/locales'
import { changePage } from '@/core/navigation'
import { VisibleLoaderElement } from '@/core/loader'
import { fetchFirstSchoolOfCompanyDirect, fallbackSchoolToCompany, selectSchool } from '@/services/orgTree'
import { PRODUCT_DICTIONARY } from '@/core/products'
import { emitter } from '@/core/emitter'
import { useProduct } from '@/composables/useProduct'

// 原 AppNavbar.vue <script setup> 的邏輯，模板繫結經由 useAppNavbar() 回傳
export function useAppNavbar() {

const userMenuOpen = ref(false)
const memberCid = ref(window.sessionStorage.getItem('member_cid') || 'sales')
const userTier = window.sessionStorage.getItem('tier')
const isAdminTier = userTier === '0' || userTier === '1'

const activeProduct = useProduct()

// 依後端回傳的產品清單產生 Tab，核心產品排列順序固定
const sortedProducts = computed(() => {
  let owned = []
  try {
    owned = JSON.parse(window.sessionStorage.getItem('owned_products') || '[]')
  } catch (e) {
    console.error('Error parsing owned_products', e)
  }
  const defaultOrder = ['avacast', 'illuminet', 'avaclassroom']
  const sorted = defaultOrder.filter((p) => owned.includes(p))
  for (const p of owned) {
    if (!defaultOrder.includes(p)) sorted.push(p)
  }
  return sorted
})

// 取得產品顯示名稱 (找不到對應則首字母大寫)
function productName(productKey) {
  if (!productKey) return ''
  return (
    PRODUCT_DICTIONARY[productKey] ||
    productKey.charAt(0).toUpperCase() + productKey.slice(1)
  )
}

// 點擊產品切換 (原 initAllNavbarLogic 內 topnav-link 的完整邏輯)
function onProductClick(pType) {
  console.log('✅ 點擊了產品：', pType)

  // [防呆] 切換非 avaclassroom 產品時，若當前選中 group_cid 為學校，回退為 parent 公司 ID
  if (pType !== 'avaclassroom') {
    fallbackSchoolToCompany()
  }

  // [優化] 當前為公司群組且切換至 avaclassroom 時，先預查旗下第一所學校再跳轉
  if (pType === 'avaclassroom') {
    let currentGroup =
      window.sessionStorage.getItem('group_cid') ||
      window.sessionStorage.getItem('select_group_cid') ||
      ''
    if (currentGroup && !currentGroup.startsWith('sch_')) {
      VisibleLoaderElement(true)
      fetchFirstSchoolOfCompanyDirect(currentGroup, (firstSchool) => {
        VisibleLoaderElement(false)
        if (firstSchool && firstSchool.cid) {
          console.log(
            `[Navbar] 預先查詢第一所學校成功: ${firstSchool.name} (${firstSchool.cid})，寫入 session`,
          )
          selectSchool(firstSchool, currentGroup)
        }
        gotoProductDashboard(pType)
      })
      return
    }
  }

  gotoProductDashboard(pType)
}

function gotoProductDashboard(pType) {
  window.sessionStorage.setItem('product_type', pType)
  changePage('dashboard.html', { params: { product: pType } })
}

function openProfile() {
  userMenuOpen.value = false
  emitter.emit('profile-modal:show')
}

function goAdminTools() {
  userMenuOpen.value = false
  changePage('admin_tools.html')
}

// 原 navbar: SPA 瞬間登出
function doLogout() {
  userMenuOpen.value = false
  console.log('執行 SPA 瞬間登出')
  window.sessionStorage.clear()
  changePage('login.html')
}

// 手機版漢堡選單: 開合 Sidebar
function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar')
  if (sidebar) sidebar.classList.toggle('mobile-open')
}

// 點擊畫面其他空白處時自動關閉使用者選單 / 手機側欄
function onDocumentClick(e) {
  if (!e.target.closest('.topnav-user-menu')) {
    userMenuOpen.value = false
  }
  const sidebar = document.getElementById('sidebar')
  if (
    sidebar &&
    sidebar.classList.contains('mobile-open') &&
    window.innerWidth <= 768 &&
    !e.target.closest('#sidebar') &&
    !e.target.closest('.mobile-hamburger-btn')
  ) {
    sidebar.classList.remove('mobile-open')
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)

  // 原邏輯: 未設定 product_type 時採用 default_product 或第一個 owned product 保底
  if (!window.sessionStorage.getItem('product_type')) {
    let defProd = window.sessionStorage.getItem('default_product')
    if (!defProd && sortedProducts.value.length > 0) {
      defProd = sortedProducts.value[0]
    }
    window.sessionStorage.setItem('product_type', defProd || 'avacast')
  }
})

onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))

  return {
    userMenuOpen,
    memberCid,
    userTier,
    isAdminTier,
    activeProduct,
    sortedProducts,
    productName,
    onProductClick,
    gotoProductDashboard,
    openProfile,
    goAdminTools,
    doLogout,
    toggleMobileSidebar,
    onDocumentClick,
    t,
  }
}
