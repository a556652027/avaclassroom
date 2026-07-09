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
var HistoryData = {
  object_name: "history_data",
  subjec_cid: "",
  event_type: "",
  label: "",
  content_text: "",
};

if (typeof window.search_condition_type_by_subject_cid === "undefined") {
  window.search_condition_type_by_subject_cid = "by_subject_cid";
}

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
function CsRequestHistorySelectAllCount(
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

  if (condition_type == null) {
    condition_type == "";
  }
  if (condition_value == null) {
    condition_value == "";
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/history/select_all_count",
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
        Cyberspace.Client.DebugLog("History Count Result", result);
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
function CsRequestHistorySelectAllRecords(
  condition_type,
  condition_value,
  b_time,
  e_time,
  offset,
  row_count,
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
    "/ava_system/history/select_all_records",
    {
      condition_type: condition_type,
      condition_value: condition_value,
      b_time: b_time,
      e_time: e_time,
      offset: offset,
      row_count: row_count,
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
        Cyberspace.Client.DebugLog("History Records Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}
