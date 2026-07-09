<template>
  <AppLayout>
    <div class="page">
      <div class="page-caption" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem">
        <h1>{{ t('sidebarnav.organization') }}</h1>
        <button type="button" class="image_button_default" @click="openAddModal">
          {{ t('common.add') || '新增' }}
        </button>
      </div>

      <div class="responsive-toolbar" style="margin-bottom: 1rem">
        <div class="search-box" style="height: 38px">
          <svg class="search-box-icon" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M13.293 14.707a8 8 0 111.414-1.414l4.586 4.586a1 1 0 01-1.414 1.414l-4.586-4.586zM8 14a6 6 0 100-12 6 6 0 000 12z"
              clip-rule="evenodd"
            />
          </svg>
          <input v-model="searchKeyword" type="search" :placeholder="t('common.search')" class="search-box-input" />
        </div>
      </div>

      <div class="viewpoint-container">
        <table class="responstable">
          <thead>
            <tr>
              <th>{{ t('organization.group_name') || '公司名稱' }}</th>
              <th>{{ t('organization.group_cid') || '公司編號' }}</th>
              <th>{{ t('common.create_time') || '建立時間' }}</th>
              <th>{{ t('organization.contact') || '聯絡人' }}</th>
              <th>{{ t('organization.contact_phone_01') || '聯絡電話' }}</th>
              <th>{{ t('common.action') || '操作' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagedRows" :key="row.group_cid">
              <td>{{ row.group_name }}</td>
              <td>{{ row.group_cid }}</td>
              <td>{{ row.create_time }}</td>
              <td>{{ row.contact }}</td>
              <td>{{ row.contact_phone_01 }}</td>
              <td>
                <button type="button" class="link_text" @click="openEditModal(row.group_cid)">
                  {{ t('common.update') || '編輯' }}
                </button>
                <button type="button" class="link_text" @click="goDashboard(row.group_cid)">
                  {{ t('dashboard.title') || '儀表板' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="centered-content" style="margin-top: 1rem">
        <TablePagination :total-records="filteredRows.length" :rows-per-page="rowsPerPage" :current-page="currentPage" @change="(page) => (currentPage = page)" />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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
const currentPage = ref(1)
const rowsPerPage = ref(10)
const searchKeyword = ref('')
let requestController = null

function getConditionTarget() {
  const ownerCid = window.sessionStorage.getItem('member_cid') || window.Cyberspace?.Client?.getUsername() || ''
  return {
    condition_type: 2,
    condition_value: ownerCid,
  }
}

const filteredRows = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return rows.value
  return rows.value.filter((row) => [row.group_name, row.group_cid, row.contact, row.contact_phone_01].some((value) => String(value).toLowerCase().includes(keyword)))
})

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  return filteredRows.value.slice(start, start + rowsPerPage.value)
})

async function loadOrganizations() {
  if (requestController) requestController.abort()
  requestController = new AbortController()
  VisibleLoaderElement(true)

  try {
    const { condition_type, condition_value } = getConditionTarget()
    const countResult = await apiCall(CsRequestGroupSelectAllCountByCondition, condition_type, condition_value, requestController)
    const total = Number(countResult.count || 0)

    if (total <= 0) {
      rows.value = []
      return
    }

    const result = await apiCall(CsRequestGroupSelectAllRecordsByCondition, condition_type, condition_value, 0, total, requestController)
    const records = result.records || {}
    const recordCount = records.group_cid ? records.group_cid.length : 0
    rows.value = Array.from({ length: recordCount }, (_, index) => ({
      group_cid: records.group_cid?.[index] || '',
      group_name: records.group_name?.[index] || '',
      create_time: records.create_time?.[index] || '',
      contact: records.contact?.[index] || '',
      contact_phone_01: records.contact_phone_01?.[index] || '',
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
  loadOrganizations()
})

onBeforeUnmount(() => {
  requestController?.abort()
})
</script>
