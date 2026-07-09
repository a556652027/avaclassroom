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

// 群組相關資訊
var GroupData = {
    object_name: "group_data",
    group_cid: "",
    group_name: "",
    group_type: "",
    owner_cid: "",
    contact: "",
    group_ubn: "",
    contact_phone_01: "",
    //contact_phone_02: "",
    contact_email_01: "",
    //contact_email_02: "",
    city: "",
    country: "",
    address: "",
    billing_addr: "",
    licensing_remaining_days: "",
    licensing_remaining_seats: "",
    note00: "",
};

//===============================================================================
// NAME :
// DESC : 依照擁有者的名稱 取得 組織資料數量
//===============================================================================
function CsRequestGroupSelectAllCountByOwnerCode(owner_cid, callback) {
    Cyberspace.Client.SendRequest(
        "/ava_system/group/select_all_count",
        {
            owner_cid: owner_cid,
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
// DESC : 依照擁有者的名稱 取得 組織資料列表
//===============================================================================
function CsRequestGroupSelectAllRecordsByOwnerCode(owner_cid, offset, row_count, callback) {
    Cyberspace.Client.SendRequest(
        "/ava_system/group/select_all_records",
        {
            owner_cid: owner_cid,
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
// DESC : 取得單一組織的詳細資料
//===============================================================================
function CsRequestGroupSelectOneRecordByGroupCID(group_cid, callback) {
    Cyberspace.Client.SendRequest(
        "/ava_system/group/select_one_record",
        {
            group_cid: group_cid,
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
// DESC : 新增組織資料
//===============================================================================
function CsRequesGroupInsertOneRecordByOwnerCID(group_data, callback) {
    Cyberspace.Client.SendRequest(
        "/ava_system/group/insert_one_record",
        {
            group_cid: group_data.group_cid,
            group_name: group_data.group_name,
            group_type: group_data.group_type,
            owner_cid: group_data.owner_cid,
            contact: group_data.contact,
            group_ubn: group_data.group_ubn,
            contact_phone_01: group_data.contact_phone_01,
            //contact_phone_02: group_data.contact_phone_02,
            contact_email_01: group_data.contact_email_01,
            //contact_email_02: group_data.contact_email_02,
            city: group_data.city,
            country: group_data.country,
            address: group_data.address,
            billing_addr: group_data.billing_addr,
            note00: group_data.note00,
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
// DESC : 更新組織資料
//===============================================================================
function CsRequestGroupUpdateOneRecordByGroupCID(group_data, callback) {
    Cyberspace.Client.SendRequest(
        "/ava_system/group/update_one_record",
        {
            group_cid: group_data.group_cid,
            group_name: group_data.group_name,
            group_type: group_data.group_type,
            owner_cid: group_data.owner_cid,
            contact: group_data.contact,
            group_ubn: group_data.group_ubn,
            contact_phone_01: group_data.contact_phone_01,
            //contact_phone_02: group_data.contact_phone_02,
            contact_email_01: group_data.contact_email_01,
            //contact_email_02: group_data.contact_email_02,
            city: group_data.city,
            country: group_data.country,
            address: group_data.address,
            billing_addr: group_data.billing_addr,
            note00: group_data.note00,
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
