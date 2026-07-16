<template>
  <AppLayout>
    <div class="page permission-page">
      <div class="page-caption">
        <h1>{{ t('permission.title') || t('sidebarnav.permission') }}</h1>
      </div>

      <!-- 角色切換 (segmented tabs) + 儲存動作 -->
      <div class="permission-toolbar">
        <div class="permission-role-tabs" role="tablist">
          <button
            v-for="role in roleTabs"
            :id="'permission-button-gotopage_' + role.id"
            :key="role.code"
            type="button"
            class="permission-role-tab"
            :class="{ active: permissionCode === role.code }"
            :disabled="permissionCode === role.code"
            @click="selectPreset(role.code)"
          >
            {{ t('role.' + role.code) || role.fallback }}
          </button>
        </div>
        <button id="permission-button-update_ok" type="button" class="btn-primary" @click="savePermission">
          {{ t('common.save') || '儲存' }}
        </button>
      </div>

      <!-- 權限設定卡片群 -->
      <div class="permission-groups">
        <!-- 操作設定 -->
        <section class="permission-card">
          <h2 class="permission-card-title">{{ t('permission.label_setting_operation') || '操作設定' }}</h2>
          <div class="permission-grid">
            <label v-for="field in operateFields" :key="field.key" class="permission-item" :for="'permission-' + field.key">
              <input :id="'permission-' + field.key" v-model="form[field.key]" type="checkbox" />
              <span>{{ t('permission.' + field.key) || field.key }}</span>
            </label>
          </div>
        </section>

        <!-- 各模組設定 -->
        <section v-for="mod in modules" :key="mod.key" class="permission-card">
          <h2 class="permission-card-title">{{ t('permission.label_setting_' + mod.key) || mod.key }}</h2>
          <div class="permission-grid">
            <label
              v-for="action in ['select', 'insert', 'update']"
              :key="action"
              class="permission-item"
              :for="'permission-is_' + action + '_own_' + mod.key"
            >
              <input
                :id="'permission-is_' + action + '_own_' + mod.key"
                v-model="form['is_' + action + '_own_' + mod.key]"
                type="checkbox"
              />
              <span>{{ t('permission.is_' + action + '_own_' + mod.key) || 'is_' + action + '_own_' + mod.key }}</span>
            </label>
          </div>
        </section>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
// 邏輯抽離至 PermissionView.js，此處僅保留模板繫結
import AppLayout from '@/layouts/AppLayout/AppLayout.vue'
import { usePermissionView } from './PermissionView.js'

const {
  permissionCode,
  form,
  operateFields,
  modules,
  selectPreset,
  loadPermission,
  savePermission,
  t,
} = usePermissionView()

// 角色分頁籤 (id 沿用原 permission.html 的按鈕命名)
const roleTabs = [
  { code: 1, id: 'admin', fallback: '系統管理員' },
  { code: 2, id: 'agent', fallback: '代理員' },
  { code: 3, id: 'manager', fallback: '群組管理員' },
  { code: 4, id: 'user', fallback: '使用者' },
]
</script>

<style src="./PermissionView.css"></style>
