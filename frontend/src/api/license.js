//  (原 www/modules/app.module.license.js 原封搬移)
import { Cyberspace } from '@/core/net'

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

///////////////////////////////////////////////////////////////////////////////
console.log("License module loaded");

// 訂單相關資訊
export var LicenseData = {
  object_name: "license_data",
  license_cid: "",
  product_type: "1", // 預設為0看以後需不需要
  create_time: "",
  record_state: "",
  owner_cid: "",
  agent_cid: "",
  license_begin_time: "",
  license_days: "",
  license_count: "",
  sale_amount: "",
  country: "",
  customer_name: "",
  customer_gender: "",
  customer_birthday: "",
  customer_phone: "",
  customer_postalcode: "",
  customer_address: "",
  customer_email: "",
  // "recipient_name": "",
  // "recipient_gender": "",
  // "recipient_birthday": "",
  // "recipient_phone": "",
  // "recipient_postalcode": "",
  // "recipient_address": "",
  // "recipient_email": "",
  note00: "",
};

// if (typeof window._k_search_condition_type_by_owner_cid === "undefined") {
//     window._k_search_condition_type_by_owner_cid = "2";
// }

// if (typeof window._k_search_condition_type_by_agent_cid === "undefined") {
//     window._k_search_condition_type_by_agent_cid = "6";
// }

// if (typeof window._k_search_condition_type_by_product_type === "undefined") {
//     window._k_search_condition_type_by_product_type = "7";
// }

// condition_value = " agnet_cid, owner_cid, record_state, product_type"
if (
  typeof window._k_search_condition_type_by_agent_cid__and__owner_cid__and__record_state__and__product_type ===
  "undefined"
) {
  window._k_search_condition_type_by_agent_cid__and__owner_cid__and__record_state__and__product_type =
    "16";
}

// condition_value = " agnet_cid, owner_cid, record_state, product_type, customer_name"
if (
  typeof window._k_search_condition_type_by_agent_cid__and__owner_cid__and__record_state__and__product_type__and__like_customer_name ===
  "undefined"
) {
  window._k_search_condition_type_by_agent_cid__and__owner_cid__and__record_state__and__product_type__and__like_customer_name =
    "18";
}

// if (typeof window._k_search_condition_type_like_owner_cid === "undefined") {
//     window._k_search_condition_type_like_owner_cid = "102";
// }

// if (typeof window._k_search_condition_type_like_agent_cid === "undefined") {
//     window._k_search_condition_type_like_agent_cid = "106";
// }

// if (typeof window._k_search_condition_type_like_product_type === "undefined") {
//     window._k_search_condition_type_like_product_type = "107";
// }

//_______________________________________________________________________________

//===============================================================================
// NAME :
// DESC : 訂單資料數量
//        condition_type 用什麼條件取得
//                "by_agent_cid"
//                "by_owner_cid"
//                "like_agent_cid"
//                "like_owner_cid"
//        owner_cid 或 anget_cid 傳入一個即可
//===============================================================================
export function CsRequestLicenseSelectAllCount(
  condition_type,
  condition_value,
  b_time,
  e_time,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  if (condition_type == null || condition_value == null) {
    alert(window.localeData.warring.no_param);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/license/select_all_count",
    {
      condition_type: condition_type,
      condition_value: condition_value,
      b_time: b_time,
      e_time: e_time,
    },
    (error, result) => {
      if (
        abortController &&
        abortController.signal &&
        abortController.signal.aborted
      )
        return;
      if (callback) {
        // test
        // Success!
        Cyberspace.Client.DebugLog("License Count Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 取得授權統計資料 (YoY, QoQ)
//===============================================================================
export function CsRequestLicenseGetStatistics(
  condition_type,
  condition_value,
  today_date,
  last_year_date,
  cur_q_begin,
  cur_q_end,
  last_q_begin,
  last_q_end,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/license/get_statistics",
    {
      condition_type: condition_type,
      condition_value: condition_value,
      today_date: today_date,
      last_year_date: last_year_date,
      cur_q_begin: cur_q_begin,
      cur_q_end: cur_q_end,
      last_q_begin: last_q_begin,
      last_q_end: last_q_end,
    },
    (error, result) => {
      if (
        abortController &&
        abortController.signal &&
        abortController.signal.aborted
      )
        return;
      if (callback) {
        Cyberspace.Client.DebugLog("License Statistics Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 訂單資料列表
//===============================================================================
export function CsRequestLicenseSelectAllRecords(
  condition_type,
  condition_value,
  b_time,
  e_time,
  offset,
  row_count,
  search_keyword,
  sort_field,
  sort_order,
  status_filter,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  if (condition_type == null) {
    condition_type == "";
  }
  if (condition_value == null) {
    condition_value == "";
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/license/select_all_records",
    {
      condition_type: condition_type,
      condition_value: condition_value,
      b_time: b_time,
      e_time: e_time,
      offset: offset,
      row_count: row_count,
      search_keyword: search_keyword,
      sort_field: sort_field,
      sort_order: sort_order,
      status_filter: status_filter,
    },
    (error, result) => {
      if (
        abortController &&
        abortController.signal &&
        abortController.signal.aborted
      )
        return;
      if (callback) {
        // test
        // Success!
        Cyberspace.Client.DebugLog("License Records Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 訂單單筆詳細資料
//===============================================================================
export function CsRequestLicenseSelectOneRecordByCID(
  license_cid,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  if (license_cid == null) {
    license_cid == "";
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/license/select_one_record",
    {
      license_cid: license_cid,
    },
    (error, result) => {
      if (
        abortController &&
        abortController.signal &&
        abortController.signal.aborted
      )
        return;
      if (callback) {
        // test
        // Success!
        Cyberspace.Client.DebugLog("License One Record Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 新增訂單
//===============================================================================
export function CsRequestLicenseInsertOneRecord(
  order_data,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  // 將必要欄位整理到 data；其他欄位也會一起送（如有）
  var data = {
    owner_cid: order_data.owner_cid, // 必要
    license_begin_time: order_data.license_begin_time, // 必要
    product_type: order_data.product_type, // 必要
    license_days: order_data.license_days, // 必要
    license_count: order_data.license_count, // 必要
    sale_amount: order_data.sale_amount,
    country: order_data.country,
    customer_name: order_data.customer_name,
    customer_gender: order_data.customer_gender,
    customer_birthday: order_data.customer_birthday,
    customer_phone: order_data.customer_phone,
    customer_postalcode: order_data.customer_postalcode,
    customer_address: order_data.customer_address,
    customer_email: order_data.customer_email,
    note00: order_data.note00,
    agent_cid: order_data.agent_cid,
  };

  // 合併可能的檔案欄位（擇一存在即可）
  if (order_data["files[]"]) data["files[]"] = order_data["files[]"];
  else if (order_data.files) data["files[]"] = order_data.files;
  else if (order_data.attachments) data["files[]"] = order_data.attachments;

  // 走你現有的 Helper（建議）
  if (
    Cyberspace &&
    Cyberspace.Client &&
    typeof Cyberspace.Client.SendFormDataWithFiles === "function"
  ) {
    Cyberspace.Client.SendFormDataWithFiles(
      "/ava_system/license/insert_one_record",
      data,
      function (ok, result) {
        if (
          abortController &&
          abortController.signal &&
          abortController.signal.aborted
        )
          return;
        if (callback) {
          Cyberspace.Client.DebugLog("License Insert Result", result);
          callback(ok, result);
        }
      },
      { abortController },
    );
    return;
  }
}

//===============================================================================
// NAME :
// DESC : 更新訂單
//===============================================================================
export function CsRequestLicenseUpdateOneRecord(
  order_data,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  if (
    !(
      Cyberspace &&
      Cyberspace.Client &&
      typeof Cyberspace.Client.SendFormDataWithFiles === "function"
    )
  ) {
    throw new Error("Cyberspace.Client.SendFormDataWithFiles is not available");
  }

  // 整理要送的欄位（可依實際需要再加）
  var data = {
    license_cid: order_data.license_cid || "", // 必要
    record_state: order_data.record_state || "",
    owner_cid: order_data.owner_cid || "", // 必要
    license_begin_time: order_data.license_begin_time || "", // 必要
    product_type: order_data.product_type || "", // 必要
    license_days: order_data.license_days || "", // 必要
    license_count: order_data.license_count || "", // 必要
    sale_amount: order_data.sale_amount || "",
    country: order_data.country || "",
    customer_name: order_data.customer_name || "",
    customer_gender: order_data.customer_gender || "",
    customer_birthday: order_data.customer_birthday || "",
    customer_phone: order_data.customer_phone || "",
    customer_postalcode: order_data.customer_postalcode || "",
    customer_address: order_data.customer_address || "",
    customer_email: order_data.customer_email || "",
    note00: order_data.note00 || "",
  };
  // console.log(data);

  // 取得檔案來源：files[] / files / attachments（擇一），若未帶就從 _licenseUploader 取
  var files =
    order_data["files[]"] ||
    order_data.files ||
    order_data.attachments ||
    (window._licenseUploader &&
      window._licenseUploader.getFiles &&
      window._licenseUploader.getFiles());

  if (files) data["files[]"] = files;

  // ⭐ 加入既有附件資訊（包含舊路徑 + 新檔案資訊的合併陣列）
  if (order_data.existing_attachments) {
    data.existing_attachments = order_data.existing_attachments;
    // console.log(
    //   "[CsRequestLicenseUpdateOneRecord] 已加入 existing_attachments:",
    //   order_data.existing_attachments,
    // );
  }

  // 只用你的 helper 送 multipart/form-data（自動處理檔案 + 參數）
  Cyberspace.Client.SendFormDataWithFiles(
    "/ava_system/license/update_one_record",
    data,
    function (ok, result) {
      if (
        abortController &&
        abortController.signal &&
        abortController.signal.aborted
      )
        return;
      if (callback) {
        // console.log(result);
        callback(ok, result);
      }
    },
    { abortController },
  );
}

// ME :
// DESC : 取消訂單
//===============================================================================
// function CsRequestLicenseDeleteOneRecord(license_cid, callback) {
//     Cyberspace.Client.SendRequest(
//         "/ava_system/license/delete_one_record_record",
//         {
//             license_cid: license_cid,
//         },
//         (error, result) => {
//             if (callback) {
//                 // test
//                 // Success!
//                 console.log(result);
//                 callback(error, result);
//             }
//         }
//     );
// }

//===============================================================================
// NAME :
// DESC : 發起非同步匯出任務
//===============================================================================
export function CsRequestLicenseExportStart(
  condition_type,
  condition_value,
  b_time,
  e_time,
  search_keyword,
  sort_field,
  sort_order,
  status_filter,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/license/export_start",
    {
      condition_type: condition_type,
      condition_value: condition_value,
      b_time: b_time,
      e_time: e_time,
      search_keyword: search_keyword,
      sort_field: sort_field,
      sort_order: sort_order,
      status_filter: status_filter,
    },
    (error, result) => {
      if (
        abortController &&
        abortController.signal &&
        abortController.signal.aborted
      )
        return;
      if (callback) callback(error, result);
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 查詢匯出任務進度
//===============================================================================
export function CsRequestLicenseExportStatus(job_id, callback, abortController) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/license/export_status",
    { job_id: job_id },
    (error, result) => {
      if (
        abortController &&
        abortController.signal &&
        abortController.signal.aborted
      )
        return;
      if (callback) callback(error, result);
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 透過 API 下載 CSV 檔案內容
//===============================================================================
export function CsRequestLicenseExportDownload(job_id, callback) {
  // 【修正】C++ 的 HttpParamParser 只認得傳統表單格式，我們使用 URLSearchParams 來進行編碼
  const params = new URLSearchParams();
  params.append("job_id", job_id);
  params.append(
    "session_token",
    window.sessionStorage.getItem("session_token") || "",
  );

  fetch("/orbital/ava_system/license/export_download", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded", // 關鍵修改：讓 C++ 能夠正確解析變數
    },
    body: params.toString(),
  })
    .then((response) => {
      if (!response.ok) throw new Error("HTTP status " + response.status);
      // 直接取得 Blob (二進位大物件)，確保 CSV 編碼與換行不被破壞
      return response.blob();
    })
    .then((blob) => {
      if (callback) callback(null, blob);
    })
    .catch((error) => {
      if (callback) callback(error, null);
    });
}
