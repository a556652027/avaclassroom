console.log("Loaded navbar.js");

function getSidebarHtml() {
  // [修正] 優先從 URL 讀取 product 參數，若無則讀取 SessionStorage，最後預設為 avacast
  const urlParams = new URLSearchParams(window.location.search);
  const productType =
    urlParams.get("product") ||
    window.sessionStorage.getItem("product_type") ||
    "avacast";
  return `      <!-- sidebar -->
      <aside id="sidebar" class="sidebar">
        <div class="sidebar-items">
          <!-- Sidebar Items -->
          <div class="nav-item" data-content="dashboard" style="cursor: pointer;">
            <p class="nav-text">
              <img src="assets/images/dashboard.svg" alt="" class="icon" />
              <span class="item-label">{{sidebarnav.dashboard}}</span>
            </p>
          </div>

          <div class="nav-item" data-content="orders" style="cursor: pointer;">
            <p class="nav-text">
              <img
                src="assets/images/list_information.svg"
                alt=""
                class="icon"
              />
              <span class="item-label">{{sidebarnav.license}}</span>
            </p>
          </div>

          <!-- Dropdown -->
          <ul
            class="dropdown"
            style="padding: 0; margin: 0; list-style: none; ${productType === "avaclassroom" ? "display: none;" : ""}"
          >
            <li class="dropdown-item">
              <a href="#" class="dropdown-toggle" style="display: flex; align-items: center; text-decoration: none;">
                <img
                  src="assets/images/distributor_license.svg"
                  alt=""
                  class="icon"
                />
                <span class="item-label">{{sidebarnav.device}}</span>
              </a>
              <ul class="dropdown-menu">
              </ul>
            </li>
          </ul>
        </div>

        <!-- Toggle Button -->
        <div id="toggleSidebar" class="toggle-btn">
          <img id="toggleIcon" src="assets/images/Vector.svg" alt="#" />
        </div>
      </aside>`;
}

//讀入css
(function () {
  // 檢查 CSS 是否已經載入，避免重複載入
  if (
    !document.querySelector('link[href="components/distributor/sidebar.css"]')
  ) {
    var sidebar_link = document.createElement("link");
    sidebar_link.rel = "stylesheet";
    sidebar_link.type = "text/css";
    sidebar_link.href = "components/distributor/sidebar.css";
    document.getElementsByTagName("head")[0].appendChild(sidebar_link);
    console.log("Sidebar CSS loaded");
  }
})();

// 列出型號
function ListSpec04(span) {
  const dropdownItem = span.closest(".dropdown-item");
  const menu = dropdownItem.querySelector(".dropdown-menu");

  // [新增] 快取檢查：如果已經載入過，就不再發送 API
  if (menu.getAttribute("data-loaded") === "true") {
    return;
  }

  // 清空原有內容
  menu.innerHTML =
    '<li class="li-list-item" style="padding:10px 20px; color:#999; font-size:14px;">載入中...</li>';

  let owner_cid = window.sessionStorage.getItem("group_cid");
  let product_type = window.sessionStorage.getItem("product_type");

  console.log(
    `[ListSpec04] Querying specs for Owner: ${owner_cid}, Product: ${product_type}`,
  );

  // [優化] 移除全螢幕 Loading，改用局部文字提示，避免干擾操作
  // VisibleLoaderElement(true);

  setTimeout(function () {
    CsRequestDeviceSpec04BGroupByCondition00(
      owner_cid,
      product_type,
      function (ok, result) {
        // VisibleLoaderElement(false);

        if (!ok) {
          menu.innerHTML =
            '<li class="li-list-item" style="padding:10px 20px; color:red; font-size:14px;">載入失敗</li>';
          return;
        }
        let json_object = JSON.parse(result); // 解析 JSON
        console.log("[ListSpec04] API Response:", json_object);

        if (show_errno(json_object.errno) != "") {
          return;
        }

        // 清空 "載入中..." 提示
        menu.innerHTML = "";

        // 處理API返回的spec04數據
        if (json_object.spec04_list && json_object.spec04_list.length > 0) {
          // 從API回應中提取spec04陣列，spec04_list是二維陣列，取第一個子陣列
          const spec04Array = json_object.spec04_list[0] || [];

          // 動態生成下拉選單項目
          spec04Array.forEach((spec04Name) => {
            const li = document.createElement("li");
            li.className = "li-list-item";
            li.style.cursor = "pointer";

            // 設置data-content屬性用於頁面跳轉
            li.setAttribute(
              "data-content",
              spec04Name.toLowerCase().replace(/\s+/g, "-"),
            );

            const a = document.createElement("a");
            a.href = "#";
            a.textContent = spec04Name;
            a.style.color = "black";
            a.onclick = (e) => {
              e.preventDefault();
              console.log(`你點了產品型號：${spec04Name}`);

              // 儲存選擇的spec04到sessionStorage
              window.sessionStorage.setItem("selected_spec04", spec04Name);

              // 跳轉到對應的license頁面
              const currentProductType =
                window.sessionStorage.getItem("product_type") || "avacast";
              window.location.href = `distributor_license.html?product=${currentProductType}`;
            };

            li.appendChild(a);
            menu.appendChild(li);
          });

          // 重新綁定點擊事件
          initDropdownItemEvents();

          // [新增] 標記為已載入
          menu.setAttribute("data-loaded", "true");
        } else {
          console.log("[ListSpec04] No spec data found.");
          // 顯示空狀態
          const li = document.createElement("li");
          li.className = "li-list-item";
          li.innerHTML =
            '<a href="#" style="color: #999; cursor: default;">無型號資料</a>';
          menu.appendChild(li);
          menu.setAttribute("data-loaded", "true"); // 即使沒資料也標記已載入，避免重複查
        }
      },
    );
  }, 500);
}

// 重新綁定下拉選單項目的事件
function initDropdownItemEvents() {
  const dropdownItems = document.querySelectorAll(".li-list-item");

  dropdownItems.forEach((item) => {
    // 移除舊的事件監聽器，避免重複綁定
    item.replaceWith(item.cloneNode(true));
  });

  // 重新獲取元素並綁定事件
  const newDropdownItems = document.querySelectorAll(".li-list-item");

  newDropdownItems.forEach((li) => {
    li.addEventListener("click", () => {
      // 移除其他項目的active狀態
      newDropdownItems.forEach((otherLi) => {
        otherLi.classList.remove("active");
        const otherImg = otherLi.querySelector(".icon-img");
        if (otherImg) {
          otherImg.src = otherImg.dataset.normal;
        }
      });

      // 設置當前項目為active
      li.classList.add("active");
      const thisImg = li.querySelector(".icon-img");
      if (thisImg) {
        thisImg.src = thisImg.dataset.change;
      }
    });
  });
}

// [新增] 綁定側邊欄事件 (修復 ReferenceError)
function bindSidebarEvents() {
  console.log("Binding Sidebar Events");

  // 1. Dropdown Toggles (下拉選單開關)
  const dropdownItems = document.querySelectorAll(".dropdown-item");
  dropdownItems.forEach((item) => {
    const toggle = item.querySelector(".dropdown-toggle");
    const menu = item.querySelector(".dropdown-menu");

    if (!toggle || !menu) return;

    // 使用 cloneNode 移除舊的事件監聽器，防止重複綁定
    const newToggle = toggle.cloneNode(true);
    toggle.parentNode.replaceChild(newToggle, toggle);

    newToggle.addEventListener("click", (e) => {
      e.preventDefault();

      // 檢查是否需要跳轉頁面 (如果不在 distributor_license.html，則跳轉)
      const currentProductType =
        window.sessionStorage.getItem("product_type") || "avacast";
      if (window.location.pathname.indexOf("distributor_license.html") === -1) {
        window.location.href = `distributor_license.html?product=${currentProductType}`;
        return;
      }

      const isCurrentlyOpen = menu.classList.contains("show");

      // 關閉其他已開啟的選單
      dropdownItems.forEach((otherItem) => {
        if (otherItem !== item) {
          const otherMenu = otherItem.querySelector(".dropdown-menu");
          const otherToggle = otherItem.querySelector(".dropdown-toggle");
          if (otherMenu) otherMenu.classList.remove("show");
          if (otherToggle) otherToggle.classList.remove("active");
        }
      });

      // 切換當前選單狀態
      if (isCurrentlyOpen) {
        menu.classList.remove("show");
        newToggle.classList.remove("active");
      } else {
        // [優化] 只有在「展開」且「尚未載入」時才呼叫 API
        const licenseSpan = e.currentTarget.querySelector(".item-label");
        if (licenseSpan && menu.getAttribute("data-loaded") !== "true") {
          ListSpec04(licenseSpan);
        }

        menu.classList.add("show");
        newToggle.classList.add("active");
      }
    });
  });

  // 2. List Items Active State (型號列表點擊效果)
  // 呼叫既有的 initDropdownItemEvents 函式
  initDropdownItemEvents();

  // 3. Initialize Page Navigation (初始化頁面跳轉連結)
  // 這會處理 .nav-item 和 .li-list-item 的 data-content 跳轉
  if (typeof initPageNavigation === "function") {
    initPageNavigation();
  }
}

// 插入 HTML 到容器的函數
function insertSidebarHtml() {
  const container = document.getElementById("sidebar-distributor-container");

  // 檢查是否需要插入 HTML
  if (container && !container.innerHTML.trim()) {
    container.innerHTML = getSidebarHtml();
    console.log("Sidebar HTML inserted successfully");

    // [新增] 插入 HTML 後立即進行翻譯，確保多語言標籤被正確替換
    if (typeof renderTemplate === "function") {
      const lang = window.localStorage.getItem("language") || "zh-tw";
      renderTemplate(lang, "sidebar-distributor-container");
    }
  }

  // [修正] 插入 HTML 後立即綁定事件，確保點擊有效
  bindSidebarEvents();

  // 無論是否剛插入 HTML，都嘗試初始化切換功能（確保事件監聽器被綁定）
  initSidebarToggle();
}

// 初始化側邊欄切換功能
function initSidebarToggle() {
  const toggleBtn = document.getElementById("toggleSidebar");
  const sidebar = document.getElementById("sidebar");
  const toggleIcon = document.getElementById("toggleIcon");

  console.log("Initializing Sidebar Toggle...", {
    toggleBtn,
    sidebar,
    toggleIcon,
  });

  if (toggleBtn && sidebar) {
    // 移除舊的監聽器（如果是重新綁定）- 雖然 replaceWith 不推薦用於此，但這裡是為了簡單確保不重複
    // 更好的方式是檢查是否已經綁定，或者依賴外層邏輯控制。這裡使用 cloneNode 移除舊事件。
    const newToggleBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);

    // 重新獲取引用（因為 clone 後引用變了）
    const activeToggleBtn = document.getElementById("toggleSidebar");
    // 重新獲取 icon 引用，因為它在 button 內部，也被 clone 了
    const activeToggleIcon = document.getElementById("toggleIcon");

    activeToggleBtn.addEventListener("click", function (e) {
      e.stopPropagation(); // 防止事件冒泡
      console.log("Sidebar toggle clicked");
      sidebar.classList.toggle("expanded");

      // 旋轉圖標
      if (sidebar.classList.contains("expanded")) {
        if (activeToggleIcon)
          activeToggleIcon.style.transform = "rotate(180deg)";
      } else {
        if (activeToggleIcon) activeToggleIcon.style.transform = "rotate(0deg)";
      }
    });
    console.log("Sidebar toggle event listener attached.");
  } else {
    console.warn("Sidebar toggle elements not found.");
  }
}

// 根據當前 DOM 狀態決定執行時機
if (document.readyState === "loading") {
  // DOM 還在載入中，等待 DOMContentLoaded
  document.addEventListener("DOMContentLoaded", insertSidebarHtml);
} else {
  // DOM 已經載入完成，立即執行
  insertSidebarHtml();
}

document.addEventListener("DOMContentLoaded", () => {
  // [優化] DOMContentLoaded 只負責載入必要模組，
  // 事件綁定已移至 bindSidebarEvents，並由 insertSidebarHtml 或 readiness check 觸發。

  WriteIncludeAbsoluteScript("modules/app.module.device.js");
});

// 頁面映射配置
function getPageMapping() {
  // 根據當前選擇的產品類型決定跳轉目標
  const productType =
    window.sessionStorage.getItem("product_type") || "avacast";

  // [修正] 統一 dashboard 頁面，並使用 product 參數
  const dashboardPage = `distributor_dashboard.html?product=${productType}`;
  // [整合] 訂單資訊頁面合併至 license.html
  const listPage = `license.html?product=${productType}`;

  const mapping = {
    dashboard: dashboardPage,
    orders: listPage,
    "distributor-dashboard": dashboardPage,
  };

  if (productType !== "avaclassroom") {
    const licensePage = `distributor_license.html?product=${productType}`;
    mapping["distributor-license"] = licensePage;
    mapping["jector-digital"] = licensePage; // JECTOR 使用
    mapping["genetouch"] = licensePage; // GeneTouch 使用
    mapping["jjnet"] = licensePage; // JJNET 使用
  }

  return mapping;
}

// 根據當前頁面設定活躍狀態
function setActiveStateFromCurrentPage() {
  const currentPage = window.location.pathname.split("/").pop();
  console.log("Current page:", currentPage);

  // 清除所有活躍狀態
  const navItems = document.querySelectorAll(".nav-item");
  const dropdownItems = document.querySelectorAll(".li-list-item");

  navItems.forEach((nav) => nav.classList.remove("active"));
  dropdownItems.forEach((li) => li.classList.remove("active"));

  // 根據頁面設定對應項目為活躍
  const pageMapping = getPageMapping();
  let activeContentType = null;

  // 找到對應的 content type
  for (const [contentType, pageUrl] of Object.entries(pageMapping)) {
    // [修正] 處理帶有 URL 參數的頁面
    if (pageUrl.split("?")[0] === currentPage) {
      activeContentType = contentType;
      break;
    }
  }

  if (activeContentType) {
    console.log("Setting active state for:", activeContentType);

    // 設定導航項目活躍狀態
    const activeNavItem = document.querySelector(
      `.nav-item[data-content="${activeContentType}"]`,
    );
    if (activeNavItem) {
      activeNavItem.classList.add("active");
    }

    // 設定下拉選單項目活躍狀態
    const activeDropdownItem = document.querySelector(
      `.li-list-item[data-content="${activeContentType}"]`,
    );
    if (activeDropdownItem) {
      activeDropdownItem.classList.add("active");

      // 如果是下拉選單項目，也需要展開下拉選單
      const dropdown = activeDropdownItem.closest(".dropdown-item");
      if (dropdown) {
        const menu = dropdown.querySelector(".dropdown-menu");
        const toggle = dropdown.querySelector(".dropdown-toggle");
        const icon = toggle.querySelector(".point-icon");

        if (menu && toggle && icon) {
          menu.classList.add("show");
          toggle.classList.add("active");
          icon.classList.add("show");
        }
      }
    }
  }
}

// 初始化直接頁面跳轉功能
function initPageNavigation() {
  // 設定當前頁面的活躍狀態
  setActiveStateFromCurrentPage();

  // 為導航項目添加點擊事件 - 直接頁面跳轉
  const navItems = document.querySelectorAll(".nav-item[data-content]");
  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const contentType = this.getAttribute("data-content");
      const pageMapping = getPageMapping();
      const pageUrl = pageMapping[contentType];

      if (pageUrl) {
        console.log(`Navigating to: ${pageUrl}`);
        window.location.href = pageUrl;
      } else {
        console.error(`No page mapping found for: ${contentType}`);
      }
    });
  });

  // 為下拉選單項目添加點擊事件 - 直接頁面跳轉
  const dropdownItems = document.querySelectorAll(
    ".li-list-item[data-content]",
  );
  dropdownItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const contentType = this.getAttribute("data-content");
      const pageMapping = getPageMapping();
      const pageUrl = pageMapping[contentType];

      if (pageUrl) {
        console.log(`Navigating to: ${pageUrl}`);
        window.location.href = pageUrl;
      } else {
        console.error(`No page mapping found for: ${contentType}`);
      }
    });
  });
}
