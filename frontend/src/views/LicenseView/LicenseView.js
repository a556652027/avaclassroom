import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { t } from '@/locales'
import { getGroupDisplayName } from '@/core/title'
import { DateAdd, SetToEndOfDay, FormatDateTime, IsAfterToday } from '@/core/time'
import { changePage } from '@/core/navigation'
import { VisibleLoaderElement } from '@/core/loader'
import { apiCall } from '@/core/util'
import { runExportJob } from '@/services/exportJob'
import { notify } from '@/services/notify'
import { PRODUCT_DICTIONARY, getProductName } from '@/core/products'
import {
  LicenseData,
  CsRequestLicenseGetStatistics,
  CsRequestLicenseSelectAllRecords,
  CsRequestLicenseSelectOneRecordByCID,
  CsRequestLicenseInsertOneRecord,
  CsRequestLicenseUpdateOneRecord,
  CsRequestLicenseExportStart,
  CsRequestLicenseExportStatus,
  CsRequestLicenseExportDownload,
} from '@/api/license'
import {
  CsRequestGroupSelectOneRecordByGroupCID,
  CsRequestGroupUpdateOneRecordByGroupCID,
} from '@/api/organization'
import {
  CsRequestMemberSelectOneRecordByMemberCID,
  CsRequestMemberUpdateOneRecordByMemberCID,
} from '@/api/member'

// 原 LicenseView.vue <script setup> 的邏輯，模板繫結經由 useLicenseView() 回傳
export function useLicenseView() {

const route = useRoute()
const router = useRouter()

const rows = ref([])
const totalRecords = ref(0)
const currentPage = ref(1)
const rowsPerPage = ref(10)
const customerName = ref('')
const beginTime = ref('')
const endTime = ref('')
const statusFilter = ref('all')
const sortField = ref('create_time')
const sortOrder = ref('desc')
const selectAll = ref(false)
const statusDropdownOpen = ref(false)

// 工具列按鈕 hover 換圖 (原 hoverButtons 設定)
const insertBtnHover = ref(false)
const editBtnHover = ref(false)
const downloadBtnHover = ref(false)
const downloadAllBtnHover = ref(false)

// ===== 新增訂單 Modal (原 license-insert-modal) =====
const insertModalVisible = ref(false)
const productDropdownOpen = ref(false)
const productOptions = ref([])
const schoolOptions = ref([])
const insertFiles = ref([])
const insertDragHighlight = ref(false)
const insertFileInput = ref(null)
const teacherForm = reactive({ name: '', email: '', password: '', password_confirm: '' })
const insertForm = reactive({
  owner_cid: '',
  product_type: '',
  customer_name: '',
  license_begin_time: '',
  license_days: '',
  license_count: '',
  note00: '',
})
const insertIsClassroom = computed(() => insertForm.product_type === 'avaclassroom')

// ===== 編輯訂單 Modal (原 license-update-modal) =====
const updateModalVisible = ref(false)
const updateFiles = ref([])
const updateDragHighlight = ref(false)
const updateFileInput = ref(null)
const existingAttachmentPaths = ref([])
const updateFormL = reactive({
  license_cid: '',
  create_time: '',
  agent_cid: '',
  owner_cid: '',
  record_state: '1',
  license_key: '',
  license_begin_time: '',
  license_days: '',
  license_count: '',
  sale_amount: '',
  country: '',
  customer_name: '',
  customer_gender: '',
  customer_birthday: '',
  customer_phone: '',
  customer_postalcode: '',
  customer_address: '',
  customer_email: '',
  note00: '',
  product_type: '',
})

// 統計卡 (原 updateDashboardStats 的顯示狀態)
const totalCount = ref(0)
const totalGrowthVisible = ref(false)
const totalGrowthText = ref('0%')
const totalGrowthUp = ref(true)
const quarterlyCount = ref(0)
const quarterlyGrowthVisible = ref(false)
const quarterlyGrowthText = ref('0%')
const quarterlyGrowthUp = ref(true)

// 原 license_list-customer_name-container 僅在 avaclassroom 產品顯示
const showCustomerSearch =
  (window.sessionStorage.getItem('product_type') ||
    window.sessionStorage.getItem('default_product') ||
    '') === 'avaclassroom'

// 刪除(作廢)確認 Modal (原 delete-confirmation-modal)
const deleteModalVisible = ref(false)
const deleteModalMessage = ref('')
const deleteModalItems = ref([])
const statusOptions = [
  { value: 'all', label: t('license.filter_all') || '全部' },
  { value: 'active', label: t('license.filter_active') || '啟用' },
  { value: 'expired', label: t('license.filter_expired') || '停用' },
]
const statusOptionLabel = computed(() => {
  const option = statusOptions.find((opt) => opt.value === statusFilter.value)
  return option ? option.label : t('license.filter_all') || '全部'
})

let requestController = null

// 原 LicenseSelectAll 的搜尋條件組合 (Type 16/18 的分號組合字串)
function getConditionTarget() {
  const userTier = window.sessionStorage.getItem('tier')
  const isDistributor = userTier === '3'
  const member_cid = window.sessionStorage.getItem('member_cid') || ''
  const group_cid =
    window.sessionStorage.getItem('select_group_cid') || window.sessionStorage.getItem('group_cid') || ''
  const product_type = window.sessionStorage.getItem('product_type') || ''

  if (isDistributor) {
    // 經銷商: 查詢旗下所有 Agent (%%)，不使用訂購人名稱過濾 (Type 16)
    return {
      condition_type: '16',
      condition_value: `%%;${group_cid.trim()};1;${product_type.trim()}`,
    }
  }
  // 管理員: 依 Member ID 查詢，支援訂購人名稱模糊搜尋 (Type 18)
  return {
    condition_type: '18',
    condition_value: `${member_cid.trim()};${group_cid.trim()};1;${product_type.trim()};${customerName.value.trim()}`,
  }
}

// 原 LicenseSelectAll 的日期參數 (空值預設 1900-01-01 ~ 2999-12-31，固定帶時間)
function getSearchTimeRange() {
  const target_b_date = (beginTime.value || '1900-01-01').replace(/\//g, '-')
  const target_e_date = (endTime.value || '2999-12-31').replace(/\//g, '-')
  return {
    b_time: target_b_date + ' 00:00:00',
    e_time: target_e_date + ' 23:59:59',
  }
}

// 原 lib.title.groupcid.js：頁面標題顯示目前選擇的公司名稱
const pageTitle = computed(() => getGroupDisplayName() || t('license.title_list_license') || '訂單資訊')

// 原 renderTable：avaclassroom 產品時客戶欄改顯示「學校名稱」
const customerColLabel = computed(() => {
  const currentProduct = window.sessionStorage.getItem('product_type') || ''
  const isZh = (window.localStorage.getItem('language') || 'zh-tw') === 'zh-tw'
  if (currentProduct === 'avaclassroom') return isZh ? '學校名稱' : 'School Name'
  return isZh ? '客戶名稱' : 'Customer Name'
})

// 原 sortLicenseTable：排序切換後呼叫 API 重新取得排序後的資料 (伺服器端排序)
function toggleSort(field) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'desc'
  }
  loadLicenses(1)
}

function sortIconStyle(field) {
  // 尺寸/顏色交由全站 .sort-icon 樣式 (styles/ui.css)，此處只回傳排序狀態
  const active = sortField.value === field
  return {
    opacity: active ? 1 : undefined,
    transform: active && sortOrder.value === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
  }
}

function toggleSelectAll() {
  rows.value.forEach((row) => {
    row.checked = selectAll.value
  })
}

function clearCustomerName() {
  customerName.value = ''
}

function toggleStatusDropdown() {
  statusDropdownOpen.value = !statusDropdownOpen.value
}

function selectStatus(value) {
  statusFilter.value = value
  statusDropdownOpen.value = false
  // 原邏輯：狀態篩選由後端處理，切換後重新查詢
  loadLicenses(1)
}

// 原 renderTable 的 Dashboard 欄：切換至該訂單的組織並帶入授權期間
function goRowDashboard(row) {
  if (row.owner_cid) {
    window.sessionStorage.setItem('select_group_cid', row.owner_cid)
    window.sessionStorage.setItem('group_cid', row.owner_cid)
  }
  const productType = window.sessionStorage.getItem('product_type') || 'avacast'
  changePage('dashboard.html', {
    params: {
      product: productType,
      license_cid: row.license_cid,
      begin_time: row.license_begin_time.substring(0, 10),
      end_time: row.end_day_text,
      license_count: row.license_count,
    },
  })
}

function openEditSelected() {
  const selected = rows.value.find((row) => row.checked)
  if (!selected) {
    alert(t('common.select_one_record') || '請先選擇一筆資料')
    return
  }
  openEditModal(selected.license_cid)
}

// 原 downloadSelectedAttachments：逐筆取回選中訂單並生成整合 Excel (並行上限 3)
async function downloadSelectedLicenses() {
  const selected = rows.value.filter((row) => row.checked)
  if (!selected.length) {
    alert('請選擇要匯出的項目')
    return
  }

  const licenseCids = selected.map((row) => row.license_cid)
  VisibleLoaderElement(true)

  const fetchOrder = async (licenseCid) => {
    try {
      const json_object = await apiCall(CsRequestLicenseSelectOneRecordByCID, licenseCid)
      if (json_object.records) {
        json_object.records._license_cid = licenseCid
        return json_object.records
      }
      return null
    } catch (e) {
      console.error(`解析訂單 ${licenseCid} 失敗:`, e)
      return null
    }
  }

  // 限制並行請求數量 (原 promiseAllLimit, CONCURRENCY_LIMIT = 3)
  const CONCURRENCY_LIMIT = 3
  const results = new Array(licenseCids.length)
  let index = 0
  const next = () => {
    if (index >= licenseCids.length) return Promise.resolve()
    const currentIndex = index++
    return fetchOrder(licenseCids[currentIndex]).then((res) => {
      results[currentIndex] = res
      return next()
    })
  }
  const chains = []
  for (let i = 0; i < Math.min(CONCURRENCY_LIMIT, licenseCids.length); i++) chains.push(next())

  try {
    await Promise.all(chains)
    VisibleLoaderElement(false)
    const allOrders = results.filter((r) => r !== null)

    if (allOrders.length > 0) {
      await generateOrdersExcel(allOrders)
      if (allOrders.length === licenseCids.length) {
        showToast(`已成功匯出 ${allOrders.length} 筆訂單資料`)
      } else {
        alert(
          `匯出完成，但有部分資料讀取失敗。\n預計: ${licenseCids.length} 筆\n成功: ${allOrders.length} 筆\n失敗: ${licenseCids.length - allOrders.length} 筆`,
        )
      }
    } else {
      alert('無法獲取訂單資料')
    }
  } catch (err) {
    VisibleLoaderElement(false)
    console.error('匯出過程發生錯誤:', err)
    alert('匯出失敗，請稍後再試')
  }
}

// 原 generateOrdersExcel (欄位/欄寬/檔名格式不變，改用打包內建 exceljs)
async function generateOrdersExcel(ordersList) {
  const { default: ExcelJS } = await import('exceljs')
  const { default: saveAs } = await import('file-saver')

  const headers = ['訂單編號', '建立時間', '授權開始時間', '授權天數', '授權數量', '授權金鑰', '備註', '附件清單']
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('訂單列表')
  worksheet.addRow(headers)

  ordersList.forEach((order) => {
    let attachmentNames = ''
    if (order.attachments && order.attachments.length > 0) {
      const names = []
      order.attachments.forEach((attStr) => {
        try {
          if (attStr && attStr.trim()) {
            const parsed = JSON.parse(attStr)
            if (Array.isArray(parsed)) {
              parsed.forEach((p) => names.push(p.split('/').pop()))
            } else if (typeof parsed === 'string') {
              names.push(parsed.split('/').pop())
            }
          }
        } catch (e) {}
      })
      attachmentNames = names.join(', ')
    }

    worksheet.addRow([
      order._license_cid || '',
      order.create_time ? order.create_time[0] : '',
      order.license_begin_time ? order.license_begin_time[0] : '',
      order.license_days ? order.license_days[0] : '',
      order.license_count ? order.license_count[0] : '',
      order.license_key ? order.license_key[0] : '',
      order.note00 ? order.note00[0] : '',
      attachmentNames,
    ])
  })

  const widths = [20, 20, 15, 10, 10, 30, 30, 50]
  worksheet.columns.forEach((col, i) => {
    col.width = widths[i]
  })

  const date = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const fileName = `訂單匯出_${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}.xlsx`

  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buffer]), fileName)
}

// 原 showToast：自動消失的提示訊息 (改用全站統一 Toast，類型依訊息語氣自動判斷)
function showToast(message) {
  notify(message)
}

function exportAllLicenses() {
  const { condition_type, condition_value } = getConditionTarget()
  const { b_time, e_time } = getSearchTimeRange()
  const statusFilterValue = statusFilter.value === 'active' ? '1' : statusFilter.value === 'expired' ? '0' : 'all'

  runExportJob({
    overlayId: 'license-export-overlay',
    startExport: (controller) =>
      apiCall(
        CsRequestLicenseExportStart,
        condition_type,
        condition_value,
        b_time,
        e_time,
        customerName.value.trim() || '',
        sortField.value,
        sortOrder.value,
        statusFilterValue,
        controller,
      ),
    queryStatus: (jobId, controller) => apiCall(CsRequestLicenseExportStatus, jobId, controller),
    download: CsRequestLicenseExportDownload,
    fileNamePrefix: t('common.export_filename_license') || 'license_export',
    onError: () => alert(t('common.export_failed') || '匯出失敗'),
  })
}

// 原 closeSelectedRecords：作廢選中訂單 (BAC 越權攔截 + 確認 Modal)
function deleteSelectedLicenses() {
  // [資安防護 - BAC 越權攔截] 預設拒絕：Tier >= 3 (如經銷商) 禁止作廢授權
  const tier = parseInt(window.sessionStorage.getItem('tier'), 10)
  if (isNaN(tier) || tier >= 3) {
    alert(t('common.deny') || '權限不足，無法執行此操作。')
    return
  }

  const selected = rows.value.filter((row) => row.checked)
  if (!selected.length) {
    alert('請選擇要關閉的項目')
    return
  }

  const hasClassroom = selected.some((row) => row.product_type === 'avaclassroom')
  const template = hasClassroom
    ? t('license.msg_confirm_delete_classroom') ||
      '確定要關閉這 {{count}} 筆紀錄嗎？\n⚠️ 警告：這包含 Classroom 產品訂單，關閉後該學校群組與教學主任帳號也將一併停用！'
    : t('license.msg_confirm_delete') || '確定要關閉這 {{count}} 筆紀錄嗎？'

  deleteModalMessage.value = template.replace('{{count}}', selected.length)
  deleteModalItems.value = selected.map((row) => row.create_time || `ID: ${row.license_cid}`)
  deleteModalVisible.value = true
}

// 原 executeCloseLogic：逐筆取回 → record_state='0' → 更新 (並行上限 3)
async function confirmDeleteLicenses() {
  deleteModalVisible.value = false
  const selected = rows.value.filter((row) => row.checked)
  if (!selected.length) return

  VisibleLoaderElement(true)
  let successCount = 0
  let errorCount = 0
  const disabledSchools = []

  const processItem = async (row) => {
    const licenseCid = row.license_cid
    try {
      const json_object = await apiCall(CsRequestLicenseSelectOneRecordByCID, licenseCid)
      const record = json_object.records
      if (!record || !record.license_cid) throw new Error('Record empty')

      const license_data = Object.create(LicenseData)
      const copyFields = [
        'license_cid',
        'owner_cid',
        'license_key',
        'license_begin_time',
        'license_days',
        'license_count',
        'sale_amount',
        'country',
        'customer_name',
        'customer_gender',
        'customer_birthday',
        'customer_phone',
        'customer_postalcode',
        'customer_address',
        'customer_email',
        'note00',
        'product_type',
      ]
      copyFields.forEach((field) => {
        if (field === 'license_begin_time') {
          license_data[field] = record[field] ? record[field][0].split(' ')[0] : ''
        } else {
          license_data[field] = record[field] ? record[field][0] : ''
        }
        if (['license_days', 'license_count', 'sale_amount'].includes(field) && !license_data[field]) {
          license_data[field] = '0'
        }
      })
      license_data.record_state = '0'

      await apiCall(CsRequestLicenseUpdateOneRecord, license_data)

      // [聯動刪除] avaclassroom 訂單作廢時，該學校群組與對應的教學主任帳號也一併停用，防止後續繼續使用
      if (license_data.product_type === 'avaclassroom') {
        const promises = []

        // 1. 停用學校群組 (sch_ 開頭的自動生成群組)：先查詢完整資料以獲取所有必填欄位，再帶全部欄位更新
        if (license_data.owner_cid && license_data.owner_cid.startsWith('sch_')) {
          promises.push(
            new Promise((resolveGroup) => {
              CsRequestGroupSelectOneRecordByGroupCID(license_data.owner_cid, (okSelect, selectRes) => {
                if (okSelect) {
                  try {
                    const selectJson = JSON.parse(selectRes)
                    if ((selectJson.errno == 1 || selectJson.errno == 0) && selectJson.records) {
                      const gRecord = selectJson.records
                      const updatePayload = {
                        group_cid: license_data.owner_cid,
                        group_name: gRecord.group_name ? gRecord.group_name[0] : '',
                        group_type: gRecord.group_type ? parseInt(gRecord.group_type[0], 10) : 0,
                        owner_cid: gRecord.owner_cid ? gRecord.owner_cid[0] : '',
                        record_state: 0, // 設為停用
                        contact: gRecord.contact ? gRecord.contact[0] : '',
                        group_ubn: gRecord.group_ubn ? gRecord.group_ubn[0] : '',
                        contact_phone_01: gRecord.contact_phone_01 ? gRecord.contact_phone_01[0] : '',
                        contact_email_01: gRecord.contact_email_01 ? gRecord.contact_email_01[0] : '',
                        city: gRecord.city ? gRecord.city[0] : '',
                        country: gRecord.country ? gRecord.country[0] : '',
                        address: gRecord.address ? gRecord.address[0] : '',
                        billing_addr: gRecord.billing_addr ? gRecord.billing_addr[0] : '',
                        note00: gRecord.note00 ? gRecord.note00[0] : '',
                      }

                      CsRequestGroupUpdateOneRecordByGroupCID(updatePayload, (okUpdate, updateRes) => {
                        if (okUpdate) {
                          try {
                            const updateJson = JSON.parse(updateRes)
                            if (updateJson.errno == 1 || updateJson.errno == 0) {
                              disabledSchools.push(license_data.owner_cid)
                            }
                          } catch (e) {
                            console.error('Failed to parse group update response', e)
                          }
                        }
                        resolveGroup()
                      })
                      return
                    }
                  } catch (e) {
                    console.error('Failed to parse group select response', e)
                  }
                }
                resolveGroup()
              })
            }),
          )
        }

        // 2. 停用教學主任帳號 (member_cid = 訂購人 Email)：先查詢完整資料再帶全部欄位更新
        if (license_data.customer_email) {
          promises.push(
            new Promise((resolveMember) => {
              CsRequestMemberSelectOneRecordByMemberCID(license_data.customer_email, (okSelect, selectRes) => {
                if (okSelect) {
                  try {
                    const selectJson = JSON.parse(selectRes)
                    if ((selectJson.errno == 1 || selectJson.errno == 0) && selectJson.records) {
                      const mRecord = selectJson.records
                      const updatePayload = {
                        member_cid: license_data.customer_email,
                        password: mRecord.password ? mRecord.password[0] : '',
                        member_name: mRecord.member_name ? mRecord.member_name[0] : '',
                        record_state: 0, // 設為停用
                        group_cid: mRecord.group_cid ? mRecord.group_cid[0] : '',
                        phone_cell: mRecord.phone_cell ? mRecord.phone_cell[0] : '',
                        phone_home: mRecord.phone_home ? mRecord.phone_home[0] : '',
                        phone_work: mRecord.phone_work ? mRecord.phone_work[0] : '',
                        email: mRecord.email ? mRecord.email[0] : '',
                        address: mRecord.address ? mRecord.address[0] : '',
                        city: mRecord.city ? mRecord.city[0] : '',
                        country: mRecord.country ? mRecord.country[0] : '',
                        gender: mRecord.gender ? mRecord.gender[0] : '',
                        birthday: mRecord.birthday ? mRecord.birthday[0] : '',
                        note00: mRecord.note00 ? mRecord.note00[0] : '',
                        avatar_url: mRecord.avatar_url ? mRecord.avatar_url[0] : '',
                      }

                      CsRequestMemberUpdateOneRecordByMemberCID(updatePayload, () => resolveMember())
                      return
                    }
                  } catch (e) {
                    console.error('Failed to parse member select response', e)
                  }
                }
                resolveMember()
              })
            }),
          )
        }

        try {
          await Promise.all(promises)
        } catch (err) {
          console.error('[closeSelectedRecords] Failed to cascade disable group or member:', err)
        }
      }

      successCount++
    } catch (e) {
      console.error(`[closeSelectedRecords] Error processing ${licenseCid}:`, e)
      errorCount++
    }
  }

  // 並行上限 3 (原 CONCURRENCY_LIMIT)
  const CONCURRENCY_LIMIT = 3
  for (let i = 0; i < selected.length; i += CONCURRENCY_LIMIT) {
    await Promise.all(selected.slice(i, i + CONCURRENCY_LIMIT).map((row) => processItem(row)))
  }

  VisibleLoaderElement(false)
  alert(`作業完成。成功 ${successCount} 筆，失敗 ${errorCount} 筆。`)
  selectAll.value = false
  await loadLicenses(currentPage.value)
}

// ===== 附件選擇 (原 EnableDragFile：50MB/檔、上限 50 檔、去重) =====
function humanSize(n) {
  const u = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024
    i++
  }
  return n.toFixed(1) + ' ' + u[i]
}

function addPickedFiles(target, newList) {
  const files = Array.from(newList || []).filter((f) => f.size <= 50 * 1024 * 1024)
  const unique = files.filter(
    (nf) => !target.value.some((ef) => ef.name === nf.name && ef.size === nf.size && ef.lastModified === nf.lastModified),
  )
  if (!unique.length && files.length) console.error('[uploader:error]', '選擇的檔案已存在。')
  let combined = target.value.concat(unique)
  if (combined.length > 50) {
    console.error('[uploader:error]', '最多 50 個檔案')
    combined = combined.slice(0, 50)
  }
  target.value = combined
}

function triggerInsertFilePick() {
  insertFileInput.value?.click()
}
function onInsertFilePick(e) {
  addPickedFiles(insertFiles, e.target.files)
  e.target.value = ''
}
function onInsertDrop(e) {
  insertDragHighlight.value = false
  addPickedFiles(insertFiles, e.dataTransfer?.files)
}
function triggerUpdateFilePick() {
  updateFileInput.value?.click()
}
function onUpdateFilePick(e) {
  addPickedFiles(updateFiles, e.target.files)
  e.target.value = ''
  // 原邏輯：加入新檔案時清除既有附件
  if (updateFiles.value.length > 0) existingAttachmentPaths.value = []
}
function onUpdateDrop(e) {
  updateDragHighlight.value = false
  addPickedFiles(updateFiles, e.dataTransfer?.files)
  if (updateFiles.value.length > 0) existingAttachmentPaths.value = []
}

function closeProductDropdown() {
  productDropdownOpen.value = false
}

function selectInsertProduct(pType) {
  insertForm.product_type = pType
  productDropdownOpen.value = false
}

// ===== 新增訂單 Modal (原 GotoPageLicenseInsertOne) =====
function openAddModal() {
  // 設定今天日期
  insertForm.license_begin_time = new Date().toLocaleDateString('sv-SE')
  // 確保 owner_cid 與 sessionStorage 中最新的 group_cid 快取同步
  insertForm.owner_cid = window.sessionStorage.getItem('group_cid') || ''
  insertForm.customer_name = ''
  insertForm.license_days = ''
  insertForm.license_count = ''
  insertForm.note00 = ''
  insertFiles.value = []
  Object.assign(teacherForm, { name: '', email: '', password: '', password_confirm: '' })

  // 動態載入產品選單與預設值
  insertForm.product_type = window.sessionStorage.getItem('product_type') || 'avacast'
  try {
    const allKeys = Object.keys(PRODUCT_DICTIONARY)
    const ownedProductsStr = window.sessionStorage.getItem('owned_products')
    if (ownedProductsStr) {
      for (const op of JSON.parse(ownedProductsStr)) {
        if (!allKeys.includes(op)) allKeys.push(op)
      }
    }
    productOptions.value = allKeys.map((pType) => ({ type: pType, name: getProductName(pType) }))
  } catch (e) {
    console.error('Error parsing owned_products for dropdown', e)
  }

  // datalist 聯想選項：從目前列表資料提取不重複的學校
  const schools = []
  rows.value.forEach((row) => {
    const name = String(row.customer_name || '').trim()
    if (name && !schools.includes(name)) schools.push(name)
  })
  schoolOptions.value = schools

  insertModalVisible.value = true
}

function closeInsertModal() {
  insertModalVisible.value = false
  productDropdownOpen.value = false
}

// ===== 編輯訂單 Modal (原 LicenseSelectOne + GotoPageLicenseUpdateOne) =====
async function openEditModal(licenseCid) {
  updateFiles.value = []
  existingAttachmentPaths.value = []
  VisibleLoaderElement(true)
  try {
    const json_object = await apiCall(CsRequestLicenseSelectOneRecordByCID, licenseCid, requestController)
    const record = json_object.records || {}
    const first = (key) => (record[key] ? record[key][0] || '' : '')

    Object.assign(updateFormL, {
      license_cid: first('license_cid'),
      create_time: first('create_time') ? first('create_time').split(' ')[0] : '',
      agent_cid: window.sessionStorage.getItem('member_cid') || '',
      owner_cid: first('owner_cid'),
      record_state: first('record_state') || '1',
      license_key: first('license_key'),
      license_begin_time: first('license_begin_time') ? first('license_begin_time').split(' ')[0] : '',
      license_days: first('license_days'),
      license_count: first('license_count'),
      sale_amount: first('sale_amount'),
      country: first('country'),
      customer_name: first('customer_name'),
      customer_gender: first('customer_gender'),
      customer_birthday: first('customer_birthday'),
      customer_phone: first('customer_phone'),
      customer_postalcode: first('customer_postalcode'),
      customer_address: first('customer_address'),
      customer_email: first('customer_email'),
      note00: first('note00'),
      product_type: first('product_type') || window.sessionStorage.getItem('product_type') || '',
    })

    // 處理附件資料 (attachments 每個元素都是 JSON 字串，含路徑陣列)
    if (record.attachments && record.attachments.length > 0) {
      const allPaths = []
      for (let i = 0; i < record.attachments.length; i++) {
        const attachmentStr = record.attachments[i]
        if (attachmentStr && attachmentStr.trim() !== '') {
          try {
            const parsed = JSON.parse(attachmentStr)
            if (Array.isArray(parsed)) allPaths.push(...parsed)
            else if (typeof parsed === 'string') allPaths.push(parsed)
          } catch (parseError) {
            console.warn(`無法解析第 ${i} 個附件:`, attachmentStr, parseError)
          }
        }
      }
      existingAttachmentPaths.value = allPaths
    }

    updateModalVisible.value = true
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

function closeUpdateModal() {
  updateModalVisible.value = false
}

// 原 getQuarterStartDate：回傳該季度的第一天
function getQuarterStartDate(date) {
  const currentDate = new Date(date)
  const quarterStartMonth = Math.floor(currentDate.getMonth() / 3) * 3
  return new Date(currentDate.getFullYear(), quarterStartMonth, 1)
}

// 原 updateDashboardStats：後端統計數字 → 前端計算 YoY 與 QoQ
function updateDashboardStats(stats) {
  if (!stats) return
  const activeToday = parseInt(stats.active_today?.[0]) || 0
  const activeLastYear = parseInt(stats.active_last_year?.[0]) || 0
  const curQAdded = parseInt(stats.current_quarter_added?.[0]) || 0
  const lastQAdded = parseInt(stats.last_quarter_added?.[0]) || 0

  totalCount.value = activeToday
  if (activeLastYear === 0) {
    totalGrowthVisible.value = false
  } else {
    const growthRate = ((activeToday - activeLastYear) / activeLastYear) * 100
    totalGrowthText.value = `${growthRate >= 0 ? '+' : '-'}${Math.abs(growthRate).toFixed(1)}%`
    totalGrowthUp.value = growthRate >= 0
    totalGrowthVisible.value = true
  }

  quarterlyCount.value = curQAdded
  if (lastQAdded === 0) {
    quarterlyGrowthText.value = curQAdded > 0 ? '+∞%' : '0%'
    quarterlyGrowthUp.value = true
    quarterlyGrowthVisible.value = true
  } else {
    const growthRate = ((curQAdded - lastQAdded) / lastQAdded) * 100
    quarterlyGrowthText.value = `${growthRate >= 0 ? '+' : '-'}${Math.abs(growthRate).toFixed(1)}%`
    quarterlyGrowthUp.value = growthRate >= 0
    quarterlyGrowthVisible.value = true
  }
}

// 統計 API 在背景獨立完成，不卡住列表渲染 (原 statsPromise)
function loadStatistics(condition_type, condition_value) {
  const todayDateObj = new Date()
  const today_date = todayDateObj.toISOString().split('T')[0]
  const lastYearObj = new Date()
  lastYearObj.setFullYear(lastYearObj.getFullYear() - 1)
  const last_year_date = lastYearObj.toISOString().split('T')[0]

  const curQStart = getQuarterStartDate(todayDateObj)
  const cur_q_begin = curQStart.toISOString().split('T')[0] + ' 00:00:00'
  const cur_q_end = today_date + ' 23:59:59'

  const lastQEndObj = new Date(curQStart)
  lastQEndObj.setDate(lastQEndObj.getDate() - 1)
  const lastQStart = getQuarterStartDate(lastQEndObj)
  const last_q_begin = lastQStart.toISOString().split('T')[0] + ' 00:00:00'
  const last_q_end = lastQEndObj.toISOString().split('T')[0] + ' 23:59:59'

  apiCall(
    CsRequestLicenseGetStatistics,
    condition_type,
    condition_value,
    today_date,
    last_year_date,
    cur_q_begin,
    cur_q_end,
    last_q_begin,
    last_q_end,
    requestController,
  )
    .then((statsResult) => {
      if (statsResult && statsResult.records) updateDashboardStats(statsResult.records)
    })
    .catch((e) => {
      if (e.name !== 'AbortError') console.error('Stats API Error:', e)
    })
}

async function loadLicenses(page = 1) {
  if (requestController) requestController.abort()
  requestController = new AbortController()
  currentPage.value = page
  VisibleLoaderElement(true)

  try {
    const { condition_type, condition_value } = getConditionTarget()
    const { b_time, e_time } = getSearchTimeRange()
    loadStatistics(condition_type, condition_value)

    // 原 LicenseSelectAll：直接取列表，總筆數用回傳的 total_records (後端分頁)
    const result = await apiCall(
      CsRequestLicenseSelectAllRecords,
      condition_type,
      condition_value,
      b_time,
      e_time,
      (page - 1) * rowsPerPage.value,
      rowsPerPage.value,
      customerName.value.trim(),
      sortField.value,
      sortOrder.value,
      statusFilter.value,
      requestController,
    )

    totalRecords.value = parseInt(result.total_records) || 0
    if (totalRecords.value <= 0) {
      rows.value = []
      return
    }

    const records = result.records || {}
    const recordCount = records.license_cid ? records.license_cid.length : 0
    rows.value = Array.from({ length: recordCount }, (_, index) => {
      const license_begin_time = records.license_begin_time?.[index] || ''
      const license_days = records.license_days?.[index] || ''
      const note00 = records.note00?.[index] || ''
      const attachments = records.attachments?.[index] || ''

      // 原 renderTable：到期時間 = 授權日期 + 天數 (整天結尾)，並判斷是否已到期
      const begin_time = new Date(license_begin_time.substring(0, 10))
      const daysNum = parseInt(license_days, 10) || 0
      let end_day = DateAdd('d', daysNum, begin_time)
      if (daysNum !== 0) end_day = SetToEndOfDay(end_day)

      return {
        license_cid: records.license_cid?.[index] || '',
        create_time: records.create_time?.[index] || '',
        customer_name: records.customer_name?.[index] || '',
        license_begin_time,
        license_days,
        license_count: records.license_count?.[index] || '',
        record_state: records.record_state?.[index] || '1',
        product_type: records.product_type?.[index] || '',
        owner_cid: records.owner_cid?.[index] || '',
        note00,
        end_day_text: FormatDateTime(end_day).substring(0, 10),
        expired: !IsAfterToday(end_day),
        // 原 renderTable：有備註或附件時顯示 Memo 圖示
        hasNote:
          (note00 && note00.trim() !== '') ||
          (attachments && attachments.trim() !== '' && attachments.trim() !== '[]'),
        checked: false,
      }
    })
  } catch (e) {
    if (e.name !== 'AbortError' && e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

// 原 LicenseInsertOne：送欄位 + 檔案；avaclassroom 產品含教學組長自動註冊流程
async function LicenseInsertOne() {
  const license_data = Object.create(LicenseData)
  license_data.owner_cid = insertForm.owner_cid
  license_data.agent_cid = window.sessionStorage.getItem('member_cid')
  license_data.record_state = 1
  license_data.license_begin_time = insertForm.license_begin_time
  license_data.product_type = insertForm.product_type || 'avacast'
  license_data.license_days = insertForm.license_days
  license_data.license_count = insertForm.license_count
  license_data.sale_amount = ''
  license_data.country = ''
  license_data.customer_name = insertForm.customer_name
  license_data.customer_gender = ''
  license_data.customer_birthday = ''
  license_data.customer_phone = ''
  license_data.customer_postalcode = ''
  license_data.customer_address = ''
  license_data.customer_email = ''
  license_data.note00 = insertForm.note00

  // --- [Ava Classroom 教學組長自動註冊流程] ---
  if (license_data.product_type === 'avaclassroom') {
    const teacher_name = teacherForm.name.trim()
    const teacher_email = teacherForm.email.trim()
    const teacher_password = teacherForm.password.trim()
    const teacher_password_confirm = teacherForm.password_confirm.trim()

    // 步驟 A：輸入欄位驗證
    if (!teacher_name || !teacher_email || !teacher_password || !teacher_password_confirm) {
      alert(t('license.error_empty_teacher'))
      return
    }
    if (teacher_email.indexOf('@') === -1) {
      alert(t('license.error_invalid_email'))
      return
    }
    if (teacher_password !== teacher_password_confirm) {
      alert(t('license.error_password_mismatch'))
      return
    }

    VisibleLoaderElement(true)

    // 步驟 B：尋找 parent_cid (該組織下具有 tier 3 權限的代理商帳號)
    const userTier = window.sessionStorage.getItem('tier')
    let parent_cid = ''

    try {
      if (userTier === '3') {
        parent_cid = window.sessionStorage.getItem('member_cid')
      } else if (userTier === '1' || userTier === '2') {
        const target_group_cid = (license_data.owner_cid || '').trim()

        if (target_group_cid.startsWith('sch_')) {
          // 若傳入的是現有學校群組，直接查該群組取得其上層代理商管理員 (owner_cid)
          await new Promise((resolve) => {
            window.Cyberspace.Client.SendRequest(
              '/ava_system/group/select_one_record',
              { group_cid: target_group_cid },
              (ok, res) => {
                if (ok) {
                  try {
                    const groupJson = JSON.parse(res)
                    if ((groupJson.errno == 1 || groupJson.errno == 0) && groupJson.records) {
                      const owner = Array.isArray(groupJson.records.owner_cid)
                        ? groupJson.records.owner_cid[0]
                        : groupJson.records.owner_cid || ''
                      if (owner) parent_cid = owner.trim()
                    }
                  } catch (e) {
                    console.error('Failed to parse school group owner:', e)
                  }
                }
                resolve()
              },
            )
          })
        }

        if (!parent_cid) {
          const memberList = await new Promise((resolve, reject) => {
            window.Cyberspace.Client.SendRequest(
              '/ava_system/member/select_all_records',
              { condition_type: 5, condition_value: target_group_cid, search_name: '', offset: 0, row_count: 100 },
              (ok, result) => {
                if (!ok) {
                  reject(new Error('網路連線錯誤，無法查詢組織下的成員帳號。'))
                  return
                }
                try {
                  const json = JSON.parse(result)
                  if (json.errno == 1 || json.errno == 0) {
                    const m_cids = (json.records && json.records.member_cid) || json.member_cid
                    resolve(Array.isArray(m_cids) ? m_cids : m_cids ? [m_cids] : [])
                  } else {
                    reject(new Error('後端錯誤代碼: ' + json.errno))
                  }
                } catch (e) {
                  reject(new Error('解析組織成員回應失敗。'))
                }
              },
            )
          })

          if (memberList.length === 0) throw new Error('該組織旗下沒有任何成員帳號！')

          // select_all_records 會抹除 tier 欄位，須逐一查詢 select_one_record 篩出 tier === "3"
          const details = await Promise.all(
            memberList.map(
              (cid) =>
                new Promise((resolve) => {
                  window.Cyberspace.Client.SendRequest('/ava_system/member/select_one_record', { member_cid: cid }, (ok, res) => {
                    if (ok) {
                      try {
                        const detailJson = JSON.parse(res)
                        if (detailJson.errno == 1 || detailJson.errno == 0) {
                          resolve({ cid, detail: detailJson })
                          return
                        }
                      } catch (e) {}
                    }
                    resolve({ cid, detail: null })
                  })
                }),
            ),
          )

          for (const item of details) {
            if (item.detail && item.detail.records) {
              const records = item.detail.records
              const m_tier = Array.isArray(records.tier) ? records.tier[0] : records.tier || ''
              if (String(m_tier) === '3') {
                parent_cid = item.cid
                break
              }
            }
          }
        }

        if (!parent_cid) throw new Error('該隸屬組織尚未建立代理商管理員，無法建立教學組長帳號！')
      } else {
        throw new Error('您的帳號權限不足以建立教學組長！')
      }

      if (!parent_cid) throw new Error('找不到上層代理商帳號，無法建立教學組長帳號！')

      // 步驟 B-2：檢查或建立學校群組
      const school_name = (license_data.customer_name || '').trim()
      if (!school_name) throw new Error('學校名稱（客戶名稱）不得為空！')

      let school_group_cid = ''

      // 查該代理商旗下所有 group，檢查有無同名群組
      await new Promise((resolveGroup, rejectGroup) => {
        window.Cyberspace.Client.SendRequest(
          '/ava_system/group/select_all_records',
          { condition_type: '2', condition_value: parent_cid, offset: 0, row_count: 100 },
          (ok, result) => {
            if (!ok) {
              rejectGroup(new Error('網路連線錯誤，無法查詢已存在的學校群組。'))
              return
            }
            try {
              const json = JSON.parse(result)
              if (json.errno == 1 || json.errno == 0) {
                if (json.records) {
                  const names = json.records.group_name || []
                  const cids = json.records.group_cid || []
                  const nameList = Array.isArray(names) ? names : names ? [names] : []
                  const cidList = Array.isArray(cids) ? cids : cids ? [cids] : []
                  for (let i = 0; i < nameList.length; i++) {
                    if (String(nameList[i]).trim() === school_name) {
                      school_group_cid = String(cidList[i]).trim()
                      break
                    }
                  }
                }
                resolveGroup()
              } else {
                rejectGroup(new Error('查詢已存在群組失敗，後端錯誤碼: ' + json.errno))
              }
            } catch (e) {
              rejectGroup(new Error('解析群組查詢回應失敗。'))
            }
          },
        )
      })

      // 若同名群組不存在，自動新建
      if (!school_group_cid) {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
        const random_suffix = Math.random().toString(36).substring(2, 6)
        school_group_cid = `sch_${parent_cid}_${today}_${random_suffix}`

        await new Promise((resolveInsert, rejectInsert) => {
          window.Cyberspace.Client.SendRequest(
            '/ava_system/group/insert_one_record',
            {
              group_cid: school_group_cid,
              group_name: school_name,
              group_type: 0,
              owner_cid: parent_cid,
              record_state: 1,
              contact: teacher_name || license_data.customer_name || '',
              group_ubn: '',
              contact_phone_01: license_data.customer_phone || '',
              contact_email_01: teacher_email || license_data.customer_email || '',
              city: '',
              country: license_data.country || '',
              address: license_data.customer_address || '',
              billing_addr: license_data.customer_address || '',
            },
            (ok, result) => {
              if (!ok) {
                rejectInsert(new Error('網路連線錯誤，無法建立新的學校群組。'))
                return
              }
              try {
                const json = JSON.parse(result)
                if (json.errno == 1 || json.errno == 0) resolveInsert()
                else rejectInsert(new Error('建立新學校群組失敗，後端錯誤碼: ' + json.errno))
              } catch (e) {
                rejectInsert(new Error('解析建立群組回應失敗。'))
              }
            },
          )
        })
      }

      // 後續流程的群組關聯改為學校 group_cid；訂單代理人設為代理商代表帳號
      license_data.owner_cid = school_group_cid
      if (parent_cid) license_data.agent_cid = parent_cid

      // 步驟 C：建立教學組長帳號 (Tier 4)
      await new Promise((resolve, reject) => {
        window.Cyberspace.Client.SendRequest(
          '/ava_system/member/insert_one_record',
          {
            parent_cid: parent_cid,
            member_cid: teacher_email,
            password: teacher_password,
            member_name: teacher_name,
            group_cid: license_data.owner_cid,
            phone_cell: '',
            phone_home: '',
            phone_work: '',
            email: teacher_email,
            address: '',
            city: '',
            country: '',
            gender: '',
            birthday: '1991-01-01',
            note00: '',
            avatar_url: '',
          },
          (ok, result) => {
            if (!ok) {
              reject(new Error('網路連線錯誤，註冊教學組長帳號失敗。'))
              return
            }
            try {
              const json = JSON.parse(result)
              if (json.errno == 1 || json.errno == 0) {
                resolve()
              } else if (json.errno == -1059) {
                // 帳號已存在：復原 record_state=1 並更新密碼
                window.Cyberspace.Client.SendRequest(
                  '/ava_system/member/update_one_record',
                  {
                    member_cid: teacher_email,
                    password: teacher_password,
                    member_name: teacher_name,
                    record_state: 1,
                    group_cid: license_data.owner_cid,
                    email: teacher_email,
                    birthday: '1991-01-01',
                    phone_cell: '', phone_home: '', phone_work: '',
                    address: '', city: '', country: '', gender: '',
                    note00: '', avatar_url: '',
                  },
                  () => resolve(),
                )
              } else {
                reject(new Error('後端錯誤代碼: ' + json.errno))
              }
            } catch (e) {
              reject(new Error('解析註冊回應失敗。'))
            }
          },
        )
      })

      // 步驟 D：關聯 Email 到訂購人 Email 欄位中
      license_data.customer_email = teacher_email
    } catch (err) {
      alert((t('license.error_create_failed') || '建立教學組長帳號失敗：') + err.message)
      VisibleLoaderElement(false)
      return
    }
  }

  // 組 payload：沒有檔案就不放 files[]
  const files = insertFiles.value.slice()
  const payload = Object.assign({}, license_data)
  if (files.length > 0) payload['files[]'] = files

  VisibleLoaderElement(true)
  try {
    await apiCall(CsRequestLicenseInsertOneRecord, payload)
    insertFiles.value = []
    insertModalVisible.value = false

    alert(t('common.success'))

    // 強制將剛新增的產品寫入快取，避免後端資料庫延遲導致抓到舊資料
    try {
      const addedProduct = license_data.product_type
      const currentOwnedStr = window.sessionStorage.getItem('owned_products')
      let currentOwned = []
      if (currentOwnedStr) currentOwned = JSON.parse(currentOwnedStr)
      if (!currentOwned.includes(addedProduct)) {
        currentOwned.push(addedProduct)
        window.sessionStorage.setItem('owned_products', JSON.stringify(currentOwned))
      }
    } catch (e) {}

    window.sessionStorage.setItem('product_type', license_data.product_type)

    // [修復] 為了讓使用者立刻看到新增的產品，避免當前頁面硬重載，改用 SPA 狀態切換：
    // 以 replace 更新路由的 product 參數 (不留歷史紀錄，等同原版 history.replaceState)；
    // App.vue 以 fullPath 為 key，query 改變會重新掛載本頁並依新產品重新查詢，
    // 等同原版 configureListPageForProduct + LicenseSelectAll 的效果
    const addedProduct = license_data.product_type
    if ((route.query.product || '') !== addedProduct) {
      router.replace({ path: route.path, query: { ...route.query, product: addedProduct } })
    } else {
      await loadLicenses(1)
    }
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

// 原 LicenseUpdateOne：欄位 + 新檔案 + 既有附件路徑合併送出
async function LicenseUpdateOne() {
  const license_data = Object.create(LicenseData)
  license_data.product_type = updateFormL.product_type || window.sessionStorage.getItem('product_type')
  license_data.license_cid = updateFormL.license_cid
  license_data.record_state = updateFormL.record_state
  license_data.owner_cid = updateFormL.owner_cid
  license_data.license_begin_time = updateFormL.license_begin_time
  license_data.license_days = updateFormL.license_days || new Date().toLocaleDateString('sv-SE')
  license_data.license_count = updateFormL.license_count
  license_data.sale_amount = updateFormL.sale_amount
  license_data.country = updateFormL.country
  license_data.customer_name = updateFormL.customer_name
  license_data.customer_gender = updateFormL.customer_gender
  license_data.customer_birthday = updateFormL.customer_birthday
  license_data.customer_phone = updateFormL.customer_phone
  license_data.customer_postalcode = updateFormL.customer_postalcode
  license_data.customer_address = updateFormL.customer_address
  license_data.customer_email = updateFormL.customer_email
  license_data.note00 = updateFormL.note00

  const files = updateFiles.value.slice()
  const existingPaths = existingAttachmentPaths.value.slice()

  // 合併舊附件路徑 + 新檔案名稱
  const allAttachmentInfo = [...existingPaths]
  files.forEach((file) => {
    allAttachmentInfo.push({ type: 'new_file', name: file.name, size: file.size })
  })

  const payload = Object.assign({}, license_data)
  if (files.length > 0) payload['files[]'] = files
  if (allAttachmentInfo.length > 0) payload['existing_attachments'] = JSON.stringify(allAttachmentInfo)

  VisibleLoaderElement(true)
  try {
    await apiCall(CsRequestLicenseUpdateOneRecord, payload)
    updateFiles.value = []
    alert(t('common.success'))
    updateModalVisible.value = false
    await loadLicenses(currentPage.value)
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

// 全站 UI 改版：不再載入舊版 /css/page/license.css (橘色 hover、橘色 checkbox)，
// 所需樣式已改由設計 Token 實作於 LicenseView.css / styles/ui.css
onMounted(() => {
  // 原 initLicenseView：日期預設值 (sessionStorage 記憶 > 近三個月)
  const savedBeginTime = window.sessionStorage.getItem('dashboard_begin_time')
  const savedEndTime = window.sessionStorage.getItem('dashboard_end_time')
  if (savedBeginTime && savedEndTime) {
    beginTime.value = savedBeginTime
    endTime.value = savedEndTime
  } else {
    const BDate = DateAdd('m', -3, new Date())
    const EDate = new Date()
    beginTime.value = BDate.toLocaleDateString('sv-SE')
    endTime.value = EDate.toLocaleDateString('sv-SE')
  }

  loadLicenses(1)
  // 點擊外部隱藏產品下拉選單 (原 click.hideProductDrop)
  document.addEventListener('click', closeProductDropdown)
})

onBeforeUnmount(() => {
  requestController?.abort()
  document.removeEventListener('click', closeProductDropdown)
})

  return {
    rows,
    totalRecords,
    currentPage,
    rowsPerPage,
    customerName,
    beginTime,
    endTime,
    statusFilter,
    sortField,
    sortOrder,
    selectAll,
    statusDropdownOpen,
    insertBtnHover,
    editBtnHover,
    downloadBtnHover,
    downloadAllBtnHover,
    insertModalVisible,
    productDropdownOpen,
    productOptions,
    schoolOptions,
    insertFiles,
    insertDragHighlight,
    insertFileInput,
    teacherForm,
    insertForm,
    insertIsClassroom,
    updateModalVisible,
    updateFiles,
    updateDragHighlight,
    updateFileInput,
    existingAttachmentPaths,
    updateFormL,
    totalCount,
    totalGrowthVisible,
    totalGrowthText,
    totalGrowthUp,
    quarterlyCount,
    quarterlyGrowthVisible,
    quarterlyGrowthText,
    quarterlyGrowthUp,
    showCustomerSearch,
    deleteModalVisible,
    deleteModalMessage,
    deleteModalItems,
    statusOptions,
    statusOptionLabel,
    requestController,
    getConditionTarget,
    getSearchTimeRange,
    pageTitle,
    customerColLabel,
    toggleSort,
    sortIconStyle,
    toggleSelectAll,
    clearCustomerName,
    toggleStatusDropdown,
    selectStatus,
    goRowDashboard,
    openEditSelected,
    downloadSelectedLicenses,
    generateOrdersExcel,
    showToast,
    exportAllLicenses,
    deleteSelectedLicenses,
    confirmDeleteLicenses,
    humanSize,
    addPickedFiles,
    triggerInsertFilePick,
    onInsertFilePick,
    onInsertDrop,
    triggerUpdateFilePick,
    onUpdateFilePick,
    onUpdateDrop,
    closeProductDropdown,
    selectInsertProduct,
    openAddModal,
    closeInsertModal,
    openEditModal,
    closeUpdateModal,
    getQuarterStartDate,
    updateDashboardStats,
    loadStatistics,
    loadLicenses,
    LicenseInsertOne,
    LicenseUpdateOne,
    t,
  }
}
