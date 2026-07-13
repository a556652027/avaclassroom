<template>
  <AppLayout>
    <div class="page">
      <div class="page-caption">
        <h1>{{ t('permission.title') || t('sidebarnav.permission') }}</h1>
      </div>
      <!-- 角色切換與確定按鈕 (原 permission.html frame-table 排版) -->
      <div>
        <table class="frame-table">
          <tbody>
            <tr>
              <td colspan="8"></td>
              <!-- 間隔用的 td -->
              <td colspan="1">
                <button
                  id="permission-button-gotopage_admin"
                  class="image_button_default"
                  :disabled="permissionCode === 1"
                  @click="selectPreset(1)"
                >
                  <i class="iconfont">&#xe7A7;&nbsp;</i>
                  {{ t('role.1') || '系統管理員' }}
                </button>
              </td>
              <td colspan="1">
                <button
                  id="permission-button-gotopage_agent"
                  class="image_button_default"
                  :disabled="permissionCode === 2"
                  @click="selectPreset(2)"
                >
                  <i class="iconfont">&#xe7A7;&nbsp;</i>
                  {{ t('role.2') || '代理員' }}
                </button>
              </td>
              <td colspan="1">
                <button
                  id="permission-button-gotopage_manager"
                  class="image_button_default"
                  :disabled="permissionCode === 3"
                  @click="selectPreset(3)"
                >
                  <i class="iconfont">&#xe7A7;&nbsp;</i>
                  {{ t('role.3') || '群組管理員' }}
                </button>
              </td>
              <td colspan="1">
                <button
                  id="permission-button-gotopage_user"
                  class="image_button_default"
                  :disabled="permissionCode === 4"
                  @click="selectPreset(4)"
                >
                  <i class="iconfont">&#xe7A7;&nbsp;</i>
                  {{ t('role.4') || '使用者' }}
                </button>
              </td>
            </tr>
            <tr>
              <td colspan="1">
                <div id="permission-role"></div>
              </td>
              <td colspan="10"></td>
              <!-- 間隔用的 td -->
              <td colspan="1">
                <button id="permission-button-update_ok" class="image_button_default" @click="savePermission">
                  <i class="iconfont">&#xe786;&nbsp;</i>
                  {{ t('common.ok') || '確定' }}
                </button>
              </td>
            </tr>
            <tr>
              <td colspan="12">
                <!-- 操作設定 -->
                <div class="block">
                  <p>{{ t('permission.label_setting_operation') || '操作設定' }}</p>
                  <table class="frame-table">
                    <tbody>
                      <tr>
                        <template v-for="field in operateFields" :key="field.key">
                          <td colspan="1">
                            <input :id="'permission-' + field.key" v-model="form[field.key]" type="checkbox" />
                          </td>
                          <td colspan="1">
                            <label class="label-style-default" :for="'permission-' + field.key">
                              {{ t('permission.' + field.key) || field.key }}
                            </label>
                          </td>
                        </template>
                        <td colspan="2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!-- 各模組設定 -->
                <div v-for="mod in modules" :key="mod.key" class="block">
                  <p>{{ t('permission.label_setting_' + mod.key) || mod.key }}</p>
                  <table class="frame-table">
                    <tbody>
                      <tr>
                        <template v-for="action in ['select', 'insert', 'update']" :key="action">
                          <td colspan="1">
                            <input
                              :id="'permission-is_' + action + '_own_' + mod.key"
                              v-model="form['is_' + action + '_own_' + mod.key]"
                              type="checkbox"
                            />
                          </td>
                          <td colspan="3">
                            <label class="label-style-default" :for="'permission-is_' + action + '_own_' + mod.key">
                              {{ t('permission.is_' + action + '_own_' + mod.key) || 'is_' + action + '_own_' + mod.key }}
                            </label>
                          </td>
                        </template>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
// 原 views/app.view.permission.js (角色切換 GotoPageUpdate01~04 + PermissionSelectOne/UpdateOne)
import { onMounted, reactive, ref } from 'vue'
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
</script>

<style>
/* 標籤設定的區塊間隔 (原 permission.html 的 label 檢查表排版依 layout.style.utility.css .block) */
#permission-role {
  min-height: 1px;
}
</style>
