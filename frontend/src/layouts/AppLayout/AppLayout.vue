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
import AppNavbar from '@/components/AppNavbar/AppNavbar.vue'
import AppSidebar from '@/components/AppSidebar/AppSidebar.vue'
import SecondaryNav from '@/components/SecondaryNav/SecondaryNav.vue'
import ProfileModal from '@/components/ProfileModal/ProfileModal.vue'
import OrganizationAddModal from '@/components/OrganizationAddModal/OrganizationAddModal.vue'
import OrganizationEditModal from '@/components/OrganizationEditModal/OrganizationEditModal.vue'
</script>

<style src="./AppLayout.css"></style>
