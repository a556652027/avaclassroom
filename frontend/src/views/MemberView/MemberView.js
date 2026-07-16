import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { t } from '@/locales'
import { VisibleLoaderElement } from '@/core/loader'
import { apiCall } from '@/core/util'
import {
  MemberData,
  CsRequestMemberSelectAllCountByCondition,
  CsRequestMemberSelectAllRecordsByCondition,
  CsRequestMemberSelectOneRecordByMemberCID,
  CsRequestMemberInsertOneRecordByParentCID,
  CsRequestMemberUpdateOneRecordByMemberCID,
  CsRequestMemberSendEMail,
} from '@/api/member'
import { CsRequestGroupSelectAllRecordsByCondition } from '@/api/organization'
import { getGroupDisplayName } from '@/core/title'

// 原 MemberView.vue <script setup> 的邏輯，模板繫結經由 useMemberView() 回傳
export function useMemberView() {

// 原 lib.title.groupcid.js：頁面標題顯示目前選擇的公司名稱
const pageTitle = computed(() => getGroupDisplayName() || t('member.title_list_member'))

const rows = ref([])
const totalRecords = ref(0)
const currentPage = ref(1)
const rowsPerPage = ref(10)
const searchKeyword = ref('')
const selectAll = ref(false)
const modalVisible = ref(false)
const mode = ref('edit')

// 列表排序 (原 sortMemberTable / updateSortIcons)
const memberSortField = ref('')
const memberSortOrder = ref('asc')

// 啟用的帳號在前、停用在後 (原 renderTable 的 record_state 排序)，再套用欄位排序
const sortedRows = computed(() => {
  let result = [...rows.value].sort((a, b) => {
    const stateA = a.record_state === '0' ? 1 : 0
    const stateB = b.record_state === '0' ? 1 : 0
    return stateA - stateB
  })
  if (memberSortField.value) {
    const field = memberSortField.value
    result.sort((a, b) => {
      const aValue = field === 'password' ? '********' : String(a[field] || '')
      const bValue = field === 'password' ? '********' : String(b[field] || '')
      if (aValue < bValue) return memberSortOrder.value === 'asc' ? -1 : 1
      if (aValue > bValue) return memberSortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }
  return result
})

function sortMemberTable(field) {
  if (memberSortField.value === field) {
    memberSortOrder.value = memberSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    memberSortField.value = field
    memberSortOrder.value = 'asc'
  }
}

function memberSortIconStyle(field) {
  // 尺寸/顏色交由全站 .sort-icon 樣式 (styles/ui.css)，此處只回傳排序狀態
  const active = memberSortField.value === field
  return {
    opacity: active ? '1' : undefined,
    transform: active && memberSortOrder.value === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
  }
}

// 刪除確認 Modal (原 delete-confirmation-modal)
const deleteModalVisible = ref(false)
const deleteModalMessage = ref('')
const deleteModalItems = ref([])

// 編輯 Modal 的新密碼欄位與眼睛切換 (原 member_update-new_password 等)
const editNewPassword = ref('')
const editConfirmPassword = ref('')
const showEditPassword = ref(false)
const showEditNewPassword = ref(false)
const showEditConfirmPassword = ref(false)

// 新增帳號 Modal (原 member-add-modal)
const addModalVisible = ref(false)
const showAddPassword = ref(false)
const showAddPasswordConfirm = ref(false)
const groupOptions = ref([])
const addForm = reactive({
  member_cid: '',
  email: '',
  password: '',
  password_confirm: '',
  group_cid: '',
})

const createMemberForm = () => ({
  ...MemberData,
  member_cid: '',
  password: '',
  member_name: '',
  tier: '',
  record_state: '1',
  group_cid: '',
  phone_cell: '',
  phone_home: '',
  phone_work: '',
  email: '',
  address: '',
  city: '',
  country: '',
  gender: '',
  birthday: '',
  note00: '',
  avatar_url: '',
})

const memberForm = reactive(createMemberForm())
let requestController = null

function getConditionTarget() {
  const selectedGroupCid = window.sessionStorage.getItem('select_group_cid') || window.sessionStorage.getItem('group_cid')
  return {
    condition_type: selectedGroupCid ? 5 : 1,
    condition_value: selectedGroupCid || window.sessionStorage.getItem('member_cid') || window.Cyberspace?.Client?.getUsername() || '',
  }
}

function resetForm() {
  Object.assign(memberForm, createMemberForm())
  memberForm.group_cid = window.sessionStorage.getItem('select_group_cid') || window.sessionStorage.getItem('group_cid') || ''
  memberForm.record_state = '1'
}

function toggleSelectAll() {
  rows.value.forEach((row) => {
    row.checked = selectAll.value
  })
}

function openEditSelected() {
  const selected = rows.value.find((row) => row.checked)
  if (!selected) {
    alert(t('common.select_one_record') || '請先選擇一筆資料')
    return
  }
  openEditModal(selected.member_cid)
}

// 原 closeSelectedMembers：刪除(停用)選中會員 (BAC 越權攔截 + 確認 Modal)
function deleteSelectedMembers() {
  // [資安防護 - BAC 越權攔截] 預設拒絕：Tier >= 3 (如經銷商) 禁止刪除會員
  const tier = parseInt(window.sessionStorage.getItem('tier'), 10)
  if (isNaN(tier) || tier >= 3) {
    alert(t('common.deny') || '權限不足，無法執行此操作。')
    return
  }

  const selected = rows.value.filter((row) => row.checked)
  if (!selected.length) {
    alert('請選擇要刪除的項目')
    return
  }

  deleteModalMessage.value = `您確定要刪除這 ${selected.length} 位會員嗎？`
  deleteModalItems.value = selected.map((row) => row.member_cid)
  deleteModalVisible.value = true
}

// 原 executeCloseMemberLogic：逐筆取回 → record_state='0' → 更新 (並行上限 3)
async function confirmDeleteMembers() {
  deleteModalVisible.value = false
  const selected = rows.value.filter((row) => row.checked)
  if (!selected.length) return

  VisibleLoaderElement(true)
  let successCount = 0
  let errorCount = 0

  const processMember = async (row) => {
    const memberCid = row.member_cid
    try {
      const json_object = await apiCall(CsRequestMemberSelectOneRecordByMemberCID, memberCid)
      const record = json_object.records
      if (!record || !record.member_cid || record.member_cid.length === 0) {
        console.error(`[closeMember] Fetched data for member_cid: ${memberCid} is empty or invalid.`)
        errorCount++
        return
      }

      const member_data = Object.create(MemberData)
      Object.keys(member_data).forEach((key) => {
        if (record[key] && record[key][0] !== undefined) {
          member_data[key] = record[key][0]
        }
      })
      member_data.record_state = '0'
      member_data.member_cid = memberCid

      await apiCall(CsRequestMemberUpdateOneRecordByMemberCID, member_data)
      successCount++
    } catch (e) {
      console.error(`[closeMember] Error processing member_cid: ${memberCid}.`, e)
      errorCount++
    }
  }

  // 並行上限 3 (原 CONCURRENCY_LIMIT)
  const CONCURRENCY_LIMIT = 3
  try {
    for (let i = 0; i < selected.length; i += CONCURRENCY_LIMIT) {
      await Promise.all(selected.slice(i, i + CONCURRENCY_LIMIT).map((row) => processMember(row)))
    }
  } finally {
    VisibleLoaderElement(false)
    alert(`作業完成。成功 ${successCount} 筆，失敗 ${errorCount} 筆。`)
    selectAll.value = false
    await loadMembers(currentPage.value)
  }
}

function closeModal() {
  modalVisible.value = false
  resetForm()
}

// 原 LoadGroupCidOptions：載入使用者能管理的所有組織清單並填寫下拉選單
async function loadGroupOptions() {
  const owner_cid =
    window.sessionStorage.getItem('member_cid') || window.Cyberspace?.Client?.getUsername() || ''
  try {
    const result = await apiCall(CsRequestGroupSelectAllRecordsByCondition, '2', owner_cid, 0, 1000, requestController)
    if (result && result.records && result.records.group_cid) {
      const groupCids = result.records.group_cid
      const groupNames = result.records.group_name || []
      groupOptions.value = groupCids.map((cid, i) => ({
        cid,
        label: `${groupNames[i] || cid} (${cid})`,
      }))
    } else {
      console.warn('[LoadGroupCidOptions] No group records returned or empty list.')
    }
  } catch (e) {
    console.error('[LoadGroupCidOptions] Failed to load group options:', e)
  }
}

function openAddModal() {
  addForm.member_cid = ''
  addForm.email = ''
  addForm.password = ''
  addForm.password_confirm = ''
  showAddPassword.value = false
  showAddPasswordConfirm.value = false
  // 自動預選當前 sessionStorage 中選定的 group_cid (原 LoadGroupCidOptions)
  addForm.group_cid =
    window.sessionStorage.getItem('select_group_cid') || window.sessionStorage.getItem('group_cid') || ''
  if (!groupOptions.value.length) loadGroupOptions()
  addModalVisible.value = true
}

function closeAddModal() {
  addModalVisible.value = false
}

// 原 MemberInsertOne (驗證與資料流程逐步保留)
async function submitAddMember() {
  if (!addForm.member_cid.trim() || !addForm.email.trim() || !addForm.password) {
    alert(t('warring.input_error') || '請完整填寫必填欄位')
    return
  }

  // [新增] 密碼一致性驗證，防堵使用者輸入錯誤的密碼
  if (addForm.password !== addForm.password_confirm) {
    alert('密碼與確認密碼不符')
    return
  }

  const member_data = Object.create(MemberData)
  member_data.member_cid = addForm.member_cid
  member_data.password = addForm.password
  member_data.member_name = ''

  // 優先讀取表單欄位，若無則降級讀取 Session 狀態，並加入強制防呆阻擋
  member_data.group_cid =
    addForm.group_cid.trim() ||
    window.sessionStorage.getItem('select_group_cid') ||
    window.sessionStorage.getItem('group_cid') ||
    ''
  if (!member_data.group_cid) {
    alert(t('warring.no_group_cid') || '請先選擇隸屬的組織 (Company)！')
    return
  }

  member_data.gender = ''
  member_data.phone_cell = ''
  member_data.phone_home = ''
  member_data.phone_work = ''
  member_data.email = addForm.email
  member_data.address = ''
  member_data.city = ''
  member_data.country = ''
  member_data.note00 = ''
  // [資料修復] 填補後端嚴格要求的欄位預設值，避免 API 拋出參數錯誤
  member_data.birthday = '1991-01-01'
  member_data.avatar_url = ''

  VisibleLoaderElement(true)
  try {
    const parent_cid =
      window.sessionStorage.getItem('member_cid') || window.Cyberspace?.Client?.getUsername() || ''
    await apiCall(CsRequestMemberInsertOneRecordByParentCID, parent_cid, member_data, requestController)
    alert(t('common.success') || '成功')
    closeAddModal()
    await loadMembers(currentPage.value)
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

async function openEditModal(memberCid) {
  mode.value = 'edit'
  resetForm()
  editNewPassword.value = ''
  editConfirmPassword.value = ''
  showEditPassword.value = false
  showEditNewPassword.value = false
  showEditConfirmPassword.value = false
  if (!groupOptions.value.length) loadGroupOptions()
  VisibleLoaderElement(true)
  try {
    const result = await apiCall(CsRequestMemberSelectOneRecordByMemberCID, memberCid, requestController)
    const record = result.records || {}
    const first = (key) => (record[key] ? record[key][0] || '' : '')
    Object.assign(memberForm, {
      member_cid: first('member_cid'),
      password: first('password'),
      member_name: first('member_name'),
      tier: first('tier'),
      record_state: first('record_state') || '1',
      group_cid: first('group_cid'),
      phone_cell: first('phone_cell'),
      phone_home: first('phone_home'),
      phone_work: first('phone_work'),
      email: first('email'),
      address: first('address'),
      city: first('city'),
      country: first('country'),
      gender: first('gender'),
      birthday: first('birthday') ? first('birthday').split(' ')[0] : '',
      note00: first('note00'),
      avatar_url: first('avatar_url'),
    })
    modalVisible.value = true
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

async function loadMembers(page = 1) {
  if (requestController) requestController.abort()
  requestController = new AbortController()
  currentPage.value = page
  VisibleLoaderElement(true)

  try {
    const { condition_type, condition_value } = getConditionTarget()
    const countResult = await apiCall(CsRequestMemberSelectAllCountByCondition, condition_type, condition_value, searchKeyword.value, requestController)
    totalRecords.value = Number(countResult.count || 0)

    if (totalRecords.value <= 0) {
      rows.value = []
      return
    }

    const offset = (page - 1) * rowsPerPage.value
    const result = await apiCall(
      CsRequestMemberSelectAllRecordsByCondition,
      condition_type,
      condition_value,
      searchKeyword.value,
      offset,
      rowsPerPage.value,
      requestController,
    )

    const records = result.records || {}
    const recordCount = records.member_cid ? records.member_cid.length : 0
    rows.value = Array.from({ length: recordCount }, (_, index) => ({
      member_cid: records.member_cid?.[index] || '',
      member_name: records.member_name?.[index] || '',
      email: records.email?.[index] || '',
      group_cid: records.group_cid?.[index] || '',
      password: records.password?.[index] || '',
      record_state: records.record_state?.[index] || '1',
      checked: false,
    }))
  } catch (e) {
    if (e.name !== 'AbortError' && e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

// 原 MemberUpdateOne (新密碼一致性驗證邏輯保留)
async function saveMember() {
  if (!memberForm.member_cid.trim()) {
    alert('請輸入會員編號')
    return
  }

  // 處理密碼更新邏輯 (原 member_update-new_password / confirm_password)
  const newPassword = editNewPassword.value
  const confirmPassword = editConfirmPassword.value
  if (newPassword && newPassword !== confirmPassword) {
    alert('新密碼與確認密碼不符')
    return
  } else if (newPassword && newPassword === confirmPassword) {
    memberForm.password = newPassword
  }

  VisibleLoaderElement(true)
  try {
    await apiCall(CsRequestMemberUpdateOneRecordByMemberCID, memberForm, requestController)
    alert(t('common.success') || '成功')
    closeModal()
    await loadMembers(currentPage.value)
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

async function sendWelcomeEmail(memberCid) {
  VisibleLoaderElement(true)
  try {
    // 不帶 requestController (與原 www 版一致)：該 controller 由 loadMembers 共用，
    // 若寄信途中觸發搜尋/換頁會被 abort，導致寄信請求無聲取消
    await apiCall(CsRequestMemberSendEMail, memberCid)
    alert('歡迎郵件已成功寄送給 ' + memberCid)
  } catch (e) {
    if (e.message !== 'Handled Server Error') {
      console.error('[sendWelcomeEmail] 失敗:', e)
      alert('寄送郵件失敗')
    }
  } finally {
    VisibleLoaderElement(false)
  }
}

onMounted(() => {
  loadMembers(1)
})

onBeforeUnmount(() => {
  requestController?.abort()
})

  return {
    pageTitle,
    rows,
    totalRecords,
    currentPage,
    rowsPerPage,
    searchKeyword,
    selectAll,
    modalVisible,
    mode,
    memberSortField,
    memberSortOrder,
    sortedRows,
    sortMemberTable,
    memberSortIconStyle,
    deleteModalVisible,
    deleteModalMessage,
    deleteModalItems,
    editNewPassword,
    editConfirmPassword,
    showEditPassword,
    showEditNewPassword,
    showEditConfirmPassword,
    addModalVisible,
    showAddPassword,
    showAddPasswordConfirm,
    groupOptions,
    addForm,
    createMemberForm,
    memberForm,
    requestController,
    getConditionTarget,
    resetForm,
    toggleSelectAll,
    openEditSelected,
    deleteSelectedMembers,
    confirmDeleteMembers,
    closeModal,
    loadGroupOptions,
    openAddModal,
    closeAddModal,
    submitAddMember,
    openEditModal,
    loadMembers,
    saveMember,
    sendWelcomeEmail,
    t,
  }
}
