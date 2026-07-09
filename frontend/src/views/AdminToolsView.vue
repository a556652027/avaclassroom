<template>
  <AppLayout>
    <div class="page">
      <div class="page-caption" style="margin-bottom: 1rem">
        <h1>{{ t('sidebarnav.admin_tools') || '進階管理工具' }}</h1>
      </div>

      <div style="display: grid; gap: 1rem; max-width: 980px">
        <div style="background: #fff; border: 1px solid #e5e8ea; border-radius: 12px; padding: 1rem">
          <h3 style="margin-top: 0">重建快取</h3>
          <button type="button" class="image_button_default" @click="rebuildCache">重新建立系統快取</button>
        </div>

        <div style="background: #fff; border: 1px solid #e5e8ea; border-radius: 12px; padding: 1rem">
          <h3 style="margin-top: 0">重置序號次數</h3>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: end">
            <div>
              <label>序號</label>
              <input v-model="resetLicenseCid" class="org-input" />
            </div>
            <div>
              <label>次數</label>
              <input v-model="resetCount" class="org-input" />
            </div>
            <button type="button" class="image_button_default" @click="resetUnregCount">執行</button>
          </div>
        </div>

        <div style="background: #fff; border: 1px solid #e5e8ea; border-radius: 12px; padding: 1rem">
          <h3 style="margin-top: 0">序號啟用 / 停用</h3>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: end">
            <div>
              <label>序號</label>
              <input v-model="keyCid" class="org-input" />
            </div>
            <button type="button" class="image_button_default" @click="enableKey">啟用</button>
            <button type="button" class="image_button_default" @click="disableKey">停用</button>
          </div>
        </div>

        <div style="background: #fff; border: 1px solid #e5e8ea; border-radius: 12px; padding: 1rem">
          <h3 style="margin-top: 0">新增金鑰</h3>
          <div style="display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); gap: 0.75rem">
            <div v-for="field in addKeyFields" :key="field.key">
              <label>{{ field.label }}</label>
              <input v-model="addKeyForm[field.key]" class="org-input" />
            </div>
          </div>
          <button type="button" class="image_button_default" style="margin-top: 0.75rem" @click="addKey">新增</button>
        </div>

        <div style="background: #fff; border: 1px solid #e5e8ea; border-radius: 12px; padding: 1rem">
          <h3 style="margin-top: 0">批次產生金鑰</h3>
          <div style="display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); gap: 0.75rem">
            <div v-for="field in bulkKeyFields" :key="field.key">
              <label>{{ field.label }}</label>
              <input v-model="bulkForm[field.key]" class="org-input" />
            </div>
          </div>
          <button type="button" class="image_button_default" style="margin-top: 0.75rem" @click="bulkGenerateKey">批次產生</button>
          <div v-if="bulkResult" style="margin-top: 0.75rem; color: #214f7c">{{ bulkResult }}</div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { onBeforeUnmount, reactive, ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { t } from '@/locales'
import { VisibleLoaderElement } from '@/core/loader'
import {
  CsRequestRebuildCache,
  CsRequestResetUnregCountProxy,
  CsRequestEnableKeyProxy,
  CsRequestDisableKeyProxy,
  CsRequestAddKeyProxy,
  CsRequestBulkGenKeyProxy,
} from '@/api/adminTools'

const resetLicenseCid = ref('')
const resetCount = ref('3')
const keyCid = ref('')
const bulkResult = ref('')
const addKeyForm = reactive({ product: '', version: '', key: '', validDate: '', duration: '', unregCount: '', appParam: '' })
const bulkForm = reactive({ product: '', version: '', license: '', amount: '10' })
let requestController = null

const addKeyFields = [
  { key: 'product', label: '產品' },
  { key: 'version', label: '版本' },
  { key: 'key', label: '金鑰' },
  { key: 'validDate', label: '有效日期' },
  { key: 'duration', label: '有效天數' },
  { key: 'unregCount', label: '可解綁次數' },
  { key: 'appParam', label: 'App 參數' },
]

const bulkKeyFields = [
  { key: 'product', label: '產品' },
  { key: 'version', label: '版本' },
  { key: 'license', label: '授權碼' },
  { key: 'amount', label: '數量' },
]

function getController() {
  requestController?.abort()
  requestController = new AbortController()
  return requestController
}

function rebuildCache() {
  VisibleLoaderElement(true)
  CsRequestRebuildCache((ok, result) => {
    VisibleLoaderElement(false)
    if (!ok) {
      alert('request error')
      return
    }
    const response = typeof result === 'string' ? JSON.parse(result) : result
    alert(response?.info || '快取已重建')
  }, getController())
}

function resetUnregCount() {
  if (!resetLicenseCid.value) {
    alert('請輸入序號')
    return
  }
  VisibleLoaderElement(true)
  CsRequestResetUnregCountProxy(resetLicenseCid.value, resetCount.value, (ok, result) => {
    VisibleLoaderElement(false)
    if (!ok) return alert('request error')
    const response = typeof result === 'string' ? JSON.parse(result) : result
    alert(response?.info || '已完成')
  }, getController())
}

function enableKey() {
  if (!keyCid.value) {
    alert('請輸入序號')
    return
  }
  VisibleLoaderElement(true)
  CsRequestEnableKeyProxy(keyCid.value, (ok, result) => {
    VisibleLoaderElement(false)
    if (!ok) return alert('request error')
    const response = typeof result === 'string' ? JSON.parse(result) : result
    alert(response?.info || '已啟用')
  }, getController())
}

function disableKey() {
  if (!keyCid.value) {
    alert('請輸入序號')
    return
  }
  VisibleLoaderElement(true)
  CsRequestDisableKeyProxy(keyCid.value, (ok, result) => {
    VisibleLoaderElement(false)
    if (!ok) return alert('request error')
    const response = typeof result === 'string' ? JSON.parse(result) : result
    alert(response?.info || '已停用')
  }, getController())
}

function addKey() {
  VisibleLoaderElement(true)
  CsRequestAddKeyProxy(
    addKeyForm.product,
    addKeyForm.version,
    addKeyForm.key,
    addKeyForm.validDate,
    addKeyForm.duration,
    addKeyForm.unregCount,
    addKeyForm.appParam,
    (ok, result) => {
      VisibleLoaderElement(false)
      if (!ok) return alert('request error')
      const response = typeof result === 'string' ? JSON.parse(result) : result
      alert(response?.info || '已新增金鑰')
    },
    getController(),
  )
}

function bulkGenerateKey() {
  VisibleLoaderElement(true)
  CsRequestBulkGenKeyProxy(
    bulkForm.product,
    bulkForm.version,
    bulkForm.license,
    '',
    Number(bulkForm.amount || 1),
    (ok, result) => {
      VisibleLoaderElement(false)
      if (!ok) return alert('request error')
      const response = typeof result === 'string' ? JSON.parse(result) : result
      bulkResult.value = response?.info || '已批次產生'
    },
    getController(),
  )
}

onBeforeUnmount(() => {
  requestController?.abort()
})
</script>
