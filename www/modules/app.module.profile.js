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
var ProfileData = {
  object_type: "profile_data",
  member_cid: "",
  password: "",
  member_name: "",
  tier: "",
  record_state: "",
  group_name: "",
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

//===============================================================================
// NAME :
// DESC : 取得使用者的詳細資料
//===============================================================================
function CsRequestProfileSelectOne(profile_cid, callback, abortController) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/member/select_one_record",
    {
      member_cid: profile_cid,
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
        Cyberspace.Client.DebugLog("Profile Select Result", result);
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
function CsRequestProfileUpdateOne(profile_data, callback, abortController) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/member/update_one_record",
    {
      member_cid: profile_data.member_cid,
      password: profile_data.password,
      member_name: profile_data.member_name,
      record_state: profile_data.record_state,
      group_name: profile_data.group_name,
      phone_cell: profile_data.phone_cell,
      phone_home: profile_data.phone_home,
      phone_work: profile_data.phone_work,
      email: profile_data.email,
      address: profile_data.address,
      city: profile_data.city,
      country: profile_data.country,
      gender: profile_data.gender,
      birthday: profile_data.birthday,
      note00: profile_data.note00,
      avatar_url: profile_data.avatar_url,
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
        Cyberspace.Client.DebugLog("Profile Update Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}
