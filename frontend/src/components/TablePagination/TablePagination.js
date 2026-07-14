// 分頁元件 (原 scripts/lib/lib.html.tablepage.js 的 tablepage_d 視覺與行為：10 頁一組、黑底選中)
import { computed, ref, watch } from 'vue'
import { currentLang, tf } from '@/locales'

// 原 TablePagination.vue <script setup> 的邏輯 (props/emit 為編譯器巨集，由 SFC 宣告後傳入)
export function useTablePagination(props, emit) {
  const SECTOR_COUNT = 10 // 一次捲動10頁
  const sectorStart = ref(1)

  const isEn = computed(() => String(currentLang.value).includes('en'))
  const totalPages = computed(() => Math.ceil(props.totalRecords / props.rowsPerPage))

  const visiblePages = computed(() => {
    const pages = []
    for (let p = sectorStart.value; p < sectorStart.value + SECTOR_COUNT && p <= totalPages.value; p++) {
      pages.push(p)
    }
    return pages
  })

  const hasNextSector = computed(() => sectorStart.value + SECTOR_COUNT <= totalPages.value)

  const pageInfo = computed(() => {
    const total = tf('common.total_records', { count: props.totalRecords })
    // 原 lib.html.tablepage.js 用 4 個 &nbsp; 分隔，這裡用不斷行空白字元避免 HTML 摺疊空白
    const gap = '    '
    return isEn.value
      ? `Page ${totalPages.value}${gap}${total}`
      : `${totalPages.value}頁${gap}${total}`
  })

  // 資料總數改變 (重新查詢) 時，若當前頁超出範圍回到第一組
  watch(
    () => props.totalRecords,
    () => {
      if (props.currentPage > totalPages.value) sectorStart.value = 1
    },
  )

  function prevSector() {
    sectorStart.value = Math.max(1, sectorStart.value - SECTOR_COUNT)
  }
  function nextSector() {
    if (hasNextSector.value) sectorStart.value += SECTOR_COUNT
  }
  function selectPage(p) {
    if (p !== props.currentPage) emit('change', p)
  }

  return {
    sectorStart,
    isEn,
    totalPages,
    visiblePages,
    hasNextSector,
    pageInfo,
    prevSector,
    nextSector,
    selectPage,
  }
}
