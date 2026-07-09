///////////////////////////////////////////////////////////////////////////////
function createLangObj(...arg) {
  let result = {},
    num = 1;
  for (let index = 0; index < arg.length; index++) {
    // const langs  = Object.values(arg[index])
    // for (const lang of langs) {
    //     if(num<10){
    //         result[`text0000000${num}`] = lang
    //     } else if(num<100){
    //         result[`text000000${num}`] = lang
    //     } else if(num<1000){
    //         result[`text00000${num}`] = lang
    //     } else if(num<10000){
    //         result[`text0000${num}`] = lang
    //     }
    //     num++
    // }
    result = { ...result, ...arg[index] };
  }
  return result;
}

function MsgBox_QueryReult(title, errno, callback) {
  var msgstring;

  switch (errno) {
    case QERRNO_SUCCESS:
      {
        msgstring = "成功";
      }
      break;
    case QERRNO_NEED_SESSION_ID:
      {
        msgstring = "失敗: 請先登入驗證";
      }
      break;
    case QERRNO_ID_ALREADY_EXIST:
      {
        msgstring = "失敗: 編號重複";
      }
      break;
    case QERRNO_PERMISSION_DENY:
      {
        msgstring = "失敗: 權限不符，請重新登入";
      }
      break;
    case QERRNO_LOGIN_TIMEOUT:
      {
        msgstring = "失敗: 登入逾時，請重新登入";
      }
      break;
    default:
      {
        msgstring = "失敗";
      }
      break;
  }

  messageBox(title + " : " + msgstring, "Result", {
    Ok: function () {
      if (callback) {
        callback(errno);
      }
    },
  });
}

function getQueryReultString(title, errno) {
  var msgstring;

  switch (errno) {
    case QERRNO_SUCCESS:
      {
        msgstring = "成功";
      }
      break;
    case QERRNO_NEED_SESSION_ID:
      {
        msgstring = "失敗: 請先登入驗證";
      }
      break;
    case QERRNO_ID_ALREADY_EXIST:
      {
        msgstring = "失敗: 編號重複";
      }
      break;
    case QERRNO_PERMISSION_DENY:
      {
        msgstring = "失敗: 權限不符，請重新登入";
      }
      break;
    case QERRNO_LOGIN_TIMEOUT:
      {
        msgstring = "失敗: 登入逾時，請重新登入";
      }
      break;
    default:
      {
        msgstring = "失敗";
      }
      break;
  }

  return title + " : " + msgstring;
}

// [Phase 2 優化] 將同步請求改為非同步 Promise，避免阻塞 UI
function receiveAllNumOfIngredientNotice(callback) {
  return new Promise((resolve, reject) => {
    const sessionToken =
      (Cyberspace.Client.getSessionToken &&
        Cyberspace.Client.getSessionToken()) ||
      window.sessionStorage.getItem("session_token");

    Cyberspace.Client.SendRequest(
      "receivce_all_ingredient_notice",
      { sessionid: sessionToken },
      function (ok, result) {
        if (!ok) {
          console.error("API request failed for ingredient notice.");
          if (callback) callback(null);
          reject(new Error("Request failed"));
          return;
        }

        const resultObj = StringToJson(result);
        if (resultObj && resultObj.errno === "1") {
          let ret = {
            notice_of_edit_ingredient_list: { 2: 0, 3: 0 },
            notice_of_proudct_ingredient_list: {},
          };

          if (resultObj.notice_of_edit_ingredient) {
            resultObj.notice_of_edit_ingredient.forEach((edit_ingredient) => {
              const state = parseInt(edit_ingredient[1]);
              const count = parseInt(edit_ingredient[0]);
              if (state === 1 || state === 2) {
                ret.notice_of_edit_ingredient_list["2"] += count;
              } else {
                ret.notice_of_edit_ingredient_list[state] =
                  (ret.notice_of_edit_ingredient_list[state] || 0) + count;
              }
            });
          }

          if (resultObj.notice_of_proudct_ingredient) {
            resultObj.notice_of_proudct_ingredient.forEach(
              (proudct_ingredient) => {
                const count = parseInt(proudct_ingredient[0]);
                const supplier_alias = proudct_ingredient[1];
                const supplier_id = proudct_ingredient[2];
                const state = parseInt(proudct_ingredient[3]);

                let targetState = "3";
                if (state === 1 || state === 2) targetState = "2";
                else if (state === 4) targetState = "4";

                if (!ret.notice_of_proudct_ingredient_list[targetState]) {
                  ret.notice_of_proudct_ingredient_list[targetState] = {};
                }

                if (
                  !ret.notice_of_proudct_ingredient_list[targetState][
                    supplier_id
                  ]
                ) {
                  ret.notice_of_proudct_ingredient_list[targetState][
                    supplier_id
                  ] = { number: 0, supplier_alias: supplier_alias };
                }
                ret.notice_of_proudct_ingredient_list[targetState][
                  supplier_id
                ].number += count;
              },
            );
          }
          if (callback) callback(ret);
          resolve(ret);
        } else {
          if (callback) callback(null);
          reject(new Error("API logic failed"));
        }
      },
    );
  });
}
function Cosmeticreg_Request_Select_All_Notice(begin_date, end_date, callback) {
  // [Phase 4 修復] 修正錯誤的函式名稱 SyncRequest -> SendRequest，並調整為非同步
  Cyberspace.Client.SendRequest(
    "cosmeticreg_select_all_notice",
    {
      sessionid: Cyberspace.Client.GetSessionUid(),
      begin_date: begin_date + " 00:00:00",
      end_date: end_date + " 23:59:59",
    },
    function (ok, result) {
      if (!ok) return;

      //console.log(result);
      result = StringToJson(result);
      let cmr_list = Array();
      console.log(result);
      console.log(result.records.length);
      for (let i = 0; i < result.records.length; i++) {
        let cmr_object = {
          record_uid: result.records[i][0],
          cmr_opregdate: result.records[i][8],
          cmr_opregno: result.records[i][7],
          sup_id: result.records[i][2],
          product_code: result.records[i][3],
          product_name: result.records[i][4],
          ff_rep: result.records[i][5],
          op_rep: result.records[i][6],
          reg_filename: result.records[i][10].file_name,
          reg_filepath: result.records[i][10].file_path,
          medical_flag: result.records[i][11],
          medical_regno: result.records[i][12],
          medical_regdate: result.records[i][13],
          fee_record_id: result.records[i][15],
        };
        cmr_list.push(cmr_object);
      }
      if (callback) {
        result = cmr_list;
        callback(result);
      }
    },
  );
}
function Cosmeticreg_Request_Select_All_Need_Reg_Again(callback) {
  // [Phase 4 修復] 修正錯誤的函式名稱 SyncRequest -> SendRequest，並調整為非同步
  Cyberspace.Client.SendRequest(
    "cosmeticreg_select_all_need_reg_again",
    {
      sessionid: Cyberspace.Client.GetSessionUid(),
    },
    function (ok, result) {
      if (!ok) return;

      //console.log(result);
      result = StringToJson(result);
      let cmr_list = Array();
      console.log(result);
      console.log(result.records.length);
      for (let i = 0; i < result.records.length; i++) {
        let cmr_object = {
          record_uid: result.records[i][0],
          cmr_opregdate: result.records[i][8],
          cmr_opregno: result.records[i][7],
          sup_id: result.records[i][2],
          product_code: result.records[i][3],
          product_name: result.records[i][4],
          ff_rep: result.records[i][5],
          op_rep: result.records[i][6],
          reg_filename: result.records[i][10].file_name,
          reg_filepath: result.records[i][10].file_path,
          medical_flag: result.records[i][11],
          medical_regno: result.records[i][12],
          medical_regdate: result.records[i][13],
          fee_record_id: result.records[i][15],
        };
        cmr_list.push(cmr_object);
      }
      if (callback) {
        result = cmr_list;
        callback(result);
      }
    },
  );
}

function Fee_List(callback) {
  Cyberspace.Client.Request(
    "fee/list",
    {
      sessionid: Cyberspace.Client.GetSessionUid(),
      supplier_uid: 0,
      record_state: 0,
      field_list:
        "supplier_uid,creater_id,processor_id,fee_status_id,Approved_id",
      is_self_only: 1,
    },
    function (result) {
      result = StringToJson(result);
      // 轉換資料
      let fee_list = [];
      // 紀錄資料
      for (let i = 0; i < result.records.length; i++) {
        let fee_object = {
          supplier_uid: result.records[i][0],
          creater_id: result.records[i][1],
          processor_id: result.records[i][2],
          fee_status_id: result.records[i][3],
          Approved_id: result.records[i][4],
        };
        fee_list.push(fee_object);
      }

      if (callback) {
        callback(fee_list);
      }
    },
  );
}

var person_list = new Array();
function Fee_Person_Request_List(groupid, callback) {
  // [Phase 4 修復] 修正錯誤的函式名稱 SyncRequest -> SendRequest，並調整為非同步
  Cyberspace.Client.SendRequest(
    "fee_person_show",
    {
      sessionid: Cyberspace.Client.GetSessionUid(),
      groupid: groupid,
    },
    function (ok, result) {
      if (!ok) return;
      result = StringToJson(result);
      var order_list = Array();

      for (var i = 0; i < result.records.length; i++) {
        var temp_list = Array();
        var groupid = result.records[i][0];
        var memberid = result.records[i][1];
        var name = result.records[i][2];
        var state = result.records[i][3];
        temp_list = [groupid, memberid, name, state];
        order_list.push(temp_list);
      }
      person_list = order_list;
      if (callback) {
        callback(order_list);
      }
    },
  );
}
function find_person_by_id(memberid) {
  for (var i = 0; i < person_list.length; i++) {
    if (person_list[i][1] == memberid) {
      return person_list[i][2];
    }
  }
  return null;
}

function getFile(file_path, filename) {
  //var currentLocation = window.location;
  var new_file_path = new URL(file_path);
  new_file_path.hostname = new URL(download_link).hostname;
  new_file_path.protocol = "https:";
  $.ajax({
    url: new_file_path,
    method: "GET",
    xhrFields: {
      responseType: "blob",
    },
    success: function (data) {
      var a = document.createElement("a");
      var url = window.URL.createObjectURL(data);
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    },
  });
}

// 找出所有訂單資料，用於退貨
function Return_Request_Select_Order_All(
  supplier_uid,
  prn_record_state,
  begin_date,
  end_date,
  limit_offset,
  limit_rowcount,
  whereClause,
  orderby,
  date_type,
  product_type,
  callback,
  is_group_buy = "",
) {
  Cyberspace.Client.Request(
    "return_select_order_all",
    {
      sessionid: Cyberspace.Client.GetSessionUid(),
      supplier_uid: supplier_uid,
      prn_record_state: prn_record_state,
      begin_date: begin_date,
      end_date: end_date,
      limit_offset: limit_offset,
      limit_rowcount: limit_rowcount,
      whereClause: whereClause,
      orderby: orderby,
      date_type: date_type,
      product_type: product_type,
      is_group_buy: is_group_buy,
    },
    function (result) {
      result = StringToJson(result);
      console.log(result);

      // 轉換資料
      let return_list = Array();

      // 紀錄資料
      for (let i = 0; i < result.records.length; i++) {
        let order = {
          order_nid: result.records[i][2],
          customer_name: result.records[i][36] || result.records[i][42],
          customer_phone: result.records[i][37],
          shipping_date: result.records[i][11],
          product_item_code: result.records[i][30],
          product_item_name: result.records[i][31],
          pay_method: result.records[i][29],
          return_state: result.records[i][4],
          recipient_phone: result.records[i][41],
          product_set_code: result.records[i][7],
          product_set_name: result.records[i][43],
        };
        return_list.push(order);
      }

      if (callback) {
        callback(return_list);
      }
    },
  );
}

function Return_Request_Select_005(
  supplier_uid,
  order_nid,
  begin_date,
  callback,
) {
  Cyberspace.Client.Request(
    "return_select_005",
    {
      sessionid: Cyberspace.Client.GetSessionUid(),
      supplier_uid: supplier_uid,
      order_nid: order_nid,
      begin_date: begin_date,
    },
    function (result) {
      result = StringToJson(result);
      console.log(result);
      // 轉換資料
      let order_info_list = new Array();

      for (let i = 0; i < result.records.length; i++) {
        let order_with_return = {
          order_nid: result.records[i][2],
          record_type: result.records[i][1],
          shipping_date: result.records[i][11],
          customer_name: result.records[i][36] || result.records[i][46],
          customer_phone: result.records[i][37] || result.records[i][43],
          customer_email: result.records[i][39] || result.records[i][42],
          pay_method: result.records[i][29],
          product_set_cost_currency: result.records[i][40],
          product_set_cost_amount: result.records[i][41],
          return_a_date: result.records[i][9],
          return_b_date: result.records[i][10],
          delivery_uid: result.records[i][25],
          warehouse_uid: result.records[i][12],
          return_state: result.records[i][4],
          refund_method: result.records[i][13],
          refund_date: result.records[i][17],
          refund_account: result.records[i][18],
          refund_currency: result.records[i][16],
          refund_amount: result.records[i][14],
          refund_ramount: result.records[i][15],
          return_reason: result.records[i][24],
          product_item_code: result.records[i][30],
          product_item_name: result.records[i][31],
          product_item_quantity: result.records[i][32],
          product_state_quantity: result.records[i][6],
          recipient_email: result.records[i][42],
          recipient_phone: result.records[i][43],
          product_set_sale_currency: result.records[i][44],
          product_set_sale_amount: result.records[i][45],
          product_set_code: result.records[i][47],
          product_set_name: result.records[i][48],
          product_set_quantity: result.records[i][49],
        };

        console.log(order_with_return);
        order_info_list.push(order_with_return);
      }

      if (callback) {
        // result.records = order_info_list;
        callback(order_info_list);
      }
    },
  );
}

function Return_Request_Select_Count(
  supplier_uid,
  prn_record_state,
  start_date,
  begin_date,
  end_date,
  whereClause,
  date_type,
  product_type,
  callback,
  is_group_buy = "",
) {
  Cyberspace.Client.Request(
    "return_select_count",
    {
      sessionid: Cyberspace.Client.GetSessionUid(),
      supplier_uid: supplier_uid,
      prn_record_state: prn_record_state,
      start_date: start_date,
      begin_date: begin_date,
      end_date: end_date,
      whereClause: whereClause,
      date_type: date_type,
      product_type: product_type,
      is_group_buy: is_group_buy,
    },
    function (result) {
      result = StringToJson(result);

      if (callback) {
        callback(result);
      }
    },
  );
}

function Report_Request(supplier_uid, report_nid, yyyy, m, callback) {
  Cyberspace.Client.Request(
    "httpreporter",
    {
      sessionid: Cyberspace.Client.GetSessionUid(),
      supplier_uid: supplier_uid,
      report_nid: report_nid,
      yyyy: yyyy,
      m: m,
    },
    function (result) {
      result = StringToJson(result);

      if (callback) {
        callback(result);
      }
    },
  );
}

// ------------ purchase ------------
function purchase_Request_Select_All_Notice(bdate_str, edate_str, callback) {
  var ddd = -1;
  Cyberspace.Client.Request(
    "purchase_select_all_notice",
    {
      sessionid: Cyberspace.Client.GetSessionUid(),
      bdate_str: bdate_str,
      edate_str: edate_str,
    },
    function (result) {
      result = StringToJson(result);
      // 轉換資料
      let purchase_list = Array();
      // 紀錄資料
      for (let i = 0; i < result.records.length; i++) {
        let purchase = {
          purchase_uid: result.records[i][0],
          purchase_date: result.records[i][1].split(" ")[0],
          create_person: result.records[i][2],
          responsible_person: result.records[i][3],
          process_state: result.records[i][4],
          expected_date: result.records[i][5].split(" ")[0],
          product_content: result.records[i][6],
          fn1: result.records[i][7],
          fn2: result.records[i][8],
          supid: result.records[i][9],
        };
        purchase_list.push(purchase);
      }
      //g_purchase_list = purchase_list;

      if (callback) {
        result.records = purchase_list;
        callback(result);
      }
    },
  );
}

// ------------ supplier ------------
// 暫存
var g_supplier_list = new Array();
function Find_Supplier_By_Uid(suppiler_uid) {
  for (var i = 0; i < g_supplier_list.length; i++) {
    if (Number(g_supplier_list[i].supplier_uid) == Number(suppiler_uid)) {
      return g_supplier_list[i];
    }
  }
  return null;
}

function getSupplierFFUser(supplier_uid) {
  for (const supplier_info of g_supplier_list) {
    if (parseInt(supplier_info.supplier_uid) == parseInt(supplier_uid)) {
      if (supplier_info.contractor_b.hasOwnProperty("ff_user")) {
        return supplier_info.contractor_b["ff_user"];
      } else {
        return 0;
      }
    }
  }
  return 0;
}

// 取得產品的 編碼加名稱
function Get_Supplier_Uid_Alias(supplier_obj) {
  if (supplier_obj)
    return (
      padLeft(supplier_obj.supplier_uid, 3) + "_" + supplier_obj.supplier_alias
    );
  return "";
}

function Set_Selected_Supplier(suppiler_uid) {
  window.sessionStorage.setItem("def_supplier_uid", suppiler_uid);
  //setCookie( "def_supplier_uid", suppiler_uid );
}

function Get_Select_Supplier() {
  var item_name = window.sessionStorage.getItem("def_supplier_uid");
  if (item_name == null) item_name = "";
  return item_name;
}

function Supplier_Request_Select_Show(callback) {
  Cyberspace.Client.Request(
    "supplier/list",
    {
      sessionid: Cyberspace.Client.GetSessionUid(),
      record_state: 1,
      supplier_type: "1,2,3,4,5,6,7,8,10",
      field_list:
        "supplier_uid,supplier_code,supplier_alias,supplier_name,supplier_type,supplier_phone,supplier_address,commission_rate,shopping_system,record_state,contractor_a,account_information,winton_name,contractor_b,supplier_country",
    },
    function (result) {
      result = StringToJson(result);
      if (result.errno == -1076 || result.errno == -1077) {
        location.href = "/bamboo/login.html";
      }

      let def_supplier_uid = Get_Select_Supplier();
      let supplier_list = Array();
      // 紀錄資料
      for (let i = 0; i < result.records.length; i++) {
        let supplier = {
          supplier_uid: result.records[i][0],
          supplier_code: result.records[i][1],
          supplier_alias: result.records[i][2],
          supplier_name: result.records[i][3],
          supplier_type: result.records[i][4],
          supplier_phone: result.records[i][5],
          supplier_address: result.records[i][6],
          commission_rate: result.records[i][7],
          shopping_system: result.records[i][8],
          record_state: result.records[i][9],
          contractor_a: result.records[i][10],
          account_information: result.records[i][11],
          contractor_b: result.records[i][13],
          supplier_country: result.records[i][14],
        };
        // 選到的就把他排在第一個 方便常用
        if (def_supplier_uid == supplier.supplier_uid) {
          supplier_list.unshift(supplier);
        } else {
          supplier_list.push(supplier);
        }
      }
      // 放入暫存中
      g_supplier_list = supplier_list;

      if (callback) {
        result.records = supplier_list;
        callback(result);
      }
    },
  );
}

function shopee_shipper_notice_return(begin_date, end_date, callback) {
  Cyberspace.Client.Request(
    "shopee_shipper_return_notice",
    {
      sessionid: Cyberspace.Client.GetSessionUid(),
      begin_date: begin_date + " 00:00:00",
      end_date: end_date + " 23:59:59",
    },
    function (result) {
      result = StringToJson(result);
      // 轉換資料
      let data_list = Array();
      {
        // 紀錄資料
        for (let i = 0; i < result.records.length; i++) {
          let shipperdata = {
            shipping_date: result.records[i][0],
            ordercount: result.records[i][1],
            supplier_uid: result.records[i][2],
            record_form: result.records[i][3],
            order_return_type: result.records[i][4],
          };

          data_list.push(shipperdata);
        }
      }
      if (callback) {
        result.records = data_list;
        callback(result);
      }
    },
  );
}
function PageReport_Request(
  supplier_uid,
  report_nid,
  byyyy,
  bmm,
  bdd,
  eyyyy,
  emm,
  edd,
  callback,
) {
  Cyberspace.Client.Request(
    "pagereporter",
    {
      sessionid: Cyberspace.Client.GetSessionUid(),
      supplier_uid: supplier_uid,
      report_nid: report_nid,
      byyyy: byyyy,
      bmm: bmm,
      bdd: bdd,
      eyyyy: eyyyy,
      emm: emm,
      edd: edd,
    },
    function (result) {
      result = StringToJson(result);

      if (callback) {
        callback(result);
      }
    },
  );
}

function Supplier_Request_Select_All(callback) {
  Cyberspace.Client.Request(
    "supplier_select_all",
    {
      sessionid: Cyberspace.Client.GetSessionUid(),
      supplier_type: (type = ""),
    },
    function (result) {
      result = StringToJson(result);
      if (result.errno == -1076 || result.errno == -1077) {
        location.href = "/bamboo/login.html";
      }

      let def_supplier_uid = Get_Select_Supplier();
      let supplier_list = Array();
      // 紀錄資料
      for (let i = 0; i < result.records.length; i++) {
        let supplier = {
          supplier_uid: result.records[i][0],
          supplier_code: result.records[i][1],
          supplier_alias: result.records[i][2],
          supplier_name: result.records[i][3],
          supplier_type: result.records[i][4],
          supplier_phone: result.records[i][5],
          supplier_address: result.records[i][6],
          commission_rate: result.records[i][7],
          shopping_system: result.records[i][8],
          record_state: result.records[i][9],
          contractor_a: result.records[i][10],
          account_information: result.records[i][11],
          contractor_b: result.records[i][13],
          supplier_country: result.records[i][14],
        };
        // 選到的就把他排在第一個 方便常用
        if (def_supplier_uid == supplier.supplier_uid) {
          supplier_list.unshift(supplier);
        } else {
          supplier_list.push(supplier);
        }
      }
      // 放入暫存中
      g_supplier_list = supplier_list;

      if (callback) {
        result.records = supplier_list;
        callback(result);
      }
    },
  );
}
