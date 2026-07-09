// distributor_license.html 的頁面事件操控程式碼相關

/*___________________________________________________________________________________*/
// i18n
(function () {
  renderTemplate("zh-tw", "app");
})();

/*___________________________________________________________________________________*/
// 列表上面顯示的欄位對照表 與 順序
let key_device_list_info = [
  "create_time",
  "spec04",
  "device_cid",
  "license_key",
];
const def_rows_per_page = 10;

/* 全域變數 - 資料快取 */
window._allDeviceRecordsCache = null;

/*___________________________________________________________________________________*/
async function SelectDeviceAll() {
  let condition_type =
    _k_search_condition_type_by_agent_cid__and__owner_cid__and__record_state__and__product_type__and__spec04;

  // [修正 1]：增加 group_cid 的備援讀取機制 (修正顯示為 0 的主因之一)
  let group_cid =
    window.sessionStorage.getItem("select_group_cid") ||
    window.sessionStorage.getItem("group_cid") ||
    "";
  let product_type = window.sessionStorage.getItem("product_type") || "";

  // 條件的內容
  // 注意：這裡確保 group_cid 不會是 "null" 字串
  let condition_value = `%%; ${group_cid}; 1; ${product_type}; %%`;

  // 取得日期欄位
  const b_time_el = document.getElementById("device_list-begin_time");
  const e_time_el = document.getElementById("device_list-end_time");
  let b_time = b_time_el ? b_time_el.value : "";
  let e_time = e_time_el ? e_time_el.value : "";

  // [修正 2]：標準化日期格式 (斜線轉橫線)
  if (b_time) b_time = b_time.replace(/\//g, "-");
  if (e_time) e_time = e_time.replace(/\//g, "-");

  // [修正 4]：補上時分秒 (修正顯示為 0 的主因之二)
  // 確保能搜尋到當天 23:59:59 之前的所有資料
  if (b_time && b_time.length === 10) b_time += " 00:00:00";
  if (e_time && e_time.length === 10) e_time += " 23:59:59";

  console.log("Device Search Params:", {
    condition_value,
    b_time,
    e_time,
  });

  VisibleLoaderElement(true);

  try {
    // 【優化】一次性獲取所有記錄 (limit 9999) 使用 apiCall
    const json_object = await apiCall(
      CsRequestDeviceSelectAllRecords,
      condition_type,
      condition_value,
      b_time,
      e_time,
      0,
      9999,
    );

    let allRecords = json_object.records;

    // 過濾 Product Type
    let current_product_type =
      window.sessionStorage.getItem("product_type") || "avacast";
    if (allRecords && Object.keys(allRecords).length > 0) {
      allRecords = filterablesiByFieldValue(
        allRecords,
        "product_type",
        current_product_type,
      );
    }

    // 【優化】將資料快取起來
    window._allDeviceRecordsCache = allRecords;

    // [修正] 強制清空搜尋框，防止瀏覽器自動填入導致顯示不一致
    const searchInput = document.getElementById("device-search-input");
    if (searchInput) searchInput.value = "";

    // 呼叫更新函式
    updateDeviceList();
  } catch (e) {
    if (e.message !== "Handled Server Error") {
      console.error(e);
      showToast("資料讀取失敗，請檢查網路連線");
    }
  } finally {
    VisibleLoaderElement(false);
  }
}

// 匯出所有（符合篩選條件）的設備
function downloadAllDevices() {
  if (!window._allDeviceRecordsCache) {
    alert("資料尚未載入，請稍後再試");
    return;
  }

  let allRecords = window._allDeviceRecordsCache;

  // 1. 關鍵字過濾
  const searchInput = document.getElementById("device-search-input");
  const keyword = searchInput ? searchInput.value.trim() : "";

  let filteredRecords = allRecords;
  if (keyword) {
    filteredRecords = filterDevicesByKeyword(allRecords, keyword);
  }

  if (
    !filteredRecords ||
    !filteredRecords.device_cid ||
    filteredRecords.device_cid.length === 0
  ) {
    alert("目前篩選範圍內無資料可匯出");
    return;
  }

  // 2. 轉換資料格式 (Column-Oriented -> Row-Oriented)
  const allDevices = [];
  const count = filteredRecords.device_cid.length;

  for (let i = 0; i < count; i++) {
    const record = {};
    Object.keys(filteredRecords).forEach((key) => {
      if (Array.isArray(filteredRecords[key])) {
        record[key] = [filteredRecords[key][i]];
      }
    });
    allDevices.push(record);
  }

  if (allDevices.length === 0) {
    alert("無有效資料可匯出");
    return;
  }

  console.log(`[downloadAllDevices] 準備匯出 ${allDevices.length} 筆資料`);

  // 3. 生成 Excel
  generateDevicesExcel(allDevices);
  showToast(`已成功匯出 ${allDevices.length} 筆資料`);
}

// 【新增】更新列表與分頁 (核心邏輯)
function updateDeviceList() {
  let allRecords = window._allDeviceRecordsCache;
  if (!allRecords) return;

  // 1. 關鍵字過濾
  const searchInput = document.getElementById("device-search-input");
  const keyword = searchInput ? searchInput.value.trim() : "";

  let filteredRecords = allRecords;
  if (keyword) {
    filteredRecords = filterDevicesByKeyword(allRecords, keyword);
  }

  // 2. 排序 (新增)
  if (currentSortField) {
    filteredRecords = sortTablesiData(
      filteredRecords,
      currentSortField,
      currentSortOrder,
    );
  }

  let count = filteredRecords.device_cid
    ? filteredRecords.device_cid.length
    : 0;

  // 2. 處理無資料
  if (count === 0) {
    var element_table = document.getElementById("device_list-list_information");
    let tbody = element_table.querySelector("tbody");
    if (tbody) tbody.innerHTML = "";
  }

  // 3. 初始化分頁並渲染
  let table_page = document.getElementById("device_list-list_pagination");
  if (table_page) {
    // 注意：這裡傳入的是 filteredRecords 的總數，這樣分頁才會正確
    tablepage_d(
      table_page,
      def_rows_per_page,
      count,
      function (now_index, count_of_page) {
        const page_records = sliceTablesi(
          filteredRecords,
          now_index,
          count_of_page,
        );
        renderDeviceTable(page_records, count);
      },
    );
  }
}

// 【新增】輔助函數：對 records 物件進行切片
function sliceTablesi(tablesi, offset, limit) {
  const sliced_tablesi = {};
  const keys = Object.keys(tablesi);
  if (keys.length === 0) return {};
  const total = tablesi[keys[0]] ? tablesi[keys[0]].length : 0;
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

// 【新增】輔助函數：渲染表格
function renderDeviceTable(json_tablesi, totalCount) {
  var element_table = document.getElementById("device_list-list_information");
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
    Object.keys(json_tablesi).length === 0 ||
    (json_tablesi.device_cid && json_tablesi.device_cid.length === 0)
  ) {
    return;
  }

  const fragment = document.createDocumentFragment();
  const count = json_tablesi.device_cid.length;

  for (let i = 0; i < count; i++) {
    const row = document.createElement("tr");

    let record_state = json_tablesi.record_state
      ? json_tablesi.record_state[i]
      : "1";
    let disabled_color = "#d6d6d6ff";
    if (record_state === "0") {
      row.style.backgroundColor = disabled_color;
    }

    // 1. Checkbox
    const cellCheckbox = document.createElement("td");
    cellCheckbox.style.padding = "1rem";
    cellCheckbox.innerHTML = `<input type="checkbox" class="row-checkbox" name="deviceCheckbox" />`;
    row.appendChild(cellCheckbox);

    // 2. Create Time
    const cellCreateTime = document.createElement("td");
    cellCreateTime.textContent = json_tablesi.create_time
      ? json_tablesi.create_time[i]
      : "";
    row.appendChild(cellCreateTime);

    // 3. Spec04
    const cellSpec = document.createElement("td");
    cellSpec.textContent = json_tablesi.spec04 ? json_tablesi.spec04[i] : "";
    row.appendChild(cellSpec);

    // 4. Device CID
    const cellCid = document.createElement("td");
    cellCid.textContent = json_tablesi.device_cid
      ? json_tablesi.device_cid[i]
      : "";
    row.appendChild(cellCid);

    // 5. License Key
    const cellKey = document.createElement("td");
    cellKey.textContent = json_tablesi.license_key
      ? json_tablesi.license_key[i]
      : "";
    row.appendChild(cellKey);

    fragment.appendChild(row);
  }

  tbody.appendChild(fragment);

  // 更新分頁資訊
  setTimeout(() => updatePaginationInfo(totalCount), 0);
}

// 更新分頁資訊顯示
function updatePaginationInfo(visibleCount) {
  const paginationContainer = document.getElementById(
    "device_list-list_pagination",
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

    // [修正] 英文模式下隱藏「第」與「頁」的儲存格，避免破壞功能
    const lang = window.localStorage.getItem("language");
    if (lang && lang.includes("en")) {
      for (const td of tds) {
        if (td === infoTd) continue;
        const text = td.innerText.trim();
        if (text === "第" || text === "頁") {
          td.style.display = "none";
        }
      }
    }
  }
}

/*___________________________________________________________________________________*/
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Distributor License Page Loaded");

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

  // [修正] 強制清空舊的搜尋欄位
  const oldSearchValue = document.getElementById(
    "device_list-input_search_value",
  );
  if (oldSearchValue) oldSearchValue.value = "";

  const searchButton = document.getElementById("device_list-button-search");
  if (searchButton) {
    searchButton.addEventListener("click", function (event) {
      SelectDeviceAll();
    });
  }

  // 添加搜尋功能
  const searchInput = document.getElementById("device-search-input");
  if (searchInput) {
    // [修正] 初始化時清空搜尋欄
    searchInput.value = "";

    // 即時搜尋：當用戶輸入時搜尋
    let searchTimeout;
    searchInput.addEventListener("input", function (event) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        // 改為呼叫 updateDeviceList，不重新發 API
        updateDeviceList();
      }, 1000);
    });
  }

  // 綁定全選功能
  const selectAllCheckbox = document.getElementById("selectAll");
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", function () {
      const rowCheckboxes = document.querySelectorAll(".row-checkbox");
      rowCheckboxes.forEach((checkbox) => {
        checkbox.checked = selectAllCheckbox.checked;
      });
    });
  }

  const beginTimeEl = document.getElementById("device_list-begin_time");
  const endTimeEl = document.getElementById("device_list-end_time");
  const dateSearchButton = document.getElementById(
    "device_list-button-date_search",
  );

  // 檢查 sessionStorage 中是否有儲存的日期
  const savedBeginTime = sessionStorage.getItem("dashboard_begin_time");
  const savedEndTime = sessionStorage.getItem("dashboard_end_time");

  if (savedBeginTime && savedEndTime) {
    // 如果有儲存的日期，則使用
    if (beginTimeEl) beginTimeEl.value = savedBeginTime;
    if (endTimeEl) endTimeEl.value = savedEndTime;
    console.log(
      "distributor_license.html: 從 sessionStorage 載入日期:",
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
      SelectDeviceAll();
    });
  }

  // [修正] 頁面載入時，直接執行搜尋邏輯 (Async)
  console.log("distributor_license.html: 頁面載入完成，自動執行搜尋。");

  // 1. 將當前日期儲存到 sessionStorage (若按鈕不存在也要存，以保一致性)
  if (beginTimeEl && endTimeEl) {
    sessionStorage.setItem("dashboard_begin_time", beginTimeEl.value);
    sessionStorage.setItem("dashboard_end_time", endTimeEl.value);
  }
  // 2. 執行查詢
  await SelectDeviceAll();
});

/*___________________________________________________________________________________*/
// 根據關鍵字過濾設備列表
function filterDevicesByKeyword(deviceData, keyword) {
  if (!deviceData || !keyword) {
    return deviceData;
  }

  const searchKeyword = keyword.toLowerCase();
  console.log("Filtering devices by keyword:", searchKeyword);

  // 創建新的過濾後數據結構
  const filteredData = {};

  // 首先複製所有字段的空數組
  Object.keys(deviceData).forEach((key) => {
    filteredData[key] = [];
  });

  // 遍歷每個設備記錄
  const recordCount = deviceData.device_cid ? deviceData.device_cid.length : 0;

  for (let i = 0; i < recordCount; i++) {
    let shouldInclude = false;

    // 檢查各個欄位是否包含關鍵字
    const fieldsToSearch = [
      "device_cid", // 設備ID
      "spec04", // 設備型號
      "license_key", // License Key
      "create_time", // 創建時間
    ];

    for (const field of fieldsToSearch) {
      if (deviceData[field] && deviceData[field][i]) {
        const fieldValue = deviceData[field][i].toString().toLowerCase();
        if (fieldValue.includes(searchKeyword)) {
          shouldInclude = true;
          break;
        }
      }
    }

    // 如果匹配，加入到過濾結果中
    if (shouldInclude) {
      Object.keys(deviceData).forEach((key) => {
        if (deviceData[key] && deviceData[key][i] !== undefined) {
          filteredData[key].push(deviceData[key][i]);
        }
      });
    }
  }

  console.log(
    `Filtered ${recordCount} devices to ${filteredData.device_cid?.length || 0} matches`,
  );
  return filteredData;
}

// 【新增】對 tablesi 格式資料進行排序
function sortTablesiData(tablesi, field, order) {
  if (!tablesi || !tablesi[field] || tablesi[field].length === 0)
    return tablesi;

  const len = tablesi[field].length;
  // 建立索引陣列 [0, 1, 2, ...]
  const indices = new Array(len);
  for (let i = 0; i < len; i++) indices[i] = i;

  // 根據指定欄位對索引進行排序
  indices.sort((a, b) => {
    let valA = tablesi[field][a];
    let valB = tablesi[field][b];

    // 處理日期
    if (field.includes("time")) {
      const dateA = valA ? new Date(valA).getTime() : 0;
      const dateB = valB ? new Date(valB).getTime() : 0;
      return order === "asc" ? dateA - dateB : dateB - dateA;
    }

    // 字串比較
    valA = valA ? String(valA).toLowerCase() : "";
    valB = valB ? String(valB).toLowerCase() : "";

    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
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

/*___________________________________________________________________________________*/
// 驗證時間範圍
function validateTimeRange() {
  const beginTimeEl = document.getElementById("device_list-begin_time");
  const endTimeEl = document.getElementById("device_list-end_time");

  if (beginTimeEl && endTimeEl && beginTimeEl.value && endTimeEl.value) {
    const beginDate = new Date(beginTimeEl.value);
    const endDate = new Date(endTimeEl.value);

    if (beginDate > endDate) {
      console.warn("開始時間不能晚於結束時間");
      // 可以選擇自動調整或顯示警告
      // beginTimeEl.value = endTimeEl.value;
    }

    const daysDiff = Math.abs((endDate - beginDate) / (1000 * 60 * 60 * 24));
    console.log(`時間範圍: ${daysDiff} 天`);

    if (daysDiff > 365) {
      console.warn("查詢時間範圍過大，可能影響性能");
    }
  }
}

/*___________________________________________________________________________________*/
// 排序狀態管理
let currentSortField = "";
let currentSortOrder = "asc"; // 'asc' 或 'desc'

// 排序表格函數
function sortDeviceTable(field) {
  // 切換排序順序
  if (currentSortField === field) {
    currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
  } else {
    currentSortField = field;
    currentSortOrder = "asc";
  }

  // 更新排序圖標
  updateSortIcons(field, currentSortOrder);

  // 對所有數據進行排序並重新渲染 (取代舊的 DOM 排序)
  updateDeviceList();
}

// 更新排序圖標
function updateSortIcons(activeField, order) {
  // 重置所有圖標
  const sortIcons = ["create_time", "spec04", "device_cid", "license_key"];

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

/*___________________________________________________________________________________*/
// 生成設備資料的 Excel 檔案
function generateDevicesExcel(devicesList) {
  console.log(
    "[generateDevicesExcel] 開始生成 Excel，筆數:",
    devicesList.length,
  );

  // 準備 Excel 資料
  const headers = [
    "設備編號",
    "建立時間",
    "啟用時間",
    "產品類型",
    "授權金鑰",
    "狀態",
    "Spec00",
    "Spec01",
    "Spec02",
    "Spec03",
    "Spec04",
    "Spec05",
    "Spec06",
    "Spec07",
    "備註",
  ];
  const excelData = [headers];

  devicesList.forEach((device) => {
    const row = [
      (device.device_cid && device.device_cid[0]) || "",
      (device.create_time && device.create_time[0]) || "",
      (device.active_time && device.active_time[0]) || "",
      (device.product_type && device.product_type[0]) || "",
      (device.license_key && device.license_key[0]) || "",
      device.record_state && device.record_state[0] === "1" ? "啟用" : "停用",
      (device.spec00 && device.spec00[0]) || "",
      (device.spec01 && device.spec01[0]) || "",
      (device.spec02 && device.spec02[0]) || "",
      (device.spec03 && device.spec03[0]) || "",
      (device.spec04 && device.spec04[0]) || "",
      (device.spec05 && device.spec05[0]) || "",
      (device.spec06 && device.spec06[0]) || "",
      (device.spec07 && device.spec07[0]) || "",
      (device.note00 && device.note00[0]) || "",
    ];
    excelData.push(row);
  });

  // 建立工作簿
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(excelData);

  // 設定欄寬
  ws["!cols"] = [
    { wch: 20 }, // 設備編號
    { wch: 20 }, // 建立時間
    { wch: 20 }, // 啟用時間
    { wch: 15 }, // 產品類型
    { wch: 30 }, // 授權金鑰
    { wch: 10 }, // 狀態
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 }, // Specs
    { wch: 30 }, // 備註
  ];

  // 加入工作表
  XLSX.utils.book_append_sheet(wb, ws, "設備列表");

  // 生成檔名 (使用設備編號和日期)
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const fileName = `設備匯出_${year}${month}${day}_${hours}${minutes}${seconds}.xlsx`;

  // 匯出檔案
  XLSX.writeFile(wb, fileName);

  console.log("[generateDevicesExcel] Excel 檔案已生成:", fileName);
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

// 下載選中設備的 Excel 檔案（支援多選）
async function downloadSelectedDevicesExcel() {
  const checkedBoxes = document.querySelectorAll(".row-checkbox:checked");

  if (checkedBoxes.length === 0) {
    alert("請選擇要匯出的設備");
    return;
  }

  const deviceCids = Array.from(checkedBoxes)
    .map((checkbox) => {
      const row = checkbox.closest("tr");
      if (row && row.cells.length > 3) {
        return row.cells[3].textContent.trim();
      }
      return null;
    })
    .filter((cid) => cid !== null);

  if (deviceCids.length === 0) {
    alert("無法獲取選中設備的ID");
    return;
  }

  // 優先使用快取
  if (window._allDeviceRecordsCache) {
    VisibleLoaderElement(true);
    setTimeout(() => {
      const allDevices = [];
      const cache = window._allDeviceRecordsCache;

      if (cache && cache.device_cid) {
        deviceCids.forEach((cid) => {
          const idx = cache.device_cid.indexOf(cid);
          if (idx !== -1) {
            const record = {};
            Object.keys(cache).forEach((key) => {
              if (Array.isArray(cache[key])) {
                record[key] = [cache[key][idx]];
              }
            });
            // 確保 device_cid 存在
            if (!record.device_cid) record.device_cid = [cid];
            allDevices.push(record);
          }
        });
      }

      VisibleLoaderElement(false);

      if (allDevices.length > 0) {
        console.log(
          "[downloadSelectedDevicesExcel] 開始生成整合 Excel 檔案 (From Cache)",
        );
        generateDevicesExcel(allDevices);
        if (allDevices.length === deviceCids.length) {
          showToast(`已成功匯出 ${allDevices.length} 筆設備資料`);
        } else {
          alert(
            `匯出完成，但有部分資料讀取失敗。\n預計: ${deviceCids.length} 筆\n成功: ${allDevices.length} 筆\n失敗: ${deviceCids.length - allDevices.length} 筆`,
          );
        }
      } else {
        alert("無法獲取設備資料");
      }
    }, 100);
    return;
  }

  console.log(
    "[downloadSelectedDevicesExcel] 準備匯出",
    deviceCids.length,
    "個設備的 Excel",
  );
  VisibleLoaderElement(true);

  try {
    // 使用 apiCall 包裝請求
    const fetchDevicePromise = async (deviceCid) => {
      try {
        const json_object = await apiCall(
          CsRequestDeviceSelectOneRecord,
          deviceCid,
        );
        if (json_object.records) {
          if (!json_object.records.device_cid) {
            json_object.records.device_cid = [deviceCid];
          }
          return json_object.records;
        }
      } catch (e) {
        console.error(`解析設備 ${deviceCid} 失敗:`, e);
      }
      return null;
    };

    // 限制並行請求數量
    const CONCURRENCY_LIMIT = 3;
    const chunkArray = (array, size) => {
      const result = [];
      for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
      }
      return result;
    };

    let allDevices = [];
    const chunks = chunkArray(deviceCids, CONCURRENCY_LIMIT);

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map((cid) => fetchDevicePromise(cid)),
      );
      allDevices = allDevices.concat(chunkResults.filter((r) => r !== null));
    }

    if (allDevices.length > 0) {
      console.log("[downloadSelectedDevicesExcel] 開始生成整合 Excel 檔案");
      generateDevicesExcel(allDevices);
      if (allDevices.length === deviceCids.length) {
        showToast(`已成功匯出 ${allDevices.length} 筆設備資料`);
      } else {
        alert(
          `匯出完成，但有部分資料讀取失敗。\n預計: ${deviceCids.length} 筆\n成功: ${allDevices.length} 筆\n失敗: ${deviceCids.length - allDevices.length} 筆`,
        );
      }
    } else {
      alert("無法獲取設備資料");
    }
  } catch (err) {
    console.error("匯出過程發生錯誤:", err);
    alert("匯出失敗，請稍後再試");
  } finally {
    VisibleLoaderElement(false);
  }
}
