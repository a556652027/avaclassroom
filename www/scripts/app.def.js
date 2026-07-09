//document.write('<link rel="stylesheet" href="css/menu.css"/>')

//document.write('<script src="scripts/exceljs.min.js"></script>')
//document.write('<script src="scripts/FileSaver.js"></script>')
//document.write('<script src="scripts/exportHost.js"></script>')

//document.write('<script src="vue/vue.js"></script>')
//document.write('<script src="vue/element-ui/index.js"></script>')
//document.write('<script src="vue/vue-i18n.js"></script>')

//document.write('<script src="locales/app.local.js" ></script>') // 語言切換

// function loadScript() {
//   var currentPage = location.pathname.split('/').pop()
//   if (
//     !['login.html', 'feedback.html', 'feedback_list.html'].includes(currentPage)
//   ) {
//     var script = document.createElement('script')
//     script.type = 'text/javascript'
//     script.src = 'scripts/popout.js'
//     document.body.appendChild(script)

//     var popout = document.createElement('div')
//     popout.id = 'popout'
//     document.body.appendChild(popout)
//   }
//   if (!['login.html'].includes(currentPage)) {
//     var script1 = document.createElement('script')
//     script1.type = 'text/javascript'
//     script1.src = 'scripts/menu.js'
//     document.body.appendChild(script1)
//     var menu = document.createElement('div')
//     menu.id = 'menu'
//     document.body.appendChild(menu)
//   }
// }
// window.onload = loadScript

var show_page_count = 30;

onmessage = function (event) {};

var QERRNO_PERMISSION_DENY = "-1079"; // 權限不符
var QERRNO_LOGIN_TIMEOUT = "-1077"; // 登入逾時
var QERRNO_ID_ALREADY_EXIST = "-1012";
var QERRNO_NEED_SESSION_ID = "-1011";

var QERRNO_SUCCESS = "1";
var group_uid;

// String.prototype.negtivecolor = function () {
//   if (parseInt(this) || parseFloat(this)) {
//     if (parseInt(this) < 0 || parseFloat(this) < 0) return this.fontcolor('red')
//     else return this
//   } else {
//     return this
//   }
// }

// String.prototype.replace.negtivecolor = function () {
//   if (parseInt(this) || parseFloat(this)) {
//     if (parseInt(this) < 0 || parseFloat(this) < 0) return this.fontcolor('red')
//     else return this
//   } else {
//     return this
//   }
// }

// function myRequire(url) {
//   var ajax = new XMLHttpRequest();
//   ajax.open('GET', url, false); // <-- the 'false' makes it synchronous
//   ajax.onreadystatechange = function () {
//     var script = ajax.response || ajax.responseText;
//     if (ajax.readyState === 4) {
//       switch (ajax.status) {
//         case 200:
//           eval.apply(window, [script]);
//           break;
//         default:
//           console.log("ERROR: LocalizedText not loaded: ", url);
//       }
//     }
//   };
//   ajax.send(null);
// }

//這裡判斷要載入哪個語系
// const curLang = sessionStorage.getItem('language')
// if (!curLang) {
//   myRequire('./lang/jp.js')
// } else {
//   myRequire('./lang/' + curLang + '.js')
// }
