// home.html 的頁面事件操控程式碼相關

//_____________________________________________________________________________________
// function 相關
function goto_page() {
  change_page_random("#page2");
}

//_____________________________________________________________________________________
// 事件相關

async function initHomeView() {
  console.log("Home View Initializing...");

  // i18n 渲染
  const lang = window.localStorage.getItem("language") || "zh-tw";
  if (typeof renderTemplate === "function") {
    await renderTemplate(lang, "app");
  }

  // 顯示放最後 等都完成後
  showTemplate("app");

  // [新增] 移除靜態 Loading 遮罩
  if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(false);
}

// -----------------------------------------------------------
// 依賴狀態管理：確保核心函式庫載入後才執行
// -----------------------------------------------------------
function startHomeApp() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHomeView);
  } else {
    initHomeView();
  }
}

if (window._CoreLoaded) {
  startHomeApp();
} else {
  window.addEventListener("CoreDependenciesReady", startHomeApp);
}
