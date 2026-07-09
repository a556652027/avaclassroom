console.log("Organization Add Modal Loaded");

// 讀入 CSS
(function () {
  if (
    !document.querySelector(
      'link[href="components/app.component.frame.organization-add.css"]',
    )
  ) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "components/app.component.frame.organization-add.css";
    document.getElementsByTagName("head")[0].appendChild(link);
  }
})();

// [Phase 3 優化] 加入 Promise 快取，防止重複載入
let _orgAddModalPromise = null;

// 載入 modal HTML
async function initOrganizationAddModal() {
  if (_orgAddModalPromise) return _orgAddModalPromise;
  _orgAddModalPromise = (async () => {
    try {
      const response = await fetch(
        "components/app.component.frame.organization-add.html",
      );
      const html = await response.text();

      // 創建容器並插入 HTML
      let container = document.getElementById("organization-add-modal-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "organization-add-modal-container";
        document.body.appendChild(container);
      }
      container.innerHTML = html;

      // 重新渲染翻譯
      const currentLang = localStorage.getItem("language") || "zh-tw";
      if (typeof renderTemplate === "function") {
        await renderTemplate(currentLang, "organization-add-modal-container");
      }

      // 設置 owner_cid 預設值
      if (typeof Cyberspace !== "undefined" && Cyberspace.Client) {
        const ownerCidInput = document.getElementById(
          "organization_insert-owner_cid",
        );
        if (ownerCidInput) {
          ownerCidInput.value = Cyberspace.Client.getUsername();
          console.log("✅ owner_cid 已設定為:", ownerCidInput.value);
        }
      }
    } catch (error) {
      console.error("載入 modal 失敗:", error);
      _orgAddModalPromise = null; // 失敗時重置
    }
  })();
  return _orgAddModalPromise;
}

// 顯示 modal
async function showOrganizationAddModal() {
  // [Phase 3 優化] 確保 DOM 已載入
  await initOrganizationAddModal();

  const modal = document.getElementById("organization-add-modal");
  if (modal) {
    modal.style.display = "flex";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = "9999";

    // 設置 owner_cid 預設值（再次確認）
    if (typeof Cyberspace !== "undefined" && Cyberspace.Client) {
      const ownerCidInput = document.getElementById(
        "organization_insert-owner_cid",
      );
      if (ownerCidInput) {
        ownerCidInput.value = Cyberspace.Client.getUsername();
      }
    }
  }
}

// 隱藏 modal
function hideOrganizationAddModal() {
  const modal = document.getElementById("organization-add-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Modal 專用的新增組織函數
async function modalOrganizationInsertOne() {
  console.log("modalOrganizationInsertOne called");

  // 獲取欄位值
  const group_cid = document
    .getElementById("organization_insert-group_cid")
    .value.trim();
  const contact_phone_01 = document
    .getElementById("organization_insert-contact_phone_01")
    .value.trim();
  const contact_email_01 = document
    .getElementById("organization_insert-contact_email_01")
    .value.trim();

  // 驗證 group_cid (只允許英文、數字、底線、減號)
  const groupCidPattern = /^[a-zA-Z0-9_-]+$/;
  if (!groupCidPattern.test(group_cid)) {
    alert(
      "經銷商/公司名稱格式錯誤！\n只能包含英文字母、數字、底線(_)、減號(-)",
    );
    return;
  }

  // 驗證 Email 格式
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(contact_email_01)) {
    alert("聯絡人信箱格式錯誤！\n請輸入有效的 Email 地址");
    return;
  }

  // 驗證電話格式 (允許數字、減號、加號、空格、括號)
  const phonePattern = /^[\d\s\-\+\(\)]+$/;
  if (!phonePattern.test(contact_phone_01)) {
    alert("聯絡人電話格式錯誤！\n只能包含數字、減號(-)、加號(+)、空格、括號");
    return;
  }

  var group_data = Object.create(GroupData);
  group_data.group_cid = group_cid;
  group_data.group_name = document.getElementById(
    "organization_insert-group_name",
  ).value;
  group_data.group_type = document.getElementById(
    "organization_insert-group_type",
  ).value;
  group_data.owner_cid = document.getElementById(
    "organization_insert-owner_cid",
  ).value;
  group_data.contact = document.getElementById(
    "organization_insert-contact",
  ).value;
  group_data.group_ubn = document.getElementById(
    "organization_insert-group_ubn",
  ).value;
  group_data.contact_phone_01 = contact_phone_01;
  group_data.contact_email_01 = contact_email_01;
  group_data.country = document
    .getElementById("organization_insert-country")
    .value.trim();
  group_data.city = document
    .getElementById("organization_insert-city")
    .value.trim();
  group_data.address = document
    .getElementById("organization_insert-address")
    .value.trim();
  group_data.billing_addr = document
    .getElementById("organization_insert-billing_addr")
    .value.trim();
  group_data.note00 = document
    .getElementById("organization_insert-note00")
    .value.trim();

  console.log("收集到的資料:", group_data);

  if (typeof VisibleLoaderElement === "function") {
    VisibleLoaderElement(true);
  }

  try {
    await apiCall(CsRequestGroupInsertOneRecordByOwnerCID, group_data);
    hideOrganizationAddModal();

    if (typeof GetLocalData === "function") {
      alert(GetLocalData("common.success"));
    } else {
      alert("新增成功");
    }

    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("sidebar_cache_")) {
        sessionStorage.removeItem(key);
      }
    });
    location.reload();
  } catch (e) {
    if (e.message !== "Handled Server Error") alert("request error");
  } finally {
    if (typeof VisibleLoaderElement === "function") {
      VisibleLoaderElement(false);
    }
  }
}

// [優化] 統一委派所有新增組織彈窗的事件，取代原本的直接綁定
if (window._orgAddEventController) window._orgAddEventController.abort();
window._orgAddEventController = new AbortController();
const orgAddSignal = window._orgAddEventController.signal;

// 1. 攔截點擊事件 (關閉、取消、確認)
document.addEventListener(
  "click",
  function (e) {
    if (
      e.target.closest("#organization-add-modal-close") ||
      e.target.closest("#organization_insert-button-cancel-modal")
    ) {
      hideOrganizationAddModal();
      return;
    }

    if (e.target.closest("#organization_insert-button-ok-modal")) {
      modalOrganizationInsertOne();
      return;
    }
  },
  { signal: orgAddSignal },
);

// 2. 攔截 Checkbox 變更事件 (同公司地址)
document.addEventListener(
  "change",
  function (e) {
    const checkbox = e.target.closest(
      "#organization_insert-same_as_company_addr",
    );
    if (checkbox) {
      const addressInput = document.getElementById(
        "organization_insert-address",
      );
      const billingAddrInput = document.getElementById(
        "organization_insert-billing_addr",
      );
      if (addressInput && billingAddrInput) {
        billingAddrInput.value = checkbox.checked ? addressInput.value : "";
      }
    }
  },
  { signal: orgAddSignal },
);

// 3. 攔截地址輸入事件，若勾選則同步
document.addEventListener(
  "input",
  function (e) {
    if (e.target.id === "organization_insert-address") {
      const checkbox = document.getElementById(
        "organization_insert-same_as_company_addr",
      );
      const billingAddrInput = document.getElementById(
        "organization_insert-billing_addr",
      );
      if (checkbox && checkbox.checked && billingAddrInput) {
        billingAddrInput.value = e.target.value;
      }
    }
  },
  { signal: orgAddSignal },
);

// -----------------------------------------------------------
// 依賴狀態管理：確保核心函式庫載入後才執行
// -----------------------------------------------------------
function startOrgAddComponent() {
  initOrganizationAddModal();
}

if (window._CoreLoaded) {
  startOrgAddComponent();
} else {
  window.addEventListener("CoreDependenciesReady", startOrgAddComponent);
}
