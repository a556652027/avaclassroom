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
            <tbody>
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
            </tbody>
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
            <tbody>
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
                <!-- 與其他頁面的分頁一致：置中顯示 -->
                <div class="centered-content">
                  <TablePagination
                    :total-records="historyTotal"
                    :rows-per-page="rowsPerPage"
                    :current-page="historyPage"
                    @change="onHistoryPageChange"
                  />
                </div>
              </td>
            </tr>
            </tbody>
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
// 邏輯抽離至 DeviceView.js，此處僅保留模板繫結
import AppLayout from '@/layouts/AppLayout/AppLayout.vue'
import TablePagination from '@/components/TablePagination/TablePagination.vue'
import { useDeviceView } from './DeviceView.js'

const {
  CONDITION_TYPE_DEVICE,
  CONDITION_TYPE_HISTORY,
  rowsPerPage,
  page,
  groupTitle,
  userTier,
  isDistributor,
  deviceRows,
  totalRecords,
  currentPage,
  currentSortField,
  currentSortOrder,
  searchKeyword,
  beginTime,
  endTime,
  selectAll,
  revokedRows,
  revokedTotal,
  revokedCurrentPage,
  currentRevokedSortField,
  currentRevokedSortOrder,
  revokedSearchKeyword,
  selectAllRevoked,
  updateForm,
  specPairs,
  historyDeviceCid,
  historyBeginTime,
  historyEndTime,
  historyRows,
  historyTotal,
  historyPage,
  deleteModalVisible,
  deleteModalMessage,
  deleteModalItems,
  downloadHover,
  downloadAllHover,
  restoreHover,
  listColumns,
  _g_device_request_controller,
  _g_history_request_controller,
  searchTimeout,
  revokedSearchTimeout,
  sortIconStyle,
  tablesiToRows,
  normalizeTimeRange,
  buildConditionValue,
  showToast,
  SelectDeviceAll,
  handleSearchInput,
  onDateSearch,
  sortDeviceTable,
  toggleSelectAll,
  GotoPageSelectDeviceAll,
  downloadSelectedDevicesExcel,
  generateDevicesExcel,
  downloadAllDevices,
  DeleteSelectedDevices,
  confirmDelete,
  executeDeleteDeviceLogic,
  buildDeviceDataFromRecord,
  SelectRevokedDevices,
  GotoPageRevokedDevices,
  searchRevokedDevices,
  sortRevokedDeviceTable,
  toggleSelectAllRevoked,
  RestoreSelectedDevices,
  SelectDeviceOne,
  UpdateDeviceOne,
  SelectHistoryAll,
  loadHistoryPage,
  onHistoryPageChange,
  t,
} = useDeviceView()
</script>

<style src="./DeviceView.css"></style>
