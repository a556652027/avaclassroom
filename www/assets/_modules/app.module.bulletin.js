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
// 紀錄
var Bulletin = {
    bulletin_uid: "", // 編號
    bulletin_gid: "", // 發表群組
    insert_time: "",
    update_time: "",
    update_count: "",
    member_name: "", // 發表的人
    reply_bulletin_uid: "", // 回覆對象
    caption: "",
    content: "",
};

// 會員名稱, order_nid, 日期範圍 取得資料的總筆數
function Bulletin_Request_Select001_Count(bulletin_gid, callback) {
    Cyberspace.Client.Request(
        "bulletin_select001_count",
        {
            sessionid: Cyberspace.Client.GetSessionUid(),
            bulletin_gid: bulletin_gid,
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

// 會員名稱, 開始時間, 結束時間 : 取得資料
function Bulletin_Request_Select001_All(bulletin_gid, limit_offset, limit_rowcount, callback) {
    Cyberspace.Client.Request(
        "bulletin_select001_all",
        {
            sessionid: Cyberspace.Client.GetSessionUid(),
            bulletin_gid: bulletin_gid,
            limit_offset: limit_offset, // 第幾筆到第幾筆
            limit_rowcount: limit_rowcount,
        },
        function (result) {
            result = StringToJson(result);

            // 轉換資料
            var bulletin_list = Array();
            // 紀錄資料
            for (var i = 0; i < result.records.length; i++) {
                var bulletin = Object.create(bulletin_list);
                bulletin.bulletin_uid = result.records[i][0];
                bulletin.bulletin_gid = result.records[i][1];
                bulletin.insert_time = result.records[i][2];
                bulletin.update_time = result.records[i][3];
                bulletin.update_count = result.records[i][4];
                bulletin.member_name = result.records[i][5];
                bulletin.reply_bulletin_uid = result.records[i][6];
                bulletin.title = result.records[i][7];
                bulletin.content = result.records[i][8];
                //history.content = result.records[i][5];
                bulletin_list.push(bulletin);
            }

            if (callback) {
                result.records = bulletin_list;
                callback(result);
            }
        }
    );
}

function Bulletin_Request_Delete(bulletin_adr, bulletin_gid, callback) {
    Cyberspace.Client.Request(
        "bulletin_delete",
        {
            sessionid: Cyberspace.Client.GetSessionUid(),
            bulletin_gid: bulletin_gid,
            bulletin_adr: bulletin_adr,
        },
        function (result) {
            result = StringToJson(result);

            if (callback) {
                callback(result);
            }
        }
    );
}

function Bulletin_Request_Post_Message(bulletin_gid, title, content, callback) {
    Cyberspace.Client.Request(
        "bulletin_post_message",
        {
            sessionid: Cyberspace.Client.GetSessionUid(),
            bulletin_gid: bulletin_gid,
            title: encodeURIComponent(title),
            content: encodeURIComponent(content),
        },
        function (result) {
            result = StringToJson(result);

            if (callback) {
                callback(result);
            }
        }
    );
}
