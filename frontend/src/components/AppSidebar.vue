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
    <button
      v-if="userTier !== '3'"
      id="add-company-btn"
      class="add-company-btn"
      @mouseenter="addBtnHover = true"
      @mouseleave="addBtnHover = false"
      :style="addBtnHover ? { backgroundColor: '#ee963f' } : {}"
      @click.prevent="emitter.emit('org-add-modal:show')"
    >
      <img
        :src="addBtnHover ? '/assets/images/information_button_orange.png' : '/assets/images/Group 606.svg'"
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
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { t } from '@/locales'
import { emitter } from '@/core/emitter'
import { changePage } from '@/core/navigation'
import { VisibleLoaderElement } from '@/core/loader'
import { TablesiToTableii } from '@/core/util'
import {
  CsRequestGroupSelectAllRecordsByCondition,
  CsRequestGroupSelectOneRecordByGroupCID,
  CsRequestGroupGetOwnedProducts,
} from '@/api/organization'
import {
  querySchoolsOfCompany,
  fallbackSchoolToCompany,
  selectSchool,
} from '@/services/orgTree'

const route = useRoute()
const userTier = window.sessionStorage.getItem('tier')
const searchQuery = ref('')
const expanded = ref(false)
const addBtnHover = ref(false)

// 列表上面顯示的欄位對照表與順序 (原 key_group_bar_list_info)
const key_group_bar_list_info = ['group_name', 'group_cid']

const countries = ref(
  ['Taiwan', 'China', 'Japan', 'India', 'Thailand'].map((id) => ({
    id,
    show: false,
    loading: false,
    loaded: false,
    error: '',
    companies: [],
  })),
)

function currentProduct() {
  return (
    route.query.product ||
    window.sessionStorage.getItem('product_type') ||
    'avacast'
  )
}

function toggleExpanded() {
  expanded.value = !expanded.value
  const sidebar = document.getElementById('sidebar')
  if (sidebar) sidebar.classList.toggle('expanded', expanded.value)
}

//___________________________________________________________
// 原 renderSidebarMenu: 過濾 (state!=0, 非 sch_)、依名稱排序
function parseCompanies(json_tablesi) {
  if (!json_tablesi || !json_tablesi.group_cid || json_tablesi.group_cid.length === 0)
    return []

  const companyArray = TablesiToTableii(key_group_bar_list_info, json_tablesi)

  let companies = companyArray.map((companyRow, index) => {
    // 解耦顯示名稱 (Name) 與關聯代碼 (CID)；名稱空白時退回顯示代碼
    const orgName = String(companyRow[0] || '').trim()
    const orgCid = String(companyRow[1] || '').trim()
    const displayName = orgName !== '' ? orgName : orgCid

    let recordState = '1'
    if (json_tablesi.record_state && json_tablesi.record_state[index]) {
      recordState = json_tablesi.record_state[index]
    }

    return {
      displayName,
      cid: orgCid,
      state: recordState,
      schoolsOpen: false,
      schoolsLoading: false,
      schools: null,
    }
  })

  // 過濾已刪除、空 CID 及自動生成的學校群組
  companies = companies.filter(
    (c) => c.state !== '0' && c.cid !== '' && !c.cid.startsWith('sch_'),
  )

  // 按照字母排序 (不分大小寫)
  companies.sort((a, b) =>
    a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' }),
  )

  return companies
}

//___________________________________________________________
// 原 ListOrganization: 快取 + tier 3 特例 + 重試
function loadCountry(c, onComplete, retryCount = 0) {
  if (c.loading || c.loaded) {
    if (onComplete) onComplete()
    return
  }
  c.loading = true
  c.error = ''

  // [權限] 經銷商只顯示自己的公司，且需驗證該公司是否屬於當前點擊的國家
  if (userTier === '3') {
    const myGroupCid = window.sessionStorage.getItem('group_cid') || 'Unknown'
    CsRequestGroupSelectOneRecordByGroupCID(myGroupCid, function (ok, result) {
      c.loading = false
      if (ok) {
        try {
          const json = JSON.parse(result)
          const record = json.records
          const myCountry = (record.country && record.country[0]) || ''
          console.log(
            `[Sidebar] Distributor: ${myGroupCid}, DB Country: '${myCountry}', Clicked: '${c.id}'`,
          )
          if (
            String(myCountry).trim().toLowerCase() ===
            String(c.id).trim().toLowerCase()
          ) {
            c.companies = parseCompanies(record)
          } else {
            c.companies = []
          }
          c.loaded = true
        } catch (e) {
          console.error('經銷商資料解析錯誤', e)
          c.error = '資料錯誤'
        }
      } else {
        c.error = '載入失敗'
      }
      if (onComplete) onComplete()
    })
    return
  }

  // 快取機制：檢查 SessionStorage 是否已有資料
  const cacheKey = 'sidebar_cache_' + c.id
  const cachedData = window.sessionStorage.getItem(cacheKey)
  if (cachedData) {
    c.companies = parseCompanies(JSON.parse(cachedData))
    c.loaded = true
    c.loading = false
    if (onComplete) onComplete()
    return
  }

  const condition_type = 3 // by country
  console.log(`[Sidebar] 發送查詢: type=${condition_type}, value='${c.id}'`)

  CsRequestGroupSelectAllRecordsByCondition(
    condition_type,
    c.id,
    0,
    100,
    function (ok, result) {
      c.loading = false
      if (ok) {
        try {
          const json = JSON.parse(result)
          const json_tablesi = json.records
          if (
            !json_tablesi ||
            !json_tablesi.group_cid ||
            json_tablesi.group_cid.length === 0
          ) {
            console.warn(`[Sidebar] 國家 ${c.id} 查無資料`)
            c.companies = []
            // 即使無資料也紀錄快取，避免重複查詢空結果
            window.sessionStorage.setItem(cacheKey, JSON.stringify({ group_cid: [] }))
          } else {
            c.companies = parseCompanies(json_tablesi)
            window.sessionStorage.setItem(cacheKey, JSON.stringify(json_tablesi))
          }
          c.loaded = true
          if (onComplete) onComplete()
        } catch (e) {
          console.error('[Sidebar] 解析 API 回應失敗', e)
          c.error = '資料格式錯誤'
          if (onComplete) onComplete()
        }
      } else {
        // 失敗重試機制 (Retry once)
        if (retryCount < 1) {
          console.log(`[Sidebar] 載入失敗，0.5秒後重試... (Retry: ${retryCount + 1})`)
          setTimeout(() => loadCountry(c, onComplete, retryCount + 1), 500)
        } else {
          c.error = '載入失敗'
          if (onComplete) onComplete()
        }
      }
    },
  )
}

function toggleCountry(c) {
  const isOpen = c.show
  // 一次只展開一個國家 (原邏輯: 收合其他 .show)
  countries.value.forEach((x) => {
    if (x !== c) x.show = false
  })
  if (!isOpen) {
    c.show = true
    window.sessionStorage.setItem('sidebar_expanded_country', c.id)
    if (!c.loaded) loadCountry(c)
  } else {
    c.show = false
    window.sessionStorage.removeItem('sidebar_expanded_country')
  }
}

//___________________________________________________________
// 搜尋過濾 (原 sidebar-search-input 邏輯: 符合的項目顯示並自動展開選單)
function visibleCompanies(c) {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return c.companies
  return c.companies.filter((x) => x.displayName.toLowerCase().includes(query))
}

function hasSearchHit(c) {
  const query = searchQuery.value.toLowerCase().trim()
  return query !== '' && c.loaded && visibleCompanies(c).length > 0
}

//___________________________________________________________
// 點擊公司 (原 renderSidebarMenu 的 a.onclick 完整邏輯)
function onCompanyClick(c, company) {
  if (currentProduct() === 'avaclassroom') {
    console.log(`[Classroom 模式] 點了代理商：${company.displayName} (ID: ${company.cid})`)
    company.schoolsOpen = !company.schoolsOpen
    if (company.schoolsOpen && company.schools === null) {
      loadSchools(company)
    }
    return
  }

  console.log(`你點了公司名稱：${company.displayName} (ID: ${company.cid})`)
  window.sessionStorage.setItem('select_group_cid', company.cid)
  window.sessionStorage.setItem('group_cid', company.cid)
  // 儲存該公司的顯示名稱，確保回退時標題渲染正確
  window.sessionStorage.setItem('company_group_name', company.displayName)
  window.sessionStorage.setItem('select_group_name', company.displayName)

  // [動態 Navbar 重繪] 取得新公司的真實產品權限
  VisibleLoaderElement(true)
  const curProduct = currentProduct()

  CsRequestGroupGetOwnedProducts(company.cid, function (ok, result) {
    VisibleLoaderElement(false)
    if (ok && result) {
      try {
        const resJson = JSON.parse(result)
        if (Number(resJson.errno) >= 0) {
          let rawProds =
            resJson.owned_products ||
            (resJson.records && resJson.records.owned_products)
          // [終極防護] 攤平巢狀陣列
          let prods = Array.isArray(rawProds) ? rawProds.flat(Infinity) : []

          window.sessionStorage.setItem('owned_products', JSON.stringify(prods))

          // 若新公司也擁有目前產品則保持，否則用預設/第一個產品
          let nextProduct =
            resJson.default_product || (prods.length > 0 ? prods[0] : 'avacast')
          if (curProduct && prods.includes(curProduct)) {
            nextProduct = curProduct
          }

          window.sessionStorage.setItem('default_product', nextProduct)
          changePage('dashboard.html', { params: { product: nextProduct } })
          return
        }
      } catch (e) {
        console.error('Parse error:', e)
      }
    }
    // [防呆] API 錯誤時強制給予保底產品，避免 Navbar 全滅
    console.warn('[Sidebar] GetOwnedProducts API failed, using fallback.')
    window.sessionStorage.setItem('owned_products', JSON.stringify(['avacast']))
    window.sessionStorage.setItem('default_product', 'avacast')
    changePage('dashboard.html', { params: { product: 'avacast' } })
  })
}

// 原 loadSchoolMenu
async function loadSchools(company) {
  company.schoolsLoading = true
  try {
    const schools = await querySchoolsOfCompany(company.cid)
    company.schools = schools

    // [優化] Classroom 模式下若當前選中群組仍為公司 ID，自動選取第一所學校
    const currentGroup =
      window.sessionStorage.getItem('group_cid') ||
      window.sessionStorage.getItem('select_group_cid') ||
      ''
    if (
      currentProduct() === 'avaclassroom' &&
      currentGroup === company.cid &&
      schools.length > 0
    ) {
      const firstSchool = schools[0]
      console.log(
        `[Sidebar] 自動為公司 ${company.cid} 選取旗下第一所學校: ${firstSchool.name} (${firstSchool.cid})`,
      )
      selectSchool(firstSchool, company.cid)
      changePage('dashboard.html', { params: { product: 'avaclassroom' } })
    }
  } catch (err) {
    console.error('loadSchoolMenu error:', err)
    company.schools = []
  } finally {
    company.schoolsLoading = false
  }
}

// 原 sidebar 學校點擊
function onSchoolClick(company, school) {
  console.log(`點擊了學校：${school.name} (ID: ${school.cid})`)
  selectSchool(school, company.cid)
  changePage('dashboard.html', { params: { product: 'avaclassroom' } })
}

//___________________________________________________________
onMounted(() => {
  // [防呆] 非 avaclassroom 產品但 group 是學校 → 回退公司 (原 initAllSidebarLogic)
  if (currentProduct() !== 'avaclassroom') {
    fallbackSchoolToCompany()
  } else {
    // Classroom 模式下若選中的是公司，自動選取旗下第一所學校
    const currentGroup =
      window.sessionStorage.getItem('group_cid') ||
      window.sessionStorage.getItem('select_group_cid') ||
      ''
    if (currentGroup && !currentGroup.startsWith('sch_')) {
      import('@/services/orgTree').then(({ fetchFirstSchoolOfCompanyDirect }) => {
        fetchFirstSchoolOfCompanyDirect(currentGroup, (firstSchool) => {
          if (firstSchool) {
            console.log(
              `[Sidebar] 背景自動查詢成功，為公司 ${currentGroup} 選取第一所學校: ${firstSchool.name} (${firstSchool.cid})`,
            )
            selectSchool(firstSchool, currentGroup)
            changePage('dashboard.html', { params: { product: 'avaclassroom' } })
          } else {
            console.warn(`[Sidebar] 背景自動查詢：公司 ${currentGroup} 下無 any 學校`)
          }
        })
      })
    }
  }

  // 狀態持久化：還原上次展開的國家選單並秒渲染快取 (管理員適用)
  if (userTier !== '3') {
    const expandedCountry = window.sessionStorage.getItem('sidebar_expanded_country')
    if (expandedCountry) {
      const c = countries.value.find((x) => x.id === expandedCountry)
      if (c) {
        c.show = true
        loadCountry(c)
      }
    }
  }

  // 背景排隊載入所有國家 (原邏輯: 2 秒後、並發數 1)
  setTimeout(() => {
    if (userTier === '3') return

    const queue = countries.value.filter((c) => !c.loaded && !c.loading)
    function processNext() {
      const c = queue.shift()
      if (!c) return
      if (c.loaded || c.loading) {
        processNext()
        return
      }
      loadCountry(c, () => setTimeout(processNext, 200))
    }
    processNext()
  }, 2000)
})
</script>

<style>
/* 原 sidebar-custom-style 注入樣式 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.li-list-item {
  opacity: 0;
  animation: fadeInUp 0.3s ease-out forwards;
}
#toggleIcon {
  filter: brightness(0.6);
}
</style>
