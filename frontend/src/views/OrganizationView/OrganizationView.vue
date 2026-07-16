<template>
  <AppLayout>
    <div class="page organization-page">
      <div class="page-caption">
        <h1 id="organization-title">{{ t('organization.title_list_organization') || t('sidebarnav.organization') }}</h1>
      </div>
      <!-- 組織列表 (原 organization.html page01) -->
      <div>
        <div class="responsive-toolbar">
          <div class="responsive-toolbar-group">
            <div id="organization_list-role" class="org-role-label">{{ roleLabel }}</div>
          </div>
          <div class="responsive-toolbar-group" style="align-items: flex-end">
            <div class="styled-select" style="margin: 0; width: 160px">
              <select v-model="searchField">
                <option value="2">{{ t('common.owner_cid') }}</option>
                <option value="7">{{ t('organization.country') }}</option>
              </select>
            </div>
            <input
              v-model="searchValue"
              type="search"
              :placeholder="t('common.search_condition')"
              class="ui-input org-search-input"
              @keyup.enter="onSearch"
            />
            <button class="btn-secondary btn-sm" style="margin-left: 8px" @click="onSearch">
              <i class="iconfont">&#xe778;&nbsp;</i>
              {{ t('common.search') }}
            </button>
            <button class="btn-primary btn-sm" style="margin-left: 8px" @click="openAddModal">
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
                        <th style="width: 5%"></th>
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
// 邏輯抽離至 OrganizationView.js，此處僅保留模板繫結
import AppLayout from '@/layouts/AppLayout/AppLayout.vue'
import TablePagination from '@/components/TablePagination/TablePagination.vue'
import { useOrganizationView } from './OrganizationView.js'

const {
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
} = useOrganizationView()
</script>

<style src="./OrganizationView.css"></style>
