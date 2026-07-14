import { onMounted, reactive, ref } from 'vue'
import { t } from '@/locales'
import { VisibleLoaderElement } from '@/core/loader'
import { apiCall, strToBool } from '@/core/util'
import { PermissionData, CsRequestPermissionSelectOne, CsRequestPermissionUpdateOne } from '@/api/permission'

// 原 PermissionView.vue <script setup> 的邏輯，模板繫結經由 usePermissionView() 回傳
export function usePermissionView() {
// 原 views/app.view.permission.js (角色切換 GotoPageUpdate01~04 + PermissionSelectOne/UpdateOne)

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

const operateFields = [
  { key: 'is_operate_member' },
  { key: 'is_operate_organization' },
  { key: 'is_operate_license' },
  { key: 'is_operate_device' },
  { key: 'is_operate_analytics' },
]

const modules = [
  { key: 'member' },
  { key: 'organization' },
  { key: 'license' },
  { key: 'device' },
  { key: 'analytics' },
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
    alert(t('common.success') || '成功')
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

onMounted(() => {
  loadPermission()
})

  return {
    permissionCode,
    form,
    operateFields,
    modules,
    selectPreset,
    loadPermission,
    savePermission,
    t,
  }
}
