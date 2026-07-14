<template>
  <nav v-if="totalRecords >= 0" class="pagination">
    <!-- 前10頁 -->
    <button
      v-if="totalRecords > 0"
      type="button"
      class="pagination__btn pagination__arrow"
      :class="{ 'pagination__arrow--disabled': sectorStart <= 1 }"
      :disabled="sectorStart <= 1"
      aria-label="prev pages"
      @click="prevSector"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <span v-if="totalRecords > 0 && !isEn" class="pagination__label">第</span>

    <button
      v-for="p in visiblePages"
      :key="p"
      type="button"
      class="pagination__btn"
      :class="{ 'pagination__btn--active': p === currentPage }"
      @click="selectPage(p)"
    >
      {{ p }}
    </button>

    <span v-if="totalRecords > 0 && !isEn" class="pagination__label">頁</span>

    <!-- 下10頁 -->
    <button
      v-if="totalRecords > 0"
      type="button"
      class="pagination__btn pagination__arrow"
      :class="{ 'pagination__arrow--disabled': !hasNextSector }"
      :disabled="!hasNextSector"
      aria-label="next pages"
      @click="nextSector"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>

    <span class="pagination__info">{{ pageInfo }}</span>
  </nav>
</template>

<script setup>
// 邏輯抽離至 TablePagination.js，此處僅保留 props/emit 宣告 (編譯器巨集) 與模板繫結
import { useTablePagination } from './TablePagination.js'

const props = defineProps({
  totalRecords: { type: Number, required: true },
  rowsPerPage: { type: Number, default: 10 },
  currentPage: { type: Number, default: 1 },
})
const emit = defineEmits(['change'])

const {
  sectorStart,
  isEn,
  visiblePages,
  hasNextSector,
  pageInfo,
  prevSector,
  nextSector,
  selectPage,
} = useTablePagination(props, emit)
</script>

<style src="./TablePagination.css"></style>
