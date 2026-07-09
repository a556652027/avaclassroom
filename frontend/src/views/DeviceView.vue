<template>
  <AppLayout>
    <div class="device-page">
      <!-- _________________________________________________________________-->
      <!-- 第一頁 設備列表 (原 page01) -->
      <div v-show="page === 'list'" class="page" style="display: block">
        <div class="page-caption" style="display: flex">
          <div class="page-icon-container" style="margin-right: 10px">
            <img src="/assets/images/IdentificationBadge.svg" alt="" class="page-icon" />
          </div>
          <h1 id="device-title" style="margin-top: 3px">{{ groupTitle }}</h1>
        </div>

        <div class="responsive-toolbar">
          <!-- 左邊 -->
          <div class="responsive-toolbar-group">
            <input id="selectAll" v-model="selectAll" type="checkbox" @change="toggleSelectAll" />
            <label for="selectAll" style="display: flex; align-items: center; font-size: 14px; color: #374151; cursor: pointer; margin-right: 8px">{{
              t('common.select_all')
            }}</label>
            <button
              id="device-download-button"
              type="button"
              class="device-round-btn"
              style="border: 1px solid #92bfff"
              @click="downloadSelectedDevicesExcel"
              @mouseenter="downloadHover = true"
              @mouseleave="downloadHover = false"
            >
              <img
                :src="downloadHover ? '/assets/images/dowload_button_change.png' : '/assets/images/download.svg'"
                alt="下載"
                style="width: 20px; height: 20px"
              />
            </button>
            <button
              id="device-download-all-button"
              type="button"
              class="device-round-btn"
              style="border: 1px solid #92bfff"
              title="匯出全部"
              @click="downloadAllDevices"
              @mouseenter="downloadAllHover = true"
              @mouseleave="downloadAllHover = false"
            >
              <img
                :src="downloadAllHover ? '/assets/images/download_all_white.svg' : '/assets/images/download_all_light_blue.svg'"
                alt="匯出全部"
                style="width: 20px; height: 20px; object-fit: contain"
              />
            </button>
            <button
              v-if="!isDistributor"
              id="device_list-button-delete"
              type="button"
              class="device-round-btn"
              style="border: 1px solid #de6565; margin-right: 12px"
              @click="DeleteSelectedDevices"
            >
              <img src="/assets/images/trash.svg" alt="刪除" />
            </button>
            <a
              v-if="!isDistributor"
              href="javascript:void(0)"
              style="color: #de6565; text-decoration: underline #de6565; cursor: pointer; display: flex; align-items: center"
              @click="GotoPageRevokedDevices"
              >{{ t('device.revoked_items') }}<img src="/assets/images/revoke_red.png" alt="" style="width: 20px; height: 20px" /></a>
          </div>

          <!-- 右邊 -->
          <div class="responsive-toolbar-group" style="align-items: flex-end">
            <div style="display: flex; flex-direction: column">
              <label style="font-size: 12px; color: #666; margin-bottom: 2px">{{ t('device.search_date_start') }}</label>
              <input v-model="beginTime" type="date" class="device-date-input" title="選擇開始日期" />
            </div>
            <div style="display: flex; flex-direction: column">
              <label style="font-size: 12px; color: #666; margin-bottom: 2px">{{ t('device.search_date_end') }}</label>
              <input v-model="endTime" type="date" class="device-date-input" title="選擇結束日期" />
            </div>
            <button
              id="device_list-button-date_search"
              type="button"
              style="margin-left: 8px; height: 38px; padding: 0 12px; border-radius: 10px; border: 1px solid #ddd; background: #fff; cursor: pointer"
              @click="onDateSearch"
            >
              {{ t('device.search_confirm') }}
            </button>
            <div class="search-box" style="height: 38px">
              <svg class="search-box-icon" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M13.293 14.707a8 8 0 111.414-1.414l4.586 4.586a1 1 0 01-1.414 1.414l-4.586-4.586zM8 14a6 6 0 100-12 6 6 0 000 12z"
                  clip-rule="evenodd"
                />
              </svg>
              <input
                v-model="searchKeyword"
                type="search"
                :placeholder="t('common.search')"
                class="search-box-input"
                autocomplete="off"
                @input="handleSearchInput"
              />
            </div>
          </div>
        </div>

        <div>
          <div class="viewpoint-container">
            <table class="responstable">
              <thead>
                <tr>
                  <th style="width: 5%"></th>
                  <th v-for="col in listColumns" :key="col.field" style="cursor: pointer" @click="sortDeviceTable(col.field)">
                    {{ col.label() }}
                    <img
                      src="/assets/images/sort_up.svg"
                      alt=""
                      class="sort-icon"
                      :style="sortIconStyle(col.field, currentSortField, currentSortOrder)"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in deviceRows" :key="row.device_cid" :style="row.record_state === '0' ? { backgroundColor: '#d6d6d6ff' } : {}">
                  <td><input v-model="row.checked" type="checkbox" class="row-checkbox" /></td>
                  <td>{{ row.create_time }}</td>
                  <td>{{ row.spec04 }}</td>
                  <td>{{ row.device_cid }}</td>
                  <td>{{ row.license_key }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="centered-content">
            <TablePagination
              :total-records="totalRecords"
              :rows-per-page="rowsPerPage"
              :current-page="currentPage"
              @change="(p) => SelectDeviceAll({ page: p, keepFilters: true })"
            />
          </div>
        </div>
      </div>

      <!-- 第二頁 設備修改 (原 page02) -->
      <div v-show="page === 'update'" class="page" style="display: block">
        <div class="page-caption">
          <h1>{{ t('device.title_update_device') }}</h1>
        </div>
        <div>
          <table class="frame-table">
            <tr>
              <td colspan="10"></td>
              <td colspan="1">
                <button type="button" class="image_button_default" @click="GotoPageSelectDeviceAll">
                  <i class="iconfont">&#xe788;&nbsp;</i>
                  {{ t('common.cancel') }}
                </button>
              </td>
              <td colspan="1">
                <button type="button" class="image_button_default" @click="UpdateDeviceOne">
                  <i class="iconfont">&#xe786;&nbsp;</i>
                  {{ t('common.update') }}
                </button>
              </td>
            </tr>
            <tr>
              <td colspan="4">
                <label class="label-style-default">{{ t('device.device_cid') }}</label>
                <input v-model="updateForm.device_cid" type="text" :placeholder="t('device.device_cid_hint')" disabled />
              </td>
              <td colspan="4">
                <label class="label-style-default">{{ t('device.product_type') }}</label>
                <input v-model="updateForm.product_type" type="text" :placeholder="t('device.product_type_hint')" disabled />
              </td>
              <td colspan="4">
                <label class="label-style-default">{{ t('device.device_state') }}</label>
                <div class="styled-select blue rounded">
                  <select v-model="updateForm.record_state">
                    <option value="1">{{ t('common.open') }}</option>
                    <option value="0">{{ t('common.close') }}</option>
                    <option value="-1">{{ t('common.Revoke') }}</option>
                  </select>
                </div>
              </td>
            </tr>
            <tr>
              <td colspan="6">
                <label class="label-style-default">{{ t('common.create_time') }}</label>
                <input v-model="updateForm.create_time" type="text" :placeholder="t('common.create_time')" disabled />
              </td>
              <td colspan="6">
                <label class="label-style-default">{{ t('device.active_time') }}</label>
                <input v-model="updateForm.active_time" type="text" :placeholder="t('device.active_time')" disabled />
              </td>
            </tr>
            <tr>
              <td colspan="4">
                <label class="label-style-default">{{ t('device.owner_type') }}</label>
                <input v-model="updateForm.owner_type" type="text" :placeholder="t('device.owner_type')" disabled />
              </td>
              <td colspan="4">
                <label class="label-style-default">{{ t('common.owner_cid') }}</label>
                <input v-model="updateForm.owner_cid" type="text" :placeholder="t('device.owner_cid_hint')" disabled />
              </td>
              <td colspan="4">
                <label class="label-style-default">{{ t('common.agent_cid') }}</label>
                <input v-model="updateForm.agent_cid" type="text" :placeholder="t('device.agent_cid_hint')" disabled />
              </td>
            </tr>
            <tr>
              <td colspan="12">
                <label class="label-style-default">{{ t('common.license_Key') }}</label>
                <input v-model="updateForm.license_key" type="text" :placeholder="t('common.license_Key')" disabled />
              </td>
            </tr>
            <tr>
              <td colspan="4">
                <label class="label-style-default">{{ t('common_order_info.customer_name') }}</label>
                <input v-model="updateForm.customer_name" type="text" />
              </td>
              <td colspan="4">
                <label class="label-style-default">{{ t('common_order_info.customer_gender') }}</label>
                <input v-model="updateForm.customer_gender" type="text" />
              </td>
              <td colspan="4">
                <label class="label-style-default">{{ t('common_order_info.customer_birthday') }}</label>
                <input v-model="updateForm.customer_birthday" type="date" />
              </td>
            </tr>
            <tr>
              <td colspan="6">
                <label class="label-style-default">{{ t('common_order_info.customer_phone') }}</label>
                <input v-model="updateForm.customer_phone" type="text" />
              </td>
              <td colspan="6">
                <label class="label-style-default">{{ t('common_order_info.customer_postalcode') }}</label>
                <input v-model="updateForm.customer_postalcode" type="text" />
              </td>
            </tr>
            <tr>
              <td colspan="6">
                <label class="label-style-default">{{ t('common_order_info.customer_address') }}</label>
                <input v-model="updateForm.customer_address" type="text" />
              </td>
              <td colspan="6">
                <label class="label-style-default">{{ t('common_order_info.customer_email') }}</label>
                <input v-model="updateForm.customer_email" type="text" />
              </td>
            </tr>
            <tr v-for="pair in specPairs" :key="pair[0]">
              <td colspan="6">
                <label class="label-style-default">{{ t('device.' + pair[0]) }}</label>
                <input v-model="updateForm[pair[0]]" type="text" :placeholder="t('device.' + pair[0] + '_hint')" />
              </td>
              <td colspan="6">
                <label class="label-style-default">{{ t('device.' + pair[1]) }}</label>
                <input v-model="updateForm[pair[1]]" type="text" :placeholder="t('device.' + pair[1] + '_hint')" />
              </td>
            </tr>
            <tr>
              <td colspan="12">
                <label class="label-style-default">{{ t('common.note00') }}</label>
                <input v-model="updateForm.note00" type="text" :placeholder="t('common.note00_hint')" />
              </td>
            </tr>
          </table>
        </div>
      </div>

      <!-- 第四頁 設備紀錄 (原 page04) -->
      <div v-show="page === 'history'" class="page" style="display: block">
        <div class="page-caption">
          <h1>{{ t('device.title_history_device') }}</h1>
        </div>
        <div>
          <table class="frame-table">
            <tr>
              <td colspan="1">
                <div>{{ historyDeviceCid }}</div>
              </td>
              <td colspan="6"></td>
              <td colspan="1">
                <label class="label-style-default">{{ t('common.search_begin_time') }}</label>
                <input v-model="historyBeginTime" type="date" required />
              </td>
              <td colspan="1">~</td>
              <td colspan="1">
                <label class="label-style-default">{{ t('common.search_end_time') }}</label>
                <input v-model="historyEndTime" type="date" required />
              </td>
              <td colspan="1">
                <button type="button" class="image_button_default" @click="SelectHistoryAll(historyDeviceCid)">
                  <i class="iconfont">&#xe778;&nbsp;</i>
                  {{ t('common.search') }}
                </button>
              </td>
              <td colspan="1">
                <button type="button" class="image_button_default" @click="GotoPageSelectDeviceAll">
                  <i class="iconfont">&#xe788;&nbsp;</i>
                  {{ t('common.cancel') }}
                </button>
              </td>
            </tr>
            <tr>
              <td colspan="12">
                <div class="viewpoint-container">
                  <table class="responstable">
                    <thead>
                      <tr>
                        <th>{{ t('common.create_time') }}</th>
                        <th>{{ t('common.event_type') }}</th>
                        <th>{{ t('common.label') }}</th>
                        <th>{{ t('common.content') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, i) in historyRows" :key="i">
                        <td v-for="(cell, j) in row" :key="j">{{ cell }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
            <tr>
              <td colspan="12">
                <TablePagination
                  :total-records="historyTotal"
                  :rows-per-page="rowsPerPage"
                  :current-page="historyPage"
                  @change="onHistoryPageChange"
                />
              </td>
            </tr>
          </table>
        </div>
      </div>

      <!-- 第五頁 已撤銷設備列表 (原 page05) -->
      <div v-show="page === 'revoked'" class="page" style="display: block">
        <div class="page-caption" style="display: flex">
          <div class="page-icon-container" style="margin-right: 10px">
            <img src="/assets/images/IdentificationBadge.svg" alt="" class="page-icon" />
          </div>
          <h1 style="margin-top: 3px">{{ t('device.revoked_device_title') }}</h1>
        </div>

        <div class="responsive-toolbar">
          <div class="responsive-toolbar-group">
            <input id="selectAllRevoked" v-model="selectAllRevoked" type="checkbox" @change="toggleSelectAllRevoked" />
            <label for="selectAllRevoked" style="display: flex; align-items: center; font-size: 14px; color: #374151; cursor: pointer; margin-right: 8px">{{
              t('common.select_all')
            }}</label>
            <button
              id="device_revoked-button-restore"
              type="button"
              class="device-round-btn"
              style="border: 1px solid #92bfff; margin-right: 12px"
              @click="RestoreSelectedDevices"
              @mouseenter="restoreHover = true"
              @mouseleave="restoreHover = false"
            >
              <img
                :src="restoreHover ? '/assets/images/revoke_recover.png' : '/assets/images/revoke_reback.png'"
                alt="恢復"
                style="width: 20px"
              />
            </button>
            <p
              style="height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; text-decoration: underline; color: #92bfff"
              @click="GotoPageSelectDeviceAll"
            >
              <img src="/assets/images/revoke_back_blue.png" alt="" style="width: 20px; height: 20px" />
              {{ t('device.back_to_list') }}
            </p>
          </div>

          <div class="responsive-toolbar-group">
            <div class="search-box">
              <svg class="search-box-icon" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M13.293 14.707a8 8 0 111.414-1.414l4.586 4.586a1 1 0 01-1.414 1.414l-4.586-4.586zM8 14a6 6 0 100-12 6 6 0 000 12z"
                  clip-rule="evenodd"
                />
              </svg>
              <input
                v-model="revokedSearchKeyword"
                type="search"
                :placeholder="t('common.search')"
                class="search-box-input"
                @input="searchRevokedDevices"
              />
            </div>
          </div>
        </div>

        <div>
          <div class="viewpoint-container">
            <table class="responstable">
              <thead>
                <tr>
                  <th style="width: 5%"></th>
                  <th v-for="col in listColumns" :key="col.field" style="cursor: pointer" @click="sortRevokedDeviceTable(col.field)">
                    {{ col.label() }}
                    <img
                      src="/assets/images/sort_up.svg"
                      alt=""
                      class="sort-icon"
                      :style="sortIconStyle(col.field, currentRevokedSortField, currentRevokedSortOrder)"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in revokedRows" :key="row.device_cid" style="background-color: #d6d6d6ff">
                  <td><input v-model="row.checked" type="checkbox" class="row-checkbox-revoked" /></td>
                  <td>{{ row.create_time }}</td>
                  <td>{{ row.spec04 }}</td>
                  <td>{{ row.device_cid }}</td>
                  <td>{{ row.license_key }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="centered-content">
            <TablePagination
              :total-records="revokedTotal"
              :rows-per-page="rowsPerPage"
              :current-page="revokedCurrentPage"
              @change="(p) => SelectRevokedDevices({ page: p, keepFilters: true })"
            />
          </div>
        </div>
      </div>

      <!-- 刪除確認 Modal (原 delete-confirmation-modal) -->
      <div
        v-if="deleteModalVisible"
        style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 1000; justify-content: center; align-items: center"
      >
        <div style="background: white; border-radius: 12px; padding: 24px; max-width: 500px; width: 90%; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1)">
          <div style="display: flex; align-items: center; padding-bottom: 16px">
            <div style="width: 40px; height: 40px; justify-content: center; align-items: center; display: flex">
              <img src="/assets/images/device_delete.svg" alt="" />
            </div>
            <div>
              <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827">
                {{ t('device.confirm_revoke_msg') }}
              </h3>
            </div>
          </div>
          <div style="margin-bottom: 24px">
            <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.5">{{ deleteModalMessage }}</p>
            <div style="margin-top: 12px; max-height: 200px; overflow-y: auto; background: #f9fafb; border-radius: 6px; padding: 12px">
              <div v-for="cid in deleteModalItems" :key="cid" style="padding: 4px 0">{{ cid }}</div>
            </div>
          </div>
          <div style="display: flex; gap: 12px; justify-content: flex-end">
            <button class="delete-modal-cancel" @click="deleteModalVisible = false">
              {{ t('common.cancel') }}
            </button>
            <button class="delete-modal-confirm" @click="confirmDelete">
              {{ t('common.update') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
// 原 views/app.view.device.js (查詢/排序/分頁/匯出/刪除/恢復/歷史紀錄流程逐步保留)
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import TablePagination from '@/components/TablePagination.vue'
import { t, getLocalData, tf, localeData } from '@/locales'
import { apiCall, IsValidString, TablesiToTableii } from '@/core/util'
import { VisibleLoaderElement } from '@/core/loader'
import { getGroupDisplayName } from '@/core/title'
import { changePage } from '@/core/navigation'
import { DateAdd } from '@/core/time'
import { runExportJob } from '@/services/exportJob'
import {
  DeviceData,
  CsRequestDeviceSelectAllRecords,
  CsRequestDeviceSelectOneRecord,
  CsRequestDeviceUpdateOneRecord,
  CsRequestDeviceExportStart,
  CsRequestDeviceExportStatus,
  CsRequestDeviceExportDownload,
} from '@/api/device'
import {
  CsRequestHistorySelectAllCount,
  CsRequestHistorySelectAllRecords,
} from '@/api/history'

// condition_type 17: agent_cid + owner_cid + record_state + product_type + spec04
const CONDITION_TYPE_DEVICE = '17'
// 歷史紀錄查詢條件 (原 search_condition_type_by_subject_cid)
const CONDITION_TYPE_HISTORY = 'by_subject_cid'

const rowsPerPage = 10 // 原 def_rows_per_page

const page = ref('list')
const groupTitle = computed(() => getGroupDisplayName() || t('device.title_list_device'))

const userTier = window.sessionStorage.getItem('tier')
const isDistributor = userTier === '3'

// 列表狀態
const deviceRows = ref([])
const totalRecords = ref(0)
const currentPage = ref(1)
const currentSortField = ref('create_time')
const currentSortOrder = ref('desc')
const searchKeyword = ref('')
const beginTime = ref('')
const endTime = ref('')
const selectAll = ref(false)

// 已撤銷列表狀態
const revokedRows = ref([])
const revokedTotal = ref(0)
const revokedCurrentPage = ref(1)
const currentRevokedSortField = ref('')
const currentRevokedSortOrder = ref('asc')
const revokedSearchKeyword = ref('')
const selectAllRevoked = ref(false)

// 編輯表單
const updateForm = reactive({ ...DeviceData })
const specPairs = [
  ['spec00', 'spec01'],
  ['spec02', 'spec03'],
  ['spec04', 'spec05'],
  ['spec06', 'spec07'],
]

// 歷史紀錄
const historyDeviceCid = ref('')
const historyBeginTime = ref('')
const historyEndTime = ref('')
const historyRows = ref([])
const historyTotal = ref(0)
const historyPage = ref(1)

// 刪除確認 Modal
const deleteModalVisible = ref(false)
const deleteModalMessage = ref('')
const deleteModalItems = ref([])

// hover 圖片切換
const downloadHover = ref(false)
const downloadAllHover = ref(false)
const restoreHover = ref(false)

const listColumns = [
  { field: 'create_time', label: () => t('common.create_time') },
  { field: 'spec04', label: () => t('device.spec04') },
  { field: 'device_cid', label: () => t('device.device_cid') },
  { field: 'license_key', label: () => t('common.license_Key') },
]

let _g_device_request_controller = null
let _g_history_request_controller = null
let searchTimeout = null
let revokedSearchTimeout = null

//_____________________________________________________________________________________
// 工具

function sortIconStyle(field, activeField, order) {
  return field === activeField
    ? { transform: order === 'asc' ? 'rotate(0deg)' : 'rotate(180deg)', opacity: 1 }
    : { transform: 'rotate(0deg)', opacity: 0.5 }
}

// 直欄式資料轉為列物件陣列 (供 v-for 渲染)
function tablesiToRows(json_tablesi) {
  if (!json_tablesi || !json_tablesi.device_cid) return []
  const count = json_tablesi.device_cid.length
  const rows = []
  for (let i = 0; i < count; i++) {
    rows.push({
      checked: false,
      create_time: json_tablesi.create_time ? json_tablesi.create_time[i] : '',
      spec04: json_tablesi.spec04 ? json_tablesi.spec04[i] : '',
      device_cid: json_tablesi.device_cid[i] || '',
      license_key: json_tablesi.license_key ? json_tablesi.license_key[i] : '',
      record_state: json_tablesi.record_state ? json_tablesi.record_state[i] : '1',
    })
  }
  return rows
}

// 標準化日期 (原邏輯：斜線轉橫線、補時分秒)
function normalizeTimeRange(b, e) {
  let b_time = b || ''
  let e_time = e || ''
  if (b_time) b_time = b_time.replace(/\//g, '-')
  if (e_time) e_time = e_time.replace(/\//g, '-')
  if (b_time && b_time.length === 10) b_time += ' 00:00:00'
  if (e_time && e_time.length === 10) e_time += ' 23:59:59'
  return [b_time, e_time]
}

// 查詢條件 (原邏輯：經銷商查旗下所有 Agent，管理員依 Member ID；撤銷列表固定 %%)
function buildConditionValue(recordState) {
  const member_cid = window.sessionStorage.getItem('member_cid') || ''
  const group_cid =
    window.sessionStorage.getItem('select_group_cid') ||
    window.sessionStorage.getItem('group_cid') ||
    ''
  const product_type = window.sessionStorage.getItem('product_type') || ''
  return isDistributor || recordState === '0'
    ? `%%; ${group_cid}; ${recordState}; ${product_type}; %%`
    : `${member_cid}; ${group_cid}; ${recordState}; ${product_type}; %%`
}

// 顯示自動消失的提示訊息 (原 showToast)
function showToast(message) {
  const toast = document.createElement('div')
  toast.textContent = message
  toast.style.cssText =
    'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(0, 0, 0, 0.8); color: white; padding: 20px 40px; border-radius: 8px; z-index: 10000; font-size: 16px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2);'
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.transition = 'opacity 0.5s ease'
    toast.style.opacity = '0'
    setTimeout(() => {
      if (document.body.contains(toast)) document.body.removeChild(toast)
    }, 500)
  }, 3000)
}

//_____________________________________________________________________________________
// 主列表查詢 (原 SelectDeviceAll: 後端分頁)
async function SelectDeviceAll(options = {}) {
  const { page: targetPage = 1, keepFilters = false } = options
  currentPage.value = keepFilters ? targetPage : 1

  const offset = (currentPage.value - 1) * rowsPerPage
  const condition_value = buildConditionValue('1')
  const [b_time, e_time] = normalizeTimeRange(beginTime.value, endTime.value)

  console.log('Device Search Params:', { condition_value, b_time, e_time })
  VisibleLoaderElement(true)

  if (_g_device_request_controller) _g_device_request_controller.abort()
  _g_device_request_controller = new AbortController()

  try {
    const json_object = await apiCall(
      CsRequestDeviceSelectAllRecords,
      CONDITION_TYPE_DEVICE,
      condition_value,
      b_time,
      e_time,
      offset,
      rowsPerPage,
      searchKeyword.value || '',
      currentSortField.value,
      currentSortOrder.value,
      _g_device_request_controller,
    )

    deviceRows.value = tablesiToRows(json_object.records)
    totalRecords.value = parseInt(json_object.total_records) || 0
    selectAll.value = false
  } catch (e) {
    if (e.name === 'AbortError') {
      console.log('Device SelectAll request aborted')
      return
    }
    if (e.message !== 'Handled Server Error') {
      console.error(e)
      showToast(getLocalData('device.msg_read_failed_net') || '資料讀取失敗，請檢查網路連線')
    }
  } finally {
    VisibleLoaderElement(false)
  }
}

// 搜尋防抖動 (原 handleSearchInput，1 秒)
function handleSearchInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    SelectDeviceAll({ page: 1 })
  }, 1000)
}

// 日期搜尋 (原 date_search 按鈕：記憶日期並重設第一頁)
function onDateSearch() {
  console.log('日期搜尋按鈕點擊')
  sessionStorage.setItem('dashboard_begin_time', beginTime.value)
  sessionStorage.setItem('dashboard_end_time', endTime.value)
  SelectDeviceAll({ page: 1 })
}

// 排序 (原 sortDeviceTable)
function sortDeviceTable(field) {
  if (currentSortField.value === field) {
    currentSortOrder.value = currentSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    currentSortField.value = field
    currentSortOrder.value = 'asc'
  }
  SelectDeviceAll({ page: 1 })
}

function toggleSelectAll() {
  deviceRows.value.forEach((row) => (row.checked = selectAll.value))
}

async function GotoPageSelectDeviceAll() {
  await SelectDeviceAll()
  page.value = 'list'
}

//_____________________________________________________________________________________
// 匯出選取 (原 downloadSelectedDevicesExcel: 逐筆取回詳細資料後生成 Excel，並行上限 3)
async function downloadSelectedDevicesExcel() {
  const deviceCids = deviceRows.value.filter((r) => r.checked).map((r) => r.device_cid)

  if (deviceCids.length === 0) {
    alert(getLocalData('device.msg_select_export') || '請選擇要匯出的設備')
    return
  }

  console.log('[downloadSelectedDevicesExcel] 準備匯出', deviceCids.length, '個設備的 Excel')
  VisibleLoaderElement(true)

  try {
    const fetchDevicePromise = async (deviceCid) => {
      try {
        const json_object = await apiCall(CsRequestDeviceSelectOneRecord, deviceCid)
        if (json_object.records) {
          if (!json_object.records.device_cid) {
            json_object.records.device_cid = [deviceCid]
          }
          return json_object.records
        }
      } catch (e) {
        console.error(`解析設備 ${deviceCid} 失敗:`, e)
      }
      return null
    }

    // 限制並行請求數量 (原 CONCURRENCY_LIMIT = 3，分批執行)
    const CONCURRENCY_LIMIT = 3
    const chunkArray = (array, size) => {
      const result = []
      for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size))
      }
      return result
    }

    let allDevices = []
    for (const chunk of chunkArray(deviceCids, CONCURRENCY_LIMIT)) {
      const chunkResults = await Promise.all(chunk.map(fetchDevicePromise))
      allDevices = allDevices.concat(chunkResults.filter((r) => r !== null))
    }

    if (allDevices.length > 0) {
      console.log('[downloadSelectedDevicesExcel] 開始生成整合 Excel 檔案')
      await generateDevicesExcel(allDevices)
      if (allDevices.length === deviceCids.length) {
        showToast(tf('device.msg_export_success', { count: allDevices.length }))
      } else {
        alert(
          tf('device.msg_export_partial', {
            total: deviceCids.length,
            success: allDevices.length,
            failed: deviceCids.length - allDevices.length,
          }),
        )
      }
    } else {
      alert(getLocalData('device.msg_cannot_get_data') || '無法獲取設備資料')
    }
  } catch (err) {
    console.error('匯出過程發生錯誤:', err)
    alert(getLocalData('device.msg_export_failed') || '匯出失敗，請稍後再試')
  } finally {
    VisibleLoaderElement(false)
  }
}

// 生成設備資料的 Excel (原 generateDevicesExcel，欄位/欄寬/檔名格式不變，改用打包內建 exceljs)
async function generateDevicesExcel(devicesList) {
  console.log('[generateDevicesExcel] 開始生成 Excel，筆數:', devicesList.length)

  const { default: ExcelJS } = await import('exceljs')
  const { default: saveAs } = await import('file-saver')

  const L = localeData.value
  const headers = [
    L.device.device_cid,
    L.common.create_time,
    L.device.active_time,
    L.common.product_type,
    L.common.license_Key,
    L.member.record_state,
    'Spec00',
    'Spec01',
    'Spec02',
    'Spec03',
    'Spec04',
    'Spec05',
    'Spec06',
    'Spec07',
    L.common.note00,
  ]

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('設備列表')
  worksheet.addRow(headers)

  devicesList.forEach((device) => {
    worksheet.addRow([
      (device.device_cid && device.device_cid[0]) || '',
      (device.create_time && device.create_time[0]) || '',
      (device.active_time && device.active_time[0]) || '',
      (device.product_type && device.product_type[0]) || '',
      (device.license_key && device.license_key[0]) || '',
      device.record_state && device.record_state[0] === '1'
        ? L.device.status_on
        : L.device.status_off,
      (device.spec00 && device.spec00[0]) || '',
      (device.spec01 && device.spec01[0]) || '',
      (device.spec02 && device.spec02[0]) || '',
      (device.spec03 && device.spec03[0]) || '',
      (device.spec04 && device.spec04[0]) || '',
      (device.spec05 && device.spec05[0]) || '',
      (device.spec06 && device.spec06[0]) || '',
      (device.spec07 && device.spec07[0]) || '',
      (device.note00 && device.note00[0]) || '',
    ])
  })

  // 設定欄寬 (與原版一致)
  const widths = [20, 20, 20, 15, 30, 10, 10, 10, 10, 10, 10, 10, 10, 10, 30]
  worksheet.columns.forEach((col, i) => {
    col.width = widths[i]
  })

  const date = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const fileName = `${L.common.export_filename_device}_${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}.xlsx`

  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buffer]), fileName)

  console.log('[generateDevicesExcel] Excel 檔案已生成:', fileName)
}

// 匯出全部 (原 downloadAllDevices: 非同步任務 + 進度輪詢)
function downloadAllDevices() {
  const condition_value = buildConditionValue('1')
  const [b_time, e_time] = normalizeTimeRange(beginTime.value, endTime.value)

  runExportJob({
    overlayId: 'device-export-overlay',
    startExport: (controller) =>
      apiCall(
        CsRequestDeviceExportStart,
        CONDITION_TYPE_DEVICE,
        condition_value,
        b_time,
        e_time,
        searchKeyword.value || '',
        currentSortField.value,
        currentSortOrder.value,
        controller,
      ),
    queryStatus: (jobId, controller) => apiCall(CsRequestDeviceExportStatus, jobId, controller),
    download: CsRequestDeviceExportDownload,
    fileNamePrefix: localeData.value.common.export_filename_device,
    onError: () => alert(getLocalData('device.msg_exec_error') || '匯出失敗'),
  })
}

//_____________________________________________________________________________________
// 批量刪除 (原 DeleteSelectedDevices)
function DeleteSelectedDevices() {
  // [資安防護 - BAC 越權攔截] 預設拒絕：Tier >= 3 (如經銷商) 禁止刪除設備
  const tier = parseInt(window.sessionStorage.getItem('tier'), 10)
  if (isNaN(tier) || tier >= 3) {
    alert(getLocalData('common.deny') || '權限不足，無法執行此操作。')
    return
  }

  const checkedRows = deviceRows.value.filter((r) => r.checked)
  if (checkedRows.length === 0) {
    alert(getLocalData('device.msg_select_delete') || '請選擇要刪除的設備')
    return
  }

  deleteModalMessage.value = tf('device.msg_confirm_delete', { count: checkedRows.length })
  deleteModalItems.value = checkedRows.map((r) => r.device_cid)
  deleteModalVisible.value = true
}

function confirmDelete() {
  deleteModalVisible.value = false
  executeDeleteDeviceLogic(deviceRows.value.filter((r) => r.checked))
}

// 執行實際的刪除邏輯 (原 executeDeleteDeviceLogic: 取回完整資料 → record_state=0 → 更新)
async function executeDeleteDeviceLogic(checkedRows) {
  VisibleLoaderElement(true)

  let successCount = 0
  let errorCount = 0

  try {
    for (const row of checkedRows) {
      const deviceCid = row.device_cid
      if (!deviceCid) {
        console.error('[executeDeleteDeviceLogic] 無法獲取設備ID')
        errorCount++
        continue
      }

      try {
        console.log(`[executeDeleteDeviceLogic] Fetching from API for device: ${deviceCid}`)
        const json_object = await apiCall(CsRequestDeviceSelectOneRecord, deviceCid)
        const record = json_object.records

        if (!record) {
          console.error(`[executeDeleteDeviceLogic] Fetched data for device_cid: ${deviceCid} is empty.`)
          errorCount++
          continue
        }

        // 檢查設備是否已經被刪除
        const currentRecordState = record.record_state ? record.record_state[0] : '1'
        if (currentRecordState === '0') {
          console.log(`[executeDeleteDeviceLogic] Device already deleted: ${deviceCid}`)
          successCount++
          continue
        }

        await apiCall(CsRequestDeviceUpdateOneRecord, buildDeviceDataFromRecord(record, deviceCid, '0'))
        console.log(`[executeDeleteDeviceLogic] Successfully deleted device: ${deviceCid}`)
        successCount++
      } catch (e) {
        if (e.message !== 'Handled Server Error') {
          console.error(`[executeDeleteDeviceLogic] Error processing device ${deviceCid}:`, e)
        }
        errorCount++
      }
    }

    alert(tf('device.msg_delete_result', { success: successCount, failed: errorCount }))
    if (successCount > 0) {
      SelectDeviceAll() // 重新載入設備列表
    }
  } catch (err) {
    console.error('批量刪除過程發生嚴重錯誤:', err)
    alert(getLocalData('device.msg_exec_error') || '執行過程中發生錯誤，請重新整理頁面檢查')
  } finally {
    VisibleLoaderElement(false)
  }
}

// 準備完整的設備資料對象 (原 delete/restore 共用的欄位複製，僅 record_state 不同)
function buildDeviceDataFromRecord(record, deviceCid, recordState) {
  const first = (key) => (record[key] ? record[key][0] : '')
  const deviceData = Object.create(DeviceData)
  deviceData.device_cid = first('device_cid') || deviceCid
  deviceData.product_type = first('product_type')
  deviceData.create_time = first('create_time')
  deviceData.record_state = recordState
  deviceData.active_time = first('active_time')
  deviceData.owner_type = first('owner_type')
  deviceData.owner_cid = first('owner_cid')
  deviceData.agent_cid = first('agent_cid')
  deviceData.license_key = first('license_key')
  deviceData.customer_name = first('customer_name')
  deviceData.customer_gender = first('customer_gender')
  deviceData.customer_birthday = first('customer_birthday')
  deviceData.customer_phone = first('customer_phone')
  deviceData.customer_postalcode = first('customer_postalcode')
  deviceData.customer_address = first('customer_address')
  deviceData.customer_email = first('customer_email')
  deviceData.spec00 = first('spec00')
  deviceData.spec01 = first('spec01')
  deviceData.spec02 = first('spec02')
  deviceData.spec03 = first('spec03')
  deviceData.spec04 = first('spec04')
  deviceData.spec05 = first('spec05')
  deviceData.spec06 = first('spec06')
  deviceData.spec07 = first('spec07')
  deviceData.note00 = first('note00')
  return deviceData
}

//_____________________________________________________________________________________
// 已撤銷設備 (原 SelectRevokedDevices)
async function SelectRevokedDevices(options = {}) {
  const { page: targetPage = 1, keepFilters = false } = options
  revokedCurrentPage.value = keepFilters ? targetPage : 1
  const offset = (revokedCurrentPage.value - 1) * rowsPerPage

  const condition_value = buildConditionValue('0')

  const b = beginTime.value || sessionStorage.getItem('dashboard_begin_time') || '2000-01-01'
  const e = endTime.value || sessionStorage.getItem('dashboard_end_time') || '2099-12-31'
  const [b_time, e_time] = normalizeTimeRange(b, e)

  VisibleLoaderElement(true)

  if (_g_device_request_controller) _g_device_request_controller.abort()
  _g_device_request_controller = new AbortController()

  try {
    const json_object = await apiCall(
      CsRequestDeviceSelectAllRecords,
      CONDITION_TYPE_DEVICE,
      condition_value,
      b_time,
      e_time,
      offset,
      rowsPerPage,
      revokedSearchKeyword.value.trim() || '',
      currentRevokedSortField.value,
      currentRevokedSortOrder.value,
      _g_device_request_controller,
    )

    revokedRows.value = tablesiToRows(json_object.records || {})
    revokedTotal.value = parseInt(json_object.total_records) || 0
    selectAllRevoked.value = false
  } catch (e2) {
    if (e2.name === 'AbortError') {
      console.log('Revoked Devices request aborted')
      return
    }
    if (e2.message !== 'Handled Server Error') {
      console.error(e2)
      showToast(getLocalData('device.msg_read_failed_net') || '資料讀取失敗，請稍後再試')
    }
  } finally {
    VisibleLoaderElement(false)
  }
}

async function GotoPageRevokedDevices() {
  revokedSearchKeyword.value = ''
  await SelectRevokedDevices()
  page.value = 'revoked'
}

// 搜尋已撤銷設備防抖動 (原 searchRevokedDevices，500ms)
function searchRevokedDevices() {
  clearTimeout(revokedSearchTimeout)
  revokedSearchTimeout = setTimeout(() => {
    SelectRevokedDevices({ page: 1 })
  }, 500)
}

function sortRevokedDeviceTable(field) {
  if (currentRevokedSortField.value === field) {
    currentRevokedSortOrder.value = currentRevokedSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    currentRevokedSortField.value = field
    currentRevokedSortOrder.value = 'asc'
  }
  SelectRevokedDevices({ page: 1 })
}

function toggleSelectAllRevoked() {
  revokedRows.value.forEach((row) => (row.checked = selectAllRevoked.value))
}

// 恢復選中的設備 (原 RestoreSelectedDevices)
async function RestoreSelectedDevices() {
  // [資安防護 - BAC 越權攔截]
  const tier = parseInt(window.sessionStorage.getItem('tier'), 10)
  if (isNaN(tier) || tier >= 3) {
    alert(getLocalData('common.deny') || '權限不足，無法執行此操作。')
    return
  }

  const checkedRows = revokedRows.value.filter((r) => r.checked)
  if (checkedRows.length === 0) {
    alert(getLocalData('device.msg_select_restore') || '請選擇要恢復的設備')
    return
  }

  if (!confirm(tf('device.msg_confirm_restore', { count: checkedRows.length }))) {
    return
  }

  VisibleLoaderElement(true)

  let successCount = 0
  let errorCount = 0

  try {
    for (const row of checkedRows) {
      const deviceCid = row.device_cid
      try {
        console.log(`[RestoreSelectedDevices] Fetching from API for device: ${deviceCid}`)
        const json_object = await apiCall(CsRequestDeviceSelectOneRecord, deviceCid)
        const record = json_object.records

        if (!record) {
          console.error(`[RestoreSelectedDevices] No record for device: ${deviceCid}`)
          errorCount++
          continue
        }

        await apiCall(CsRequestDeviceUpdateOneRecord, buildDeviceDataFromRecord(record, deviceCid, '1'))
        console.log(`[RestoreSelectedDevices] Successfully restored device: ${deviceCid}`)
        successCount++
      } catch (e) {
        if (e.message !== 'Handled Server Error') {
          console.error(`[RestoreSelectedDevices] Error processing device ${deviceCid}:`, e)
        }
        errorCount++
      }
    }

    alert(tf('device.msg_restore_result', { success: successCount, failed: errorCount }))
    if (successCount > 0) {
      SelectRevokedDevices()
    }
  } catch (err) {
    console.error('批量恢復過程發生錯誤:', err)
  } finally {
    VisibleLoaderElement(false)
  }
}

//_____________________________________________________________________________________
// 單筆編輯 (原 SelectDeviceOne / UpdateDeviceOne)
async function SelectDeviceOne(device_cid) {
  VisibleLoaderElement(true)

  try {
    const json_object = await apiCall(CsRequestDeviceSelectOneRecord, device_cid)
    const record = json_object.records
    Object.keys(DeviceData).forEach((key) => {
      if (key === 'object_name') return
      updateForm[key] = record[key] ? record[key][0] : ''
    })
  } catch (e) {
    if (e.message !== 'Handled Server Error') {
      console.error(e)
      alert(getLocalData('device.msg_read_failed') || '讀取設備資料失敗')
    }
  } finally {
    VisibleLoaderElement(false)
  }
}

async function UpdateDeviceOne() {
  const device_data = Object.create(DeviceData)
  Object.keys(DeviceData).forEach((key) => {
    if (key === 'object_name') return
    device_data[key] = updateForm[key]
  })

  VisibleLoaderElement(true)

  try {
    await apiCall(CsRequestDeviceUpdateOneRecord, device_data)
    alert(getLocalData('common.success'))
    GotoPageSelectDeviceAll()
  } catch (e) {
    if (e.message !== 'Handled Server Error') {
      console.error(e)
      alert(getLocalData('device.msg_update_failed') || '更新失敗')
    }
  } finally {
    VisibleLoaderElement(false)
  }
}

//_____________________________________________________________________________________
// 歷史紀錄 (原 SelectHistoryAll: 先查數量再依分頁查內容)
async function SelectHistoryAll(device_cid) {
  historyDeviceCid.value = device_cid

  VisibleLoaderElement(true)

  if (_g_history_request_controller) _g_history_request_controller.abort()
  _g_history_request_controller = new AbortController()

  try {
    const json_object = await apiCall(
      CsRequestHistorySelectAllCount,
      CONDITION_TYPE_HISTORY,
      device_cid,
      historyBeginTime.value,
      historyEndTime.value,
      _g_history_request_controller,
    )

    historyTotal.value = Number(json_object.count) || 0
    historyPage.value = 1
    await loadHistoryPage(0)
  } catch (e) {
    if (e.name === 'AbortError') {
      console.log('History request aborted')
      return
    }
    if (e.message !== 'Handled Server Error') {
      console.error(e)
      alert(getLocalData('device.msg_read_history_failed') || '讀取歷史紀錄失敗')
    }
  } finally {
    VisibleLoaderElement(false)
  }
}

async function loadHistoryPage(offset) {
  if (_g_history_request_controller) _g_history_request_controller.abort()
  _g_history_request_controller = new AbortController()

  VisibleLoaderElement(true)
  try {
    const resultJson = await apiCall(
      CsRequestHistorySelectAllRecords,
      CONDITION_TYPE_HISTORY,
      historyDeviceCid.value,
      historyBeginTime.value,
      historyEndTime.value,
      offset,
      rowsPerPage,
      _g_history_request_controller,
    )

    const json_tablesi = resultJson.records
    if (Object.keys(json_tablesi).length > 0) {
      // 依原 key_history_list_info 順序: create_time, event_type, label, content_text
      historyRows.value = TablesiToTableii(
        ['create_time', 'event_type', 'label', 'content_text'],
        json_tablesi,
      )
    } else {
      historyRows.value = []
    }
  } catch (innerE) {
    if (innerE.name !== 'AbortError') {
      console.error('History Page Error:', innerE)
    }
  } finally {
    VisibleLoaderElement(false)
  }
}

function onHistoryPageChange(p) {
  historyPage.value = p
  loadHistoryPage((p - 1) * rowsPerPage)
}

//_____________________________________________________________________________________
// 初始化 (原 initDeviceView)
onMounted(async () => {
  console.log('Device View Initializing...')

  // 取得預設組織帳號
  const group_cid = window.sessionStorage.getItem('group_cid')
  if (!IsValidString(group_cid)) {
    alert(getLocalData('warring.no_group_cid'))
    changePage('home.html')
    return
  }

  // 預設為三個月前到現在 (sessionStorage 有記憶則沿用)
  const BDate = DateAdd('m', -3, new Date())
  const EDate = new Date()

  const savedBeginTime = sessionStorage.getItem('dashboard_begin_time')
  const savedEndTime = sessionStorage.getItem('dashboard_end_time')

  if (savedBeginTime && savedEndTime) {
    beginTime.value = savedBeginTime
    endTime.value = savedEndTime
    console.log('device: 從 sessionStorage 載入日期:', savedBeginTime, '~', savedEndTime)
  } else {
    beginTime.value = BDate.toLocaleDateString('sv-SE')
    endTime.value = EDate.toLocaleDateString('sv-SE')
  }

  // 預設查 log 的時間範圍
  historyBeginTime.value = BDate.toLocaleDateString('sv-SE')
  historyEndTime.value = EDate.toLocaleDateString('sv-SE')

  // 記憶日期 (原邏輯)
  sessionStorage.setItem('dashboard_begin_time', beginTime.value)
  sessionStorage.setItem('dashboard_end_time', endTime.value)

  // 執行第一次查詢 (預設第一頁)
  console.log('device: 頁面載入完成，執行初始搜尋。')
  await SelectDeviceAll()
})

onBeforeUnmount(() => {
  if (_g_device_request_controller) _g_device_request_controller.abort()
  if (_g_history_request_controller) _g_history_request_controller.abort()
  clearTimeout(searchTimeout)
  clearTimeout(revokedSearchTimeout)
})
</script>

<style>
/* 原 device.html 的頁面樣式 */
.device-page input::placeholder,
.device-page textarea::placeholder {
  color: #d1d5db !important;
  opacity: 1;
}
#device-download-button:hover,
#device-download-all-button:hover,
#device_revoked-button-restore:hover {
  background-color: #92bfff !important;
}
#device_list-button-delete:hover {
  background-color: #ffe6e6 !important;
  border-color: #c94a4a !important;
}
.device-round-btn {
  border-radius: 9999px;
  width: 56px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 12px;
  background: white;
}
.device-date-input {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  height: 38px;
  box-sizing: border-box;
}
.sort-icon {
  width: 1rem;
  height: 1rem;
  margin-left: 5px;
  transition: transform 0.2s ease;
}
#selectAll,
.row-checkbox,
.row-checkbox-revoked,
#selectAllRevoked {
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  background-color: white;
}
#selectAll,
#selectAllRevoked {
  margin-right: 0.5rem;
}
#selectAll:checked,
.row-checkbox:checked,
.row-checkbox-revoked:checked,
#selectAllRevoked:checked {
  border: 1px solid #ee963f;
  background-color: #ee963f;
  border-color: #ee963f;
}
.delete-modal-cancel {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.delete-modal-cancel:hover {
  background: #f3f4f6;
}
.delete-modal-confirm {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: rgba(33, 79, 124, 1);
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.delete-modal-confirm:hover {
  background: #ee963f;
}
/* 手機版 RWD 調整 */
@media screen and (max-width: 767px) {
  .responsive-toolbar {
    flex-direction: column !important;
    align-items: stretch !important;
    height: auto !important;
    padding: 10px !important;
  }
  .responsive-toolbar-group {
    width: 100% !important;
    justify-content: flex-start !important;
  }
  .responsive-toolbar-group:last-child {
    flex-direction: column !important;
    align-items: stretch !important;
    margin-top: 1rem;
  }
  .responsive-toolbar-group:last-child > div,
  .responsive-toolbar-group:last-child > button,
  .search-box {
    width: 100% !important;
    margin-left: 0 !important;
    margin-top: 0.2rem !important;
    box-sizing: border-box;
  }
  #device_list-button-date_search {
    margin-top: 0.5rem !important;
    margin-bottom: 0.5rem !important;
  }
  .page-icon-container {
    display: none !important;
  }
}
</style>
