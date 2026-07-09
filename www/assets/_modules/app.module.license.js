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
var LicenseData = {
    object_name: "license_data",
    license_cid: "",
    license_type: "1", // 預設為0看以後需不需要
    create_time: "",
    record_state: "",
    owner_cid: "",
    agent_cid: "",
    license_begin_time: "",
    license_days: "",
    license_seats: "",
    sale_amount: "",
    country: "",
    customer_name: "",
    customer_gender: "",
    customer_birthday: "",
    customer_phone: "",
    customer_postalcode: "",
    customer_address: "",
    customer_email: "",
    // "recipient_name": "",
    // "recipient_gender": "",
    // "recipient_birthday": "",
    // "recipient_phone": "",
    // "recipient_postalcode": "",
    // "recipient_address": "",
    // "recipient_email": "",
    note00: "",
};

const search_condition_type_by_owner_cid = "by_owner_cid";
const search_condition_type_by_agent_cid = "by_agent_cid";
const search_condition_type_like_owner_cid = "like_owner_cid";
const search_condition_type_like_agent_cid = "like_agent_cid";

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
function CsRequestLicenseSelectAllCount(condition_type, condition_cid, b_time, e_time, callback) {
    if (condition_type == null) {
        condition_type == "";
    }
    if (condition_cid == null) {
        condition_cid == "";
    }

    Cyberspace.Client.SendRequest(
        "/ava_system/license/select_all_count",
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
function CsRequestLicenseSelectAllRecords(condition_type, condition_cid, b_time, e_time, offset, row_count, callback) {
    if (condition_type == null) {
        condition_type == "";
    }
    if (condition_cid == null) {
        condition_cid == "";
    }

    Cyberspace.Client.SendRequest(
        "/ava_system/license/select_all_records",
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

//===============================================================================
// NAME :
// DESC : 訂單單筆詳細資料
//===============================================================================
function CsRequestLicenseSelectOneRecordByCID(license_cid, callback) {
    if (license_cid == null) {
        license_cid == "";
    }

    Cyberspace.Client.SendRequest(
        "/ava_system/license/select_one_record",
        {
            license_cid: license_cid,
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
// DESC : 新增訂單
//===============================================================================
function CsRequesLicenseInsertOneRecord(order_data, callback) {
    Cyberspace.Client.SendRequest(
        "/ava_system/license/insert_one_record",
        {
            license_type: order_data.license_type,
            owner_cid: order_data.owner_cid,
            license_begin_time: order_data.license_begin_time,
            license_type: order_data.license_type,
            license_days: order_data.license_days,
            license_seats: order_data.license_seats,
            sale_amount: order_data.sale_amount,
            country: order_data.country,
            customer_name: order_data.customer_name,
            customer_gender: order_data.customer_gender,
            customer_birthday: order_data.customer_birthday,
            customer_phone: order_data.customer_phone,
            customer_postalcode: order_data.customer_postalcode,
            customer_address: order_data.customer_address,
            customer_email: order_data.customer_email,
            note00: order_data.note00,
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
// DESC : 更新訂單
//===============================================================================
function CsRequesLicenseUpdateOneRecord(order_data, callback) {
    Cyberspace.Client.SendRequest(
        "/ava_system/license/update_one_record",
        {
            license_cid: order_data.license_cid,
            license_type: order_data.license_type,
            order_time: order_data.order_time,
            record_state: order_data.record_state,
            owner_cid: order_data.owner_cid,
            agent_cid: order_data.agent_cid,
            license_begin_time: order_data.license_begin_time,
            license_days: order_data.license_days,
            license_seats: order_data.license_seats,
            sale_amount: order_data.sale_amount,
            country: order_data.country,
            customer_name: order_data.customer_name,
            customer_gender: order_data.customer_gender,
            customer_birthday: order_data.customer_birthday,
            customer_phone: order_data.customer_phone,
            customer_postalcode: order_data.customer_postalcode,
            customer_address: order_data.customer_address,
            customer_email: order_data.customer_email,
            note00: order_data.note00,
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
// DESC : 取消訂單
//===============================================================================
// function CsRequestLicenseDeleteOneRecord(license_cid, callback) {
//     Cyberspace.Client.SendRequest(
//         "/ava_system/license/delete_one_record_record",
//         {
//             license_cid: license_cid,
//         },
//         (error, result) => {
//             if (callback) {
//                 // test
//                 // Success!
//                 console.log(result);
//                 callback(error, result);
//             }
//         }
//     );
// }
