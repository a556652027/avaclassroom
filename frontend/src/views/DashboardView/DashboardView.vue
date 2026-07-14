<template>
  <AppLayout>
    <div class="page">
      <!-- 頁面標題區域 -->
      <div
        class="dashboard-header"
        style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: flex-start"
      >
        <div style="display: flex">
          <div class="page-icon-container">
            <img src="/assets/images/IdentificationBadge.svg" alt="" />
          </div>
          <!-- 標題顯示組織名稱，點擊可編輯組織 (原 lib.title.groupcid + addOrganizationEditClickToTitle) -->
          <h1
            class="dashboard-title"
            style="cursor: pointer; user-select: none"
            :title="t('organization.tooltip_edit_org')"
            @click="emitter.emit('org-edit-modal:show')"
          >
            {{ pageTitle }}
          </h1>
        </div>
        <div style="display: flex">
          <img src="/assets/images/Group (1).svg" alt="" style="width: 120px; margin-right: 2rem" class="page-big-icon" />
          <!-- 統計卡片區域 -->
          <div
            class="stats-card-container"
            style="
              background-color: #e6f1fd;
              display: flex;
              width: fit-content;
              align-items: flex-end;
              border-radius: 16px;
              padding: 1rem 1.5rem;
              gap: 1.5rem;
              flex-wrap: wrap;
            "
          >
            <div class="stats-cards" style="display: flex; gap: 1rem">
              <div class="stat-card" style="display: flex; flex-direction: column; border-radius: 8px; min-width: 120px">
                <label style="margin-bottom: 0.5rem; font-size: 0.9rem; color: #404040; white-space: nowrap">{{
                  t('dashboard.device_activated_count')
                }}</label>
                <div style="display: flex; align-items: center; gap: 1rem; height: 44px">
                  <div style="font-weight: bold; font-size: 1.75rem; color: #1c1c1c; min-width: 60px">
                    {{ activatedCount }}
                  </div>
                  <div
                    v-show="growthVisible"
                    style="
                      font-size: 14px;
                      color: #1c1c1c;
                      font-weight: 400;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      gap: 0.5rem;
                    "
                  >
                    <span style="min-width: 50px; text-align: right">{{ growthText }}</span>
                    <img :src="growthUp ? '/assets/images/up.svg' : '/assets/images/down.svg'" alt="" />
                  </div>
                </div>
              </div>
              <div class="stat-card" style="display: flex; flex-direction: column">
                <label style="margin-bottom: 0.5rem; font-size: 0.9rem; color: #404040; white-space: nowrap">{{
                  t('dashboard.device_revoked_count')
                }}</label>
                <div style="display: flex; align-items: center; height: 44px">
                  <div style="font-weight: bold; font-size: 1.75rem; color: #1c1c1c; min-width: 60px">
                    {{ revokedCount }}
                  </div>
                </div>
              </div>
            </div>
            <!-- 時間選擇器區域 -->
            <div class="search_time" style="display: flex; gap: 0.5rem; align-items: flex-end">
              <div style="display: flex; flex-direction: column">
                <label style="margin-bottom: 0.5rem; font-size: 0.9rem; color: #404040">
                  {{ t('dashboard.search_date_start') }}
                </label>
                <input v-model="beginTime" type="date" required class="dash-date-input" />
              </div>
              <div style="display: flex; flex-direction: column">
                <label style="margin-bottom: 0.5rem; font-size: 0.9rem; color: #404040">
                  {{ t('dashboard.search_date_end') }}
                </label>
                <input v-model="endTime" type="date" required class="dash-date-input" />
              </div>
              <button class="dash-date-search-btn" @click="SelectDeviceSpec003()">
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
            <canvas ref="barCanvas" style="display: block; width: 100%; height: 100%; position: relative; z-index: 1"></canvas>
          </div>
          <!-- 圓餅圖（右側）-->
          <div class="dashboard-chart-box chart-right">
            <canvas ref="pieCanvas" style="display: block; width: 100%; height: 100%; position: relative; z-index: 1"></canvas>
          </div>
        </div>

        <div style="height: 0.5rem"></div>

        <!-- 折線圖（下方全寬）+ 匯出按鈕 -->
        <div style="position: relative; background-color: #f7f8f9; border-radius: 16px; padding: 1rem; padding-top: 1.5rem">
          <button class="dash-export-btn" @click="ExportDeviceSpec003">
            <img src="/assets/images/download_excel.svg" alt="" />
          </button>
          <canvas
            ref="lineCanvas"
            height="240"
            style="display: block; margin: 0 auto; position: relative; z-index: 1; width: 100%; max-height: 240px"
          ></canvas>
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
