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

///////////////////////////////////////////////////////////////////////////////////////
//
// You must connect a handler to the mobileinit event before you load jQuery Mobile
$(document).on("mobileinit", function () {
    console.log("mobileinit");
    // to fix change page inside document ready will back to previous page in Safari
    // NOTE: https://github.com/jquery/jquery-mobile/issues/8368
    $.mobile.pushStateEnabled = false;
});

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
    change_page("login.html");
    //$.mobile.changePage($(document.location.href = next_page), { transition: RandonDataTrabsition() });
});
