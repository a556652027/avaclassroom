//
//
//  取得訊息的資料
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
//document.write( '<scr' + 'ipt type="text/javascript" src="sdk.net.js" ></scr' + 'ipt>' );

// 暫存
var g_regulation_list = new Array();

var Output_Log_Text = {
    log_name: "",
    start_line: "",
    text_list: "",
};

// request
// sessionid
// output_log           請server從哪個檔案 或資料表中傳給我
// output_start_line    從第幾行 或 第幾筆資料開始

// response
// record               訊息字串列表
// eoo                  還要繼續抓 0  停止繼續抓 1

var g_output_start_record = 0;
//var g_last_update_timestamp = 0;

// 紀錄上次轉檔的輸出名稱 離開後 進來可以再看到狀況
function Set_Last_Output_Log_Name(output_log_name) {
    window.sessionStorage.setItem("last_output_log_name", output_log_name);
    //setCookie( "def_supplier_uid", suppiler_uid );
}

function Get_Last_Output_Log_Name() {
    var item_name = window.sessionStorage.getItem("last_output_log_name");
    if (item_name == null) item_name = "";
    return item_name;
    //setCookie( "def_supplier_uid", suppiler_uid );
}

// 取出全部資料
function Output_Request_Text_Select_All(log_name, callback) {
    if (log_name == "") return;

    Set_Last_Output_Log_Name(log_name);
    console.log("select all\n");

    // 取出上次的還是空字串 那就不取
    //if ( log_name == '' )
    //{
    //    return 0;
    //}

    Cyberspace.Client.Request(
        "output_all_text",
        {
            sessionid: Cyberspace.Client.GetSessionUid(),
            output_log_name: log_name,
            //output_timestamp: timestamp,
            output_start_record: g_output_start_record,
        },
        function (result) {
            result = StringToJson(result);

            // 跟上次更新的時間一樣 就當結束
            //if ( result.last_upate_time == g_last_update_timestamp )
            //{
            //    result.end_of_ouput == '1';
            //}
            //g_last_update_timestamp = result.last_upate_time;

            // 可能斷線沒資料之類的
            //if ( result.records.length > 0 )
            //{
            //    g_output_start_record += ( result.records[0].length );
            //}
            //
            //if ( result.end_of_ouput == '1' )
            //{
            //    g_output_start_record = 0;
            //}
            console.log("select all feedback");

            if (callback) {
                callback(result);
            }
        }
    );
    return 1;
}

// 取出最後一筆資料
function Output_Request_Text_Select_Last(log_name, callback) {
    Set_Last_Output_Log_Name(log_name);

    Cyberspace.Client.Request(
        "output_last_text",
        {
            sessionid: Cyberspace.Client.GetSessionUid(),
            output_log_name: log_name,
            //output_timestamp: timestamp
        },
        function (result) {
            result = StringToJson(result);

            // 跟上次更新的時間一樣 就當結束
            //if ( result.last_upate_time == g_last_update_timestamp )
            //{
            //    result.end_of_ouput == '1';
            //}
            //g_last_update_timestamp = result.last_upate_time;

            //if ( result.end_of_ouput == '1' )
            //{
            //    g_output_start_record = 0;
            //}

            if (callback) {
                callback(result);
            }
        }
    );
}
