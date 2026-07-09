//document.write( '<scr' + 'ipt type="text/javascript" src="sdk.net.js" ></scr' + 'ipt>' );

// 暫存

// 請求轉檔
//function DataRefine_Request_Import_XlFile( file, supplier_uid, import_fmt_alias, import_process_date, import_adapt_field, callback )
var FeedbackCount = {
    creater_uid: "",
    problem_count: [],
};

function General_Request_Import_File(file, callback) {
    var formdata = new FormData();
    formdata.append("sessionid", Cyberspace.Client.GetSessionUid());
    formdata.append("file_data", file);

    Cyberspace.Client.UploadFroms("import_file", formdata, function (result) {
        result = StringToJson(result);

        if (callback) {
            callback(result);
        }
    });
}

function generalImportFilesBulk(files, callback) {
    Cyberspace.Client.UploadFiles("import_file_bulk", files, function (result) {
        result = StringToJson(result);

        if (callback) {
            callback(result);
        }
    });
}

function Send_Mail(recipients, subject, message, callback) {
    Cyberspace.Client.Request(
        "sendmail",
        {
            sessionid: Cyberspace.Client.GetSessionUid(),
            recipients: recipients,
            subject: subject,
            message: message,
        },
        function (result) {
            result = StringToJson(result);

            if (callback) {
                callback(result);
            }
        }
    );
}
function Feedback_Count(begin_date, end_date, callback) {
    Cyberspace.Client.Request(
        "problem_count",
        {
            sessionid: Cyberspace.Client.GetSessionUid(),
            b_date: begin_date + " 00:00:00",
            e_date: end_date + " 23:59:59",
        },
        function (result) {
            //alert(result);
            result = StringToJson(result);
            //if (callback) {
            console.log(result);
            console.log(callback);
            for (var i = 0; i < result.records.length; i++) {
                var feedbackcount = Object.create(FeedbackCount);
                feedbackcount.creater_uid = result.records[i][0];
                feedbackcount.problem_count = result.records[i][1];
                callback.push(feedbackcount);
            }
            //}
        }
    );
}

function LWBOT_send_message(accountid, message, callback) {
    Cyberspace.Client.Request(
        "lwbot_send_message",
        {
            sessionid: Cyberspace.Client.GetSessionUid(),
            accountid: accountid,
            message: message,
        },
        function (result) {
            result = StringToJson(result);

            if (callback) {
                callback(result);
            }
        }
    );
}

function emailToLineWorkID(email) {
    var accountid = email.split("@");
    return accountid[0] + "@asianbridge";
}

var Shipcount = {
    order_nid: "",
    supplier_uid: "",
    op: "",
    handle_state: "",
    record_type: "",
};

function distributor_ship_notice(callback) {
    Cyberspace.Client.Request(
        "notice_distributor_ship",
        {
            sessionid: Cyberspace.Client.GetSessionUid(),
        },
        function (result) {
            result = StringToJson(result);
            // 轉換資料
            var data_list = Array();
            {
                // 紀錄資料
                for (var i = 0; i < result.records.length; i++) {
                    var shipdata = Object.create(Shipcount);
                    var vi = 0;

                    shipdata.order_nid = result.records[i][vi];
                    vi++;
                    shipdata.supplier_uid = result.records[i][vi];
                    vi++;
                    shipdata.op = result.records[i][vi];
                    vi++;
                    shipdata.handle_state = result.records[i][vi];
                    vi++;
                    shipdata.record_type = result.records[i][vi];
                    vi++;
                    data_list.push(shipdata);
                }
            }
            if (callback) {
                result.records = data_list;
                callback(result);
            }
        }
    );
}

var Member = {
    member_id: "",
    member_name: "",
    member_dep: "", //abtX
    member_group: "", //ACC
    member_level: "", //1,2,3,4
    member_email: "",
};
var Member_list;
function All_member_show(callback) {
    Cyberspace.Client.Request(
        "all_member_show",
        {
            sessionid: Cyberspace.Client.GetSessionUid(),
        },
        function (result) {
            result = StringToJson(result);
            // 轉換資料
            var data_list = Array();
            {
                // 紀錄資料
                for (var i = 0; i < result.records.length; i++) {
                    var memberdata = Object.create(Member);
                    var vi = 0;

                    memberdata.member_id = result.records[i][vi];
                    vi++;
                    memberdata.member_name = result.records[i][vi];
                    vi++;
                    memberdata.member_dep = result.records[i][vi];
                    vi++;
                    memberdata.member_group = result.records[i][vi];
                    vi++;
                    memberdata.member_level = result.records[i][vi];
                    vi++;
                    memberdata.member_email = result.records[i][vi];
                    vi++;
                    data_list.push(memberdata);
                }
            }
            if (callback) {
                Member_list = data_list;
                result.records = data_list;
                callback(result);
            }
        }
    );
}
var Mkfcount = {
    rep_id: "",
    sup_id: "",
    count: "",
};
function mkf_all_notice(begin_date, callback) {
    Cyberspace.Client.Request(
        "mkf_select_all_notice",
        {
            sessionid: Cyberspace.Client.GetSessionUid(),
            b_date: begin_date + " 00:00:00",
        },
        function (result) {
            result = StringToJson(result);
            var data_list = Array();
            check_logout(result);
            for (var i = 0; i < result.records.length; i++) {
                var mkfcount = Object.create(Mkfcount);
                mkfcount.rep_id = result.records[i][0];
                mkfcount.sup_id = result.records[i][1];
                mkfcount.count = result.records[i][2];
                data_list.push(mkfcount);
            }
            if (callback) {
                Member_list = data_list;
                result.records = data_list;
                callback(result);
            }
        }
    );
}

function mkf_ff_notice(begin_date, callback) {
    Cyberspace.Client.Request(
        "mkf_select_ff_notice",
        {
            sessionid: Cyberspace.Client.GetSessionUid(),
            b_date: begin_date + " 00:00:00",
        },
        function (result) {
            result = StringToJson(result);
            let data_list = [];
            for (const record of result.records) {
                var data = {};
                data["sup_id"] = record[0];
                data["count"] = record[1];
                data_list.push(data);
            }
            if (callback) {
                callback(data_list);
            }
        }
    );
}
