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
var MemberData = {
    object_type: "member_data",
    member_cid: "",
    password: "",
    member_name: "",
    tier: "",
    record_state: "",
    group_cid: "",
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
// DESC : 使用者資料數量
//===============================================================================
function CsRequestMemberSelectAllCountByParentCID(parent_cid, search_name, callback) {
    Cyberspace.Client.SendRequest(
        "/ava_system/member/select_all_count",
        {
            parent_cid: parent_cid,
            search_name: search_name,
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
// DESC : 使用者資料列表
//===============================================================================
function CsRequestMemberSelectAllRecordsByParentCID(parent_cid, search_name, offset, row_count, callback) {
    Cyberspace.Client.SendRequest(
        "/ava_system/member/select_all_records",
        {
            parent_cid: parent_cid,
            search_name: search_name,
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
// DESC : 取得使用者的詳細資料
//===============================================================================
function CsRequestMemberSelectOneRecordByMemberCID(member_cid, callback) {
    Cyberspace.Client.SendRequest(
        "/ava_system/member/select_one_record",
        {
            member_cid: member_cid,
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
// DESC : 新增使用者資料
//        member_data : MemberData
//===============================================================================
function CsRequesMembertInsertOneRecordByParentCID(parent_cid, member_data, callback) {
    Cyberspace.Client.SendRequest(
        "/ava_system/member/insert_one_record",
        {
            parent_cid: parent_cid,
            member_cid: member_data.member_cid,
            password: member_data.password,
            member_name: member_data.member_name,
            group_cid: member_data.group_cid,
            phone_cell: member_data.phone_cell,
            phone_home: member_data.phone_home,
            phone_work: member_data.phone_work,
            email: member_data.email,
            address: member_data.address,
            city: member_data.city,
            country: member_data.country,
            gender: member_data.gender,
            birthday: member_data.birthday,
            note00: member_data.note00,
            avatar_url: member_data.avatar_url,
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
// DESC : 新增使用者資料
//===============================================================================
function CsRequestMemberUpdateOneRecordByMemberCID(member_data, callback) {
    Cyberspace.Client.SendRequest(
        "/ava_system/member/update_one_record",
        {
            member_cid: member_data.member_cid,
            password: member_data.password,
            member_name: member_data.member_name,
            record_state: member_data.record_state,
            group_cid: member_data.group_cid,
            phone_cell: member_data.phone_cell,
            phone_home: member_data.phone_home,
            phone_work: member_data.phone_work,
            email: member_data.email,
            address: member_data.address,
            city: member_data.city,
            country: member_data.country,
            gender: member_data.gender,
            birthday: member_data.birthday,
            note00: member_data.note00,
            avatar_url: member_data.avatar_url,
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
