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
// 邏輯抽離至 ProfileModal.js，此處僅保留模板繫結
import { useProfileModal } from './ProfileModal.js'

const {
  visible,
  showOld,
  showNew,
  showConfirm,
  newPassword,
  confirmPassword,
  form,
  eyeIcon,
  show,
  hide,
  save,
  off,
  t,
} = useProfileModal()
</script>

<style src="./ProfileModal.css"></style>
