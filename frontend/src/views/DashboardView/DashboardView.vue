<template>
  <AppLayout>
    <div class="page">
      <!-- 頁面標題區域 (全站 UI 改版：行內樣式移至 DashboardView.css，統計數字拆為獨立白卡並排) -->
      <div class="dashboard-header">
        <div class="dashboard-title-group">
          <div class="page-icon-container">
            <img src="/assets/images/IdentificationBadge.svg" alt="" />
          </div>
          <!-- 標題顯示組織名稱，點擊可編輯組織 (原 lib.title.groupcid + addOrganizationEditClickToTitle) -->
          <h1
            class="dashboard-title"
            :title="t('organization.tooltip_edit_org')"
            @click="emitter.emit('org-edit-modal:show')"
          >
            {{ pageTitle }}
          </h1>
        </div>
        <div class="dashboard-header-right">
          <img src="/assets/images/Group (1).svg" alt="" class="page-big-icon" />
          <!-- 統計卡片區域：各自獨立的白色卡片，不再包在色塊容器內 -->
          <div class="stats-card-container">
            <div class="stats-cards">
              <div class="stat-card">
                <label class="stat-label">{{ t('dashboard.device_activated_count') }}</label>
                <div class="stat-value-row">
                  <div class="stat-value">{{ activatedCount }}</div>
                  <div v-show="growthVisible" class="stat-growth">
                    <span>{{ growthText }}</span>
                    <img :src="growthUp ? '/assets/images/up.svg' : '/assets/images/down.svg'" alt="" />
                  </div>
                </div>
              </div>
              <div class="stat-card">
                <label class="stat-label">{{ t('dashboard.device_revoked_count') }}</label>
                <div class="stat-value-row">
                  <div class="stat-value">{{ revokedCount }}</div>
                </div>
              </div>
            </div>
            <!-- 時間選擇器區域：獨立卡片，輸入框樣式與登入頁一致 -->
            <div class="search_time stat-card">
              <div class="date-field">
                <label class="stat-label">{{ t('dashboard.search_date_start') }}</label>
                <input v-model="beginTime" type="date" required class="dash-date-input" />
              </div>
              <div class="date-field">
                <label class="stat-label">{{ t('dashboard.search_date_end') }}</label>
                <input v-model="endTime" type="date" required class="dash-date-input" />
              </div>
              <button class="btn-primary dash-date-search-btn" @click="SelectDeviceSpec003()">
                {{ t('dashboard.search_confirm') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 圖表內容 -->
      <div>
        <!-- 上方雙圖表區域 -->
        <div class="dashboard-charts-container">
          <!-- 長條圖（左側）-->
          <div class="dashboard-chart-box chart-left">
            <canvas ref="barCanvas" class="dash-canvas"></canvas>
          </div>
          <!-- 圓餅圖（右側）-->
          <div class="dashboard-chart-box chart-right">
            <canvas ref="pieCanvas" class="dash-canvas"></canvas>
          </div>
        </div>

        <div style="height: 1rem"></div>

        <!-- 折線圖（下方全寬）+ 匯出按鈕 -->
        <div class="dashboard-chart-box chart-bottom">
          <button class="dash-export-btn" @click="ExportDeviceSpec003">
            <img src="/assets/images/download_excel.svg" alt="" />
          </button>
          <canvas ref="lineCanvas" height="240" class="dash-canvas dash-canvas-line"></canvas>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
// 邏輯抽離至 DashboardView.js，此處僅保留模板繫結
import AppLayout from '@/layouts/AppLayout/AppLayout.vue'
import { useDashboardView } from './DashboardView.js'

const {
  route,
  pieCanvas,
  lineCanvas,
  barCanvas,
  beginTime,
  endTime,
  targetTime,
  targetCount,
  searchSpec,
  activatedCount,
  revokedCount,
  growthVisible,
  growthText,
  growthUp,
  pageTitle,
  _g_dashboard_request_controller,
  allCanvases,
  showNoDataMessage,
  SelectDeviceSpec003,
  processLastYearData,
  updateTargetAndPrediction,
  ExportDeviceSpec003,
  t,
  emitter,
} = useDashboardView()
</script>

<style src="./DashboardView.css"></style>
