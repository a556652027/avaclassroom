<template>
  <aside id="sidebar" class="sidebar">
    <div class="sidebar-content">
      <!-- search -->
      <div class="search-container">
        <svg class="search-icon" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M13.293 14.707a8 8 0 111.414-1.414l4.586 4.586a1 1 0 01-1.414 1.414l-4.586-4.586zM8 14a6 6 0 100-12 6 6 0 000 12z"
            clip-rule="evenodd"
          />
        </svg>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search"
          class="search-input"
          autocomplete="one-time-code"
        />
      </div>

      <!-- 經銷商跟公司國家 -->
      <div class="company-header">
        <p class="company-title">
          <img
            src="/assets/images/IdentificationBadge.png"
            style="width: 20px; height: 20px"
            alt=""
            class="company-icon"
          />
          <span class="company-text">{{ t('sidebarnav.organization') }}</span>
        </p>
      </div>

      <div class="country-header">
        <p class="country-title">{{ t('sidebarnav.country') }}</p>
      </div>

      <!-- country list -->
      <ul class="country-list">
        <li
          v-for="c in countries"
          :key="c.id"
          class="dropdown-item"
          :data-country="c.id"
        >
          <a href="#" class="dropdown-toggle" @click.prevent="toggleCountry(c)">
            <img src="/assets/images/point_noramal.svg" alt="" class="point-icon" />
            <span class="country-name">{{ t('country.' + c.id.toLowerCase()) }}</span>
          </a>
          <ul class="dropdown-menu" :class="{ show: c.show || hasSearchHit(c) }">
            <li v-if="c.loading" style="padding: 10px; text-align: center; color: #888; font-size: 0.9em">
              Loading...
            </li>
            <li v-else-if="c.error" style="padding: 10px; text-align: center; color: red">
              {{ c.error }}
            </li>
            <li
              v-else-if="c.loaded && visibleCompanies(c).length === 0"
              style="padding: 10px; text-align: center; color: #888; font-size: 0.9em"
            >
              無資料
            </li>
            <li
              v-for="(company, idx) in visibleCompanies(c)"
              :key="company.cid"
              class="li-list-item"
              :style="{ animationDelay: idx * 0.05 + 's' }"
            >
              <img src="/assets/images/company.svg" class="icon-img" />
              <a href="#" @click.prevent="onCompanyClick(c, company)">{{ company.displayName }}</a>
              <!-- Classroom 模式的學校子選單 (階梯狀縮排) -->
              <ul
                v-if="company.schoolsOpen"
                class="school-menu"
                style="
                  padding-left: 15px;
                  margin-left: 20px;
                  border-left: 1px dashed #cbd5e1;
                  margin-top: 5px;
                  margin-bottom: 5px;
                "
              >
                <li v-if="company.schoolsLoading" style="padding: 5px; color: #888; font-size: 0.85em; list-style: none">
                  Loading schools...
                </li>
                <li
                  v-else-if="company.schools && company.schools.length === 0"
                  style="padding: 5px; color: #888; font-size: 0.85em; list-style: none"
                >
                  無學校資料
                </li>
                <li
                  v-for="school in company.schools"
                  :key="school.cid"
                  style="list-style: none; padding: 5px 0"
                >
                  <a
                    href="#"
                    style="font-size: 0.9em; color: #4b5563"
                    @click.prevent="onSchoolClick(company, school)"
                    >🏫 {{ school.name }}</a
                  >
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <!-- add company (經銷商 Tier 3 無權新增，隱藏) -->
    <!-- 全站 UI 改版：改為 Secondary 按鈕層級 (主色外框+文字)，hover 換色交給 CSS -->
    <button
      v-if="userTier !== '3'"
      id="add-company-btn"
      class="add-company-btn"
      @click.prevent="emitter.emit('org-add-modal:show')"
    >
      <img
        src="/assets/images/Group 606.svg"
        alt="#"
        class="add-company-icon"
        style="width: 20px; height: 20px"
      />
      <p class="add-company-text">{{ t('sidebarnav.add_new_organization') }}</p>
    </button>

    <!-- Toggle Button -->
    <div class="toggle-btn" @click.stop="toggleExpanded">
      <img
        id="toggleIcon"
        src="/assets/images/Vector.svg"
        alt="#"
        :style="{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }"
      />
    </div>
  </aside>
</template>

<script setup>
// 邏輯抽離至 AppSidebar.js，此處僅保留模板繫結
import { useAppSidebar } from './AppSidebar.js'

const {
  route,
  userTier,
  searchQuery,
  expanded,
  key_group_bar_list_info,
  countries,
  currentProduct,
  toggleExpanded,
  parseCompanies,
  loadCountry,
  toggleCountry,
  visibleCompanies,
  hasSearchHit,
  onCompanyClick,
  loadSchools,
  onSchoolClick,
  t,
  emitter,
} = useAppSidebar()
</script>

<style src="./AppSidebar.css"></style>
