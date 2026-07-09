console.log("Navbar Loaded");

//___________________________________________________________
// 替代從html讀入 因為目前不可行
function getNavbarHtml() {
  return `
<nav class="custom-topnav">
  <div class="topnav-logo-container">
    <img src="assets/images/logo.svg" alt="" class="topnav-logo-desktop" />
    <img src="assets/images/logo (1).svg" alt="" class="topnav-logo-mobile" />
  </div>
  <div class="topnav-content">
    <ul class="topnav-menu">
      <li>
        <a href="#" class="topnav-link" data-product="avacast">AVACAST</a>
      </li>
      <li>
        <a href="#" class="topnav-link" data-product="illuminet">IllumiNet</a>
      </li>
      <li>
        <a href="#" class="topnav-link" data-product="avaclassroom">AVA Classroom</a>
      </li>
    </ul>
    <!-- 跳出框 -->
    <div class="topnav-user-menu">
      <!-- 觸發圖示 -->
      <div class="topnav-user-avatar topnav-login">
        <img src="assets/images/Group 1043.svg" alt="" />
      </div>

      <!--  跳出框放進 relative 容器內 -->
      <div class="custom-topnav-usermenu-dropdown topnav-login-section">
        <div class="topnav-user-info">
          <img
            src="assets/images//帳戶.svg"
            alt=""
            class="topnav-user-avatar-small"
          />
          <p>distributor</p>
        </div>
        <a href="#" class="topnav-dropdown-item account-settings" onclick="if(typeof DistributorProfileModal !== 'undefined') { DistributorProfileModal.show(); } return false;">{{sidebarnav.sub_system_profile}}</a>
        <a href="logout.html" class="topnav-dropdown-item logout">{{sidebarnav.sub_system_logout}}</a>
      </div>
    </div>
    <!-- 跳出框 -->
  </div>
</nav>
`;
}

//___________________________________________________________
// 讀入css
(function () {
  var navbar_link = document.createElement("link");

  // 設定 <link> 元素的屬性
  navbar_link.rel = "stylesheet";
  navbar_link.type = "text/css";
  navbar_link.href = "components/distributor/navbar.css";

  // 將 <link> 元素插入到 <head> 區域
  document.getElementsByTagName("head")[0].appendChild(navbar_link);
})();

//___________________________________________________________
// 讀入navbar (只有在 navbar-container 存在時才注入)
const navbarContainer = document.getElementById("navbar-distributor-container");
if (navbarContainer) {
  navbarContainer.innerHTML = getNavbarHtml();
  // [新增] 立即翻譯 Navbar，解決動態載入後顯示 {{...}} 模板代碼的問題
  if (typeof renderTemplate === "function") {
    const lang = window.localStorage.getItem("language") || "zh-tw";
    renderTemplate(lang, "navbar-distributor-container");
    console.log("✅ Distributor Navbar translated.");
  }
}

// 初始化 navbar 事件監聽器
function initNavbarEvents() {
  const login = document.querySelector(".topnav-login");
  const login_section = document.querySelector(".topnav-login-section");

  if (login && login_section) {
    console.log("Found elements:", { login, login_section });

    // 滑鼠進入時顯示下拉選單
    login.addEventListener("mouseenter", () => {
      login_section.classList.add("show");
    });

    // 滑鼠離開時隱藏下拉選單
    login_section.addEventListener("mouseleave", () => {
      login_section.classList.remove("show");
    });

    // 添加點擊事件監聽器到下拉選單項目
    const dropdownItems = document.querySelectorAll(".topnav-dropdown-item");
    dropdownItems.forEach((item) => {
      item.addEventListener("click", function (e) {
        // 點擊後隱藏下拉選單
        login_section.classList.remove("show");

        console.log("Navigating to:", this.href);
      });
    });
  } else {
    console.log("Topnav elements not found:", { login, login_section });
    // 嘗試查找所有可能的元素來調試
    console.log(
      "All topnav-login elements:",
      document.querySelectorAll(".topnav-login"),
    );
    console.log(
      "All topnav-login-section elements:",
      document.querySelectorAll(".topnav-login-section"),
    );
  }

  // 更新用戶顯示名稱為 member_cid
  updateUserDisplayName();
}

// 更新用戶顯示名稱
function updateUserDisplayName() {
  const memberCid = window.sessionStorage.getItem("member_cid");
  const userInfoElement = document.querySelector(".topnav-user-info p");

  if (userInfoElement && memberCid) {
    userInfoElement.textContent = memberCid;
    console.log("Updated user display name to:", memberCid);
  }
}

// 新增一個函數來更新選中的連結樣式
function updateActiveLink() {
  const productType = window.sessionStorage.getItem("product_type");
  if (!productType) return;

  document.querySelectorAll(".topnav-link").forEach((link) => {
    link.classList.remove("active");
    if (link.dataset.product === productType) {
      link.classList.add("active");
    }
  });
}

// 如果DOM已經載入完成，直接初始化；否則等待DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNavbarEvents);
} else {
  initNavbarEvents();
}

document.addEventListener("DOMContentLoaded", function () {
  // 檢查 session storage 中是否已有 product_type，若無則設定預設值
  if (!window.sessionStorage.getItem("product_type")) {
    window.sessionStorage.setItem("product_type", "avacast");
  }

  // 頁面載入時，根據儲存的狀態更新 active 樣式
  updateActiveLink();

  // 為所有產品連結加上點擊事件
  document.querySelectorAll(".topnav-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault(); // 阻止預設的跳轉行為

      const productType = event.currentTarget.dataset.product;
      console.log("✅ Distributor 點擊了產品：", productType);

      // 1. 儲存新的產品類型
      window.sessionStorage.setItem("product_type", productType);

      // 2. 更新高亮樣式
      updateActiveLink();

      // 3. [修正] 強制跳轉到統一的儀表板，並帶上 product 參數
      change_page(`distributor_dashboard.html?product=${productType}`);
    });
  });
});
