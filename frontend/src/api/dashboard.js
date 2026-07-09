//  (原 www/modules/app.module.dashboard.js 原封搬移)
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
export var DashboardDeviceData = {
  object_type: "dashboard_device_data",
};

//===============================================================================
// NAME :
// DESC :  取得  設備型號, 狀態, 啟用月份, 數量
//===============================================================================
export function CsRequestDashboardSelectDeviceSpec(
  group_cid,
  b_time,
  e_time,
  product_type,
  spec_num,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/analytics/select_devices_space_0003",
    {
      group_cid: group_cid,
      b_time: b_time,
      e_time: e_time,
      product_type: product_type,
      spec_num: spec_num,
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
        Cyberspace.Client.DebugLog("Dashboard Data", result);
        callback(error, result);
      }
    },
    { abortController: abortController },
  );
}

//===============================================================================
// NAME :
// DESC :  更新目前使用者的 dashboard 相關數值
//         目標日期, 目標數量
//===============================================================================
export function CsRequestDashboardUpdateDeviceSpec(
  group_cid,
  t_time,
  t_count,
  callback,
  abortController,
) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/analytics/update_devices_space_0003",
    {
      group_cid: group_cid,
      t_time: t_time,
      t_count: t_count,
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
        console.log(result);
        callback(error, result);
      }
    },
    { abortController },
  );
}
