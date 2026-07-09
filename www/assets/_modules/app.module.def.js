//________________________________________________________________________________________________________
// 共用的引入區
// 還是得用 write 不然 會無法及時載入
//<!-- 引入 jQuery -->
console.log("import modules");
document.write('<script src="vender/node_modules/jquery/dist/jquery.min.js"></script>');

//<!-- 引入 jquery mobile 的 css 和 JavaScript  請注意，jQuery Mobile 的 CSS 檔案必須在 JavaScript 檔案之前引入-->
document.write('<link rel="stylesheet" href="vender/jquery.mobile/jquery.mobile-1.4.5.min.css" />');
document.write('<script src="vender/jquery.mobile/jquery.mobile-1.4.5.min.js"></script>');

//<!-- 引入 Bootstrap  的 css 和 JavaScript -->
document.write('<link rel="stylesheet" href="vender/node_modules/bootstrap/dist/css/bootstrap.min.css">');
document.write('<script src="vender/node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"></script>');

//<!-- 多語系標籤render -->
document.write('<script src="https://cdn.jsdelivr.net/npm/mustache@4.2.0/mustache.min.js"></script>');
//document.write('<script src="https://cdn.jsdelivr.net/npm/mustache@4.2.0/mustache.min.js"></script>')

//<!-- 多語系文字表 -->
document.write('<script type="text/javascript" src="locales/app.locale.js"></script>');

//<!-- 引入 自建函式庫 -->
document.write('<script src="scripts/lib/lib.proc.util.js"></script>');
document.write('<script src="scripts/lib/lib.proc.net.js"></script>');
document.write('<script src="scripts/lib/lib.proc.md5.js"></script>');
document.write('<script src="scripts/lib/lib.proc.time.js"></script>');

//<!-- 引入 控制頁面相關的函式庫 -->
document.write('<script src="scripts/lib/lib.html.pagecontainer.js"></script>');
document.write('<script src="scripts/lib/lib.html.js"></script>');
document.write('<script src="scripts/lib/lib.html.tablepage.js"></script>'); //<!--分頁 supplier-table-page-->
document.write('<script src="scripts/lib/lib.html.datepicker.js"></script>');
document.write('<script src="scripts/lib/lib.html.msgbox.js"></script>');

document.write('<script src="scripts/lib/loader.style/lib.html.loader.scan.0016.js"></script>'); //<!--分頁 html 操作-->

// 專案專用的頁面操作
document.write('<script src="views/app.html.utility.js"></script>'); //<!--分頁 html 操作-->

// document.write('<script src="scripts/app.module.utility.js" ></script>')
// document.write('<script src="scripts/app.module.setting.js" ></script>')
// document.write('<script src="scripts/app.module.output.js" ></script>')
// document.write('<script src="scripts/app.module.bulletin.js" ></script>')
// document.write('<script src="scripts/app.module.member.js" ></script>')
// document.write('<script src="scripts/app.module.general.js" ></script>')
document.write('<script src="scripts/inactivity.js"></script>'); // 操作逾10分鐘登出

document.write('<link rel="stylesheet" href="css/layout.style.utility.css">');
document.write('<link rel="stylesheet" href="css/popout.css"/>');
document.write('<link rel="stylesheet" href="css/layout.style.components.default.css">'); // 通用元件樣板
document.write('<link rel="stylesheet" href="css/layout.style.table.css">');
document.write('<link rel="stylesheet" href="css/layout.style.msgbox.css">');
document.write('<link rel="stylesheet" href="css/layout.style.modal.css">');
