//  (原 www/modules/app.module.permission.js 原封搬移)
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
export var PermissionData = {
  object_type: "permission_data",
  code: "",
  is_operate_member: "",
  is_operate_organization: "",
  is_operate_license: "",
  is_operate_device: "",
  is_operate_analytics: "",

  is_select_own_member: "",
  is_insert_own_member: "",
  is_update_own_member: "",
  //is_ban_own_member: "",

  is_select_own_organization: "",
  is_insert_own_organization: "",
  is_update_own_organization: "",
  //is_close_own_organization: "",

  is_select_own_license: "",
  is_insert_own_license: "",
  is_update_own_license: "",
  //is_cancel_own_license: "",

  is_select_own_device: "",
  is_insert_own_device: "",
  is_update_own_device: "",
  //is_cancel_own_device: "",

  is_select_own_analytics: "",
  is_insert_own_analytics: "",
  is_update_own_analytics: "",
  //is_cancel_own_analytics: "",
};

//===============================================================================
// NAME :
// DESC : 取得群組權限
//===============================================================================
export function CsRequestPermissionSelectOne(code, callback, abortController) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/permission/select_one_record",
    {
      code: code,
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
        Cyberspace.Client.DebugLog("Permission Select Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 更新群組權限
//===============================================================================
export function CsRequestPermissionUpdateOne(
  code,
  permission_data,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/permission/update_one_record",
    {
      code: code,

      is_operate_member: permission_data.is_operate_member,
      is_operate_organization: permission_data.is_operate_organization,
      is_operate_license: permission_data.is_operate_license,
      is_operate_device: permission_data.is_operate_device,
      is_operate_analytics: permission_data.is_operate_analytics,

      is_select_own_member: permission_data.is_select_own_member,
      is_insert_own_member: permission_data.is_insert_own_member,
      is_update_own_member: permission_data.is_update_own_member,
      //is_ban_own_member: permission_data.is_ban_own_member,

      is_select_own_organization: permission_data.is_select_own_organization,
      is_insert_own_organization: permission_data.is_insert_own_organization,
      is_update_own_organization: permission_data.is_update_own_organization,
      //is_close_own_organization: permission_data.is_close_own_organization,

      is_select_own_license: permission_data.is_select_own_license,
      is_insert_own_license: permission_data.is_insert_own_license,
      is_update_own_license: permission_data.is_update_own_license,
      //is_cancel_own_license: permission_data.is_cancel_own_license,

      is_select_own_device: permission_data.is_select_own_device,
      is_insert_own_device: permission_data.is_insert_own_device,
      is_update_own_device: permission_data.is_update_own_device,
      //is_cancel_own_device: permission_data.is_cancel_own_device,

      is_select_own_analytics: permission_data.is_select_own_analytics,
      is_insert_own_analytics: permission_data.is_insert_own_analytics,
      is_update_own_analytics: permission_data.is_update_own_analytics,
      //is_cancel_own_analytics: permission_data.is_cancel_own_analytics,
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
        Cyberspace.Client.DebugLog("Permission Update Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}
