<template>
  <AppLayout>
    <div class="page license-page">
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
          <input id="license-select-all" type="checkbox" v-model="selectAll" />
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
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import TablePagination from '@/components/TablePagination.vue'
import { t } from '@/locales'
import { VisibleLoaderElement } from '@/core/loader'
import { apiCall } from '@/core/util'
import { useLegacyCss } from '@/composables/useLegacyCss'
import { runExportJob } from '@/services/exportJob'
import { PRODUCT_DICTIONARY, getProductName } from '@/core/products'
import {
  LicenseData,
  CsRequestLicenseSelectAllCount,
  CsRequestLicenseGetStatistics,
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

// 原 showToast：自動消失的提示訊息
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

      // [聯動刪除] avaclassroom 訂單作廢時，一併停用自動生成的學校群組 (sch_ 開頭)
      if (
        license_data.product_type === 'avaclassroom' &&
        license_data.owner_cid &&
        license_data.owner_cid.startsWith('sch_')
      ) {
        try {
          await new Promise((resolveGroup) => {
            if (window.Cyberspace?.Client?.SendRequest) {
              window.Cyberspace.Client.SendRequest(
                '/ava_system/group/update_one_record',
                { group_cid: license_data.owner_cid, record_state: 0 },
                (ok) => {
                  if (ok) disabledSchools.push(license_data.owner_cid)
                  resolveGroup()
                },
              )
            } else {
              resolveGroup()
            }
          })
        } catch (groupErr) {
          console.error('[closeSelectedRecords] Failed to disable related school group:', groupErr)
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
    loadStatistics(condition_type, condition_value)
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
      product_type: records.product_type?.[index] || '',
      note00: records.note00?.[index] || '',
      checked: false,
    }))
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
    await loadLicenses(1)
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

useLegacyCss('/css/page/license.css')

onMounted(() => {
  loadLicenses(1)
  // 點擊外部隱藏產品下拉選單 (原 click.hideProductDrop)
  document.addEventListener('click', closeProductDropdown)
})

onBeforeUnmount(() => {
  requestController?.abort()
  document.removeEventListener('click', closeProductDropdown)
})
</script>

<style>
/* 作廢確認 Modal 按鈕 (與 DeviceView 的 delete-modal 樣式一致，避免未載入 Device 頁時缺樣式) */
.delete-modal-cancel {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.delete-modal-cancel:hover {
  background: #f3f4f6;
}
.delete-modal-confirm {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: rgba(33, 79, 124, 1);
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.delete-modal-confirm:hover {
  background: #ee963f;
}
/* 原 license_list-customer_name-clear 的 hover 變色 */
.license-customer-clear:hover {
  color: #666 !important;
}

/* ===== 附件 dropzone (原 lib.html.js EnableDragFile 注入的樣式) ===== */
.dropzone {
  border: 2px dashed #3b82f6;
  border-radius: 12px;
  padding: 24px;
  min-height: 140px;
  background: #f8fafc;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}
.dropzone.highlight {
  background: #eff6ff;
  border-color: #2563eb;
}
.dz-list {
  font-size: 13px;
  color: #475569;
}

/* 產品下拉選項 hover (原 custom-dropdown-item inline handler) */
.custom-dropdown-item:hover {
  background-color: #f8f9fa;
}

/* Modal 按鈕 hover (原 license.html style 區塊) */
#license_insert-button-cancel,
#license_insert-button-ok,
#license_update-button-cancel,
#license_update-button-ok {
  transition: background-color 0.2s ease;
}
#license_insert-button-cancel:hover,
#license_update-button-cancel:hover {
  background-color: #f5f5f5 !important;
  color: #333 !important;
}
#license_insert-button-ok:hover,
#license_update-button-ok:hover {
  background-color: #ee963f !important;
}
/* 原 www/license.html：手機版 RWD 調整 (Max Width 767px) */
@media screen and (max-width: 767px) {
  .license-page .page-big-icon {
    display: none !important;
  }
  .license-page .license-header-container {
    flex-direction: column !important;
    align-items: stretch !important;
  }
  .license-page .stats-card-container {
    width: 100% !important;
    padding: 1rem !important;
    gap: 1rem !important;
    justify-content: space-around !important;
  }
  #license_list-button-gotopage_insert {
    width: 100% !important;
  }
  .license-page .responsive-toolbar {
    flex-direction: column !important;
    align-items: stretch !important;
    height: auto !important;
  }
  .license-page .responsive-toolbar-group {
    width: 100% !important;
    justify-content: flex-start !important;
  }
  /* 右側過濾區塊改為上下堆疊 */
  .license-page .responsive-toolbar-group:last-child {
    flex-direction: column !important;
    align-items: stretch !important;
    margin-top: 1rem;
  }
  .license-page .responsive-toolbar-group:last-child > div,
  .license-page .responsive-toolbar-group:last-child > button,
  #license_list-customer_name,
  #license-status-button {
    width: 100% !important;
    margin-left: 0 !important;
    margin-top: 0.2rem !important;
    box-sizing: border-box;
  }
  #license-status-options {
    width: 100% !important;
    left: 0 !important;
  }
}
</style>
