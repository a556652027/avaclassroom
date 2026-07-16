<template>
  <AppLayout>
    <div class="page license-page">
      <!-- 頁面標題 + 統計卡 (全站 UI 改版：行內樣式移至 LicenseView.css，統計數字拆為獨立白卡並排) -->
      <div class="license-header-container">
        <div class="license-header-left">
          <div class="page-caption license-title-row">
            <div class="page-icon-container">
              <img src="/assets/images/IdentificationBadge.svg" alt="" class="page-icon" />
            </div>
            <h1>{{ pageTitle }}</h1>
          </div>
          <!-- 主要動作：Primary 按鈕 (比照登入頁「登入」按鈕層級) -->
          <button type="button" id="license_list-button-gotopage_insert" class="btn-primary license-add-btn" @click="openAddModal">
            <img id="license_insert_button_icon" src="/assets/images/Group 607.svg" alt="" class="license-add-btn-icon" />
            <span>{{ t('common.add') || '新增訂單' }}</span>
          </button>
        </div>

        <div class="license-header-right">
          <img src="/assets/images/Group (2).svg" alt="" class="page-big-icon" />
          <!-- 統計數字：各自獨立的白色卡片，不再塞在同一個色塊容器內 -->
          <section class="stats-card-container">
            <div class="stat-card">
              <label class="stat-label">{{ t('license.total_licensed_count') || '授權總數' }}</label>
              <div class="stat-value-row">
                <p id="license-total-count" class="stat-value">{{ totalCount.toLocaleString() }}</p>
                <div v-show="totalGrowthVisible" id="license-total-growth-rate" class="stat-growth">
                  <span id="license-total-growth-percentage">{{ totalGrowthText }}</span>
                  <img id="license-total-growth-icon" :src="totalGrowthUp ? '/assets/images/up.svg' : '/assets/images/down.svg'" alt="" class="stat-growth-icon" />
                </div>
              </div>
            </div>
            <div class="stat-card">
              <label class="stat-label">{{ t('license.new_this_quarter') || '本季新增' }}</label>
              <div class="stat-value-row">
                <p id="license-quarterly-count" class="stat-value">{{ quarterlyCount.toLocaleString() }}</p>
                <div v-show="quarterlyGrowthVisible" id="license-quarterly-growth-rate" class="stat-growth">
                  <span id="license-quarterly-growth-percentage">{{ quarterlyGrowthText }}</span>
                  <img id="license-quarterly-growth-icon" :src="quarterlyGrowthUp ? '/assets/images/up.svg' : '/assets/images/down.svg'" alt="" class="stat-growth-icon" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- 工具列：白卡片 + 外框圖示按鈕 (樣式見 styles/ui.css) -->
      <div class="responsive-toolbar">
        <div class="responsive-toolbar-group">
          <input id="license-select-all" type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
          <label for="license-select-all" class="toolbar-select-label">
            {{ t('common.select_all') || '全選' }}
          </label>
          <button type="button" id="license-edit-button" class="edit-button toolbar-tooltip" :data-tooltip="t('common.edit') || '編輯'" @click="openEditSelected" @mouseenter="editBtnHover = true" @mouseleave="editBtnHover = false">
            <img id="license-edit-icon" :src="editBtnHover ? '/assets/images/edit_button_change.png' : '/assets/images/edit.svg'" alt="編輯" class="toolbar-icon-lg" />
          </button>
          <button type="button" id="license-download-button" class="edit-button toolbar-tooltip" :data-tooltip="t('common.download') || '下載'" @click="downloadSelectedLicenses" @mouseenter="downloadBtnHover = true" @mouseleave="downloadBtnHover = false">
            <img id="license-download-icon" :src="downloadBtnHover ? '/assets/images/dowload_button_change.png' : '/assets/images/download.svg'" alt="下載" class="toolbar-icon" />
          </button>
          <button type="button" id="license-download-all-button" class="edit-button toolbar-tooltip" :data-tooltip="t('common.export_all') || '匯出全部'" @click="exportAllLicenses" @mouseenter="downloadAllBtnHover = true" @mouseleave="downloadAllBtnHover = false">
            <img id="license-download-all-icon" :src="downloadAllBtnHover ? '/assets/images/download_all_white.svg' : '/assets/images/download_all_light_blue.svg'" alt="匯出全部" class="toolbar-icon" />
          </button>
          <button type="button" id="license-delete-button" class="edit-button-trash toolbar-tooltip tooltip-danger" :data-tooltip="t('common.delete') || '刪除'" @click="deleteSelectedLicenses">
            <img src="/assets/images/trash.svg" alt="刪除" class="toolbar-icon" />
          </button>
        </div>

        <div class="responsive-toolbar-group license-filter-group">
          <!-- 原 license_list-customer_name-container：訂購人名稱搜尋欄位 (僅 avaclassroom 產品顯示) -->
          <div v-if="showCustomerSearch" class="form-field license-customer-field">
            <label for="license_list-customer_name">{{ t('common_order_info.customer_name') || '訂購人名稱' }}</label>
            <div class="license-customer-input-wrap">
              <svg class="license-customer-search-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M13.293 14.707a8 8 0 111.414-1.414l4.586 4.586a1 1 0 01-1.414 1.414l-4.586-4.586zM8 14a6 6 0 100-12 6 6 0 000 12z" clip-rule="evenodd" />
              </svg>
              <input
                id="license_list-customer_name"
                v-model="customerName"
                type="text"
                class="ui-input license-customer-input"
                :placeholder="(t('common.search') || '搜尋') + '...'"
                @keyup.enter="loadLicenses(1)"
              />
              <span v-show="customerName" class="license-customer-clear" @click="clearCustomerName(); loadLicenses(1)">✕</span>
            </div>
          </div>
          <div class="form-field">
            <label for="license_list-begin_time">{{ t('license.search_date_start') || '開始日期' }}</label>
            <input id="license_list-begin_time" v-model="beginTime" type="date" class="device-date-input" title="選擇開始日期" />
          </div>
          <div class="form-field">
            <label for="license_list-end_time">{{ t('license.search_date_end') || '結束日期' }}</label>
            <input id="license_list-end_time" v-model="endTime" type="date" class="device-date-input" title="選擇結束日期" />
          </div>
          <!-- 次要動作：Secondary 外框按鈕 -->
          <button type="button" id="license_list-button-date_search" class="btn-secondary btn-sm" @click="loadLicenses(1)">
            {{ t('license.search_confirm') || t('common.search') || '搜尋' }}
          </button>
          <div class="license-status-wrap">
            <div id="license-status-button" class="license-status-trigger" @click="toggleStatusDropdown">
              <span id="license-status-text">{{ statusOptionLabel }}</span>
              <img src="/assets/images/list_section.svg" alt="選單" />
            </div>
            <div id="license-status-options" v-show="statusDropdownOpen" class="license-status-menu">
              <div v-for="option in statusOptions" :key="option.value" class="license-status-option" @click="selectStatus(option.value)">
                {{ option.label }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 訂單列表 (欄位與 www/license.html 一致：創建日/客戶名稱/授權日期/天數/到期時間/狀態/訂單數量/備註/Dashboard) -->
      <div class="viewpoint-container">
        <table class="responstable">
          <thead>
            <tr>
              <th style="width: 5%"></th>
              <th class="th-sortable" @click="toggleSort('create_time')">
                {{ t('common.create_time') }}
                <img id="sort-create_time" src="/assets/images/sort_up.svg" alt="" class="sort-icon" :style="sortIconStyle('create_time')" />
              </th>
              <th class="th-sortable" @click="toggleSort('customer_name')">
                {{ customerColLabel }}
                <img id="sort-customer_name" src="/assets/images/sort_up.svg" alt="" class="sort-icon" :style="sortIconStyle('customer_name')" />
              </th>
              <th class="th-sortable" @click="toggleSort('license_begin_time')">
                {{ t('license.license_begin_time') }}
                <img id="sort-license_begin_time" src="/assets/images/sort_up.svg" alt="" class="sort-icon" :style="sortIconStyle('license_begin_time')" />
              </th>
              <!-- 原 www/license.html 此標題被註解掉，僅保留空欄位 -->
              <th></th>
              <th class="th-sortable" @click="toggleSort('license_end_time')">
                {{ t('license.license_end_time') }}
                <img id="sort-license_end_time" src="/assets/images/sort_up.svg" alt="" class="sort-icon" :style="sortIconStyle('license_end_time')" />
              </th>
              <!-- 原 www/license.html 此標題被註解掉，僅保留空欄位 -->
              <th></th>
              <th class="th-sortable" @click="toggleSort('license_count')">
                {{ t('license.license_count') }}
                <img id="sort-license_count" src="/assets/images/sort_up.svg" alt="" class="sort-icon" :style="sortIconStyle('license_count')" />
              </th>
              <th>{{ t('license.license_note') }}</th>
              <th>{{ t('license.dashboard') }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="row in rows" :key="row.license_cid">
              <!-- 原 renderTable：record_state == 0 的列直接隱藏；過期列改用 row-muted 淡化 (原厚重灰底) -->
              <tr v-if="row.record_state !== '0'" :class="{ 'row-muted': row.expired }">
                <td><input v-model="row.checked" type="checkbox" class="license-row-checkbox" /></td>
                <td>{{ row.create_time.substring(0, 10) }}</td>
                <td>{{ row.customer_name }}</td>
                <td>{{ row.license_begin_time.substring(0, 10) }}</td>
                <td class="cell-secondary">{{ row.license_days }} 天</td>
                <td>{{ row.end_day_text }}</td>
                <td>
                  <span v-if="row.expired">{{ t('license.expired') }}</span>
                  <template v-else>{{ t('license.active') }}</template>
                </td>
                <td class="cell-secondary">{{ row.license_count }}</td>
                <td>
                  <img v-if="row.hasNote" src="/assets/images/Memo.svg" alt="備註" />
                </td>
                <td>
                  <a href="#" @click.prevent="goRowDashboard(row)">
                    <img src="/assets/images/dashboard.svg" alt="Dashboard" />
                  </a>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- 分頁區塊：主要留白由 TablePagination 內建 padding 提供，此處僅補與表格的分隔 (原 www 為 4rem，統一縮為 1rem) -->
      <div class="centered-content" style="padding: 1rem 0 0 0">
        <TablePagination :total-records="totalRecords" :rows-per-page="rowsPerPage" :current-page="currentPage" @change="(page) => loadLicenses(page)" />
      </div>

      <!-- 新增訂單 Modal (原 license-insert-modal，改用全站 ui-modal 樣式) -->
      <div v-if="insertModalVisible" class="ui-modal-overlay">
        <div class="ui-modal license-modal">
          <div class="license-modal-header">
            <div class="license-modal-title">
              <img src="/assets/images/add new_button.svg" alt="" />
              <span>{{ t('common.insert') || '新增' }}</span>
            </div>
            <img src="/assets/images/X.svg" alt="" class="license-modal-close" @click="closeInsertModal" />
          </div>

          <div class="license-form-row">
            <!-- 顯示隸屬組織（代理商 ID），設為唯讀以供確認 -->
            <div class="form-field field-200">
              <label for="license_insert-owner_cid">{{ t('common.owner_cid') }}</label>
              <input id="license_insert-owner_cid" v-model="insertForm.owner_cid" type="text" readonly class="ui-input" />
            </div>

            <div class="form-field field-200">
              <label for="license_insert-product_type">{{ t('common.product_type') }}</label>
              <div class="license-product-combo">
                <input id="license_insert-product_type" v-model="insertForm.product_type" type="text" autocomplete="off" class="ui-input license-product-input" />
                <button type="button" class="license-product-drop-btn" @click.stop="productDropdownOpen = !productDropdownOpen">▼</button>
                <ul v-show="productDropdownOpen" class="license-product-menu">
                  <li v-for="p in productOptions" :key="p.type" class="custom-dropdown-item" @click.stop="selectInsertProduct(p.type)">
                    {{ p.name }} ({{ p.type }})
                  </li>
                </ul>
              </div>
            </div>

            <!-- 學校名稱 (avaclassroom 限定，含 datalist 聯想) -->
            <div v-if="insertIsClassroom" class="form-field field-200">
              <label for="license_insert-customer_name">{{ t('common_order_info.customer_name') || '學校名稱' }}</label>
              <input
                id="license_insert-customer_name"
                v-model="insertForm.customer_name"
                type="text"
                list="insert_school_datalist"
                autocomplete="off"
                :placeholder="t('common_order_info.customer_name_placeholder') || '請輸入或選擇學校...'"
                required
                class="ui-input"
              />
              <datalist id="insert_school_datalist">
                <option v-for="s in schoolOptions" :key="s" :value="s"></option>
              </datalist>
            </div>
          </div>

          <!-- 教學組長帳號設定 (avaclassroom 限定) -->
          <div v-if="insertIsClassroom" class="license-teacher-panel">
            <div class="license-teacher-panel-title">{{ t('license.teacher_account_settings') }}</div>
            <div class="license-form-row">
              <div class="form-field field-grow">
                <label>{{ t('license.teacher_name') }}</label>
                <input v-model="teacherForm.name" type="text" :placeholder="t('license.teacher_name_placeholder')" class="ui-input" />
              </div>
              <div class="form-field field-grow">
                <label>{{ t('license.teacher_email') }}</label>
                <input v-model="teacherForm.email" type="email" :placeholder="t('license.teacher_email_placeholder')" class="ui-input" />
              </div>
            </div>
            <div class="license-form-row">
              <div class="form-field field-grow">
                <label>{{ t('license.teacher_password') }}</label>
                <input v-model="teacherForm.password" type="password" :placeholder="t('license.teacher_password_placeholder')" class="ui-input" />
              </div>
              <div class="form-field field-grow">
                <label>{{ t('license.teacher_password_confirm') }}</label>
                <input v-model="teacherForm.password_confirm" type="password" :placeholder="t('license.teacher_password_confirm_placeholder')" class="ui-input" />
              </div>
            </div>
          </div>

          <div class="license-form-row">
            <div class="form-field field-200">
              <label for="license_insert-license_begin_time">{{ t('license.license_begin_time') }}</label>
              <input id="license_insert-license_begin_time" v-model="insertForm.license_begin_time" type="date" required class="ui-input" />
            </div>
            <div class="form-field field-200">
              <label for="license_insert-license_days">{{ t('license.license_days') }}</label>
              <input id="license_insert-license_days" v-model="insertForm.license_days" type="number" required class="ui-input" />
            </div>
          </div>

          <div class="form-field field-200">
            <label for="license_insert-license_count">{{ t('license.license_count') }}</label>
            <input id="license_insert-license_count" v-model="insertForm.license_count" type="number" required class="ui-input" />
          </div>

          <div class="form-field field-full">
            <label for="license_insert-note00">{{ t('common.note00') }}</label>
            <textarea id="license_insert-note00" v-model="insertForm.note00" class="ui-input"></textarea>
          </div>

          <!-- 附件上傳 (原 dropzone / EnableDragFile) -->
          <div class="license-upload-block">
            <span class="license-upload-label">{{ t('common.upload') }}</span>
            <div
              class="dropzone"
              :class="{ highlight: insertDragHighlight }"
              @click="triggerInsertFilePick"
              @dragenter.prevent.stop="insertDragHighlight = true"
              @dragover.prevent.stop="insertDragHighlight = true"
              @dragleave.prevent.stop="insertDragHighlight = false"
              @drop.prevent.stop="onInsertDrop"
            >
              <img src="/assets/images/上傳.svg" alt="" class="dropzone-icon" />
              <strong class="dropzone-hint">{{ t('common.drop_files_here') }}</strong>
              <u class="dropzone-hint">{{ t('common.choose_files') }}</u>
              <div class="dz-list">
                <div v-for="(f, i) in insertFiles" :key="f.name + f.size" class="dz-item">
                  <div class="dz-item-name">
                    <img src="/assets/images/list_information.svg" alt="" />
                    <span>{{ f.name }}</span>
                  </div>
                  <div class="dz-item-meta">
                    <span class="dz-item-size">{{ humanSize(f.size) }}</span>
                    <span class="dz-item-remove" @click.stop="insertFiles.splice(i, 1)">x</span>
                  </div>
                </div>
              </div>
              <input ref="insertFileInput" type="file" multiple hidden @change="onInsertFilePick" />
            </div>
          </div>

          <div class="license-modal-actions">
            <!-- 取消 = 輕量 Tertiary；儲存 = 本 Modal 的主要動作 Primary -->
            <button type="button" id="license_insert-button-cancel" class="btn-tertiary modal-action-btn" @click="closeInsertModal">
              {{ t('common.cancel') }}
            </button>
            <button type="button" id="license_insert-button-ok" class="btn-primary modal-action-btn" @click="LicenseInsertOne">
              {{ t('common.save') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 編輯訂單 Modal (原 license-update-modal，改用全站 ui-modal 樣式) -->
      <div v-if="updateModalVisible" class="ui-modal-overlay">
        <div class="ui-modal license-modal">
          <div class="license-modal-header">
            <div class="license-modal-title">
              <img src="/assets/images/Group 1053.svg" alt="" />
              <span>{{ t('license.edit_title') || '編輯訂單資訊' }}</span>
            </div>
            <img src="/assets/images/X.svg" alt="" class="license-modal-close" @click="closeUpdateModal" />
          </div>

          <div class="license-form-row">
            <div class="form-field field-200">
              <label>{{ t('license.license_cid') || '訂單編號' }}</label>
              <input v-model="updateFormL.license_cid" type="text" disabled class="ui-input" />
            </div>
            <div class="form-field field-200">
              <label>{{ t('license.create_time') || t('common.create_time') }}</label>
              <input v-model="updateFormL.create_time" type="date" disabled class="ui-input" />
            </div>
          </div>

          <div class="license-form-row">
            <div class="form-field field-200">
              <label>{{ t('license.agent_cid') || t('common.agent_cid') }}</label>
              <input v-model="updateFormL.agent_cid" type="text" disabled class="ui-input" />
            </div>
            <div class="form-field field-200">
              <label>{{ t('license.owner_cid') || t('common.owner_cid') }}</label>
              <input v-model="updateFormL.owner_cid" type="text" disabled class="ui-input" />
            </div>
            <div class="form-field field-200">
              <label>{{ t('license.record_state') || t('common.record_state') }}</label>
              <select v-model="updateFormL.record_state" class="ui-input">
                <option value="1">{{ t('common.open') }}</option>
                <option value="0">{{ t('common.close') }}</option>
              </select>
            </div>
          </div>

          <div class="license-form-row">
            <div class="form-field field-300">
              <label>{{ t('license.license_Key') || t('common.license_Key') }}</label>
              <input v-model="updateFormL.license_key" type="text" disabled class="ui-input" />
            </div>
            <div class="form-field field-300">
              <label>{{ t('license.license_begin_time') }}</label>
              <input v-model="updateFormL.license_begin_time" type="date" required class="ui-input" />
            </div>
          </div>

          <div class="license-form-row">
            <div class="form-field field-300">
              <label>{{ t('license.license_days') }}</label>
              <input v-model="updateFormL.license_days" type="number" required class="ui-input" />
            </div>
          </div>

          <div class="form-field field-300">
            <label>{{ t('license.license_count') }}</label>
            <input v-model="updateFormL.license_count" type="number" required class="ui-input" />
          </div>

          <div class="form-field field-full">
            <label>{{ t('license.note00') || t('common.note00') }}</label>
            <textarea v-model="updateFormL.note00" :placeholder="t('common.note00_hint')" class="ui-input"></textarea>
          </div>

          <!-- 附件 (原 dropzone-update：既有附件 + 重新上傳) -->
          <div class="license-upload-block">
            <span class="license-upload-label">{{ t('common.upload') }}</span>
            <div
              class="dropzone"
              :class="{ highlight: updateDragHighlight }"
              @click="triggerUpdateFilePick"
              @dragenter.prevent.stop="updateDragHighlight = true"
              @dragover.prevent.stop="updateDragHighlight = true"
              @dragleave.prevent.stop="updateDragHighlight = false"
              @drop.prevent.stop="onUpdateDrop"
            >
              <img src="/assets/images/上傳.svg" alt="" class="dropzone-icon" />
              <u class="dropzone-hint">{{ t('license.reupload_hint') || '移除舊檔案並重新上傳' }}</u>
              <!-- 既有附件 -->
              <div v-if="existingAttachmentPaths.length" class="dz-list dz-list-existing">
                <div v-for="(path, i) in existingAttachmentPaths" :key="path" class="dz-item">
                  <div class="dz-item-name">
                    <img src="/assets/images/list_information.svg" alt="" />
                    <span>{{ path.split('/').pop() }}</span>
                  </div>
                  <span class="dz-item-remove" @click.stop="existingAttachmentPaths.splice(i, 1)">x</span>
                </div>
              </div>
              <!-- 新選擇的檔案 -->
              <div class="dz-list">
                <div v-for="(f, i) in updateFiles" :key="f.name + f.size" class="dz-item">
                  <div class="dz-item-name">
                    <img src="/assets/images/list_information.svg" alt="" />
                    <span>{{ f.name }}</span>
                  </div>
                  <div class="dz-item-meta">
                    <span class="dz-item-size">{{ humanSize(f.size) }}</span>
                    <span class="dz-item-remove" @click.stop="updateFiles.splice(i, 1)">x</span>
                  </div>
                </div>
              </div>
              <input ref="updateFileInput" type="file" multiple hidden @change="onUpdateFilePick" />
            </div>
          </div>

          <div class="license-modal-actions">
            <button type="button" id="license_update-button-cancel" class="btn-tertiary modal-action-btn" @click="closeUpdateModal">
              {{ t('common.cancel') }}
            </button>
            <button type="button" id="license_update-button-ok" class="btn-primary modal-action-btn" @click="LicenseUpdateOne">
              {{ t('common.save') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 作廢確認 Modal (原 delete-confirmation-modal) -->
      <div v-if="deleteModalVisible" class="ui-modal-overlay license-delete-overlay">
        <div class="ui-modal license-delete-modal">
          <div class="license-delete-header">
            <div class="license-delete-icon">
              <img src="/assets/images/device_delete.svg" alt="" />
            </div>
            <h3>{{ t('common.delete') || '刪除' }}</h3>
          </div>
          <div class="license-delete-body">
            <p>{{ deleteModalMessage }}</p>
            <div class="license-delete-items">
              <div v-for="(item, idx) in deleteModalItems" :key="idx">{{ item }}</div>
            </div>
          </div>
          <div class="license-delete-actions">
            <button class="delete-modal-cancel" @click="deleteModalVisible = false">
              {{ t('common.cancel') || '取消' }}
            </button>
            <button class="delete-modal-confirm" @click="confirmDeleteLicenses">
              {{ t('common.update') || '確定' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
// 邏輯抽離至 LicenseView.js，此處僅保留模板繫結
import AppLayout from '@/layouts/AppLayout/AppLayout.vue'
import TablePagination from '@/components/TablePagination/TablePagination.vue'
import { useLicenseView } from './LicenseView.js'

const {
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
} = useLicenseView()
</script>

<style src="./LicenseView.css"></style>
