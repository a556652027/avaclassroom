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
// 邏輯抽離至 ResetPasswordView.js，此處僅保留模板繫結
import { useResetPasswordView } from './ResetPasswordView.js'

const {
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
} = useResetPasswordView()
</script>

<style scoped src="./ResetPasswordView.css"></style>
