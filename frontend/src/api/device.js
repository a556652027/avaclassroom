//  (原 www/modules/app.module.device.js 原封搬移)
import { Cyberspace } from '@/core/net'
import { IsValidString } from '@/core/util'

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

// 訂單相關資訊
export var DeviceData = {
  object_name: "device_data",
  device_cid: "",
  product_type: "",
  create_time: "",
  record_state: "",
  active_time: "",
  owner_type: "",
  owner_cid: "",
  agent_cid: "",
  license_key: "",
  customer_name: "",
  customer_gender: "",
  customer_birthday: "",
  customer_phone: "",
  customer_postalcode: "",
  customer_address: "",
  customer_email: "",
  spec00: "",
  spec01: "",
  spec02: "",
  spec03: "",
  spec04: "",
  spec05: "",
  spec06: "",
  spec07: "",
  note00: "",
};

// if (typeof window._k_search_condition_type_like_product_type === "undefined") {
//     window._k_search_condition_type_by_owner_cid = "2";
// }

// if (typeof window._k_search_condition_type_by_agent_cid === "undefined") {
//     window._k_search_condition_type_by_agent_cid = "6";
// }

// if (typeof window._k_search_condition_type_by_product_type === "undefined") {
//     window._k_search_condition_type_by_product_type = "7";
// }

// agnet以及其下線 + 擁有者 + 開啟狀態 + 商品類型 + 設備型號
// condition_value = " agnet_cid, owner_cid, record_state, product_type, spec04"
if (
  typeof window._k_search_condition_type_by_agent_cid__and__owner_cid__and__record_state__and__product_type__and__spec04 ===
  "undefined"
) {
  window._k_search_condition_type_by_agent_cid__and__owner_cid__and__record_state__and__product_type__and__spec04 =
    "17";
}

// if (typeof window._k_search_condition_type_by_owner_cid_and_spec === "undefined") {
//     window._k_search_condition_type_by_owner_cid_and_spec = "12";
// }

// // agent_cid, owner_cid, spac
// if (typeof window._k_search_condition_type_by_agent_cid_and_owner_cid_and_spec === "undefined") {
//     window._k_search_condition_type_by_agent_cid_and_owner_cid_and_spec = "14";
// }

// if (typeof window._k_search_condition_type_like_owner_cid === "undefined") {
//     window._k_search_condition_type_like_owner_cid = "102";
// }

// if (typeof window._k_search_condition_type_like_agent_cid === "undefined") {
//     window._k_search_condition_type_like_agent_cid = "106";
// }

// if (typeof window._k_search_condition_type_like_product_type === "undefined") {
//     window._k_search_condition_type_like_product_type = "107";
// }

// if (typeof window._k_search_condition_type_like_owner_cid_and_spec === "undefined") {
//     window._k_search_condition_type_like_owner_cid_and_spec = "112";
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
export function CsRequestDeviceSelectAllCount(
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

  if (!IsValidString(condition_type) || !IsValidString(condition_value)) {
    alert(window.localeData.warring.no_param);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/device/select_all_count",
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
        Cyberspace.Client.DebugLog("Device Count Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 設備資料列表
//===============================================================================
export function CsRequestDeviceSelectAllRecords(
  condition_type,
  condition_value,
  b_time,
  e_time,
  offset,
  row_count,
  search_keyword, // [擴充]
  sort_field, // [擴充]
  sort_order, // [擴充]
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  if (!IsValidString(condition_type) || !IsValidString(condition_value)) {
    alert(window.localeData.warring.no_param);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/device/select_all_records",
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
        Cyberspace.Client.DebugLog("Device Records Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 設備單筆詳細資料
//===============================================================================
export function CsRequestDeviceSelectOneRecord(device_cid, callback, abortController) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  if (!IsValidString(device_cid)) {
    alert(window.localeData.warring.no_param);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/device/select_one_record",
    {
      device_cid: device_cid,
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
        Cyberspace.Client.DebugLog("Device One Record Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 新增設備
//===============================================================================
export function CsRequestDeviceInsertOneRecord(
  device_data,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/device/insert_one_record",
    {
      device_cid: device_data.device_cid,
      product_type: device_data.product_type,
      //create_time: device_data.create_time,
      record_state: device_data.record_state,
      active_time: device_data.active_time,
      owner_type: device_data.owner_type,
      owner_cid: device_data.owner_cid,
      license_key: device_data.license_key,
      agent_cid: device_data.agent_cid,
      customer_name: device_data.customer_name,
      customer_gender: device_data.customer_gender,
      customer_birthday: device_data.customer_birthday,
      customer_phone: device_data.customer_phone,
      customer_postalcode: device_data.customer_postalcode,
      customer_address: device_data.customer_address,
      customer_email: device_data.customer_email,
      spec00: device_data.spec00,
      spec01: device_data.spec01,
      spec02: device_data.spec02,
      spec03: device_data.spec03,
      spec04: device_data.spec04,
      spec05: device_data.spec05,
      spec06: device_data.spec06,
      spec07: device_data.spec07,
      note00: device_data.note00,
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
        Cyberspace.Client.DebugLog("Device Insert Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 更新設備
//===============================================================================
export function CsRequestDeviceUpdateOneRecord(
  device_data,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/device/update_one_record",
    {
      device_cid: device_data.device_cid,
      product_type: device_data.product_type,
      record_state: device_data.record_state,
      active_time: device_data.active_time,
      owner_type: device_data.owner_type,
      owner_cid: device_data.owner_cid,
      license_key: device_data.license_key,
      agent_cid: device_data.agent_cid,
      license_key: device_data.license_key,
      customer_name: device_data.customer_name,
      customer_gender: device_data.customer_gender,
      customer_birthday: device_data.customer_birthday,
      customer_phone: device_data.customer_phone,
      customer_postalcode: device_data.customer_postalcode,
      customer_address: device_data.customer_address,
      customer_email: device_data.customer_email,
      spec00: device_data.spec00,
      spec01: device_data.spec01,
      spec02: device_data.spec02,
      spec03: device_data.spec03,
      spec04: device_data.spec04,
      spec05: device_data.spec05,
      spec06: device_data.spec06,
      spec07: device_data.spec07,
      note00: device_data.note00,
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
        Cyberspace.Client.DebugLog("Device Update Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 更新設備
//===============================================================================
export function CsRequestDeviceSpec04BGroupByCondition00(
  owner_cid,
  product_type,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/device/select_spec04_group_by_condition", // [修正] 補上漏掉的斜線
    {
      owner_cid: owner_cid,
      product_type: product_type,
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
        Cyberspace.Client.DebugLog("Device Spec Group Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 發起非同步設備匯出任務
//===============================================================================
export function CsRequestDeviceExportStart(
  condition_type,
  condition_value,
  b_time,
  e_time,
  search_keyword,
  sort_field,
  sort_order,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/device/export_start",
    {
      condition_type: condition_type,
      condition_value: condition_value,
      b_time: b_time,
      e_time: e_time,
      search_keyword: search_keyword,
      sort_field: sort_field,
      sort_order: sort_order,
    },
    (error, result) => {
      if (abortController && abortController.signal && abortController.signal.aborted) return;
      if (callback) callback(error, result);
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 查詢匯出任務進度
//===============================================================================
export function CsRequestDeviceExportStatus(job_id, callback, abortController) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/device/export_status",
    { job_id: job_id },
    (error, result) => {
      if (abortController && abortController.signal && abortController.signal.aborted) return;
      if (callback) callback(error, result);
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 透過 API 下載 CSV 檔案內容
//===============================================================================
export function CsRequestDeviceExportDownload(job_id, callback) {
  const params = new URLSearchParams();
  params.append("job_id", job_id);
  params.append("session_token", window.sessionStorage.getItem("session_token") || "");

  fetch("/orbital/ava_system/device/export_download", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  })
  .then((response) => {
    if (!response.ok) throw new Error("HTTP status " + response.status);
    return response.blob();
  })
  .then((blob) => { if (callback) callback(null, blob); })
  .catch((error) => { if (callback) callback(error, null); });
}
