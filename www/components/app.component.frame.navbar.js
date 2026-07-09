console.log("Navbar Loaded");

//___________________________________________________________
// 替代從html讀入 因為目前不可行
function getNavbarHtml() {
  return `
<nav class="custom-topnav">
  <div class="topnav-logo-container">
    <button id="mobile-hamburger-btn" class="mobile-hamburger-btn">
      <svg viewBox="0 0 24 24" width="28" height="28" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
    </button>
    <img src="assets/images/logo.svg" alt="" class="topnav-logo-desktop" />
    <img src="assets/images/logo (1).svg" alt="" class="topnav-logo-mobile" />
  </div>
  <div class="topnav-content">
    <ul class="topnav-menu" id="dynamic-topnav-menu">
      <!-- 產品選項將由 JS 動態生成 -->
    </ul>
  </div>
  <!-- 跳出框移出 overflow 結界，避免下拉選單被裁剪 -->
  <div class="topnav-user-menu">
    <!-- 觸發圖示 -->
    <div class="topnav-user-avatar topnav-login">
      <img src="assets/images/Group 1043.svg" alt="" />
    </div>

      <!--  跳出框放進 relative 容器內 -->
      <div class="custom-topnav-usermenu-dropdown topnav-login-section">
        <div class="topnav-user-info">
          <img
            src="assets/images/帳戶.svg"
            alt=""
            class="topnav-user-avatar-small"
          />
          <p>sales</p>
        </div>
        <a href="#" class="topnav-dropdown-item account-settings" onclick="if(typeof ProfileModal !== 'undefined') { ProfileModal.show(); } return false;">{{sidebarnav.sub_system_profile}}</a>
        <a href="admin_tools.html" id="nav-admin-tools" class="topnav-dropdown-item admin-tools" style="display: none;">{{sidebarnav.admin_tools}}</a>
        <a href="logout.html" class="topnav-dropdown-item logout">{{sidebarnav.sub_system_logout}}</a>
      </div>
    </div>
</nav>
`;
}

//___________________________________________________________
// 讀入css
(function () {
  if (
    !document.querySelector(
      'link[href="components/app.component.frame.navbar.css"]',
    )
  ) {
    var navbar_link = document.createElement("link");
    navbar_link.rel = "stylesheet";
    navbar_link.type = "text/css";
    navbar_link.href = "components/app.component.frame.navbar.css";
    document.getElementsByTagName("head")[0].appendChild(navbar_link);
  }

  if (!document.getElementById("navbar-custom-style")) {
    // [新增] 調整 Navbar 高度為 60px (原為 72px)，使其更緊湊
    var style = document.createElement("style");
    style.id = "navbar-custom-style";
    style.innerHTML = `
      .custom-topnav {
          height: 60px !important;
          min-height: 60px !important;
      }
      .topnav-logo-container {
          height: 60px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: flex-start !important;
          padding-left: 20px !important;
      }
      .topnav-content {
          height: 60px !important;
      }
      .topnav-user-menu {
          height: 60px !important;
          width: 60px !important;
      }
      .topnav-link {
          height: 60px !important;
      }
      .topnav-logo-desktop, .topnav-logo-mobile {
          max-height: 36px; /* 配合高度縮小 Logo */
          width: auto !important; /* 保持圖片比例 */
      }
      nav.custom-topnav .custom-topnav-usermenu-dropdown {
          top: 65px !important; /* 配合 60px 導覽列調整彈出位置，消除視覺斷層 */
      }
      /* [新增] 避免 Layout Thrashing 造成的左右閃爍，先隱藏選單，對齊 Sidebar 後瞬間解鎖 */
      .topnav-menu {
          opacity: 0;
      }
    `;
    document.head.appendChild(style);
  }
})();

//___________________________________________________________
// 將 DOM 注入與翻譯封裝，等待相依性準備好後執行
async function mountNavbar() {
  const navbarContainer = document.getElementById("navbar-container");
  if (navbarContainer) {
    navbarContainer.innerHTML = getNavbarHtml();
    // [新增] 立即翻譯 Navbar，解決動態載入後顯示 {{...}} 模板代碼的問題
    if (typeof renderTemplate === "function") {
      const lang = window.localStorage.getItem("language") || "zh-tw";
      await renderTemplate(lang, "navbar-container");
      console.log("✅ Admin Navbar translated.");
    }
  }
  initAllNavbarLogic();
}

// 更新用戶顯示名稱
function updateUserDisplayName() {
  const memberCid = window.sessionStorage.getItem("member_cid");
  const userInfoElement = document.querySelector(".topnav-user-info p");

  if (userInfoElement && memberCid) {
    userInfoElement.textContent = memberCid;
    console.log("Updated user display name to:", memberCid);
  }

  // [權限控制] 僅超級管理員 (0) 與系統管理員 (1) 顯示進階工具
  const userTier = window.sessionStorage.getItem("tier");
  if (userTier === "0" || userTier === "1") {
    const adminToolsLink = document.getElementById("nav-admin-tools");
    if (adminToolsLink) adminToolsLink.style.display = "block";
  }
}

// [修正] 將原本散落在 DOMContentLoaded 的邏輯封裝並立即執行
function initAllNavbarLogic() {
  console.log("Initializing Navbar Logic...");

  // [Phase 1 優化] 使用 AbortController 來確保事件不會重複綁定
  if (window._navEventController) window._navEventController.abort();
  window._navEventController = new AbortController();
  const signal = window._navEventController.signal;

  // [優化] 將所有 Navbar 互動改為事件委派 (Event Delegation)
  document.addEventListener(
    "click",
    (e) => {
      const loginSection = document.querySelector(".topnav-login-section");

      // 1. 攔截：點擊下拉選單內部 (確保選項能被點擊，且不會意外收合選單)
      if (e.target.closest(".topnav-login-section")) {
        const dropdownItem = e.target.closest(".topnav-dropdown-item");
        if (dropdownItem) {
          if (loginSection) loginSection.classList.remove("show");
          if (dropdownItem.classList.contains("logout")) {
            e.preventDefault();
            console.log("執行 SPA 瞬間登出");
            window.sessionStorage.clear();
            if (typeof change_page === "function") change_page("login.html");
            else window.location.href = "login.html";
          }
        }
        return;
      }

      // 2. 攔截：點擊整個 60x60 的反白區域 (展開/收合選單)
      if (e.target.closest(".topnav-user-menu")) {
        if (loginSection) loginSection.classList.toggle("show");
        return;
      }

      // 3. 攔截：點擊產品切換標籤 (AVACAST / IllumiNet ...)
      const topnavLink = e.target.closest(".topnav-link");
      if (topnavLink) {
        e.preventDefault();
        const pType = topnavLink.dataset.product;
        console.log("✅ 點擊了產品：", pType);

        // [防呆] 切換非 avaclassroom 產品時，若當前選中 group_cid 為學校 (以 sch_ 開頭)，則將其退回為 parent 代理商/公司 ID
        if (pType !== "avaclassroom") {
          let currentGroup = window.sessionStorage.getItem("group_cid") || window.sessionStorage.getItem("select_group_cid") || "";
          if (currentGroup && currentGroup.startsWith("sch_")) {
            // [修正] 優先使用儲存的公司 ID (school_parent_company_cid) 或登入保底 ID，防範字串解析退回為人 (member_cid)
            const parentCompanyCid = window.sessionStorage.getItem("school_parent_company_cid") || window.sessionStorage.getItem("login_group_cid");
            if (parentCompanyCid) {
              console.log(`[Navbar] 偵測到切換非 avaclassroom 產品，且當前群組為學校 (${currentGroup})，自動回退至代理商公司群組 (${parentCompanyCid})`);
              window.sessionStorage.setItem("group_cid", parentCompanyCid);
              window.sessionStorage.setItem("select_group_cid", parentCompanyCid);
              // [新增] 回退至公司時，清除已選的學校顯示名稱，還原為登入時的公司名稱
              const companyName = window.sessionStorage.getItem("company_group_name");
              if (companyName) {
                window.sessionStorage.setItem("select_group_name", companyName);
              } else {
                window.sessionStorage.removeItem("select_group_name");
              }
            }
          }
        }

        // [優化] 當前為公司群組且切換至 avaclassroom 產品時，先非同步預加載其旗下第一所學校 ID，隨後才執行跳轉 (避免二次重載閃爍)
        if (pType === "avaclassroom") {
          let currentGroup = window.sessionStorage.getItem("group_cid") || window.sessionStorage.getItem("select_group_cid") || "";
          if (currentGroup && !currentGroup.startsWith("sch_")) {
            if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(true);
            fetchFirstSchoolOfCompanyDirect(currentGroup, (firstSchool) => {
              if (firstSchool && firstSchool.cid) {
                console.log(`[Navbar] 預先查詢第一所學校成功: ${firstSchool.name} (${firstSchool.cid})，寫入 session`);
                window.sessionStorage.setItem("group_cid", firstSchool.cid);
                window.sessionStorage.setItem("select_group_cid", firstSchool.cid);
                // [儲存] 該學校所屬的代理商/公司群組 ID
                window.sessionStorage.setItem("school_parent_company_cid", currentGroup);
                // [儲存] 該學校的顯示名稱
                window.sessionStorage.setItem("select_group_name", firstSchool.name);
              }
              window.sessionStorage.setItem("product_type", pType);
              document.querySelectorAll(".topnav-link").forEach((l) => {
                l.classList.remove("active");
                if (l.dataset.product === pType) l.classList.add("active");
              });
              change_page(`dashboard.html?product=${pType}`);
            });
            return;
          }
        }

        window.sessionStorage.setItem("product_type", pType);
        document.querySelectorAll(".topnav-link").forEach((l) => {
          l.classList.remove("active");
          if (l.dataset.product === pType) l.classList.add("active");
        });
        change_page(`dashboard.html?product=${pType}`);
        return;
      }

      // 4. 點擊畫面其他空白處時自動關閉選單
      if (!e.target.closest(".topnav-user-menu") && loginSection) {
        loginSection.classList.remove("show");
      }
    },
    { signal },
  );

  // [RWD 修復] 手機版漢堡選單點擊事件
  document.addEventListener("click", (e) => {
    const hamburgerBtn = e.target.closest("#mobile-hamburger-btn");
    if (hamburgerBtn) {
      e.preventDefault();
      e.stopPropagation();
      const sidebar = document.getElementById("sidebar");
      if (sidebar) {
        sidebar.classList.toggle("mobile-open");
      }
      return;
    }

    // [RWD 修復] 點擊主內容區時，自動收合手機版側邊欄
    const sidebar = document.getElementById("sidebar");
    if (sidebar && sidebar.classList.contains("mobile-open") && window.innerWidth <= 768) {
      if (!e.target.closest("#sidebar")) {
        sidebar.classList.remove("mobile-open");
      }
    }
  }, { signal });

  // 更新用戶顯示名稱為 member_cid
  updateUserDisplayName();

  // [修改] 根據後端回傳的權限清單，動態生成產品 Tab
  try {
    const ownedProductsStr = window.sessionStorage.getItem("owned_products");
    const topnavMenu = document.getElementById("dynamic-topnav-menu");
    if (ownedProductsStr && topnavMenu) {
      const ownedProducts = JSON.parse(ownedProductsStr);
      
      // 確保核心產品 (avacast, illuminet, avaclassroom) 的排列順序固定
      const defaultOrder = ["avacast", "illuminet", "avaclassroom"];
      const sortedProducts = [];
      for (const p of defaultOrder) {
        if (ownedProducts.includes(p)) {
          sortedProducts.push(p);
        }
      }
      for (const p of ownedProducts) {
        if (!defaultOrder.includes(p)) {
          sortedProducts.push(p);
        }
      }

      let htmlString = "";
      console.error(`🚨 [DEBUG] Navbar 開始繪製, sortedProducts=`, sortedProducts);
      for (const pType of sortedProducts) {
        const pName = typeof window.getProductName === "function" ? window.getProductName(pType) : pType;
        htmlString += `<li><a href="#" class="topnav-link" data-product="${pType}">${pName}</a></li>`;
      }
      console.error(`🚨 [DEBUG] Navbar htmlString=`, htmlString);
      topnavMenu.innerHTML = htmlString;
    }
  } catch (e) {
    console.error("Error parsing owned_products", e);
  }

  if (!window.sessionStorage.getItem("product_type")) {
    let defProd = window.sessionStorage.getItem("default_product");
    if (!defProd) {
      const ownedStr = window.sessionStorage.getItem("owned_products");
      if (ownedStr) {
        try {
          const owned = JSON.parse(ownedStr);
          if (owned.length > 0) defProd = owned[0];
        } catch (e) { }
      }
    }
    window.sessionStorage.setItem("product_type", defProd || "avacast");
  }

  // 更新選中的連結樣式
  const productType = window.sessionStorage.getItem("product_type");
  if (productType) {
    document.querySelectorAll(".topnav-link").forEach((link) => {
      link.classList.remove("active");
      if (link.dataset.product === productType) {
        link.classList.add("active");
      }
    });
  }

  // [新增] 執行對齊邏輯，並在稍後再次嘗試以確保下方導覽列已載入
  alignTopNavWithBottomNav();
  setTimeout(alignTopNavWithBottomNav, 500);
  setTimeout(alignTopNavWithBottomNav, 1000);

  // [效能優化] 引入 Debounce (防抖動) 與 requestAnimationFrame 解決 Layout Thrashing 卡頓問題
  let _resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => {
      requestAnimationFrame(alignTopNavWithBottomNav);
    }, 50);
  }, { signal }); // [Memory Leak 防護] 加入 signal 自動清理

  // [安全防護] 保底機制：1.5秒後無論如何強制顯示，避免在無下方導覽列的頁面永遠卡在隱藏狀態
  setTimeout(() => {
    const topMenu = document.querySelector(".topnav-menu");
    if (topMenu && topMenu.style.opacity !== '1') {
      topMenu.style.opacity = '1';
    }
  }, 1500);
}

// [新增] 對齊功能：讓上方選單的第一個項目與下方導覽列的第一個項目對齊
function alignTopNavWithBottomNav() {
  const topMenu = document.querySelector(".topnav-menu");
  const logoContainer = document.querySelector(".topnav-logo-container");
  const sidebar = document.getElementById("sidebar");

  if (topMenu && sidebar && logoContainer) {
    // [重構] 每次測量前先將樣式歸零，獲取最原始的乾淨座標
    topMenu.style.paddingLeft = '0px';
    logoContainer.style.removeProperty('width');
    logoContainer.style.removeProperty('padding-left');
    logoContainer.style.removeProperty('justify-content');

    const sidebarRect = sidebar.getBoundingClientRect();
    const topMenuRect = topMenu.getBoundingClientRect();

    // [RWD 優化] 根據螢幕寬度決定對齊基準
    if (window.innerWidth <= 768) {
      // 手機版：設定漢堡按鈕容器的寬度等於下方按鈕的右邊界，藉此將 AVACAST 完美卡位在右側
      const bottomNavFirstItem =
        document.querySelector("#nav-container .nav-item") ||
        document.querySelector("#avaclassroom-nav-container .nav-item");
      const logoContainerRect = logoContainer.getBoundingClientRect();
      let newWidth = 76; // 保底寬度
      if (bottomNavFirstItem && bottomNavFirstItem.getBoundingClientRect().width > 0) {
        newWidth = bottomNavFirstItem.getBoundingClientRect().right - logoContainerRect.left;
      }

      // 使用 setProperty 加上 important 以覆寫 CSS 注入的 !important 預設值
      logoContainer.style.setProperty('width', `${newWidth}px`, 'important');
      logoContainer.style.setProperty('padding-left', '0px', 'important');
      logoContainer.style.setProperty('justify-content', 'center', 'important'); // 讓漢堡按鈕優雅置中
    } else {
      // 桌機版：上方選單左邊界 對齊 Sidebar 的「右邊界」，因為 Sidebar 載入極快，可實現 0 毫秒無縫對齊
      let paddingLeft = sidebarRect.right - topMenuRect.left;
      if (paddingLeft < 0) paddingLeft = 0;
      topMenu.style.paddingLeft = `${paddingLeft}px`;
    }
    // console.log(`Aligning Navbar: Bottom=${bottomRect.left}, Top=${topMenuRect.left}, Padding=${paddingLeft}`);

    // [新增] 座標計算並設定完畢後，瞬間顯示選單
    topMenu.style.opacity = '1';
  }
}

// -----------------------------------------------------------
// 依賴狀態管理：確保核心函式庫與 DOM 皆載入後再初始化
// -----------------------------------------------------------
function startNavbarComponent() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountNavbar);
  } else {
    mountNavbar();
  }
}

if (window._CoreLoaded) {
  startNavbarComponent();
} else {
  window.addEventListener("CoreDependenciesReady", startNavbarComponent);
}

function fetchFirstSchoolOfCompanyDirect(companyCid, onComplete) {
  const userTier = window.sessionStorage.getItem("tier");
  
  const querySchools = (memberCids) => {
    if (memberCids.length === 0) return onComplete(null);
    
    let pending = memberCids.length;
    let firstFoundSchool = null;
    let firstFoundSchoolName = "";
    let finished = false;
    
    const safeComplete = (schoolObj) => {
      if (!finished && onComplete) {
        finished = true;
        onComplete(schoolObj);
      }
    };

    // 2.5 秒超時保底
    const timeoutTimer = setTimeout(() => {
      console.warn("[Navbar] 查詢學校群組超時，啟動跳轉保底...");
      safeComplete(null);
    }, 2500);

    memberCids.forEach((memberCid) => {
      if (typeof Cyberspace === "undefined" || !Cyberspace.Client) {
        pending--;
        if (pending === 0) {
          clearTimeout(timeoutTimer);
          safeComplete(null);
        }
        return;
      }
      Cyberspace.Client.SendRequest(
        "/ava_system/group/select_all_records",
        {
          condition_type: "2", // 以 owner_cid 查詢
          condition_value: memberCid,
          offset: 0,
          row_count: 100
        },
        (ok, result) => {
          if (finished) return;
          pending--;
          if (ok && !firstFoundSchool) {
            try {
              const json = JSON.parse(result);
              if (json.errno == 1 || json.errno == 0) {
                const names = (json.records && json.records.group_name) || [];
                const cids = (json.records && json.records.group_cid) || [];
                const listCids = Array.isArray(cids) ? cids : (cids ? [cids] : []);
                const listNames = Array.isArray(names) ? names : (names ? [names] : []);
                for (let i = 0; i < listCids.length; i++) {
                  const sCid = String(listCids[i]).trim();
                  if (sCid && sCid.startsWith("sch_")) {
                    firstFoundSchool = sCid;
                    firstFoundSchoolName = String(listNames[i] || sCid).trim();
                    break;
                  }
                }
              }
            } catch (e) {}
          }

          if (firstFoundSchool) {
            clearTimeout(timeoutTimer);
            safeComplete({ cid: firstFoundSchool, name: firstFoundSchoolName });
          } else if (pending === 0) {
            clearTimeout(timeoutTimer);
            safeComplete(null);
          }
        }
      );
    });
  };

  if (userTier === "3") {
    const memberCid = window.sessionStorage.getItem("member_cid");
    if (memberCid) {
      querySchools([memberCid]);
    } else {
      onComplete(null);
    }
  } else {
    if (typeof Cyberspace === "undefined" || !Cyberspace.Client) {
      return onComplete(null);
    }
    Cyberspace.Client.SendRequest(
      "/ava_system/member/select_all_records",
      {
        condition_type: 5, // 以 group_cid 查詢
        condition_value: companyCid,
        search_name: "",
        offset: 0,
        row_count: 100
      },
      (ok, result) => {
        try {
          const json = JSON.parse(result);
          if (json.errno == 1 || json.errno == 0) {
            const m_cids = (json.records && json.records.member_cid) || json.member_cid;
            const list = Array.isArray(m_cids) ? m_cids : (m_cids ? [m_cids] : []);
            querySchools(list);
          } else {
            onComplete(null);
          }
        } catch (e) {
          onComplete(null);
        }
      }
    );
  }
}
