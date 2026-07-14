<template>
  <AppLayout>
    <div class="page member-page">
      <!-- 頁面標題 (原 member.html page-caption：圖示 + 公司名稱標題) -->
      <div class="page-caption">
        <div style="display: flex">
          <div class="page-icon-container">
            <img src="/assets/images/IdentificationBadge.svg" alt="" class="page-icon" />
          </div>
          <h1 id="member-title">{{ pageTitle }}</h1>
        </div>
      </div>

      <!-- 會員列表 -->
      <div>
        <!-- 新增帳戶按鈕 (獨立一行，原版位置) -->
        <div style="margin-top: 1rem; margin-bottom: 1rem">
          <button
            type="button"
            id="member_list-button-open_modal"
            style="background-color: #214f7c; cursor: pointer; width: 218px; height: 48px; border-radius: 10px; color: #ffffff; border: none"
            @click="openAddModal"
          >
            <div style="display: flex; justify-content: center; align-items: center; gap: 0.5rem; font-size: 14px">
              <img src="/assets/images/Group 607.svg" alt="" style="width: 20px; height: 20px" />
              {{ t('member.insert') || '新增帳戶' }}
            </div>
          </button>
        </div>

        <table class="frame-table" style="margin-top: 0">
          <tbody>
            <!-- 顯示資料的地方 -->
            <tr>
              <td colspan="12">
                <div class="viewpoint-container" style="margin-top: 1rem">
                  <!-- 工具列與表格相連 (原版 border 貼合樣式) -->
                  <div class="responsive-toolbar" style="margin-top: 0; border: 1px solid #d9dde3; border-bottom: none">
                    <div class="responsive-toolbar-group">
                      <input
                        id="member-select-all"
                        v-model="selectAll"
                        type="checkbox"
                        style="margin-right: 5px; cursor: pointer"
                        @change="toggleSelectAll"
                      />
                      <label for="member-select-all" style="color: #404040; font-size: 14px; font-weight: 400; margin-right: 1rem">
                        {{ t('common.select_all') || '全選' }}
                      </label>
                      <button type="button" id="member-edit-button" class="edit-button" @click="openEditSelected">
                        <img src="/assets/images/edit.svg" class="edit_change" alt="" style="width: 20px; height: 20px" />
                      </button>
                      <button type="button" id="member-delete-button" class="edit-button-trash" @click="deleteSelectedMembers">
                        <img src="/assets/images/trash.svg" class="edit_change" alt="刪除" />
                      </button>
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
                          id="member-search-input"
                          v-model="searchKeyword"
                          type="search"
                          placeholder="Search"
                          class="search-box-input"
                          @input="loadMembers(1)"
                        />
                      </div>
                    </div>
                  </div>
                  <table class="responstable">
          <thead>
            <tr>
              <th style="width: 5%"></th>
              <th style="cursor: pointer" @click="sortMemberTable('member_cid')">
                {{ t('member.member_cid') || '用戶名稱' }}
                <img id="sort-member_cid" src="/assets/images/sort_up.svg" alt="" :style="memberSortIconStyle('member_cid')" />
              </th>
              <th style="cursor: pointer" @click="sortMemberTable('email')">
                {{ t('member.email') || '電子郵件' }}
                <img id="sort-email" src="/assets/images/sort_up.svg" alt="" :style="memberSortIconStyle('email')" />
              </th>
              <th style="cursor: pointer" @click="sortMemberTable('password')">
                {{ t('common.password') || '密碼' }}
                <img id="sort-password" src="/assets/images/sort_up.svg" alt="" :style="memberSortIconStyle('password')" />
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in sortedRows" :key="row.member_cid" :style="row.record_state === '0' ? { backgroundColor: '#d6d6d6ff' } : {}">
              <td>
                <input v-model="row.checked" type="checkbox" class="member-row-checkbox" style="margin-left: 1rem; cursor: pointer" />
              </td>
              <td>
                <button type="button" class="link_text" @click="openEditModal(row.member_cid)">{{ row.member_cid }}</button>
              </td>
              <td>{{ row.email }}</td>
              <td>********</td>
              <td>
                <div style="display: flex; align-items: center; justify-content: flex-start">
                  <!-- 寄送歡迎郵件：底色與 hover 改由 CSS 控制 (原 inline mouseover/mouseout 會讓底色殘留) -->
                  <div class="member-mail-button" @click="sendWelcomeEmail(row.member_cid)">
                    <img src="/assets/images/mail.svg" alt="" style="pointer-events: none" />
                  </div>
                </div>
              </td>
            </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
            <!-- 顯示分頁的地方 -->
            <tr>
              <td colspan="12">
                <div class="centered-content">
                  <TablePagination :total-records="totalRecords" :rows-per-page="rowsPerPage" :current-page="currentPage" @change="(page) => loadMembers(page)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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

      <!-- 編輯會員 Modal (原 member-edit-modal，樣式與 www/member.html 一致) -->
      <div v-if="modalVisible" class="member-modal">
        <div class="member-modal-content" style="max-width: 800px">
          <div style="display: flex; justify-content: space-between; padding: 1rem 2rem 0rem 2rem">
            <div style="display: flex; gap: 1rem; align-items: center">
              <img src="/assets/images/edit.svg" alt="" style="width: 24px; height: 24px" />
              <div class="member-modal-header">
                <h2>{{ t('member.title_update_member') || '會員編輯' }}</h2>
              </div>
            </div>
            <span class="member-modal-close" @click="closeModal">&times;</span>
          </div>

          <div class="member-modal-body">
            <div style="display: flex; flex-direction: column; gap: 1.5rem">
              <!-- 基本資訊區塊 -->
              <div>
                <h3 style="color: #374151; margin-bottom: 1rem; font-size: 18px; font-weight: 600">
                  {{ t('member.basic_info') || '基本資訊' }}
                </h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem">
                  <!-- 會員編號 -->
                  <div style="display: flex; flex-direction: column">
                    <label style="font-size: 14px; line-height: 1.5; font-weight: 500; color: #898c94; margin-bottom: 0.5rem">
                      {{ t('member.member_cid') || '用戶名稱' }}
                    </label>
                    <input
                      v-model="memberForm.member_cid"
                      type="text"
                      :placeholder="t('member.member_cid_hint')"
                      disabled
                      style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background-color: #f9fafb"
                    />
                  </div>
                  <!-- 電子郵件 -->
                  <div style="display: flex; flex-direction: column">
                    <label style="font-size: 14px; line-height: 1.5; font-weight: 500; color: #898c94; margin-bottom: 0.5rem">
                      {{ t('member.email') || '電子郵件' }}
                    </label>
                    <input
                      v-model="memberForm.email"
                      type="email"
                      :placeholder="t('member.email_hint')"
                      required
                      style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px"
                    />
                  </div>
                  <!-- 組織 -->
                  <div style="display: flex; flex-direction: column; grid-column: span 3">
                    <label style="font-size: 14px; line-height: 1.5; font-weight: 500; color: #898c94; margin-bottom: 0.5rem">
                      {{ t('member.group_cid') || '組織' }}
                    </label>
                    <select
                      v-model="memberForm.group_cid"
                      style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background-color: #ffffff"
                    >
                      <option value="">-- 請選擇組織 --</option>
                      <option v-for="opt in groupOptions" :key="opt.cid" :value="opt.cid">{{ opt.label }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- 現在密碼 -->
              <div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem">
                  <div style="display: flex; flex-direction: column; position: relative">
                    <label style="font-size: 14px; line-height: 1.5; font-weight: 500; color: #898c94; margin-bottom: 0.5rem">
                      {{ t('member.password') || '現在密碼' }}
                    </label>
                    <input
                      v-model="memberForm.password"
                      :type="showEditPassword ? 'text' : 'password'"
                      :placeholder="t('member.password_hint')"
                      required
                      style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px"
                    />
                    <span
                      style="position: absolute; right: 15px; top: 55%; cursor: pointer"
                      @click="showEditPassword = !showEditPassword"
                    >
                      <img :src="showEditPassword ? '/assets/images/passwordeyeopen.svg' : '/assets/images/passwordeyeclose.svg'" alt="Toggle Password Visibility" />
                    </span>
                  </div>
                </div>
              </div>

              <!-- 新密碼 / 確認新密碼 -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem">
                <div style="display: flex; flex-direction: column; position: relative">
                  <label style="font-size: 14px; line-height: 1.5; font-weight: 500; color: #898c94; margin-bottom: 0.5rem">
                    {{ t('member.new_password') || '輸入新密碼' }}
                  </label>
                  <input
                    v-model="editNewPassword"
                    :type="showEditNewPassword ? 'text' : 'password'"
                    :placeholder="t('member.new_password_hint')"
                    style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px"
                  />
                  <span
                    style="position: absolute; right: 15px; top: 55%; cursor: pointer"
                    @click="showEditNewPassword = !showEditNewPassword"
                  >
                    <img :src="showEditNewPassword ? '/assets/images/passwordeyeopen.svg' : '/assets/images/passwordeyeclose.svg'" alt="Toggle Password Visibility" />
                  </span>
                </div>
                <div style="display: flex; flex-direction: column; position: relative">
                  <label style="font-size: 14px; line-height: 1.5; font-weight: 500; color: #898c94; margin-bottom: 0.5rem">
                    {{ t('member.new_password_comfirm') || '再次輸入新密碼' }}
                  </label>
                  <input
                    v-model="editConfirmPassword"
                    :type="showEditConfirmPassword ? 'text' : 'password'"
                    :placeholder="t('member.new_password_comfirm_hint')"
                    style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px"
                  />
                  <span
                    style="position: absolute; right: 15px; top: 55%; cursor: pointer"
                    @click="showEditConfirmPassword = !showEditConfirmPassword"
                  >
                    <img :src="showEditConfirmPassword ? '/assets/images/passwordeyeopen.svg' : '/assets/images/passwordeyeclose.svg'" alt="Toggle Password Visibility" />
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="member-modal-footer">
            <button type="button" class="modal-cancel-btn" style="padding: 4px 61px" @click="closeModal">
              {{ t('common.cancel') || '取消' }}
            </button>
            <button type="button" class="modal-ok-btn" style="padding: 4px 61px; cursor: pointer" @click="saveMember">
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
// 邏輯抽離至 MemberView.js，此處僅保留模板繫結
import AppLayout from '@/layouts/AppLayout/AppLayout.vue'
import TablePagination from '@/components/TablePagination/TablePagination.vue'
import { useMemberView } from './MemberView.js'

const {
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
} = useMemberView()
</script>

<style src="./MemberView.css"></style>
