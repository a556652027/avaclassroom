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

const search_condition_type_by_subject_cid = "by_subject_cid";

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
function CsRequestHistorySelectAllCount(condition_type, condition_cid, b_time, e_time, callback) {
    if (condition_type == null) {
        condition_type == "";
    }
    if (condition_cid == null) {
        condition_cid == "";
    }

    Cyberspace.Client.SendRequest(
        "/ava_system/history/select_all_count",
        {
            condition_type: condition_type,
            condition_cid: condition_cid,
            b_time: b_time,
            e_time: e_time,
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
// DESC : 訂單資料列表
//===============================================================================
function CsRequestHistorySelectAllRecords(condition_type, condition_cid, b_time, e_time, offset, row_count, callback) {
    if (condition_type == null) {
        condition_type == "";
    }
    if (condition_cid == null) {
        condition_cid == "";
    }

    Cyberspace.Client.SendRequest(
        "/ava_system/history/select_all_records",
        {
            condition_type: condition_type,
            condition_cid: condition_cid,
            b_time: b_time,
            e_time: e_time,
            offset: offset,
            row_count: row_count,
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
