<template>
  <!-- AVA Classroom 專用導覽列 (原 components/avaclassroom-nav/avaclassroom.js) -->
  <nav v-if="product === 'avaclassroom'" class="frame-nav">
    <div style="display: flex">
      <div class="nav-item" :class="{ active: activeId === 'dashboard' }" @click="go('dashboard')">
        <div class="nav-icon dashboard-icon" id="dashboard"></div>
        <span class="nav-text">{{ t('sidebarnav.dashboard') }}</span>
      </div>
      <div class="nav-item nav-item-second" :class="{ active: activeId === 'list' }" @click="go('list')">
        <div class="nav-icon list-icon" id="list"></div>
        <span class="nav-text">{{ t('license.title_list_license') }}</span>
      </div>
    </div>
    <div
      v-if="userTier !== '3'"
      class="nav-item nav-item-third"
      :class="{ active: activeId === 'management' }"
      @click="go('management')"
    >
      <div class="nav-icon management-icon" id="management"></div>
      <span class="nav-text">{{ t('sidebarnav.management') }}</span>
    </div>
  </nav>

  <!-- 標準導覽列 (原 components/app.component.frame.nav.js) -->
  <nav v-else class="frame-nav">
    <div style="display: flex">
      <div class="nav-item" :class="{ active: activeId === 'dashboard' }" @click="go('dashboard')">
        <div class="nav-icon dashboard-icon" id="dashboard"></div>
        <span class="nav-text">{{ t('sidebarnav.dashboard') }}</span>
      </div>
      <div class="nav-item nav-item-second" :class="{ active: activeId === 'license' }" @click="go('license')">
        <div class="nav-icon list-icon" id="license"></div>
        <span class="nav-text">{{ t('sidebarnav.license') }}</span>
      </div>
      <div class="nav-item nav-item-third" :class="{ active: activeId === 'device' }" @click="go('device')">
        <div class="nav-icon license-icon" id="device"></div>
        <span class="nav-text">{{ t('sidebarnav.device') }}</span>
      </div>
    </div>
    <div
      v-if="userTier !== '3'"
      class="nav-item nav-item-fourth"
      :class="{ active: activeId === 'management' }"
      @click="go('management')"
    >
      <div class="nav-icon management-icon" id="management"></div>
      <span class="nav-text">{{ t('sidebarnav.management') }}</span>
    </div>
  </nav>
</template>

<script setup>
// 邏輯抽離至 SecondaryNav.js，此處僅保留模板繫結
import { useSecondaryNav } from './SecondaryNav.js'

const {
  route,
  product,
  userTier,
  activeId,
  go,
  t,
} = useSecondaryNav()
</script>

<style src="./SecondaryNav.css"></style>
