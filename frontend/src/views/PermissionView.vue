<template>
  <AppLayout>
    <div class="page">
      <div class="page-caption" style="margin-bottom: 1rem">
        <h1>{{ t('sidebarnav.permission') }}</h1>
      </div>

      <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap">
        <button v-for="preset in presets" :key="preset.code" type="button" class="image_button_default" :style="permissionCode === preset.code ? { background: '#214f7c', color: '#fff' } : {}" @click="selectPreset(preset.code)">
          {{ preset.label }}
        </button>
      </div>

      <div style="display: grid; gap: 1rem; max-width: 920px">
        <div style="background: #fff; border: 1px solid #e5e8ea; border-radius: 12px; padding: 1rem">
          <h3 style="margin-top: 0">{{ t('permission.module_access') || '模組權限' }}</h3>
          <div style="display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); gap: 0.75rem">
            <label v-for="field in moduleFields" :key="field.key" style="display: flex; align-items: center; gap: 0.5rem">
              <input v-model="form[field.key]" type="checkbox" />
              <span>{{ field.label }}</span>
            </label>
          </div>
        </div>

        <div style="background: #fff; border: 1px solid #e5e8ea; border-radius: 12px; padding: 1rem">
          <h3 style="margin-top: 0">{{ t('permission.own_scope') || '自有資料權限' }}</h3>
          <div style="display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); gap: 0.75rem">
            <label v-for="field in scopeFields" :key="field.key" style="display: flex; align-items: center; gap: 0.5rem">
              <input v-model="form[field.key]" type="checkbox" />
              <span>{{ field.label }}</span>
            </label>
          </div>
        </div>
      </div>

      <div style="margin-top: 1.25rem">
        <button type="button" class="image_button_default" style="background: #214f7c; color: #fff" @click="savePermission">
          {{ t('common.save') || '儲存' }}
        </button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { t } from '@/locales'
import { VisibleLoaderElement } from '@/core/loader'
import { apiCall, strToBool } from '@/core/util'
import { PermissionData, CsRequestPermissionSelectOne, CsRequestPermissionUpdateOne } from '@/api/permission'

const permissionCode = ref(1)
const form = reactive({
  ...PermissionData,
  is_operate_member: false,
  is_operate_organization: false,
  is_operate_license: false,
  is_operate_device: false,
  is_operate_analytics: false,
  is_select_own_member: false,
  is_insert_own_member: false,
  is_update_own_member: false,
  is_select_own_organization: false,
  is_insert_own_organization: false,
  is_update_own_organization: false,
  is_select_own_license: false,
  is_insert_own_license: false,
  is_update_own_license: false,
  is_select_own_device: false,
  is_insert_own_device: false,
  is_update_own_device: false,
  is_select_own_analytics: false,
  is_insert_own_analytics: false,
  is_update_own_analytics: false,
})

const presets = [
  { code: 1, label: 'Admin' },
  { code: 2, label: 'Agent' },
  { code: 3, label: 'Manager' },
  { code: 4, label: 'User' },
]

const moduleFields = [
  { key: 'is_operate_member', label: '管理會員' },
  { key: 'is_operate_organization', label: '管理組織' },
  { key: 'is_operate_license', label: '管理授權' },
  { key: 'is_operate_device', label: '管理設備' },
  { key: 'is_operate_analytics', label: '管理分析' },
]

const scopeFields = [
  { key: 'is_select_own_member', label: '查詢會員' },
  { key: 'is_insert_own_member', label: '新增會員' },
  { key: 'is_update_own_member', label: '更新會員' },
  { key: 'is_select_own_organization', label: '查詢組織' },
  { key: 'is_insert_own_organization', label: '新增組織' },
  { key: 'is_update_own_organization', label: '更新組織' },
  { key: 'is_select_own_license', label: '查詢授權' },
  { key: 'is_insert_own_license', label: '新增授權' },
  { key: 'is_update_own_license', label: '更新授權' },
  { key: 'is_select_own_device', label: '查詢設備' },
  { key: 'is_insert_own_device', label: '新增設備' },
  { key: 'is_update_own_device', label: '更新設備' },
  { key: 'is_select_own_analytics', label: '查詢分析' },
  { key: 'is_insert_own_analytics', label: '新增分析' },
  { key: 'is_update_own_analytics', label: '更新分析' },
]

function selectPreset(code) {
  permissionCode.value = code
  loadPermission()
}

async function loadPermission() {
  VisibleLoaderElement(true)
  try {
    const result = await apiCall(CsRequestPermissionSelectOne, permissionCode.value)
    const permissions = result.permissions || {}
    const labels = permissions.paper_label || []
    const values = permissions.paper_value || []
    const mapping = {}
    labels.forEach((label, index) => {
      mapping[label] = values[index]
    })

    Object.keys(form).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(mapping, key)) {
        form[key] = strToBool(mapping[key])
      }
    })
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

async function savePermission() {
  VisibleLoaderElement(true)
  try {
    const payload = { ...form }
    await apiCall(CsRequestPermissionUpdateOne, permissionCode.value, payload)
    alert('儲存成功')
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

onMounted(() => {
  loadPermission()
})
</script>
