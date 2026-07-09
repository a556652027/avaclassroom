<template>
  <div class="content login-layout">
    <!-- 登入 -->
    <div class="login-wrapper">
      <div class="login-white-box">
        <!-- 登入表單 (原 page01) -->
        <div v-if="page === 'login'" class="page" style="width: 100%">
          <div>
            <img src="/assets/images/empia小-03 1.svg" style="display: block; padding: 20px 0px 10px 0px; margin: 0 auto" />
          </div>
          <div
            role="main"
            class="ui-content"
            style="width: 100%; max-width: 464px; margin: 0 auto; display: flex; flex-direction: column; gap: 10px"
          >
            <!-- Username Field -->
            <div style="display: flex; flex-direction: column">
              <label for="login_username" style="color: #898c94; font-size: 14px; box-sizing: border-box">{{
                t('common.member_cid')
              }}</label>
              <input
                id="login_username"
                v-model="username"
                type="text"
                name="member_cid"
                :placeholder="t('common.member_cid_input')"
                required
                class="login-input"
              />
            </div>

            <!-- Password Field -->
            <div style="display: flex; flex-direction: column; margin-top: 10px">
              <label for="login_password" style="color: #898c94; font-size: 14px">{{ t('common.password') }}</label>
              <div style="position: relative">
                <input
                  id="login_password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  name="password"
                  :placeholder="t('common.password_input')"
                  required
                  class="login-input"
                  @keyup.enter="SubmitLogin"
                />
                <span
                  style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); cursor: pointer; padding-top: 5px"
                  @click="showPassword = !showPassword"
                >
                  <img :src="showPassword ? '/assets/images/passwordeyeopen.svg' : '/assets/images/passwordeyeclose.svg'" alt="" />
                </span>
              </div>
            </div>

            <!-- Remember Me -->
            <div style="display: flex; align-items: center; margin-top: 10px">
              <input id="remember_me" v-model="rememberMe" type="checkbox" />
              <label for="remember_me" style="color: #898c94; font-size: 14px; margin: 0">{{
                t('login.remember_username')
              }}</label>
            </div>

            <!-- Login Button -->
            <div>
              <button type="submit" class="login-button login-submit" @click="SubmitLogin">
                {{ t('login.login_submit') }}
              </button>
            </div>

            <!-- Forgot Password -->
            <div style="text-align: center">
              <button
                class="link_text"
                style="color: #ee963f; margin-top: 15px; background: none; border: none; cursor: pointer; font-size: inherit"
                @click="page = 'reset'"
              >
                {{ t('login.forget_password') }}
              </button>
            </div>
          </div>
        </div>

        <!-- 重設密碼區塊 (原 page02) -->
        <div v-else class="page" style="width: 100%">
          <div>
            <img src="/assets/images/empia小-03 1.svg" style="display: block; padding: 20px 0px 10px 0px; margin: 0 auto" />
          </div>
          <div role="main" class="ui-content" style="height: 400px; margin: 0 auto; width: 100%; max-width: 464px">
            <div style="display: flex; flex-direction: column">
              <label style="color: #898c94; font-size: 14px">{{ t('common.member_cid') }}</label>
              <input
                v-model="resetUsername"
                type="text"
                :placeholder="t('common.member_cid')"
                required
                class="login-input"
              />
            </div>
            <div style="display: flex; flex-direction: column">
              <label style="color: #898c94; font-size: 14px; margin-top: 10px">{{ t('common.email') }}</label>
              <input v-model="resetEmail" type="text" :placeholder="t('common.email')" required class="login-input" />
            </div>
            <button type="submit" class="login-button login-submit" style="margin-top: 25px" @click="SubmitResetPassword">
              {{ t('common.send') }}
            </button>
            <button type="button" class="login-cancel" @click="page = 'login'">
              {{ t('common.cancel') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 語言切換 -->
      <div style="cursor: pointer; display: flex; position: relative; margin-top: 15px">
        <img src="/assets/images/Default.svg" alt="" @click.stop="langOpen = !langOpen" />
        <div
          v-if="langOpen"
          style="
            position: absolute;
            left: 60px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            min-width: 120px;
          "
        >
          <button class="lang-option" style="margin-bottom: 4px" @click="changeLanguage('zh-tw')">繁體中文</button>
          <button class="lang-option" @click="changeLanguage('en-us')">English</button>
        </div>
      </div>
    </div>

    <div class="login-brand">
      <p>
        License <br />
        Management <br />
        System
      </p>
      <img src="/assets/images/Group.svg" alt="" />
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { t, localeData } from '@/locales'
import { changePage } from '@/core/navigation'
import { VisibleLoaderElement } from '@/core/loader'
import { TablesiToTableii } from '@/core/util'
import { CsRequestLogin, CsRequestLogout, CsRequestResetPassword } from '@/api/login'
import {
  CsRequestGroupSelectAllRecordsByCondition,
  CsRequestGroupGetOwnedProducts,
} from '@/api/organization'

const route = useRoute()
const page = ref('login')
const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const langOpen = ref(false)
const resetUsername = ref('')
const resetEmail = ref('')

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
      VisibleLoaderElement(false)
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
      VisibleLoaderElement(false)
      callback(null)
    }
  })
}

// 原 SubmitLogin (流程逐步保留)
function SubmitLogin() {
  const login_username = username.value

  if (rememberMe.value) {
    window.localStorage.setItem('member_cid', login_username)
  } else {
    window.localStorage.removeItem('member_cid')
  }

  // 開啟loading dialog
  VisibleLoaderElement(true)

  CsRequestLogin(login_username, password.value, function (ok, result) {
    // 1. 優先檢查 API 連線狀態
    if (!ok) {
      VisibleLoaderElement(false)
      alert('無法連接伺服器，請檢查網路連線。')
      return
    }

    try {
      let json_object = JSON.parse(result)

      if (json_object.errno < 0) {
        VisibleLoaderElement(false)
        alert('帳號密碼錯誤!')
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

      if (userTier === '3') {
        VisibleLoaderElement(false)
        safeChangePage('dashboard.html', { product: defaultProduct })
      } else if (userTier === '2') {
        // [強化版方案 A] 攔截跳轉，自動選擇組織
        fetchTier2Organizations(login_username, (selectedCid) => {
          if (selectedCid) {
            window.sessionStorage.setItem('select_group_cid', selectedCid)
            window.sessionStorage.setItem('group_cid', selectedCid)

            // [動態 Navbar 重繪] 取得使用者所選公司的真實產品權限
            CsRequestGroupGetOwnedProducts(selectedCid, function (ok2, result2) {
              VisibleLoaderElement(false)
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
          VisibleLoaderElement(false)
          safeChangePage('dashboard.html', { product: defaultProduct })
        })
      } else {
        // 預設跳轉，避免卡在登入頁
        VisibleLoaderElement(false)
        safeChangePage('dashboard.html', { product: defaultProduct })
      }
    } catch (e) {
      // 捕獲所有未預期的錯誤，確保 Loader 關閉
      console.error('Login Process Error:', e)
      VisibleLoaderElement(false)
      alert('登入過程中發生錯誤，請稍後再試。')
    }
  })
}

// 原 SubmitResetPassword
function SubmitResetPassword() {
  VisibleLoaderElement(true)

  setTimeout(function () {
    CsRequestResetPassword(resetUsername.value, resetEmail.value, function (ok, result) {
      const json_object = JSON.parse(result)
      VisibleLoaderElement(false)

      if (json_object.errno > 0) {
        alert(localeData.value.login['reset_password_check_emil'])
      } else {
        alert(localeData.value.login['reset_password_failure'])
      }

      page.value = 'login'
    })
  }, 500)
}

function closeLangSelector() {
  langOpen.value = false
}

onMounted(() => {
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

onBeforeUnmount(() => document.removeEventListener('click', closeLangSelector))
</script>

<style>
/* 原 login.html 的頁面樣式 */
#login_username::placeholder,
#login_password::placeholder {
  color: #d1d5db !important;
}
#remember_me {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  border-radius: 0.125rem;
  appearance: none;
  border: 1px solid #d9dde3;
  cursor: pointer;
}
#remember_me:checked {
  background-color: #ee963f;
}
#login_username:focus,
#login_password:focus {
  outline: none;
}
#login_username,
#login_password {
  color: #333 !important;
}
#login_username:-webkit-autofill,
#login_password:-webkit-autofill {
  -webkit-text-fill-color: #333 !important;
  -webkit-box-shadow: 0 0 0px 1000px white inset !important;
}
.login-button:hover {
  background-color: #ee963f !important;
  transition: background-color 0.2s ease;
}
.login-button {
  transition: background-color 0.2s ease;
}
.login-layout {
  background-color: #f1f4f8;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5rem;
  min-height: 100vh;
  width: 100%;
}
.login-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
}
.login-white-box {
  background-color: white;
  width: 100%;
  border-radius: 24px;
  display: flex;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}
.login-brand {
  margin-bottom: 5rem;
}
.login-brand p {
  font-size: 50px;
  font-weight: bold;
  line-height: 1.2;
  color: #214f7c;
}
.login-input {
  font-size: 14px;
  width: 100%;
  border-radius: 23px;
  padding: 14px;
  border: 1px solid #d9dde3;
  margin-top: 5px;
  box-sizing: border-box;
}
.login-submit {
  width: 100%;
  background-color: #214f7c;
  color: white;
  padding: 0.5rem 0;
  border-radius: 23px;
  height: 48px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  margin-top: 15px;
}
.login-cancel {
  width: 100%;
  background-color: #ffffff;
  color: #898c94;
  padding: 0.5rem 0;
  border-radius: 23px;
  height: 48px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid #d9dde3;
  margin-top: 10px;
}
.lang-option {
  display: block;
  width: 100%;
  padding: 8px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
}
@media (max-width: 850px) {
  .login-layout {
    flex-direction: column-reverse;
    gap: 2rem;
    padding: 2rem 1rem;
  }
  .login-brand {
    margin-bottom: 0;
    text-align: center;
  }
  .login-brand p {
    font-size: 36px !important;
  }
  .login-brand img {
    max-width: 80%;
    height: auto;
  }
}
</style>
