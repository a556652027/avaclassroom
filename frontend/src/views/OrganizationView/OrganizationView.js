import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { t } from '@/locales'
import { emitter } from '@/core/emitter'
import { VisibleLoaderElement } from '@/core/loader'
import { apiCall } from '@/core/util'
import {
  CsRequestGroupSelectAllCountByCondition,
  CsRequestGroupSelectAllRecordsByCondition,
} from '@/api/organization'

// 原 OrganizationView.vue <script setup> 的邏輯，模板繫結經由 useOrganizationView() 回傳
export function useOrganizationView() {
// 原 views/app.view.organization.js (OrganizationSelectAll 伺服器端分頁 + 搜尋條件選擇器)

const router = useRouter()
const rows = ref([])
const totalRecords = ref(0)
const currentPage = ref(1)
const rowsPerPage = ref(10)
const searchField = ref('2') // 原 organization_list-input_search_field (2=owner_cid, 7=country)
const searchValue = ref('')
const roleLabel = ref(t('role.1') || '系統管理員') // 原 organization_list-role (member_depth=1)
let requestController = null

function getConditionTarget() {
  // 原邏輯：搜尋框有值就用選擇的欄位條件，否則查自己名下的組織
  const value = searchValue.value.trim()
  if (value) {
    return { condition_type: searchField.value, condition_value: value }
  }
  const ownerCid = window.sessionStorage.getItem('member_cid') || window.Cyberspace?.Client?.getUsername() || ''
  return { condition_type: '2', condition_value: ownerCid }
}

function onSearch() {
  loadOrganizations(1)
}

async function loadOrganizations(page = 1) {
  if (requestController) requestController.abort()
  requestController = new AbortController()
  currentPage.value = page
  VisibleLoaderElement(true)

  try {
    const { condition_type, condition_value } = getConditionTarget()
    const countResult = await apiCall(CsRequestGroupSelectAllCountByCondition, condition_type, condition_value, requestController)
    totalRecords.value = Number(countResult.count || 0)

    if (totalRecords.value <= 0) {
      rows.value = []
      return
    }

    const offset = (page - 1) * rowsPerPage.value
    const result = await apiCall(
      CsRequestGroupSelectAllRecordsByCondition,
      condition_type,
      condition_value,
      offset,
      rowsPerPage.value,
      requestController,
    )
    const records = result.records || {}
    const recordCount = records.group_cid ? records.group_cid.length : 0
    rows.value = Array.from({ length: recordCount }, (_, index) => ({
      group_cid: records.group_cid?.[index] || '',
      group_name: records.group_name?.[index] || '',
      create_time: records.create_time?.[index] || '',
      agent_cid: records.agent_cid?.[index] || '',
      country: records.country?.[index] || '',
      licensing_remaining_seats: records.licensing_remaining_seats?.[index] || '',
      contact: records.contact?.[index] || '',
      contact_phone_01: records.contact_phone_01?.[index] || '',
      contact_email_01: records.contact_email_01?.[index] || '',
    }))
  } catch (e) {
    if (e.name !== 'AbortError' && e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

function openAddModal() {
  emitter.emit('org-add-modal:show')
}

function openEditModal(groupCid) {
  window.sessionStorage.setItem('group_cid', groupCid)
  emitter.emit('org-edit-modal:show', groupCid)
}

function goDashboard(groupCid) {
  window.sessionStorage.setItem('select_group_cid', groupCid)
  router.push('/dashboard')
}

onMounted(() => {
  loadOrganizations(1)
})

onBeforeUnmount(() => {
  requestController?.abort()
})

  return {
    router,
    rows,
    totalRecords,
    currentPage,
    rowsPerPage,
    searchField,
    searchValue,
    roleLabel,
    requestController,
    getConditionTarget,
    onSearch,
    loadOrganizations,
    openAddModal,
    openEditModal,
    goDashboard,
    t,
  }
}
