// const localized_text = getLocalizedText("app_module_status");
// const i18n = new VueI18n({
//     locale: "jp", // set locale
//     messages: {
//         jp: getLocalizedText("status"),
//     }, // set locale messages
// });

// const vm1 = new Vue({
//     i18n,
//     el: "#page1",
// });

// var shipper_type_name = {
//     "001_000036_000_00000000": localized_text.shopee,
//     "001_000043_000_00000000": localized_text.etmall,
//     "001_000048_000_00000000": "FRIDAY",
//     "001_000033_002_00000000": "MO店+",
//     "001_000033_001_00000000": localized_text.momo_factory_shipping,
//     "001_000041_001_00000000": "Pchome廠配",
// };
// var shipcount = 0;
// createHeader(document.querySelectorAll("[data-role='header']"), localized_text.menu_status);
// insertLoadingEle();
// $(document).ready(function () {
//     // window.localStorage.clear()
//     const loader = document.querySelector(".loader-wrap");
//     const history = document.querySelector(".history");
//     loader.style.visibility = "visible";
//     let ls = window.localStorage.getItem("historyList");
//     if (!ls) {
//         window.localStorage.setItem("historyList", "[]");
//     } else {
//         ls = JSON.parse(ls);
//         console.log(ls);
//         for (let index = 0; index < ls.length; index++) {
//             const link = ls[index];
//             let item = document.createElement("div");
//             item.innerHTML = link.text;
//             item.classList.add("history-item");
//             item.addEventListener("click", function () {
//                 console.log(link);
//                 for (const [i, item] of ls.entries()) {
//                     if (item.text === link.text) {
//                         item.count++;
//                         // const temp = ls.splice(i, 1)
//                         // temp[0].count++
//                         // ls.unshift(temp[0])
//                         ls.sort((a, b) => b.count - a.count);
//                         window.localStorage.setItem("historyList", JSON.stringify(ls));
//                         break;
//                     }
//                 }
//                 location.href = link.link;
//             });
//             // history.appendChild(item)
//         }
//     }
//     Supplier_Request_Select_All(function () {
//         check_fee_process();
//         check_purchase_process();
//         check_dispatch_process();
//         check_product_process();
//         if (Cyberspace.Client.GetGroupUid() == "abt3") {
//             check_shopee_shipper();
//             check_distributor_ship();
//             check_shopee_shipper_return();
//         }
//         if (Cyberspace.Client.GetGroupUid() == "abt3" || Cyberspace.Client.GetGroupUid() == "abt0") {
//             check_new_cosmetic_register();
//         }
//         if (["abt3", "abt9"].includes(Cyberspace.Client.GetGroupUid())) {
//             check_ingredient();
//         }
//         if (Cyberspace.Client.GetGroupUid() != "abt0") {
//             check_mkf();
//             check_processing_mkf();
//         } else {
//             check_ff_related_mkf();
//         }
//     });
// });

// function check_fee_process() {
//     Fee_List(function (fee_list) {
//         if (fee_list.length == 0) {
//             console.log("EMPTY");
//         } else {
//             $("#waitforprocess").append('<p><span class="titi">' + localized_text.expense_application + "</span></p>");
//             creater_list = {};
//             process_list = {};
//             aproval_list = {};

//             for (const fee_data of fee_list) {
//                 if (["1", "2", "6", "7"].includes(fee_data.fee_status_id) && Cyberspace.Client.GetSessionUid() == fee_data.processor_id) {
//                     if (process_list.hasOwnProperty(fee_data.supplier_uid)) {
//                         process_list[fee_data.supplier_uid]++;
//                     } else {
//                         process_list[fee_data.supplier_uid] = 1;
//                     }
//                 }

//                 if ("5" == fee_data.fee_status_id && Cyberspace.Client.GetSessionUid() == fee_data.Approved_id) {
//                     if (aproval_list.hasOwnProperty(fee_data.supplier_uid)) {
//                         aproval_list[fee_data.supplier_uid]++;
//                     } else {
//                         aproval_list[fee_data.supplier_uid] = 1;
//                     }
//                 }

//                 if (["3", "4", "8"].includes(fee_data.fee_status_id) && Cyberspace.Client.GetSessionUid() == fee_data.creater_id) {
//                     if (creater_list.hasOwnProperty(fee_data.supplier_uid)) {
//                         creater_list[fee_data.supplier_uid]++;
//                     } else {
//                         creater_list[fee_data.supplier_uid] = 1;
//                     }
//                 }
//             }

//             for (const [supplier_uid, number] of Object.entries(process_list)) {
//                 var supojb = Find_Supplier_By_Uid(supplier_uid);
//                 $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + number + "</span>" + localized_text.number_of_expense_is_waiting_process + " (" + supplier_uid + "_" + supojb.supplier_alias + ")</p>");
//             }

//             for (const [supplier_uid, number] of Object.entries(creater_list)) {
//                 var supojb = Find_Supplier_By_Uid(supplier_uid);
//                 $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + number + "</span>" + localized_text.number_of_expense_is_waiting_process + " (" + supplier_uid + "_" + supojb.supplier_alias + ")</p>");
//             }

//             for (const [supplier_uid, number] of Object.entries(aproval_list)) {
//                 var supojb = Find_Supplier_By_Uid(supplier_uid);
//                 $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + number + "</span>" + localized_text.number_of_expense_is_waiting_audit + " (" + supplier_uid + "_" + supojb.supplier_alias + ")</p>");
//             }
//         }
//     });
// }

// function check_dispatch_process() {
//     var end_date = DateAdd("m", 1, new Date());
//     var begin_date = DateAdd("m", -2, new Date());
//     var bdate_str = DateToString(begin_date);
//     var edate_str = DateToString(end_date);

//     let sessionid = sessionStorage.getItem("session_uid");
//     const url = Cyberspace.Client.getHostname() + "dispatch/list";
//     const config = {
//         method: "POST",
//         headers: {
//             "Content-Type": "text/plain;charset=UTF-8",
//         },
//         body: `sessionid=${sessionid}&supplier_uid=0&record_state=1&begin_date=${bdate_str}&end_date=${edate_str}&process_state_list=1,2,3,4,6&field_list=supplier_uid,process_state,responsible_person,create_person,check_user_index,rule_order_list`,
//     };

//     fetch(url, config)
//         .then((res) => res.text())
//         .then(async (rep) => {
//             const data = JSON.parse(RemoveNonValidJSONChars(rep));
//             if (data.errno === "1") {
//                 dispatch_list = data.records;
//                 if (0 < dispatch_list.length) {
//                     // 先分堆 將狀態與各廠商所需要處的件數做分堆
//                     dispatch_count_map = {};
//                     for (const dispatch of dispatch_list) {
//                         let [supplier_uid, process_state, responsible_person, create_person, check_user_index, rule_order_list] = dispatch;
//                         let check_flag = false;
//                         if ((["1", "4"].includes(process_state) && create_person == sessionid) || (["2", "3"].includes(process_state) && responsible_person == sessionid)) {
//                             check_flag = true;
//                         } else if (process_state == "6") {
//                             if (0 < rule_order_list.length) {
//                                 if (rule_order_list[check_user_index] == sessionid) {
//                                     check_flag = true;
//                                 }
//                             }
//                         }

//                         if (check_flag) {
//                             if (dispatch_count_map.hasOwnProperty(process_state)) {
//                                 if (dispatch_count_map[process_state].hasOwnProperty(supplier_uid)) {
//                                     dispatch_count_map[process_state][supplier_uid]++;
//                                 } else {
//                                     dispatch_count_map[process_state][supplier_uid] = 1;
//                                 }
//                             } else {
//                                 dispatch_count_map[process_state] = {};
//                                 dispatch_count_map[process_state][supplier_uid] = 1;
//                             }
//                         }
//                     }

//                     if (0 < Object.keys(dispatch_count_map).length) {
//                         $("#waitforprocess").append('<p><span class="titi">' + localized_text.dispatch + "</span></p>");
//                     }

//                     for (const [process_state, supplier_count_obj] of Object.entries(dispatch_count_map)) {
//                         if (process_state == "1") {
//                             for (const [supplier_uid, count] of Object.entries(supplier_count_obj)) {
//                                 let name = Find_Supplier_By_Uid(supplier_uid).supplier_alias;
//                                 $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + count + "</span>" + localized_text.number_of_dispatch + localized_text.pending + "(" + supplier_uid + "_" + name + ")</p>");
//                             }
//                         } else if (process_state == "2") {
//                             for (const [supplier_uid, count] of Object.entries(supplier_count_obj)) {
//                                 let name = Find_Supplier_By_Uid(supplier_uid).supplier_alias;
//                                 $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + count + "</span>" + localized_text.number_of_dispatch + '作業中，<span class="num">待通知郵船</span>' + "(" + supplier_uid + "_" + name + ")</p>");
//                             }
//                         } else if (process_state == "3") {
//                             for (const [supplier_uid, count] of Object.entries(supplier_count_obj)) {
//                                 let name = Find_Supplier_By_Uid(supplier_uid).supplier_alias;
//                                 $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + count + "</span>" + localized_text.number_of_dispatch + "已通知郵船，待完成作業" + "(" + supplier_uid + "_" + name + ")</p>");
//                             }
//                         } else if (process_state == "4") {
//                             for (const [supplier_uid, count] of Object.entries(supplier_count_obj)) {
//                                 let name = Find_Supplier_By_Uid(supplier_uid).supplier_alias;
//                                 $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + count + "</span>" + localized_text.number_of_dispatch + "已完成作業，待確認到達日" + "(" + supplier_uid + "_" + name + ")</p>");
//                             }
//                         } else if (process_state == "6") {
//                             for (const [supplier_uid, count] of Object.entries(supplier_count_obj)) {
//                                 let name = Find_Supplier_By_Uid(supplier_uid).supplier_alias;
//                                 $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + count + "</span>" + localized_text.number_of_dispatch + "審核中，待審核" + "(" + supplier_uid + "_" + name + ")</p>");
//                             }
//                         }
//                     }
//                 }
//             }
//         });
// }
// function check_product_process() {
//     Product_Request_Select_All_Notice(function (result) {
//         var product_list = result.records;
//         //   loadingBox.hide()
//         const loader = document.querySelector(".loader-wrap");
//         setTimeout(() => {
//             loader.style.visibility = "hidden";
//         }, 1500);

//         if (product_list.length == 0) {
//             console.log("EMPTY");
//         } else {
//             $("#waitforprocess").append('<p><span class="titi">' + localized_text.product_recording + "</span></p>");
//             var processcount = 0;
//             var agreecount = 0;
//             var supid = product_list[0].supplier_uid;
//             var supojb = Find_Supplier_By_Uid(supid);
//             for (var i = 0; i < product_list.length; i++) {
//                 if (supid != product_list[i].supplier_uid) {
//                     if (processcount != 0) {
//                         $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + processcount + "</span>" + localized_text.number_of_product_is_waiting_process + supid + "_" + supojb.supplier_alias + ")</p>");
//                     }
//                     if (agreecount != 0) {
//                         $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + agreecount + "</span>" + localized_text.number_of_product_is_waiting_audit + supid + "_" + supojb.supplier_alias + ")</p>");
//                     }
//                     supid = product_list[i].supplier_uid;
//                     supojb = Find_Supplier_By_Uid(supid);
//                     processcount = 0;
//                     agreecount = 0;
//                 }

//                 if (product_list[i].record_state != "4") {
//                     switch (product_list[i].record_state) {
//                         case "1":
//                             if (product_list[i].rep.ff_rep == Cyberspace.Client.GetSessionUid()) {
//                                 processcount++;
//                             }
//                             break;
//                         case "2":
//                             if (product_list[i].rep.op_rep == Cyberspace.Client.GetSessionUid()) {
//                                 processcount++;
//                             }
//                             break;
//                         case "3":
//                             // if (
//                             //   (supojb.supplier_type == '1' || supojb.supplier_type == '3') &&
//                             //   Cyberspace.Client.GetSessionUid() == '2310252490'
//                             // ) {
//                             //   agreecount++
//                             // } else if (
//                             //   supojb.supplier_type == '2' &&
//                             //   Cyberspace.Client.GetSessionUid() == '3780578527'
//                             // ) {
//                             //   agreecount++
//                             // }
//                             if (Cyberspace.Client.GetSessionUid() == "3780578527") {
//                                 agreecount++;
//                             }
//                             break;
//                         case "7":
//                             if (product_list[i].rep.mk_rep == Cyberspace.Client.GetSessionUid()) {
//                                 processcount++;
//                             }
//                             break;
//                         default:
//                     }
//                 }
//             }
//             supojb = Find_Supplier_By_Uid(supid);
//             if (processcount != 0) {
//                 $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + processcount + "</span>" + localized_text.number_of_product_is_waiting_process + supid + "_" + supojb.supplier_alias + ")</p>");
//             }
//             if (agreecount != 0) {
//                 $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + agreecount + "</span>" + localized_text.number_of_product_is_waiting_audit + supid + "_" + supojb.supplier_alias + ")</p>");
//             }
//         }
//     });
// }

// function check_purchase_process() {
//     var end_date = DateAdd("m", 1, new Date());
//     var begin_date = DateAdd("m", -3, new Date());
//     var bdate_str = DateToString(begin_date);
//     var edate_str = DateToString(end_date);

//     purchase_Request_Select_All_Notice(bdate_str, edate_str, function (result) {
//         var purchase_list = result.records;

//         if (purchase_list.length == 0) {
//             console.log("EMPTY");
//         } else {
//             $("#waitforprocess").append('<p><span class="titi">' + localized_text.purchase_application + "</span></p>");
//             var processcount = 0;
//             var supid = purchase_list[0].supid;
//             for (var i = 0; i < purchase_list.length; i++) {
//                 if (supid != purchase_list[i].supid) {
//                     var supojb = Find_Supplier_By_Uid(supid);
//                     if (processcount != 0) {
//                         $(".inner").append("<p>" + localized_text.you_have + '<span class="num">' + processcount + "</span>" + localized_text.number_of_purchase_is_waiting_process + supid + "_" + supojb.supplier_alias + ")</p>");
//                     }
//                     supid = purchase_list[i].supid;
//                     processcount = 0;
//                 }
//                 switch (purchase_list[i].process_state) {
//                     case "1":
//                         if (Cyberspace.Client.GetSessionUid() == "2216926481") {
//                             processcount++;
//                         }
//                         break;
//                     case "2":
//                         if (purchase_list[i].responsible_person == Cyberspace.Client.GetSessionUid()) {
//                             processcount++;
//                         }
//                         break;
//                     default:
//                 }
//             }
//             var supojb = Find_Supplier_By_Uid(supid);
//             if (processcount != 0) {
//                 $(".inner").append("<p>" + localized_text.you_have + '<span class="num">' + processcount + "</span>" + localized_text.number_of_purchase_is_waiting_process + supid + "_" + supojb.supplier_alias + ")</p>");
//             }
//         }
//     });
// }

// function check_shopee_shipper() {
//     let end_date = new Date();
//     let begin_date = DateAdd("d", -2, new Date());
//     let bdate_str = DateToString(begin_date);
//     let edate_str = DateToString(end_date);

//     let sessionid = sessionStorage.getItem("session_uid");
//     const url = Cyberspace.Client.getHostname() + "orders/list/count";
//     const config = {
//         method: "POST",
//         headers: {
//             "Content-Type": "text/plain;charset=UTF-8",
//         },
//         body: `sessionid=${sessionid}&supplier_uid=0&begin_date=${bdate_str}&end_date=${edate_str}&is_ab_shipped=1&is_shipped=0&date_type=1`,
//     };

//     fetch(url, config)
//         .then((res) => res.text())
//         .then(async (rep) => {
//             const data = JSON.parse(RemoveNonValidJSONChars(rep));
//             if (data.errno === "1") {
//                 data_list = data.records;
//                 let groupbuytobeshippedcount = 0;
//                 for (var i = 0; i < data_list.length; i++) {
//                     let supplier_uid = data_list[i][0];
//                     let record_form = data_list[i][1];
//                     let supobj = Find_Supplier_By_Uid(supplier_uid);
//                     let sup_name = Get_Supplier_Uid_Alias(supobj);
//                     let datestr = data_list[i][2].substring(0, 10);
//                     let count = data_list[i][3];
//                     if (shipper_type_name.hasOwnProperty(record_form)) {
//                         $("#waitforship").append("<p>" + datestr + localized_text.have + '<span class="num">' + count + "</span>" + localized_text.number + shipper_type_name[record_form] + localized_text.order + '<span class="num">' + localized_text.to_be_shipped + "</span>(" + sup_name + ")</p>");
//                         shipcount += parseInt(count);
//                         $("#shipcount").html(`<span class="num">${shipcount}</span>` + localized_text.number);
//                     } else {
//                         let kol_id = record_form.slice(-6);
//                         let kol_obj = Find_Supplier_By_Uid(kol_id);
//                         $("#groupbuywaitforship").append("<p>" + datestr + localized_text.have + '<span class="num">' + count + "</span>" + localized_text.number + kol_obj.supplier_alias + localized_text.order + '<span class="num">' + localized_text.to_be_shipped + "</span>(" + sup_name + ")</p>");
//                         groupbuytobeshippedcount += parseInt(count);
//                         $("#groupbuytobeshippedcount").html(`<span class="num">${groupbuytobeshippedcount}</span>` + localized_text.number);
//                     }
//                 }
//             }
//         });
// }

// function check_shopee_shipper_return() {
//     var end_date = new Date();
//     var begin_date = DateAdd("m", -2, new Date());
//     var bdate_str = DateToString(begin_date);
//     var edate_str = DateToString(end_date);

//     shopee_shipper_notice_return(bdate_str, edate_str, function (result) {
//         var data_list;
//         if (result.length == 0) {
//         } else {
//             data_list = result.records;
//             for (var i = 0; i < data_list.length; i++) {
//                 var supobj = Find_Supplier_By_Uid(data_list[i].supplier_uid);
//                 var sup_name = Get_Supplier_Uid_Alias(supobj);
//                 var datestr = data_list[i].shipping_date.substring(0, 10);
//                 if (data_list[i].order_return_type == "0") {
//                     $("#waitforship").append("<p>" + datestr + localized_text.have + '<span class="num">' + data_list[i].ordercount + "</span>" + localized_text.number + shipper_type_name[data_list[i].record_form] + localized_text.return + '<span class="num">' + localized_text.to_be_send_vehicle + "</span>(" + sup_name + ")</p>");
//                 } else if (data_list[i].order_return_type == "1") {
//                     $("#waitforship").append("<p>" + datestr + localized_text.have + '<span class="num">' + data_list[i].ordercount + "</span>" + localized_text.number + shipper_type_name[data_list[i].record_form] + localized_text.return + '<span class="num">' + localized_text.send_vehicle + "</span>" + localized_text.waiting_for_confirm + sup_name + ")</p>");
//                 }
//                 shipcount += parseInt(data_list[i].ordercount);
//                 $("#shipcount").html(`<span class="num">${shipcount}</span>` + localized_text.number);
//             }
//         }
//     });
//     $("#shipcount").html(`<span class="num">${shipcount}</span>` + localized_text.number);
// }

// function check_distributor_ship() {
//     distributor_ship_notice(function (result) {
//         var data_list;
//         if (result.length == 0) {
//         } else {
//             $("#waitforprocess").append('<p><span class="titi">' + localized_text.about_distributor + "</span></p>");
//             data_list = result.records;
//             for (var i = 0; i < data_list.length; i++) {
//                 var supobj = Find_Supplier_By_Uid(data_list[i].supplier_uid);
//                 var sup_name = Get_Supplier_Uid_Alias(supobj);
//                 if (data_list[i].op == Cyberspace.Client.GetSessionUid()) {
//                     if (data_list[i].record_type == 1) {
//                         //發注
//                         if (data_list[i].handle_state == 2) {
//                             $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + data_list[i].order_nid + "</span>" + localized_text.number_of_distributor_order + '<span class="num">' + localized_text.to_be_shipped + "</span>(" + sup_name + ")</p>");
//                         } else if (data_list[i].handle_state == 3) {
//                             $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + data_list[i].order_nid + "</span>" + localized_text.number_of_distributor_order_is_processing + sup_name + ")</p>");
//                         }
//                     } else if (data_list[i].record_type == 3) {
//                         //返品
//                         if (data_list[i].handle_state == 1) {
//                             $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + data_list[i].order_nid + "</span>" + localized_text.number_of_distributor_return + '<span class="num">' + localized_text.pending + "</span>(" + sup_name + ")</p>");
//                         } else if (data_list[i].handle_state == 2) {
//                             $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + data_list[i].order_nid + "</span>" + localized_text.number_of_distributor_return_is_processing + sup_name + ")</p>");
//                         }
//                     }
//                 }
//             }
//         }
//     });
// }
// function check_mkf() {
//     let today = new Date();
//     let year = today.getFullYear();
//     let month = today.getMonth() - 1; // 因為不要比這個月的請求月還晚，所以需要上個月的月份
//     let begin_date = new Date(year, month, 10); //這個日期沒有別的意思，只是要抓出上個月隨便一天大於1號的時間，所以挑了10號
//     var bdate_str = DateToString(begin_date);

//     mkf_all_notice(bdate_str, function (result) {
//         var data_list;
//         if (result.length == 0) {
//         } else {
//             $("#waitforprocess").append('<p><span class="titi">売上費用請求書</span></p>');
//             data_list = result.records;
//             for (var i = 0; i < data_list.length; i++) {
//                 var supobj = Find_Supplier_By_Uid(data_list[i].sup_id);
//                 var sup_name = Get_Supplier_Uid_Alias(supobj);
//                 if (data_list[i].rep_id == Cyberspace.Client.GetSessionUid()) {
//                     $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + data_list[i].count + "</span>" + localized_text.number_of_charge + '<span class="num">' + localized_text.request_is_not_applied + "</span> (" + sup_name + ")</p>");
//                 }
//             }
//         }
//     });
// }

// function check_ff_related_mkf() {
//     let today = new Date();
//     let year = today.getFullYear();
//     let month = today.getMonth() - 1; // 因為不要比這個月的請求月還晚，所以需要上個月的月份
//     let begin_date = new Date(year, month, 10); //這個日期沒有別的意思，只是要抓出上個月隨便一天大於1號的時間，所以挑了10號
//     let bdate_str = DateToString(begin_date);

//     mkf_ff_notice(bdate_str, function (data_list) {
//         $("#waitforprocess").append('<p><span class="titi">' + localized_text.charge + "</span></p>");

//         for (const data of data_list) {
//             if (getSupplierFFUser(data.sup_id) == Cyberspace.Client.GetSessionUid()) {
//                 let supobj = Find_Supplier_By_Uid(data.sup_id);
//                 let sup_name = Get_Supplier_Uid_Alias(supobj);
//                 $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + data.count + "</span>筆FF相殺資料待處理 (" + sup_name + ")</p>");
//             }
//         }
//     });
// }

// function check_ingredient() {
//     receiveAllNumOfIngredientNotice(function (result) {
//         $("#waitforprocess").append(`<p><span class="titi">${localized_text.ingredient_investigate}</span></p>`);

//         if (typeof result.notice_of_proudct_ingredient_list["2"] !== "undefined" || typeof result.notice_of_proudct_ingredient_list["3"] !== "undefined" || typeof result.notice_of_proudct_ingredient_list["4"] !== "undefined" || typeof result.notice_of_edit_ingredient_list["2"] !== "undefined" || typeof result.notice_of_edit_ingredient_list["3"] !== "undefined") {
//             if (typeof result.notice_of_proudct_ingredient_list["2"] !== "undefined") {
//                 for (const [index, notice_of_proudct_ingredient] of Object.entries(result.notice_of_proudct_ingredient_list["2"])) {
//                     $("#waitforprocess").append(
//                         `<p>${localized_text.you_have}
//             <span class="num">${notice_of_proudct_ingredient.number}
//             </span>${localized_text.text00000044_}(${index}_${notice_of_proudct_ingredient.supplier_alias})</p>`
//                     );
//                 }
//             }

//             if (typeof result.notice_of_proudct_ingredient_list["3"] !== "undefined") {
//                 for (const [index, notice_of_proudct_ingredient] of Object.entries(result.notice_of_proudct_ingredient_list["3"])) {
//                     $("#waitforprocess").append(
//                         `<p>${localized_text.you_have}
//             <span class="num">${notice_of_proudct_ingredient.number}
//             </span>${localized_text.text00000045_}(${index}_${notice_of_proudct_ingredient.supplier_alias})</p>`
//                     );
//                 }
//             }
//             if (typeof result.notice_of_proudct_ingredient_list["4"] !== "undefined") {
//                 for (const [index, notice_of_proudct_ingredient] of Object.entries(result.notice_of_proudct_ingredient_list["4"])) {
//                     $("#waitforprocess").append(
//                         `<p>${localized_text.you_have}
//             <span class="num">${notice_of_proudct_ingredient.number}
//             </span>${localized_text.text00000046_}(${index}_${notice_of_proudct_ingredient.supplier_alias})</p>`
//                     );
//                 }
//             }

//             if (typeof result.notice_of_edit_ingredient_list["2"] !== "undefined") {
//                 if (0 < result.notice_of_edit_ingredient_list["2"]) {
//                     $("#waitforprocess").append(
//                         `<p>${localized_text.you_have}
//             <span class="num">${result.notice_of_edit_ingredient_list["2"]}
//             </span>${localized_text.text00000047_}</p>`
//                     );
//                 }
//             }

//             if (typeof result.notice_of_edit_ingredient_list["3"] !== "undefined") {
//                 if (0 < result.notice_of_edit_ingredient_list["3"]) {
//                     $("#waitforprocess").append(
//                         `<p>${localized_text.you_have}
//             <span class="num">${result.notice_of_edit_ingredient_list["3"]}
//             </span>${localized_text.text00000048_}</p>`
//                     );
//                 }
//             }
//         }
//     });
// }

// function check_new_cosmetic_register() {
//     let sessionid = sessionStorage.getItem("session_uid");
//     const url = Cyberspace.Client.getHostname() + "product/cosmetic_register/list";
//     const config = {
//         method: "POST",
//         headers: {
//             "Content-Type": "text/plain;charset=UTF-8",
//         },
//         body: `sessionid=${sessionid}&field_list=supplier_uid,product_code,record_uid,ff_rep,op_rep,process_state,cmr_fee_record_uid,op_regdate&is_only_unfinished=1`,
//     };

//     fetch(url, config)
//         .then((res) => res.text())
//         .then(async (rep) => {
//             const data = JSON.parse(RemoveNonValidJSONChars(rep));
//             if (data.errno === "1") {
//                 let product_map = {};
//                 let cosmetic_product_list = [];
//                 for (const record of data.records) {
//                     let product_code = record[1];

//                     if (!product_map.hasOwnProperty(product_code)) {
//                         product_map[product_code] = {};
//                         product_map[product_code]["supplier_uid"] = record[0];
//                     }

//                     let cmr_record_uid = record[2];
//                     if (cmr_record_uid === "") {
//                         // 走到這一不代表前面那一步不是0，所以要看CMR的表格有沒有資料
//                         product_map[product_code]["status"] = "-99";
//                         continue; // 沒有登錄過，不用處理
//                     }

//                     if (!product_map[product_code].hasOwnProperty("records")) {
//                         product_map[product_code]["records"] = [];
//                     }

//                     let cosmetic_register_data = {
//                         record_uid: cmr_record_uid,
//                         ff_rep: record[3],
//                         op_rep: record[4],
//                         process_state: record[5],
//                         fee_record_uid: record[6],
//                         op_regdate: record[7],
//                     };
//                     product_map[product_code]["records"].push(cosmetic_register_data);
//                 }

//                 // 針對每個商品走訪所有的登錄紀錄
//                 for (const [product_code, product_info] of Object.entries(product_map)) {
//                     // 如果是未登錄，就不用往下做了，因為沒有紀錄可以處理
//                     if (product_info.hasOwnProperty("status") && "-99" == product_info["status"]) {
//                         continue;
//                     }
//                     if (product_info.hasOwnProperty("records")) {
//                         switch (parseInt(product_info.records[0].process_state)) {
//                             case -1: //無需登錄
//                                 product_map[product_code]["status"] = "0";
//                                 break;
//                             case 0: //不展延
//                                 product_map[product_code]["status"] = "-4";
//                                 break;
//                             case 1: //展延待確認
//                                 product_map[product_code]["status"] = "-5";
//                                 break;
//                             case 2: //未登錄待展延
//                                 product_map[product_code]["status"] = "-6";
//                                 break;
//                             case 3: //等待OP輸入資料
//                                 product_map[product_code]["status"] = "-7";
//                                 break;
//                             case 4: //已登錄完成，要檢查時間
//                                 let op_regdate = new Date(product_info.records[0].op_regdate);
//                                 let expired_date = new Date(op_regdate);
//                                 expired_date.setFullYear(expired_date.getFullYear() + 3);

//                                 let ff_reminddate = new Date(expired_date);
//                                 ff_reminddate.setMonth(ff_reminddate.getMonth() - 3);

//                                 let now = new Date();
//                                 if (now < ff_reminddate) {
//                                     // 登錄完成，且離提醒日期還早
//                                     product_map[product_code]["status"] = "1";
//                                 } else {
//                                     if (expired_date <= now) {
//                                         product_map[product_code]["status"] = "-3";
//                                     } else {
//                                         product_map[product_code]["status"] = "-2";
//                                     }
//                                 }
//                                 break;
//                             default:
//                                 return -1;
//                         }
//                     }
//                 }

//                 cosmetic_product_list = Object.keys(product_map).map((product_code) => ({
//                     supplier_uid: product_map[product_code].supplier_uid,
//                     product_code: product_code,
//                     records: product_map[product_code].records,
//                     status: product_map[product_code].status,
//                 }));

//                 let near_expired_map = {}; // 快到期 -2 且自己是FF
//                 let expired_map = {}; // 已到期 -3 且自己是FF
//                 let to_confirm_map = {}; // 展延待確認 -5 且op_rep是自己
//                 let to_extend_map = {}; // 未登錄待展延 -6  且ff_rep是自己
//                 let to_input_map = {}; // 待輸入資料 -7 且op_rep是自己
//                 let to_apply_fee_map = {}; // 費用待申請，且ff_rep是自己, process_state IN (3,4), fee_record_uid為空

//                 let cmr_count = 0;
//                 for (const product_info of cosmetic_product_list) {
//                     switch (product_info.status) {
//                         case "1": // 已登錄，要檢查費用待申請
//                             if (product_info.records[0].fee_record_uid == "" && product_info.records[0].ff_rep == sessionid) {
//                                 if (to_apply_fee_map.hasOwnProperty(product_info.supplier_uid)) {
//                                     to_apply_fee_map[product_info.supplier_uid]++;
//                                 } else {
//                                     to_apply_fee_map[product_info.supplier_uid] = 1;
//                                 }
//                                 cmr_count++;
//                             }
//                             break;
//                         case "-2":
//                             if (Cyberspace.Client.GetGroupUid() == "abt0") {
//                                 if (near_expired_map.hasOwnProperty(product_info.supplier_uid)) {
//                                     near_expired_map[product_info.supplier_uid]++;
//                                 } else {
//                                     near_expired_map[product_info.supplier_uid] = 1;
//                                 }
//                                 cmr_count++;
//                             }
//                             break;
//                         case "-3":
//                             if (Cyberspace.Client.GetGroupUid() == "abt0") {
//                                 if (expired_map.hasOwnProperty(product_info.supplier_uid)) {
//                                     expired_map[product_info.supplier_uid]++;
//                                 } else {
//                                     expired_map[product_info.supplier_uid] = 1;
//                                 }
//                                 cmr_count++;
//                             }
//                             break;
//                         case "-5":
//                             if (product_info.records[0].op_rep == sessionid) {
//                                 if (to_confirm_map.hasOwnProperty(product_info.supplier_uid)) {
//                                     to_confirm_map[product_info.supplier_uid]++;
//                                 } else {
//                                     to_confirm_map[product_info.supplier_uid] = 1;
//                                 }
//                                 cmr_count++;
//                             }
//                             break;
//                         case "-6":
//                             if (product_info.records[0].ff_rep == sessionid) {
//                                 if (to_extend_map.hasOwnProperty(product_info.supplier_uid)) {
//                                     to_extend_map[product_info.supplier_uid]++;
//                                 } else {
//                                     to_extend_map[product_info.supplier_uid] = 1;
//                                 }
//                                 cmr_count++;
//                             }
//                             break;
//                         case "-7":
//                             // 要順便檢查費用待申請
//                             if (product_info.records[0].fee_record_uid == "" && product_info.records[0].ff_rep == sessionid) {
//                                 if (to_apply_fee_map.hasOwnProperty(product_info.supplier_uid)) {
//                                     to_apply_fee_map[product_info.supplier_uid]++;
//                                 } else {
//                                     to_apply_fee_map[product_info.supplier_uid] = 1;
//                                 }
//                                 cmr_count++;
//                             }
//                             if (product_info.records[0].op_rep == sessionid) {
//                                 if (to_input_map.hasOwnProperty(product_info.supplier_uid)) {
//                                     to_input_map[product_info.supplier_uid]++;
//                                 } else {
//                                     to_input_map[product_info.supplier_uid] = 1;
//                                 }
//                                 cmr_count++;
//                             }
//                             break;
//                         default:
//                             break;
//                     }
//                 }

//                 if (Cyberspace.Client.GetGroupUid() == "abt0") {
//                     // FF就顯示...
//                     for (const [supplier_uid, number] of Object.entries(near_expired_map)) {
//                         $("#waitforcmr").append("<p>" + localized_text.you_have + '<span class="num">' + number + "</span>筆化妝品登錄即將到期" + "(" + supplier_uid + "_" + Find_Supplier_By_Uid(supplier_uid).supplier_alias + ")</p>");
//                     }

//                     for (const [supplier_uid, number] of Object.entries(expired_map)) {
//                         $("#waitforcmr").append("<p>" + localized_text.you_have + '<span class="num">' + number + "</span>筆化妝品登錄已過期(" + "(" + supplier_uid + "_" + Find_Supplier_By_Uid(supplier_uid).supplier_alias + ")</p>");
//                     }
//                 }

//                 // OP
//                 for (const [supplier_uid, number] of Object.entries(to_confirm_map)) {
//                     $("#waitforcmr").append("<p>" + localized_text.you_have + '<span class="num">' + number + "</span>筆化妝品登錄展延待確認" + "(" + supplier_uid + "_" + Find_Supplier_By_Uid(supplier_uid).supplier_alias + ")</p>");
//                 }

//                 // FF
//                 for (const [supplier_uid, number] of Object.entries(to_extend_map)) {
//                     $("#waitforcmr").append("<p>" + localized_text.you_have + '<span class="num">' + number + "</span>" + "筆化妝品登錄未登錄待展延" + "(" + supplier_uid + "_" + Find_Supplier_By_Uid(supplier_uid).supplier_alias + ")</p>");
//                 }

//                 // OP
//                 for (const [supplier_uid, number] of Object.entries(to_input_map)) {
//                     $("#waitforcmr").append("<p>" + localized_text.you_have + '<span class="num">' + number + "</span>" + "筆化妝品登錄待輸入資料" + "(" + supplier_uid + "_" + Find_Supplier_By_Uid(supplier_uid).supplier_alias + ")</p>");
//                 }

//                 // FF
//                 for (const [supplier_uid, number] of Object.entries(to_apply_fee_map)) {
//                     $("#waitforcmr").append("<p>" + localized_text.you_have + '<span class="num">' + number + "</span>" + "筆化妝品登錄待申請費用" + "(" + supplier_uid + "_" + Find_Supplier_By_Uid(supplier_uid).supplier_alias + ")</p>");
//                 }

//                 $("#cmrcount").html(`<span class="num">${cmr_count}</span>` + localized_text.number);
//             }
//         });
// }

// function RemoveNonValidJSONChars(val) {
//     let string = val.replace(/\\n/g, "\\n").replace(/\\'/g, "\\'").replace(/\\"/g, '\\"').replace(/\\&/g, "\\&").replace(/\\r/g, "\\r").replace(/\\t/g, "\\t").replace(/\\b/g, "\\b").replace(/\\f/g, "\\f");
//     // remove non-printable and other non-valid JSON chars
//     string = string.replace(/[\u0000-\u0019]+/g, "");
//     return string;
// }

// function check_processing_mkf() {
//     const url = Cyberspace.Client.getHostname() + "market_fee/processing_notice";
//     const config = {
//         method: "POST",
//         headers: {
//             "Content-Type": "text/plain;charset=UTF-8",
//         },
//         body: `sessionid=${sessionStorage.getItem("session_uid")}`,
//     };
//     fetch(url, config)
//         .then((res) => res.text())
//         .then(async (rep) => {
//             const data = JSON.parse(RemoveNonValidJSONChars(rep));
//             if (data.errno === "1") {
//                 let part1_check_records = {};
//                 let part2_check_records = {};

//                 $("#waitforprocess").append('<p><span class="titi">' + localized_text.charge + "</span></p>");
//                 data.records.forEach((record) => {
//                     let supobj = Find_Supplier_By_Uid(record[2]);
//                     let sup_name = Get_Supplier_Uid_Alias(supobj);
//                     switch (parseInt(record[0])) {
//                         case 1:
//                             if (parseInt(record[3]) === 1) {
//                                 $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + record[1] + "</span>" + localized_text.number_of_charge + '<span class="num">待處理</span> (' + sup_name + ")</p>");
//                             } else if ([2, 3].includes(parseInt(record[3]))) {
//                                 if (part1_check_records.hasOwnProperty(parseInt(record[2]))) {
//                                     part1_check_records[parseInt(record[2])] += parseInt(record[1]);
//                                 } else {
//                                     part1_check_records[parseInt(record[2])] = parseInt(record[1]);
//                                 }
//                             }
//                             break;
//                         case 2:
//                             if (parseInt(record[3]) === 1) {
//                                 $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + record[1] + "</span>筆原價" + '<span class="num">待處理</span> (' + sup_name + ")</p>");
//                             } else if ([2, 3, 6].includes(parseInt(record[3]))) {
//                                 if (part2_check_records.hasOwnProperty(parseInt(record[2]))) {
//                                     part2_check_records[parseInt(record[2])] += parseInt(record[1]);
//                                 } else {
//                                     part2_check_records[parseInt(record[2])] = parseInt(record[1]);
//                                 }
//                             }
//                             break;
//                         case 3:
//                             $("#waitforprocess").append("<p>" + localized_text.you_have + '賣上紀錄編號<span class="num">' + record[1] + "</span>" + "未押終了日 (" + sup_name + ")</p>");
//                             break;
//                         default:
//                             break;
//                     }
//                 });
//                 for (const supplier_id in part1_check_records) {
//                     let supobj = Find_Supplier_By_Uid(supplier_id);
//                     let sup_name = Get_Supplier_Uid_Alias(supobj);
//                     $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + part1_check_records[supplier_id] + "</span>" + localized_text.number_of_charge + '<span class="num">' + "待審核" + "</span> (" + sup_name + ")</p>");
//                 }

//                 for (const supplier_id in part2_check_records) {
//                     let supobj = Find_Supplier_By_Uid(supplier_id);
//                     let sup_name = Get_Supplier_Uid_Alias(supobj);
//                     $("#waitforprocess").append("<p>" + localized_text.you_have + '<span class="num">' + part2_check_records[supplier_id] + "</span>" + "筆原價" + '<span class="num">' + "待審核" + "</span> (" + sup_name + ")</p>");
//                 }
//             } else location.href = "/bamboo/login.html";
//         });
// }
