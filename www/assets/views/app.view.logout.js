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

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Document ready...");
    //		$(":mobile-pagecontainer").pagecontainer("change", "#page1", { transition: "fade", changeHash: false  });
    // or use timer
    change_page("index.html");
    //$.mobile.changePage($(document.location.href = next_page), { transition: RandonDataTrabsition() });
});
