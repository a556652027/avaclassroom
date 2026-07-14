<template>
  <AppLayout>
    <div class="page license-page">
      <div class="license-header-container" style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div class="page-caption" style="display: flex; align-items: center; margin-bottom: 1rem;">
            <div class="page-icon-container">
              <img src="/assets/images/IdentificationBadge.svg" alt="" class="page-icon" />
            </div>
            <h1>{{ pageTitle }}</h1>
          </div>
          <button
            type="button"
            id="license_list-button-gotopage_insert"
            class=""
            style="background-color: #214f7c; width: 218px; height: 48px; border-radius: 10px; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px;"
            @click="openAddModal"
            @mouseenter="insertBtnHover = true"
            @mouseleave="insertBtnHover = false"
          >
            <img id="license_insert_button_icon" :src="insertBtnHover ? '/assets/images/information_button_orange.png' : '/assets/images/Group 607.svg'" alt="" style="width: 20px; height: 20px" />
            <p style="margin-bottom: 3px">{{ t('common.add') || '新增訂單' }}</p>
          </button>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end;">
          <img src="/assets/images/Group (2).svg" alt="" class="page-big-icon" style="width: 122px; height: auto; margin-right: 1rem" />
          <section class="stats-card-container" style="background-color: #e6f1fd; min-height: 112px; border-radius: 16px; color: #404040; padding: 24px; display: flex; flex-wrap: wrap; gap: 2rem; align-items: flex-start;">
            <div>
              <p style="font-size: 14px; line-height: 20px; margin-bottom: 0.5rem;">{{ t('license.total_licensed_count') || '授權總數' }}</p>
              <div style="display: flex; align-items: center; gap: 1rem;">
                <p id="license-total-count" style="font-weight: 600; font-size: 24px">{{ totalCount.toLocaleString() }}</p>
                <div v-show="totalGrowthVisible" id="license-total-growth-rate" style="display: flex; align-items: center; gap: 0.5rem;">
                  <span id="license-total-growth-percentage" style="font-size: 14px">{{ totalGrowthText }}</span>
                  <img id="license-total-growth-icon" :src="totalGrowthUp ? '/assets/images/up.svg' : '/assets/images/down.svg'" alt="" style="width: 16px; height: 16px" />
                </div>
              </div>
            </div>
            <div>
              <p style="font-size: 14px; line-height: 20px; margin-bottom: 0.5rem;">{{ t('license.new_this_quarter') || '本季新增' }}</p>
              <div style="display: flex; align-items: center; gap: 1rem;">
                <p id="license-quarterly-count" style="font-weight: 600; font-size: 24px; margin-right: 1rem;">{{ quarterlyCount.toLocaleString() }}</p>
                <div v-show="quarterlyGrowthVisible" id="license-quarterly-growth-rate" style="display: flex; align-items: center; gap: 0.5rem;">
                  <span id="license-quarterly-growth-percentage" style="font-size: 14px">{{ quarterlyGrowthText }}</span>
                  <img id="license-quarterly-growth-icon" :src="quarterlyGrowthUp ? '/assets/images/up.svg' : '/assets/images/down.svg'" alt="" style="width: 16px; height: 16px" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div class="responsive-toolbar" style="margin-bottom: 1rem; gap: 0.75rem; flex-wrap: wrap;">
        <div class="responsive-toolbar-group">
          <input id="license-select-all" type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
          <label for="license-select-all" style="display: flex; align-items: center; font-size: 14px; color: #374151; cursor: pointer; margin-right: 8px;">
            {{ t('common.select_all') || '全選' }}
          </label>
          <button type="button" id="license-edit-button" class="edit-button" @click="openEditSelected" @mouseenter="editBtnHover = true" @mouseleave="editBtnHover = false">
            <img id="license-edit-icon" :src="editBtnHover ? '/assets/images/edit_button_change.png' : '/assets/images/edit.svg'" alt="編輯" style="width: 24px; height: 24px; object-fit: contain" />
          </button>
          <button type="button" id="license-download-button" class="edit-button" @click="downloadSelectedLicenses" @mouseenter="downloadBtnHover = true" @mouseleave="downloadBtnHover = false">
            <img id="license-download-icon" :src="downloadBtnHover ? '/assets/images/dowload_button_change.png' : '/assets/images/download.svg'" alt="下載" style="width: 20px; height: 20px; object-fit: contain" />
          </button>
          <button type="button" id="license-download-all-button" class="edit-button" title="匯出全部" @click="exportAllLicenses" @mouseenter="downloadAllBtnHover = true" @mouseleave="downloadAllBtnHover = false">
            <img id="license-download-all-icon" :src="downloadAllBtnHover ? '/assets/images/download_all_white.svg' : '/assets/images/download_all_light_blue.svg'" alt="匯出全部" style="width: 20px; height: 20px; object-fit: contain" />
          </button>
          <button type="button" id="license-delete-button" class="edit-button-trash" @click="deleteSelectedLicenses">
            <img src="/assets/images/trash.svg" alt="刪除" style="width: 20px; height: 20px; object-fit: contain" />
          </button>
        </div>

        <div class="responsive-toolbar-group" style="align-items: flex-end">
          <!-- 原 license_list-customer_name-container：訂購人名稱搜尋欄位 (僅 avaclassroom 產品顯示) -->
          <div v-if="showCustomerSearch" style="display: flex; flex-direction: column; margin-right: 12px">
            <label for="license_list-customer_name" style="font-size: 12px; color: #666; margin-bottom: 2px">
              {{ t('common_order_info.customer_name') || '訂購人名稱' }}
            </label>
            <div style="position: relative; display: flex; align-items: center">
              <input
                id="license_list-customer_name"
                v-model="customerName"
                type="text"
                :placeholder="(t('common.search') || '搜尋') + '...'"
                style="padding: 6px 26px 6px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; height: 38px; box-sizing: border-box; width: 150px"
                @keyup.enter="loadLicenses(1)"
              />
              <span
                v-show="customerName"
                class="license-customer-clear"
                style="position: absolute; right: 8px; cursor: pointer; color: #aaa; font-size: 12px; user-select: none; font-weight: bold; transition: color 0.2s"
                @click="clearCustomerName(); loadLicenses(1)"
              >
                ✕
              </span>
            </div>
          </div>
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
              <span id="license-status-text" style="color: rgba(0, 0, 0, 0.2);">
                {{ statusOptionLabel }}
              </span>
              <img src="/assets/images/list_section.svg" alt="選單" />
            </div>

            <div
              id="license-status-options"
              v-show="statusDropdownOpen"
              style="position: absolute; top: 42px; left: 12px; width: 150px; background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); z-index: 1000; overflow: hidden;"
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

      <!-- 訂單列表 (欄位與 www/license.html 一致：創建日/客戶名稱/授權日期/天數/到期時間/狀態/訂單數量/備註/Dashboard) -->
      <div class="viewpoint-container">
        <table class="responstable">
          <thead>
            <tr>
              <th style="width: 5%"></th>
              <th style="cursor: pointer" @click="toggleSort('create_time')">
                {{ t('common.create_time') }}
                <img id="sort-create_time" src="/assets/images/sort_up.svg" alt="" class="sort-icon" :style="sortIconStyle('create_time')" />
              </th>
              <th style="cursor: pointer" @click="toggleSort('customer_name')">
                {{ customerColLabel }}
                <img id="sort-customer_name" src="/assets/images/sort_up.svg" alt="" class="sort-icon" :style="sortIconStyle('customer_name')" />
              </th>
              <th style="cursor: pointer" @click="toggleSort('license_begin_time')">
                {{ t('license.license_begin_time') }}
                <img id="sort-license_begin_time" src="/assets/images/sort_up.svg" alt="" class="sort-icon" :style="sortIconStyle('license_begin_time')" />
              </th>
              <!-- 原 www/license.html 此標題被註解掉，僅保留空欄位 -->
              <th></th>
              <th style="cursor: pointer" @click="toggleSort('license_end_time')">
                {{ t('license.license_end_time') }}
                <img id="sort-license_end_time" src="/assets/images/sort_up.svg" alt="" class="sort-icon" :style="sortIconStyle('license_end_time')" />
              </th>
              <!-- 原 www/license.html 此標題被註解掉，僅保留空欄位 -->
              <th></th>
              <th style="cursor: pointer" @click="toggleSort('license_count')">
                {{ t('license.license_count') }}
                <img id="sort-license_count" src="/assets/images/sort_up.svg" alt="" class="sort-icon" :style="sortIconStyle('license_count')" />
              </th>
              <th>{{ t('license.license_note') }}</th>
              <th>{{ t('license.dashboard') }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="row in rows" :key="row.license_cid">
              <!-- 原 renderTable：record_state == 0 的列直接隱藏 -->
              <tr v-if="row.record_state !== '0'" :style="row.expired ? { backgroundColor: '#D9DDE3' } : {}">
                <td><input v-model="row.checked" type="checkbox" class="license-row-checkbox" /></td>
                <td>{{ row.create_time.substring(0, 10) }}</td>
                <td>{{ row.customer_name }}</td>
                <td>{{ row.license_begin_time.substring(0, 10) }}</td>
                <td style="color: #97aac2">{{ row.license_days }} 天</td>
                <td>{{ row.end_day_text }}</td>
                <td>
                  <span v-if="row.expired" style="color: #404040">{{ t('license.expired') }}</span>
                  <template v-else>{{ t('license.active') }}</template>
                </td>
                <td style="color: #97aac2">{{ row.license_count }}</td>
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

      <!-- 新增訂單 Modal (原 license-insert-modal，樣式與 www/license.html 一致) -->
      <div
        v-if="insertModalVisible"
        style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 1000; justify-content: center; align-items: center"
      >
        <div style="display: flex; flex-direction: column; background: white; box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.2); padding: 30px; width: 90%; max-width: 800px; border-radius: 15px; max-height: 90vh; overflow-y: auto">
          <div style="display: flex; justify-content: space-between">
            <div style="display: flex; align-items: center">
              <img src="/assets/images/add new_button.svg" alt="" />
              <span style="color: #000000; font-size: 24px; margin-left: 8px; font-weight: 900">
                {{ t('common.insert') || '新增' }}
              </span>
            </div>
            <img src="/assets/images/X.svg" alt="" style="cursor: pointer" @click="closeInsertModal" />
          </div>

          <div style="display: flex; gap: 2rem; flex-wrap: wrap">
            <!-- 顯示隸屬組織（代理商 ID），設為唯讀以供確認 -->
            <div style="display: flex; flex-direction: column">
              <label for="license_insert-owner_cid" style="color: #898c94; margin-top: 1rem">{{ t('common.owner_cid') }}</label>
              <input
                id="license_insert-owner_cid"
                v-model="insertForm.owner_cid"
                type="text"
                readonly
                style="padding: 8px; margin-top: 0.5rem; width: 200px; border: 1px solid #e5e8ea; border-radius: 6px; outline: none; background-color: #f3f4f6; color: #6b7280; cursor: not-allowed"
              />
            </div>

            <div style="display: flex; flex-direction: column; width: 200px">
              <label for="license_insert-product_type" style="color: #898c94; margin-top: 1rem">{{ t('common.product_type') }}</label>
              <div style="position: relative; margin-top: 0.5rem; width: 100%; display: flex">
                <input
                  id="license_insert-product_type"
                  v-model="insertForm.product_type"
                  type="text"
                  autocomplete="off"
                  style="padding: 8px; border: 1px solid #e5e8ea; border-right: none; border-radius: 6px 0 0 6px; outline: none; flex: 1; font-size: 14px; min-width: 0"
                />
                <button
                  type="button"
                  style="border: 1px solid #e5e8ea; border-left: none; background: #fff; border-radius: 0 6px 6px 0; padding: 0 10px; cursor: pointer"
                  @click.stop="productDropdownOpen = !productDropdownOpen"
                >▼</button>
                <ul
                  v-show="productDropdownOpen"
                  style="position: absolute; top: 100%; left: 0; width: 100%; background: #fff; border-radius: 6px; z-index: 1000; list-style: none; padding: 0; margin: 4px 0 0 0; max-height: 200px; overflow-y: auto; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)"
                >
                  <li
                    v-for="p in productOptions"
                    :key="p.type"
                    class="custom-dropdown-item"
                    style="padding: 12px; cursor: pointer; font-size: 14px; color: rgba(0, 0, 0, 0.7); transition: background-color 0.2s"
                    @click.stop="selectInsertProduct(p.type)"
                  >
                    {{ p.name }} ({{ p.type }})
                  </li>
                </ul>
              </div>
            </div>

            <!-- 學校名稱 (avaclassroom 限定，含 datalist 聯想) -->
            <div v-if="insertIsClassroom" style="display: flex; flex-direction: column; width: 200px">
              <label for="license_insert-customer_name" style="color: #898c94; margin-top: 1rem">
                {{ t('common_order_info.customer_name') || '學校名稱' }}
              </label>
              <input
                id="license_insert-customer_name"
                v-model="insertForm.customer_name"
                type="text"
                list="insert_school_datalist"
                autocomplete="off"
                :placeholder="t('common_order_info.customer_name_placeholder') || '請輸入或選擇學校...'"
                required
                style="padding: 8px; margin-top: 0.5rem; width: 200px; border: 1px solid #e5e8ea; border-radius: 6px; outline: none; box-sizing: border-box"
              />
              <datalist id="insert_school_datalist">
                <option v-for="s in schoolOptions" :key="s" :value="s"></option>
              </datalist>
            </div>
          </div>

          <!-- 教學組長帳號設定 (avaclassroom 限定) -->
          <div
            v-if="insertIsClassroom"
            style="padding: 15px; background-color: #f8fafc; border: 1px dashed #e2e8f0; border-radius: 8px; margin-top: 1rem"
          >
            <div style="font-weight: bold; color: #1e293b; margin-bottom: 10px">{{ t('license.teacher_account_settings') }}</div>
            <div style="display: flex; flex-wrap: wrap; gap: 1rem">
              <div style="display: flex; flex-direction: column; flex: 1; min-width: 200px">
                <label style="color: #64748b; font-size: 13px; margin-bottom: 4px">{{ t('license.teacher_name') }}</label>
                <input v-model="teacherForm.name" type="text" :placeholder="t('license.teacher_name_placeholder')" style="padding: 8px; border: 1px solid #e5e8ea; border-radius: 6px; outline: none; background: #fff" />
              </div>
              <div style="display: flex; flex-direction: column; flex: 1; min-width: 200px">
                <label style="color: #64748b; font-size: 13px; margin-bottom: 4px">{{ t('license.teacher_email') }}</label>
                <input v-model="teacherForm.email" type="email" :placeholder="t('license.teacher_email_placeholder')" style="padding: 8px; border: 1px solid #e5e8ea; border-radius: 6px; outline: none; background: #fff" />
              </div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 10px">
              <div style="display: flex; flex-direction: column; flex: 1; min-width: 200px">
                <label style="color: #64748b; font-size: 13px; margin-bottom: 4px">{{ t('license.teacher_password') }}</label>
                <input v-model="teacherForm.password" type="password" :placeholder="t('license.teacher_password_placeholder')" style="padding: 8px; border: 1px solid #e5e8ea; border-radius: 6px; outline: none; background: #fff" />
              </div>
              <div style="display: flex; flex-direction: column; flex: 1; min-width: 200px">
                <label style="color: #64748b; font-size: 13px; margin-bottom: 4px">{{ t('license.teacher_password_confirm') }}</label>
                <input v-model="teacherForm.password_confirm" type="password" :placeholder="t('license.teacher_password_confirm_placeholder')" style="padding: 8px; border: 1px solid #e5e8ea; border-radius: 6px; outline: none; background: #fff" />
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 2rem">
            <div style="display: flex; flex-direction: column; width: 200px; margin-top: 1rem">
              <label style="color: #898c94" for="license_insert-license_begin_time">{{ t('license.license_begin_time') }}</label>
              <input
                id="license_insert-license_begin_time"
                v-model="insertForm.license_begin_time"
                type="date"
                required
                style="padding: 8px; margin-top: 0.5rem; width: 200px; border: 1px solid #e5e8ea; border-radius: 6px; outline: none; box-sizing: border-box"
              />
            </div>
            <div style="display: flex; flex-direction: column; margin-top: 1rem; width: 200px">
              <label for="license_insert-license_days" style="color: #898c94">{{ t('license.license_days') }}</label>
              <input
                id="license_insert-license_days"
                v-model="insertForm.license_days"
                type="number"
                required
                style="padding: 8px; margin-top: 0.5rem; width: 200px; border: 1px solid #e5e8ea; border-radius: 6px; outline: none; box-sizing: border-box"
              />
            </div>
          </div>

          <div style="display: flex; flex-direction: column">
            <label for="license_insert-license_count" style="color: #898c94; margin-top: 1rem">{{ t('license.license_count') }}</label>
            <input
              id="license_insert-license_count"
              v-model="insertForm.license_count"
              type="number"
              required
              style="padding: 8px; margin-top: 0.5rem; width: 200px; border: 1px solid #e5e8ea; border-radius: 6px; outline: none; box-sizing: border-box"
            />
          </div>

          <div style="display: flex; flex-direction: column">
            <label for="license_insert-note00" style="color: #898c94; margin-top: 1rem">{{ t('common.note00') }}</label>
            <textarea
              id="license_insert-note00"
              v-model="insertForm.note00"
              style="height: 80px; margin-top: 0.5rem; border: 1px solid #e5e8ea; border-radius: 6px; outline: none"
            ></textarea>
          </div>

          <!-- 附件上傳 (原 dropzone / EnableDragFile) -->
          <div style="padding-top: 1rem">
            <span style="color: #898c94">{{ t('common.upload') }}</span>
            <div
              class="dropzone"
              :class="{ highlight: insertDragHighlight }"
              @click="triggerInsertFilePick"
              @dragenter.prevent.stop="insertDragHighlight = true"
              @dragover.prevent.stop="insertDragHighlight = true"
              @dragleave.prevent.stop="insertDragHighlight = false"
              @drop.prevent.stop="onInsertDrop"
            >
              <img src="/assets/images/上傳.svg" alt="" style="margin-bottom: 4px" />
              <strong style="font-size: 14px; margin-bottom: 2px">{{ t('common.drop_files_here') }}</strong>
              <u style="font-size: 14px">{{ t('common.choose_files') }}</u>
              <div class="dz-list" style="margin-top: 8px; width: 100%">
                <div
                  v-for="(f, i) in insertFiles"
                  :key="f.name + f.size"
                  style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; margin-bottom: 6px; background-color: #e6f1fd; border-radius: 6px; border: 1px solid #9caec7"
                >
                  <div style="display: flex; align-items: center; gap: 8px; flex: 1">
                    <img src="/assets/images/list_information.svg" alt="" style="width: 16px; height: 16px" />
                    <span style="font-size: 14px; color: #404040; font-weight: 500">{{ f.name }}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 12px">
                    <span style="font-size: 12px; color: #6b7280">{{ humanSize(f.size) }}</span>
                    <span style="cursor: pointer; font-weight: bold; color: #ff0000; margin-left: 10px; padding: 5px" @click.stop="insertFiles.splice(i, 1)">x</span>
                  </div>
                </div>
              </div>
              <input ref="insertFileInput" type="file" multiple hidden @change="onInsertFilePick" />
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem">
            <button
              type="button"
              id="license_insert-button-cancel"
              style="width: 130px; height: 48px; background-color: #ffffff; border: 1px solid #e5e8ea; border-radius: 10px; cursor: pointer"
              @click="closeInsertModal"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="button"
              id="license_insert-button-ok"
              style="width: 130px; height: 48px; background-color: #214f7c; border-radius: 10px; border: none; color: #ffffff; cursor: pointer"
              @click="LicenseInsertOne"
            >
              {{ t('common.save') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 編輯訂單 Modal (原 license-update-modal，樣式與 www/license.html 一致) -->
      <div
        v-if="updateModalVisible"
        style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 1000; justify-content: center; align-items: center"
      >
        <div style="display: flex; flex-direction: column; background: white; border-radius: 15px; padding: 30px; box-shadow: 5px 5px 20px 0px rgba(0, 0, 0, 0.2); width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto">
          <div style="display: flex; justify-content: space-between">
            <div style="display: flex; align-items: center">
              <div style="margin-right: 10px">
                <img src="/assets/images/Group 1053.svg" alt="" />
              </div>
              <h1 style="margin-top: 3px; font-size: 24px; margin-bottom: 0.5rem">
                {{ t('license.edit_title') || '編輯訂單資訊' }}
              </h1>
            </div>
            <img src="/assets/images/X.svg" alt="" style="cursor: pointer" @click="closeUpdateModal" />
          </div>

          <div style="display: flex; gap: 2rem; margin-bottom: 1rem; flex-wrap: wrap">
            <div style="display: flex; flex-direction: column; width: 200px">
              <label style="color: #898c94; margin-bottom: 0.5rem">{{ t('license.license_cid') || '訂單編號' }}</label>
              <input v-model="updateFormL.license_cid" type="text" disabled style="padding: 8px; border: 1px solid #e5e8ea; border-radius: 6px; outline: none; background-color: #f5f5f5" />
            </div>
            <div style="display: flex; flex-direction: column; width: 200px">
              <label style="color: #898c94; margin-bottom: 0.5rem">{{ t('license.create_time') || t('common.create_time') }}</label>
              <input v-model="updateFormL.create_time" type="date" disabled style="padding: 8px; border: 1px solid #e5e8ea; border-radius: 6px; outline: none; background-color: #f5f5f5" />
            </div>
          </div>

          <div style="display: flex; gap: 2rem; margin-bottom: 1rem; flex-wrap: wrap">
            <div style="display: flex; flex-direction: column; width: 200px">
              <label style="color: #898c94; margin-bottom: 0.5rem">{{ t('license.agent_cid') || t('common.agent_cid') }}</label>
              <input v-model="updateFormL.agent_cid" type="text" disabled style="padding: 8px; border: 1px solid #e5e8ea; border-radius: 6px; outline: none; background-color: #f5f5f5" />
            </div>
            <div style="display: flex; flex-direction: column; width: 200px">
              <label style="color: #898c94; margin-bottom: 0.5rem">{{ t('license.owner_cid') || t('common.owner_cid') }}</label>
              <input v-model="updateFormL.owner_cid" type="text" disabled style="padding: 8px; border: 1px solid #e5e8ea; border-radius: 6px; outline: none; background-color: #f5f5f5" />
            </div>
            <div style="display: flex; flex-direction: column; width: 200px">
              <label style="color: #898c94; margin-bottom: 0.5rem">{{ t('license.record_state') || t('common.record_state') }}</label>
              <select v-model="updateFormL.record_state" style="padding: 8px; border: 1px solid #e5e8ea; border-radius: 6px; outline: none">
                <option value="1">{{ t('common.open') }}</option>
                <option value="0">{{ t('common.close') }}</option>
              </select>
            </div>
          </div>

          <div style="display: flex; gap: 2rem; margin-bottom: 1rem; flex-wrap: wrap">
            <div style="display: flex; flex-direction: column; width: 300px">
              <label style="color: #898c94; margin-bottom: 0.5rem">{{ t('license.license_Key') || t('common.license_Key') }}</label>
              <input v-model="updateFormL.license_key" type="text" disabled style="padding: 8px; border: 1px solid #e5e8ea; border-radius: 6px; outline: none; background-color: #f5f5f5" />
            </div>
            <div style="display: flex; flex-direction: column; width: 300px">
              <label style="color: #898c94; margin-bottom: 0.5rem">{{ t('license.license_begin_time') }}</label>
              <input v-model="updateFormL.license_begin_time" type="date" required style="padding: 8px; border: 1px solid #e5e8ea; border-radius: 6px; outline: none" />
            </div>
          </div>

          <div style="display: flex; gap: 1rem; margin-bottom: 1rem">
            <div style="display: flex; flex-direction: column; width: 300px">
              <label style="color: #898c94; margin-bottom: 0.5rem">{{ t('license.license_days') }}</label>
              <input v-model="updateFormL.license_days" type="number" required style="padding: 8px; border: 1px solid #e5e8ea; border-radius: 6px; outline: none" />
            </div>
          </div>

          <div style="display: flex; flex-direction: column; width: 300px; margin-bottom: 1rem">
            <label style="color: #898c94; margin-bottom: 0.5rem">{{ t('license.license_count') }}</label>
            <input v-model="updateFormL.license_count" type="number" required style="padding: 8px; border: 1px solid #e5e8ea; border-radius: 6px; outline: none" />
          </div>

          <div style="display: flex; margin-bottom: 1rem">
            <div style="display: flex; flex-direction: column; width: 100%">
              <label style="color: #898c94; margin-bottom: 0.5rem">{{ t('license.note00') || t('common.note00') }}</label>
              <textarea
                v-model="updateFormL.note00"
                :placeholder="t('common.note00_hint')"
                style="height: 80px; padding: 8px; border: 1px solid #e5e8ea; border-radius: 6px; outline: none"
              ></textarea>
            </div>
          </div>

          <!-- 附件 (原 dropzone-update：既有附件 + 重新上傳) -->
          <div style="padding-top: 1rem">
            <span style="color: #898c94">{{ t('common.upload') }}</span>
            <div
              class="dropzone"
              :class="{ highlight: updateDragHighlight }"
              @click="triggerUpdateFilePick"
              @dragenter.prevent.stop="updateDragHighlight = true"
              @dragover.prevent.stop="updateDragHighlight = true"
              @dragleave.prevent.stop="updateDragHighlight = false"
              @drop.prevent.stop="onUpdateDrop"
            >
              <img src="/assets/images/上傳.svg" alt="" style="margin-bottom: 4px" />
              <u style="font-size: 14px">{{ t('license.reupload_hint') || '移除舊檔案並重新上傳' }}</u>
              <!-- 既有附件 -->
              <div v-if="existingAttachmentPaths.length" class="dz-list" style="margin-top: 8px; width: 100%; padding-bottom: 12px; border-bottom: 1px solid #e5e8ea">
                <div
                  v-for="(path, i) in existingAttachmentPaths"
                  :key="path"
                  style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; margin-bottom: 6px; background-color: #e6f1fd; border-radius: 6px; border: 1px solid #92bfff"
                >
                  <div style="display: flex; align-items: center; gap: 8px; flex: 1">
                    <img src="/assets/images/list_information.svg" alt="" style="width: 16px; height: 16px" />
                    <span style="font-size: 14px; color: #404040">{{ path.split('/').pop() }}</span>
                  </div>
                  <span style="cursor: pointer; font-weight: bold; color: #ff0000; margin-left: 10px" @click.stop="existingAttachmentPaths.splice(i, 1)">x</span>
                </div>
              </div>
              <!-- 新選擇的檔案 -->
              <div class="dz-list" style="margin-top: 8px; width: 100%">
                <div
                  v-for="(f, i) in updateFiles"
                  :key="f.name + f.size"
                  style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; margin-bottom: 6px; background-color: #e6f1fd; border-radius: 6px; border: 1px solid #9caec7"
                >
                  <div style="display: flex; align-items: center; gap: 8px; flex: 1">
                    <img src="/assets/images/list_information.svg" alt="" style="width: 16px; height: 16px" />
                    <span style="font-size: 14px; color: #404040; font-weight: 500">{{ f.name }}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 12px">
                    <span style="font-size: 12px; color: #6b7280">{{ humanSize(f.size) }}</span>
                    <span style="cursor: pointer; font-weight: bold; color: #ff0000; margin-left: 10px; padding: 5px" @click.stop="updateFiles.splice(i, 1)">x</span>
                  </div>
                </div>
              </div>
              <input ref="updateFileInput" type="file" multiple hidden @change="onUpdateFilePick" />
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem">
            <button
              type="button"
              id="license_update-button-cancel"
              style="width: 130px; height: 48px; background-color: #ffffff; border: 1px solid #e5e8ea; border-radius: 10px; cursor: pointer; font-size: 14px"
              @click="closeUpdateModal"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="button"
              id="license_update-button-ok"
              style="width: 130px; height: 48px; background-color: #214f7c; border-radius: 10px; border: none; color: #ffffff; cursor: pointer; font-size: 14px"
              @click="LicenseUpdateOne"
            >
              {{ t('common.save') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 作廢確認 Modal (原 delete-confirmation-modal) -->
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
            <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.5; white-space: pre-line">{{ deleteModalMessage }}</p>
            <div style="margin-top: 12px; max-height: 200px; overflow-y: auto; background: #f9fafb; border-radius: 6px; padding: 12px">
              <div v-for="(item, idx) in deleteModalItems" :key="idx" style="padding: 4px 0">{{ item }}</div>
            </div>
          </div>
          <div style="display: flex; gap: 12px; justify-content: flex-end">
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
