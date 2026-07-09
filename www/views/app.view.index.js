// index.html 的頁面事件操控程式碼相關

// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints,
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
  "use strict";

  document.addEventListener("deviceready", onDeviceReady.bind(this), false);

  function onDeviceReady() {
    // Handle the Cordova pause and resume events
    document.addEventListener("pause", onPause.bind(this), false);
    document.addEventListener("resume", onResume.bind(this), false);

    // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
    var parentElement = document.getElementById("deviceready");
    var listeningElement = parentElement.querySelector(".listening");
    var receivedElement = parentElement.querySelector(".received");
    listeningElement.setAttribute("style", "display:none;");
    receivedElement.setAttribute("style", "display:block;");
  }

  function onPause() {
    // TODO: This application has been suspended. Save application state here.
  }

  function onResume() {
    // TODO: This application has been reactivated. Restore application state here.
  }
})();

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

function initIndexView() {
  console.log("Document ready...");

  // [新增] 移除靜態 Loading 遮罩
  if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(false);

  // [優化] 自動登入檢查
  // 如果 Session Token 存在，直接進入儀表板，否則進入登入頁
  const sessionToken = window.sessionStorage.getItem("session_token");
  if (sessionToken && sessionToken !== "undefined" && sessionToken !== "null") {
    console.log("✅ Session found, redirecting to Dashboard...");
    change_page("dashboard.html");
  } else {
    change_page("login.html");
  }
}

// -----------------------------------------------------------
// 依賴狀態管理：確保核心函式庫載入後才執行
// -----------------------------------------------------------
function startIndexApp() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initIndexView);
  } else {
    initIndexView();
  }
}

if (window._CoreLoaded) {
  startIndexApp();
} else {
  window.addEventListener("CoreDependenciesReady", startIndexApp);
}
