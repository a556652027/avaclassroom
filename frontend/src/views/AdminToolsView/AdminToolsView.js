import { onBeforeUnmount, reactive, ref } from 'vue'
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

// 原 AdminToolsView.vue <script setup> 的邏輯，模板繫結經由 useAdminToolsView() 回傳
export function useAdminToolsView() {
// 原 views/app.view.admin_tools.js (executeRebuildCache/Reset/Enable/Disable/AddKey/BulkGenKey/BulkRevoke)

const resetLicenseCid = ref('')
const resetCount = ref('3')
const bulkResult = ref('')
const lastGeneratedKeys = ref([])
let lastProduct = ''
let lastVersion = ''
const addKeyForm = reactive({ product: '', version: '', key: '', validDate: '', duration: '12', unregCount: '3', appParam: '0' })
const bulkForm = reactive({ product: '', version: '', license: '', amount: '10' })
let requestController = null

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
  if (!resetLicenseCid.value) {
    alert('請輸入序號')
    return
  }
  VisibleLoaderElement(true)
  CsRequestEnableKeyProxy(resetLicenseCid.value, (ok, result) => {
    VisibleLoaderElement(false)
    if (!ok) return alert('request error')
    const response = typeof result === 'string' ? JSON.parse(result) : result
    alert(response?.info || '已啟用')
  }, getController())
}

function disableKey() {
  if (!resetLicenseCid.value) {
    alert('請輸入序號')
    return
  }
  VisibleLoaderElement(true)
  CsRequestDisableKeyProxy(resetLicenseCid.value, (ok, result) => {
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

  return {
    resetLicenseCid,
    resetCount,
    bulkResult,
    lastGeneratedKeys,
    lastProduct,
    lastVersion,
    addKeyForm,
    bulkForm,
    requestController,
    getController,
    rebuildCache,
    resetUnregCount,
    enableKey,
    disableKey,
    addKey,
    bulkGenerateKey,
    bulkRevoke,
    t,
  }
}
