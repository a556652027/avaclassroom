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
//document.write('<scr' + 'ipt type="text/javascript" src="sdk.net.js" ></scr' + 'ipt>');

///////////////////////////////////////////////////////////////////////////////
//
var History = {
    log_adr: "",
    insert_time: "",
    member_uid: "",
    event: "",
    date: "",
    content: "",
};

//
function History_Request_Select_Count(member_name, begin_date, end_date, callback) {
    Cyberspace.Client.Request(
        "log_select_count",
        {
            sessionid: Cyberspace.Client.GetSessionUid(),
            member_name: member_name,
            begin_date: begin_date + " 00:00:00",
            end_date: end_date + " 23:59:59",
        },
        function (result) {
            result = StringToJson(result);

            var count = result.count;

            if (callback) {
                callback(result);
            }
        }
    );
}

//
function History_Request_Select005_All(member_name, begin_date, end_date, limit_offset, limit_rowcount, callback) {
    Cyberspace.Client.Request(
        "log_select_005",
        {
            sessionid: Cyberspace.Client.GetSessionUid(),
            member_name: member_name,
            begin_date: begin_date + " 00:00:00",
            end_date: end_date + " 23:59:59",
            limit_offset: limit_offset, //
            limit_rowcount: limit_rowcount,
        },
        function (result) {
            result = StringToJson(result);

            //
            var history_list = Array();
            //
            for (var i = 0; i < result.records.length; i++) {
                var history = Object.create(History);
                history.log_adr = result.records[i][0];
                history.insert_time = result.records[i][1];
                history.member_uid = result.records[i][2];
                history.event = result.records[i][3];
                history.date = result.records[i][4];
                //history.content = result.records[i][5];
                history_list.push(history);
            }

            if (callback) {
                result.records = history_list;
                callback(result);
            }
        }
    );
}
