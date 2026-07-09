//
// Distributor Dashboard API Module
// Based on app.module.dashboard.js structure
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
var DistributorDashboardData = {
  object_type: "distributor_dashboard_data",
};

//===============================================================================
// NAME : CsRequestDistributorDashboardSelectDeviceSpec
// DESC : 取得經銷商 設備型號, 狀態, 啟用月份, 數量
//===============================================================================
function CsRequestDistributorDashboardSelectDeviceSpec(
  group_cid,
  b_time,
  e_time,
  spec_num,
  callback,
) {
  Cyberspace.Client.SendRequest(
    "ava_system/analytics/select_distributor_devices_space_0003",
    {
      group_cid: group_cid,
      b_time: b_time,
      e_time: e_time,
      spec_num: spec_num,
    },
    (error, result) => {
      if (callback) {
        console.log("Distributor Dashboard API Result:", result);
        callback(error, result);
      }
    },
  );
}

//===============================================================================
// NAME : CsRequestDistributorDashboardUpdateDeviceSpec
// DESC : 更新經銷商 dashboard 相關數值
//        目標日期, 目標數量
//===============================================================================
function CsRequestDistributorDashboardUpdateDeviceSpec(
  group_cid,
  t_time,
  t_count,
  callback,
) {
  Cyberspace.Client.SendRequest(
    "ava_system/analytics/update_distributor_devices_space_0003",
    {
      group_cid: group_cid,
      t_time: t_time,
      t_count: t_count,
    },
    (error, result) => {
      if (callback) {
        console.log("Distributor Dashboard Update Result:", result);
        callback(error, result);
      }
    },
  );
}

//===============================================================================
// NAME : CsRequestDistributorDashboardExportData
// DESC : 匯出經銷商 dashboard 資料
//===============================================================================
function CsRequestDistributorDashboardExportData(
  group_cid,
  b_time,
  e_time,
  callback,
) {
  Cyberspace.Client.SendRequest(
    "ava_system/analytics/export_distributor_devices_data",
    {
      group_cid: group_cid,
      b_time: b_time,
      e_time: e_time,
    },
    (error, result) => {
      if (callback) {
        console.log("Distributor Dashboard Export Result:", result);
        callback(error, result);
      }
    },
  );
}
