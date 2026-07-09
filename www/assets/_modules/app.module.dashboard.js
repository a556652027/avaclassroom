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
var DashboardDeviceData = {
    object_type: "dashboard_device_data",
};

//===============================================================================
// NAME :
// DESC :  取得  設備型號, 狀態, 啟用月份, 數量
//===============================================================================
function CsRequestDashboardSelectDeviceSpec(group_cid, b_time, e_time, spec_num, callback) {
    Cyberspace.Client.SendRequest(
        "/ava_system/analytics/select_devices_space_0003",
        {
            group_cid: group_cid,
            b_time: b_time,
            e_time: e_time,
            spec_num: spec_num,
        },
        (error, result) => {
            if (callback) {
                // test
                // Success!
                console.log(result);
                callback(error, result);
            }
        }
    );
}

//===============================================================================
// NAME :
// DESC :  更新目前使用者的 dashboard 相關數值
//         目標日期, 目標數量
//===============================================================================
function CsRequestDashboardUpdateDeviceSpec(group_cid, t_time, t_count, callback) {
    Cyberspace.Client.SendRequest(
        "/ava_system/analytics/update_devices_space_0003",
        {
            group_cid: group_cid,
            t_time: t_time,
            t_count: t_count,
        },
        (error, result) => {
            if (callback) {
                // test
                // Success!
                console.log(result);
                callback(error, result);
            }
        }
    );
}
