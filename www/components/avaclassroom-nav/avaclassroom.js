// 檔案路徑: components/avaclassroom-nav/avaclassroom.js

console.log("AVACLASSROOM Nav Loaded");

function getAvaclassroomNavHtml() {
  // 回傳專屬於 AVA Classroom 的導覽列 HTML
  return `<nav class="frame-nav">
    <div style="display: flex;">
      <div class="nav-item">
        <div class="nav-icon dashboard-icon" id="dashboard"></div>
        <span class="nav-text">{{sidebarnav.dashboard}}</span>
      </div>

      <div class="nav-item nav-item-second">
          <div class="nav-icon list-icon" id="list"></div>
          <span class="nav-text">{{license.title_list_license}}</span>
      </div>
    </div>
      <div class="nav-item nav-item-third">
        <div class="nav-icon management-icon" id="management"></div>
        <span class="nav-text">{{sidebarnav.management}}</span>
      </div>
    </nav>`;
}

// 讀入此元件對應的 CSS
(function () {
  var nav_link = document.createElement("link");
  nav_link.rel = "stylesheet";
  nav_link.type = "text/css";
  nav_link.href = "components/avaclassroom-nav/avaclassroom.css"; // 使用正確的相對路徑
  document.head.appendChild(nav_link);
})();

function updateActiveNavItem() {
  const urlParams = new URLSearchParams(window.location.search);
  const product = urlParams.get("product");
  const currentPage = window.location.pathname.split("/").pop();

  // 頁面檔案名稱與對應的圖示ID
  const pageToIdMap = {
    "dashboard.html": "dashboard",
    "license.html": "list",
    "member.html": "management",
  };

  const activeId = pageToIdMap[currentPage];

  // [修正] 將選擇器範圍限定在 avaclassroom-nav-container 內，避免影響到其他導覽列元件
  const navContainer = document.getElementById("avaclassroom-nav-container");
  if (!navContainer) return;

  navContainer.querySelectorAll(".nav-item").forEach((item) => {
    const icon = item.querySelector(".nav-icon");
    // For dashboard, also check if the product parameter matches
    if (
      icon &&
      icon.id === activeId &&
      (activeId !== "dashboard" || product === "avaclassroom")
    ) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

// 將 HTML 內容注入到指定的容器中
const container = document.getElementById("avaclassroom-nav-container");
if (container) {
  container.innerHTML = getAvaclassroomNavHtml();
} else {
  console.error(
    "錯誤：在頁面上找不到 ID 為 'avaclassroom-nav-container' 的容器。",
  );
}

// 由於此腳本是動態載入的，DOMContentLoaded 可能已經觸發，因此直接執行初始化
async function initializeAvaclassroomNav() {
  const container = document.getElementById("avaclassroom-nav-container");

  // [權限控制] 若是經銷商 (Tier 3)，隱藏「用戶管理」項目
  const userTier = window.sessionStorage.getItem("tier");
  if (userTier === "3" && container) {
    const mgmtItem = container.querySelector(".nav-item-third");
    if (mgmtItem) mgmtItem.style.display = "none";
  }

  // [修復 1] 確保 HTML 被正確翻譯，並等待非同步渲染完成，取代寫死的 "zh-tw"
  if (container && container.innerHTML.includes("{{")) {
    const lang = window.localStorage.getItem("language") || "zh-tw";
    await renderTemplate(lang, "avaclassroom-nav-container");
  }

  updateActiveNavItem();

  if (!container) {
    console.error(
      "AVA Classroom nav container not found during initialization.",
    );
    return;
  }

  // [修復 2] 引入 AbortController 防止事件重複綁定與 Memory Leak
  if (window._avaClassroomNavEventController) {
    window._avaClassroomNavEventController.abort();
  }
  window._avaClassroomNavEventController = new AbortController();
  const signal = window._avaClassroomNavEventController.signal;

  // [修復 3] 使用事件委派 (Event Delegation) 處理點擊，解決事件遺失問題
  document.addEventListener(
    "click",
    (e) => {
      const item = e.target.closest("#avaclassroom-nav-container .nav-item");
      if (!item) return;

      const icon = item.querySelector(".nav-icon");
      const id = icon?.id || "unknown";
      console.log("✅ AVA Classroom Nav: 點擊了:", id);

      if (id === "dashboard") {
        change_page("dashboard.html?product=avaclassroom");
      } else if (id === "list") {
        change_page("license.html?product=avaclassroom");
      } else if (id === "management") {
        change_page("member.html?product=avaclassroom");
      }
    },
    { signal },
  );
}
