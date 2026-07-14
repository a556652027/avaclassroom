import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
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

// 原 DeviceView.vue <script setup> 的邏輯，模板繫結經由 useDeviceView() 回傳
export function useDeviceView() {
// 原 views/app.view.device.js (查詢/排序/分頁/匯出/刪除/恢復/歷史紀錄流程逐步保留)

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

  return {
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
  }
}
