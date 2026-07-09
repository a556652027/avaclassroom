console.log("Nav Loaded");

// Flag to prevent multiple initializations
let _isStandardNavInitialized = false;
function getNavHtml() {
  return `<nav class="frame-nav">
    <div style="display: flex;">
      <div class="nav-item">
        <div class="nav-icon dashboard-icon" id="dashboard"></div>
        <span class="nav-text">{{sidebarnav.dashboard}}</span>
      </div>

      <div class="nav-item nav-item-second">
        <div class="nav-icon list-icon" id="license"></div>
        <span class="nav-text">{{sidebarnav.license}}</span>
      </div>

      <div class="nav-item nav-item-third">
        <div class="nav-icon license-icon" id="device"></div>
        <span class="nav-text">{{sidebarnav.device}}</span>
      </div>
    </div>
      <div class="nav-item nav-item-fourth">
        <div class="nav-icon management-icon" id="management"></div>
        <span class="nav-text">{{sidebarnav.management}}</span>
      </div>
    </nav>`;
}

// 讀入 CSS (這部分保持不變)
(function () {
  if (
    !document.querySelector(
      'link[href="components/app.component.frame.nav.css"]',
    )
  ) {
    var nav_link = document.createElement("link");
    nav_link.rel = "stylesheet";
    nav_link.type = "text/css";
    nav_link.href = "components/app.component.frame.nav.css";
    document.getElementsByTagName("head")[0].appendChild(nav_link);
  }
})();

// [修正] 將 HTML 內容注入移至此處，確保在初始化前 DOM 已存在
const navContainerForInjection = document.getElementById("nav-container");
if (navContainerForInjection) {
  navContainerForInjection.innerHTML = getNavHtml();
} else {
  // 在某些頁面(如 distributor_dashboard.html)可能不存在此容器，這是正常情況。
}

// 更新 active 狀態的函數
function updateActiveNavItem() {
  const urlParams = new URLSearchParams(window.location.search);
  const product =
    urlParams.get("product") ||
    window.sessionStorage.getItem("product_type") ||
    "avacast"; // Get product from URL or session
  const currentPage = window.location.pathname.split("/").pop();

  // [修正] 將選擇器範圍限定在 nav-container 內，避免影響到其他導覽列元件
  const navContainer = document.getElementById("nav-container");
  if (!navContainer) {
    return;
  }

  navContainer.querySelectorAll(".nav-item").forEach((item) => {
    const icon = item.querySelector(".nav-icon");
    const id = icon?.id;

    let isActive = false;

    if (id === "dashboard") {
      // Dashboard is active if current page is dashboard.html
      isActive = currentPage === "dashboard.html";
    } else if (id === "license") {
      // License is active if current page is license.html
      isActive = currentPage === "license.html";
    } else if (id === "device") {
      // [整合] Device is active if current page is device.html
      isActive = currentPage === "device.html";
    } else if (id === "management") {
      // Management is active if current page is member.html
      isActive = currentPage === "member.html";
    }

    if (isActive) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

async function initializeStandardNav() {
  if (_isStandardNavInitialized) {
    console.log("Standard Nav already initialized. Skipping.");
    return;
  }
  _isStandardNavInitialized = true;
  console.log("Initializing Standard Nav.");

  const navContainer = document.getElementById("nav-container");
  if (!navContainer) {
    return;
  }

  // Ensure HTML is injected if not already (e.g., if this function is called directly)
  if (!navContainer.innerHTML.trim()) {
    navContainer.innerHTML = getNavHtml();
  }

  // [新增] 權限控制：若是經銷商 (Tier 3)，隱藏「用戶管理」項目
  const userTier = window.sessionStorage.getItem("tier");
  if (userTier === "3") {
    const mgmtItem = navContainer.querySelector(".nav-item-fourth");
    if (mgmtItem) mgmtItem.style.display = "none";
  }

  // 1. [修正] 先翻譯，再綁定事件，避免 innerHTML 覆寫導致事件遺失
  if (typeof renderTemplate === "function") {
    const lang = window.localStorage.getItem("language") || "zh-tw";
    await renderTemplate(lang, "nav-container");
  }

  // [新增] 加上 AbortController 以利管理全域事件
  if (window._stdNavEventController) window._stdNavEventController.abort();
  window._stdNavEventController = new AbortController();
  const signal = window._stdNavEventController.signal;

  // 2. 處理點擊事件 (使用事件委派)
  document.addEventListener(
    "click",
    (e) => {
      const item = e.target.closest("#nav-container .nav-item");
      if (!item) return;

      const icon = item.querySelector(".nav-icon");
      const id = icon?.id || "unknown";

      const productType =
        window.sessionStorage.getItem("product_type") || "avacast";
      console.log("✅ Nav: Product Type:", productType, "Clicked:", id);

      // [優化] 統一導覽邏輯
      if (id === "dashboard") {
        // 無論何種產品，都導向統一的 dashboard.html 並帶上 product 參數
        change_page(`dashboard.html?product=${productType}`);
      } else if (id === "management") {
        // 管理頁面是共用的
        change_page("member.html");
      } else if (id === "license") {
        // [整合] 授權列表頁面已統一
        change_page(`license.html?product=${productType}`);
      } else if (id === "device") {
        // [修正] 統一導向 device.html 並帶上 product 參數
        change_page(`device.html?product=${productType}`);
      }
    },
    { signal },
  );

  // 3. 頁面載入時，設定高亮項目
  updateActiveNavItem();
}

// -----------------------------------------------------------
// 依賴狀態管理：確保核心函式庫載入後才執行
// -----------------------------------------------------------
function startNavComponent() {
  const navContainer = document.getElementById("nav-container");
  if (navContainer && !_isStandardNavInitialized) {
    initializeStandardNav();
  }
}

if (window._CoreLoaded) {
  startNavComponent();
} else {
  window.addEventListener("CoreDependenciesReady", startNavComponent);
}
