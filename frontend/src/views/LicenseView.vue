<template>
  <AppLayout>
    <div class="page">
      <div class="license-header-container" style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div class="page-caption" style="display: flex; align-items: center; margin-bottom: 1rem;">
            <div class="page-icon-container">
              <img src="/assets/images/IdentificationBadge.svg" alt="" class="page-icon" />
            </div>
            <h1>{{ t('license.title_list_license') || t('sidebarnav.license') || '訂單資訊' }}</h1>
          </div>
          <button
            type="button"
            id="license_list-button-gotopage_insert"
            class="image_button_default"
            style="background-color: #214f7c; width: 218px; height: 48px; border-radius: 10px; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px;"
            @click="openAddModal"
          >
            <img id="license_insert_button_icon" src="/assets/images/Group 607.svg" alt="" style="width: 20px; height: 20px" />
            <p style="margin-bottom: 3px">{{ t('common.add') || '新增訂單' }}</p>
          </button>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end;">
          <img src="/assets/images/Group (2).svg" alt="" class="page-big-icon" style="width: 122px; height: auto; margin-right: 1rem" />
          <section class="stats-card-container" style="background-color: #e6f1fd; min-height: 112px; border-radius: 16px; color: #404040; padding: 24px; display: flex; flex-wrap: wrap; gap: 2rem; align-items: flex-start;">
            <div>
              <p style="font-size: 14px; line-height: 20px; margin-bottom: 0.5rem;">{{ t('license.total_licensed_count') || '授權總數' }}</p>
              <div style="display: flex; align-items: center; gap: 1rem;">
                <p id="license-total-count" style="font-weight: 600; font-size: 24px">0</p>
                <div id="license-total-growth-rate" style="display: flex; align-items: center; gap: 0.5rem;">
                  <span id="license-total-growth-percentage" style="font-size: 14px">0%</span>
                  <img id="license-total-growth-icon" src="/assets/images/up.svg" alt="" style="width: 16px; height: 16px" />
                </div>
              </div>
            </div>
            <div>
              <p style="font-size: 14px; line-height: 20px; margin-bottom: 0.5rem;">{{ t('license.new_this_quarter') || '本季新增' }}</p>
              <div style="display: flex; align-items: center; gap: 1rem;">
                <p id="license-quarterly-count" style="font-weight: 600; font-size: 24px; margin-right: 1rem;">0</p>
                <div id="license-quarterly-growth-rate" style="display: flex; align-items: center; gap: 0.5rem;">
                  <span id="license-quarterly-growth-percentage" style="font-size: 14px">0%</span>
                  <img id="license-quarterly-growth-icon" src="/assets/images/up.svg" alt="" style="width: 16px; height: 16px" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div class="responsive-toolbar" style="margin-bottom: 1rem; gap: 0.75rem; flex-wrap: wrap;">
        <div class="responsive-toolbar-group">
          <input id="license-select-all" type="checkbox" v-model="selectAll" />
          <label for="license-select-all" style="display: flex; align-items: center; font-size: 14px; color: #374151; cursor: pointer; margin-right: 8px;">
            {{ t('common.select_all') || '全選' }}
          </label>
          <button type="button" id="license-edit-button" class="edit-button" @click="openEditSelected">
            <img id="license-edit-icon" src="/assets/images/edit.svg" alt="編輯" style="width: 24px; height: 24px; object-fit: contain" />
          </button>
          <button type="button" id="license-download-button" class="edit-button" @click="downloadSelectedLicenses">
            <img id="license-download-icon" src="/assets/images/download.svg" alt="下載" style="width: 20px; height: 20px; object-fit: contain" />
          </button>
          <button type="button" id="license-download-all-button" class="edit-button" title="匯出全部" @click="exportAllLicenses">
            <img id="license-download-all-icon" src="/assets/images/download_all_light_blue.svg" alt="匯出全部" style="width: 20px; height: 20px; object-fit: contain" />
          </button>
          <button type="button" id="license-delete-button" class="edit-button-trash" @click="deleteSelectedLicenses">
            <img src="/assets/images/trash.svg" alt="刪除" style="width: 20px; height: 20px; object-fit: contain" />
          </button>
        </div>

        <div class="responsive-toolbar-group" style="align-items: flex-end">
          <div style="display: flex; flex-direction: column">
            <label for="license_list-begin_time" style="font-size: 12px; color: #666; margin-bottom: 2px;">
              {{ t('license.search_date_start') || '開始日期' }}
            </label>
            <input id="license_list-begin_time" v-model="beginTime" type="date" class="device-date-input" style="padding: 6px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; height: 38px; box-sizing: border-box;" title="選擇開始日期" />
          </div>
          <div style="display: flex; flex-direction: column">
            <label for="license_list-end_time" style="font-size: 12px; color: #666; margin-bottom: 2px;">
              {{ t('license.search_date_end') || '結束日期' }}
            </label>
            <input id="license_list-end_time" v-model="endTime" type="date" class="device-date-input" style="padding: 6px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; height: 38px; box-sizing: border-box;" title="選擇結束日期" />
          </div>
          <button
            type="button"
            id="license_list-button-date_search"
            style="margin-left: 8px; height: 38px; padding: 0 12px; border-radius: 10px; border: 1px solid #ddd; background: #fff; cursor: pointer;"
            @click="loadLicenses(1)"
          >
            {{ t('license.search_confirm') || t('common.search') || '搜尋' }}
          </button>
          <div style="position: relative">
            <div
              id="license-status-button"
              style="width: 150px; height: 38px; background: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: space-between; padding: 0 4px 0 12px; margin-left: 12px; cursor: pointer; font-size: 14px;"
              @click="toggleStatusDropdown"
            >
              <span id="license-status-text" style="color: rgba(0, 0, 0, 0.7);">
                {{ statusOptionLabel }}
              </span>
              <img src="/assets/images/list_section.svg" alt="選單" />
            </div>

            <div
              id="license-status-options"
              v-show="statusDropdownOpen"
              style="position: absolute; top: 42px; left: 0; width: 150px; background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); z-index: 1000; overflow: hidden;"
            >
              <div
                v-for="option in statusOptions"
                :key="option.value"
                class="license-status-option"
                @click="selectStatus(option.value)"
                style="padding: 12px; cursor: pointer; font-size: 14px; color: rgba(0, 0, 0, 0.7); transition: background-color 0.2s;"
              >
                {{ option.label }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="viewpoint-container">
        <table class="frame-table" style="margin-top: 0; border-spacing: 0;">
          <thead>
            <tr>
              <th style="width: 5%"></th>
              <th style="width: 5%"></th>
              <th @click="toggleSort('create_time')" style="cursor: pointer">{{ t('common.create_time') || '建立時間' }}<img id="sort-create_time" src="/assets/images/sort_up.svg" alt="" class="sort-icon" :style="sortIconStyle('create_time')" /></th>
              <th @click="toggleSort('customer_name')" style="cursor: pointer">{{ t('common.customer_name') || '客戶名稱' }}<img id="sort-customer_name" src="/assets/images/sort_up.svg" alt="" class="sort-icon" :style="sortIconStyle('customer_name')" /></th>
              <th @click="toggleSort('license_begin_time')" style="cursor: pointer">{{ t('common.license_begin_time') || '開始日期' }}<img id="sort-license_begin_time" src="/assets/images/sort_up.svg" alt="" class="sort-icon" :style="sortIconStyle('license_begin_time')" /></th>
              <th>{{ t('common.license_end_time') || '結束日期' }}</th>
              <th>{{ t('common.license_days') || '天數' }}</th>
              <th @click="toggleSort('license_count')" style="cursor: pointer">{{ t('common.license_count') || '數量' }}<img id="sort-license_count" src="/assets/images/sort_up.svg" alt="" class="sort-icon" :style="sortIconStyle('license_count')" /></th>
              <th>{{ t('common.note00') || '備註' }}</th>
              <th>{{ t('common.action') || '操作' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filteredRows" :key="row.license_cid" :style="row.record_state === '0' ? { backgroundColor: '#f7f7f7' } : {}">
              <td><input v-model="row.checked" type="checkbox" class="license-row-checkbox" /></td>
              <td>
                <button type="button" class="link_text" @click="openEditModal(row.license_cid)">
                  <i class="iconfont">&#xe764;</i>
                </button>
              </td>
              <td>{{ row.create_time }}</td>
              <td>{{ row.customer_name }}</td>
              <td>{{ row.license_begin_time }}</td>
              <td>{{ row.license_end_time }}</td>
              <td>{{ row.license_days }}</td>
              <td>{{ row.license_count }}</td>
              <td>{{ row.note00 }}</td>
              <td>{{ row.record_state === '1' ? (t('common.open') || '啟用') : (t('common.close') || '停用') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="centered-content" style="margin-top: 1rem">
        <TablePagination :total-records="totalRecords" :rows-per-page="rowsPerPage" :current-page="currentPage" @change="(page) => loadLicenses(page)" />
      </div>

      <div v-if="modalVisible" class="modal-overlay" style="display: flex; position: fixed; inset: 0; background: rgba(0,0,0,0.45); justify-content: center; align-items: center; z-index: 1100">
        <div style="background: #fff; width: min(860px, 94vw); border-radius: 12px; padding: 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.2)">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem">
            <h2 style="margin: 0">{{ mode === 'add' ? (t('common.add') || '新增') : (t('common.update') || '編輯') }}</h2>
            <button type="button" class="link_text" @click="closeModal">✕</button>
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); gap: 1rem">
            <div>
              <label>{{ t('common.license_cid') || '授權編號' }}</label>
              <input v-model="licenseForm.license_cid" class="org-input" :disabled="mode === 'edit'" />
            </div>
            <div>
              <label>{{ t('common.owner_cid') || '擁有者' }}</label>
              <input v-model="licenseForm.owner_cid" class="org-input" />
            </div>
            <div>
              <label>{{ t('common.agent_cid') || '代理商' }}</label>
              <input v-model="licenseForm.agent_cid" class="org-input" />
            </div>
            <div>
              <label>{{ t('common.product_type') || '產品型態' }}</label>
              <input v-model="licenseForm.product_type" class="org-input" />
            </div>
            <div>
              <label>{{ t('common.license_begin_time') || '開始日期' }}</label>
              <input v-model="licenseForm.license_begin_time" type="date" class="org-input" />
            </div>
            <div>
              <label>{{ t('common.license_days') || '天數' }}</label>
              <input v-model="licenseForm.license_days" class="org-input" />
            </div>
            <div>
              <label>{{ t('common.license_count') || '數量' }}</label>
              <input v-model="licenseForm.license_count" class="org-input" />
            </div>
            <div>
              <label>{{ t('common.sale_amount') || '售價' }}</label>
              <input v-model="licenseForm.sale_amount" class="org-input" />
            </div>
            <div>
              <label>{{ t('common.customer_name') || '客戶名稱' }}</label>
              <input v-model="licenseForm.customer_name" class="org-input" />
            </div>
            <div>
              <label>{{ t('common.customer_email') || '客戶Email' }}</label>
              <input v-model="licenseForm.customer_email" class="org-input" />
            </div>
            <div>
              <label>{{ t('common.record_state') || '狀態' }}</label>
              <select v-model="licenseForm.record_state" class="org-input">
                <option value="1">{{ t('common.open') || '啟用' }}</option>
                <option value="0">{{ t('common.close') || '停用' }}</option>
              </select>
            </div>
            <div style="grid-column: 1 / -1">
              <label>{{ t('common.note00') || '備註' }}</label>
              <textarea v-model="licenseForm.note00" class="org-input" style="height: 90px; resize: vertical"></textarea>
            </div>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem">
            <button type="button" class="image_button_default" @click="closeModal">{{ t('common.cancel') || '取消' }}</button>
            <button type="button" class="image_button_default" style="background: #214f7c; color: #fff" @click="saveLicense">
              {{ t('common.save') || '儲存' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import TablePagination from '@/components/TablePagination.vue'
import { t } from '@/locales'
import { VisibleLoaderElement } from '@/core/loader'
import { apiCall } from '@/core/util'
import { useLegacyCss } from '@/composables/useLegacyCss'
import { runExportJob } from '@/services/exportJob'
import {
  LicenseData,
  CsRequestLicenseSelectAllCount,
  CsRequestLicenseSelectAllRecords,
  CsRequestLicenseSelectOneRecordByCID,
  CsRequestLicenseInsertOneRecord,
  CsRequestLicenseUpdateOneRecord,
  CsRequestLicenseExportStart,
  CsRequestLicenseExportStatus,
  CsRequestLicenseExportDownload,
} from '@/api/license'

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
const modalVisible = ref(false)
const mode = ref('add')
const selectAll = ref(false)
const statusDropdownOpen = ref(false)
const statusOptions = [
  { value: 'all', label: t('license.filter_all') || '全部' },
  { value: 'active', label: t('license.filter_active') || '啟用' },
  { value: 'expired', label: t('license.filter_expired') || '停用' },
]
const statusOptionLabel = computed(() => {
  const option = statusOptions.find((opt) => opt.value === statusFilter.value)
  return option ? option.label : t('license.filter_all') || '全部'
})

const createLicenseForm = () => ({
  ...LicenseData,
  license_cid: '',
  product_type: '1',
  create_time: '',
  record_state: '1',
  owner_cid: window.sessionStorage.getItem('member_cid') || window.Cyberspace?.Client?.getUsername() || '',
  agent_cid: '',
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
})

const licenseForm = reactive(createLicenseForm())
let requestController = null

function getConditionTarget() {
  const ownerCid = window.sessionStorage.getItem('member_cid') || window.Cyberspace?.Client?.getUsername() || ''
  return {
    condition_type: window._k_search_condition_type_by_agent_cid__and__owner_cid__and__record_state__and__product_type || '16',
    condition_value: ownerCid,
  }
}

const filteredRows = computed(() => {
  let result = rows.value.filter((row) => {
    if (statusFilter.value !== 'all') {
      const statusValue = statusFilter.value === 'active' ? '1' : statusFilter.value === 'expired' ? '0' : row.record_state
      if (String(row.record_state) !== statusValue) return false
    }
    if (!customerName.value.trim()) return true
    return [row.customer_name, row.note00, row.license_cid].some((value) =>
      String(value).toLowerCase().includes(customerName.value.trim().toLowerCase()),
    )
  })

  result = [...result].sort((a, b) => {
    const left = a[sortField.value] || ''
    const right = b[sortField.value] || ''
    const compare = String(left).localeCompare(String(right), undefined, { numeric: true })
    return sortOrder.value === 'asc' ? compare : -compare
  })
  return result
})

function toggleSort(field) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

function sortIconStyle(field) {
  const active = sortField.value === field
  return {
    width: '1rem',
    height: '1rem',
    marginLeft: '5px',
    transition: 'transform 0.2s ease',
    opacity: active ? 1 : 0.5,
    transform: active && sortOrder.value === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
  }
}

function resetForm() {
  Object.assign(licenseForm, createLicenseForm())
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
}

function openEditSelected() {
  const selected = rows.value.find((row) => row.checked)
  if (!selected) {
    alert(t('common.select_one_record') || '請先選擇一筆資料')
    return
  }
  openEditModal(selected.license_cid)
}

function downloadSelectedLicenses() {
  const selected = rows.value.filter((row) => row.checked)
  if (!selected.length) {
    alert(t('common.select_one_record') || '請先選擇一筆資料')
    return
  }
  alert(t('common.not_implemented') || '功能尚未實作')
}

function exportAllLicenses() {
  const condition_value = getConditionTarget().condition_value
  const statusFilterValue = statusFilter.value === 'active' ? '1' : statusFilter.value === 'expired' ? '0' : 'all'

  runExportJob({
    overlayId: 'license-export-overlay',
    startExport: (controller) =>
      apiCall(
        CsRequestLicenseExportStart,
        getConditionTarget().condition_type,
        condition_value,
        beginTime.value || '',
        endTime.value || '',
        customerName.value || '',
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

function deleteSelectedLicenses() {
  alert(t('common.not_implemented') || '功能尚未實作')
}

function closeModal() {
  modalVisible.value = false
  resetForm()
}

function openAddModal() {
  mode.value = 'add'
  resetForm()
  modalVisible.value = true
}

async function openEditModal(licenseCid) {
  mode.value = 'edit'
  resetForm()
  VisibleLoaderElement(true)
  try {
    const result = await apiCall(CsRequestLicenseSelectOneRecordByCID, licenseCid, requestController)
    const record = result.records || {}
    const first = (key) => (record[key] ? record[key][0] || '' : '')
    Object.assign(licenseForm, {
      license_cid: first('license_cid'),
      product_type: first('product_type'),
      create_time: first('create_time'),
      record_state: first('record_state') || '1',
      owner_cid: first('owner_cid'),
      agent_cid: first('agent_cid'),
      license_begin_time: first('license_begin_time') ? first('license_begin_time').split(' ')[0] : '',
      license_days: first('license_days'),
      license_count: first('license_count'),
      sale_amount: first('sale_amount'),
      country: first('country'),
      customer_name: first('customer_name'),
      customer_gender: first('customer_gender'),
      customer_birthday: first('customer_birthday') ? first('customer_birthday').split(' ')[0] : '',
      customer_phone: first('customer_phone'),
      customer_postalcode: first('customer_postalcode'),
      customer_address: first('customer_address'),
      customer_email: first('customer_email'),
      note00: first('note00'),
    })
    modalVisible.value = true
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

async function loadLicenses(page = 1) {
  if (requestController) requestController.abort()
  requestController = new AbortController()
  currentPage.value = page
  VisibleLoaderElement(true)

  try {
    const { condition_type, condition_value } = getConditionTarget()
    const countResult = await apiCall(CsRequestLicenseSelectAllCount, condition_type, condition_value, beginTime.value || '', endTime.value || '', requestController)
    totalRecords.value = Number(countResult.count || 0)

    if (totalRecords.value <= 0) {
      rows.value = []
      return
    }

    const result = await apiCall(
      CsRequestLicenseSelectAllRecords,
      condition_type,
      condition_value,
      beginTime.value || '',
      endTime.value || '',
      (page - 1) * rowsPerPage.value,
      rowsPerPage.value,
      customerName.value,
      sortField.value,
      sortOrder.value,
      statusFilter.value,
      requestController,
    )

    const records = result.records || {}
    const recordCount = records.license_cid ? records.license_cid.length : 0
    rows.value = Array.from({ length: recordCount }, (_, index) => ({
      license_cid: records.license_cid?.[index] || '',
      create_time: records.create_time?.[index] || '',
      customer_name: records.customer_name?.[index] || '',
      license_begin_time: records.license_begin_time?.[index] || '',
      license_end_time: records.license_end_time?.[index] || '',
      license_days: records.license_days?.[index] || '',
      license_count: records.license_count?.[index] || '',
      record_state: records.record_state?.[index] || '1',
      note00: records.note00?.[index] || '',
      checked: false,
    }))
  } catch (e) {
    if (e.name !== 'AbortError' && e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

async function saveLicense() {
  VisibleLoaderElement(true)
  try {
    if (mode.value === 'add') {
      await apiCall(CsRequestLicenseInsertOneRecord, licenseForm, requestController)
    } else {
      await apiCall(CsRequestLicenseUpdateOneRecord, licenseForm, requestController)
    }
    closeModal()
    await loadLicenses(currentPage.value)
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

onMounted(() => {
  useLegacyCss('/css/page/license.css')
  loadLicenses(1)
})

onBeforeUnmount(() => {
  requestController?.abort()
})
</script>
