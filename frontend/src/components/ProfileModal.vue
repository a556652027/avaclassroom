<template>
  <div v-if="visible" class="modal profile-edit-modal" style="display: flex">
    <div class="modal-content">
      <div style="display: flex; justify-content: space-between; padding: 1rem 2rem 0rem 2rem">
        <div style="display: flex; gap: 1rem; align-items: center">
          <img src="/assets/images/account_icon.svg" alt="" style="width: 24px; height: 24px" />
          <div class="modal-header">
            <h2>{{ t('profile.title_update_profile') }}</h2>
          </div>
        </div>
        <span class="close" @click="hide">&times;</span>
      </div>

      <div class="modal-body">
        <div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 20px">
          <!-- 用戶名稱 -->
          <div style="grid-column: span 3">
            <label class="pf-label">{{ t('member.member_cid') }}</label>
            <input
              v-model="form.member_cid"
              type="text"
              :placeholder="t('member.member_cid') + '...'"
              disabled
              class="pf-input"
              style="background-color: #f9fafb"
            />
          </div>

          <!-- 電子郵件 -->
          <div style="grid-column: span 3">
            <label class="pf-label">{{ t('member.email') }}</label>
            <input v-model="form.email" type="email" :placeholder="t('member.email') + '...'" class="pf-input" />
          </div>

          <!-- 姓名 -->
          <div style="grid-column: span 3">
            <label class="pf-label">{{ t('member.member_name') }}</label>
            <input v-model="form.member_name" type="text" :placeholder="t('member.member_name') + '...'" class="pf-input" />
          </div>

          <div style="grid-column: span 3"></div>

          <!-- 原密碼 -->
          <div style="grid-column: span 3; position: relative">
            <label class="pf-label">{{ t('member.password') }}</label>
            <input
              v-model="form.password"
              :type="showOld ? 'text' : 'password'"
              :placeholder="t('member.password') + '...'"
              class="pf-input"
              style="padding-right: 40px"
            />
            <span class="pf-eye" @click="showOld = !showOld">
              <img :src="eyeIcon(showOld)" alt="" />
            </span>
          </div>

          <div style="grid-column: span 3"></div>

          <div style="grid-column: span 6">
            <span style="color: rgba(0, 0, 0, 1); font-size: 18px; font-weight: 500">{{
              t('profile.change_password')
            }}</span>
          </div>

          <!-- 新密碼 -->
          <div style="grid-column: span 3; position: relative">
            <label class="pf-label">{{ t('member.new_password') }}</label>
            <input
              v-model="newPassword"
              :type="showNew ? 'text' : 'password'"
              :placeholder="t('member.new_password_hint')"
              class="pf-input"
              style="padding-right: 40px"
            />
            <span class="pf-eye" @click="showNew = !showNew">
              <img :src="eyeIcon(showNew)" alt="" />
            </span>
          </div>

          <!-- 確認新密碼 -->
          <div style="grid-column: span 3; position: relative">
            <label class="pf-label">{{ t('member.new_password_comfirm') }}</label>
            <input
              v-model="confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              :placeholder="t('member.new_password_comfirm_hint')"
              class="pf-input"
              style="padding-right: 40px"
            />
            <span class="pf-eye" @click="showConfirm = !showConfirm">
              <img :src="eyeIcon(showConfirm)" alt="" />
            </span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="modal-cancel-btn" type="button" style="padding: 4px 61px" @click="hide">
          {{ t('common.cancel') }}
        </button>
        <button
          class="modal-ok-btn"
          type="submit"
          style="padding: 4px 61px; cursor: pointer"
          @click="save"
        >
          {{ t('common.save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, reactive, ref } from 'vue'
import { t, getLocalData } from '@/locales'
import { emitter } from '@/core/emitter'
import { apiCall } from '@/core/util'
import { VisibleLoaderElement } from '@/core/loader'
import Client from '@/core/net'
import {
  ProfileData,
  CsRequestProfileSelectOne,
  CsRequestProfileUpdateOne,
} from '@/api/profile'

const visible = ref(false)
const showOld = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')

// 表單欄位 (含原本以 hidden input 保留的欄位，更新時原樣回傳)
const form = reactive({ ...ProfileData })

const eyeIcon = (open) =>
  open ? '/assets/images/passwordeyeopen.svg' : '/assets/images/passwordeyeclose.svg'

// 原 SelectProfileOne: 先取回資料填入完畢後才顯示 Modal，防止畫面閃爍
async function show() {
  const profile_cid = Client.getUsername()
  VisibleLoaderElement(true)
  try {
    const json_object = await apiCall(CsRequestProfileSelectOne, profile_cid)
    const record = json_object.records
    const first = (key) => (record[key] ? record[key][0] || '' : '')

    form.member_cid = first('member_cid')
    form.password = first('password')
    form.member_name = first('member_name')
    form.gender = first('gender')
    form.record_state = first('record_state')
    form.birthday = String(first('birthday')).split(' ')[0]
    form.phone_cell = first('phone_cell')
    form.phone_home = first('phone_home')
    form.phone_work = first('phone_work')
    form.email = first('email')
    form.country = first('country')
    form.city = first('city')
    form.address = first('address')
    form.note00 = first('note00')

    newPassword.value = ''
    confirmPassword.value = ''
    visible.value = true
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

function hide() {
  visible.value = false
}

// 原 UpdateProfileOne
async function save() {
  // 處理密碼更新邏輯
  if (newPassword.value && newPassword.value !== confirmPassword.value) {
    alert('新密碼與確認密碼不符')
    return
  }
  const profile_data = { ...form }
  if (newPassword.value && newPassword.value === confirmPassword.value) {
    profile_data.password = newPassword.value
  }

  VisibleLoaderElement(true)
  try {
    await apiCall(CsRequestProfileUpdateOne, profile_data)
    alert(getLocalData('common.success'))
    hide()
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

const off = emitter.on('profile-modal:show', show)
onBeforeUnmount(off)
</script>

<style>
/* 原 app.component.profile.modal.html 的 <style> */
.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  align-items: center;
  display: flex;
  justify-content: center;
}
.modal-content {
  background-color: #fefefe;
  margin: 0;
  border-radius: 10px;
  width: 80%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
.modal-header {
  background-color: #ffffff;
  border-radius: 10px 10px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}
.close {
  color: #aaa;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  line-height: 1;
}
.close:hover,
.close:focus {
  color: #000;
}
.modal-body {
  padding: 1rem 2rem;
}
.modal-footer {
  padding-right: 2rem;
  padding-bottom: 1rem;
  border-radius: 0 0 10px 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.modal-cancel-btn {
  background-color: #ffffff;
  border: 1px solid #e5e8ea;
  padding: 4px 61px;
  border-radius: 10px;
  cursor: pointer;
  height: 48px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
.modal-cancel-btn:hover {
  background-color: #f5f5f5 !important;
  color: #333 !important;
}
.modal-ok-btn {
  background-color: #214f7c !important;
  border-radius: 10px;
  border: none;
  color: #ffffff;
  height: 48px;
  transition: background-color 0.2s ease;
}
.modal-ok-btn:hover {
  background-color: #ee963f !important;
}
/* 表單欄位共用樣式 (原 inline style 抽出) */
.pf-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #898c94;
  margin-bottom: 8px;
}
.pf-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e5e8ea;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  height: 38px;
  color: #000;
  outline: none;
}
.pf-eye {
  position: absolute;
  right: 15px;
  top: 55%;
  transform: translateY(-10%);
  cursor: pointer;
}
</style>
