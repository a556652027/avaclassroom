// index.html 的頁面事件操控程式碼相關

// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints,
// and then run "window.location.reload()" in the JavaScript Console.
/*
$(document).on('pagebeforecreate', function () { console.log('pagebeforecreate'); });
$(document).on('pagecreate', function () { console.log('pagecreate'); });
$(document).on('pageinit', function () { console.log('pageinit'); });
$(document).on('pagebeforehide', function () { console.log('pagebeforehide'); });
$(document).on('pagebeforeshow', function () { console.log('pagebeforeshow'); });
$(document).on('pageremove', function () { console.log('pageremove'); });
$(document).on('pageshow', function () { console.log('pageshow'); });
$(document).on('pagehide', function () { console.log('pagehide'); });
$(window).load(function () { console.log("window loaded"); });
$(window).unload(function () { console.log("window unloaded"); });
*/

function initLogoutView() {
  console.log("Logout View Initializing...");

  // [新增] 強制清除 SessionStorage，確保登出後無法透過 URL 返回
  window.sessionStorage.clear();

  // [新增] 移除靜態 Loading 遮罩
  if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(false);

  //		$(":mobile-pagecontainer").pagecontainer("change", "#page1", { transition: "fade", changeHash: false  });
  // or use timer
  if (typeof change_page === "function") {
    change_page("index.html");
  } else {
    window.location.href = "index.html";
  }
  //$.mobile.changePage($(document.location.href = next_page), { transition: RandonDataTrabsition() });
}

// -----------------------------------------------------------
// 依賴狀態管理：確保核心函式庫載入後才執行
// -----------------------------------------------------------
function startLogoutApp() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLogoutView);
  } else {
    initLogoutView();
  }
}

if (window._CoreLoaded) {
  startLogoutApp();
} else {
  window.addEventListener("CoreDependenciesReady", startLogoutApp);
}
