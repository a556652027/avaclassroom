<template>
  <div class="content login-layout">
    <!-- 登入 -->
    <div class="login-wrapper">
      <div class="login-white-box" :class="{ 'card-leaving': cardLeaving }">
        <!-- 登入表單 (原 page01) -->
        <div v-if="page === 'login'" class="page">
          <img src="/assets/images/empia小-03 1.svg" class="login-logo" alt="EMPIA" />
          <div class="login-welcome">
            <h2>{{ t('login.welcome_back') }}</h2>
            <p>{{ t('login.sign_in_continue') }}</p>
          </div>
          <div role="main" class="ui-content login-form">
            <!-- Username Field -->
            <div class="login-field">
              <label for="login_username">{{ t('common.member_cid') }}</label>
              <div class="login-input-wrap">
                <svg
                  class="input-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="login_username"
                  v-model="username"
                  type="text"
                  name="member_cid"
                  :placeholder="t('common.member_cid_input')"
                  required
                  class="login-input"
                  :disabled="isBusy"
                  @keyup.enter="SubmitLogin"
                />
              </div>
            </div>

            <!-- Password Field -->
            <div class="login-field">
              <label for="login_password">{{ t('common.password') }}</label>
              <div class="login-input-wrap" :class="{ 'has-error': !!loginError, 'is-shaking': shakeError }">
                <svg
                  class="input-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="login_password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  name="password"
                  :placeholder="t('common.password_input')"
                  required
                  class="login-input"
                  :disabled="isBusy"
                  :aria-invalid="!!loginError"
                  :aria-describedby="loginError ? 'login_error' : undefined"
                  @keyup.enter="SubmitLogin"
                />
                <span class="password-toggle" @click="showPassword = !showPassword">
                  <img :src="showPassword ? '/assets/images/passwordeyeopen.svg' : '/assets/images/passwordeyeclose.svg'" alt="" />
                </span>
              </div>
              <!-- Inline Error (固定高度插槽，出現時不推擠版面) -->
              <div class="field-error-slot" aria-live="assertive">
                <Transition name="error-fade">
                  <p v-if="loginError" id="login_error" class="field-error" role="alert">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m15 9-6 6M9 9l6 6" />
                    </svg>
                    {{ loginError }}
                  </p>
                </Transition>
              </div>
            </div>

            <!-- Remember Me / Forgot Password -->
            <div class="login-options-row">
              <div class="remember-me">
                <input id="remember_me" v-model="rememberMe" type="checkbox" :disabled="isBusy" />
                <label for="remember_me">{{ t('login.remember_username') }}</label>
              </div>
              <button type="button" class="forgot-link" :disabled="isBusy" @click="page = 'reset'">
                <span class="forgot-link-text is-default">{{ t('login.forget_password') }}</span>
                <span class="forgot-link-text is-hover">{{ t('login.forget_password_hover') }}</span>
              </button>
            </div>

            <!-- Login Button: idle → loading (spinner) → success (✔) -->
            <button
              type="submit"
              class="login-submit"
              :class="{ 'is-loading': loginState === 'loading', 'is-success': loginState === 'success' }"
              :disabled="isBusy"
              @click="SubmitLogin"
            >
              <Transition name="btn-swap" mode="out-in">
                <span v-if="loginState === 'loading'" key="loading" class="btn-inner">
                  <span class="btn-spinner" aria-hidden="true"></span>
                  {{ t('login.signing_in') }}
                </span>
                <span v-else-if="loginState === 'success'" key="success" class="btn-inner">
                  <svg
                    class="btn-check"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {{ t('login.login_success') }}
                </span>
                <span v-else key="idle" class="btn-inner">{{ t('login.login_submit') }}</span>
              </Transition>
            </button>
          </div>
        </div>

        <!-- 重設密碼區塊 (原 page02) -->
        <div v-else class="page">
          <img src="/assets/images/empia小-03 1.svg" class="login-logo" alt="EMPIA" />
          <div class="login-welcome">
            <h2>{{ t('login.reset_title') }}</h2>
            <p>{{ t('login.reset_subtitle') }}</p>
          </div>
          <div role="main" class="ui-content login-form">
            <div class="login-field">
              <label for="reset_username">{{ t('common.member_cid') }}</label>
              <div class="login-input-wrap">
                <svg
                  class="input-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="reset_username"
                  v-model="resetUsername"
                  type="text"
                  :placeholder="t('common.member_cid')"
                  required
                  class="login-input"
                  :disabled="resetState === 'loading'"
                />
              </div>
            </div>
            <div class="login-field">
              <label for="reset_email">{{ t('common.email') }}</label>
              <div class="login-input-wrap">
                <svg
                  class="input-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 6L2 7" />
                </svg>
                <input
                  id="reset_email"
                  v-model="resetEmail"
                  type="text"
                  :placeholder="t('common.email')"
                  required
                  class="login-input"
                  :disabled="resetState === 'loading'"
                  @keyup.enter="SubmitResetPassword"
                />
              </div>
            </div>
            <button
              type="submit"
              class="login-submit"
              :class="{ 'is-loading': resetState === 'loading' }"
              :disabled="resetState === 'loading'"
              style="margin-top: 15px"
              @click="SubmitResetPassword"
            >
              <Transition name="btn-swap" mode="out-in">
                <span v-if="resetState === 'loading'" key="loading" class="btn-inner">
                  <span class="btn-spinner" aria-hidden="true"></span>
                  {{ t('login.sending') }}
                </span>
                <span v-else key="idle" class="btn-inner">{{ t('common.send') }}</span>
              </Transition>
            </button>
            <button type="button" class="login-cancel" :disabled="resetState === 'loading'" @click="page = 'login'">
              {{ t('common.cancel') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 語言切換 -->
      <div class="lang-switch-wrap">
        <button type="button" class="lang-switcher" @click.stop="langOpen = !langOpen">
          <span aria-hidden="true">🌐</span>
          <span>{{ currentLang === 'zh-tw' ? '繁體中文' : 'English' }}</span>
          <span class="lang-caret" :class="{ open: langOpen }">▾</span>
        </button>
        <div v-if="langOpen" class="lang-menu">
          <button class="lang-option" @click="changeLanguage('zh-tw')">繁體中文</button>
          <button class="lang-option" @click="changeLanguage('en-us')">English</button>
        </div>
      </div>
    </div>

    <div class="login-brand">
      <p class="brand-title">
        License <br />
        Management <br />
        System
      </p>
      <p class="brand-subtitle">Secure Licensing Platform</p>
      <p class="brand-desc">Manage licenses securely and efficiently.</p>
      <img src="/assets/images/Group.svg" class="brand-illustration" alt="" />
    </div>

    <!-- 右上角 Toast (非帳密錯誤：網路/伺服器)，可堆疊、3 秒自動消失 -->
    <div class="toast-region" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="'toast-' + toast.type"
          role="status"
          @click="dismissToast(toast.id)"
        >
          <svg
            v-if="toast.type === 'success'"
            class="toast-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m8.5 12.5 2.5 2.5 4.5-5" />
          </svg>
          <svg
            v-else-if="toast.type === 'warning'"
            class="toast-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 3 2.5 20h19L12 3Z" />
            <path d="M12 9v5" />
            <path d="M12 17.5h.01" />
          </svg>
          <svg
            v-else
            class="toast-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6M9 9l6 6" />
          </svg>
          <span>{{ toast.text }}</span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
// 邏輯抽離至 LoginView.js，此處僅保留模板繫結
import { useLoginView } from './LoginView.js'

const {
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
  t,
  currentLang,
  loginState,
  isBusy,
  cardLeaving,
  loginError,
  shakeError,
  resetState,
  toasts,
  dismissToast,
} = useLoginView()
</script>

<style src="./LoginView.css"></style>
