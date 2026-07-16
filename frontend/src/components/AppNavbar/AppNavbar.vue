<template>
  <nav class="custom-topnav">
    <div class="topnav-logo-container">
      <button class="mobile-hamburger-btn" @click.prevent.stop="toggleMobileSidebar">
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <!-- 白底導覽列改用深色版 logo (原白色 logo 在白底上不可見) -->
      <img src="/assets/images/logo-dark.svg" alt="" class="topnav-logo-desktop" />
      <img src="/assets/images/logo-mark-dark.svg" alt="" class="topnav-logo-mobile" />
    </div>
    <div class="topnav-content">
      <ul class="topnav-menu" style="opacity: 1">
        <li v-for="p in sortedProducts" :key="p">
          <a
            href="#"
            class="topnav-link"
            :class="{ active: p === activeProduct }"
            @click.prevent="onProductClick(p)"
            >{{ productName(p) }}</a
          >
        </li>
      </ul>
    </div>
    <!-- 使用者選單 -->
    <div class="topnav-user-menu" @click="userMenuOpen = !userMenuOpen">
      <div class="topnav-user-avatar topnav-login">
        <img src="/assets/images/Group 1043.svg" alt="" />
      </div>
      <div
        class="custom-topnav-usermenu-dropdown topnav-login-section"
        :class="{ show: userMenuOpen }"
      >
        <div class="topnav-user-info">
          <img src="/assets/images/帳戶.svg" alt="" class="topnav-user-avatar-small" />
          <p>{{ memberCid }}</p>
        </div>
        <a href="#" class="topnav-dropdown-item account-settings" @click.prevent="openProfile">{{
          t('sidebarnav.sub_system_profile')
        }}</a>
        <a
          v-if="isAdminTier"
          href="#"
          class="topnav-dropdown-item admin-tools"
          @click.prevent="goAdminTools"
          >{{ t('sidebarnav.admin_tools') }}</a
        >
        <a href="#" class="topnav-dropdown-item logout" @click.prevent="doLogout">{{
          t('sidebarnav.sub_system_logout')
        }}</a>
      </div>
    </div>
  </nav>
</template>

<script setup>
// 邏輯抽離至 AppNavbar.js，此處僅保留模板繫結
import { useAppNavbar } from './AppNavbar.js'

const {
  userMenuOpen,
  memberCid,
  userTier,
  isAdminTier,
  activeProduct,
  sortedProducts,
  productName,
  onProductClick,
  gotoProductDashboard,
  openProfile,
  goAdminTools,
  doLogout,
  toggleMobileSidebar,
  onDocumentClick,
  t,
} = useAppNavbar()
</script>

<style src="./AppNavbar.css"></style>
