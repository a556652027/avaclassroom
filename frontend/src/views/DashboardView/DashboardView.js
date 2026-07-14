import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { t } from '@/locales'
import { emitter } from '@/core/emitter'
import { apiCall, IsValidString } from '@/core/util'
import { VisibleLoaderElement } from '@/core/loader'
import { getGroupDisplayName } from '@/core/title'
import { fallbackSchoolToCompany } from '@/services/orgTree'
import { useLegacyCss } from '@/composables/useLegacyCss'
import { CsRequestDashboardSelectDeviceSpec } from '@/api/dashboard'
import {
  GetStateCount,
  RenderDevice003PieChart,
  RenderDevice003BarChart,
  RenderDevice003LineChart,
  showNoDataOnCharts,
  destroyCharts,
  lineChartExport,
} from '@/services/dashboardCharts'

// 原 DashboardView.vue <script setup> 的邏輯，模板繫結經由 useDashboardView() 回傳
export function useDashboardView() {
// 原 views/app.view.dashboard.js (資料流程逐步保留)

useLegacyCss('/css/dashboard.css')

const route = useRoute()

const pieCanvas = ref(null)
const lineCanvas = ref(null)
const barCanvas = ref(null)

const beginTime = ref('')
const endTime = ref('')
const targetTime = ref('')
const targetCount = ref('0')
// 原 dashboard_device_001-space_num 隱藏下拉的預設值為 "4" (要求後端回傳 spec04 機型欄位)；
// 若送 '%%' 後端不會回機型資料，導致圓餅圖全部歸類 Other、折線圖只剩 undefined 一條線
const searchSpec = ref('4')

const activatedCount = ref(0)
const revokedCount = ref(0)
const growthVisible = ref(false)
const growthText = ref('0%')
const growthUp = ref(true)

const pageTitle = computed(() => getGroupDisplayName() || t('dashboard.title'))

let _g_dashboard_request_controller = null

function allCanvases() {
  return [pieCanvas.value, lineCanvas.value, barCanvas.value]
}

// 顯示沒有資料的訊息 (原 showNoDataMessage)
function showNoDataMessage() {
  activatedCount.value = 0
  revokedCount.value = 0
  showNoDataOnCharts(allCanvases())
  console.log('選定的授權時間範圍沒有設備資料')
}

// 原 SelectDeviceSpec003 (並行今年/去年請求、allSettled、重試邏輯不變)
async function SelectDeviceSpec003(retryCount = 0, callback = null) {
  let search_group_cid =
    window.sessionStorage.getItem('group_cid') ||
    window.sessionStorage.getItem('select_group_cid')

  const safeExecuteCallback = () => {
    if (typeof callback === 'function') {
      const cb = callback
      callback = null
      cb()
    }
  }

  if (!search_group_cid) {
    console.warn('尚未取得 group_cid，暫停 SelectDeviceSpec003 請求')
    safeExecuteCallback()
    return
  }

  let search_product_type = window.sessionStorage.getItem('product_type')
  let search_spec = searchSpec.value || '%%'

  const bTimeVal = beginTime.value || new Date().toLocaleDateString('sv-SE')
  const eTimeVal = endTime.value || new Date().toLocaleDateString('sv-SE')

  if (beginTime.value && endTime.value) {
    if (beginTime.value > endTime.value) {
      alert('開始日期不能晚於結束日期')
      safeExecuteCallback()
      return
    }
    sessionStorage.setItem('dashboard_begin_time', beginTime.value)
    sessionStorage.setItem('dashboard_end_time', endTime.value)
  }

  // Cancel previous request
  if (_g_dashboard_request_controller) {
    _g_dashboard_request_controller.abort()
  }
  _g_dashboard_request_controller = new AbortController()

  VisibleLoaderElement(true)

  // 準備去年同期的時間範圍
  const beginTimeObj = new Date(bTimeVal)
  const endTimeObj = new Date(eTimeVal)
  const lastYearBegin = new Date(beginTimeObj)
  lastYearBegin.setFullYear(lastYearBegin.getFullYear() - 1)
  const lastYearEnd = new Date(endTimeObj)
  lastYearEnd.setFullYear(lastYearEnd.getFullYear() - 1)
  const formatDate = (date) => date.toISOString().split('T')[0]

  try {
    const apiFunction = CsRequestDashboardSelectDeviceSpec
    const getApiArgs = (group, start, end) => [group, start, end, search_product_type, search_spec]

    // [效能] 並行請求今年與去年資料
    const currentYearPromise = apiCall(
      apiFunction,
      ...getApiArgs(search_group_cid, bTimeVal, eTimeVal),
      _g_dashboard_request_controller,
    )

    const lastYearPromise = apiCall(
      apiFunction,
      ...getApiArgs(search_group_cid, formatDate(lastYearBegin), formatDate(lastYearEnd)),
      _g_dashboard_request_controller,
    )

    // 使用 allSettled 確保即使去年資料撈取失敗，今年的主資料依然能渲染
    const [currentYearResult, lastYearResult] = await Promise.allSettled([
      currentYearPromise,
      lastYearPromise,
    ])

    if (currentYearResult.status === 'rejected') {
      throw currentYearResult.reason
    }

    const json_object = currentYearResult.value
    const json_tablesi = json_object?.records && typeof json_object.records === 'object' ? json_object.records : {}
    const field_count = Object.keys(json_tablesi).length
    const hasChartRows =
      Array.isArray(json_tablesi.record_state) ||
      Array.isArray(json_tablesi.device_count) ||
      Array.isArray(json_tablesi.active_time) ||
      Array.isArray(json_tablesi.spec04)

    if (field_count == 0 || !hasChartRows) {
      showNoDataMessage()
    } else {
      // 1. 計算今年基礎數據
      const activated_count = GetStateCount(json_tablesi, '1')
      const revoked_count = GetStateCount(json_tablesi, '0')

      // 2. 處理去年數據 (即使失敗也不影響主流程)
      processLastYearData(lastYearResult, activated_count)

      // 3. 更新目標與預測
      updateTargetAndPrediction(json_object, activated_count, bTimeVal, eTimeVal)

      // 4. 更新 UI 數字
      activatedCount.value = activated_count
      revokedCount.value = revoked_count

      // 5. 繪製圖表
      RenderDevice003PieChart(pieCanvas.value, json_tablesi)
      RenderDevice003LineChart(lineCanvas.value, json_tablesi, true)
      RenderDevice003BarChart(barCanvas.value, json_tablesi)
    }

    safeExecuteCallback()
    VisibleLoaderElement(false)
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Dashboard request aborted')
      safeExecuteCallback()
      VisibleLoaderElement(false)
    } else {
      console.error('Dashboard API Error:', error)
      // 簡單重試邏輯
      if (retryCount < 2) {
        console.warn(`Retry SelectDeviceSpec003 (${retryCount + 1})...`)
        setTimeout(() => SelectDeviceSpec003(retryCount + 1, callback), 1000)
        return // 觸發重試時保持 Loading 動畫繼續轉動
      }
      alert('Request error: ' + (error.message || 'Unknown error'))
      safeExecuteCallback()
      VisibleLoaderElement(false)
    }
  }
}

// 輔助函式：處理去年同期數據 (原 processLastYearData)
function processLastYearData(lastYearResult, currentActivatedCount) {
  if (lastYearResult.status === 'rejected' || !lastYearResult.value) {
    console.warn('無法取得去年資料:', lastYearResult.reason)
    growthVisible.value = false
    return
  }

  try {
    const lastYearData = lastYearResult.value
    if (!lastYearData.records || Object.keys(lastYearData.records).length === 0) {
      growthVisible.value = false
      return
    }

    const lastYearActivatedCount = GetStateCount(lastYearData.records, '1')
    if (lastYearActivatedCount === 0) {
      growthVisible.value = false
      return
    }

    const growthRate =
      ((currentActivatedCount - lastYearActivatedCount) / lastYearActivatedCount) * 100
    const growthRateFormatted = Math.abs(growthRate).toFixed(1)

    growthText.value = `${growthRate >= 0 ? '+' : '-'}${growthRateFormatted}%`
    growthUp.value = growthRate >= 0
    growthVisible.value = true
  } catch (e) {
    console.error('處理去年數據錯誤:', e)
    growthVisible.value = false
  }
}

// 輔助函式：更新目標與預測 (原 updateTargetAndPrediction，數值計算不變)
function updateTargetAndPrediction(json_object, activated_count, b_time_str, e_time_str) {
  const target_time = json_object.target_time || e_time_str
  const target_count = json_object.target_count || '0'

  // 預測達標數量計算
  let predicted_achievement_count = 0
  const sb_time = new Date(b_time_str)
  const se_time = new Date(e_time_str)
  const st_time = new Date(target_time.split(' ')[0])

  const diffTime01 = Math.abs(se_time - sb_time) / 1000
  const diffTime02 = Math.abs(st_time - sb_time) / 1000

  if (activated_count > 0 && diffTime01 > 0) {
    const speed = diffTime01 / activated_count // 秒/台
    const remainingTime = diffTime02 - diffTime01
    const predictedAdditional = Math.ceil(remainingTime / speed)
    predicted_achievement_count = activated_count + predictedAdditional
  } else {
    predicted_achievement_count = activated_count
  }

  targetTime.value = target_time.split(' ')[0]
  targetCount.value = target_count
}

// 原 ExportDeviceSpec003 (改為打包內建的 exceljs / file-saver，匯出內容不變)
async function ExportDeviceSpec003() {
  if (lineChartExport.data == null) {
    return
  }

  VisibleLoaderElement(true)
  try {
    const [{ default: ExcelJS }, { default: saveAs }] = await Promise.all([
      import('exceljs'),
      import('file-saver'),
    ])

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('折線圖資料')

    // 寫入標題列
    const headerRow = ['月份', ...lineChartExport.data.datasets.map((ds) => ds.label)]
    worksheet.addRow(headerRow)

    // 寫入資料列
    for (let i = 0; i < lineChartExport.data.labels.length; i++) {
      const row = [lineChartExport.data.labels[i]]
      for (const ds of lineChartExport.data.datasets) {
        row.push(ds.data[i])
      }
      worksheet.addRow(row)
    }

    // 插入折線圖圖片
    if (lineChartExport.imageBase64) {
      const imageId = workbook.addImage({
        base64: lineChartExport.imageBase64,
        extension: 'png',
      })
      worksheet.addImage(imageId, {
        tl: { col: 0, row: lineChartExport.data.labels.length + 3 },
        ext: { width: 600, height: 300 },
      })
    }

    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buffer]), 'chart_data_with_image.xlsx')
  } catch (error) {
    console.error('Excel 匯出錯誤:', error)
  } finally {
    VisibleLoaderElement(false)
  }
}

//_____________________________________________________________________________________
// 初始化 (原 initDashboardView)
onMounted(() => {
  console.log('Dashboard View Initializing...')

  // 安全檢查：如果沒有 session_token，強制導回登入頁
  if (!window.sessionStorage.getItem('session_token')) {
    console.warn('Unauthorized access: No session token. Redirecting to login.')
    VisibleLoaderElement(false)
    window.location.hash = '#/login'
    return
  }

  // 依產品調整狀態 (原 configureDashboardForProduct 的 session 防呆部分；導覽列切換由 SecondaryNav 元件處理)
  const product = route.query.product || 'avacast'
  if (product !== 'avaclassroom') {
    fallbackSchoolToCompany()
  }
  window.sessionStorage.setItem('product_type', product)

  // 設定預設日期 (URL 參數 > sessionStorage 記憶 > 預設近一年)
  {
    const urlLicenseBeginTime = route.query.begin_time
    const urlLicenseEndTime = route.query.end_time
    const licenseCount = route.query.license_count

    const savedBeginTime = sessionStorage.getItem('dashboard_begin_time')
    const savedEndTime = sessionStorage.getItem('dashboard_end_time')

    if (urlLicenseBeginTime && urlLicenseEndTime) {
      beginTime.value = String(urlLicenseBeginTime).split(' ')[0]
      endTime.value = String(urlLicenseEndTime).split(' ')[0]
      if (licenseCount) targetCount.value = licenseCount
    } else if (savedBeginTime && savedEndTime) {
      beginTime.value = savedBeginTime
      endTime.value = savedEndTime
    } else {
      const NDate = new Date()
      const BDate = new Date(NDate)
      BDate.setFullYear(NDate.getFullYear() - 1)
      beginTime.value = BDate.toLocaleDateString('sv-SE')
      endTime.value = NDate.toLocaleDateString('sv-SE')
    }
  }

  // 主動輪詢檢查 Session (原 checkSession，100ms x5 重試)
  let checkSessionRetry = 0
  const checkSession = () => {
    const group_cid =
      window.sessionStorage.getItem('group_cid') ||
      window.sessionStorage.getItem('select_group_cid')

    if (!IsValidString(group_cid)) {
      if (checkSessionRetry < 5) {
        checkSessionRetry++
        console.log(`[Session] 尚未取得 group_cid，100ms 後進行第 ${checkSessionRetry} 次重試...`)
        setTimeout(checkSession, 100)
        return
      }
      console.warn(
        'No group_cid found after retries. Dashboard data will not load until a group is selected.',
      )
      VisibleLoaderElement(false)
      return
    }

    // 執行初始資料請求
    SelectDeviceSpec003(0, () => {
      console.log('Dashboard Initial Data Loaded.')
    })
  }
  checkSession()
})

onBeforeUnmount(() => {
  // 原 spa:page-change-before: 換頁時中斷請求並釋放圖表記憶體
  if (_g_dashboard_request_controller) _g_dashboard_request_controller.abort()
  destroyCharts(allCanvases())
})

  return {
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
  }
}
