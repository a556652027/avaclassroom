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

//===============================================================================
// NAME :
// DESC : 使用者資料數量
//===============================================================================
function CsRequestSelectOrderCountByMemberUID(
  member_uid,
  b_time,
  e_time,
  callback,
) {
  Cyberspace.Client.SendRequest(
    "/ava_system/order/select_count",
    {
      member_uid: member_uid,
      b_time: b_time,
      e_time: e_time,
    },
    (error, result) => {
      if (callback) {
        // test
        // Success!
        Cyberspace.Client.DebugLog("Order Count Result", result);
        callback(error, result);
      }
    },
  );
}

//===============================================================================
// NAME :
// DESC : 使用者資料列表
//===============================================================================
function CsRequestSelectOrderRecordsByMemberUID(
  member_uid,
  b_time,
  e_time,
  offset,
  row_count,
  callback,
) {
  Cyberspace.Client.SendRequest(
    "/ava_system/order/select_records",
    {
      member_uid: member_uid,
      b_time: b_time,
      e_time: e_time,
      offset: offset,
      row_count: row_count,
    },
    (error, result) => {
      if (callback) {
        // test
        // Success!
        Cyberspace.Client.DebugLog("Order Records Result", result);
        callback(error, result);
      }
    },
  );
}
