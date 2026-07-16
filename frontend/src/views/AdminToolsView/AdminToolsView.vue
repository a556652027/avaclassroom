<template>
  <!-- 原 admin_tools.html：獨立頁面，只有 navbar (無側欄)，置中窄卡片 -->
  <div class="admin-tools-page" style="display: flex; flex-direction: column; height: 100vh">
    <AppNavbar />
    <ProfileModal />

    <div class="page" style="display: block; flex: 1; overflow-y: auto; padding-bottom: 80px; box-sizing: border-box">
      <div class="test-container">
        <div style="display: flex; align-items: center; margin-bottom: 20px">
          <img src="/assets/images/edit.svg" alt="" style="width: 24px; height: 24px; margin-right: 10px" />
          <h2 class="admin-section-title">{{ t('sidebarnav.admin_tools') || '進階管理工具' }}</h2>
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
          <button class="btn-submit btn-submit--danger" style="width: auto; padding: 10px 20px" @click="rebuildCache">
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
          <button class="btn-submit btn-submit--success" @click="enableKey">啟用金鑰</button>
          <button class="btn-submit btn-submit--danger" @click="disableKey">停用金鑰</button>
        </div>

        <!-- 新增金鑰專屬區塊 -->
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb" />
        <div style="display: flex; align-items: center; margin-bottom: 20px">
          <h2 class="admin-section-title">新增手動金鑰 (Add Key)</h2>
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

        <button class="btn-submit" @click="addKey">配發金鑰</button>

        <!-- 批次產生金鑰專屬區塊 -->
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb" />
        <div style="display: flex; align-items: center; margin-bottom: 20px">
          <h2 class="admin-section-title">批次產生金鑰 (Bulk Genkey)</h2>
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
              <span class="admin-hint-success">*留空將自動產生</span>
            </label>
            <input id="test-bulk-license" v-model="bulkForm.license" type="text" placeholder="可留空..." />
          </div>
          <div class="form-group" style="flex: 1">
            <label for="test-bulk-amount">數量 (1~100)</label>
            <input id="test-bulk-amount" v-model="bulkForm.amount" type="number" min="1" max="100" />
          </div>
        </div>
        <div style="display: flex; gap: 10px">
          <button class="btn-submit" style="flex: 1" @click="bulkGenerateKey">自動批次生產</button>
          <button
            v-if="lastGeneratedKeys.length > 0"
            class="btn-submit btn-submit--danger"
            style="flex: 1"
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
          <a href="#/dashboard" class="admin-back-link">返回儀表板</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 邏輯抽離至 AdminToolsView.js，此處僅保留模板繫結
import AppNavbar from '@/components/AppNavbar/AppNavbar.vue'
import ProfileModal from '@/components/ProfileModal/ProfileModal.vue'
import { useAdminToolsView } from './AdminToolsView.js'

const {
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
} = useAdminToolsView()
</script>

<style src="./AdminToolsView.css"></style>
