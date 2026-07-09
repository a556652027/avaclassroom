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
//

// 群組相關資訊
var GroupData = {
  object_name: "group_data",
  record_state: "",
  group_cid: "",
  group_name: "",
  group_type: "",
  owner_cid: "",
  contact: "",
  group_ubn: "",
  contact_phone_01: "",
  //contact_phone_02: "",
  contact_email_01: "",
  //contact_email_02: "",
  city: "",
  country: "",
  address: "",
  billing_addr: "",
  licensing_remaining_days: "",
  licensing_remaining_seats: "",
  note00: "",
};

if (typeof window._k_search_condition_type_by_owner_cid === "undefined") {
  window._k_search_condition_type_by_owner_cid = "2";
}
if (typeof window._k_search_condition_type_by_country === "undefined") {
  window._k_search_condition_type_by_country = "3";
}

//===============================================================================
// NAME :
// DESC : 依照擁有者的名稱 取得 組織資料數量
//===============================================================================
function CsRequestGroupSelectAllCountByCondition(
  condition_type,
  condition_value,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/group/select_all_count",
    {
      condition_type: condition_type,
      condition_value: condition_value,
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
        Cyberspace.Client.DebugLog("Group Count Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 依照擁有者的名稱 取得 組織資料列表
//===============================================================================
function CsRequestGroupSelectAllRecordsByCondition(
  condition_type,
  condition_value,
  offset,
  row_count,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/group/select_all_records",
    {
      condition_type: condition_type,
      condition_value: condition_value,
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
        Cyberspace.Client.DebugLog("Group Records Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 取得單一組織的詳細資料
//===============================================================================
function CsRequestGroupSelectOneRecordByGroupCID(
  group_cid,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }
  if (!group_cid)
    return callback && callback(new Error("Missing group_cid parameter"), null);

  Cyberspace.Client.SendRequest(
    "/ava_system/group/select_one_record",
    {
      group_cid: group_cid,
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
        Cyberspace.Client.DebugLog("Group One Record Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 新增組織資料
//===============================================================================
function CsRequestGroupInsertOneRecordByOwnerCID(
  group_data,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/group/insert_one_record",
    {
      group_cid: group_data.group_cid,
      group_name: group_data.group_name,
      group_type: group_data.group_type,
      owner_cid: group_data.owner_cid,
      contact: group_data.contact,
      group_ubn: group_data.group_ubn,
      contact_phone_01: group_data.contact_phone_01,
      //contact_phone_02: group_data.contact_phone_02,
      contact_email_01: group_data.contact_email_01,
      //contact_email_02: group_data.contact_email_02,
      city: group_data.city,
      country: group_data.country,
      address: group_data.address,
      billing_addr: group_data.billing_addr,
      note00: group_data.note00,
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
        Cyberspace.Client.DebugLog("Group Insert Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 更新組織資料
//===============================================================================
function CsRequestGroupUpdateOneRecordByGroupCID(
  group_data,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/group/update_one_record",
    {
      group_cid: group_data.group_cid,
      group_name: group_data.group_name,
      group_type: group_data.group_type,
      owner_cid: group_data.owner_cid,
      record_state: group_data.record_state,
      contact: group_data.contact,
      group_ubn: group_data.group_ubn,
      contact_phone_01: group_data.contact_phone_01,
      //contact_phone_02: group_data.contact_phone_02,
      contact_email_01: group_data.contact_email_01,
      //contact_email_02: group_data.contact_email_02,
      city: group_data.city,
      country: group_data.country,
      address: group_data.address,
      billing_addr: group_data.billing_addr,
      note00: group_data.note00,
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
        Cyberspace.Client.DebugLog("Group Update Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME : CsRequestGroupGetOwnedProducts
// DESC : [動態 Navbar] 取得指定組織擁有的產品清單 (供切換公司時更新路由)
//===============================================================================
function CsRequestGroupGetOwnedProducts(target_group_cid, callback, abortController) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/group/get_owned_products",
    { target_group_cid: target_group_cid },
    (error, result) => {
      if (abortController && abortController.signal && abortController.signal.aborted) return;
      if (callback) callback(error, result);
    },
    { abortController },
  );
}
