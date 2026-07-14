import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { localeData, formatLocal } from '@/locales'
import { changePage } from '@/core/navigation'
import { VisibleLoaderElement } from '@/core/loader'
import { CsRequestVerifyResetToken } from '@/api/login'
import {
  MemberData,
  CsRequestMemberSelectOneRecordByMemberCID,
  CsRequestMemberUpdateOneRecordByMemberCID,
} from '@/api/member'

// 原 ResetPasswordView.vue <script setup> 的邏輯，模板繫結經由 useResetPasswordView() 回傳
export function useResetPasswordView() {
// 原 app.view.reset_password.js (Token 驗證 → 取回會員 → 更新密碼流程不變)

const route = useRoute()

const headerTitle = ref('')
const infoVisible = ref(true)
const infoError = ref(false)
const infoText = ref('')
const email = ref('')
const newPassword = ref('')
const repeatPassword = ref('')
const msg = ref('')
const confirmDisabled = ref(true)

let member_data = null

// Helper to get locale string safely (原 t())
function tr(key) {
  const rp = localeData.value && localeData.value.reset_password
  return (rp && rp[key]) || key
}

onMounted(async () => {
  VisibleLoaderElement(false)
  headerTitle.value = tr('header_title')
  infoText.value = tr('parsing_link')

  const user = route.query.user || route.query.member_cid
  const resetToken = route.query.reset_token

  if (resetToken) {
    infoText.value = tr('parsing_link')
    msg.value = tr('verifying')

    try {
      const verifyRes = await new Promise((resolve, reject) => {
        CsRequestVerifyResetToken(resetToken, (ok, res) => {
          if (!ok) reject(new Error('Network error'))
          else resolve(JSON.parse(res))
        })
      })

      const json_user = verifyRes

      if (json_user.errno < 0) {
        // e.g. -1084 Expired
        if (json_user.errno == -1084) {
          alert(tr('link_expired'))
          msg.value = tr('link_expired')
        } else {
          alert(tr('invalid_link'))
          msg.value = tr('invalid_link')
        }
        return
      }

      // 驗證成功，獲取用戶詳細資訊
      const userCid = json_user.member_cid || window.sessionStorage.getItem('member_cid')
      if (!userCid) {
        alert('Error: Could not retrieve user ID.')
        return
      }

      const memberRes = await new Promise((resolve, reject) => {
        CsRequestMemberSelectOneRecordByMemberCID(userCid, (ok, res) => {
          if (!ok) reject(new Error('Network error'))
          else resolve(JSON.parse(res))
        })
      })

      if (memberRes.errno < 0) {
        alert(tr('failed'))
        return
      }

      const record = memberRes.records
      if (!record || !record.member_cid || record.member_cid.length === 0) {
        return
      }

      member_data = Object.assign({}, MemberData)
      Object.keys(record).forEach((key) => {
        if (record[key] && record[key][0] !== undefined) {
          member_data[key] = record[key][0]
        }
      })

      email.value = member_data.email
      confirmDisabled.value = false

      // 更新 Header 標題
      const headerTmpl = tr('header_title_with_user')
      if (headerTmpl && headerTmpl.includes('{{user}}')) {
        headerTitle.value = formatLocal(headerTmpl, { user: member_data.member_cid })
      } else {
        headerTitle.value = tr('header_title') + ' ' + member_data.member_cid
      }

      infoVisible.value = false
      msg.value = tr('verified')
    } catch (e) {
      console.error('Token verification failed:', e)
      msg.value = tr('invalid_link')
      alert(tr('invalid_link'))
    }
  } else {
    infoError.value = true
    infoText.value = tr('invalid_link')
  }
})

async function updatePassword() {
  const pw = newPassword.value.trim()
  const rpw = repeatPassword.value.trim()

  if (pw.length < 8) {
    alert(tr('password_too_short'))
    return
  }
  if (pw !== rpw) {
    alert(tr('password_mismatch'))
    return
  }

  msg.value = tr('updating')
  member_data.password = pw

  try {
    const updateRes = await new Promise((resolve, reject) => {
      CsRequestMemberUpdateOneRecordByMemberCID(member_data, (ok, res) => {
        if (!ok) reject(new Error('Network error'))
        else resolve(JSON.parse(res))
      })
    })

    if (updateRes.errno < 0) {
      alert(tr('failed'))
      return
    }

    msg.value = tr('success_redirect')

    // 根據權限等級決定跳轉頁面
    const currentGroupCid = window.sessionStorage.getItem('group_cid')
    window.sessionStorage.setItem('select_group_cid', currentGroupCid)

    // 統一導向儀表板，由 dashboard 內部判斷使用者權限與顯示 UI
    changePage('dashboard.html')
  } catch (e) {
    console.error('Password update failed:', e)
    alert(tr('failed'))
  }
}

  return {
    route,
    headerTitle,
    infoVisible,
    infoError,
    infoText,
    email,
    newPassword,
    repeatPassword,
    msg,
    confirmDisabled,
    member_data,
    tr,
    updatePassword,
  }
}
