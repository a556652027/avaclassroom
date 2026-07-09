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
var DeviceData = {
    object_name: "device_data",
    device_cid: "",
    device_type: "",
    create_time: "",
    record_state: "",
    active_time: "",
    owner_type: "",
    owner_cid: "",
    agent_cid: "",
    license_key: "",
    customer_name: "",
    customer_gender: "",
    customer_birthday: "",
    customer_phone: "",
    customer_postalcode: "",
    customer_address: "",
    customer_email: "",
    spec00: "",
    spec01: "",
    spec02: "",
    spec03: "",
    spec04: "",
    spec05: "",
    spec06: "",
    spec07: "",
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
function CsRequestDeviceSelectAllCount(condition_type, condition_cid, b_time, e_time, callback) {
    if (condition_type == null) {
        condition_type == "";
    }
    if (condition_cid == null) {
        condition_cid == "";
    }

    Cyberspace.Client.SendRequest(
        "/ava_system/device/select_all_count",
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
function CsRequestDeviceSelectAllRecords(condition_type, condition_cid, b_time, e_time, offset, row_count, callback) {
    if (condition_type == null) {
        condition_type == "";
    }
    if (condition_cid == null) {
        condition_cid == "";
    }

    Cyberspace.Client.SendRequest(
        "/ava_system/device/select_all_records",
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
function CsRequestDeviceSelectOneRecord(device_cid, callback) {
    if (device_cid == null) {
        device_cid == "";
    }

    Cyberspace.Client.SendRequest(
        "/ava_system/device/select_one_record",
        {
            device_cid: device_cid,
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
function CsRequesLicenseInsertOneRecord(device_data, callback) {
    Cyberspace.Client.SendRequest(
        "/ava_system/device/insert_one_record",
        {
            device_cid: device_data.device_cid,
            device_type: device_data.device_type,
            //create_time: device_data.create_time,
            record_state: device_data.record_state,
            active_time: device_data.active_time,
            owner_type: device_data.owner_type,
            owner_cid: device_data.owner_cid,
            license_key: device_data.license_key,
            agent_cid: device_data.agent_cid,
            license_key: device_data.license_key,
            customer_name: device_data.customer_name,
            customer_gender: device_data.customer_gender,
            customer_birthday: device_data.customer_birthday,
            customer_phone: device_data.customer_phone,
            customer_postalcode: device_data.customer_postalcode,
            customer_address: device_data.customer_address,
            customer_email: device_data.customer_email,
            spec00: device_data.spec00,
            spec01: device_data.spec01,
            spec02: device_data.spec02,
            spec03: device_data.spec03,
            spec04: device_data.spec04,
            spec05: device_data.spec05,
            spec06: device_data.spec06,
            spec07: device_data.spec07,
            note00: device_data.note00,
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
function CsRequesDeviceUpdateOneRecord(device_data, callback) {
    Cyberspace.Client.SendRequest(
        "/ava_system/device/update_one_record",
        {
            device_cid: device_data.device_cid,
            device_type: device_data.device_type,
            create_time: device_data.create_time,
            record_state: device_data.record_state,
            active_time: device_data.active_time,
            owner_type: device_data.owner_type,
            owner_cid: device_data.owner_cid,
            license_key: device_data.license_key,
            agent_cid: device_data.agent_cid,
            license_key: device_data.license_key,
            customer_name: device_data.customer_name,
            customer_gender: device_data.customer_gender,
            customer_birthday: device_data.customer_birthday,
            customer_phone: device_data.customer_phone,
            customer_postalcode: device_data.customer_postalcode,
            customer_address: device_data.customer_address,
            customer_email: device_data.customer_email,
            spec00: device_data.spec00,
            spec01: device_data.spec01,
            spec02: device_data.spec02,
            spec03: device_data.spec03,
            spec04: device_data.spec04,
            spec05: device_data.spec05,
            spec06: device_data.spec06,
            spec07: device_data.spec07,
            note00: device_data.note00,
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
