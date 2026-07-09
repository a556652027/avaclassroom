//  (原 www/modules/app.module.member.js 原封搬移)
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
//

// 使用者相關資訊
export var MemberData = {
  object_type: "member_data",
  member_cid: "",
  password: "",
  member_name: "",
  tier: "",
  record_state: "",
  group_cid: "",
  phone_cell: "",
  phone_home: "",
  phone_work: "",
  email: "",
  address: "",
  city: "",
  country: "",
  gender: "",
  birthday: "",
  note00: "",
  avatar_url: "",
};

// condition_type
// 1 search_by_parent
// 5 search_by_group

if (typeof window._k_search_condition_type_by_parent_cid === "undefined") {
  window._k_search_condition_type_by_parent_cid = "1";
}

if (typeof window._k_search_condition_type_by_group_cid === "undefined") {
  window._k_search_condition_type_by_group_cid = "5";
}

if (
  typeof window._k_search_condition_type_by_parent_cid_and_group_cid ===
  "undefined"
) {
  window._k_search_condition_type_by_parent_cid_and_group_cid = "9";
}

//===============================================================================
// NAME :
// DESC : 使用者資料數量
//        condition_type : 1: condition_value 會被拿來當parent_cid (預設)
//                         5: condition_value 會被拿來當group_cid(預設)
//        condition_value : 依照 type 去當 parent_cid 或 group_cid
//===============================================================================
export function CsRequestMemberSelectAllCountByCondition(
  condition_type,
  condition_value,
  search_name,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/member/select_all_count",
    {
      condition_type: condition_type,
      condition_value: condition_value,
      search_name: search_name,
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
        Cyberspace.Client.DebugLog("Member Count Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 使用者資料列表
//        condition_type : 1:condition_value 會被拿來當parent_cid,
//                         5:condition_value 會被拿來當group_cid
//        condition_value :  依照 type 去當 parent_cid 或 group_cid
//===============================================================================
export function CsRequestMemberSelectAllRecordsByCondition(
  condition_type,
  condition_value,
  search_name,
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
    "/ava_system/member/select_all_records",
    {
      condition_type: condition_type,
      condition_value: condition_value,
      search_name: search_name,
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
        Cyberspace.Client.DebugLog("Member Records Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 取得使用者的詳細資料
//===============================================================================
export function CsRequestMemberSelectOneRecordByMemberCID(
  member_cid,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }
  if (!member_cid)
    return callback && callback(new Error("Missing member_cid"), null);

  Cyberspace.Client.SendRequest(
    "/ava_system/member/select_one_record",
    {
      member_cid: member_cid,
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
        Cyberspace.Client.DebugLog("Member One Record Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 新增使用者資料
//        member_data : MemberData
//===============================================================================
export function CsRequestMemberInsertOneRecordByParentCID(
  parent_cid,
  member_data,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/member/insert_one_record",
    {
      parent_cid: parent_cid,
      member_cid: member_data.member_cid,
      password: member_data.password,
      member_name: member_data.member_name,
      group_cid: member_data.group_cid,
      phone_cell: member_data.phone_cell,
      phone_home: member_data.phone_home,
      phone_work: member_data.phone_work,
      email: member_data.email,
      address: member_data.address,
      city: member_data.city,
      country: member_data.country,
      gender: member_data.gender,
      birthday: member_data.birthday,
      note00: member_data.note00,
      avatar_url: member_data.avatar_url,
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
        Cyberspace.Client.DebugLog("Member Insert Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 新增使用者資料
//===============================================================================
export function CsRequestMemberUpdateOneRecordByMemberCID(
  member_data,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/member/update_one_record",
    {
      member_cid: member_data.member_cid,
      password: member_data.password,
      member_name: member_data.member_name,
      record_state: member_data.record_state,
      group_cid: member_data.group_cid,
      phone_cell: member_data.phone_cell,
      phone_home: member_data.phone_home,
      phone_work: member_data.phone_work,
      email: member_data.email,
      address: member_data.address,
      city: member_data.city,
      country: member_data.country,
      gender: member_data.gender,
      birthday: member_data.birthday,
      note00: member_data.note00,
      avatar_url: member_data.avatar_url,
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
        Cyberspace.Client.DebugLog("Member Update Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 寄送mail通知使用者
//===============================================================================
export function CsRequestMemberSendEMail(member_cid, callback, abortController) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/member/send_mail",
    {
      member_cid: member_cid,
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
        Cyberspace.Client.DebugLog("Member Send Email Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}
