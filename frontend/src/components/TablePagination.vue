<template>
  <table v-if="totalRecords >= 0">
    <tbody>
      <tr>
        <!-- 前10頁 -->
        <td
          v-if="totalRecords > 0 && sectorStart > 1"
          style="cursor: pointer; color: black"
          @click="prevSector"
        >
          &lt;
        </td>
        <td v-else-if="totalRecords > 0" style="color: black"></td>
        <td v-if="totalRecords > 0">&nbsp;</td>

        <td v-if="totalRecords > 0 && !isEn" style="color: black"><b>第</b></td>
        <td v-for="p in visiblePages" :key="p" valign="top">
          <table
            style="width: 20px; cursor: pointer; color: white; border-collapse: collapse; border-style: solid; border-width: 1px; border-color: white"
            :style="{ backgroundColor: p === currentPage ? 'black' : '#CCCCCC' }"
            @click="selectPage(p)"
          >
            <tbody>
              <tr>
                <th>{{ p }}</th>
              </tr>
            </tbody>
          </table>
        </td>
        <td v-if="totalRecords > 0 && !isEn" style="color: black"><b>頁</b></td>
        <td v-if="totalRecords > 0">&nbsp;</td>

        <!-- 下10頁 -->
        <td
          v-if="totalRecords > 0 && hasNextSector"
          style="cursor: pointer; color: black"
          @click="nextSector"
        >
          &gt;
        </td>
        <td v-else-if="totalRecords > 0" style="color: black"></td>
        <td v-if="totalRecords > 0">&nbsp;</td>

        <td style="color: black">{{ pageInfo }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
// 分頁元件 (原 scripts/lib/lib.html.tablepage.js 的 tablepage_d 視覺與行為：10 頁一組、黑底選中)
import { computed, ref, watch } from 'vue'
import { currentLang, tf } from '@/locales'

const props = defineProps({
  totalRecords: { type: Number, required: true },
  rowsPerPage: { type: Number, default: 10 },
  currentPage: { type: Number, default: 1 },
})
const emit = defineEmits(['change'])

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
  return isEn.value
    ? `Page ${totalPages.value}    ${total}`
    : `${totalPages.value}頁    ${total}`
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
</script>
