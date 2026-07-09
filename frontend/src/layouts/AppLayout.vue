<template>
  <div class="app-shell">
    <AppNavbar />
    <div class="app-shell-body">
      <AppSidebar />
      <div class="app-shell-main">
        <SecondaryNav />
        <div class="content">
          <slot />
        </div>
      </div>
    </div>

    <ProfileModal />
    <OrganizationAddModal />
    <OrganizationEditModal />
  </div>
</template>

<script setup>
import AppNavbar from '@/components/AppNavbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import SecondaryNav from '@/components/SecondaryNav.vue'
import ProfileModal from '@/components/ProfileModal.vue'
import OrganizationAddModal from '@/components/OrganizationAddModal.vue'
import OrganizationEditModal from '@/components/OrganizationEditModal.vue'
</script>

<style>
/* 原 dashboard.html 等頁的外框結構: navbar 60px + 左側欄 + 內容 */
.app-shell {
  display: flex;
  flex-direction: column;
}
.app-shell-body {
  display: flex;
  height: calc(100vh - 60px);
}
.app-shell-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
</style>
