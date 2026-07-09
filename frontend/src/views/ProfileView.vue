<template>
  <AppLayout>
    <div class="page">
      <div class="page-caption" style="margin-bottom: 1rem">
        <h1>{{ t('sidebarnav.profile') }}</h1>
      </div>

      <div style="background: #fff; border: 1px solid #e5e8ea; border-radius: 12px; padding: 1.5rem; max-width: 860px">
        <div style="display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); gap: 1rem">
          <div>
            <label>{{ t('common.member_cid') || '會員編號' }}</label>
            <input v-model="profileForm.member_cid" class="org-input" disabled />
          </div>
          <div>
            <label>{{ t('common.member_name') || '姓名' }}</label>
            <input v-model="profileForm.member_name" class="org-input" />
          </div>
          <div>
            <label>{{ t('common.password') || '密碼' }}</label>
            <input v-model="profileForm.password" type="password" class="org-input" />
          </div>
          <div>
            <label>{{ t('common.new_password') || '新密碼' }}</label>
            <input v-model="newPassword" type="password" class="org-input" />
          </div>
          <div>
            <label>{{ t('common.confirm_password') || '確認密碼' }}</label>
            <input v-model="confirmPassword" type="password" class="org-input" />
          </div>
          <div>
            <label>{{ t('common.gender') || '性別' }}</label>
            <input v-model="profileForm.gender" class="org-input" />
          </div>
          <div>
            <label>{{ t('common.email') || 'Email' }}</label>
            <input v-model="profileForm.email" class="org-input" />
          </div>
          <div>
            <label>{{ t('common.phone_cell') || '手機' }}</label>
            <input v-model="profileForm.phone_cell" class="org-input" />
          </div>
          <div>
            <label>{{ t('common.country') || '國家' }}</label>
            <input v-model="profileForm.country" class="org-input" />
          </div>
          <div>
            <label>{{ t('common.city') || '城市' }}</label>
            <input v-model="profileForm.city" class="org-input" />
          </div>
          <div style="grid-column: 1 / -1">
            <label>{{ t('common.address') || '地址' }}</label>
            <input v-model="profileForm.address" class="org-input" />
          </div>
          <div style="grid-column: 1 / -1">
            <label>{{ t('common.note00') || '備註' }}</label>
            <textarea v-model="profileForm.note00" class="org-input" style="height: 90px; resize: vertical"></textarea>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 1.25rem">
          <button type="button" class="image_button_default" style="background: #214f7c; color: #fff" @click="saveProfile">
            {{ t('common.save') || '儲存' }}
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { t } from '@/locales'
import { VisibleLoaderElement } from '@/core/loader'
import { apiCall } from '@/core/util'
import Client from '@/core/net'
import { ProfileData, CsRequestProfileSelectOne, CsRequestProfileUpdateOne } from '@/api/profile'

const profileForm = reactive({ ...ProfileData })
const newPassword = ref('')
const confirmPassword = ref('')

function resetForm() {
  Object.assign(profileForm, { ...ProfileData })
}

async function loadProfile() {
  resetForm()
  VisibleLoaderElement(true)
  try {
    const result = await apiCall(CsRequestProfileSelectOne, Client.getUsername())
    const record = result.records || {}
    const first = (key) => (record[key] ? record[key][0] || '' : '')
    Object.assign(profileForm, {
      member_cid: first('member_cid'),
      password: first('password'),
      member_name: first('member_name'),
      tier: first('tier'),
      record_state: first('record_state') || '1',
      group_name: first('group_name'),
      phone_cell: first('phone_cell'),
      phone_home: first('phone_home'),
      phone_work: first('phone_work'),
      email: first('email'),
      address: first('address'),
      city: first('city'),
      country: first('country'),
      gender: first('gender'),
      birthday: first('birthday') ? first('birthday').split(' ')[0] : '',
      note00: first('note00'),
      avatar_url: first('avatar_url'),
    })
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

async function saveProfile() {
  if (newPassword.value && newPassword.value !== confirmPassword.value) {
    alert('新密碼與確認密碼不符')
    return
  }

  const payload = { ...profileForm }
  if (newPassword.value) payload.password = newPassword.value

  VisibleLoaderElement(true)
  try {
    await apiCall(CsRequestProfileUpdateOne, payload)
    alert('更新成功')
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

onMounted(() => {
  loadProfile()
})
</script>
