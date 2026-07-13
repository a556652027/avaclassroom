<template>
  <AppLayout>
    <div class="page">
      <div class="page-caption">
        <h1 id="organization-title">{{ t('organization.title_list_organization') || t('sidebarnav.organization') }}</h1>
      </div>
      <!-- 組織列表 (原 organization.html page01) -->
      <div>
        <div class="responsive-toolbar">
          <div class="responsive-toolbar-group">
            <div id="organization_list-role" style="font-weight: bold; color: #214f7c; font-size: 16px">{{ roleLabel }}</div>
          </div>
          <div class="responsive-toolbar-group" style="align-items: flex-end">
            <div class="styled-select blue rounded" style="margin: 0; width: auto; height: 38px">
              <select v-model="searchField" style="height: 38px; width: 150px; font-size: 14px">
                <option value="2">{{ t('common.owner_cid') }}</option>
                <option value="7">{{ t('organization.country') }}</option>
              </select>
            </div>
            <input
              v-model="searchValue"
              type="search"
              :placeholder="t('common.search_condition')"
              style="padding: 6px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; height: 38px; box-sizing: border-box; margin-left: 8px"
              @keyup.enter="onSearch"
            />
            <button class="image_button_default" style="margin-left: 8px" @click="onSearch">
              <i class="iconfont">&#xe778;&nbsp;</i>
              {{ t('common.search') }}
            </button>
            <button class="image_button_default" style="margin-left: 8px" @click="openAddModal">
              <i class="iconfont">&#xe782;&nbsp;</i>
              {{ t('common.insert') }}
            </button>
          </div>
        </div>
        <table class="frame-table" style="margin-top: 0">
          <tbody>
            <!-- 顯示資料的地方 -->
            <tr>
              <td colspan="12">
                <div class="viewpoint-container">
                  <table class="responstable">
                    <thead>
                      <tr>
                        <th style="width: 5%; background: #2e4660"></th>
                        <th>{{ t('organization.group_name') }}</th>
                        <th>{{ t('organization.group_cid') }}</th>
                        <th>{{ t('common.create_time') }}</th>
                        <th>{{ t('common.agent_cid') }}</th>
                        <th>{{ t('organization.country') }}</th>
                        <th>{{ t('organization.licensing_remaining_seats') }}</th>
                        <th>{{ t('organization.contact') }}</th>
                        <th>{{ t('organization.contact_phone_01') }}</th>
                        <th>{{ t('organization.contact_email_01') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in rows" :key="row.group_cid">
                        <td>
                          <button type="button" class="link_text" @click="openEditModal(row.group_cid)">
                            <i class="iconfont">&#xe764;</i>
                          </button>
                          <button type="button" class="link_text" @click="goDashboard(row.group_cid)">
                            <i class="iconfont">&#xe767;&nbsp;</i>
                          </button>
                        </td>
                        <td>{{ row.group_name }}</td>
                        <td>{{ row.group_cid }}</td>
                        <td>{{ row.create_time }}</td>
                        <td>{{ row.agent_cid }}</td>
                        <td>{{ row.country }}</td>
                        <td>{{ row.licensing_remaining_seats }}</td>
                        <td>{{ row.contact }}</td>
                        <td>{{ row.contact_phone_01 }}</td>
                        <td>{{ row.contact_email_01 }}</td>
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
                  <TablePagination
                    :total-records="totalRecords"
                    :rows-per-page="rowsPerPage"
                    :current-page="currentPage"
                    @change="(page) => loadOrganizations(page)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
// 原 views/app.view.organization.js (OrganizationSelectAll 伺服器端分頁 + 搜尋條件選擇器)
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import TablePagination from '@/components/TablePagination.vue'
import { t } from '@/locales'
import { emitter } from '@/core/emitter'
import { VisibleLoaderElement } from '@/core/loader'
import { apiCall } from '@/core/util'
import {
  CsRequestGroupSelectAllCountByCondition,
  CsRequestGroupSelectAllRecordsByCondition,
} from '@/api/organization'

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
</script>
