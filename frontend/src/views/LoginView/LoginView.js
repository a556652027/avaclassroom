import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { t, localeData, currentLang } from '@/locales'
import { changePage } from '@/core/navigation'
import { VisibleLoaderElement } from '@/core/loader'
import { TablesiToTableii } from '@/core/util'
import { CsRequestLogin, CsRequestLogout, CsRequestResetPassword } from '@/api/login'
import {
  CsRequestGroupSelectAllRecordsByCondition,
  CsRequestGroupGetOwnedProducts,
} from '@/api/organization'

// 原 LoginView.vue <script setup> 的邏輯，模板繫結經由 useLoginView() 回傳
export function useLoginView() {

const route = useRoute()
const page = ref('login')
const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const langOpen = ref(false)
const resetUsername = ref('')
const resetEmail = ref('')

// ---------- 登入流程狀態機 ----------
// idle → loading → success → (card fade out) → router.push
const loginState = ref('idle') // 'idle' | 'loading' | 'success'
const cardLeaving = ref(false)
const isBusy = computed(() => loginState.value !== 'idle')
const resetState = ref('idle') // 重設密碼頁的送出狀態

// 帳密錯誤走 inline error (密碼欄下方 + shake)
const loginError = ref('')
const shakeError = ref(false)
function showLoginError(msg) {
  loginError.value = msg
  shakeError.value = true
  setTimeout(() => {
    shakeError.value = false
  }, 300)
}
// 重新輸入時清除錯誤狀態
watch([username, password], () => {
  if (loginError.value) loginError.value = ''
})

// 非帳密錯誤 (網路/伺服器) 走右上角 Toast，3 秒自動消失、可堆疊
const toasts = ref([])
let _toastSeq = 0
function showToast(type, text) {
  const id = ++_toastSeq
  toasts.value.push({ id, type, text })
  setTimeout(() => dismissToast(id), 3000)
}
function dismissToast(id) {
  toasts.value = toasts.value.filter((item) => item.id !== id)
}

// 原 changeLanguage: 記錄語言並重新載入
function changeLanguage(lang) {
  console.log('切換語言到: ' + lang)
  langOpen.value = false
  window.localStorage.setItem('language', lang)
  window.location.reload()
}

function safeChangePage(target, params) {
  changePage(target, { params })
}

// [強化版方案 A] 獲取組織列表，自動選擇字母排序後的第一家公司作為預設 (原 fetchTier2Organizations)
function fetchTier2Organizations(user, callback) {
  console.log('[方案 A] 開始獲取組織列表，User:', user)

  CsRequestGroupSelectAllRecordsByCondition('owner_cid', user, 0, 999, function (ok, result) {
    if (!ok) {
      console.error('[方案 A] API 請求失敗')
      callback(null)
      return
    }
    try {
      let json = JSON.parse(result)
      console.log('[方案 A] 模組 API 回傳:', json)

      let records = json.records || {}
      if (records && records.group_cid && records.group_cid.length > 0) {
        let keyInfo = ['group_name', 'group_cid']
        let companyArray = TablesiToTableii(keyInfo, records)
        let companies = companyArray.map((companyRow, index) => {
          let orgName = String(companyRow[0] || '').trim()
          let orgCid = String(companyRow[1] || '').trim()
          let displayName = orgName !== '' ? orgName : orgCid
          let recordState = '1'
          if (records.record_state && records.record_state[index]) {
            recordState = records.record_state[index]
          }
          return { displayName, cid: orgCid, state: recordState }
        })

        // 過濾掉已刪除、空 CID 以及學校群組
        companies = companies.filter(
          (c) => c.state !== '0' && c.cid !== '' && !c.cid.startsWith('sch_'),
        )

        // 按照字母排序 (與 sidebar 的排序邏輯完全一致)
        companies.sort((a, b) =>
          a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' }),
        )

        if (companies.length > 0) {
          const firstCid = companies[0].cid
          const firstName = companies[0].displayName
          console.log(`[方案 A] 自動選取排序後的第一間公司: ${firstName} (${firstCid})`)

          // 儲存該公司的中文顯示名稱，確保 dashboard 標題正常渲染
          window.sessionStorage.setItem('select_group_name', firstName)
          window.sessionStorage.setItem('company_group_name', firstName)

          callback(firstCid)
          return
        }
      }

      callback(null)
    } catch (e) {
      console.error('[方案 A] 解析或選擇第一家公司失敗:', e)
      callback(null)
    }
  })
}

// 原 SubmitLogin (session 寫入與 tier 分流邏輯逐步保留，
// 互動改為狀態機：loading → success → card fade out → workspace overlay → 跳轉)
function SubmitLogin() {
  if (isBusy.value) return

  const login_username = username.value.trim()
  if (!login_username || !password.value) {
    showLoginError(t('login.error_required'))
    return
  }

  if (rememberMe.value) {
    window.localStorage.setItem('member_cid', login_username)
  } else {
    window.localStorage.removeItem('member_cid')
  }

  loginError.value = ''
  loginState.value = 'loading'

  CsRequestLogin(login_username, password.value, function (ok, result) {
    // 1. 優先檢查 API 連線狀態 → 右上角 Toast，按鈕恢復可點
    if (!ok) {
      loginState.value = 'idle'
      showToast('error', t('login.error_network'))
      return
    }

    try {
      let json_object = JSON.parse(result)

      if (json_object.errno < 0) {
        // 帳密錯誤 → inline error + 密碼欄 shake，按鈕恢復可點
        loginState.value = 'idle'
        showLoginError(t('login.error_credentials'))
        return
      }

      // -----------------------------------------------------------
      // 將後端回傳的重要資訊存入 sessionStorage
      // -----------------------------------------------------------

      // 1. 儲存當前登入的會員帳號
      window.sessionStorage.setItem('member_cid', login_username)

      // 儲存 Session Token 供後端 Filter 校驗
      if (json_object.session_token) {
        window.sessionStorage.setItem('session_token', json_object.session_token)
      } else if (json_object.session_id) {
        window.sessionStorage.setItem('session_token', json_object.session_id)
      } else if (json_object.session_uid) {
        window.sessionStorage.setItem('session_token', json_object.session_uid)
      }

      // 2. 儲存組織 ID
      if (json_object.group_cid) {
        window.sessionStorage.setItem('group_cid', json_object.group_cid)
        window.sessionStorage.setItem('login_group_cid', json_object.group_cid)
      } else if (json_object.group_uid) {
        // 備用：有時候後端欄位名稱可能是 group_uid
        window.sessionStorage.setItem('group_cid', json_object.group_uid)
        window.sessionStorage.setItem('login_group_cid', json_object.group_uid)
      }

      // 3. 儲存產品類型
      if (json_object.product_type) {
        window.sessionStorage.setItem('product_type', json_object.product_type)
      }

      // 4. 儲存擁有的產品清單與預設產品
      let defaultProduct = 'avacast' // 預設防呆
      let rawProds =
        json_object.owned_products ||
        (json_object.records && json_object.records.owned_products)
      if (rawProds) {
        // [終極防護] 攤平巢狀陣列，確保資料格式絕對正確
        let prods = Array.isArray(rawProds) ? rawProds.flat(Infinity) : []
        window.sessionStorage.setItem('owned_products', JSON.stringify(prods))
        if (prods.length > 0) defaultProduct = prods[0]
      }
      if (json_object.default_product) {
        defaultProduct = json_object.default_product
        window.sessionStorage.setItem('default_product', defaultProduct)
      }

      // -----------------------------------------------------------

      // 先設定 select_group_cid，確保 dashboard 讀取正確
      let currentGroupCid = window.sessionStorage.getItem('group_cid')
      window.sessionStorage.setItem('select_group_cid', currentGroupCid)

      // 強化型別判斷，確保數字或字串都能正確識別
      const userTier = String(json_object.tier || json_object.level_uid)
      window.sessionStorage.setItem('tier', userTier)

      // 登入成功：先讓使用者看到「✔ 登入成功」，卡片淡出後才開始跳轉
      loginState.value = 'success'
      setTimeout(() => {
        cardLeaving.value = true
        setTimeout(() => {
          proceedAfterLogin(userTier, login_username, defaultProduct)
        }, 300)
      }, 650)
    } catch (e) {
      // 捕獲所有未預期的錯誤，確保按鈕恢復可操作
      console.error('Login Process Error:', e)
      loginState.value = 'idle'
      showToast('error', t('login.error_unexpected'))
    }
  })
}

// 登入成功動畫結束後的 tier 分流跳轉 (原本內嵌於 SubmitLogin，邏輯不變)
function proceedAfterLogin(userTier, login_username, defaultProduct) {
  if (userTier === '3') {
    safeChangePage('dashboard.html', { product: defaultProduct })
  } else if (userTier === '2') {
    // [強化版方案 A] 攔截跳轉，自動選擇組織
    fetchTier2Organizations(login_username, (selectedCid) => {
      if (selectedCid) {
        window.sessionStorage.setItem('select_group_cid', selectedCid)
        window.sessionStorage.setItem('group_cid', selectedCid)

        // [動態 Navbar 重繪] 取得使用者所選公司的真實產品權限
        CsRequestGroupGetOwnedProducts(selectedCid, function (ok2, result2) {
          if (ok2 && result2) {
            try {
              const resJson = JSON.parse(result2)
              if (Number(resJson.errno) >= 0) {
                let rawProds2 =
                  resJson.owned_products ||
                  (resJson.records && resJson.records.owned_products)
                let prods = Array.isArray(rawProds2) ? rawProds2.flat(Infinity) : []
                window.sessionStorage.setItem('owned_products', JSON.stringify(prods))
                const finalDefaultProduct =
                  resJson.default_product || (prods.length > 0 ? prods[0] : 'avacast')
                window.sessionStorage.setItem('default_product', finalDefaultProduct)
                safeChangePage('dashboard.html', { product: finalDefaultProduct })
                return
              }
            } catch (e) {
              console.error('Parse err', e)
            }
          }
          // [防呆] 發生錯誤時強制覆寫 Session，確保 Navbar 至少有基礎產品
          console.warn('[Login] GetOwnedProducts API failed, using fallback.')
          window.sessionStorage.setItem('owned_products', JSON.stringify(['avacast']))
          window.sessionStorage.setItem('default_product', 'avacast')
          safeChangePage('dashboard.html', { product: 'avacast' })
        })
        return
      }
      // 無論是否有選（點取消則用預設），都進入 dashboard
      safeChangePage('dashboard.html', { product: defaultProduct })
    })
  } else {
    // 預設跳轉，避免卡在登入頁
    safeChangePage('dashboard.html', { product: defaultProduct })
  }
}

// 原 SubmitResetPassword (alert 改為 Toast，按鈕自帶 loading 狀態)
function SubmitResetPassword() {
  if (resetState.value === 'loading') return
  if (!resetUsername.value.trim() || !resetEmail.value.trim()) {
    showToast('warning', t('login.error_reset_required'))
    return
  }

  resetState.value = 'loading'
  CsRequestResetPassword(resetUsername.value, resetEmail.value, function (ok, result) {
    resetState.value = 'idle'

    if (!ok) {
      showToast('error', t('login.error_network'))
      return
    }
    try {
      const json_object = JSON.parse(result)
      if (json_object.errno > 0) {
        showToast('success', localeData.value.login['reset_password_check_emil'])
        page.value = 'login'
      } else {
        showToast('error', localeData.value.login['reset_password_failure'])
      }
    } catch (e) {
      console.error('Reset Password Error:', e)
      showToast('error', t('login.error_unexpected'))
    }
  })
}

function closeLangSelector() {
  langOpen.value = false
}

// 原 login.html <head> 的 Google Fonts Inter：僅登入頁載入，
// 離開時移除，讓其他頁面與 www 一致地退回系統字體渲染
const INTER_FONT_ID = 'login-inter-font'
function mountInterFont() {
  if (document.getElementById(INTER_FONT_ID)) return
  const link = document.createElement('link')
  link.id = INTER_FONT_ID
  link.rel = 'stylesheet'
  link.href =
    'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Noto+Sans+TC:wght@400;500;600;700&display=swap'
  document.head.appendChild(link)
}
function unmountInterFont() {
  document.getElementById(INTER_FONT_ID)?.remove()
}

onMounted(() => {
  mountInterFont()
  // 原 initLoginView: 進入登入頁面時強制清除 SessionStorage，防止殘留狀態
  window.sessionStorage.clear()
  CsRequestLogout()
  VisibleLoaderElement(false)

  // 幫忙填入之前的帳號 (?user= 優先，其次 localStorage)
  const defUser = route.query.user
  const member_cid = defUser != null ? defUser : window.localStorage.getItem('member_cid')
  if (member_cid) {
    username.value = member_cid
    rememberMe.value = true
  }

  document.addEventListener('click', closeLangSelector)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeLangSelector)
  unmountInterFont()
})

  return {
    route,
    page,
    username,
    password,
    rememberMe,
    showPassword,
    langOpen,
    resetUsername,
    resetEmail,
    changeLanguage,
    safeChangePage,
    fetchTier2Organizations,
    SubmitLogin,
    SubmitResetPassword,
    closeLangSelector,
    INTER_FONT_ID,
    mountInterFont,
    unmountInterFont,
    t,
    currentLang,
    // 登入流程狀態
    loginState,
    isBusy,
    cardLeaving,
    loginError,
    shakeError,
    resetState,
    toasts,
    dismissToast,
  }
}
