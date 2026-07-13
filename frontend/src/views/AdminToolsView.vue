<template>
  <!-- 原 admin_tools.html：獨立頁面，只有 navbar (無側欄)，置中窄卡片 -->
  <div class="admin-tools-page" style="display: flex; flex-direction: column; height: 100vh">
    <AppNavbar />
    <ProfileModal />

    <div class="page" style="display: block; flex: 1; overflow-y: auto; padding-bottom: 80px; box-sizing: border-box">
      <div class="test-container">
        <div style="display: flex; align-items: center; margin-bottom: 20px">
          <img src="/assets/images/edit.svg" alt="" style="width: 24px; height: 24px; margin-right: 10px" />
          <h2 style="margin: 0; color: #214f7c">{{ t('sidebarnav.admin_tools') || '進階管理工具' }}</h2>
        </div>

        <!-- 系統快取管理 -->
        <div
          style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: #fef2f2; padding: 15px; border-radius: 8px; border: 1px solid #fca5a5"
        >
          <div>
            <h3 style="margin: 0; color: #b91c1c; font-size: 16px">系統快取管理 (System Cache)</h3>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #7f1d1d">
              資料庫發生外部變更 (如手動刪除資料) 時，強制與記憶體同步。
            </p>
          </div>
          <button class="btn-submit" style="background-color: #ef4444; width: auto; padding: 10px 20px" @click="rebuildCache">
            重建快取
          </button>
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb" />

        <div class="form-group">
          <label for="test-license-cid">目標金鑰 (License CID) 或 序號 (Product Key)</label>
          <input id="test-license-cid" v-model="resetLicenseCid" type="text" placeholder="請輸入序號..." />
        </div>

        <div class="form-group">
          <label for="test-reset-count">要重置的次數</label>
          <input id="test-reset-count" v-model="resetCount" type="number" min="1" max="99" />
        </div>

        <button class="btn-submit" @click="resetUnregCount">執行重置</button>

        <div style="display: flex; gap: 10px; margin-top: 15px">
          <button class="btn-submit" style="background-color: #10b981" @click="enableKey">啟用金鑰</button>
          <button class="btn-submit" style="background-color: #ef4444" @click="disableKey">停用金鑰</button>
        </div>

        <!-- 新增金鑰專屬區塊 -->
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb" />
        <div style="display: flex; align-items: center; margin-bottom: 20px">
          <h2 style="margin: 0; color: #214f7c">新增手動金鑰 (Add Key)</h2>
        </div>

        <div style="display: flex; gap: 10px">
          <div class="form-group" style="flex: 1">
            <label for="test-add-product">產品名稱 (Product)</label>
            <input id="test-add-product" v-model="addKeyForm.product" type="text" placeholder="ex: avacast" />
          </div>
          <div class="form-group" style="flex: 1">
            <label for="test-add-version">版本 (Version)</label>
            <input id="test-add-version" v-model="addKeyForm.version" type="text" placeholder="ex: mac" />
          </div>
        </div>

        <div class="form-group">
          <label for="test-add-key">金鑰序號 (Key - 35 碼包含連字號)</label>
          <input id="test-add-key" v-model="addKeyForm.key" type="text" placeholder="輸入要配發的 35 碼金鑰..." />
        </div>

        <div style="display: flex; gap: 10px">
          <div class="form-group" style="flex: 1">
            <label for="test-add-valid-date">有效期限 (Valid Date)</label>
            <input id="test-add-valid-date" v-model="addKeyForm.validDate" type="datetime-local" />
          </div>
          <div class="form-group" style="flex: 1">
            <label for="test-add-duration">授權月數 (Duration)</label>
            <input id="test-add-duration" v-model="addKeyForm.duration" type="number" min="1" />
          </div>
        </div>

        <div style="display: flex; gap: 10px">
          <div class="form-group" style="flex: 1">
            <label for="test-add-unreg-count">解綁次數</label>
            <input id="test-add-unreg-count" v-model="addKeyForm.unregCount" type="number" min="0" />
          </div>
          <div class="form-group" style="flex: 1">
            <label for="test-add-app-param">應用參數 (App Param)</label>
            <input id="test-add-app-param" v-model="addKeyForm.appParam" type="text" />
          </div>
        </div>

        <button class="btn-submit" style="background-color: #f59e0b" @click="addKey">配發金鑰</button>

        <!-- 批次產生金鑰專屬區塊 -->
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb" />
        <div style="display: flex; align-items: center; margin-bottom: 20px">
          <h2 style="margin: 0; color: #214f7c">批次產生金鑰 (Bulk Genkey)</h2>
        </div>

        <div style="display: flex; gap: 10px">
          <div class="form-group" style="flex: 1">
            <label for="test-bulk-product">產品名稱 (Product)</label>
            <input id="test-bulk-product" v-model="bulkForm.product" type="text" placeholder="ex: avacast" />
          </div>
          <div class="form-group" style="flex: 1">
            <label for="test-bulk-version">版本 (Version)</label>
            <input id="test-bulk-version" v-model="bulkForm.version" type="text" placeholder="ex: mac" />
          </div>
        </div>
        <div style="display: flex; gap: 10px">
          <div class="form-group" style="flex: 2">
            <label for="test-bulk-license">
              母鑰 (License)
              <span style="color: #10b981; font-weight: normal; font-size: 12px">*留空將自動產生</span>
            </label>
            <input id="test-bulk-license" v-model="bulkForm.license" type="text" placeholder="可留空..." />
          </div>
          <div class="form-group" style="flex: 1">
            <label for="test-bulk-amount">數量 (1~100)</label>
            <input id="test-bulk-amount" v-model="bulkForm.amount" type="number" min="1" max="100" />
          </div>
        </div>
        <div style="display: flex; gap: 10px">
          <button class="btn-submit" style="background-color: #8b5cf6; flex: 1" @click="bulkGenerateKey">自動批次生產</button>
          <button
            v-if="lastGeneratedKeys.length > 0"
            class="btn-submit"
            style="background-color: #ef4444; flex: 1"
            @click="bulkRevoke"
          >
            作廢上一批 (Undo)
          </button>
        </div>

        <div class="form-group" style="margin-top: 15px">
          <label>生產結果 (供複製)</label>
          <textarea
            v-model="bulkResult"
            rows="6"
            readonly
            style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-family: monospace; resize: vertical; box-sizing: border-box"
          ></textarea>
        </div>

        <div style="margin-top: 20px; text-align: center">
          <a href="#/dashboard" style="color: #92bfff; text-decoration: none; font-size: 14px">返回儀表板</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 原 views/app.view.admin_tools.js (executeRebuildCache/Reset/Enable/Disable/AddKey/BulkGenKey/BulkRevoke)
import { onBeforeUnmount, reactive, ref } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import ProfileModal from '@/components/ProfileModal.vue'
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
</script>

<style>
/* 原 admin_tools.html 的頁面樣式 */
.admin-tools-page {
  background-color: #f5f7fa;
  font-family: 'Inter', sans-serif;
}
.admin-tools-page .test-container {
  max-width: 600px;
  margin: 50px auto;
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}
.admin-tools-page .form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}
.admin-tools-page .form-group label {
  font-weight: bold;
  margin-bottom: 8px;
  color: #404040;
}
.admin-tools-page .form-group input {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}
.admin-tools-page .btn-submit {
  background-color: #214f7c;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  transition: background-color 0.2s;
}
.admin-tools-page .btn-submit:hover {
  background-color: #ee963f;
}
</style>
