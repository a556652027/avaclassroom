<template>
  <div class="reset-password-page">
    <div class="container">
      <!-- Left section -->
      <div class="left">
        <img src="/assets/images/website.png" class="avalogo" alt="AVA Logo" />
        <h2>AVA LMS</h2>
        <img src="/assets/images/Group.svg" class="illustration" alt="Illustration" />
      </div>

      <!-- Right section -->
      <div class="right">
        <h2>{{ headerTitle }}</h2>

        <div v-if="infoVisible" class="info">
          <span v-if="infoError" class="error">{{ infoText }}</span>
          <template v-else>{{ infoText }}</template>
        </div>

        <p class="subtext">{{ tr('subtext') }}</p>

        <label>{{ tr('label_email') }}</label>
        <div class="email-display">{{ email || tr('loading') }}</div>

        <label for="new-password">{{ tr('label_new_password') }}</label>
        <input
          id="new-password"
          v-model="newPassword"
          type="password"
          :placeholder="tr('placeholder_new_password')"
        />

        <label for="repeat-password">{{ tr('label_repeat_password') }}</label>
        <input
          id="repeat-password"
          v-model="repeatPassword"
          type="password"
          :placeholder="tr('placeholder_repeat_password')"
        />

        <button :disabled="confirmDisabled" @click="updatePassword">{{ tr('btn_update') }}</button>
        <div class="msg">{{ msg }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 原 app.view.reset_password.js (Token 驗證 → 取回會員 → 更新密碼流程不變)
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
</script>

<style scoped>
/* 原 reset_password.html 的頁面樣式 (scoped 避免污染其他頁) */
.reset-password-page {
  margin: 0;
  font-family: 'Segoe UI', Arial, sans-serif;
  background-color: #f5f7fa;
  color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.container {
  display: flex;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 960px;
  width: 100%;
}
.left {
  background-color: #f5f7fa;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
}
.left img.avalogo {
  height: 48px;
  margin-bottom: 24px;
}
.left img.illustration {
  max-width: 80%;
  margin-top: 24px;
}
.right {
  flex: 1;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
h2 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #333;
}
.info {
  background: #f8f9fa;
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 14px;
  text-align: left;
  margin-bottom: 20px;
  color: #444;
  word-break: break-word;
}
p.subtext {
  font-size: 13px;
  color: #777;
  margin-bottom: 32px;
}
label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
}
input {
  width: 100%;
  padding: 12px 14px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 20px;
  outline: none;
  transition: border-color 0.2s ease;
}
input:focus {
  border-color: #1e64d6;
}
button {
  background: linear-gradient(90deg, #1e64d6, #2563eb);
  border: none;
  color: #fff;
  font-weight: 600;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: background 0.3s ease;
}
button:hover {
  background: linear-gradient(90deg, #2563eb, #1e64d6);
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.msg {
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}
.email-display {
  margin-bottom: 20px;
  font-size: 15px;
  color: #444;
  background: #f9fafc;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #ddd;
}
.error {
  color: red;
}
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    max-width: 420px;
  }
  .left {
    display: none;
  }
  .right {
    padding: 40px 30px;
  }
}
</style>
