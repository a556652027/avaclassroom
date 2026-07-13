<template>
  <AppLayout>
    <div class="page">
          <div class="page-caption" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem">
        <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 0">
          <div class="page-icon-container">
            <img src="/assets/images/IdentificationBadge.svg" alt="" class="page-icon" />
          </div>
          <h1 style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ t('sidebarnav.member') }}</h1>
        </div>
        <button
          type="button"
          id="member_list-button-open_modal"
          class="image_button_default"
          style="background-color: #214f7c; width: 218px; height: 48px; border-radius: 10px; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.75rem;"
          @click="openAddModal"
        >
          <img src="/assets/images/Group 607.svg" alt="" style="width: 20px; height: 20px" />
          <span>{{ t('common.add') || '新增' }}</span>
        </button>
      </div>

      <div class="responsive-toolbar" style="margin-bottom: 1rem; border: 1px solid #d9dde3; border-radius: 12px; background: #f5f7f9; padding: 0.9rem 1rem; display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; justify-content: space-between;">
        <div class="responsive-toolbar-group" style="display: flex; align-items: center; gap: 0.5rem;">
          <input id="member-select-all" type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
          <label for="member-select-all" style="color: #404040; font-size: 14px; cursor: pointer; user-select: none;">{{ t('common.select_all') || '全選' }}</label>
          <button type="button" id="member-edit-button" class="edit-button" @click="openEditSelected" style="display: inline-flex; align-items: center; justify-content: center;">
            <img src="/assets/images/edit.svg" alt="編輯" style="width: 20px; height: 20px" />
          </button>
          <button type="button" id="member-delete-button" class="edit-button-trash" @click="deleteSelectedMembers" style="display: inline-flex; align-items: center; justify-content: center;">
            <img src="/assets/images/trash.svg" alt="刪除" style="width: 20px; height: 20px" />
          </button>
        </div>
        <div class="responsive-toolbar-group" style="flex: 1; justify-content: flex-end; min-width: 240px;">
          <div class="search-box" style="height: 38px; width: 100%; max-width: 340px;">
            <svg class="search-box-icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M13.293 14.707a8 8 0 111.414-1.414l4.586 4.586a1 1 0 01-1.414 1.414l-4.586-4.586zM8 14a6 6 0 100-12 6 6 0 000 12z"
                clip-rule="evenodd"
              />
            </svg>
            <input
              id="member-search-input"
              v-model="searchKeyword"
              type="search"
              :placeholder="t('common.search')"
              class="search-box-input"
              @input="loadMembers(1)"
            />
          </div>
        </div>
      </div>

      <div class="viewpoint-container">
        <table class="responstable">
          <thead>
            <tr>
              <th style="width: 5%"></th>
              <th style="width: 5%"></th>
              <th>{{ t('common.member_cid') || '會員編號' }}</th>
              <th>{{ t('common.email') || 'Email' }}</th>
              <th>{{ t('common.password') || '現在密碼' }}</th>
              <th style="width: 110px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.member_cid" :style="row.checked ? { backgroundColor: '#edf2fb' } : {}">
              <td>
                <input v-model="row.checked" type="checkbox" class="member-row-checkbox" />
              </td>
              <td>
                <button type="button" class="link_text" @click="sendWelcomeEmail(row.member_cid)">
                  <img src="/assets/images/mail.svg" alt="寄信" style="width: 18px; height: 18px" />
                </button>
              </td>
              <td>{{ row.member_cid }}</td>
              <td>{{ row.email }}</td>
              <td>{{ row.password ? '*******' : '*******' }}</td>
              <td>
                <button type="button" class="link_text" @click="openEditModal(row.member_cid)">
                  {{ t('common.update') || '編輯' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="centered-content" style="margin-top: 1rem">
        <TablePagination :total-records="totalRecords" :rows-per-page="rowsPerPage" :current-page="currentPage" @change="(page) => loadMembers(page)" />
      </div>

      <!-- 新增帳號 Modal (原 member-add-modal，樣式與 www/member.html 一致) -->
      <div v-if="addModalVisible" class="member-modal">
        <div class="member-modal-content">
          <div style="display: flex; justify-content: space-between; padding: 1rem 2rem 0rem 2rem">
            <div style="display: flex; gap: 1rem">
              <img src="/assets/images/add new_button.svg" alt="" />
              <div class="member-modal-header">
                <h2>{{ t('member.title_insert_member') || '新增帳號' }}</h2>
              </div>
            </div>
            <span class="member-modal-close" @click="closeAddModal">&times;</span>
          </div>

          <div class="member-modal-body">
            <form @submit.prevent="submitAddMember">
              <div class="form-row">
                <div class="form-group">
                  <label for="member_insert-member_cid">{{ t('member.member_cid') || '用戶名稱' }}</label>
                  <input
                    id="member_insert-member_cid"
                    v-model="addForm.member_cid"
                    type="text"
                    :placeholder="t('member.member_cid_hint') || '例如：user01'"
                    maxlength="128"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="member_insert-email">{{ t('member.email') || '電子郵件' }}</label>
                  <input
                    id="member_insert-email"
                    v-model="addForm.email"
                    type="email"
                    :placeholder="t('member.email_hint') || '例如：user@example.com'"
                    required
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group" style="position: relative">
                  <label for="member_insert-password">{{ t('member.password') || '密碼' }}</label>
                  <input
                    id="member_insert-password"
                    v-model="addForm.password"
                    :type="showAddPassword ? 'text' : 'password'"
                    :placeholder="t('member.password_hint') || '至少 8 個字元'"
                    maxlength="128"
                    required
                  />
                  <span
                    style="position: absolute; right: 15px; top: 55%; transform: translateY(-10%); cursor: pointer"
                    @click="showAddPassword = !showAddPassword"
                  >
                    <img
                      :src="showAddPassword ? '/assets/images/passwordeyeopen.svg' : '/assets/images/passwordeyeclose.svg'"
                      alt="Toggle Password Visibility"
                    />
                  </span>
                </div>
                <div class="form-group" style="position: relative">
                  <label for="member_insert-password_confirm">{{ t('member.password_comfirm') || '再次輸入密碼' }}</label>
                  <input
                    id="member_insert-password_confirm"
                    v-model="addForm.password_confirm"
                    :type="showAddPasswordConfirm ? 'text' : 'password'"
                    :placeholder="t('member.password_hint') || '至少 8 個字元'"
                    maxlength="128"
                    required
                  />
                  <span
                    style="position: absolute; right: 15px; top: 55%; transform: translateY(-10%); cursor: pointer"
                    @click="showAddPasswordConfirm = !showAddPasswordConfirm"
                  >
                    <img
                      :src="showAddPasswordConfirm ? '/assets/images/passwordeyeopen.svg' : '/assets/images/passwordeyeclose.svg'"
                      alt="Toggle Password Visibility"
                    />
                  </span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="member_insert-group_cid">{{ t('member.group_cid') || '組織' }}</label>
                  <select id="member_insert-group_cid" v-model="addForm.group_cid" style="background-color: #f9fafb; width: 100%">
                    <option value="">-- 請選擇組織 --</option>
                    <option v-for="opt in groupOptions" :key="opt.cid" :value="opt.cid">{{ opt.label }}</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          <div class="member-modal-footer">
            <button type="button" class="modal-cancel-btn" style="padding: 4px 61px" @click="closeAddModal">
              {{ t('common.cancel') || '取消' }}
            </button>
            <button type="button" class="modal-ok-btn" style="padding: 4px 61px; cursor: pointer" @click="submitAddMember">
              {{ t('common.ok') || '新增並寄送郵件給用戶' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 編輯會員 Modal -->
      <div v-if="modalVisible" class="modal-overlay" style="display: flex; position: fixed; inset: 0; background: rgba(0,0,0,0.45); justify-content: center; align-items: center; z-index: 1100">
        <div style="background: #fff; width: min(760px, 92vw); border-radius: 12px; padding: 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.2)">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem">
            <h2 style="margin: 0">{{ t('common.update') || '編輯' }}</h2>
            <button type="button" class="link_text" @click="closeModal">✕</button>
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); gap: 1rem">
            <div>
              <label>{{ t('common.member_cid') || '會員編號' }}</label>
              <input v-model="memberForm.member_cid" class="org-input" :disabled="mode === 'edit'" />
            </div>
            <div>
              <label>{{ t('common.password') || '密碼' }}</label>
              <input v-model="memberForm.password" type="password" class="org-input" />
            </div>
            <div>
              <label>{{ t('common.member_name') || '姓名' }}</label>
              <input v-model="memberForm.member_name" class="org-input" />
            </div>
            <div>
              <label>{{ t('common.group_cid') || '群組' }}</label>
              <input v-model="memberForm.group_cid" class="org-input" />
            </div>
            <div>
              <label>{{ t('common.email') || 'Email' }}</label>
              <input v-model="memberForm.email" class="org-input" />
            </div>
            <div>
              <label>{{ t('common.phone_cell') || '手機' }}</label>
              <input v-model="memberForm.phone_cell" class="org-input" />
            </div>
            <div>
              <label>{{ t('common.gender') || '性別' }}</label>
              <input v-model="memberForm.gender" class="org-input" />
            </div>
            <div>
              <label>{{ t('common.birthday') || '生日' }}</label>
              <input v-model="memberForm.birthday" type="date" class="org-input" />
            </div>
            <div>
              <label>{{ t('common.country') || '國家' }}</label>
              <input v-model="memberForm.country" class="org-input" />
            </div>
            <div>
              <label>{{ t('common.city') || '城市' }}</label>
              <input v-model="memberForm.city" class="org-input" />
            </div>
            <div style="grid-column: 1 / -1">
              <label>{{ t('common.address') || '地址' }}</label>
              <input v-model="memberForm.address" class="org-input" />
            </div>
            <div style="grid-column: 1 / -1">
              <label>{{ t('common.note00') || '備註' }}</label>
              <textarea v-model="memberForm.note00" class="org-input" style="height: 90px; resize: vertical"></textarea>
            </div>
            <div>
              <label>{{ t('common.record_state') || '狀態' }}</label>
              <select v-model="memberForm.record_state" class="org-input">
                <option value="1">{{ t('common.open') || '啟用' }}</option>
                <option value="0">{{ t('common.close') || '停用' }}</option>
              </select>
            </div>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem">
            <button type="button" class="image_button_default" @click="closeModal">{{ t('common.cancel') || '取消' }}</button>
            <button type="button" class="image_button_default" style="background: #214f7c; color: #fff" @click="saveMember">
              {{ t('common.save') || '儲存' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 刪除確認 Modal (原 delete-confirmation-modal) -->
      <div
        v-if="deleteModalVisible"
        style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 1200; justify-content: center; align-items: center"
      >
        <div style="background: white; border-radius: 12px; padding: 24px; max-width: 500px; width: 90%; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1)">
          <div style="display: flex; align-items: center; padding-bottom: 16px">
            <div style="width: 40px; height: 40px; justify-content: center; align-items: center; display: flex">
              <img src="/assets/images/device_delete.svg" alt="" />
            </div>
            <div>
              <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827">
                {{ t('common.delete') || '刪除' }}
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
            <button class="member-delete-modal-cancel" @click="deleteModalVisible = false">
              {{ t('common.cancel') || '取消' }}
            </button>
            <button class="member-delete-modal-confirm" @click="confirmDeleteMembers">
              {{ t('common.update') || '確定' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import TablePagination from '@/components/TablePagination.vue'
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

const rows = ref([])
const totalRecords = ref(0)
const currentPage = ref(1)
const rowsPerPage = ref(10)
const searchKeyword = ref('')
const selectAll = ref(false)
const modalVisible = ref(false)
const mode = ref('edit')

// 刪除確認 Modal (原 delete-confirmation-modal)
const deleteModalVisible = ref(false)
const deleteModalMessage = ref('')
const deleteModalItems = ref([])

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

async function saveMember() {
  if (!memberForm.member_cid.trim()) {
    alert('請輸入會員編號')
    return
  }

  VisibleLoaderElement(true)
  try {
    const parentCid = window.sessionStorage.getItem('member_cid') || window.Cyberspace?.Client?.getUsername() || ''
    if (mode.value === 'add') {
      await apiCall(CsRequestMemberInsertOneRecordByParentCID, parentCid, memberForm, requestController)
    } else {
      await apiCall(CsRequestMemberUpdateOneRecordByMemberCID, memberForm, requestController)
    }
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
    await apiCall(CsRequestMemberSendEMail, memberCid, requestController)
    alert('歡迎郵件已寄送')
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('寄送郵件失敗')
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
</script>

<style>
/* 刪除確認 Modal 按鈕 (與 DeviceView 的 delete-modal 樣式一致) */
.member-delete-modal-cancel {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.member-delete-modal-cancel:hover {
  background: #f3f4f6;
}
.member-delete-modal-confirm {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: rgba(33, 79, 124, 1);
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.member-delete-modal-confirm:hover {
  background: #ee963f;
}

/* ===== 新增帳號 Modal (原 www/member.html 的 .modal 系列樣式，改用 member- 前綴避免衝突) ===== */
.member-modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  align-items: center;
  display: flex;
  justify-content: center;
}
.member-modal-content {
  background-color: #fefefe;
  margin: 0;
  border-radius: 10px;
  width: 80%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
.member-modal-header {
  background-color: #ffffff;
  border-radius: 10px 10px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.member-modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}
.member-modal-close {
  color: #aaa;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  line-height: 1;
}
.member-modal-close:hover,
.member-modal-close:focus {
  color: #000;
}
.member-modal-body {
  padding: 1rem 1rem;
}
.member-modal-footer {
  padding-right: 1rem;
  padding-bottom: 1rem;
  border-radius: 0 0 10px 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.member-modal .form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.member-modal .form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.member-modal .form-group label {
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}
.member-modal .form-group input,
.member-modal .form-group select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}
.member-modal .form-group input:focus,
.member-modal .form-group select:focus {
  border-color: #ffffff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(33, 79, 124, 0.1);
}
.member-modal input::placeholder {
  color: #d1d5db !important;
  opacity: 1;
}
.modal-cancel-btn {
  background-color: #ffffff;
  border: 1px solid #e5e8ea;
  padding: 4px 61px;
  border-radius: 10px;
  cursor: pointer;
  height: 48px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
.modal-cancel-btn:hover {
  background-color: #f5f5f5 !important;
  color: #333 !important;
}
.modal-ok-btn {
  background-color: #214f7c !important;
  border-radius: 10px;
  border: none;
  color: #ffffff;
  height: 48px;
  transition: background-color 0.2s ease;
}
.modal-ok-btn:hover {
  background-color: #ee963f !important;
}
/* 原 www/member.html：新增帳戶按鈕 hover 變橘 */
#member_list-button-open_modal {
  transition: background-color 0.2s ease;
}
#member_list-button-open_modal:hover {
  background-color: #ee963f !important;
}
</style>
