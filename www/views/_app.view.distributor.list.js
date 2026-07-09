// i18n
(function () {
  const lang = window.localStorage.getItem("language") || "zh-tw";
  renderTemplate(lang, "app");
})();

/* 列表欄位與每頁筆數 */
let key_license_list_info = [
  "create_time",
  "license_begin_time",
  "license_days",
  "license_count",
  "note00",
];
const def_rows_per_page = 10;

/* 全域變數 - 資料快取 */
window._allLicenseRecordsCache = null;
let currentLicenseFilter = "all"; // [新增] 記錄目前的篩選狀態

// 【新增】對 tablesi 格式資料進行排序
function sortTablesiData(tablesi, field, order) {
  if (!tablesi || !tablesi.license_cid || tablesi.license_cid.length === 0)
    return tablesi;

  const len = tablesi.license_cid.length;
  // 建立索引陣列 [0, 1, 2, ...]
  const indices = new Array(len);
  for (let i = 0; i < len; i++) indices[i] = i;

  // 根據指定欄位對索引進行排序
  indices.sort((a, b) => {
    let valA, valB;

    // 特殊欄位處理：到期時間 (需動態計算：開始時間 + 天數)
    if (field === "license_end_time") {
      const beginA = new Date(tablesi.license_begin_time[a]);
      const daysA = parseInt(tablesi.license_days[a]) || 0;
      valA = new Date(beginA);
      valA.setDate(valA.getDate() + daysA);

      const beginB = new Date(tablesi.license_begin_time[b]);
      const daysB = parseInt(tablesi.license_days[b]) || 0;
      valB = new Date(beginB);
      valB.setDate(valB.getDate() + daysB);
    } else {
      valA = tablesi[field] ? tablesi[field][a] : "";
      valB = tablesi[field] ? tablesi[field][b] : "";
    }

    // 比較邏輯
    if (field.includes("time") || field === "license_end_time") {
      const dateA = valA ? new Date(valA).getTime() : 0;
      const dateB = valB ? new Date(valB).getTime() : 0;
      return order === "asc" ? dateA - dateB : dateB - dateA;
    } else if (field === "license_count") {
      const numA = parseInt(valA) || 0;
      const numB = parseInt(valB) || 0;
      return order === "asc" ? numA - numB : numB - numA;
    } else {
      // 字串比較
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
      if (valA < valB) return order === "asc" ? -1 : 1;
      if (valA > valB) return order === "asc" ? 1 : -1;
      return 0;
    }
  });

  // 根據排序後的索引重建 tablesi
  const sorted = {};
  Object.keys(tablesi).forEach((key) => {
    if (Array.isArray(tablesi[key])) {
      sorted[key] = indices.map((i) => tablesi[key][i]);
    } else {
      sorted[key] = tablesi[key];
    }
  });
  return sorted;
}

// 【新增】更新列表與分頁 (核心邏輯：篩選 -> 排序 -> 分頁)
function updateLicenseList() {
  let allRecords = window._allLicenseRecordsCache;
  if (!allRecords) return;

  // 1. 取得 UI 上的日期篩選條件
  const b_time_el = document.getElementById("license_list-begin_time");
  const e_time_el = document.getElementById("license_list-end_time");
  let target_b_date = b_time_el ? b_time_el.value : "1900-01-01";
  let target_e_date = e_time_el ? e_time_el.value : "2999-12-31";
  target_b_date = target_b_date.replace(/\//g, "-");
  target_e_date = target_e_date.replace(/\//g, "-");

  // 2. 執行日期篩選
  let filtered_tablesi = filterRecordsByDateRange(
    allRecords,
    target_b_date,
    target_e_date,
  );

  // 3. 執行狀態篩選 (整合原本 filterLicenseByStatus 的邏輯)
  if (currentLicenseFilter !== "all") {
    filtered_tablesi = filterRecordsByStatus(
      filtered_tablesi,
      currentLicenseFilter,
    );
  }

  // 4. 執行排序
  if (currentSortField) {
    filtered_tablesi = sortTablesiData(
      filtered_tablesi,
      currentSortField,
      currentSortOrder,
    );
  }

  // 5. 更新 UI 與分頁
  const filteredCount = filtered_tablesi.license_cid
    ? filtered_tablesi.license_cid.length
    : 0;
  let license_table_page = document.getElementById(
    "license_list-list_pagination",
  );
  if (license_table_page) {
    tablepage_d(
      license_table_page,
      def_rows_per_page,
      filteredCount,
      function (now_index, count_of_page) {
        const page_records = sliceTablesi(
          filtered_tablesi,
          now_index,
          count_of_page,
        );
        renderTable(page_records);
      },
    );
  }

  // 更新統計數字 (根據目前的篩選結果)
  updateTotalCountDisplay(filtered_tablesi);
}

async function LicenseSelectAll() {
  console.log("啟動 LicenseSelectAll (前端過濾模式 - 安全版)");

  // 1. 基本搜尋條件
  let condition_type =
    _k_search_condition_type_by_agent_cid__and__owner_cid__and__record_state__and__product_type;

  // 組合 condition_value
  // [修正] Tier 3 distributor list 需使用 %% 來查詢底下所有 agent
  let group_cid =
    window.sessionStorage.getItem("select_group_cid") ||
    window.sessionStorage.getItem("group_cid") ||
    "";
  let product_type = window.sessionStorage.getItem("product_type") || "";
  let agent_filter = "%%";
  let condition_value =
    agent_filter + ";" + group_cid.trim() + ";" + "1" + ";" + product_type;

  // 2. 取得 UI 上的日期 (這是使用者真正想看的範圍)
  const b_time_el = document.getElementById("license_list-begin_time");
  const e_time_el = document.getElementById("license_list-end_time");

  // 使用者選的日期 (例如 2025-02-01 ~ 2025-03-01)
  let target_b_date = b_time_el ? b_time_el.value : "1900-01-01";
  let target_e_date = e_time_el ? e_time_el.value : "2999-12-31";

  // 強制轉橫線格式，方便後續比對
  target_b_date = target_b_date.replace(/\//g, "-");
  target_e_date = target_e_date.replace(/\//g, "-");

  console.log(`[前端篩選目標] ${target_b_date} ~ ${target_e_date}`);

  // 3. 設定 API 實際發送的範圍 (騙過後端)
  // 故意抓取超大範圍 (2000~2099)，繞過後端對跨年與 create_time 的限制
  let api_b_time = "2000-01-01 00:00:00";
  let api_e_time = "2099-12-31 23:59:59";

  VisibleLoaderElement(true);

  try {
    // 【優化】一次性獲取所有記錄，使用 apiCall 進行重試與錯誤處理
    const json_object = await apiCall(
      CsRequestLicenseSelectAllRecords,
      condition_type,
      condition_value,
      api_b_time, // 使用 2000年
      api_e_time, // 使用 2099年
      0, // offset 0
      9999, // limit 9999 (抓全部)
    );

    // allRecords 包含了 2000-2099 的所有記錄
    const allRecords = json_object.records;

    // 【優化】將所有資料快取起來
    window._allLicenseRecordsCache = allRecords;

    // 如果沒有任何歷史記錄，則清空頁面並返回
    if (
      !allRecords ||
      !allRecords.license_count ||
      allRecords.license_count.length === 0
    ) {
      document.getElementById("license-total-count").innerText = "0";
      document.getElementById("license-quarterly-count").innerText = "0";
      document.getElementById("license-total-growth-rate").style.display =
        "none";
      document.getElementById(
        "license-quarterly-growth-percentage",
      ).textContent = "0%";
      document.getElementById("license-quarterly-growth-icon").src =
        "assets/images/up.svg";
      var element_table = document.getElementById(
        "license_list-list_information",
      );
      let tbody = element_table.querySelector("tbody");
      if (tbody) tbody.innerHTML = "";
      let license_table_page = document.getElementById(
        "license_list-list_pagination",
      );
      const zeroMsg = (
        window.localeData.common.total_records || "共 {{count}} 筆"
      ).replace("{{count}}", 0);
      if (license_table_page) license_table_page.textContent = zeroMsg;
      return;
    }

    // 【優化】從 allRecords 計算總授權數量 (累計) 與有效授權成長率 (YoY)
    {
      const today = new Date();
      const lastYearSameDate = new Date();
      lastYearSameDate.setFullYear(today.getFullYear() - 1);

      let cumulative_total_today = 0;
      let active_total_today = 0;
      let active_total_last_year = 0;

      for (let i = 0; i < allRecords.license_count.length; i++) {
        if (allRecords.record_state[i] == "1") {
          const licenseCount = parseInt(allRecords.license_count[i]) || 0;

          // 1. 計算累計總數 (不過期)
          cumulative_total_today += licenseCount;

          // 2. 為了計算 YoY 百分比，計算有效總數
          const beginTime = new Date(allRecords.license_begin_time[i]);
          const licenseDays = parseInt(allRecords.license_days[i]) || 0;
          let endTime = new Date(beginTime);
          endTime.setDate(endTime.getDate() + licenseDays);

          // 檢查今天是否有效
          if (beginTime <= today && endTime >= today) {
            active_total_today += licenseCount;
          }

          // 檢查去年同一天是否有效
          if (beginTime <= lastYearSameDate && endTime >= lastYearSameDate) {
            active_total_last_year += licenseCount;
          }
        }
      }

      // --- 顯示累計總數 (例如 8,000) ---
      const totalCountEl = document.getElementById("license-total-count");
      if (totalCountEl)
        totalCountEl.innerText = cumulative_total_today.toLocaleString();

      // --- 根據"有效"授權計算並顯示成長率 (例如 -40%) ---
      const growthContainer = document.getElementById(
        "license-total-growth-rate",
      );
      const growthPercentageElement = document.getElementById(
        "license-total-growth-percentage",
      );
      const growthIconElement = document.getElementById(
        "license-total-growth-icon",
      );

      if (active_total_last_year === 0) {
        if (growthContainer) growthContainer.style.display = "none"; // 去年沒資料，不顯示
      } else {
        const growthRate =
          ((active_total_today - active_total_last_year) /
            active_total_last_year) *
          100;
        const growthRateFormatted = Math.abs(growthRate).toFixed(1);

        if (growthPercentageElement) {
          if (growthRate >= 0) {
            growthPercentageElement.textContent = `+${growthRateFormatted}%`;
            growthPercentageElement.style.color = "#1c1c1c";
          } else {
            growthPercentageElement.textContent = `-${growthRateFormatted}%`;
            growthPercentageElement.style.color = "#1c1c1c";
          }
        }
        if (growthIconElement) {
          growthIconElement.src =
            growthRate >= 0 ? "assets/images/up.svg" : "assets/images/down.svg";
        }
        if (growthContainer) {
          growthContainer.style.display = "flex";
        }
      }
    }

    // 【優化】從 allRecords 計算本季與上季新增數量，用於 QoQ
    let quarterlyLicenseCount = 0;
    let lastQuarterCount = 0;
    {
      const currentDate = new Date();
      const currentQuarterStart = getQuarterStartDate(currentDate);
      const lastQuarterEnd = new Date(currentQuarterStart);
      lastQuarterEnd.setDate(lastQuarterEnd.getDate() - 1);
      const lastQuarterStart = getQuarterStartDate(lastQuarterEnd);

      if (allRecords.license_count && allRecords.create_time) {
        for (let i = 0; i < allRecords.license_count.length; i++) {
          if (allRecords.record_state[i] == "1") {
            const createTime = new Date(allRecords.create_time[i]);
            const count = parseInt(allRecords.license_count[i]) || 0;

            // 計算本季新增
            if (
              createTime >= currentQuarterStart &&
              createTime <= currentDate
            ) {
              quarterlyLicenseCount += count;
            }
            // 計算上季新增
            if (
              createTime >= lastQuarterStart &&
              createTime <= lastQuarterEnd
            ) {
              lastQuarterCount += count;
            }
          }
        }
      }
      const quarterlyCountEl = document.getElementById(
        "license-quarterly-count",
      );
      if (quarterlyCountEl)
        quarterlyCountEl.innerText = quarterlyLicenseCount.toLocaleString();

      // --- 根據"新增"授權計算並顯示 QoQ 成長率 ---
      const quarterlyGrowthPercentageEl = document.getElementById(
        "license-quarterly-growth-percentage",
      );
      const quarterlyGrowthIconEl = document.getElementById(
        "license-quarterly-growth-icon",
      );

      if (quarterlyGrowthPercentageEl && quarterlyGrowthIconEl) {
        if (lastQuarterCount === 0) {
          quarterlyGrowthPercentageEl.textContent =
            quarterlyLicenseCount > 0 ? "+∞%" : "0%";
          quarterlyGrowthIconEl.src = "assets/images/up.svg";
        } else {
          const growthRate =
            ((quarterlyLicenseCount - lastQuarterCount) / lastQuarterCount) *
            100;
          const growthRateFormatted = Math.abs(growthRate).toFixed(1);

          if (growthRate >= 0) {
            quarterlyGrowthPercentageEl.textContent = `+${growthRateFormatted}%`;
            quarterlyGrowthIconEl.src = "assets/images/up.svg";
          } else {
            quarterlyGrowthPercentageEl.textContent = `-${growthRateFormatted}%`;
            quarterlyGrowthIconEl.src = "assets/images/down.svg";
          }
        }
      }
    }

    // 呼叫更新函式來處理過濾、排序與渲染
    updateLicenseList();
  } catch (e) {
    if (e.message !== "Handled Server Error") {
      console.error(e);
      alert("request error");
    }
  } finally {
    VisibleLoaderElement(false);
  }
}

// 【新增】輔助函數：對 records 物件進行切片
function sliceTablesi(tablesi, offset, limit) {
  const sliced_tablesi = {};
  const keys = Object.keys(tablesi);
  const total = tablesi[keys[0]] ? tablesi[keys[0]].length : 0;

  // [修正] 強制轉型為數字，避免字串串接導致計算錯誤
  offset = Number(offset);
  limit = Number(limit);

  const end = Math.min(offset + limit, total);

  keys.forEach((key) => {
    if (Array.isArray(tablesi[key])) {
      sliced_tablesi[key] = tablesi[key].slice(offset, end);
    }
  });
  return sliced_tablesi;
}

// 【新增】輔助函數：渲染表格 (從原 `CsRequestLicenseSelectAllRecords` 回呼中提取)
function renderTable(json_tablesi) {
  var element_table = document.getElementById("license_list-list_information");
  if (!element_table) return;

  let tbody = element_table.querySelector("tbody");
  if (!tbody) {
    tbody = document.createElement("tbody");
    element_table.appendChild(tbody);
  }

  // 清空現有內容
  tbody.innerHTML = "";

  if (
    !json_tablesi ||
    !json_tablesi.license_cid ||
    json_tablesi.license_cid.length === 0
  ) {
    return;
  }

  const fragment = document.createDocumentFragment();
  const count = json_tablesi.license_cid.length;

  for (let i = 0; i < count; i++) {
    const row = document.createElement("tr");

    let record_state = json_tablesi.record_state
      ? json_tablesi.record_state[i]
      : "1";
    let disabled_color = "#d6d6d6ff";
    if (record_state === "0") {
      row.style.backgroundColor = disabled_color;
    }

    const license_cid = json_tablesi.license_cid[i];

    // 資料準備
    const create_time = json_tablesi.create_time
      ? json_tablesi.create_time[i]
      : "";
    const license_begin_time = json_tablesi.license_begin_time
      ? json_tablesi.license_begin_time[i]
      : "";
    const license_days_str = json_tablesi.license_days
      ? json_tablesi.license_days[i]
      : "0";
    const license_days = parseInt(license_days_str, 10);
    const license_count = json_tablesi.license_count
      ? json_tablesi.license_count[i]
      : "0";
    const note00 = json_tablesi.note00 ? json_tablesi.note00[i] : "";

    // 計算到期日
    const begin_time_obj = new Date(license_begin_time);
    let end_day_obj = DateAdd("d", license_days, begin_time_obj);
    if (license_days != 0) {
      end_day_obj = SetToEndOfDay(end_day_obj);
    }
    const expire_date_str = FormatDateTime(end_day_obj);
    const is_active = IsAfterToday(end_day_obj);

    // 1. Checkbox
    const cellCheckbox = document.createElement("td");
    cellCheckbox.innerHTML = `<input type="checkbox" class="license-row-checkbox" data-license-cid="${HtmlUtil.escape(license_cid)}">`;
    row.appendChild(cellCheckbox);

    // 2. Create Time
    const cellCreateTime = document.createElement("td");
    cellCreateTime.textContent = create_time;
    row.appendChild(cellCreateTime);

    // 3. Begin Time
    const cellBeginTime = document.createElement("td");
    cellBeginTime.textContent = license_begin_time;
    row.appendChild(cellBeginTime);

    // 4. License Days
    const cellDays = document.createElement("td");
    cellDays.textContent = license_days_str;
    row.appendChild(cellDays);

    // 5. Expire Date
    const cellExpire = document.createElement("td");
    cellExpire.textContent = expire_date_str;
    row.appendChild(cellExpire);

    // 6. Status
    const cellStatus = document.createElement("td");
    if (is_active) {
      cellStatus.innerHTML = window.localeData.license.active;
    } else {
      cellStatus.innerHTML = `<span style='color:#404040'>${window.localeData.license.expired}</span>`;
      if (record_state !== "0") {
        row.style.backgroundColor = "#D9DDE3";
      }
    }
    row.appendChild(cellStatus);

    // 7. License Count
    const cellCount = document.createElement("td");
    cellCount.textContent = license_count;
    row.appendChild(cellCount);

    // 8. Note
    const cellNote = document.createElement("td");
    cellNote.innerHTML = `<img src="assets/images/Memo.svg" alt="Memo">`;
    cellNote.title = note00;
    row.appendChild(cellNote);

    // 9. Dashboard
    const cellDashboard = document.createElement("td");
    const dashboardUrl = `distributor_list_dashboard.html?license_cid=${encodeURIComponent(license_cid)}&begin_time=${encodeURIComponent(license_begin_time)}&end_time=${encodeURIComponent(expire_date_str)}&license_count=${encodeURIComponent(license_count)}`;
    cellDashboard.innerHTML = `<a href="${dashboardUrl}"><img src="assets/images/dashboard.svg" alt="Dashboard" /></a>`;
    row.appendChild(cellDashboard);

    fragment.appendChild(row);
  }

  tbody.appendChild(fragment);

  // 更新分頁資訊
  setTimeout(
    () =>
      updatePaginationInfo(
        json_tablesi.license_cid ? json_tablesi.license_cid.length : 0,
      ),
    0,
  );
}

// Helper function: 取得季度起始日期
function getQuarterStartDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const quarter = Math.floor(month / 3);
  return new Date(year, quarter * 3, 1);
}

// 更新分頁資訊顯示
function updatePaginationInfo(visibleCount) {
  const paginationContainer = document.getElementById(
    "license_list-list_pagination",
  );
  if (paginationContainer) {
    const tds = paginationContainer.querySelectorAll("td");
    let infoTd = null;

    // 1. 精確查找：尋找包含 "共" 或 "Total" 的資訊儲存格
    for (const td of tds) {
      const text = td.innerText || td.textContent;
      if (text.includes("共") || text.includes("Total")) {
        infoTd = td;
        break;
      }
    }

    // 2. 模糊查找：如果找不到，嘗試找包含 "頁" 或 "Page" 但不包含 "第" (排除頁碼按鈕) 的儲存格
    if (!infoTd) {
      for (const td of tds) {
        const text = td.innerText || td.textContent;
        // 排除 "第 1 頁" 這種格式，只找 "1頁" 或 "Page 1"
        if (
          (text.includes("頁") || text.includes("Page")) &&
          !text.includes("第")
        ) {
          infoTd = td;
          break;
        }
      }
    }

    if (infoTd) {
      const originalText = infoTd.textContent || infoTd.innerText;
      const pageMatch =
        originalText.match(/(\d+)\s*頁/) || originalText.match(/Page\s*(\d+)/);
      const totalStr = (
        window.localeData.common.total_records || "共 {{count}} 筆"
      ).replace("{{count}}", visibleCount);
      const pageLabel = window.localeData.common.page || "頁";
      const lang = window.localStorage.getItem("language");

      if (pageMatch) {
        const pageNumber = pageMatch[1];
        if (lang && lang.includes("en")) {
          infoTd.innerHTML = `&nbsp;&nbsp;${HtmlUtil.escape(pageLabel)} ${HtmlUtil.escape(pageNumber)}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${HtmlUtil.escape(totalStr)}`;
        } else {
          infoTd.textContent = `${pageNumber}${pageLabel}    ${totalStr}`;
        }
      } else {
        infoTd.textContent = totalStr;
      }
    }

    // 額外處理：如果是英文模式，嘗試移除其他儲存格(頁碼)中的中文 "第" 和 "頁"
    const lang = window.localStorage.getItem("language");
    if (lang && lang.includes("en")) {
      for (const td of tds) {
        if (td === infoTd) continue;
        const replaceTextInNode = (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            if (
              node.nodeValue &&
              (node.nodeValue.includes("第") || node.nodeValue.includes("頁"))
            ) {
              node.nodeValue = node.nodeValue
                .replace(/第/g, "")
                .replace(/頁/g, "");
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            Array.from(node.childNodes).forEach(replaceTextInNode);
          }
        };
        replaceTextInNode(td);
      }
    }
  }
}

// 【新增】輔助函數：前端日期過濾邏輯 (從原 `CsRequestLicenseSelectAllRecords` 回呼中提取)
function filterRecordsByDateRange(allRecords, target_b_date, target_e_date) {
  if (!allRecords || !allRecords["license_begin_time"]) {
    return allRecords;
  }

  let validIndices = [];
  let startDates = allRecords["license_begin_time"];
  let daysList = allRecords["license_days"];

  for (let i = 0; i < startDates.length; i++) {
    let s_str = startDates[i];
    if (s_str) {
      let orderStartDate = s_str.substring(0, 10);
      let orderEndDate = orderStartDate;

      if (daysList && daysList[i]) {
        let days = parseInt(daysList[i]);
        if (!isNaN(days) && days > 0) {
          let startDateObj = new Date(s_str.replace(/-/g, "/"));
          startDateObj.setDate(startDateObj.getDate() + days);
          let year = startDateObj.getFullYear();
          let month = ("0" + (startDateObj.getMonth() + 1)).slice(-2);
          let day = ("0" + startDateObj.getDate()).slice(-2);
          orderEndDate = `${year}-${month}-${day}`;
        }
      }

      if (orderStartDate <= target_e_date && orderEndDate >= target_b_date) {
        validIndices.push(i);
      }
    }
  }

  let filtered_tablesi = {};
  let keys = Object.keys(allRecords);
  keys.forEach((key) => {
    filtered_tablesi[key] = [];
    let originalArray = allRecords[key];
    if (Array.isArray(originalArray)) {
      validIndices.forEach((idx) => {
        filtered_tablesi[key].push(originalArray[idx]);
      });
    }
  });
  return filtered_tablesi;
}

// 【新增】輔助函數：狀態過濾邏輯
function filterRecordsByStatus(records, status) {
  if (status === "all") return records;

  const validIndices = [];
  const beginTimes = records.license_begin_time || [];
  const daysList = records.license_days || [];

  for (let i = 0; i < beginTimes.length; i++) {
    const begin_time = new Date(beginTimes[i]);
    const license_days = parseInt(daysList[i], 10) || 0;
    let end_day = DateAdd("d", license_days, begin_time);
    if (license_days !== 0) end_day = SetToEndOfDay(end_day);

    const isExpired = !IsAfterToday(end_day);

    if (status === "active" && !isExpired) validIndices.push(i);
    else if (status === "expired" && isExpired) validIndices.push(i);
  }

  const filtered = {};
  Object.keys(records).forEach((key) => {
    if (Array.isArray(records[key]))
      filtered[key] = validIndices.map((i) => records[key][i]);
  });
  return filtered;
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Distributor List Page Loaded");

  // [優化] 優先從 URL 讀取 product 參數並更新 SessionStorage
  const urlParams = new URLSearchParams(window.location.search);
  const urlProduct = urlParams.get("product");
  if (urlProduct) {
    window.sessionStorage.setItem("product_type", urlProduct);
  }

  showTemplate("app");

  // [新增] 移除靜態 Loading 遮罩
  const loader = document.getElementById("initial-loader");
  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => loader.remove(), 300); // 淡出效果
  }

  let group_cid = window.sessionStorage.getItem("group_cid");
  if (!IsValidString(group_cid)) {
    alert(window.localeData.warring.no_group_cid);
    change_page("distributor_dashboard.html");
    return;
  }

  const beginTimeEl = document.getElementById("license_list-begin_time");
  const endTimeEl = document.getElementById("license_list-end_time");
  const dateSearchButton = document.getElementById(
    "license_list-button-date_search",
  );

  // 檢查 sessionStorage 中是否有儲存的日期
  const savedBeginTime = sessionStorage.getItem("dashboard_begin_time");
  const savedEndTime = sessionStorage.getItem("dashboard_end_time");

  if (savedBeginTime && savedEndTime) {
    // 如果有儲存的日期，則使用
    if (beginTimeEl) beginTimeEl.value = savedBeginTime;
    if (endTimeEl) endTimeEl.value = savedEndTime;
    console.log(
      "distributor_list.html: 從 sessionStorage 載入日期:",
      savedBeginTime,
      "~",
      savedEndTime,
    );
  } else {
    // 否則，使用預設日期
    const BDate = DateAdd("m", -3, new Date());
    const EDate = new Date();
    if (beginTimeEl) beginTimeEl.value = BDate.toLocaleDateString("sv-SE");
    if (endTimeEl) endTimeEl.value = EDate.toLocaleDateString("sv-SE");
  }

  // 按下日期搜尋按鈕才查詢
  if (dateSearchButton) {
    dateSearchButton.addEventListener("click", function () {
      console.log("日期搜尋按鈕點擊");
      // 將當前選擇的日期儲存到 sessionStorage
      if (beginTimeEl && endTimeEl) {
        sessionStorage.setItem("dashboard_begin_time", beginTimeEl.value);
        sessionStorage.setItem("dashboard_end_time", endTimeEl.value);
      }
      LicenseSelectAll();
    });
  }

  // 綁定全選功能
  const selectAllCheckbox = document.getElementById("license-select-all");
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", function () {
      const rowCheckboxes = document.querySelectorAll(".license-row-checkbox");
      rowCheckboxes.forEach((checkbox) => {
        checkbox.checked = selectAllCheckbox.checked;
      });
    });
  }

  // 授權狀態下拉選單事件
  const statusButton = document.getElementById("license-status-button");
  const statusOptions = document.getElementById("license-status-options");

  if (statusButton && statusOptions) {
    // 點擊按鈕顯示/隱藏下拉選單
    statusButton.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = statusOptions.style.display === "block";
      statusOptions.style.display = isVisible ? "none" : "block";
    });

    // 點擊選項
    const options = statusOptions.querySelectorAll(".license-status-option");
    options.forEach((option) => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        const value = option.getAttribute("data-value");
        filterLicenseByStatus(value);
        statusOptions.style.display = "none";
      });
    });

    // 點擊其他地方關閉下拉選單
    document.addEventListener("click", () => {
      statusOptions.style.display = "none";
    });
  }

  // [修正] 頁面載入時，直接執行搜尋邏輯，而不是模擬點擊。
  // 這能確保狀態儲存和資料查詢的行為與手動點擊一致，且更穩定。
  if (dateSearchButton) {
    console.log("distributor_list.html: 頁面載入完成，自動執行搜尋。");
    // 1. 將當前日期儲存到 sessionStorage (模擬點擊按鈕的第一步)
    if (beginTimeEl && endTimeEl) {
      sessionStorage.setItem("dashboard_begin_time", beginTimeEl.value);
      sessionStorage.setItem("dashboard_end_time", endTimeEl.value);
    }
    // 2. 執行查詢
    LicenseSelectAll();
  }

  // [新增] 匯出全部按鈕的圖片切換
  const downloadAllButton = document.getElementById(
    "license-download-all-button",
  );
  const downloadAllIcon = document.getElementById("license-download-all-icon");

  if (downloadAllButton && downloadAllIcon) {
    downloadAllButton.addEventListener("mouseenter", function () {
      downloadAllIcon.src = "assets/images/download_all_white.svg";
    });

    downloadAllButton.addEventListener("mouseleave", function () {
      downloadAllIcon.src = "assets/images/download_all_light_blue.svg";
    });
  }

  // [新增] 新增按鈕的圖片切換
  const insertButton = document.getElementById(
    "license_list-button-gotopage_insert",
  );
  const insertIcon = insertButton?.querySelector("img");
  if (insertButton && insertIcon) {
    insertButton.addEventListener("mouseenter", function () {
      insertIcon.src = "assets/images/information_button_orange.png";
    });
    insertButton.addEventListener("mouseleave", function () {
      insertIcon.src = "assets/images/Group 607.svg";
    });
  }

  // [新增] 編輯按鈕的圖片切換
  const editButton = document.getElementById("license-edit-button");
  const editIcon = editButton?.querySelector("img");
  if (editButton && editIcon) {
    editButton.addEventListener("mouseenter", function () {
      editIcon.src = "assets/images/edit_button_change.png";
    });
    editButton.addEventListener("mouseleave", function () {
      editIcon.src = "assets/images/edit.svg";
    });
  }

  // [新增] 下載按鈕的圖片切換
  const downloadButton = document.getElementById("license-download-button");
  const downloadIcon = downloadButton?.querySelector("img");
  if (downloadButton && downloadIcon) {
    downloadButton.addEventListener("mouseenter", function () {
      downloadIcon.src = "assets/images/dowload_button_change.png";
    });
    downloadButton.addEventListener("mouseleave", function () {
      downloadIcon.src = "assets/images/download.svg";
    });
  }

  // [新增] 綁定點擊事件 (Script Externalization)
  document
    .getElementById("license-download-button")
    ?.addEventListener("click", downloadSelectedAttachments);
  document
    .getElementById("license-download-all-button")
    ?.addEventListener("click", downloadAllLicenses);
  document
    .getElementById("license-edit-button")
    ?.addEventListener("click", editSelectedRecord);
  document
    .getElementById("license-delete-button")
    ?.addEventListener("click", closeSelectedRecords);
});

// 排序狀態管理
let currentSortField = "";
let currentSortOrder = "asc"; // 'asc' 或 'desc'

// 排序表格函數
function sortLicenseTable(field) {
  // 切換排序順序
  if (currentSortField === field) {
    currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
  } else {
    currentSortField = field;
    currentSortOrder = "asc";
  }

  // 更新排序圖標
  updateSortIcons(field, currentSortOrder);

  // 對資料進行排序並重新渲染
  updateLicenseList();
}

// 更新排序圖標
function updateSortIcons(activeField, order) {
  // 重置所有圖標
  const sortIcons = [
    "create_time",
    "license_begin_time",
    "license_end_time",
    "license_count",
  ];

  sortIcons.forEach((field) => {
    const icon = document.getElementById(`sort-${field}`);
    if (icon) {
      if (field === activeField) {
        // 設置當前排序欄位的圖標
        icon.style.transform =
          order === "asc" ? "rotate(0deg)" : "rotate(180deg)";
        icon.style.opacity = "1";
      } else {
        // 重置其他欄位的圖標
        icon.style.transform = "rotate(0deg)";
        icon.style.opacity = "0.5";
      }
    }
  });
}

// 生成訂單資料的 Excel 檔案
function generateOrdersExcel(ordersList) {
  console.log("[generateOrdersExcel] 開始生成 Excel，筆數:", ordersList.length);

  // 準備 Excel 資料
  const headers = [
    "訂單編號",
    "建立時間",
    "授權開始時間",
    "授權天數",
    "授權數量",
    "授權金鑰",
    "備註",
    "附件清單",
  ];
  const excelData = [headers];

  ordersList.forEach((order) => {
    // 處理附件檔名
    let attachmentNames = "";
    if (order.attachments && order.attachments.length > 0) {
      const names = [];
      order.attachments.forEach((attStr) => {
        try {
          if (attStr && attStr.trim()) {
            const parsed = JSON.parse(attStr);
            if (Array.isArray(parsed)) {
              parsed.forEach((p) => names.push(p.split("/").pop()));
            } else if (typeof parsed === "string") {
              names.push(parsed.split("/").pop());
            }
          }
        } catch (e) {}
      });
      attachmentNames = names.join(", ");
    }

    const row = [
      order._license_cid || "",
      order.create_time ? order.create_time[0] : "",
      order.license_begin_time ? order.license_begin_time[0] : "",
      order.license_days ? order.license_days[0] : "",
      order.license_count ? order.license_count[0] : "",
      order.license_key ? order.license_key[0] : "",
      order.note00 ? order.note00[0] : "",
      attachmentNames,
    ];
    excelData.push(row);
  });

  // 建立工作簿
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(excelData);

  // 設定欄寬
  ws["!cols"] = [
    { wch: 20 }, // 訂單編號
    { wch: 20 }, // 建立時間
    { wch: 15 }, // 授權開始時間
    { wch: 10 }, // 授權天數
    { wch: 10 }, // 授權數量
    { wch: 30 }, // 授權金鑰
    { wch: 30 }, // 備註
    { wch: 50 }, // 附件清單
  ];

  // 加入工作表
  XLSX.utils.book_append_sheet(wb, ws, "訂單列表");

  // 生成檔名 (使用訂單編號和日期)
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const fileName = `訂單匯出_${year}${month}${day}_${hours}${minutes}${seconds}.xlsx`;

  // 匯出檔案
  XLSX.writeFile(wb, fileName);

  console.log("[generateOrdersExcel] Excel 檔案已生成:", fileName);
}

// [新增] 匯出所有（符合篩選條件）的訂單
function downloadAllLicenses() {
  if (!window._allLicenseRecordsCache) {
    alert("資料尚未載入，請稍後再試");
    return;
  }

  // 1. 取得目前的日期篩選範圍
  const b_time_el = document.getElementById("license_list-begin_time");
  const e_time_el = document.getElementById("license_list-end_time");
  let target_b_date = b_time_el ? b_time_el.value : "1900-01-01";
  let target_e_date = e_time_el ? e_time_el.value : "2999-12-31";
  target_b_date = target_b_date.replace(/\//g, "-");
  target_e_date = target_e_date.replace(/\//g, "-");

  // 2. 根據日期篩選資料
  const filtered_tablesi = filterRecordsByDateRange(
    window._allLicenseRecordsCache,
    target_b_date,
    target_e_date,
  );

  if (
    !filtered_tablesi ||
    !filtered_tablesi.license_cid ||
    filtered_tablesi.license_cid.length === 0
  ) {
    alert("目前篩選範圍內無資料可匯出");
    return;
  }

  // 3. 轉換資料格式 (Column-Oriented -> Row-Oriented) 並套用狀態篩選
  const allOrders = [];
  const count = filtered_tablesi.license_cid.length;

  for (let i = 0; i < count; i++) {
    // 排除已刪除 (record_state = 0) 的資料
    if (
      filtered_tablesi.record_state &&
      filtered_tablesi.record_state[i] == "0"
    ) {
      continue;
    }

    // 根據目前的狀態篩選 (currentLicenseFilter) 進一步過濾
    if (
      typeof currentLicenseFilter !== "undefined" &&
      currentLicenseFilter !== "all"
    ) {
      const begin_time = new Date(filtered_tablesi.license_begin_time[i]);
      const license_days = parseInt(filtered_tablesi.license_days[i], 10);
      let end_day = DateAdd("d", license_days, begin_time);
      if (license_days !== 0) {
        end_day = SetToEndOfDay(end_day);
      }
      const isExpired = !IsAfterToday(end_day);

      if (currentLicenseFilter === "active" && isExpired) continue;
      if (currentLicenseFilter === "expired" && !isExpired) continue;
    }

    const record = {};
    Object.keys(filtered_tablesi).forEach((key) => {
      if (Array.isArray(filtered_tablesi[key])) {
        record[key] = [filtered_tablesi[key][i]];
      }
    });
    record._license_cid = filtered_tablesi.license_cid[i];
    allOrders.push(record);
  }

  if (allOrders.length === 0) {
    alert("無有效資料可匯出");
    return;
  }

  console.log(`[downloadAllLicenses] 準備匯出 ${allOrders.length} 筆資料`);

  // 4. 生成 Excel
  generateOrdersExcel(allOrders);
  showToast(`已成功匯出 ${allOrders.length} 筆資料`);
}

// 顯示自動消失的提示訊息
function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText =
    "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(0, 0, 0, 0.8); color: white; padding: 20px 40px; border-radius: 8px; z-index: 10000; font-size: 16px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2);";
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = "opacity 0.5s ease";
    toast.style.opacity = "0";
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 500);
  }, 3000);
}

// 篩選授權狀態
function filterLicenseByStatus(status) {
  currentLicenseFilter = status; // [新增] 更新全域篩選狀態

  // 呼叫核心更新函式，它會處理所有過濾、排序與分頁
  updateLicenseList();

  // 更新顯示文字
  const statusText = document.getElementById("license-status-text");
  if (statusText) {
    switch (status) {
      case "all":
        statusText.textContent = window.localeData.license.filter_all;
        break;
      case "active":
        statusText.textContent = window.localeData.license.filter_active;
        break;
      case "expired":
        statusText.textContent = window.localeData.license.filter_expired;
        break;
    }
  }
}

// 【新增】更新總授權數量顯示
function updateTotalCountDisplay(tablesi) {
  let totalCount = 0;
  if (tablesi && tablesi.license_count) {
    for (let i = 0; i < tablesi.license_count.length; i++) {
      // 只計算有效的紀錄 (record_state == 1)
      if (!tablesi.record_state || tablesi.record_state[i] == "1") {
        totalCount += parseInt(tablesi.license_count[i]) || 0;
      }
    }
  }
  const el = document.getElementById("license-total-count");
  if (el) el.innerText = totalCount.toLocaleString();
}

// 下載選中訂單的附件
function downloadSelectedAttachments() {
  const checkboxes = document.querySelectorAll(".license-row-checkbox:checked");

  if (checkboxes.length === 0) {
    alert("請選擇要匯出的項目");
    return;
  }

  // 收集所有選中訂單的 license_cid
  const licenseCids = Array.from(checkboxes).map((cb) =>
    cb.getAttribute("data-license-cid"),
  );

  console.log(
    "[downloadSelectedAttachments] 準備匯出資料，license_cids:",
    licenseCids,
  );

  if (!window._allLicenseRecordsCache) {
    console.log(
      "[downloadSelectedAttachments] Cache miss, falling back to API.",
    );
    VisibleLoaderElement(true);

    // 使用 Promise 包裝 API 請求
    const fetchOrderPromise = async (licenseCid) => {
      return new Promise(async (resolve) => {
        try {
          const json_object = await apiCall(
            CsRequestLicenseSelectOneRecordByCID,
            licenseCid,
          );
          if (json_object.records) {
            json_object.records._license_cid = licenseCid;
            resolve(json_object.records);
          } else {
            resolve(null);
          }
        } catch (e) {
          console.error(`解析訂單 ${licenseCid} 失敗:`, e);
          resolve(null);
        }
      });
    };

    // 限制並行請求數量
    const CONCURRENCY_LIMIT = 3;
    const promiseAllLimit = (items, limit, fn) => {
      const results = new Array(items.length);
      let index = 0;
      const next = () => {
        if (index >= items.length) return Promise.resolve();
        const currentIndex = index++;
        const item = items[currentIndex];
        return fn(item).then((res) => {
          results[currentIndex] = res;
          return next();
        });
      };
      const chains = [];
      for (let i = 0; i < Math.min(limit, items.length); i++) {
        chains.push(next());
      }
      return Promise.all(chains).then(() => results);
    };

    promiseAllLimit(licenseCids, CONCURRENCY_LIMIT, fetchOrderPromise)
      .then((results) => {
        VisibleLoaderElement(false);
        const allOrders = results.filter((r) => r !== null);

        if (allOrders.length > 0) {
          console.log(
            "[downloadSelectedAttachments] 開始生成整合 Excel 檔案 (API)",
          );
          generateOrdersExcel(allOrders);
          if (allOrders.length === licenseCids.length) {
            showToast(`已成功匯出 ${allOrders.length} 筆訂單資料`);
          } else {
            alert(
              `匯出完成，但有部分資料讀取失敗。\n預計: ${licenseCids.length} 筆\n成功: ${allOrders.length} 筆\n失敗: ${licenseCids.length - allOrders.length} 筆`,
            );
          }
        } else {
          alert("無法獲取訂單資料");
        }
      })
      .catch((err) => {
        VisibleLoaderElement(false);
        console.error("匯出過程發生錯誤:", err);
        alert("匯出失敗，請稍後再試");
      });
    return;
  }

  VisibleLoaderElement(true);

  setTimeout(() => {
    const allOrders = [];
    const cache = window._allLicenseRecordsCache;

    if (cache && cache.license_cid) {
      licenseCids.forEach((cid) => {
        const idx = cache.license_cid.indexOf(cid);
        if (idx !== -1) {
          const record = {};
          Object.keys(cache).forEach((key) => {
            if (Array.isArray(cache[key])) {
              record[key] = [cache[key][idx]];
            }
          });
          record._license_cid = cid;
          allOrders.push(record);
        }
      });
    }

    VisibleLoaderElement(false);

    if (allOrders.length > 0) {
      console.log(
        "[downloadSelectedAttachments] 開始生成整合 Excel 檔案 (From Cache)",
      );
      generateOrdersExcel(allOrders);
      if (allOrders.length === licenseCids.length) {
        showToast(`已成功匯出 ${allOrders.length} 筆訂單資料`);
      } else {
        alert(
          `匯出完成，但有部分資料讀取失敗。\n預計: ${licenseCids.length} 筆\n成功: ${allOrders.length} 筆\n失敗: ${licenseCids.length - allOrders.length} 筆`,
        );
      }
    } else {
      alert("無法獲取訂單資料");
    }
  }, 100);
}
