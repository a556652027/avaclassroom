//
//  這個專案的專用 html 配置檔
//
//
//
//
//
//

//=============================================================================
// 建立 panel
//
//
//
//  <li data-role="collapsible" data-icon="carat-r" data-iconpos="right">\
//  <h2>廠商</h2>\
//      <ul data-role="listview" data-theme="b">\
//          <li id="panelLeft_gotoPage03" data-icon="carat-r"><a href="#">廠商資料</a></li>\
//          <li id="panelLeft_gotoPage29" data-icon="carat-r"><a href="#">銷售狀況</a></li>\
//      </ul>\
//  </li>\
//
//=============================================================================
// function createHeader(header, headerName) {
//     let arr = Array.from(header);
//     // console.log(headerName) ./images/header.png
//     arr.forEach((item) => {
//         item.innerHTML = `<div  class="logo" ><img src="./images/b3.png" alt=""></div>
//     <h1>${headerName}</h1>
//     <a
//       href="#"
//       class="ui-btn ui-btn-left ui-alt-icon ui-nodisc-icon ui-corner-all ui-btn-icon-notext ui-icon-bars panel-btn"
//       >Panel</a
//     >
//   </div>`;
//     });

//     $(".logo").click(function () {
//         var next_page = "./status.html";
//         //change_page_random( $( document.location.href = next_page ) );
//         $.mobile.changePage($((document.location.href = next_page)), {
//             transition: RandonDataTrabsition(),
//         });
//     });
//     // createLogoutBtn()
// }
// // function createPanel(panel) {
// //   group_uid = Cyberspace.Client.GetGroupUid()
// //   //                     <li id="panelLeft_gotoPage05" data-icon="carat-r"><a href="#">商品資料</a></li >\
// //   panel.innerHTML =
// //     '<ul id="sortable-list" data-role="listview">\
// //              <li id="panelli01" data-role="collapsible" data-icon="carat-r" data-iconpos="right" ">\
// //                  <h2>資訊</h2>\
// //                  <ul data-role="listview" data-theme="b">\
// //                      <li id="panelLeft_gotoPage01" data-icon="carat-r"><a href="#">最新公告</a></li>\
// //                      <li id="panelLeft_feedback" data-icon="carat-r"><a href="#">問題回報</a></li>\
// //                      <li id="panelLeft_feedbackList" data-icon="carat-r"><a href="#">回報一覽</a></li>\
// //                  </ul>\
// //              </li>\
// //              <li id="panelli02" data-role="collapsible" data-icon="carat-r" data-iconpos="right" ">\
// //                  <h2>業務</h2>\
// //                  <ul data-role="listview" data-theme="b">\
// //                      <li id="panelLeft_gotoPage03" data-icon="carat-r"><a href="#">廠商資料</a></li>\
// //                      <li id="panelLeft_addproduct" data-icon="carat-r"><a href="#">商品登錄</a></li >\
// //                      <li id="panelLeft_gotoPage07" data-icon="carat-r"><a href="#">發注書申請</a></li >\
// //                      <li id="panelLeft_gotoPage29" data-icon="carat-r"><a href="#">每日營收</a></li>\
// //                      <li id="panelLeft_cancelrate" data-icon="carat-r"><a href="#">キャンセル率</a></li>\
// //                      <li id="panelLeft_gotoPage50" data-icon="carat-r"><a href="#">KPI列表</a></li>\
// //                  </ul>\
// //              </li>\
// //              <li id="panelli03" data-role="collapsible" data-icon="carat-r" data-iconpos="right" ">\
// //                  <h2>帳務</h2>\
// //                  <ul data-role="listview" data-theme="b">\
// //                      <li id="panelLeft_gotoPage15" data-icon="carat-r"><a href="#">會計資料</a></li>\
// //                      <li id="panelLeft_gotoPage16" data-icon="carat-r"><a href="#">退貨・拒收管理</a></li>\
// //                      <li id="panelLeft_gotoPage17" data-icon="carat-r"><a href="#">資料上傳</a></li>\
// //                      <li id="panelLeft_gotoPage30" data-icon="carat-r"><a href="#">費用申請</a></li>\
// //                  </ul>\
// //              </li>\
// //              <li id="panelli04" data-role="collapsible" data-icon="carat-r" data-iconpos="right" ">\
// //                  <h2>倉庫</h2>\
// //                  <ul data-role="listview" data-theme="b">\
// //                      <li id="panelLeft_gotoPage21" data-icon="carat-r"><a href="#">貿易輸入</a></li>\
// //                      <li id="panelLeft_gotoPage24" data-icon="carat-r"><a href="#">在庫移動</a></li>\
// //                      <li id="panelLeft_gotoPage25" data-icon="carat-r"><a href="#">庫存資料</a></li>\
// //                      <li id="panelLeft_gotoPage22" data-icon="carat-r"><a href="#">在庫確認</a></li>\
// //                      <li id="panelLeft_shopeeship" data-icon="carat-r"><a href="#">蝦皮出貨</a></li>\
// //                      <li id="panelLeft_MOMO" data-icon="carat-r"><a href="#">商城在庫</a></li>\
// //                  </ul>\
// //              </li>\
// //              <li id="panelli04" data-role="collapsible" data-icon="carat-r" data-iconpos="right" ">\
// //                  <h2>店鋪</h2>\
// //                  <ul data-role="listview" data-theme="b">\
// //                      <li id="stores" data-icon="carat-r"><a href="#">店鋪登錄</a></li>\
// //                  </ul>\
// //              </li>\
// //              <li id="panelli05" data-role="collapsible" data-icon="carat-r" data-iconpos="right" ">\
// //                  <h2>設定</h2>\
// //                  <ul data-role="listview" data-theme="b">\
// //                      <li id="panelLeft_gotoPage28" data-icon="carat-r"><a href="#">系統管理</a></li>\
// //                      <li id="panelLeft_gotoPage49" data-icon="carat-r"><a href="#">留言測試</a></li>\
// //                  </ul>\
// //              </li>\
// //           </ul>'

// //   // 非系統管理員
// //   if (group_uid != 'abt9') {
// //     $(
// //       '#panelLeft_gotoPage28, #panelLeft_gotoPage49,#panelLeft_cancelrate'
// //     ).remove()
// //   }

// //   // FF人員的網頁權限
// //   if (group_uid == 'abt0') {
// //     $('#panelLeft_gotoPage17').remove()
// //   }

// //   // 會計人員的網頁權限
// //   if (group_uid == 'abt2') {
// //     $('#panelLeft_gotoPage17').remove()
// //   }

// //   // OP人員的網頁權限
// //   if (group_uid == 'abt3') {
// //     $(
// //       '#panelLeft_gotoPage03,#panelLeft_gotoPage07, #panelLeft_gotoPage21, #panelLeft_gotoPage22, #panelLeft_gotoPage25, #panelli05,#panelLeft_MOMO'
// //     ).remove()
// //     if (
// //       !['3780578527', '2082422215', '2310252490'].includes(
// //         Cyberspace.Client.GetSessionUid()
// //       )
// //     ) {
// //       $('#panelLeft_gotoPage29').remove()
// //     }
// //   }

// //   // CC人員的網頁權限
// //   if (group_uid == 'abt4') {
// //     // 這邊以後要考量，如果有新增主管階級的人，要怎麼配置權限?
// //     if (Cyberspace.Client.GetSessionUid() != '2447848632') {
// //       $(
// //         '#panelli02, #panelli04, #panelli05, #panelLeft_gotoPage15, #panelLeft_gotoPage17, #panelLeft_gotoPage29'
// //       ).remove()
// //     } else {
// //       $('#panelLeft_gotoPage17').remove()
// //     }
// //   }

// //   // MK人員的網頁權限
// //   if (group_uid == 'abt5') {
// //     $(
// //       '#panelLeft_gotoPage03, #panelLeft_gotoPage15, #panelLeft_gotoPage16, #panelLeft_gotoPage17, #panelLeft_gotoPage21, #panelLeft_gotoPage25, #panelli05, #panelLeft_gotoPage50'
// //     ).remove()
// //     /*if (
// //       ![
// //         '2851506709',
// //         '2635191695',
// //         '1064646654',
// //         '3316385859',
// //         '2731823389',
// //         '3340120354',
// //         '2817887736',
// //         '3487376580',
// //         '1153428303',
// //         '149269245',
// //         '2293385967',
// //         '3437900018',
// //         '1744050250',
// //         '3114850769',
// //         '3078910464',
// //       ].includes(Cyberspace.Client.GetSessionUid())
// //     ) {
// //       $('#panelLeft_gotoPage22').remove()
// //     }*/
// //   }

// //   // 日本那邊的網頁權限
// //   if (group_uid == 'abt1') {
// //     $(
// //       '#panelli01, #panelli05, #panelLeft_gotoPage50, #panelLeft_gotoPage17, #panelLeft_cancelrate, #panelLeft_addproduct'
// //     ).remove()
// //   }

// //   $('#panelLeft_gotoPage01').click(function () {
// //     var next_page = './status.html'
// //     //change_page_random( $( document.location.href = next_page ) );
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })
// //   $('.logo').click(function () {
// //     var next_page = './status.html'
// //     //change_page_random( $( document.location.href = next_page ) );
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })
// //   //
// //   $('#panelLeft_gotoPage05').click(function () {
// //     var next_page = './product.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })

// //   $('#panelLeft_gotoPage03').click(function () {
// //     var next_page = './supplier.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })

// //   $('#panelLeft_gotoPage07').click(function () {
// //     var next_page = './purchase.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })

// //   $('#panelLeft_gotoPage21').click(function () {
// //     var next_page = './trade.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })

// //   $('#panelLeft_gotoPage22').click(function () {
// //     var next_page = './instock.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })

// //   $('#panelLeft_gotoPage24').click(function () {
// //     var next_page = './dispatch.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })

// //   $('#panelLeft_gotoPage15').click(function () {
// //     var next_page = './transaction.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })

// //   $('#panelLeft_gotoPage16').click(function () {
// //     var next_page = './return.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })

// //   $('#panelLeft_gotoPage17').click(function () {
// //     var next_page = './return-upload.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })

// //   $('#panelLeft_gotoPage25').click(function () {
// //     var next_page = './inventory.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })

// //   $('#panelLeft_gotoPage28').click(function () {
// //     var next_page = './setting.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })

// //   $('#panelLeft_gotoPage29').click(function () {
// //     var next_page = './daily-revenue.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })

// //   $('#panelLeft_gotoPage30').click(function () {
// //     var next_page = './fee.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })

// //   $('#panelLeft_gotoPage49').click(function () {
// //     var next_page = './test_bulletin.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })

// //   $('#panelLeft_gotoPage50').click(function () {
// //     var next_page = './KPIcount.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })

// //   $('#panelLeft_feedback').click(function () {
// //     var next_page = './feedback.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })

// //   $('#panelLeft_feedbackList').click(function () {
// //     var next_page = './feedback_list.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })
// //   $('#panelLeft_cancelrate').click(function () {
// //     var next_page = './cancelRate.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })
// //   $('#panelLeft_addproduct').click(function () {
// //     var next_page = './newproduct.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })
// //   $('#panelLeft_MOMO').click(function () {
// //     var next_page = './mallinstock.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })
// //   $('#panelLeft_shopeeship').click(function () {
// //     var next_page = './shipper.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })
// //   $('#stores').click(function () {
// //     var next_page = './stores.html'
// //     $.mobile.changePage($((document.location.href = next_page)), {
// //       transition: RandonDataTrabsition(),
// //     })
// //   })
// //   $('.panel-btn').click(function () {
// //     $('#panelLeft').panel('open')
// //   })

// //   createLogoutBtn()

// //   var savedOrd = window.localStorage.getItem('sortable-list')
// //   if (savedOrd) {
// //     $.each(savedOrd.split(','), function (i, e) {
// //       $('#' + e).insertAfter('#sortable-list>li:eq(' + i + ')')
// //     })
// //   }

// //   $('#sortable-list').sortable({
// //     connectWith: '#sortable-list',
// //     dropOnEmpty: true,
// //     update: function (event, ui) {},
// //     stop: function (s, e) {
// //       var saveOrd = $('#sortable-list').sortable('toArray')
// //       window.localStorage.setItem('sortable-list', saveOrd)
// //     },
// //   })
// // }

// // var lastpanelid;
// function liOnMouseOver(panelliId) {
//     // $( '#' + lastpanelid ).removeClass( "ui-collapsible-collapsed" );
//     // $( '#' + lastpanelid + ' > h2' ).removeClass( "ui-collapsible-heading-collapsed" );
//     // $( '#' + lastpanelid + ' > h2 > a' ).removeClass( "ui-icon-plus" );
//     // $( '#' + lastpanelid + ' > h2 > a' ).addClass( "ui-icon-minus" );
//     // $( '#' + lastpanelid + ' > div' ).addClass( "ui-collapsible-content-collapsed" );
//     // $('#' + panelliId).removeClass('ui-collapsible-collapsed');
//     // $('#' + panelliId + ' > h2').removeClass('ui-collapsible-heading-collapsed');
//     // $('#' + panelliId + ' > h2 > a').removeClass('ui-icon-plus');
//     // $('#' + panelliId + ' > h2 > a').addClass('ui-icon-minus');
//     // $('#' + panelliId + ' > div').removeClass('ui-collapsible-content-collapsed');
//     // lastpanelid = panelliId;
// }

// function liOnMouseOut(panelliId) {
//     /*$('#' + panelliId).addClass('ui-collapsible-collapsed');
//       $('#' + panelliId + ' > h2').addClass('ui-collapsible-heading-collapsed');
//       $('#' + panelliId + ' > h2 > a').addClass('ui-icon-plus');
//       $('#' + panelliId + ' > h2 > a').removeClass('ui-icon-minus');
//       $('#' + panelliId + ' > div').addClass('ui-collapsible-content-collapsed');*/
//     // lastpanelid = panelliId;
// }

// function createLogoutBtn() {
//     // 加入logout登出按鈕，並調整css對齊
//     $('[data-role="header"]').append('<a href="#" id="bamb_logout" data-icon="gear" class="ui-btn-right">登出</a>');
//     //$('#bamb_logout').css('margin-top', '10px')
//     document.querySelectorAll("#bamb_logout").forEach((item) => {
//         item.style.marginTop = "10px";
//     });
//     $("#bamb_logout").on({
//         click: function () {
//             window.location.href = "login.html";
//             sessionStorage.clear();
//         },
//     });
// }

// // force to be under of header if don't set top/min-height in css
// // but this need to call in every window resize
// // TODO: has problem when panel changed from popped mode to fixed mode because the css already changed regardless of @media (min-width..)
// //		 ahould just addind rules to stylesheets with javaScript?
// //		 use @media (min-width: 40em) { #leftPanel { top: 2.8em; min-height: calc(100% - 2.8em) } } in this moment
// function adjustPanelVertical() {
//     var viewH = $(window).height();
//     var headerH = $(".ui-header").outerHeight();
//     var panelH = $(".ui-panel").height();
//     $(".ui-content").css({
//         marginTop: "75px",
//     });

//     $(".ui-header").css({
//         position: "fixed",
//         width: "100%",
//         zIndex: "1999",
//     });
//     $(".ui-panel-inner").css({
//         position: "fixed",
//         width: "16em",
//         top: "75px",
//     });

//     $("#listview ul li").next("ul").hide();
//     $("#listview ul li").click(function () {
//         $(this).next("ul").toggle();
//     });
// }

// $(window).resize(function () {
//     var panel = $(".ui-panel");
//     if (panel.css("visibility") == "visible" && panel.css("overflow-x") == "hidden" && panel.css("overflow-y") == "hidden") {
//         // HACK: only when in fixed panel and open
//         adjustPanelVertical();
//     }
// });

function check_logout(result) {
    var logout = false,
        isIDExist = false;
    var msgstring;

    switch (result.errno) {
        case QERRNO_NEED_SESSION_ID:
            {
                msgstring = "失敗: 請先登入驗證";
                logout = true;
            }
            break;
        case QERRNO_PERMISSION_DENY:
            {
                msgstring = "失敗: 權限不符，請重新登入";
                logout = true;
            }
            break;
        case QERRNO_LOGIN_TIMEOUT:
            {
                msgstring = "失敗: 登入逾時，請重新登入";
                logout = true;
            }
            break;
        case "-1012":
            msgstring = "重複ID";
            isIDExist = true;
            break;
    }

    if (logout) {
        loadingBox.hide();

        vm1.$alert(msgstring, "Error", {
            confirmButtonText: "OK",
            callback: (action) => {
                var next_page = "./login.html";
                $.mobile.changePage($((document.location.href = next_page)), {
                    transition: RandonDataTrabsition(),
                });
            },
        });
        return true;
    }
    if (isIDExist) {
        return "中文重複";
    }
    return false;
}

function check_errno(errno) {
    var logout = false;
    var msgstring;

    switch (errno) {
        case QERRNO_NEED_SESSION_ID:
            {
                msgstring = "失敗: 請先登入驗證";
                logout = true;
            }
            break;
        case QERRNO_PERMISSION_DENY:
            {
                msgstring = "失敗: 權限不符，請重新登入";
                logout = true;
            }
            break;
        case QERRNO_LOGIN_TIMEOUT:
            {
                msgstring = "失敗: 登入逾時，請重新登入";
                logout = true;
            }
            break;
    }

    if (logout) {
        loadingBox.hide();

        vm1.$alert(msgstring, "Error", {
            confirmButtonText: "OK",
            callback: (action) => {
                var next_page = "./login.html";
                $.mobile.changePage($((document.location.href = next_page)), {
                    transition: RandonDataTrabsition(),
                });
            },
        });
        return true;
    }
    return false;
}

function show_errno(errno) {
    if (errno == -1079) {
        alert(GetLocalData("common.deny"));
        return "failure";
    }

    if (errno < 0) {
        alert(GetLocalData("common.failure"));
        return "failure";
    }

    return "";
}

//
// 從新計算 可以加入的 商品
//    <td>\
//         <div class="styled-select green rounded">\
//             <select id="dispatch_replace-select-product_type-' + i + '" data-role="none" onchange="onchange_product_type(' + i + ')">\
//                 <option value="2">商品</option>\
//                 <option value="3">促販</option>\
//                 <option value="4">同捆</option>\
//             </select>\
//         </div>\
//     </td>\
//     <td>商品名稱</td>\
//     <td colspan="2">\
//         <div class="styled-select green rounded">\
//             <select id="dispatch_replace-select-product_code-' + i + '" data-role="none" required></select>\
//         </div>\
//     </td>\
// 傳入兩個 select 的id 跟欄位最大數量
// 篩選可以 使用的商品名稱， 有用過的其他就不能用
// function html_refresh_select_product_item(element_id__select__product_type, element_id__select__product_code, max_size) {
//     if (g_product_list.length == 0) return;

//     // 放入沒被選過的資料
//     var allow_product_list = new Array();
//     //先把組合商品拿掉
//     {
//         for (var r = 0; r < g_product_list.length; r++) {
//             // 一定沒有組合
//             if (g_product_list[r].product_type != "1") {
//                 allow_product_list.push(g_product_list[r]);
//             }
//         }
//     }

//     //  改變類型的清空
//     {
//         for (var i = 1; i <= max_size; i++) {
//             var select_products_type = document.getElementById(element_id__select__product_type + i);
//             var select_products_code = document.getElementById(element_id__select__product_code + i);

//             if (select_products_code.selectedIndex < 0) {
//                 select_products_code.innerHTML = ""; //// 先清除沒有選到的??? 20180609 未測試
//                 continue;
//             }

//             if (select_products_code.options[select_products_code.selectedIndex].value == "") continue;

//             //新加入?
//             var product = Find_Product_By_Code(select_products_code.options[select_products_code.selectedIndex].value);
//             if (product == null) continue;

//             var cur_product_type = product.product_type;
//             var new_product_type = select_products_type.options[select_products_type.selectedIndex].value;

//             if (cur_product_type != new_product_type) {
//                 select_products_code.innerHTML = "";
//             }
//         }
//     }

//     // 找目前畫面上所有的選項
//     //{
//     //    for ( var i = 1; i <= max_size; i++ )
//     //    {
//     //        // 目前選到的商品名
//     //        var exist_item_code = document.getElementById( element_id__select__product_code + i ).value;
//     //        for ( var r = 0; r < allow_product_list.length; r++ )
//     //        {
//     //            // 這個商品名稱有被使用嘞
//     //            if ( exist_item_code == allow_product_list[r].product_code )
//     //            {
//     //                // 再移除這個元素
//     //                allow_product_list.splice( r, 1 );
//     //                break;
//     //            }
//     //        }
//     //    }
//     //}

//     // 新增加的加入空選項
//     // 新加入的選項 都是擺空字串
//     {
//         for (var i = 1; i <= max_size; i++) {
//             var select_products_code = document.getElementById(element_id__select__product_code + i);
//             // 之前沒有任何的 option 所以 代表是一個新加入的option
//             if (select_products_code.options.length == 0) {
//                 var newoption = document.createElement("option");
//                 newoption.value = "";
//                 newoption.text = "";
//                 select_products_code.add(newoption);
//             }
//         }
//     }

//     // 此時 allow_product_list 一定沒有 組合商品 也沒有畫面上出現過的商品
//     {
//         for (var i = 1; i <= max_size; i++) {
//             var select_products_type = document.getElementById(element_id__select__product_type + i);
//             var select_products_code = document.getElementById(element_id__select__product_code + i);

//             var item_type = "";
//             var item_code = "";
//             var item_name = "";

//             if (select_products_type.selectedIndex < 0) select_products_type.selectedIndex = 0;
//             //{
//             item_type = select_products_type.options[select_products_type.selectedIndex].value;
//             //}

//             if (select_products_code.selectedIndex < 0) select_products_code.selectedIndex = 0;
//             {
//                 item_code = select_products_code.options[select_products_code.selectedIndex].value;
//                 item_name = select_products_code.options[select_products_code.selectedIndex].text;

//                 //清空
//                 select_products_code.innerHTML = "";
//                 {
//                     var newoption = document.createElement("option");
//                     newoption.value = "";
//                     newoption.text = "";
//                     select_products_code.add(newoption);
//                 }

//                 {
//                     select_products_code.options[select_products_code.selectedIndex].value = item_code;
//                     select_products_code.options[select_products_code.selectedIndex].text = item_name;
//                 }

//                 /*
//                         if (item_code != '')
//                         {
//                             // 改變類型
//                             if (Find_Product_By_Code(item_code).product_type != item_type)
//                             {
//                                 var newoption = document.createElement('option');
//                                 newoption.value = '';
//                                 newoption.text = '';
//                                 select_products_code.add(newoption);
//                             }
//                             else
//                             {
//                                 var newoption = document.createElement('option');
//                                 newoption.value = item_code;
//                                 newoption.text = item_name;
//                                 select_products_code.add(newoption);
//                             }
//                         }
//                         else
//                         {
//                             var newoption = document.createElement('option');
//                             newoption.value = item_code;
//                             newoption.text = item_name;
//                             select_products_code.add(newoption);
//                         }
//                         */
//             }

//             // 把選項重新加入
//             for (var si = 0; si < allow_product_list.length; si++) {
//                 if (allow_product_list[si].product_type == item_type) {
//                     var newoption = document.createElement("option");
//                     newoption.value = allow_product_list[si].product_code;
//                     newoption.text = Get_Product_Code_Name(allow_product_list[si]);
//                     select_products_code.add(newoption);
//                 }
//             }
//         }
//     }
// }

// // 在傳入的select 物件中 取得 所有廠商的 名稱
// function html_requet_supplier_list(id, func_callback) {
//     var select_suppliers = document.getElementById(id);
//     select_suppliers.innerHTML = "";

//     loadingBox.show("waiting", "Loading...", "sm");
//     Supplier_Request_Select_Show(function (result) {
//         loadingBox.hide();
//         if (check_errno(result.errno)) {
//             return;
//         }

//         var supplier_list = result.records;

//         var select_suppliers = document.getElementById(id);
//         for (var i = 0; i < supplier_list.length; i++) {
//             if (supplier_list[i].supplier_type != "9") {
//                 //先濾掉外注先
//                 var newoption = document.createElement("option");
//                 newoption.value = supplier_list[i].supplier_uid;
//                 newoption.text = Get_Supplier_Uid_Alias(supplier_list[i]);
//                 select_suppliers.add(newoption);
//             }
//         }
//         if (func_callback != null) {
//             func_callback(supplier_list);
//         }
//     });
// }

// // 在傳入的select 物件中 取得 所有帳號的 名稱
// function html_requet_member_list(id, func_callback) {
//     var select_member = document.getElementById(id);
//     select_member.innerHTML = "";

//     loadingBox.show("waiting", "Loading...", "sm");
//     Member_Request_Select("ab", 0, -1, function (result) {
//         loadingBox.hide();
//         if (check_errno(result.errno)) {
//             return;
//         }

//         var member_list = result.records;
//         var select_members = document.getElementById(id);
//         for (var i = 0; i < member_list.length; i++) {
//             var newoption = document.createElement("option");
//             newoption.value = member_list[i].member_cid;
//             newoption.text = member_list[i].member_cid;
//             select_members.add(newoption);
//         }
//         if (func_callback != null) {
//             func_callback(member_list);
//         }
//     });
// }

/* 空範本
    setTimeout(function () {
        CsRequestMemberSelectAllCountByParentName(
            parent_name,
            function (ok, result) {

                // 關閉loading dialog
                VisibleLoaderElement(false);

                if (!ok) {
                    alert('request error')
                    return;
                }

                let json_object = JSON.parse(result); // 解析 JSON

                //   loadingBox.hide()
                //loadingWater.style.visibility = 'hidden'
                if (json_object.errno < 0) {
                    alert('no data')
                    return;
                }
            }
        )
    }, 500)
*/
