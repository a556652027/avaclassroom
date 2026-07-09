(function () {
  function PageContainer(containerId) {
    this.container = document.querySelector(containerId);
    this.pages = this.container.querySelectorAll(".page");
    this.currentPage = null;
    this.params = {}; // 儲存參數

    this.addStyles();

    // 初始化時隱藏所有頁面
    this.pages.forEach((page) => {
      page.style.display = "none";
      page.style.opacity = "0"; // 確保初始狀態為透明
    });
  }

  PageContainer.prototype.changePage = function (nextPage, options) {
    const self = this;
    const changeHash =
      options && options.changeHash ? options.changeHash : false;
    const targetPageId =
      options && options.targetPageId ? options.targetPageId : null;
    const params = options && options.params ? options.params : {};

    // [Phase 1 優化] 切換頁面或路由時主動回收全域巨大快取，防止 Memory Leak
    if (typeof window._allDeviceRecordsCache !== "undefined")
      window._allDeviceRecordsCache = null;
    if (typeof window._revokedDeviceRecordsCache !== "undefined")
      window._revokedDeviceRecordsCache = null;
    if (typeof window._allLicenseRecordsCache !== "undefined")
      window._allLicenseRecordsCache = null;
    if (typeof window._revokedLicenseRecordsCache !== "undefined")
      window._revokedLicenseRecordsCache = null;

    // [Phase 2 優化] 統一釋放駐留在記憶體中的 WebGL/Canvas 實例 (Chart.js)，防止破圖與崩潰
    if (typeof Chart !== "undefined" && Chart.instances) {
      for (let id in Chart.instances) {
        Chart.instances[id].destroy();
      }
    }

    // [Phase 2 優化] 觸發全域廣播，通知各模組執行清理動作 (如中斷未完成的 API 或清空物件參考)
    window.dispatchEvent(new CustomEvent("spa:page-change-before", { detail: { nextPage, targetPageId } }));

    this.params = params;

    if (!nextPage || nextPage.trim() === "") {
      // 沒指定就選第一個內部 page
      if (this.pages.length > 0) {
        nextPage = this.pages[0].id;
      } else {
        console.error("No pages found to load.");
        return;
      }
    }

    if (this.isUrl(nextPage)) {
      window.location.href = nextPage;
    } else {
      this.loadInternalPage(nextPage, changeHash, params);
    }
  };

  PageContainer.prototype.getParams = function () {
    return this.params;
  };

  PageContainer.prototype.goBack = function () {
    if (document.referrer) {
      window.location.href = document.referrer;
    } else {
      history.back();
    }
  };

  PageContainer.prototype.isUrl = function (str) {
    return (
      str.includes(".html") ||
      str.includes(".js") ||
      str.startsWith("http") ||
      str.startsWith("/")
    );
  };

  PageContainer.prototype.loadInternalPage = function (
    pageId,
    changeHash,
    params,
  ) {
    const self = this;

    // 1. 隱藏所有頁面
    this.pages.forEach((page) => {
      page.style.display = "none";
      page.style.opacity = "0";
    });

    const targetPage = this.container.querySelector("#" + pageId);
    if (!targetPage) {
      console.error("Page with ID '" + pageId + "' not found.");
      return;
    }

    // 2. 顯示目標頁面並執行淡入動畫
    targetPage.style.display = "block";

    // 使用 requestAnimationFrame 確保 display:block 生效後才改變 opacity
    requestAnimationFrame(() => {
      // 再次確保 transition 屬性存在
      targetPage.style.transition = "opacity 0.3s ease-in-out";
      targetPage.style.opacity = "1";
    });

    self.currentPage = targetPage;
    self.handlePageParams(targetPage, params);

    if (changeHash) {
      window.location.hash = pageId;
    }
  };

  PageContainer.prototype.handlePageParams = function (page, params) {
    if (params && Object.keys(params).length > 0) {
      const target = page.querySelector(".page-params");
      if (target) {
        target.textContent = JSON.stringify(params);
      }
    }
  };

  PageContainer.prototype.addStyles = function () {
    const styleId = "page-container-core-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      .page {
        position: relative;
        width: 100%;
        min-height: 100%;
        backface-visibility: hidden;
        transform-origin: center;
        box-sizing: border-box;
        transition: opacity 0.3s ease-in-out;
        opacity: 0;
      }
    `;
    document.head.appendChild(style);
  };

  window.PageContainer = PageContainer;
})();

function change_page(nextPage, options) {
  window.pageContainer.changePage(nextPage, options);
}

function get_page_params() {
  return window.pageContainer.getParams();
}

// [優化] 將初始化邏輯封裝，合併冗餘的監聽器
function initPageContainerSetup() {
  if (!window.pageContainer) {
    window.pageContainer = new PageContainer("body");
  }

  // 🔽 自動根據 hash 切換頁面
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.substring(1));
  const pageNum = params.get("page");

  // 預設顯示 page01
  change_page(pageNum || "page01", { changeHash: false });

  // 如果有 #app 預設是 hidden，可在這裡自動顯示
  //const app = document.getElementById("app");
  //if (app && app.style.visibility === "hidden") {
  //    app.style.visibility = "visible";
  //}
}

// [相依性狀態管理] 確保非同步載入時，若 DOM 已解析完畢也能正確執行
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPageContainerSetup);
} else {
  initPageContainerSetup();
}
