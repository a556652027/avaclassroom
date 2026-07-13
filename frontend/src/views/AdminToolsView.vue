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
          <div style="display: flex; gap: 0.75rem; margin-top: 0.75rem">
            <button type="button" class="image_button_default" style="flex: 1" @click="bulkGenerateKey">自動批次生產</button>
            <button
              v-if="lastGeneratedKeys.length > 0"
              type="button"
              class="image_button_default"
              style="flex: 1; background-color: #ef4444; color: #fff"
              @click="bulkRevoke"
            >
              作廢上一批 (Undo)
            </button>
          </div>
          <div style="margin-top: 0.9rem">
            <label>生產結果 (供複製)</label>
            <textarea
              v-model="bulkResult"
              rows="6"
              readonly
              style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-family: monospace; resize: vertical; box-sizing: border-box"
            ></textarea>
          </div>
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
  CsRequestBulkRevokeProxy,
} from '@/api/adminTools'

const resetLicenseCid = ref('')
const resetCount = ref('3')
const keyCid = ref('')
const bulkResult = ref('')
const lastGeneratedKeys = ref([])
let lastProduct = ''
let lastVersion = ''
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

// 原 executeBulkGenKey (必填/範圍驗證 + confirm + 結果回填母鑰與金鑰清單)
function bulkGenerateKey() {
  const product = bulkForm.product.trim()
  const version = bulkForm.version.trim()
  const amount = parseInt(bulkForm.amount, 10)

  if (!product || !version) {
    alert('產品名稱與版本為必填！')
    return
  }
  if (isNaN(amount) || amount < 1 || amount > 100) {
    alert('產生數量必須介於 1 到 100 之間！')
    return
  }
  if (!confirm(`即將為產品 [${product} - ${version}] 批次產生 ${amount} 組金鑰。\n確定要執行嗎？`)) return

  VisibleLoaderElement(true)
  bulkResult.value = '生產中，請稍候...'
  lastGeneratedKeys.value = []
  lastProduct = product
  lastVersion = version

  CsRequestBulkGenKeyProxy(
    product,
    version,
    bulkForm.license.trim(),
    '',
    amount,
    (ok, result) => {
      VisibleLoaderElement(false)
      if (!ok) {
        alert('API 請求失敗！請按 F12 查看詳細錯誤。')
        bulkResult.value = '請求失敗。'
        return
      }
      try {
        const json_object = typeof result === 'string' ? JSON.parse(result) : result
        if (json_object.result === '0') {
          const keys = json_object.info // 後端傳回的陣列
          lastGeneratedKeys.value = keys
          alert(`生產成功！共產生 ${keys.length} 組金鑰。`)
          bulkForm.license = json_object.license // 回填自動產生的母鑰
          bulkResult.value = keys.join('\n')
        } else {
          alert(`生產失敗！\n原因：${json_object.info}`)
          bulkResult.value = `錯誤：${json_object.info}`
        }
      } catch (e) {
        console.error('解析回應失敗', e)
        bulkResult.value = '解析伺服器回應失敗。'
      }
    },
    getController(),
  )
}

// 原 executeBulkRevoke (作廢上一批並退還授權額度)
function bulkRevoke() {
  if (lastGeneratedKeys.value.length === 0) return
  if (
    !confirm(
      `【危險操作】確定要作廢剛剛為 [${lastProduct}] 產生的 ${lastGeneratedKeys.value.length} 組金鑰嗎？\n此動作會將金鑰設為停用，並退還授權額度。\n請注意：如果金鑰已經交給客戶，他們將無法使用！`,
    )
  )
    return

  VisibleLoaderElement(true)
  CsRequestBulkRevokeProxy(
    lastProduct,
    lastVersion,
    lastGeneratedKeys.value,
    (ok, result) => {
      VisibleLoaderElement(false)
      if (!ok) {
        alert('API 請求失敗！請按 F12 查看詳細錯誤。')
        return
      }
      try {
        const json_object = typeof result === 'string' ? JSON.parse(result) : result
        if (json_object.result === '0') {
          alert(json_object.info) // 顯示退還的額度與數量
          bulkResult.value = ''
          lastGeneratedKeys.value = []
        } else {
          alert(`作廢失敗！\n原因：${json_object.info}`)
        }
      } catch (e) {
        console.error('解析回應失敗', e)
      }
    },
    getController(),
  )
}

onBeforeUnmount(() => {
  requestController?.abort()
})
</script>
