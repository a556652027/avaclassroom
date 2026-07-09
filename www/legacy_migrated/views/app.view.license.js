console.log("🚀 [DEBUG] app.view.license.js v1.0.12 - restore teacher record_state on re-insert");
// [整合] 使用全域 ResourceLoader 進行動態載入，已清除原本的 loadScript 宣告以防全域污染

// [整合] 根據產品類型，設定頁面並載入對應的導覽列
function configureListPageForProduct(product) {
  const navContainer = document.getElementById("nav-container");
  const avaclassroomNavContainer = document.getElementById(
    "avaclassroom-nav-container",
  );

  // [新增] 權限判斷
  const userTier = window.sessionStorage.getItem("tier");
  const isDistributor = userTier === "3";

  product = product || "avacast";
  window.sessionStorage.setItem("product_type", product);

  // 欄位顯示邏輯
  const setFieldVisibility = (fieldId, show) => {
    const el = document.getElementById(fieldId);
    if (el) {
      // 找到包含該 input 的 td
      const td = el.closest("td");
      if (td) {
        td.style.display = show ? "flex" : "none";
      }
    }
  };

  // 定義要控制的欄位 ID 列表
  const allOptionalFields = [
    "license_insert-sale_amount",
    "license_insert-country",
    "license_insert-customer_name",
    "license_insert-customer_gender",
    "license_insert-customer_birthday",
    "license_insert-customer_phone",
    "license_insert-customer_postalcode",
    "license_insert-customer_address",
    "license_insert-customer_email",
    // Update Modal fields
    "license_update-product_type",
    "license_update-sale_amount",
    "license_update-country",
    "license_update-customer_name",
    "license_update-customer_gender",
    "license_update-customer_birthday",
    "license_update-customer_phone",
    "license_update-customer_postalcode",
    "license_update-customer_address",
    "license_update-customer_email",
  ];

  // 1. 先全部隱藏 (回復到預設狀態)
  allOptionalFields.forEach((id) => setFieldVisibility(id, false));

  // 2. 根據產品類型顯示特定欄位
  if (product === "avaclassroom") {
    // AvaClassroom 只顯示訂購人名稱
    setFieldVisibility("license_insert-customer_name", true);
    setFieldVisibility("license_update-customer_name", true);

    // 顯示訂購人搜尋欄位
    const customerNameSearchContainer = document.getElementById(
      "license_list-customer_name-container",
    );
    if (customerNameSearchContainer) {
      customerNameSearchContainer.style.display = "flex";
    }
  } else {
    // 其他產品隱藏訂購人搜尋欄位
    const customerNameSearchContainer = document.getElementById(
      "license_list-customer_name-container",
    );
    if (customerNameSearchContainer) {
      customerNameSearchContainer.style.display = "none";
    }
  }

  // [新增] 根據權限動態載入導覽列與調整 UI
  if (isDistributor) {
    // 1. [修正] 顯示導覽列 (Dashboard/訂單資訊/License)
    if (navContainer) navContainer.style.display = "block";
    if (avaclassroomNavContainer)
      avaclassroomNavContainer.style.display = "none";

    // 2. 載入通用元件 (Navbar & Sidebar)
    ResourceLoader.loadScript("components/app.component.frame.navbar.js?v=20260626_2");
    ResourceLoader.loadScript("components/app.component.frame.sidebar-nav.js");

    // 2-1. [新增] 載入並初始化第二層導覽列
    ResourceLoader.loadScript("components/app.component.frame.nav.js").then(() => {
      if (typeof initializeStandardNav === "function") {
        initializeStandardNav();
      }
    });

    // 3. 隱藏管理員功能按鈕
    const insertBtn = document.getElementById(
      "license_list-button-gotopage_insert",
    );
    if (insertBtn) insertBtn.style.setProperty("display", "none", "important");

    const editBtn = document.getElementById("license-edit-button");
    if (editBtn) editBtn.style.setProperty("display", "none", "important");

    const deleteBtn = document.getElementById("license-delete-button");
    if (deleteBtn) deleteBtn.style.setProperty("display", "none", "important");

    // 4. 隱藏「訂購人名稱」搜尋欄 (經銷商通常不搜這個)
    const customerSearch = document.getElementById(
      "license_list-customer_name-container",
    );
    if (customerSearch)
      customerSearch.style.setProperty("display", "none", "important");

    // 5. 隱藏表格中的「訂購人名稱」表頭 (第 2 欄, index 1)
    // 注意：表格可能還沒渲染，所以這裡隱藏的是靜態 HTML 中的 th
    // 若 th 是動態生成的，需要在 renderTable 中處理。
    // license.html 的 thead 是靜態的，我們用 CSS class 或直接操作
    // 這裡我們在 renderTable 中處理比較保險。
  } else {
    // 管理員邏輯 (維持原狀)
    if (product === "avaclassroom") {
      if (navContainer) navContainer.style.display = "none";
      if (avaclassroomNavContainer)
        avaclassroomNavContainer.style.display = "block";
      ResourceLoader.loadScript("components/avaclassroom-nav/avaclassroom.js").then(() => {
        if (typeof initializeAvaclassroomNav === "function") {
          initializeAvaclassroomNav();
        }
      });
    } else {
      if (navContainer) navContainer.style.display = "block";
      if (avaclassroomNavContainer)
        avaclassroomNavContainer.style.display = "none";
      // 動態載入標準導覽列，並在載入後初始化
      ResourceLoader.loadScript("components/app.component.frame.nav.js").then(() => {
        if (typeof initializeStandardNav === "function") {
          initializeStandardNav();
        }
      });
    }
  }
}

/* 列表欄位與每頁筆數 */
let key_license_list_info = [
  "create_time",
  "customer_name",
  "license_begin_time",
  "license_days",
  "license_count",
  "note00",
];

// 如果資料中有 license_cid，我們需要知道它的索引位置
let license_cid_index = -1; // 需要在載入資料時確定
const def_rows_per_page = 10;

// 排序狀態管理
let currentSortField = "create_time";
let currentSortOrder = "desc"; // 'asc' 或 'desc'
let _g_current_page = 1;
let _g_rows_per_page = 10;
let _is_rendering_pagination = false;

/* 全域變數 - 篩選狀態 */
let currentLicenseFilter = "all"; // all, active, expired

/* 全域變數 - 資料快取 (用於匯出 Excel，避免重複 API 請求) */
window._allLicenseRecordsCache = null;

// [Phase 1 優化] 主動清除其他頁面的全域快取，避免記憶體洩漏
if (typeof window._allDeviceRecordsCache !== "undefined")
  window._allDeviceRecordsCache = null;
if (typeof window._revokedDeviceRecordsCache !== "undefined")
  window._revokedDeviceRecordsCache = null;

// 用於管理 Modal 事件生命週期的控制器
window._licenseModalEventController = null;

let _g_license_request_controller = null;
/* 工具函數 - 計算季度開始日期 (3個月一季) */
function getQuarterStartDate(date) {
  const currentDate = new Date(date);
  const month = currentDate.getMonth(); // 0-11
  const year = currentDate.getFullYear();

  // 計算季度 (每3個月一季): Q1=0-2月, Q2=3-5月, Q3=6-8月, Q4=9-11月
  const quarterStartMonth = Math.floor(month / 3) * 3;

  // 回傳該季度的第一天
  return new Date(year, quarterStartMonth, 1);
}

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
    } else if (
      field === "license_count" ||
      field === "license_days" ||
      field === "sale_amount"
    ) {
      const numA = parseFloat(valA) || 0;
      const numB = parseFloat(valB) || 0;
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

  // 1. 取得 UI 上的篩選條件
  const b_time_el = document.getElementById("license_list-begin_time");
  const e_time_el = document.getElementById("license_list-end_time");
  let target_b_date = b_time_el ? b_time_el.value : "1900-01-01";
  let target_e_date = e_time_el ? e_time_el.value : "2999-12-31";
  target_b_date = target_b_date.replace(/\//g, "-");
  target_e_date = target_e_date.replace(/\//g, "-");

  const customerNameInput = document.getElementById(
    "license_list-customer_name",
  );
  const customerNameKeyword = customerNameInput ? customerNameInput.value : "";

  // 2. 執行篩選
  let filtered_tablesi = filterRecordsByConditions(
    allRecords,
    target_b_date,
    target_e_date,
    customerNameKeyword,
  );

  // 3. 執行狀態篩選
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

  // 4. 更新儀表板卡片上的「已授權數量」 (根據篩選後的結果)
  let totalLicenseCountInFilteredRange = 0;
  if (filtered_tablesi.license_count) {
    for (let i = 0; i < filtered_tablesi.license_count.length; i++) {
      if (filtered_tablesi.record_state[i] == "1") {
        totalLicenseCountInFilteredRange +=
          parseInt(filtered_tablesi.license_count[i]) || 0;
      }
    }
  }
  document.getElementById("license-total-count").innerText =
    totalLicenseCountInFilteredRange.toLocaleString();

  // 5. 處理無資料狀況 & 分頁渲染
  const filteredCount = filtered_tablesi.license_cid
    ? filtered_tablesi.license_cid.length
    : 0;
  if (filteredCount === 0) {
    var element_table = document.getElementById(
      "license_list-list_information",
    );
    let tbody = element_table.querySelector("tbody");
    if (tbody) tbody.innerHTML = "";
  }

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
}

/* 切頁 */
function GotoPageLicenseSelectAll() {
  LicenseSelectAll();
  change_page("page01");
}
function GotoPageLicenseInsertOne() {
  setInputDate(new Date(), "license_insert-license_begin_time");

  // [安全防禦] 確保開啟 modal 時，input 的 value 確實與 sessionStorage 中最新的 group_cid 快取同步
  const group_cid = window.sessionStorage.getItem("group_cid");
  const ownerCidInput = document.getElementById("license_insert-owner_cid");
  if (ownerCidInput && group_cid) {
    ownerCidInput.value = group_cid;
  }

  // --- [Ava Classroom 學校欄位優化] ---
  const schoolContainer = document.getElementById("license_insert-customer_name-container");
  const schoolLabel = document.getElementById("license_insert-customer_name-label");
  const schoolInput = document.getElementById("license_insert-customer_name");

  // 1. 定義用來動態顯示/隱藏與更新學校及教學組長欄位的函數
  const updateSchoolFieldVisibility = (prodType) => {
    const teacherRow = document.getElementById("license_insert-classroom_teacher-row");
    const teacherName = document.getElementById("license_insert-teacher_name");
    const teacherEmail = document.getElementById("license_insert-teacher_email");
    const teacherPassword = document.getElementById("license_insert-teacher_password");
    const teacherPasswordConfirm = document.getElementById("license_insert-teacher_password_confirm");

    if (!schoolContainer) return;

    if (prodType === "avaclassroom") {
      schoolContainer.style.display = "flex";
      schoolContainer.style.flexDirection = "column";
      if (schoolLabel) {
        schoolLabel.textContent = GetLocalData("common_order_info.customer_name") || "學校名稱";
      }
      if (schoolInput) {
        schoolInput.placeholder = GetLocalData("common_order_info.customer_name_placeholder") || "請輸入或選擇學校...";
      }
      
      // 顯示教學組長資訊列 (回復預設 table-row)
      if (teacherRow) {
        teacherRow.style.display = "";
      }
      // 設定教學組長輸入框為必填
      if (teacherName) teacherName.required = true;
      if (teacherEmail) teacherEmail.required = true;
      if (teacherPassword) teacherPassword.required = true;
      if (teacherPasswordConfirm) teacherPasswordConfirm.required = true;

      // 2. 注入 datalist 聯想選項 (從 allLicenseRecords 提取不重複的學校)
      const datalist = document.getElementById("insert_school_datalist");
      if (datalist) {
        const schools = [];
        const cache = window._allLicenseRecordsCache;
        if (cache && Array.isArray(cache.customer_name)) {
          cache.customer_name.forEach(name => {
            if (name && name.trim() !== "") {
              const cleaned = name.trim();
              if (!schools.includes(cleaned)) {
                schools.push(cleaned);
              }
            }
          });
        }
        
        console.error("🚨 [DEBUG] 收集到的代理商學校清單:", schools);
        datalist.innerHTML = schools.map(s => `<option value="${s}"></option>`).join("");
      }
    } else {
      schoolContainer.style.display = "none";
      if (schoolInput) {
        schoolInput.value = ""; // 非 avaclassroom 產品時清空
      }
      // 隱藏教學組長資訊列並清空
      if (teacherRow) {
        teacherRow.style.display = "none";
      }
      if (teacherName) { teacherName.value = ""; teacherName.required = false; }
      if (teacherEmail) { teacherEmail.value = ""; teacherEmail.required = false; }
      if (teacherPassword) { teacherPassword.value = ""; teacherPassword.required = false; }
      if (teacherPasswordConfirm) { teacherPasswordConfirm.value = ""; teacherPasswordConfirm.required = false; }
    }
  };

  // [新增] 動態載入產品選單與預設值
  const currentProduct = sessionStorage.getItem("product_type") || "avacast";
  const productInput = document.getElementById("license_insert-product_type");
  const dropMenu = document.getElementById("license_insert-product_dropdown_menu");
  if (productInput) {
    productInput.value = currentProduct;
  }

  // 3. 初次載入 Modal 時執行一次學校欄位狀態更新
  updateSchoolFieldVisibility(currentProduct);

  if (dropMenu) {
    try {
      const ownedProductsStr = window.sessionStorage.getItem("owned_products");
      let allKeys = [];
      if (window.PRODUCT_DICTIONARY) {
        allKeys = Object.keys(window.PRODUCT_DICTIONARY);
      }
      if (ownedProductsStr) {
        const ownedProducts = JSON.parse(ownedProductsStr);
        for (const op of ownedProducts) {
          if (!allKeys.includes(op)) allKeys.push(op);
        }
      }

      let optionsHtml = "";
      for (const pType of allKeys) {
        const pName = typeof window.getProductName === "function" ? window.getProductName(pType) : pType;
        // 使用與全部訂單相同的自訂樣式
        optionsHtml += `<li class="custom-dropdown-item" data-value="${pType}" style="padding: 12px; cursor: pointer; font-size: 14px; color: rgba(0, 0, 0, 0.7); transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f8f9fa'" onmouseout="this.style.backgroundColor='transparent'">${pName} (${pType})</li>`;
      }
      dropMenu.innerHTML = optionsHtml;

      // 綁定下拉按鈕點擊事件 (展開/收合)
      $("#license_insert-product_btn").off("click").on("click", function (e) {
        e.stopPropagation();
        $(dropMenu).toggle();
      });

      // 綁定下拉選單點擊事件
      $(dropMenu).find(".custom-dropdown-item").off("click").on("click", function (e) {
        e.stopPropagation();
        const selectedVal = $(this).data("value");
        if (productInput) {
          productInput.value = selectedVal;
        }
        // [聯動更新] 當選取產品變更時，立即刷新學校欄位的顯示隱藏
        updateSchoolFieldVisibility(selectedVal);
        $(dropMenu).hide();
      });

      // 點擊外部隱藏下拉選單
      $(document).off("click.hideProductDrop").on("click.hideProductDrop", function (e) {
        if (!$(e.target).closest("#license_insert-product_btn, #license_insert-product_dropdown_menu").length) {
          $(dropMenu).hide();
        }
      });
    } catch (e) {
      console.error("Error parsing owned_products for dropdown", e);
    }
  }
  // 顯示 modal 而非切換頁面
  const modal = document.getElementById("license-insert-modal");
  if (modal) {
    modal.style.display = "flex";
  }
}
function GotoPageLicenseUpdateOne(license_cid) {
  // ✅ 清空編輯頁面的新上傳檔案（避免殘留）
  if (window._licenseUploaderUpdate && window._licenseUploaderUpdate.clear) {
    window._licenseUploaderUpdate.clear();
  }
  // ✅ 重新載入訂單資料（會設定 window._existingAttachmentPaths）
  LicenseSelectOne(license_cid);
  // 顯示編輯 modal
  const modal = document.getElementById("license-update-modal");
  if (modal) {
    modal.style.display = "flex";
  }
}

// 【重構】改用後端分頁控制
function renderPagination(totalRecords) {
  let license_table_page = document.getElementById(
    "license_list-list_pagination",
  );
  if (license_table_page) {
    _is_rendering_pagination = true;
    tablepage_d(
      license_table_page,
      _g_rows_per_page,
      totalRecords,
      function (now_index, count_of_page) {
        if (_is_rendering_pagination) return;
        let n = Number(now_index) || 0;
        let c = Number(count_of_page) || _g_rows_per_page;
        const target_page = Math.floor(n / c) + 1;
        if (target_page !== _g_current_page && !isNaN(target_page)) {
          LicenseSelectAll({ page: target_page, keepFilters: true });
        }
      },
    );
    _is_rendering_pagination = false;
  }
}

// 【重構】接收後端 API 統計數字，並計算前端 YoY 與 QoQ
function updateDashboardStats(stats) {
  if (!stats) return;
  const activeToday = parseInt(stats.active_today?.[0]) || 0;
  const activeLastYear = parseInt(stats.active_last_year?.[0]) || 0;
  const curQAdded = parseInt(stats.current_quarter_added?.[0]) || 0;
  const lastQAdded = parseInt(stats.last_quarter_added?.[0]) || 0;

  document.getElementById("license-total-count").innerText =
    activeToday.toLocaleString();

  const yoyContainer = document.getElementById("license-total-growth-rate");
  if (yoyContainer) {
    if (activeLastYear === 0) {
      yoyContainer.style.display = "none";
    } else {
      const growthRate =
        ((activeToday - activeLastYear) / activeLastYear) * 100;
      const growthRateFormatted = Math.abs(growthRate).toFixed(1);
      const elPercentage = document.getElementById(
        "license-total-growth-percentage",
      );
      if (elPercentage)
        elPercentage.textContent = `${growthRate >= 0 ? "+" : "-"}${growthRateFormatted}%`;
      const elIcon = document.getElementById("license-total-growth-icon");
      if (elIcon)
        elIcon.src =
          growthRate >= 0 ? "assets/images/up.svg" : "assets/images/down.svg";
      yoyContainer.style.display = "flex";
    }
  }

  document.getElementById("license-quarterly-count").innerText =
    curQAdded.toLocaleString();

  const qoqContainer = document.getElementById("license-quarterly-growth-rate");
  if (qoqContainer) {
    if (lastQAdded === 0) {
      const qoqPercentage = document.getElementById(
        "license-quarterly-growth-percentage",
      );
      if (qoqPercentage)
        qoqPercentage.textContent = curQAdded > 0 ? "+∞%" : "0%";
      const qoqIcon = document.getElementById("license-quarterly-growth-icon");
      if (qoqIcon) qoqIcon.src = "assets/images/up.svg";
      qoqContainer.style.display = "flex";
    } else {
      const growthRate = ((curQAdded - lastQAdded) / lastQAdded) * 100;
      const growthRateFormatted = Math.abs(growthRate).toFixed(1);
      const qoqPercentage = document.getElementById(
        "license-quarterly-growth-percentage",
      );
      if (qoqPercentage)
        qoqPercentage.textContent = `${growthRate >= 0 ? "+" : "-"}${growthRateFormatted}%`;
      const qoqIcon = document.getElementById("license-quarterly-growth-icon");
      if (qoqIcon)
        qoqIcon.src =
          growthRate >= 0 ? "assets/images/up.svg" : "assets/images/down.svg";
      qoqContainer.style.display = "flex";
    }
  }
}

/* （略）LicenseSelectAll、LicenseSelectOne 與 LicenseUpdateOne 保持既有實作 … */
// 【重構】改用後端分頁控制
function renderPagination(totalRecords) {
  let license_table_page = document.getElementById(
    "license_list-list_pagination",
  );
  if (license_table_page) {
    _is_rendering_pagination = true;
    tablepage_d(
      license_table_page,
      _g_rows_per_page,
      totalRecords,
      function (now_index, count_of_page) {
        if (_is_rendering_pagination) return;
        let n = Number(now_index) || 0;
        let c = Number(count_of_page) || _g_rows_per_page;
        const target_page = Math.floor(n / c) + 1;
        if (target_page !== _g_current_page && !isNaN(target_page)) {
          LicenseSelectAll({ page: target_page, keepFilters: true });
        }
      },
    );
    _is_rendering_pagination = false;
  }
}

// 【重構】接收後端 API 統計數字，並計算前端 YoY 與 QoQ
function updateDashboardStats(stats) {
  if (!stats) return;
  const activeToday = parseInt(stats.active_today?.[0]) || 0;
  const activeLastYear = parseInt(stats.active_last_year?.[0]) || 0;
  const curQAdded = parseInt(stats.current_quarter_added?.[0]) || 0;
  const lastQAdded = parseInt(stats.last_quarter_added?.[0]) || 0;

  document.getElementById("license-total-count").innerText =
    activeToday.toLocaleString();

  const yoyContainer = document.getElementById("license-total-growth-rate");
  if (yoyContainer) {
    if (activeLastYear === 0) {
      yoyContainer.style.display = "none";
    } else {
      const growthRate =
        ((activeToday - activeLastYear) / activeLastYear) * 100;
      const growthRateFormatted = Math.abs(growthRate).toFixed(1);
      const elPercentage = document.getElementById(
        "license-total-growth-percentage",
      );
      if (elPercentage)
        elPercentage.textContent = `${growthRate >= 0 ? "+" : "-"}${growthRateFormatted}%`;
      const elIcon = document.getElementById("license-total-growth-icon");
      if (elIcon)
        elIcon.src =
          growthRate >= 0 ? "assets/images/up.svg" : "assets/images/down.svg";
      yoyContainer.style.display = "flex";
    }
  }

  document.getElementById("license-quarterly-count").innerText =
    curQAdded.toLocaleString();

  const qoqContainer = document.getElementById("license-quarterly-growth-rate");
  if (qoqContainer) {
    if (lastQAdded === 0) {
      const qoqPercentage = document.getElementById(
        "license-quarterly-growth-percentage",
      );
      if (qoqPercentage)
        qoqPercentage.textContent = curQAdded > 0 ? "+∞%" : "0%";
      const qoqIcon = document.getElementById("license-quarterly-growth-icon");
      if (qoqIcon) qoqIcon.src = "assets/images/up.svg";
      qoqContainer.style.display = "flex";
    } else {
      const growthRate = ((curQAdded - lastQAdded) / lastQAdded) * 100;
      const growthRateFormatted = Math.abs(growthRate).toFixed(1);
      const qoqPercentage = document.getElementById(
        "license-quarterly-growth-percentage",
      );
      if (qoqPercentage)
        qoqPercentage.textContent = `${growthRate >= 0 ? "+" : "-"}${growthRateFormatted}%`;
      const qoqIcon = document.getElementById("license-quarterly-growth-icon");
      if (qoqIcon)
        qoqIcon.src =
          growthRate >= 0 ? "assets/images/up.svg" : "assets/images/down.svg";
      qoqContainer.style.display = "flex";
    }
  }
}

async function LicenseSelectAll(options = {}) {
  const { page = 1, keepFilters = false } = options;
  _g_current_page = page;
  if (!keepFilters) {
    _g_current_page = 1;
  }
  const offset = (_g_current_page - 1) * _g_rows_per_page;

  console.log("啟動 LicenseSelectAll (優化版)");
  // [DEBUG] 追蹤呼叫來源，協助排查重複 reload 問題
  if (window._debugLicenseSelectAll) console.trace("[LicenseSelectAll trace]");

  // [新增] 權限判斷
  const userTier = window.sessionStorage.getItem("tier");
  const isDistributor = userTier === "3";

  // 1. 基本搜尋條件
  let member_cid = window.sessionStorage.getItem("member_cid") || "";
  let group_cid =
    window.sessionStorage.getItem("select_group_cid") ||
    window.sessionStorage.getItem("group_cid") ||
    "";
  let product_type = window.sessionStorage.getItem("product_type") || "";

  let condition_type = "";
  let condition_value = "";

  // 取得訂購人名稱搜尋關鍵字 (優先從 sessionStorage 讀取以保持狀態)
  const customerNameInput = document.getElementById(
    "license_list-customer_name",
  );
  const customerNameKeyword = (
    window.sessionStorage.getItem("license_search_keyword") ||
    (customerNameInput ? customerNameInput.value : "") ||
    ""
  ).trim();

  if (customerNameInput) {
    customerNameInput.value = customerNameKeyword;
  }
  const clearBtn = document.getElementById("license_list-customer_name-clear");
  if (clearBtn) {
    clearBtn.style.display = customerNameKeyword ? "inline-block" : "none";
  }

  if (isDistributor) {
    // 經銷商: 查詢旗下所有 Agent (%%)，不使用訂購人名稱過濾 (Type 16)
    condition_type =
      _k_search_condition_type_by_agent_cid__and__owner_cid__and__record_state__and__product_type; // 16
    condition_value = `%%;${group_cid.trim()};1;${product_type.trim()}`;
  } else {
    // 管理員: 依 Member ID 查詢，支援訂購人名稱模糊搜尋 (Type 18)
    condition_type =
      _k_search_condition_type_by_agent_cid__and__owner_cid__and__record_state__and__product_type__and__like_customer_name; // 18
    condition_value = `${member_cid.trim()};${group_cid.trim()};1;${product_type.trim()};${customerNameKeyword.trim()}`;
  }

  // 2. 取得 UI 上的日期 (這是使用者真正想看的範圍)
  const b_time_el = document.getElementById("license_list-begin_time");
  const e_time_el = document.getElementById("license_list-end_time");
  let target_b_date = b_time_el ? b_time_el.value : "1900-01-01";
  let target_e_date = e_time_el ? e_time_el.value : "2999-12-31";
  target_b_date = target_b_date.replace(/\//g, "-");
  target_e_date = target_e_date.replace(/\//g, "-");
  let b_time = target_b_date + " 00:00:00";
  let e_time = target_e_date + " 23:59:59";

  // 3. 計算用於統計 API 的日期參數
  const todayDateObj = new Date();
  const today_date = todayDateObj.toISOString().split("T")[0];
  const lastYearObj = new Date();
  lastYearObj.setFullYear(lastYearObj.getFullYear() - 1);
  const last_year_date = lastYearObj.toISOString().split("T")[0];

  const curQStart = getQuarterStartDate(todayDateObj);
  const cur_q_begin = curQStart.toISOString().split("T")[0] + " 00:00:00";
  const cur_q_end = today_date + " 23:59:59";

  const lastQEndObj = new Date(curQStart);
  lastQEndObj.setDate(lastQEndObj.getDate() - 1);
  const lastQStart = getQuarterStartDate(lastQEndObj);
  const last_q_begin = lastQStart.toISOString().split("T")[0] + " 00:00:00";
  const last_q_end = lastQEndObj.toISOString().split("T")[0] + " 23:59:59";

  VisibleLoaderElement(true);

  if (_g_license_request_controller) {
    _g_license_request_controller.abort();
  }
  _g_license_request_controller = new AbortController();

  try {
    // 【說明】兩個請求由底層 lib.proc.net.js 的 RequestThrottle 自動排隊，
    // 確保不會同時打到後端，無需手動延遲
    const listPromise = apiCall(
      CsRequestLicenseSelectAllRecords,
      condition_type,
      condition_value,
      b_time,
      e_time,
      offset,
      _g_rows_per_page,
      customerNameKeyword,
      currentSortField,
      currentSortOrder,
      currentLicenseFilter,
      _g_license_request_controller,
    );

    const statsPromise = apiCall(
      CsRequestLicenseGetStatistics,
      condition_type,
      condition_value,
      today_date,
      last_year_date,
      cur_q_begin,
      cur_q_end,
      last_q_begin,
      last_q_end,
      _g_license_request_controller,
    );

    // [效能優化] 解除 Promise.all 阻塞，讓統計資料在背景獨立完成，不卡住列表的渲染
    statsPromise
      .then((statsResult) => {
        if (
          typeof updateDashboardStats === "function" &&
          statsResult &&
          statsResult.records
        ) {
          updateDashboardStats(statsResult.records);
        }
      })
      .catch((e) => {
        if (e.name !== "AbortError") console.error("Stats API Error:", e);
      });

    // 主執行緒只等待列表 API 回傳
    const listResult = await listPromise;

    const records = listResult.records || {};
    const totalRecords = parseInt(listResult.total_records) || 0;

    // 渲染表格與分頁
    renderTable(records);
    if (_g_current_page === 1 || !keepFilters) {
      renderPagination(totalRecords);
    }
  } catch (e) {
    if (e.name === "AbortError") {
      console.log("License SelectAll request aborted");
      return;
    }
    if (e.message !== "Handled Server Error") {
      console.error(e);
      alert("request error");
    }
  } finally {
    VisibleLoaderElement(false);
  }
}

// 顯示已存在的附件
function displayExistingFiles(files) {
  const fileListEl = document.querySelector(
    "#license-update-modal #existingFileList-update",
  );
  if (!fileListEl) {
    console.warn(
      "找不到附件列表元素 #license-update-modal #existingFileList-update",
    );
    return;
  }

  // 先移除舊的「現有附件」區塊（如果存在）
  const existingSection = fileListEl.querySelector(".existing-files-section");
  if (existingSection) {
    existingSection.remove();
  }

  // ✅ 如果沒有檔案，不顯示任何內容，但不影響 window._existingAttachmentPaths
  if (!files || files.length === 0) {
    console.log("[displayExistingFiles] 沒有附件需要顯示");
    return;
  }

  console.log("[displayExistingFiles] 顯示附件：", files);

  // 創建「現有附件」區塊
  const section = document.createElement("div");
  section.className = "existing-files-section";
  section.style.cssText = `
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e8ea;
  `;

  const title = document.createElement("div");
  title.style.cssText = `
    font-size: 12px;
    color: #898c94;
    margin-bottom: 8px;
  `;
  title.textContent = "";
  section.appendChild(title);

  // 顯示每個附件
  files.forEach((file, index) => {
    const fileItem = document.createElement("div");
    fileItem.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      margin-bottom: 6px;
      background-color: #e6f1fd;
      border-radius: 6px;
      border: 1px solid #92bfff;
    `;

    const fileName =
      file.name || file.file_name || file.filename || `附件 ${index + 1}`;
    const filePath = file.path || file.file_path || ""; // 確保有檔案路徑

    fileItem.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
        <img src="assets/images/list_information.svg" alt="" style="width: 16px; height: 16px;" />
        <span style="font-size: 14px; color: #404040;">${HtmlUtil.escape(fileName)}</span>
      </div>
      <span class="remove-existing-file-btn" data-path="${HtmlUtil.escape(filePath)}" style="cursor: pointer; font-weight: bold; color: #ff0000; margin-left: 10px; position: relative; z-index: 3;">x</span>
    `;

    section.appendChild(fileItem);
  });

  // 為所有 "x" 按鈕添加事件監聽器
  section.querySelectorAll(".remove-existing-file-btn").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation(); // 防止事件冒泡
      const pathToRemove = this.getAttribute("data-path");
      if (pathToRemove && window._existingAttachmentPaths) {
        // 從全域陣列中移除路徑
        const index = window._existingAttachmentPaths.indexOf(pathToRemove);
        if (index > -1) {
          window._existingAttachmentPaths.splice(index, 1);
          console.log("[displayExistingFiles] Removed path:", pathToRemove);
          console.log(
            "[displayExistingFiles] Remaining paths:",
            window._existingAttachmentPaths,
          );
        }

        // 從畫面上移除該檔案的 HTML 元素
        this.parentElement.remove();

        // ✅ 如果所有附件都被刪除了，移除整個 existing-files-section
        if (window._existingAttachmentPaths.length === 0) {
          const existingSection = fileListEl.querySelector(
            ".existing-files-section",
          );
          if (existingSection) {
            existingSection.remove();
            console.log(
              "[displayExistingFiles] All attachments removed, section hidden",
            );
          }
        }
      }
    });
  });

  // 插入到列表最前面
  fileListEl.insertBefore(section, fileListEl.firstChild);
}

async function LicenseSelectOne(license_cid) {
  // ✅ 每次進入編輯頁面時，先清空舊附件路徑（避免殘留）
  window._existingAttachmentPaths = [];

  // 開啟loading dialog
  VisibleLoaderElement(true);

  try {
    const json_object = await apiCall(
      CsRequestLicenseSelectOneRecordByCID,
      license_cid,
    );
    // 填入初始資料
    {
      let record = json_object.records;
      document.getElementById("license_update-license_cid").value =
        record.license_cid[0];
      document.getElementById("license_update-create_time").value =
        record.create_time[0].split(" ")[0];
      document.getElementById("license_update-agent_cid").value =
        sessionStorage.getItem("member_cid");
      document.getElementById("license_update-owner_cid").value =
        record.owner_cid[0];
      document.getElementById("license_update-license_Key").value =
        record.license_key[0];
      document.getElementById("license_update-license_begin_time").value =
        record.license_begin_time[0].split(" ")[0];
      document.getElementById("license_update-license_days").value =
        record.license_days[0];
      document.getElementById("license_update-license_count").value =
        record.license_count[0];
      document.getElementById("license_update-sale_amount").value =
        record.sale_amount[0];
      document.getElementById("license_update-country").value =
        record.country[0];

      document.getElementById("license_update-customer_name").value =
        (record.customer_name && record.customer_name[0]) || "";
      document.getElementById("license_update-customer_gender").value =
        (record.customer_gender && record.customer_gender[0]) || "";
      document.getElementById("license_update-customer_birthday").value =
        (record.customer_birthday && record.customer_birthday[0]) || "";
      document.getElementById("license_update-customer_phone").value =
        (record.customer_phone && record.customer_phone[0]) || "";
      document.getElementById("license_update-customer_postalcode").value =
        (record.customer_postalcode && record.customer_postalcode[0]) || "";
      document.getElementById("license_update-customer_address").value =
        (record.customer_address && record.customer_address[0]) || "";
      document.getElementById("license_update-customer_email").value =
        (record.customer_email && record.customer_email[0]) || "";
      document.getElementById("license_update-note00").value = 
        (record.note00 && record.note00[0]) || "";
      const prodType = record.product_type ? record.product_type[0] : sessionStorage.getItem("product_type");
      document.getElementById("license_update-product_type").value = prodType;

      // [聯動更新] 將 1D 欄位名稱預設統一設為 "學校名稱" 確保與訂單內容一致
      const updateSchoolLabel = document.getElementById("license_update-customer_name-label");
      const updateSchoolInput = document.getElementById("license_update-customer_name");
      if (updateSchoolLabel) {
        const isZh = (window.localeData && window.localeData.common) ? true : false;
        updateSchoolLabel.textContent = isZh ? "學校名稱" : "School Name";
        if (updateSchoolInput) {
          updateSchoolInput.placeholder = isZh ? "請輸入學校名稱" : "Please enter school name";
        }
      }

      // 處理附件資料
      console.log("[LicenseSelectOne] API 回傳完整資料：", json_object);

      // attachments 格式：["["./attachments/test-jp/20251009/檔名.txt"]", ...]
      // 每個元素都是一個 JSON 字串，包含一個路徑陣列
      if (record.attachments && record.attachments.length > 0) {
        try {
          const allPaths = [];

          // 遍歷 attachments 陣列中的每個元素
          for (let i = 0; i < record.attachments.length; i++) {
            const attachmentStr = record.attachments[i];
            if (attachmentStr && attachmentStr.trim() !== "") {
              try {
                // 解析每個 JSON 字串 (可能是 ["path1", "path2"] 或 "path1")
                const parsed = JSON.parse(attachmentStr);

                // 如果解析結果是陣列，將所有路徑加入
                if (Array.isArray(parsed)) {
                  allPaths.push(...parsed);
                } else if (typeof parsed === "string") {
                  // 如果是單一字串，直接加入
                  allPaths.push(parsed);
                }
              } catch (parseError) {
                console.warn(
                  `無法解析第 ${i} 個附件:`,
                  attachmentStr,
                  parseError,
                );
              }
            }
          }

          console.log("[LicenseSelectOne] 合併後的附件路徑：", allPaths);

          if (allPaths.length > 0) {
            // ✅ 儲存舊附件路徑到全域變數,供更新時使用
            window._existingAttachmentPaths = allPaths;
            console.log(
              "[LicenseSelectOne] 已儲存舊附件路徑到 window._existingAttachmentPaths:",
              allPaths,
            );

            // 將路徑陣列轉換成檔案物件陣列
            const fileList = allPaths.map((path) => {
              // 從路徑中提取檔名
              const fileName = path.split("/").pop();
              return {
                name: fileName,
                path: path,
                url: path, // 可能需要根據實際情況調整 URL
              };
            });
            displayExistingFiles(fileList);
          } else {
            // 沒有舊附件,清空全域變數
            window._existingAttachmentPaths = [];
          }
        } catch (e) {
          console.warn("無法解析附件資料：", e, record.attachments);
        }
      }
    }
  } catch (e) {
    if (e.message !== "Handled Server Error") {
      alert("request error");
    }
  } finally {
    VisibleLoaderElement(false);
  }
}

/* 新增：按「確認」送欄位 + 檔案（若有） */
async function LicenseInsertOne() {
  var license_data = Object.create(LicenseData);

  license_data.owner_cid = document.getElementById(
    "license_insert-owner_cid",
  ).value;
  license_data.agent_cid = sessionStorage.getItem("member_cid");
  license_data.record_state = 1;
  license_data.license_begin_time = document.getElementById(
    "license_insert-license_begin_time",
  ).value;
  license_data.product_type = document.getElementById("license_insert-product_type").value || "avacast";

  // TODO: 檢查日期是不是空值 或是 0000-00-00 之類的
  license_data.license_days = document.getElementById(
    "license_insert-license_days",
  ).value;
  license_data.license_count = document.getElementById(
    "license_insert-license_count",
  ).value;
  license_data.sale_amount = document.getElementById(
    "license_insert-sale_amount",
  ).value;
  license_data.country = document.getElementById(
    "license_insert-country",
  ).value;
  license_data.customer_name = document.getElementById(
    "license_insert-customer_name",
  ).value;
  license_data.customer_gender = document.getElementById(
    "license_insert-customer_gender",
  ).value;
  license_data.customer_birthday = document.getElementById(
    "license_insert-customer_birthday",
  ).value;
  license_data.customer_phone = document.getElementById(
    "license_insert-customer_phone",
  ).value;
  license_data.customer_postalcode = document.getElementById(
    "license_insert-customer_postalcode",
  ).value;
  license_data.customer_address = document.getElementById(
    "license_insert-customer_address",
  ).value;
  license_data.customer_email = document.getElementById(
    "license_insert-customer_email",
  ).value;
  license_data.note00 = document.getElementById("license_insert-note00").value;

  // --- [Ava Classroom 教學組長自動註冊流程] ---
  if (license_data.product_type === "avaclassroom") {
    const teacher_name = (document.getElementById("license_insert-teacher_name")?.value || "").trim();
    const teacher_email = (document.getElementById("license_insert-teacher_email")?.value || "").trim();
    const teacher_password = (document.getElementById("license_insert-teacher_password")?.value || "").trim();
    const teacher_password_confirm = (document.getElementById("license_insert-teacher_password_confirm")?.value || "").trim();

    // 步驟 A：輸入欄位驗證
    if (!teacher_name || !teacher_email || !teacher_password || !teacher_password_confirm) {
      alert(GetLocalData("license.error_empty_teacher"));
      return;
    }
    if (teacher_email.indexOf("@") === -1) {
      alert(GetLocalData("license.error_invalid_email"));
      return;
    }
    if (teacher_password !== teacher_password_confirm) {
      alert(GetLocalData("license.error_password_mismatch"));
      return;
    }

    VisibleLoaderElement(true);

    // 步驟 B：尋找 parent_cid (必須是該組織下具有 tier 3 權限的代理商帳號)
    const userTier = window.sessionStorage.getItem("tier");
    let parent_cid = "";

    try {
      if (userTier === "3") {
        parent_cid = window.sessionStorage.getItem("member_cid");
      } else if (userTier === "1" || userTier === "2") {
        // Sales 或 Admin，向後端查詢該組織 (owner_cid) 下的所有成員帳號
        const target_group_cid = (license_data.owner_cid || "").trim();
        console.log("🚀 [DEBUG] 開始查詢成員，傳入的 group_cid / owner_cid 為:", `"${target_group_cid}"`);

        if (target_group_cid.startsWith("sch_")) {
          // [優化] 如果傳入的是現有的學校群組，直接查詢該群組以取得其上層代理商管理員 (owner_cid)
          await new Promise((resolve) => {
            Cyberspace.Client.SendRequest(
              "/ava_system/group/select_one_record",
              { group_cid: target_group_cid },
              (ok, res) => {
                if (ok) {
                  try {
                    const groupJson = JSON.parse(res);
                    if ((groupJson.errno == 1 || groupJson.errno == 0) && groupJson.records) {
                      const owner = Array.isArray(groupJson.records.owner_cid)
                        ? groupJson.records.owner_cid[0]
                        : (groupJson.records.owner_cid || "");
                      if (owner) {
                        parent_cid = owner.trim();
                        console.log("🚀 [DEBUG] 從現有學校群組資料中找到上層代理商管理員:", parent_cid);
                      }
                    }
                  } catch (e) {
                    console.error("Failed to parse school group owner:", e);
                  }
                }
                resolve();
              }
            );
          });
        }

        if (!parent_cid) {
          const memberList = await new Promise((resolve, reject) => {
            Cyberspace.Client.SendRequest(
              "/ava_system/member/select_all_records",
              {
                condition_type: 5,
                condition_value: target_group_cid,
                search_name: "",
                offset: 0,
                row_count: 100
              },
              (ok, result) => {
                if (!ok) {
                  reject(new Error("網路連線錯誤，無法查詢組織下的成員帳號。"));
                  return;
                }
                try {
                  const json = JSON.parse(result);
                  console.log("🚀 [DEBUG] select_all_records response:", json);
                  if (json.errno == 1 || json.errno == 0) {
                    const m_cids = (json.records && json.records.member_cid) || json.member_cid;
                    const list = Array.isArray(m_cids) ? m_cids : (m_cids ? [m_cids] : []);
                    resolve(list);
                  } else {
                    reject(new Error("後端錯誤代碼: " + json.errno));
                  }
                } catch (e) {
                  reject(new Error("解析組織成員回應失敗。"));
                }
              }
            );
          });

          if (memberList.length === 0) {
            throw new Error("該組織旗下沒有任何成員帳號！");
          }

          // 由於 select_all_records API 內部會抹除 tier 欄位，我們必須對所有成員併發查詢 select_one_record 取得詳細資訊，篩選出 tier === "3" 的代理商管理員
          const details = await Promise.all(
            memberList.map(cid => {
              return new Promise((resolve) => {
                Cyberspace.Client.SendRequest(
                  "/ava_system/member/select_one_record",
                  { member_cid: cid },
                  (ok, res) => {
                    if (ok) {
                      try {
                        const detailJson = JSON.parse(res);
                        console.log("🚀 [DEBUG] select_one_record response for " + cid + ":", detailJson);
                        if (detailJson.errno == 1 || detailJson.errno == 0) {
                          resolve({ cid: cid, detail: detailJson });
                          return;
                        }
                      } catch(e) {}
                    }
                    resolve({ cid: cid, detail: null });
                  }
                );
              });
            })
          );

          for (const item of details) {
            if (item.detail && item.detail.records) {
              const records = item.detail.records;
              const m_tier = Array.isArray(records.tier) ? records.tier[0] : (records.tier || "");
              if (String(m_tier) === "3") {
                parent_cid = item.cid;
                break;
              }
            }
          }
        }

        console.error("🚨 [DEBUG] Found parent_cid =", parent_cid);

        if (!parent_cid) {
          throw new Error("該隸屬組織尚未建立代理商管理員，無法建立教學組長帳號！");
        }
      } else {
        throw new Error("您的帳號權限不足以建立教學組長！");
      }

      if (!parent_cid) {
        throw new Error("找不到上層代理商帳號，無法建立教學組長帳號！");
      }

      // 步驟 B-2：檢查或建立學校群組 (方案 A 優化)
      const school_name = (license_data.customer_name || "").trim();
      if (!school_name) {
        throw new Error("學校名稱（客戶名稱）不得為空！");
      }

      let school_group_cid = "";

      // 先查詢該代理商（owner_cid = parent_cid）旗下的所有 group，檢查有無同名群組
      await new Promise((resolveGroup, rejectGroup) => {
        Cyberspace.Client.SendRequest(
          "/ava_system/group/select_all_records",
          {
            condition_type: "2",
            condition_value: parent_cid,
            offset: 0,
            row_count: 100
          },
          (ok, result) => {
            if (!ok) {
              rejectGroup(new Error("網路連線錯誤，無法查詢已存在的學校群組。"));
              return;
            }
            try {
              const json = JSON.parse(result);
              console.log("🚀 [DEBUG] group select_all_records response:", json);
              if (json.errno == 1 || json.errno == 0) {
                if (json.records) {
                  const names = json.records.group_name || [];
                  const cids = json.records.group_cid || [];
                  const nameList = Array.isArray(names) ? names : (names ? [names] : []);
                  const cidList = Array.isArray(cids) ? cids : (cids ? [cids] : []);

                  for (let i = 0; i < nameList.length; i++) {
                    if (String(nameList[i]).trim() === school_name) {
                      school_group_cid = String(cidList[i]).trim();
                      break;
                    }
                  }
                }
                resolveGroup();
              } else {
                rejectGroup(new Error("查詢已存在群組失敗，後端錯誤碼: " + json.errno));
              }
            } catch (e) {
              rejectGroup(new Error("解析群組查詢回應失敗。"));
            }
          }
        );
      });

      // 若同名群組不存在，則自動新建一個
      if (!school_group_cid) {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random_suffix = Math.random().toString(36).substring(2, 6);
        school_group_cid = `sch_${parent_cid}_${today}_${random_suffix}`;
        console.log(`🚀 [DEBUG] 未找到同名學校，準備新建學校群組，產生的 group_cid 為: ${school_group_cid}`);

        await new Promise((resolveInsert, rejectInsert) => {
          Cyberspace.Client.SendRequest(
            "/ava_system/group/insert_one_record",
            {
              group_cid: school_group_cid,
              group_name: school_name,
              group_type: 0,
              owner_cid: parent_cid,
              record_state: 1,
              contact: teacher_name || license_data.customer_name || "",
              group_ubn: "",
              contact_phone_01: license_data.customer_phone || "",
              contact_email_01: teacher_email || license_data.customer_email || "",
              city: "",
              country: license_data.country || "",
              address: license_data.customer_address || "",
              billing_addr: license_data.customer_address || ""
            },
            (ok, result) => {
              if (!ok) {
                rejectInsert(new Error("網路連線錯誤，無法建立新的學校群組。"));
                return;
              }
              try {
                const json = JSON.parse(result);
                console.log("🚀 [DEBUG] group insert_one_record response:", json);
                if (json.errno == 1 || json.errno == 0) {
                  console.log(`✅ 新建學校群組成功: ${school_name} (${school_group_cid})`);
                  resolveInsert();
                } else {
                  rejectInsert(new Error("建立新學校群組失敗，後端錯誤碼: " + json.errno));
                }
              } catch (e) {
                rejectInsert(new Error("解析建立群組回應失敗。"));
              }
            }
          );
        });
      } else {
        console.log(`✅ 找到同名學校群組，自動沿用 group_cid: ${school_group_cid}`);
      }

      // 將後續流程的群組關聯改為新建立或已存在的學校 group_cid
      license_data.owner_cid = school_group_cid;

      // 將訂單的代理人設為該代理商代表帳號 (代理商的人，如 bigsales)
      if (parent_cid) {
        license_data.agent_cid = parent_cid;
      }

      // 步驟 C：建立教學組長帳號 (Tier 4)
      let isNewAccount = true;
      await new Promise((resolve, reject) => {
        Cyberspace.Client.SendRequest(
          "/ava_system/member/insert_one_record",
          {
            parent_cid: parent_cid,
            member_cid: teacher_email,
            password: teacher_password,
            member_name: teacher_name,
            group_cid: license_data.owner_cid,
            phone_cell: "",
            phone_home: "",
            phone_work: "",
            email: teacher_email,
            address: "",
            city: "",
            country: "",
            gender: "",
            birthday: "1991-01-01",
            note00: "",
            avatar_url: ""
          },
          (ok, result) => {
            if (!ok) {
              reject(new Error("網路連線錯誤，註冊教學組長帳號失敗。"));
              return;
            }
            try {
              const json = JSON.parse(result);
              console.log("🚀 [DEBUG] insert_one_record response:", json);
              if (json.errno == 1 || json.errno == 0) {
                isNewAccount = true;
                resolve();
              } else if (json.errno == -1059) {
                // [修正] 帳號已存在，但 record_state 可能為 0（曾被刪除的教務組任）
                // 必須呼叫 update_one_record 將帳號復原 (record_state=1) 並更新密碼
                console.log("教學組長帳號已存在，嘗試復原 record_state 並更新密碼...");
                isNewAccount = false;
                // 呼叫 update_one_record 復原帳號
                Cyberspace.Client.SendRequest(
                  "/ava_system/member/update_one_record",
                  {
                    member_cid: teacher_email,
                    password: teacher_password,
                    member_name: teacher_name,
                    record_state: 1,  // 強制設回啟用
                    group_cid: license_data.owner_cid,
                    email: teacher_email,
                    birthday: "1991-01-01",
                    phone_cell: "", phone_home: "", phone_work: "",
                    address: "", city: "", country: "", gender: "",
                    note00: "", avatar_url: ""
                  },
                  (ok2, res2) => {
                    try {
                      const j2 = JSON.parse(res2);
                      if (ok2 && (j2.errno == 1 || j2.errno == 0)) {
                        console.log("✅ 教學組長帳號已成功復原 (record_state=1)");
                      } else {
                        console.warn("⚠️ 教學組長帳號復原失敗，errno:", j2?.errno);
                      }
                    } catch(e) {
                      console.warn("⚠️ 解析 update_one_record 回應失敗");
                    }
                    resolve(); // 無論復原是否成功，都繼續新增訂單
                  }
                );
                return; // 等待 update 的 callback 呼叫 resolve()
              } else {
                reject(new Error("後端錯誤代碼: " + json.errno));
              }
            } catch (e) {
              reject(new Error("解析註冊回應失敗。"));
            }
          }
        );
      });

      // 步驟 D：關聯 Email 到訂購人 Email 欄位中
      license_data.customer_email = teacher_email;

    } catch (err) {
      alert(GetLocalData("license.error_create_failed") + err.message);
      VisibleLoaderElement(false);
      return;
    }
  }

  // 取目前選擇的檔案
  var files =
    (window._licenseUploader &&
      window._licenseUploader.getFiles &&
      window._licenseUploader.getFiles()) ||
    [];

  // 組 payload：沒有檔案就不放 files[]
  var payload = Object.assign({}, license_data);
  if (files.length > 0) payload["files[]"] = files;
  console.error("🚨 [DEBUG] Front-end sending payload.agent_cid =", payload.agent_cid, "owner_cid =", payload.owner_cid); // ← 保持這行

  console.log("[LicenseInsertOne] 將送出：", {
    fields: license_data,
    files: files.map((f) => `${f.name} (${f.type || ""}, ${f.size}B)`),
  });

  VisibleLoaderElement(true);
  try {
    // [Phase 4 修復] 修正拼寫錯誤 CsReques -> CsRequest
    await apiCall(CsRequestLicenseInsertOneRecord, payload);
    // 成功後清除檔案
    if (window._licenseUploader && window._licenseUploader.clear)
      window._licenseUploader.clear();

    // 【即時 UI 隱藏與更新】在彈出 alert 之前僅隱藏 Modal，保持 Loading 狀態一轉到底，確保背景乾淨統一
    const modal = document.getElementById("license-insert-modal");
    if (modal) {
      modal.style.display = "none";
    }

    // [優化] 強制即時顯示 Loading 遮罩，繞過預設的 250ms 延遲，防止 native alert 阻塞導致 Loading 未能顯現
    const loader = document.getElementById("initial-loader");
    if (loader) {
      loader.style.display = "flex";
      loader.style.opacity = "1";
    }
    if (typeof _loaderState !== "undefined") {
      _loaderState.isVisible = true;
      _loaderState.activeRequests = 1;
    }

    // 延遲 50ms 以利瀏覽器進行 DOM 隱藏與重繪，確保彈窗時背景乾淨且已有 Loading
    setTimeout(async () => {
      try {
        alert(GetLocalData("common.success"));

        // [終極防禦] 強制將剛新增的產品寫入快取，避免後端資料庫延遲導致抓到舊資料
        try {
          const addedProduct = license_data.product_type;
          const currentOwnedStr = window.sessionStorage.getItem("owned_products");
          let currentOwned = [];
          if (currentOwnedStr) currentOwned = JSON.parse(currentOwnedStr);
          if (!currentOwned.includes(addedProduct)) {
            currentOwned.push(addedProduct);
            window.sessionStorage.setItem("owned_products", JSON.stringify(currentOwned));
          }
        } catch (e) { }

        // [修復 v1.0.11] 改為 fire-and-forget：先換頁，讓背景非同步更新產品快取
        // 舊做法：await RefreshOwnedProductsState() 若 API 失敗會重試等 1 秒，造成用戶感覺「隔 1 秒又 reload」
        RefreshOwnedProductsState(); // fire-and-forget，不阻塞換頁

        // [修復] 為了讓使用者立刻看到新增的產品，跳轉到該產品的頁面
        const addedProduct = license_data.product_type;
        window.sessionStorage.setItem("product_type", addedProduct);
        if (typeof change_page === "function") {
          change_page(`license.html?product=${addedProduct}`);
        } else {
          window.location.href = `license.html?product=${addedProduct}`;
        }
      } catch (err) {
        console.error("Success post-processing error:", err);
      } finally {
        VisibleLoaderElement(false);
      }
    }, 50);
  } catch (e) {
    if (e.message !== "Handled Server Error") {
      alert("request error");
    }
    VisibleLoaderElement(false);
  }
}

async function LicenseUpdateOne() {
  var license_data = Object.create(LicenseData);
  license_data.product_type = sessionStorage.product_type;
  license_data.license_cid = document.getElementById(
    "license_update-license_cid" || "",
  ).value;
  license_data.record_state = document.getElementById(
    "license_update-record_state",
  ).value;
  license_data.owner_cid = document.getElementById(
    "license_update-owner_cid",
  ).value;
  license_data.license_begin_time = document.getElementById(
    "license_update-license_begin_time" || "",
  ).value;
  license_data.license_days = document.getElementById(
    "license_update-license_days",
  )
    ? document.getElementById("license_update-license_days").value
    : new Date().toLocaleDateString("sv-SE");
  license_data.license_count = document.getElementById(
    "license_update-license_count",
  ).value;
  license_data.sale_amount = document.getElementById(
    "license_update-sale_amount",
  ).value;
  license_data.country = document.getElementById(
    "license_update-country",
  ).value;
  license_data.customer_name = document.getElementById(
    "license_update-customer_name" || "",
  ).value;
  license_data.customer_gender = document.getElementById(
    "license_update-customer_gender" || "",
  ).value;
  license_data.customer_birthday = document.getElementById(
    "license_update-customer_birthday" || "",
  ).value;
  license_data.customer_phone = document.getElementById(
    "license_update-customer_phone" || "",
  ).value;
  license_data.customer_postalcode = document.getElementById(
    "license_update-customer_postalcode" || "",
  ).value;
  license_data.customer_address = document.getElementById(
    "license_update-customer_address" || "",
  ).value;
  license_data.customer_email = document.getElementById(
    "license_update-customer_email" || "",
  ).value;
  license_data.note00 = document.getElementById("license_update-note00").value;

  // 取目前選擇的檔案
  console.log("[LicenseUpdateOne] 開始檢查檔案上傳器狀態");
  console.log(
    "[LicenseUpdateOne] window._licenseUploaderUpdate 存在?",
    !!window._licenseUploaderUpdate,
  );
  console.log(
    "[LicenseUpdateOne] window._licenseUploaderUpdate.getFiles 存在?",
    !!(window._licenseUploaderUpdate && window._licenseUploaderUpdate.getFiles),
  );

  var files =
    (window._licenseUploaderUpdate &&
      window._licenseUploaderUpdate.getFiles &&
      window._licenseUploaderUpdate.getFiles()) ||
    [];

  console.log("[LicenseUpdateOne] 取得的新檔案數量:", files.length);
  console.log("[LicenseUpdateOne] 新檔案列表:", files);

  // 取得舊附件路徑
  var existingPaths = window._existingAttachmentPaths || [];
  console.log("[LicenseUpdateOne] 取得的舊附件路徑數量:", existingPaths.length);
  console.log("[LicenseUpdateOne] 舊附件路徑:", existingPaths);

  // ⭐ 合併舊附件路徑 + 新檔案名稱
  var allAttachmentInfo = [...existingPaths]; // 先複製舊路徑

  // 如果有新檔案，加入新檔案的名稱到 allAttachmentInfo
  if (files.length > 0) {
    files.forEach(function (file) {
      // 新檔案只記錄檔名（後端會處理上傳並生成路徑）
      allAttachmentInfo.push({
        type: "new_file",
        name: file.name,
        size: file.size,
      });
    });
  }

  console.log("[LicenseUpdateOne] 合併後的附件資訊:", allAttachmentInfo);

  // 組 payload：合併新檔案和舊附件路徑
  var payload = Object.assign({}, license_data);

  // 如果有新檔案，加入 files[] 欄位
  if (files.length > 0) {
    payload["files[]"] = files;
    console.log("[LicenseUpdateOne] 已將新檔案加入 payload, key: files[]");
  }

  // ⭐ 將「舊路徑 + 新檔案資訊」一起加入 existing_attachments
  if (allAttachmentInfo.length > 0) {
    payload["existing_attachments"] = JSON.stringify(allAttachmentInfo);
    console.log(
      "[LicenseUpdateOne] 已將完整附件資訊加入 payload, key: existing_attachments",
    );
  }

  console.log("[LicenseUpdateOne] 將送出:", {
    fields: license_data,
    hasNewFiles: files.length > 0,
    newFileCount: files.length,
    newFiles: files.map((f) => `${f.name} (${f.type || ""}, ${f.size}B)`),
    hasExistingAttachments: existingPaths.length > 0,
    existingAttachmentCount: existingPaths.length,
    existingAttachments: existingPaths,
  });

  // ⭐ 最終確認：檢查 payload 中是否真的有 existing_attachments
  console.log("[LicenseUpdateOne] ⭐ 最終 payload 檢查:");
  console.log("  - payload 包含 files[]?", "files[]" in payload);
  console.log(
    "  - payload 包含 existing_attachments?",
    "existing_attachments" in payload,
  );
  if ("existing_attachments" in payload) {
    console.log(
      "  - existing_attachments 值:",
      payload["existing_attachments"],
    );
  }

  VisibleLoaderElement(true);
  try {
    await apiCall(CsRequestLicenseUpdateOneRecord, payload);
    // 成功後清除檔案
    if (window._licenseUploaderUpdate && window._licenseUploaderUpdate.clear)
      window._licenseUploaderUpdate.clear();

    alert(GetLocalData("common.success"));

    // 隱藏 modal
    const modal = document.getElementById("license-update-modal");
    if (modal) {
      modal.style.display = "none";
    }

    // 重新載入訂單列表
    LicenseSelectAll();
  } catch (e) {
    if (e.message !== "Handled Server Error") {
      alert("request error");
    }
  } finally {
    VisibleLoaderElement(false);
  }
}

// 初始化整個 View 的函數，確保相依性載入後才執行
async function initLicenseView() {
  console.log("License View Initializing...");

  // i18n 渲染 (必須在 Core Dependencies 載入後執行)
  const lang = window.localStorage.getItem("language") || "zh-tw";
  if (typeof renderTemplate === "function") {
    await renderTemplate(lang, "app");
  }

  // [修正] 取得 URL 參數並初始化導覽列 (修復 License menu bar 消失的問題)
  const urlParams = new URLSearchParams(window.location.search);
  const product = urlParams.get("product");
  configureListPageForProduct(product);

  showTemplate("app");

  // [新增] 移除靜態 Loading 遮罩
  // 交由後續 API (LicenseSelectAll) 的 VisibleLoaderElement 自動接管隱藏

  // [整合] 初始化按鈕 Hover 效果
  const hoverButtons = [
    {
      id: "license_list-button-gotopage_insert",
      iconId: "license_insert_button_icon",
      hover: "assets/images/information_button_orange.png",
      normal: "assets/images/Group 607.svg",
    },
    {
      id: "license-edit-button",
      iconId: "license-edit-icon",
      hover: "assets/images/edit_button_change.png",
      normal: "assets/images/edit.svg",
    },
    {
      id: "license-download-button",
      iconId: "license-download-icon",
      hover: "assets/images/dowload_button_change.png",
      normal: "assets/images/download.svg",
    },
    {
      id: "license-download-all-button",
      iconId: "license-download-all-icon",
      hover: "assets/images/download_all_white.svg",
      normal: "assets/images/download_all_light_blue.svg",
    },
  ];

  hoverButtons.forEach((btn) => {
    const element = document.getElementById(btn.id);
    const icon = document.getElementById(btn.iconId);
    if (element && icon) {
      element.addEventListener("mouseenter", () => {
        icon.src = btn.hover;
      });
      element.addEventListener("mouseleave", () => {
        icon.src = btn.normal;
      });
    }
  });

  // 初始化拖曳/點選（使用你 lib.js 的 EnableDragFile）
  // 新增訂單 Modal
  try {
    window._licenseUploader = EnableDragFile({
      scope: "#license-insert-modal",
      cssScope: "#license-insert-modal",
      dropzone: "#dropzone",
      fileInput: "#fileInput",
      listEl: "#fileList",
      accept: (f) => f.size <= 50 * 1024 * 1024,
      maxFiles: 50,
      onChange: (files, meta) => {
        const names = Array.from(files).map((f) => f.name);
        const how = meta && meta.source === "drop" ? "拖曳" : "選擇";
        console.log(`${how} [ ${names.join(", ")} ] 成功`);
      },
      onError: (msg) => console.error("[uploader:error]", msg),
    });

    const btnClear = document.querySelector("#license-insert-modal #btnClear");
    if (btnClear)
      btnClear.addEventListener("click", () =>
        window._licenseUploader?.clear?.(),
      );
  } catch (e) {
    console.warn("[Upload init license-insert-modal] skipped:", e);
  }

  // 編輯訂單 Modal
  try {
    window._licenseUploaderUpdate = EnableDragFile({
      scope: "#license-update-modal",
      cssScope: "#license-update-modal",
      dropzone: "#dropzone-update",
      fileInput: "#fileInput-update",
      listEl: "#fileList-update",
      accept: (f) => f.size <= 50 * 1024 * 1024,
      maxFiles: 50,
      onChange: (files, meta) => {
        const names = Array.from(files).map((f) => f.name);
        const how = meta && meta.source === "drop" ? "拖曳" : "選擇";
        console.log(`${how} [ ${names.join(", ")} ] 成功`);

        // If new files are added, clear existing ones.
        if (files.length > 0) {
          console.log(
            "[License Update] New files added. Clearing existing attachments.",
          );

          // 1. Clear the UI for existing files
          const existingFileListEl = document.querySelector(
            "#license-update-modal #existingFileList-update",
          );
          if (existingFileListEl) {
            existingFileListEl.innerHTML = "";
          }

          // 2. Clear the data for existing files
          window._existingAttachmentPaths = [];
        }
      },
      onError: (msg) => console.error("[uploader update:error]", msg),
    });
  } catch (e) {
    console.warn("[Upload init license-update-modal] skipped:", e);
  }

  // 預設資料（組織、查詢期間）
  {
    let group_cid = window.sessionStorage.getItem("group_cid");
    if (!IsValidString(group_cid)) {
      alert(window.localeData.warring.no_group_cid);
      change_page("home.html");
      return;
    }
    // document.getElementById("license_list-input_search_field").value = _k_search_condition_type_by_owner_cid;
    // document.getElementById("license_list-input_search_value").value = group_cid;
    document.getElementById("license_insert-owner_cid").value = group_cid;
  }

  const beginTimeEl = document.getElementById("license_list-begin_time");
  const endTimeEl = document.getElementById("license_list-end_time");

  // 檢查 sessionStorage 中是否有儲存的日期
  const savedBeginTime = sessionStorage.getItem("dashboard_begin_time");
  const savedEndTime = sessionStorage.getItem("dashboard_end_time");

  if (savedBeginTime && savedEndTime) {
    // 如果有儲存的日期，則使用
    if (beginTimeEl) beginTimeEl.value = savedBeginTime;
    if (endTimeEl) endTimeEl.value = savedEndTime;
    console.log(
      "license.html: 從 sessionStorage 載入日期:",
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

  // 綁定按鈕
  /* This button does not exist in license.html, but the logic is kept for consistency */
  document
    .getElementById("license_list-button-search")
    ?.addEventListener("click", () => LicenseSelectAll());
  document
    .getElementById("license_insert-button-ok")
    ?.addEventListener("click", () => LicenseInsertOne());
  document
    .getElementById("license_update-button-ok")
    ?.addEventListener("click", () => LicenseUpdateOne());
  document
    .getElementById("license_list-button-gotopage_insert")
    ?.addEventListener("click", () => GotoPageLicenseInsertOne());
  document
    .getElementById("license_insert-button-cancel")
    ?.addEventListener("click", () => {
      // 取消時清空新增頁面的檔案
      if (window._licenseUploader && window._licenseUploader.clear) {
        window._licenseUploader.clear();
      }
      // 隱藏 modal
      const modal = document.getElementById("license-insert-modal");
      if (modal) {
        modal.style.display = "none";
      }
    });
  document
    .getElementById("license_insert-close")
    ?.addEventListener("click", () => {
      // 關閉時清空新增頁面的檔案
      if (window._licenseUploader && window._licenseUploader.clear) {
        window._licenseUploader.clear();
      }
      // 隱藏 modal
      const modal = document.getElementById("license-insert-modal");
      if (modal) {
        modal.style.display = "none";
      }
    });
  document
    .getElementById("license_update-button-cancel")
    ?.addEventListener("click", () => {
      // ⭐ 編輯頁面取消時「不清空」檔案，保留使用者選擇的附件
      // 隱藏 modal
      const modal = document.getElementById("license-update-modal");
      if (modal) {
        modal.style.display = "none";
      }
    });
  document
    .getElementById("license_update-close")
    ?.addEventListener("click", () => {
      // 關閉時隱藏 modal
      const modal = document.getElementById("license-update-modal");
      if (modal) {
        modal.style.display = "none";
      }
    });


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

  // 日期搜尋按鈕
  let dateSearchButton = document.getElementById(
    "license_list-button-date_search",
  );
  if (dateSearchButton) {
    dateSearchButton.addEventListener("click", function () {
      console.log("日期搜尋按鈕點擊");
      // 將當前選擇的日期儲存到 sessionStorage
      const beginTimeVal = document.getElementById(
        "license_list-begin_time",
      ).value;
      const endTimeVal = document.getElementById("license_list-end_time").value;
      if (beginTimeVal && endTimeVal) {
        sessionStorage.setItem("dashboard_begin_time", beginTimeVal);
        sessionStorage.setItem("dashboard_end_time", endTimeVal);
      }
      // 保存搜尋關鍵字到 sessionStorage
      const nameInput = document.getElementById("license_list-customer_name");
      if (nameInput) {
        sessionStorage.setItem("license_search_keyword", (nameInput.value || "").trim());
      }
      LicenseSelectAll();
    });
  }

  // [新增] 訂購人名稱搜尋欄位 (按下 Enter 觸發搜尋)
  const customerNameSearchInput = document.getElementById(
    "license_list-customer_name",
  );
  if (customerNameSearchInput) {
    customerNameSearchInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault(); // 避免表單提交等預設行為
        console.log("訂購人搜尋觸發");
        sessionStorage.setItem("license_search_keyword", (customerNameSearchInput.value || "").trim());
        LicenseSelectAll({ page: 1 });
      }
    });
  }

  // [新增] 訂購人名稱清除搜尋按鈕
  const customerNameClearBtn = document.getElementById(
    "license_list-customer_name-clear",
  );
  if (customerNameClearBtn) {
    customerNameClearBtn.addEventListener("click", function () {
      const nameInput = document.getElementById("license_list-customer_name");
      if (nameInput) {
        nameInput.value = "";
      }
      sessionStorage.removeItem("license_search_keyword");
      customerNameClearBtn.style.display = "none";
      LicenseSelectAll({ page: 1 });
    });
  }

  // 全選 checkbox 事件
  const selectAllCheckbox = document.getElementById("license-select-all");
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", function () {
      const rowCheckboxes = document.querySelectorAll(".license-row-checkbox");
      rowCheckboxes.forEach((cb) => {
        cb.checked = this.checked;
      });
    });
  }

  // 點擊 modal 背景關閉 modal
  const insertModal = document.getElementById("license-insert-modal");
  if (insertModal) {
    insertModal.addEventListener("click", (e) => {
      // 只在點擊背景時關閉，不在點擊內容時關閉
      if (e.target === insertModal) {
        if (window._licenseUploader && window._licenseUploader.clear) {
          window._licenseUploader.clear();
        }
        insertModal.style.display = "none";
      }
    });
  }

  // 點擊編輯 modal 背景關閉 modal
  const updateModal = document.getElementById("license-update-modal");
  if (updateModal) {
    updateModal.addEventListener("click", (e) => {
      // 只在點擊背景時關閉，不在點擊內容時關閉
      if (e.target === updateModal) {
        updateModal.style.display = "none";
      }
    });
  }

  // [修正] 頁面載入時，直接執行搜尋邏輯，而不是模擬點擊。
  // 這能確保狀態儲存和資料查詢的行為與手動點擊一致，且更穩定。
  console.log("license.html: 頁面載入完成，自動執行搜尋。");
  // 1. 將當前日期儲存到 sessionStorage (模擬點擊按鈕的第一步)
  const beginTimeVal = document.getElementById(
    "license_list-begin_time",
  )?.value;
  const endTimeVal = document.getElementById("license_list-end_time")?.value;
  if (beginTimeVal && endTimeVal) {
    sessionStorage.setItem("dashboard_begin_time", beginTimeVal);
    sessionStorage.setItem("dashboard_end_time", endTimeVal);
  }
  // 2. 執行查詢
  LicenseSelectAll();

  // [新增] 更新頁面標題，取代 HTML 中的內聯腳本
  if (typeof updatePageTitleWithGroupCid === "function") {
    updatePageTitleWithGroupCid("#license-title", "", "");
  }

  // [優化] 移除不必要的 setTimeout，確保事件精準綁定
  if (typeof addOrganizationEditClickToTitle === "function") {
    addOrganizationEditClickToTitle();
  }

  // [Phase 2 優化] 統一綁定靜態按鈕與表頭排序事件，消除 CSP unsafe-inline 風險
  if (window._licenseStaticEventController)
    window._licenseStaticEventController.abort();
  window._licenseStaticEventController = new AbortController();
  const staticSignal = window._licenseStaticEventController.signal;

  const bindClick = (id, handler) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", handler, { signal: staticSignal });
  };

  bindClick("license-edit-button", editSelectedRecord);
  bindClick("license-download-button", downloadSelectedAttachments);
  bindClick("license-download-all-button", downloadAllLicenses);
  bindClick("license-delete-button", closeSelectedRecords);

  document.querySelectorAll("th[data-sort]").forEach((th) => {
    th.addEventListener("click", () => sortLicenseTable(th.dataset.sort), {
      signal: staticSignal,
    });
  });
}

// [修復] 更新全域產品快取，讓 Navbar 即時同步新產品/刪除產品狀態
async function RefreshOwnedProductsState(retries = 3) {
  return new Promise((resolve) => {
    if (!window.Cyberspace || !window.Cyberspace.Client) {
      resolve();
      return;
    }
    const target_group_cid = sessionStorage.getItem("group_cid") || sessionStorage.getItem("member_cid");

    const attemptRequest = (attemptsLeft) => {
      Cyberspace.Client.SendRequest(
        "/ava_system/group/get_owned_products",
        { target_group_cid: target_group_cid },
        (error, result) => {
          if (!error && result) {
            try {
              const resJson = typeof result === "string" ? JSON.parse(result) : result;
              if (Number(resJson.errno) >= 0) {
                let rawProds = resJson.owned_products || (resJson.records && resJson.records.owned_products);
                let prods = Array.isArray(rawProds) ? rawProds.flat(Infinity) : [];
                // [防呆] 當沒有任何擁有產品時，預設給予保底產品，避免 UI (Navbar 等) 全滅與換頁空白
                if (prods.length === 0) {
                  prods = ["avacast"];
                }
                window.sessionStorage.setItem("owned_products", JSON.stringify(prods));
                resolve();
                return;
              }
            } catch (e) {
              console.error("🚨 [RefreshOwnedProductsState] 解析錯誤:", e);
            }
          }

          // 如果發生錯誤 (例如 502 Bad Gateway) 且還有重試次數，則等待 1 秒後重試
          if (attemptsLeft > 0) {
            console.warn(`🚨 [RefreshOwnedProductsState] API 失敗，1 秒後進行重試... (剩餘次數: ${attemptsLeft})`);
            setTimeout(() => attemptRequest(attemptsLeft - 1), 1000);
          } else {
            console.error(`🚨 [RefreshOwnedProductsState] API 最終失敗，放棄重試。`);
            resolve();
          }
        }
      );
    };

    attemptRequest(retries);
  });
}

// -----------------------------------------------------------
// 以下為訂單新增/修改/刪除主邏輯依賴狀態管理：確保核心函式庫載入後才綁定 DOMContentLoaded
// -----------------------------------------------------------
function startLicenseApp() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLicenseView);
  } else {
    initLicenseView();
  }
}

if (window._CoreLoaded) {
  startLicenseApp();
} else {
  window.addEventListener("CoreDependenciesReady", startLicenseApp);
}

// 【新增】輔助函數：計算並顯示 YoY
function calculateAndDisplayYoY(allRecords) {
  const today = new Date();
  const lastYearSameDate = new Date();
  lastYearSameDate.setFullYear(today.getFullYear() - 1);

  let active_total_today = 0;
  let active_total_last_year = 0;

  for (let i = 0; i < allRecords.license_count.length; i++) {
    if (allRecords.record_state[i] == "1") {
      const licenseCount = parseInt(allRecords.license_count[i]) || 0;
      const beginTime = new Date(allRecords.license_begin_time[i]);
      const licenseDays = parseInt(allRecords.license_days[i]) || 0;
      let endTime = new Date(beginTime);
      endTime.setDate(endTime.getDate() + licenseDays);

      if (beginTime <= today && endTime >= today) {
        active_total_today += licenseCount;
      }
      if (beginTime <= lastYearSameDate && endTime >= lastYearSameDate) {
        active_total_last_year += licenseCount;
      }
    }
  }

  const growthContainer = document.getElementById("license-total-growth-rate");
  const growthPercentageElement = document.getElementById(
    "license-total-growth-percentage",
  );
  const growthIconElement = document.getElementById(
    "license-total-growth-icon",
  );

  if (active_total_last_year === 0) {
    if (growthContainer) growthContainer.style.display = "none";
  } else {
    const growthRate =
      ((active_total_today - active_total_last_year) / active_total_last_year) *
      100;
    const growthRateFormatted = Math.abs(growthRate).toFixed(1);

    if (growthPercentageElement) {
      growthPercentageElement.textContent = `${growthRate >= 0 ? "+" : "-"}${growthRateFormatted}%`;
      growthPercentageElement.style.color = "#1c1c1c";
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

// 【新增】輔助函數：計算並顯示 QoQ
function calculateAndDisplayQoQ(allRecords) {
  const currentDate = new Date();
  const currentQuarterStart = getQuarterStartDate(currentDate);
  const lastQuarterEnd = new Date(currentQuarterStart);
  lastQuarterEnd.setDate(lastQuarterEnd.getDate() - 1);
  const lastQuarterStart = getQuarterStartDate(lastQuarterEnd);

  let quarterlyLicenseCount = 0;
  let lastQuarterCount = 0;

  if (allRecords.license_count && allRecords.create_time) {
    for (let i = 0; i < allRecords.license_count.length; i++) {
      if (allRecords.record_state[i] == "1") {
        const createTime = new Date(allRecords.create_time[i]);
        const count = parseInt(allRecords.license_count[i]) || 0;

        if (createTime >= currentQuarterStart && createTime <= currentDate) {
          quarterlyLicenseCount += count;
        }
        if (createTime >= lastQuarterStart && createTime <= lastQuarterEnd) {
          lastQuarterCount += count;
        }
      }
    }
  }

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
        ((quarterlyLicenseCount - lastQuarterCount) / lastQuarterCount) * 100;
      const growthRateFormatted = Math.abs(growthRate).toFixed(1);
      quarterlyGrowthPercentageEl.textContent = `${growthRate >= 0 ? "+" : "-"}${growthRateFormatted}%`;
      quarterlyGrowthIconEl.src =
        growthRate >= 0 ? "assets/images/up.svg" : "assets/images/down.svg";
    }
  }
  return quarterlyLicenseCount;
}

// 【新增】輔助函數：前端條件過濾 (日期 + 訂購人名稱)
function filterRecordsByConditions(
  allRecords,
  target_b_date,
  target_e_date,
  customerNameKeyword,
) {
  if (!allRecords || !allRecords["license_begin_time"]) {
    return {};
  }

  const validIndices = [];
  const startDates = allRecords["license_begin_time"];
  const daysList = allRecords["license_days"];
  const customerNames = allRecords["customer_name"]; // 假設後端有回傳此欄位

  for (let i = 0; i < startDates.length; i++) {
    const s_str = startDates[i];
    if (s_str) {
      const orderStartDate = s_str.substring(0, 10);
      let orderEndDate = orderStartDate;
      if (daysList && daysList[i]) {
        const days = parseInt(daysList[i]);
        if (!isNaN(days) && days > 0) {
          const startDateObj = new Date(s_str.replace(/-/g, "/"));
          startDateObj.setDate(startDateObj.getDate() + days);
          orderEndDate = startDateObj.toISOString().substring(0, 10);
        }
      }

      // 日期判斷
      const isDateMatch =
        orderStartDate <= target_e_date && orderEndDate >= target_b_date;

      // 訂購人名稱判斷
      let isNameMatch = true;
      if (customerNameKeyword && customerNameKeyword.trim() !== "") {
        // customerNames 可能為 null 或 undefined，需做防護
        const name =
          customerNames && customerNames[i]
            ? customerNames[i].toString().toLowerCase()
            : "";
        const keyword = customerNameKeyword.trim().toLowerCase();
        if (!name.includes(keyword)) {
          isNameMatch = false;
        }
      }

      if (isDateMatch && isNameMatch) {
        validIndices.push(i);
      }
    }
  }

  const filtered_tablesi = {};
  const keys = Object.keys(allRecords);
  keys.forEach((key) => {
    filtered_tablesi[key] = [];
    const originalArray = allRecords[key];
    if (Array.isArray(originalArray)) {
      validIndices.forEach((idx) => {
        filtered_tablesi[key].push(originalArray[idx]);
      });
    }
  });
  return filtered_tablesi;
}

// 【新增】輔助函數：對 records 物件進行切片
function sliceTablesi(tablesi, offset, limit) {
  const sliced_tablesi = {};
  const keys = Object.keys(tablesi);
  if (keys.length === 0) return {};
  const total = tablesi[keys[0]] ? tablesi[keys[0]].length : 0;
  const end = Math.min(offset + limit, total);

  keys.forEach((key) => {
    if (Array.isArray(tablesi[key])) {
      sliced_tablesi[key] = tablesi[key].slice(offset, end);
    }
  });
  return sliced_tablesi;
}

// 【新增】輔助函數：渲染表格
function renderTable(json_tablesi) {
  // [修復] 同步寫入全域快取，確保「學校篩選」下拉選單能抓到最新載入的學校清單
  window._allLicenseRecordsCache = json_tablesi;

  const element_table = document.getElementById(
    "license_list-list_information",
  );
  if (!element_table) return;

  // [新增] 權限判斷
  const userTier = window.sessionStorage.getItem("tier");
  const isDistributor = userTier === "3";

  // [新增] 處理表頭顯示：如果是經銷商，隱藏「訂購人名稱」表頭
  // 「訂購人名稱」是第 3 個 th (索引 2)，因為前面有 空白(Checkbox) 和 建立時間
  const thead = element_table.querySelector("thead");
  if (thead) {
    const customerTh = thead.rows[0].cells[2];
    if (customerTh) {
      customerTh.style.display = isDistributor ? "none" : "";
      
      // [優化] 動態更新表頭名稱，配合不同產品切換「學校名稱」或「客戶名稱」，消除 AVACAST 下的錯亂感
      const currentProduct = new URLSearchParams(window.location.search).get("product") || window.sessionStorage.getItem("product_type");
      const isZh = (window.localStorage.getItem("language") || "zh-tw") === "zh-tw";
      if (currentProduct === "avaclassroom") {
        customerTh.textContent = isZh ? "學校名稱" : "School Name";
      } else {
        customerTh.textContent = isZh ? "客戶名稱" : "Customer Name";
      }
    }
  }

  if (
    !json_tablesi ||
    !json_tablesi.license_cid ||
    json_tablesi.license_cid.length === 0
  ) {
    let tbody = element_table.querySelector("tbody");
    if (tbody) tbody.innerHTML = "";
    return;
  }

  const tableii = TablesiToTableii(key_license_list_info, json_tablesi);
  create_Json2DArrayToTable(element_table, tableii);

  let tbody = element_table.querySelector("tbody");
  if (tbody) {
    let rows = tbody.querySelectorAll("tr");
    rows.forEach((row, rowIndex) => {
      if (json_tablesi.record_state[rowIndex] == "0") {
        row.style.display = "none";
        return;
      }

      row.cells[0].textContent = row.cells[0].textContent.substring(0, 10);
      row.cells[2].textContent = row.cells[2].textContent.substring(0, 10);
      row.cells[3].style.color = "#97AAC2";
      row.cells[3].textContent += " 天";
      row.cells[4].style.color = "#97AAC2";

      // [新增] 如果是經銷商，隱藏「訂購人名稱」欄位 (row.cells[1])
      // 注意：這是在插入 Checkbox 之前，所以索引是 1 (CreateTime 是 0, CustomerName 是 1)
      if (isDistributor) {
        row.cells[1].style.display = "none";
      }

      const license_cid = json_tablesi.license_cid[rowIndex];
      const record_state = json_tablesi.record_state[rowIndex];
      const product_type = json_tablesi.product_type ? json_tablesi.product_type[rowIndex] : "";
      const customer_name = json_tablesi.customer_name ? json_tablesi.customer_name[rowIndex] : "";

      // [資安與效能優化] 替換 innerHTML 拼接
      const inputCheck = DOMUtil.create("input", {
        type: "checkbox",
        className: "license-row-checkbox",
        "data-license-cid": license_cid,
        "data-record-state": record_state,
        "data-product-type": product_type,
        "data-customer-name": customer_name,
      });
      let newCellCheckbox = DOMUtil.create("td", null, inputCheck);
      row.insertBefore(newCellCheckbox, row.cells[0]);

      const begin_time = new Date(row.cells[3].textContent);
      const license_days = parseInt(row.cells[4].textContent, 10);
      let end_day = DateAdd("d", license_days, begin_time);
      if (license_days !== 0) {
        end_day = SetToEndOfDay(end_day);
      }

      let newCellExpire = document.createElement("td");
      newCellExpire.textContent = FormatDateTime(end_day).substring(0, 10);
      row.insertBefore(newCellExpire, row.cells[5]);

      let newCellStatus = document.createElement("td");
      if (IsAfterToday(end_day)) {
        newCellStatus.textContent = window.localeData.license.active;
      } else {
        const spanStatus = DOMUtil.create(
          "span",
          { style: "color:#404040" },
          window.localeData.license.expired,
        );
        newCellStatus.appendChild(spanStatus);
        row.style.backgroundColor = "#D9DDE3";
      }
      row.insertBefore(newCellStatus, row.cells[6]);

      let newCellNote = document.createElement("td");
      const noteValue = json_tablesi.note00
        ? json_tablesi.note00[rowIndex]
        : null;
      const attachmentValue = json_tablesi.attachments
        ? json_tablesi.attachments[rowIndex]
        : null;
      if (
        (noteValue && noteValue.trim() !== "") ||
        (attachmentValue &&
          attachmentValue.trim() !== "" &&
          attachmentValue.trim() !== "[]")
      ) {
        const imgNote = DOMUtil.create("img", {
          src: "assets/images/Memo.svg",
          alt: "備註",
        });
        newCellNote.appendChild(imgNote);
      }
      row.insertBefore(newCellNote, row.cells[8]);

      // [修復] 將 list_dashboard 改為 dashboard，補上 product 參數，並攔截點擊事件切換組織
      const productType =
        window.sessionStorage.getItem("product_type") || "avacast";
      const dashboardUrl = `dashboard.html?product=${encodeURIComponent(productType)}&license_cid=${encodeURIComponent(license_cid)}&begin_time=${encodeURIComponent(row.cells[3].textContent)}&end_time=${encodeURIComponent(row.cells[5].textContent)}&license_count=${encodeURIComponent(row.cells[7].textContent)}`;

      const imgDash = DOMUtil.create("img", {
        src: "assets/images/dashboard.svg",
        alt: "Dashboard",
      });
      const aDash = DOMUtil.create("a", { href: "#" }, imgDash);
      aDash.onclick = (e) => {
        e.preventDefault();
        const rowOwnerCid = json_tablesi.owner_cid
          ? json_tablesi.owner_cid[rowIndex]
          : null;
        if (rowOwnerCid) {
          window.sessionStorage.setItem("select_group_cid", rowOwnerCid);
          window.sessionStorage.setItem("group_cid", rowOwnerCid);
        }
        window.location.href = dashboardUrl;
      };
      row.cells[9].innerHTML = "";
      row.cells[9].appendChild(aDash);
    });

  }
}

// 排序表格函數
function sortLicenseTable(field) {
  // 切換排序順序
  if (currentSortField === field) {
    currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
  } else {
    currentSortField = field;
    currentSortOrder = "desc";
  }

  // 更新排序圖標
  updateSortIcons(field, currentSortOrder);

  // 對表格數據進行排序 (改為呼叫 API 重新取得排序後的資料)
  LicenseSelectAll({ page: 1 });
}

// 更新排序圖標
function updateSortIcons(activeField, order) {
  // 重置所有圖標
  const sortIcons = [
    "create_time",
    "customer_name",
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

// 顯示編輯列表彈出視窗
function showEditList() {
  const container = document.getElementById("edit-list-container");
  if (container) {
    container.style.display = "flex";

    // 點擊背景關閉彈出視窗
    container.addEventListener("click", function (e) {
      if (e.target === container) {
        hideEditList();
      }
    });

    // 為關閉按鈕添加事件（如果 edit-list 組件中有的話）
    const closeBtn = container.querySelector(".close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", hideEditList);
    }

    // 為取消按鈕添加事件
    const cancelBtn = container.querySelector(".btn.cancel");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", hideEditList);
    }
  }
}

// 隱藏編輯列表彈出視窗
function hideEditList() {
  const container = document.getElementById("edit-list-container");
  if (container) {
    container.style.display = "none";
  }
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

// 篩選授權狀態
function filterLicenseByStatus(status) {
  currentLicenseFilter = status;

  // 呼叫 API 重新取得過濾後的資料
  LicenseSelectAll({ page: 1 });

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

// 編輯選中的項目
function editSelectedRecord() {
  const checkboxes = document.querySelectorAll(".license-row-checkbox:checked");

  if (checkboxes.length === 0) {
    alert("請選擇要編輯的項目");
    return;
  }

  if (checkboxes.length > 1) {
    alert("請只選擇一個項目進行編輯");
    return;
  }

  const licenseCid = checkboxes[0].getAttribute("data-license-cid");
  GotoPageLicenseUpdateOne(licenseCid);
}

// 生成訂單資料的 Excel 檔案
async function generateOrdersExcel(ordersList) {
  console.log("[generateOrdersExcel] 開始生成 Excel，筆數:", ordersList.length);

  // [Plan 2 優化] 惰性載入 SheetJS (XLSX)，使用原生 Promise 確保絕對載入完成
  if (typeof XLSX === 'undefined') {
    VisibleLoaderElement(true);
    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "vender/node_modules/xlsx/dist/xlsx.full.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error("Failed to load XLSX library:", error);
      alert("匯出功能載入失敗，請稍後再試。");
      return;
    } finally {
      VisibleLoaderElement(false);
    }
  }

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
        } catch (e) { }
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

  // 使用 setTimeout 讓 UI 有機會顯示 Loading (雖然運算很快)
  setTimeout(() => {
    const allOrders = [];
    const cache = window._allLicenseRecordsCache;

    // 檢查 cache 是否有效
    if (cache && cache.license_cid) {
      licenseCids.forEach((cid) => {
        // 在快取中尋找該 ID 的索引
        const idx = cache.license_cid.indexOf(cid);
        if (idx !== -1) {
          const record = {};
          // 將 Column-Oriented (欄位陣列) 轉為 Row-Oriented (單筆物件)
          // 這是為了符合 generateOrdersExcel 的輸入格式
          Object.keys(cache).forEach((key) => {
            if (Array.isArray(cache[key])) {
              // 保持陣列格式 [value]，因為 generateOrdersExcel 預期欄位值是陣列
              record[key] = [cache[key][idx]];
            }
          });
          // 注入 ID
          record._license_cid = cid;
          allOrders.push(record);
        } else {
          console.warn(`Cache miss for license_cid: ${cid}`);
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

// [重構] 匯出所有訂單 (非同步串流架構與進度條輪詢)
async function downloadAllLicenses() {
  const b_time_el = document.getElementById("license_list-begin_time");
  const e_time_el = document.getElementById("license_list-end_time");
  let target_b_date = b_time_el ? b_time_el.value : "1900-01-01";
  let target_e_date = e_time_el ? e_time_el.value : "2999-12-31";
  target_b_date = target_b_date.replace(/\//g, "-");
  target_e_date = target_e_date.replace(/\//g, "-");
  let b_time = target_b_date + " 00:00:00";
  let e_time = target_e_date + " 23:59:59";

  const customerNameInput = document.getElementById(
    "license_list-customer_name",
  );
  const customerNameKeyword = customerNameInput ? customerNameInput.value : "";

  let member_cid = window.sessionStorage.getItem("member_cid") || "";
  let group_cid =
    window.sessionStorage.getItem("select_group_cid") ||
    window.sessionStorage.getItem("group_cid") ||
    "";
  let product_type = window.sessionStorage.getItem("product_type") || "";
  const isDistributor = window.sessionStorage.getItem("tier") === "3";

  let condition_type = isDistributor
    ? window._k_search_condition_type_by_agent_cid__and__owner_cid__and__record_state__and__product_type ||
    "16"
    : window._k_search_condition_type_by_agent_cid__and__owner_cid__and__record_state__and__product_type__and__like_customer_name ||
    "18";
  let condition_value = isDistributor
    ? `%%;${group_cid.trim()};1;${product_type.trim()}`
    : `${member_cid.trim()};${group_cid.trim()};1;${product_type.trim()};${customerNameKeyword.trim()}`;

  // [資安與UI防護] 確保舊的遮罩已移除，防止疊加
  const oldOverlay = document.getElementById("license-export-overlay");
  if (oldOverlay) oldOverlay.remove();

  // 動態建立進度條 UI 防範 XSS
  const overlay = document.createElement("div");
  overlay.id = "license-export-overlay";
  overlay.style.cssText =
    "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:10000; display:flex; justify-content:center; align-items:center;";
  const box = document.createElement("div");
  box.style.cssText =
    "background:white; padding:30px; border-radius:12px; width:400px; text-align:center; box-shadow:0 4px 20px rgba(0,0,0,0.2); font-family: sans-serif;";
  box.innerHTML = `
      <h3 style="margin:0 0 10px 0; color:#214f7c; font-size:18px;">資料匯出中</h3>
      <p id="export-progress-text" style="color:#666; font-size:14px; margin-bottom:15px;">正在準備任務...</p>
      <div style="width:100%; background:#e5e8ea; border-radius:8px; height:16px; overflow:hidden;">
          <div id="export-progress-bar" style="width:0%; height:100%; background:#ee963f; transition:width 0.3s ease;"></div>
      </div>
  `;
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const updateProgress = (text, percent) => {
    const txtEl = document.getElementById("export-progress-text");
    const barEl = document.getElementById("export-progress-bar");
    if (txtEl) txtEl.textContent = text;
    if (barEl) barEl.style.width = percent + "%";
  };

  try {
    // [僵屍遮罩防護] 將任務綁定至全域視圖 Controller，確保切換頁面時遮罩必將自毀
    const exportController = new AbortController();
    if (window._licenseStaticEventController) {
      window._licenseStaticEventController.signal.addEventListener("abort", () => {
        exportController.abort();
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
      });
    }

    // 1. 發起匯出請求
    const json_object = await apiCall(
      CsRequestLicenseExportStart,
      condition_type,
      condition_value,
      b_time,
      e_time,
      customerNameKeyword,
      currentSortField,
      currentSortOrder,
      currentLicenseFilter,
      exportController,
    );

    const jobId = json_object.job_id;
    if (!jobId) throw new Error("無法取得 Job ID");

    // 2. 開始輪詢進度
    const pollInterval = 2000; // 每 2 秒輪詢一次
    let failCount = 0; // [新增] 前端網路重試計數器
    const pollStatus = async () => {
      if (exportController.signal.aborted) return; // 視圖切換，直接終止輪詢
      try {
        const statusRes = await apiCall(
          CsRequestLicenseExportStatus,
          jobId,
          exportController,
        );
        failCount = 0; // 成功取得則重置計數

        if (statusRes.status === "processing") {
          const total = parseInt(statusRes.total) || 0;
          const processed = parseInt(statusRes.processed) || 0;
          const percent =
            total === 0 ? 0 : Math.round((processed / total) * 100);

          updateProgress(
            `處理中... ${processed.toLocaleString()} / ${total.toLocaleString()} 筆`,
            percent,
          );
          setTimeout(pollStatus, pollInterval);
        } else if (statusRes.status === "completed") {
          updateProgress("匯出完成！正在下載檔案...", 100);

          // 透過新 API 取得 CSV 內容並在前端轉存檔案，徹底繞過 Nginx 阻擋
          CsRequestLicenseExportDownload(jobId, (err, downloadedBlob) => {
            if (document.body.contains(overlay))
              document.body.removeChild(overlay);
            if (err || !downloadedBlob || downloadedBlob.size === 0) {
              alert("檔案下載失敗，無法從伺服器取得資料");
              return;
            }
            // 加上正確的 MIME type 確保 Excel 能直接識別 UTF-8 CSV
            const blob = new Blob([downloadedBlob], {
              type: "text/csv;charset=utf-8;",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `License_Export_${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          });
        } else {
          throw new Error("匯出狀態異常");
        }
      } catch (e) {
        failCount++;
        if (failCount < 5) {
          console.warn(`輪詢進度失敗，進行重試 (${failCount}/5)...`);
          setTimeout(pollStatus, pollInterval);
        } else {
          if (document.body.contains(overlay))
            document.body.removeChild(overlay);
          console.error(e);
          alert("查詢匯出進度失敗，已達最大重試次數");
        }
      }
    };

    // 啟動輪詢
    setTimeout(pollStatus, 1000);
  } catch (e) {
    if (document.body.contains(overlay)) document.body.removeChild(overlay);
    console.error(e);
    alert("匯出失敗");
  }
}

async function executeCloseLogic(checkboxes) {
  VisibleLoaderElement(true);

  let successCount = 0;
  let errorCount = 0;
  const totalCount = checkboxes.length;
  const disabledSchools = [];

  // 定義單筆處理邏輯
  const processItem = async (checkbox) => {
    const licenseCid = checkbox.getAttribute("data-license-cid");
    try {
      // Step 1: Fetch record
      const json_object = await apiCall(
        CsRequestLicenseSelectOneRecordByCID,
        licenseCid,
      );
      const record = json_object.records;

      if (!record || !record.license_cid) {
        throw new Error("Record empty");
      }

      // Step 2: Prepare update data
      var license_data = Object.create(LicenseData);

      // Copy necessary fields
      const copyFields = [
        "license_cid",
        "owner_cid",
        "license_key",
        "license_begin_time",
        "license_days",
        "license_count",
        "sale_amount",
        "country",
        "customer_name",
        "customer_gender",
        "customer_birthday",
        "customer_phone",
        "customer_postalcode",
        "customer_address",
        "customer_email",
        "note00",
        "product_type",
      ];

      copyFields.forEach((field) => {
        // 部分日期欄位需要特別處理
        if (field === "license_begin_time") {
          license_data[field] = record[field]
            ? record[field][0].split(" ")[0]
            : "";
        } else {
          license_data[field] = record[field] ? record[field][0] : "";
        }
        // 數值欄位若為空則補 "0"
        if (
          ["license_days", "license_count", "sale_amount"].includes(field) &&
          !license_data[field]
        ) {
          license_data[field] = "0";
        }
      });

      // Step 3: Set state to closed
      license_data.record_state = "0";

      // Step 4: Update
      await apiCall(CsRequestLicenseUpdateOneRecord, license_data);

      // [聯動刪除] 如果是 avaclassroom 產品的訂單，且 owner_cid 為自動生成的學校群組（以 sch_ 開頭）
      // 當訂單被作廢時，該學校群組也一併作廢，防止在建立新訂單或側邊欄選單中繼續出現
      if (license_data.product_type === "avaclassroom" && license_data.owner_cid && license_data.owner_cid.startsWith("sch_")) {
        try {
          await new Promise((resolveGroup) => {
            if (window.Cyberspace && window.Cyberspace.Client && typeof window.Cyberspace.Client.SendRequest === "function") {
              window.Cyberspace.Client.SendRequest(
                "/ava_system/group/update_one_record",
                {
                  group_cid: license_data.owner_cid,
                  record_state: 0
                },
                (ok, res) => {
                  console.log(`[closeSelectedRecords] Group update callback: ok=${ok}, result=${res}`);
                  if (ok) {
                    disabledSchools.push(license_data.owner_cid);
                  }
                  resolveGroup();
                }
              );
            } else {
              resolveGroup();
            }
          });
        } catch (groupErr) {
          console.error("[closeSelectedRecords] Failed to disable related school group:", groupErr);
        }
      }

      console.log(
        `[closeSelectedRecords] Successfully closed license: ${licenseCid}`,
      );
      checkbox.setAttribute("data-deleted", "true");
      
      // 【樂觀隱藏】直接在當前畫面上隱藏該行，無需等待 reload
      const row = checkbox.closest("tr");
      if (row) {
        row.style.display = "none";
      }
      
      successCount++;
    } catch (e) {
      console.error(
        `[closeSelectedRecords] Error processing ${licenseCid}:`,
        e,
      );
      errorCount++;
    }
  };

  // 簡單的並發控制 (一次 3 個)
  const CONCURRENCY_LIMIT = 3;
  const chunkedCheckboxes = [];
  for (let i = 0; i < checkboxes.length; i += CONCURRENCY_LIMIT) {
    chunkedCheckboxes.push(
      Array.from(checkboxes).slice(i, i + CONCURRENCY_LIMIT),
    );
  }

  try {
    for (const chunk of chunkedCheckboxes) {
      await Promise.all(chunk.map((item) => processItem(item)));
    }
  } catch (err) {
    console.error("Batch processing error:", err);
  } finally {
    // 只有在完全沒有成功項目時才關閉 Loading。
    // 若有成功項目，則保持 Loading 狀態「一轉到底」，跨越 alert 提示，直到後續的延遲與重載完成。
    if (successCount === 0) {
      VisibleLoaderElement(false);
    }

    if (successCount > 0) {
      // 1. [樂觀快取與 DOM 立即更新] (在彈出 alert 之前執行，給予即時 UI 回饋)
      try {
        const remainingProducts = new Set();
        const deletedProducts = new Set();

        document.querySelectorAll(".license-row-checkbox").forEach(cb => {
          const pType = cb.getAttribute("data-product-type");
          if (!pType) return;

          if (cb.getAttribute("data-deleted") === "true") {
            deletedProducts.add(pType);
          } else {
            remainingProducts.add(pType);
          }
        });

        console.error("🚨 [DEBUG] 樂觀快取分析 - 成功刪除的產品:", Array.from(deletedProducts));
        console.error("🚨 [DEBUG] 樂觀快取分析 - 表格剩餘的產品:", Array.from(remainingProducts));

        const ownedStr = window.sessionStorage.getItem("owned_products");
        if (ownedStr) {
          let owned = JSON.parse(ownedStr);
          const originalLength = owned.length;

          deletedProducts.forEach(deletedP => {
            if (!remainingProducts.has(deletedP)) {
              console.error(`🚨 [DEBUG] 檢測到產品 ${deletedP} 已無剩餘訂單，樂觀主動從快取與 Navbar DOM 中移除！`);
              owned = owned.filter(p => p !== deletedP);

              // 立即更新目前頁面上的 Navbar DOM 節點
              const linkEl = document.querySelector(`.topnav-link[data-product="${deletedP}"]`);
              if (linkEl) {
                const liEl = linkEl.closest("li");
                if (liEl) {
                  liEl.remove();
                  console.error(`🚨 [DEBUG] 已從 DOM 中立即移除 Navbar 項目:`, deletedP);
                }
              }
            }
          });

          if (owned.length !== originalLength) {
            window.sessionStorage.setItem("owned_products", JSON.stringify(owned));
            console.error(`🚨 [DEBUG] 更新後的本地快取:`, owned);

            // 如果預設產品剛好被刪光了，也要更新 default_product
            const currentDef = window.sessionStorage.getItem("default_product");
            if (currentDef && !owned.includes(currentDef)) {
              const newDef = owned.length > 0 ? owned[0] : "avacast";
              window.sessionStorage.setItem("default_product", newDef);
              console.error(`🚨 [DEBUG] 預設產品已更新為:`, newDef);
            }
          }
        }
      } catch (e) {
        console.error("🚨 [DEBUG] 樂觀快取更新出錯:", e);
      }
    }

    // [優化] 強制即時顯示 Loading 遮罩，繞過預設的 250ms 延遲，防止 native alert 阻塞導致 Loading 未能顯現
    const loader = document.getElementById("initial-loader");
    if (loader) {
      loader.style.display = "flex";
      loader.style.opacity = "1";
    }
    if (typeof _loaderState !== "undefined") {
      _loaderState.isVisible = true;
      _loaderState.activeRequests = 1;
    }

    // 延遲 50ms 讓瀏覽器先完成表格行隱藏（display: none）與 Loading 遮罩渲染，再彈出 alert
    setTimeout(async () => {
      try {
        // 2. 彈出 alert 提示
        alert(`作業完成。成功 ${successCount} 筆，失敗 ${errorCount} 筆。`);

        if (successCount > 0) {
          // 3. [防禦性延遲] 為了避免後端 502 導致重載後新頁面的訂單加載失敗，
          // 我們在此時已保持 Loading 遮罩處於開啟狀態（「一轉到底」策略，越過 alert），
          // 讓使用者有明確的 UI 加載提示，接著進行 2.5 秒的等待以確保後端資料庫完成恢復。
          console.error("🚨 [DEBUG] 刪除完畢，等待 2.5 秒讓後端恢復...");
          await new Promise(r => setTimeout(r, 2500));

          // 在背景同步全域產品清單，避免阻塞 UI 重新整理
          RefreshOwnedProductsState();

          // [終極修復] 檢查當前正在檢視的產品是否已經被刪光了 (即已不在 owned_products 中)
          const currentUrlParams = new URLSearchParams(window.location.search);
          const currentPType = currentUrlParams.get("product") || window.sessionStorage.getItem("product_type");

          const ownedStr = window.sessionStorage.getItem("owned_products");
          let stillExists = false;
          if (ownedStr) {
            try {
              const owned = JSON.parse(ownedStr);
              if (owned.includes(currentPType)) {
                stillExists = true;
              }
            } catch (e) { }
          }

          let activeGroupDisabled = false;
          const activeGroup = window.sessionStorage.getItem("group_cid") || window.sessionStorage.getItem("select_group_cid");
          if (activeGroup && disabledSchools.includes(activeGroup)) {
            activeGroupDisabled = true;
            const parentCompanyCid = window.sessionStorage.getItem("school_parent_company_cid") || window.sessionStorage.getItem("login_group_cid");
            if (parentCompanyCid) {
              console.error(`🚨 [DEBUG] 目前選取的學校群組 ${activeGroup} 已被停用，自動將 active group 回退至 ${parentCompanyCid}`);
              window.sessionStorage.setItem("group_cid", parentCompanyCid);
              window.sessionStorage.setItem("select_group_cid", parentCompanyCid);
              const companyName = window.sessionStorage.getItem("company_group_name");
              if (companyName) {
                window.sessionStorage.setItem("select_group_name", companyName);
              } else {
                window.sessionStorage.removeItem("select_group_name");
              }
            }
          }

          let redirectProduct = currentPType;
          if (!stillExists && currentPType !== "all") {
            const defProd = window.sessionStorage.getItem("default_product") || "avacast";
            window.sessionStorage.setItem("product_type", defProd);
            redirectProduct = defProd;
          }

          if (activeGroupDisabled) {
            // 如果目前選取的學校群組被停用，強制跳轉以觸發 Sidebar 重新查詢並選取新的第一所學校
            if (typeof change_page === "function") {
              change_page(`license.html?product=${redirectProduct}`);
            } else {
              window.location.href = `license.html?product=${redirectProduct}`;
            }
          } else if (redirectProduct !== currentPType) {
            if (typeof change_page === "function") {
              change_page(`license.html?product=${redirectProduct}`);
            } else {
              window.location.href = `license.html?product=${redirectProduct}`;
            }
          } else {
            // 如果該產品還有剩餘訂單，不要重新整理整頁（location.reload），
            // 而是直接以 Ajax 重新查詢更新表格與統計數據，並在完成後自動關閉 Loading！
            try {
              await LicenseSelectAll();
            } catch (err) {
              console.error("🚨 [DEBUG] 重新加載訂單失敗:", err);
            } finally {
              // 重設計數器為 0 並關閉 Loader
              if (typeof _loaderState !== "undefined") {
                _loaderState.activeRequests = 0;
              }
              VisibleLoaderElement(false);
            }
          }
        }
      } catch (err) {
        console.error("Delete post-processing error:", err);
        if (typeof _loaderState !== "undefined") {
          _loaderState.activeRequests = 0;
        }
        VisibleLoaderElement(false);
      }
    }, 50);
  }
}

// 關閉選中的項目（設置record_state為0）
function closeSelectedRecords() {
  // [資安防護 - BAC 越權攔截] 預設拒絕：Tier >= 3 (如經銷商) 禁止作廢授權
  const tier = parseInt(window.sessionStorage.getItem("tier"), 10);
  if (isNaN(tier) || tier >= 3) {
    alert(window.localeData?.common?.deny || "權限不足，無法執行此操作。");
    return;
  }

  const checkboxes = document.querySelectorAll(".license-row-checkbox:checked");

  if (checkboxes.length === 0) {
    alert("請選擇要關閉的項目");
    return;
  }

  // Get modal elements
  const modal = document.getElementById("delete-confirmation-modal");
  const messageEl = document.getElementById("delete-modal-message");
  const itemsEl = document.getElementById("delete-modal-items");
  const confirmBtn = document.getElementById("delete-modal-confirm");
  const cancelBtn = document.getElementById("delete-modal-cancel");

  // Determine if it contains classroom products
  let hasClassroom = false;
  checkboxes.forEach((cb) => {
    if (cb.getAttribute("data-product-type") === "avaclassroom") {
      hasClassroom = true;
    }
  });

  let confirmMsg = "";
  if (hasClassroom) {
    confirmMsg = (GetLocalData("license.msg_confirm_delete_classroom") || 
      "確定要關閉這 {{count}} 筆紀錄嗎？\n⚠️ 警告：這包含 Classroom 產品訂單，關閉後該學校群組與教學主任帳號也將一併停用！")
      .replace("{{count}}", checkboxes.length);
  } else {
    confirmMsg = (GetLocalData("license.msg_confirm_delete") || 
      "確定要關閉這 {{count}} 筆紀錄嗎？")
      .replace("{{count}}", checkboxes.length);
  }

  if (!modal || !messageEl || !itemsEl || !confirmBtn || !cancelBtn) {
    // Fallback to confirm if modal elements are not found
    if (!confirm(confirmMsg)) {
      return;
    }
    executeCloseLogic(checkboxes);
    return;
  }

  // --- Populate and show modal ---
  messageEl.textContent = confirmMsg;

  itemsEl.innerHTML = ""; // Clear previous items
  checkboxes.forEach((cb) => {
    const row = cb.closest("tr");
    // Assuming the second data cell (index 1) is the creation time
    const identifier = row.cells[1]
      ? row.cells[1].textContent.trim()
      : `ID: ${cb.getAttribute("data-license-cid")}`;
    const item = document.createElement("div");
    item.textContent = identifier;
    item.style.padding = "4px 0";
    itemsEl.appendChild(item);
  });

  modal.style.display = "flex";

  // [Phase 1 優化] 使用 AbortController 取代 cloneNode 來優雅地移除事件
  if (window._licenseModalEventController)
    window._licenseModalEventController.abort();
  window._licenseModalEventController = new AbortController();
  const signal = window._licenseModalEventController.signal;

  cancelBtn.addEventListener(
    "click",
    () => {
      modal.style.display = "none";
    },
    { signal },
  );

  confirmBtn.addEventListener(
    "click",
    () => {
      modal.style.display = "none";
      executeCloseLogic(checkboxes);
    },
    { signal },
  );
}
