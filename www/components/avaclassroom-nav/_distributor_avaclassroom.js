// 檔案路徑: components/avaclassroom-nav/distributor_avaclassroom.js

console.log("Distributor AVACLASSROOM Nav Loaded");

function getDistributorAvaclassroomNavHtml() {
  // 回傳專屬於 Distributor AVA Classroom 的導覽列 HTML
  return `<nav class="frame-nav">
      <div class="nav-item">
        <div class="nav-icon dashboard-icon" id="dashboard"></div>
        <span class="nav-text">Dashboard</span>
      </div>

      <div class="nav-item nav-item-second">
          <div class="nav-icon list-icon" id="list"></div>
          <span class="nav-text">訂單資訊</span>
      </div>

      <div class="nav-item nav-item-third">
        <div class="nav-icon license-icon" id="device"></div>
        <span class="nav-text">License</span>
      </div>
    </nav>`;
}

// 讀入此元件對應的 CSS (共用 avaclassroom.css)
(function () {
  var nav_link = document.createElement("link");
  nav_link.rel = "stylesheet";
  nav_link.type = "text/css";
  nav_link.href = "components/avaclassroom-nav/avaclassroom.css";
  document.head.appendChild(nav_link);
})();

function updateActiveNavItem() {
  const currentPage = window.location.pathname.split("/").pop();

  // 頁面檔案名稱與對應的圖示ID
  const pageToIdMap = {
    "distributor_avaclassroom_dashboard.html": "dashboard",
    "distributor_avaclassroom_list.html": "list",
    "distributor_avaclassroom_license.html": "device"
  };

  const activeId = pageToIdMap[currentPage];

  document.querySelectorAll(".nav-item").forEach((item) => {
    const icon = item.querySelector(".nav-icon");
    if (icon && icon.id === activeId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

// 將 HTML 內容注入到指定的容器中
const container = document.getElementById("avaclassroom-nav-container");
if (container) {
  container.innerHTML = getDistributorAvaclassroomNavHtml();
}

// 等待整個頁面載入完成後，再綁定點擊事件
document.addEventListener("DOMContentLoaded", function () {
  updateActiveNavItem();

  const navContainer = document.getElementById("avaclassroom-nav-container");
  if (!navContainer) return;

  // 為導覽列中的項目加上點擊事件
  navContainer.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      const icon = item.querySelector(".nav-icon");
      const id = icon?.id || "unknown";

      console.log("✅ Distributor AVA Classroom Nav: 點擊了:", id);

      if (id === "dashboard") {
        change_page("distributor_avaclassroom_dashboard.html");
      } else if (id === "list") {
        change_page("distributor_avaclassroom_list.html");
      } else if (id === "device") {
        change_page("distributor_avaclassroom_license.html");
      }
    });
  });
});