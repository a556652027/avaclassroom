// 組織編輯彈窗相關功能

// 當前編輯的組織ID
let _current_editing_organization_cid = null;
// [新增] 當前編輯的組織 UID (權限驗證關鍵)
let _current_editing_organization_uid = null;
// [新增] 內部索引與更新計數 (可能影響權限與鎖定)
let _current_editing_group_idx = null;
let _current_editing_update_count = null;

// 打開組織編輯彈窗
async function openOrganizationEditModal(organizationCid = null) {
  // 如果沒有傳入組織ID，從 sessionStorage 獲取
  if (!organizationCid) {
    organizationCid = window.sessionStorage.getItem("group_cid");
  }

  // [修正] 再次確保 ID 沒有前後空白
  if (organizationCid) {
    organizationCid = organizationCid.trim();
  }

  if (!organizationCid || !IsValidString(organizationCid)) {
    alert("無法獲取組織資訊");
    return;
  }

  _current_editing_organization_cid = organizationCid;

  // [Phase 3 優化] 確保 DOM 絕對已經載入完成，解決手速過快導致的 Race Condition
  await initOrgEditComponent();

  const modal = document.getElementById("organization-edit-modal");
  if (modal) {
    // 先等待 API 取回組織資料並填入完畢後，再將 Modal 顯示出來，防止畫面閃爍
    await loadOrganizationData(organizationCid);

    modal.style.display = "flex";
  }
}

// 關閉組織編輯彈窗
function closeOrganizationEditModal() {
  const modal = document.getElementById("organization-edit-modal");
  if (modal) {
    modal.style.display = "none";
    _current_editing_organization_cid = null;
    _current_editing_organization_uid = null; // [新增] 重置 UID
    _current_editing_group_idx = null;
    _current_editing_update_count = null;

    // 清空表單
    const form = document.getElementById("organization-edit-form");
    if (form) {
      form.reset();
    }
  }
}

// 加載組織資料
async function loadOrganizationData(organizationCid, retryCount = 0) {
  console.log("🚀 準備載入組織資料, CID:", organizationCid);

  // [新增] 檢查 API 是否存在
  if (typeof CsRequestGroupSelectOneRecordByGroupCID === "undefined") {
    console.error(
      "❌ CsRequestGroupSelectOneRecordByGroupCID 未定義，請檢查 app.module.organization.js 是否已載入",
    );
    alert(
      "系統錯誤：組織模組未載入 (CsRequestGroupSelectOneRecordByGroupCID missing)",
    );
    closeOrganizationEditModal();
    return;
  }

  // [偵錯] 印出 API 函式內容，以分析正確的 URL 結構
  console.log("🔍 分析 API 函式結構:");
  console.log(CsRequestGroupSelectOneRecordByGroupCID.toString());

  // 開啟 loading
  VisibleLoaderElement(true);

  try {
    // 使用 Promise 包裝原生請求，保留自定義錯誤處理機制 (-1089 Fallback)
    const result = await new Promise((resolve, reject) => {
      CsRequestGroupSelectOneRecordByGroupCID(
        organizationCid,
        function (ok, res) {
          if (!ok) reject(new Error(res || "Network Error"));
          else resolve(res);
        },
      );
    });

    let json_object = JSON.parse(result);
    console.log("📡 載入組織資料結果:", true, result);

    // 錯誤顯示輔助函數
    const showOriginalError = (jsonObj, orgCid) => {
      // [新增] 針對 -1089 錯誤代碼提供明確提示 (隱藏 API Error 與 Code)
      if (jsonObj.errno == -1089) {
        const errMsg = "您沒有權限編輯此組織資訊。";
        console.error(
          `載入組織資料失敗 (API Error: ${jsonObj.errno})`,
          jsonObj,
        );
        alert(errMsg);
        closeOrganizationEditModal();
        return;
      }

      // [新增] 針對 -1081 錯誤代碼 (資料庫中查無此組織) 提供友善提示
      if (jsonObj.errno == -1081) {
        const errMsg = `找不到組織 [${orgCid}] 的資料！\n\n可能原因：\n1. 您只有被指派 ID，但該組織尚未建立詳細資料。\n2. 該組織已被刪除。\n\n請前往「新增組織」將資料補齊。`;
        console.error(
          `載入組織資料失敗 (API Error: ${jsonObj.errno})`,
          jsonObj,
        );
        alert(errMsg);
        closeOrganizationEditModal();
        return;
      }

      let errMsg = `載入組織資料失敗 (API Error)\nCode: ${jsonObj.errno}`;
      errMsg += `\nMessage: ${jsonObj.message || jsonObj.msg || "unknown"}`;

      console.error(errMsg, jsonObj);
      alert(errMsg);
      closeOrganizationEditModal();
    };

    // [修正] 繞過 show_errno，直接顯示詳細錯誤資訊以便除錯
    // 注意：後端 errno >= 0 代表成功 (通常 1 代表有資料，0 代表成功但無資料或單純操作成功)
    if (json_object.errno < 0) {
      showOriginalError(json_object, organizationCid);
      return;
    }

    // 填入資料
    const record = json_object.records;
    // [新增] 正常路徑也要儲存 group_uid
    _current_editing_organization_uid = record.group_uid
      ? record.group_uid[0]
      : null;
    // [新增] 捕捉 idx 與 update_count
    _current_editing_group_idx = record.group_idx ? record.group_idx[0] : null;
    _current_editing_update_count = record.update_count
      ? record.update_count[0]
      : "0";

    console.log("🔑 取得關鍵參數:", {
      uid: _current_editing_organization_uid,
      idx: _current_editing_group_idx,
      count: _current_editing_update_count,
    });

    document.getElementById("org-edit-group_cid").value = HtmlUtil.escape(
      record.group_cid[0] || "",
    );
    document.getElementById("org-edit-group_name").value = HtmlUtil.escape(
      record.group_name[0] || "",
    );
    document.getElementById("org-edit-group_type").value = HtmlUtil.escape(
      record.group_type[0] || "",
    );
    document.getElementById("org-edit-contact").value = HtmlUtil.escape(
      record.contact[0] || "",
    );
    document.getElementById("org-edit-group_ubn").value = HtmlUtil.escape(
      record.group_ubn[0] || "",
    );
    document.getElementById("org-edit-contact_phone_01").value =
      HtmlUtil.escape(record.contact_phone_01[0] || "");
    document.getElementById("org-edit-contact_email_01").value =
      HtmlUtil.escape(record.contact_email_01[0] || "");
    document.getElementById("org-edit-country").value = HtmlUtil.escape(
      record.country[0] || "",
    );
    document.getElementById("org-edit-address").value = HtmlUtil.escape(
      record.address[0] || "",
    );
    document.getElementById("org-edit-billing_addr").value = HtmlUtil.escape(
      record.billing_addr[0] || "",
    );
    document.getElementById("org-edit-note00").value = HtmlUtil.escape(
      record.note00[0] || "",
    );

    // 填充隐藏字段
    document.getElementById("org-edit-owner_cid").value =
      record.owner_cid[0] || "";
    document.getElementById("org-edit-city").value = record.city[0] || "";
  } catch (error) {
    if (retryCount < 1) {
      console.warn(
        `[loadOrganizationData] 載入失敗，重試... (Retry: ${retryCount + 1})`,
      );
      loadOrganizationData(organizationCid, retryCount + 1);
      return;
    }
    console.error("載入組織資料失敗", error);
    alert(`載入組織資料失敗\nCID: [${organizationCid}]`);
    closeOrganizationEditModal();
  } finally {
    VisibleLoaderElement(false);
  }
}

// 儲存組織資料
async function saveOrganizationData() {
  if (!_current_editing_organization_cid) {
    alert("無效的組織資訊");
    return;
  }

  // 收集表單資料
  // [修正] 使用純物件避免原型鏈問題，並確保 GroupData 存在時繼承其屬性
  let group_data = {};
  if (typeof GroupData !== "undefined") {
    // 複製 GroupData 的預設值
    Object.assign(group_data, GroupData);
  }

  group_data.group_cid = document.getElementById("org-edit-group_cid").value;
  group_data.group_name = (
    document.getElementById("org-edit-group_name").value || ""
  ).trim();
  // [修正] 恢復標準邏輯：確保有值 (預設 "0")，避免 Wrapper 發送 undefined 導致 502
  group_data.group_type = (
    document.getElementById("org-edit-group_type").value || "0"
  ).trim();

  // [修正] 確保 owner_cid 有值，避免 Wrapper 發送 undefined 導致 -1103
  group_data.owner_cid = (
    document.getElementById("org-edit-owner_cid").value ||
    window.sessionStorage.getItem("member_cid") ||
    ""
  ).trim();

  delete group_data.object_name;

  // [修正] 優先使用從 loadOrganizationData 取得的 group_uid
  if (_current_editing_organization_uid) {
    group_data.group_uid = _current_editing_organization_uid;
    console.log("🔑 使用已載入的 group_uid:", group_data.group_uid);

    // [新增] 注入 group_idx 和 update_count，這可能是後端驗證資料一致性的必要條件
    // [修正] 確保提供預設值 "0"，避免因 null 而傳送 undefined 給後端
    group_data.group_idx = _current_editing_group_idx || "0";
    group_data.update_count = _current_editing_update_count || "0";

    console.log("🔑 關鍵參數 (Save):", {
      uid: group_data.group_uid,
      idx: group_data.group_idx,
      count: group_data.update_count,
    });
  } else {
    console.warn("⚠️ 警告：缺少 group_uid，更新可能會失敗 (-1103)");
    // 嘗試從 sessionStorage 補救 (僅作最後手段)
    // ... (原有的快取搜尋邏輯可保留或移除，建議保留以防萬一) ...
  }

  // [修正] 確保數值欄位存在且有預設值，避免 -1086 (參數不足)
  const numericFields = [
    "licensing_remaining_days",
    "licensing_remaining_seats",
  ];
  numericFields.forEach((key) => {
    if (
      group_data[key] === undefined ||
      group_data[key] === null ||
      group_data[key] === ""
    ) {
      group_data[key] = "0";
    }
  });

  group_data.contact = (
    document.getElementById("org-edit-contact").value || ""
  ).trim();
  group_data.group_ubn = (
    document.getElementById("org-edit-group_ubn").value || ""
  ).trim();
  group_data.contact_phone_01 = document.getElementById(
    "org-edit-contact_phone_01",
  ).value;
  group_data.contact_email_01 = document.getElementById(
    "org-edit-contact_email_01",
  ).value;
  group_data.city = (
    document.getElementById("org-edit-city").value || ""
  ).trim();
  group_data.country = (
    document.getElementById("org-edit-country").value || ""
  ).trim();
  group_data.address = (
    document.getElementById("org-edit-address").value || ""
  ).trim();
  group_data.billing_addr = (
    document.getElementById("org-edit-billing_addr").value || ""
  ).trim();
  group_data.note00 = document.getElementById("org-edit-note00").value;
  // [修正] 恢復標準邏輯：發送 "1" (啟用)
  group_data.record_state = "1";

  // [修正] 標準 Wrapper 會自動處理 session_token，無需手動注入
  // group_data.session_token = ...

  // 除錯：顯示即將發送的資料
  console.log("準備儲存組織 (Standard API)，發送的資料:", group_data);

  // 開啟 loading
  VisibleLoaderElement(true);

  try {
    await apiCall(CsRequestGroupUpdateOneRecordByGroupCID, group_data);
    alert(GetLocalData("common.success"));
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("sidebar_cache_")) {
        sessionStorage.removeItem(key);
      }
    });
    closeOrganizationEditModal();
  } catch (e) {
    if (e.message !== "Handled Server Error")
      alert("更新組織資料失敗 (API Error)");
  } finally {
    VisibleLoaderElement(false);
  }
}

// 刪除組織（將 record_state 設為 0）
async function deleteOrganization() {
  console.log("🗑️ deleteOrganization 函數被調用");
  console.log("當前編輯的組織 CID:", _current_editing_organization_cid);

  if (!_current_editing_organization_cid) {
    alert("無效的組織資訊");
    return;
  }

  // 確認刪除
  if (!confirm("確定要刪除此組織嗎？刪除後該組織將不會顯示在列表中。")) {
    console.log("用戶取消刪除");
    return;
  }

  console.log("✅ 用戶確認刪除，開始收集表單資料...");

  // 收集表單資料（包括隐藏字段）
  let group_data = {};
  if (typeof GroupData !== "undefined") {
    Object.assign(group_data, GroupData);
  }

  group_data.group_cid = document.getElementById("org-edit-group_cid").value;
  group_data.group_name = (
    document.getElementById("org-edit-group_name").value || ""
  ).trim();
  group_data.group_type = (
    document.getElementById("org-edit-group_type").value || "0"
  ).trim();

  // [修正] 確保 owner_cid 有值
  group_data.owner_cid = (
    document.getElementById("org-edit-owner_cid").value ||
    window.sessionStorage.getItem("member_cid") ||
    ""
  ).trim();
  delete group_data.object_name;

  // [新增] 注入 group_uid, idx, update_count，並確保有預設值
  if (_current_editing_organization_uid) {
    group_data.group_uid = _current_editing_organization_uid;
    group_data.group_idx = _current_editing_group_idx || "0";
    group_data.update_count = _current_editing_update_count || "0";
  }

  // [修正] 確保數值欄位存在且有預設值，避免 -1086
  const numericFieldsDelete = [
    "licensing_remaining_days",
    "licensing_remaining_seats",
  ];
  numericFieldsDelete.forEach((key) => {
    if (
      group_data[key] === undefined ||
      group_data[key] === null ||
      group_data[key] === ""
    ) {
      group_data[key] = "0";
    }
  });

  group_data.contact = document.getElementById("org-edit-contact").value;
  group_data.group_ubn = document.getElementById("org-edit-group_ubn").value;
  group_data.contact_phone_01 = document.getElementById(
    "org-edit-contact_phone_01",
  ).value;
  group_data.contact_email_01 = document.getElementById(
    "org-edit-contact_email_01",
  ).value;
  group_data.city = document.getElementById("org-edit-city").value;
  group_data.country = document.getElementById("org-edit-country").value;
  group_data.address = document.getElementById("org-edit-address").value;
  group_data.billing_addr = document.getElementById(
    "org-edit-billing_addr",
  ).value;
  group_data.note00 = document.getElementById("org-edit-note00").value;
  group_data.record_state = "0"; // 設為刪除狀態

  // 除錯：顯示即將發送的資料
  console.log("📦 準備刪除組織，發送的資料:", group_data);

  // 開啟 loading
  VisibleLoaderElement(true);

  try {
    await apiCall(CsRequestGroupUpdateOneRecordByGroupCID, group_data);
    alert("組織已刪除");
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("sidebar_cache_")) {
        sessionStorage.removeItem(key);
      }
    });
    closeOrganizationEditModal();
    location.reload();
  } catch (e) {
    if (e.message !== "Handled Server Error") alert("刪除組織失敗 (API Error)");
  } finally {
    VisibleLoaderElement(false);
  }
}
window.deleteOrganization = deleteOrganization;

// 在頁面標題上添加點擊編輯功能
function addOrganizationEditClickToTitle() {
  // 查找所有可能的標題元素
  const possibleTitleSelectors = [
    "#dashboard-title",
    "#member-title",
    "#license-title",
    ".page-caption h1",
    "h1",
    ".page-title",
    "[data-org-title]",
  ];

  let titleElement = null;

  // 按優先級查找標題元素
  for (const selector of possibleTitleSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      titleElement = elements[0]; // 取第一個找到的
      console.log(`✅ 找到標題元素: ${selector}`, titleElement);
      break;
    }
  }

  if (titleElement) {
    // [新增] 防止重複綁定，檢查是否已經標記過
    if (titleElement.getAttribute("data-edit-bound") === "true") {
      return;
    }
    titleElement.setAttribute("data-edit-bound", "true");

    // 添加樣式，表示可點擊
    titleElement.style.cursor = "pointer";
    titleElement.style.userSelect = "none";
    titleElement.title = GetLocalData("organization.tooltip_edit_org");

    // [優化] 移除逐一綁定的點擊與 Hover 事件，將由底部的全域事件委派統一處理

    console.log("✅ 已為標題添加組織編輯功能:", titleElement);
  } else {
    console.error("❌ 找不到標題元素，無法添加編輯功能");
  }
}

// [Phase 3 優化] 加入 Promise 快取，防止重複載入
let _orgEditModalPromise = null;

// 初始化與載入組織編輯彈窗HTML
function initOrgEditComponent() {
  if (_orgEditModalPromise) return _orgEditModalPromise;

  // 載入組織編輯彈窗HTML
  _orgEditModalPromise = fetch("components/app.component.frame.organization-edit.html")
    .then((response) => response.text())
    .then(async (html) => {
      // 將彈窗HTML添加到頁面
      document.body.insertAdjacentHTML("beforeend", html);

      // 渲染本地化文字
      if (typeof renderTemplate === "function") {
        const currentLang = localStorage.getItem("language") || "zh-tw";
        await renderTemplate(currentLang, "organization-edit-modal");
      }
    })
    .catch((error) => {
      console.error("載入組織編輯彈窗失敗:", error);
      _orgEditModalPromise = null; // 載入失敗則清空，允許下次重試
    });

  return _orgEditModalPromise;
}

// -----------------------------------------------------------
// 依賴狀態管理：確保核心函式庫與 DOM 皆載入後再初始化
// -----------------------------------------------------------
function startOrgEditComponent() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initOrgEditComponent);
  } else {
    initOrgEditComponent();
  }
}

if (window._CoreLoaded) {
  startOrgEditComponent();
} else {
  window.addEventListener("CoreDependenciesReady", startOrgEditComponent);
}

// [記憶體優化 & 穩定性] 統管組織編輯彈窗的全域事件委派
if (window._orgEditEventController) window._orgEditEventController.abort();
window._orgEditEventController = new AbortController();
const editSignal = window._orgEditEventController.signal;

document.addEventListener(
  "click",
  function (e) {
    // 1. 點擊彈窗外部關閉彈窗
    const modal = document.getElementById("organization-edit-modal");
    if (modal && e.target === modal) {
      closeOrganizationEditModal();
      return;
    }
    // 2. 攔截：刪除按鈕
    if (e.target.closest("#org-edit-delete-btn")) {
      e.preventDefault();
      deleteOrganization();
      return;
    }
    // 3. 攔截：點擊帶有 [data-edit-bound] 的標題
    if (e.target.closest("[data-edit-bound='true']")) {
      e.preventDefault();
      e.stopPropagation();
      console.log("🖱️ 點擊標題，打開組織編輯彈窗");
      openOrganizationEditModal();
      return;
    }
  },
  { signal: editSignal },
);

document.addEventListener(
  "submit",
  function (e) {
    if (e.target.id === "organization-edit-form") {
      e.preventDefault();
      saveOrganizationData();
    }
  },
  { signal: editSignal },
);

// Hover 視覺效果委派
document.addEventListener(
  "mouseover",
  function (e) {
    const title = e.target.closest("[data-edit-bound='true']");
    if (title) title.style.opacity = "0.7";
  },
  { signal: editSignal },
);

document.addEventListener(
  "mouseout",
  function (e) {
    const title = e.target.closest("[data-edit-bound='true']");
    if (title) title.style.opacity = "1";
  },
  { signal: editSignal },
);
