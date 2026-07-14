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
  INTER_FONT_ID,
  mountInterFont,
  unmountInterFont,
  t,
} = useLoginView()
</script>

<style src="./LoginView.css"></style>
