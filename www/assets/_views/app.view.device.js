// home.html 的頁面事件操控程式碼相關

/*___________________________________________________________________________________*/
// 直接執行
// i18n ***必定放在載入頁面完成後的最前面 避免導致後面的addEventListener失效
(function () {
    renderTemplate("zh-tw", "app");
})();

/*___________________________________________________________________________________*/
// 列表上面顯示的欄位對照表 與 順序
let key_device_list_info = ["device_cid", "device_type", "create_time", "record_state", "active_time", "agent_cid", "owner_cid"];

let key_history_list_info = ["create_time", "event_type", "label", "content_text"];

/*___________________________________________________________________________________*/
// function 相關
const def_rows_per_page = 10;

function GotoPageSelectDeviceAll() {
    SelectDeviceAll();
    change_page("page01");
}

function GotoPageUpdateDeviceOne(device_cid) {
    SelectDeviceOne(device_cid);
    change_page("page02");
}

function GotoPageHistoryDevice(device_cid) {
    SelectHistoryAll(device_cid);
    change_page("page04");
}

/*___________________________________________________________________________________*/
function SelectDeviceAll() {
    // 搜尋條件
    // 哪一種條件
    let search_field = document.getElementById("device_list-input_search_field");
    const selected_field = search_field.value;
    // 條件的內容
    let search_value = document.getElementById("device_list-input_search_value").value;

    // 預設是 代理人的編碼
    let condition_type = search_condition_type_by_agent_cid;
    let condition_cid = "";
    if (search_value != "") {
        // 設為 搜尋代理人的編碼
        condition_type = search_condition_type_like_agent_cid;
        condition_cid = search_value;
    }

    const b_time = document.getElementById("device_list-begin_time");
    const e_time = document.getElementById("device_list-end_time");

    // 開啟loading dialog
    VisibleLoaderElement(true);

    setTimeout(function () {
        CsRequestDeviceSelectAllCount(condition_type, condition_cid, b_time.value, e_time.value, function (ok, result) {
            // 關閉loading dialog
            VisibleLoaderElement(false);

            if (!ok) {
                alert("request error");
                return;
            }

            let json_object = JSON.parse(result); // 解析 JSON

            //   loadingBox.hide()
            //loadingWater.style.visibility = 'hidden'
            if (show_errno(json_object.errno) != "") {
                return;
            }

            // 把結果填入表格中
            //let member_table_grid = document.getElementById('member_list-member_information');
            let order_table_page = document.getElementById("device_list-list_pagination");
            if (order_table_page) {
                tablepage_d(order_table_page, def_rows_per_page, json_object.count, function (now_index, count_of_page) {
                    // 動態 取得 分頁內的資料
                    CsRequestDeviceSelectAllRecords(condition_type, condition_cid, b_time.value, e_time.value, now_index, count_of_page, function (ok, result) {
                        let json_object = JSON.parse(result); // 解析 JSON
                        let json_tablesi = json_object.records;
                        let field_count = Object.keys(json_tablesi).length;
                        if (field_count == 0) {
                        } else {
                            let tableii = TablesiToTableii(key_device_list_info, json_tablesi);
                            //element_table.innerHTML = "";
                            var element_table = document.getElementById("device_list-list_information");
                            create_Json2DArrayToTable(element_table, tableii);
                            {
                                let tbody = element_table.querySelectorAll("tbody");
                                if (tbody) {
                                    console.log(tbody instanceof HTMLElement); // 應該輸出 true
                                    let rows = tbody[0].querySelectorAll("tr"); // 只選 tbody 內的 tr
                                    rows.forEach((row) => {
                                        let text = row.cells[0].textContent; // 取得設備編號
                                        {
                                            row.cells[0].innerHTML = '<button class="link_text" onclick="GotoPageHistoryDevice(\'' + text + "')\" >" + text + "</button>";
                                        }

                                        // 在最前插入一個編輯按鈕
                                        let newCell = document.createElement("td");
                                        newCell.innerHTML = '<button class="link_text" onclick="GotoPageUpdateDeviceOne(\'' + text + "')\" >" + '<i class="iconfont">&#xe764</i>' + "</button>";
                                        row.insertBefore(newCell, row.cells[0]); // 插入到最前面
                                    });
                                }
                            }
                        }
                        //**** 分頁的地方
                        //tablepage_s($("#transaction_list-span-show_transaction_pagination"), show_page_count);
                    });
                });
            }
        });
    }, 500);
}

function SelectDeviceOne(device_cid) {
    // 開啟loading dialog
    VisibleLoaderElement(true);

    setTimeout(function () {
        CsRequestDeviceSelectOneRecord(device_cid, function (ok, result) {
            // 關閉loading dialog
            VisibleLoaderElement(false);

            if (!ok) {
                alert("request error");
                return;
            }

            let json_object = JSON.parse(result); // 解析 JSON

            if (show_errno(json_object.errno) != "") {
                return;
            }

            // 填入初始資料
            {
                let record = json_object.records;
                document.getElementById("device_update-device_cid").value = record.device_cid[0];
                document.getElementById("device_update-device_type").value = record.device_type[0];
                document.getElementById("device_update-record_state").value = record.record_state[0];
                document.getElementById("device_update-create_time").value = record.create_time[0];
                document.getElementById("device_update-active_time").value = record.active_time[0];
                document.getElementById("device_update-owner_type").value = record.owner_type[0];
                document.getElementById("device_update-owner_cid").value = record.owner_cid[0];
                document.getElementById("device_update-agent_cid").value = record.agent_cid[0];
                document.getElementById("device_update-license_Key").value = record.license_key[0];
                document.getElementById("device_update-customer_name").value = record.customer_name[0];
                document.getElementById("device_update-customer_gender").value = record.customer_gender[0];
                document.getElementById("device_update-customer_birthday").value = record.customer_birthday[0];
                document.getElementById("device_update-customer_phone").value = record.customer_phone[0];
                document.getElementById("device_update-customer_postalcode").value = record.customer_postalcode[0];
                document.getElementById("device_update-customer_address").value = record.customer_address[0];
                document.getElementById("device_update-customer_email").value = record.customer_email[0];
                document.getElementById("device_update-spec00").value = record.spec00[0];
                document.getElementById("device_update-spec01").value = record.spec01[0];
                document.getElementById("device_update-spec02").value = record.spec02[0];
                document.getElementById("device_update-spec03").value = record.spec03[0];
                document.getElementById("device_update-spec04").value = record.spec04[0];
                document.getElementById("device_update-spec05").value = record.spec05[0];
                document.getElementById("device_update-spec06").value = record.spec06[0];
                document.getElementById("device_update-spec07").value = record.spec07[0];
                document.getElementById("device_update-note00").value = record.note00[0];
            }
        });
    }, 500);
}

function InserDeviceOne(device_data) {
    var device_data = Object.create(DeviceData);

    VisibleLoaderElement(true);
    setTimeout(function () {
        CsRequetDeviceInsertOneRecord(device_data, function (ok, result) {
            // 關閉loading dialog
            VisibleLoaderElement(false);

            if (!ok) {
                alert("request error");
                return;
            }

            let json_object = JSON.parse(result); // 解析 JSON
            if (show_errno(json_object.errno) != "") {
                return;
            }

            let license_cid = json_object.license_cid;
            alert(GetLocalData("common.success"));
        });
    }, 500);
}

function UpdateDeviceOne() {
    var device_data = Object.create(DeviceData);

    device_data.device_cid = document.getElementById("device_update-device_cid").value;
    device_data.device_type = document.getElementById("device_update-device_type").value;
    device_data.record_state = document.getElementById("device_update-record_state").value;
    device_data.create_time = document.getElementById("device_update-create_time").value;
    device_data.active_time = document.getElementById("device_update-active_time").value;
    device_data.owner_type = document.getElementById("device_update-owner_type").value;
    device_data.owner_cid = document.getElementById("device_update-owner_cid").value;
    device_data.agent_cid = document.getElementById("device_update-agent_cid").value;
    device_data.license_key = document.getElementById("device_update-license_Key").value;
    device_data.owner_cid = document.getElementById("device_update-owner_cid").value;
    device_data.customer_name = document.getElementById("device_update-customer_name").value;
    device_data.customer_gender = document.getElementById("device_update-customer_gender").value;
    device_data.customer_birthday = document.getElementById("device_update-customer_birthday").value;
    device_data.customer_phone = document.getElementById("device_update-customer_phone").value;
    device_data.customer_postalcode = document.getElementById("device_update-customer_postalcode").value;
    device_data.customer_address = document.getElementById("device_update-customer_address").value;
    device_data.customer_email = document.getElementById("device_update-customer_email").value;

    device_data.spec00 = document.getElementById("device_update-spec00").value;
    device_data.spec01 = document.getElementById("device_update-spec01").value;
    device_data.spec02 = document.getElementById("device_update-spec02").value;
    device_data.spec03 = document.getElementById("device_update-spec03").value;
    device_data.spec04 = document.getElementById("device_update-spec04").value;
    device_data.spec05 = document.getElementById("device_update-spec05").value;
    device_data.spec06 = document.getElementById("device_update-spec06").value;
    device_data.spec07 = document.getElementById("device_update-spec07").value;

    device_data.note00 = document.getElementById("device_update-note00").value;

    VisibleLoaderElement(true);
    setTimeout(function () {
        CsRequesDeviceUpdateOneRecord(device_data, function (ok, result) {
            // 關閉loading dialog
            VisibleLoaderElement(false);

            if (!ok) {
                alert("request error");
                return;
            }

            let json_object = JSON.parse(result); // 解析 JSON

            //   loadingBox.hide()
            //loadingWater.style.visibility = 'hidden'
            if (show_errno(json_object.errno) != "") {
                return;
            }

            SelectLicenseOne(json_object.license_cid);
            alert(GetLocalData("common.success"));
        });
    }, 500);
}

function SelectHistoryAll(device_cid) {
    // 搜尋條件
    // 哪一種條件
    //let search_field = document.getElementById('device_history-input_search_field');
    //const selected_field = search_field.value;
    // 條件的內容
    //let search_value = document.getElementById('device_history-input_search_value').value;

    {
        let element = document.getElementById("device_history-device_cid");
        if (element) {
            element.innerHTML = device_cid;
        }
    }

    let condition_type = search_condition_type_by_subject_cid;
    let condition_cid = device_cid;

    const b_time = document.getElementById("device_history-begin_time");
    const e_time = document.getElementById("device_history-end_time");

    // 開啟loading dialog
    VisibleLoaderElement(true);

    setTimeout(function () {
        CsRequestHistorySelectAllCount(condition_type, condition_cid, b_time.value, e_time.value, function (ok, result) {
            // 關閉loading dialog
            VisibleLoaderElement(false);

            if (!ok) {
                alert("request error");
                return;
            }

            let json_object = JSON.parse(result); // 解析 JSON

            //   loadingBox.hide()
            //loadingWater.style.visibility = 'hidden'
            if (show_errno(json_object.errno) != "") {
                return;
            }

            // 把結果填入表格中
            //let member_table_grid = document.getElementById('member_list-member_information');
            let order_table_page = document.getElementById("device_history-list_pagination");
            if (order_table_page) {
                tablepage_d(order_table_page, def_rows_per_page, json_object.count, function (now_index, count_of_page) {
                    // 動態 取得 分頁內的資料
                    CsRequestHistorySelectAllRecords(condition_type, condition_cid, b_time.value, e_time.value, now_index, count_of_page, function (ok, result) {
                        let json_object = JSON.parse(result); // 解析 JSON
                        let json_tablesi = json_object.records;
                        let field_count = Object.keys(json_tablesi).length;
                        if (field_count == 0) {
                        } else {
                            let tableii = TablesiToTableii(key_history_list_info, json_tablesi);
                            //element_table.innerHTML = "";
                            var element_table = document.getElementById("device_history-list_information");
                            create_Json2DArrayToTable(element_table, tableii);
                            {
                                let tbody = element_table.querySelectorAll("tbody");
                                if (tbody) {
                                    console.log(tbody instanceof HTMLElement); // 應該輸出 true
                                    let rows = tbody[0].querySelectorAll("tr"); // 只選 tbody 內的 tr
                                    rows.forEach((row) => {});
                                }
                            }
                        }

                        {
                            var element_table = document.getElementById("device_history-list_information");
                            let va = 0;
                        }
                        //**** 分頁的地方
                        //tablepage_s($("#transaction_list-span-show_transaction_pagination"), show_page_count);
                    });
                });
            }
        });
    }, 500);
}

/*___________________________________________________________________________________*/
// 事件相關

// 頁面啟動完成時
document.addEventListener("DOMContentLoaded", async () => {
    console.log("Home DOMContentLoaded");

    // 顯示放最後 等都完成後
    var app = document.getElementById("app");
    app.style.visibility = "visible";

    //_________________________________________________________________________________

    // 動作
    {
        // 搜尋
        {
            let button = document.getElementById("device_list-button-search");
            if (button) {
                button.addEventListener("click", function (event) {
                    SelectDeviceAll();
                });
            }
        }

        // 搜尋
        {
            let button = document.getElementById("device_history-button-search");
            if (button) {
                button.addEventListener("click", function (event) {
                    let element = document.getElementById("device_history-device_cid");
                    if (element) {
                        SelectHistoryAll(element.innerHTML);
                    }
                });
            }
        }

        // 確認新增
        // {
        //     let button = document.getElementById("device_insert-button-ok");
        //     if (button) {
        //         button.addEventListener('click', function (event) {
        //             InsertDeviceOne();
        //         });
        //     }
        // }

        // 確認更新
        {
            let button = document.getElementById("device_update-button-ok");
            if (button) {
                button.addEventListener("click", function (event) {
                    UpdateDeviceOne();
                });
            }
        }
    }

    // 頁面切換
    {
        // 切換到新增使用者頁面
        // {
        //     let button = document.getElementById("device_list-button-gotopage_insert");
        //     if (button) {
        //         button.addEventListener('click', function (event) {
        //             GotoPageInsertDeviceOne();
        //         });
        //     }
        // }

        // 回到使用者列表
        {
            let button = document.getElementById("device_insert-button-cancel");
            if (button) {
                button.addEventListener("click", function (event) {
                    GotoPageSelectDeviceAll();
                });
            }
        }

        // 回到使用者列表
        {
            let button = document.getElementById("device_update-button-cancel");
            if (button) {
                button.addEventListener("click", function (event) {
                    GotoPageSelectDeviceAll();
                });
            }
        }

        // 回到使用者列表
        {
            let button = document.getElementById("device_history-button-cancel");
            if (button) {
                button.addEventListener("click", function (event) {
                    GotoPageSelectDeviceAll();
                });
            }
        }
    }

    // 預設為三個月前到現在
    {
        const BDate = DateAdd("m", -3, new Date());
        const EDate = new Date();

        // 預設查設備的時間範圍
        {
            let b_time = document.getElementById("device_list-begin_time");
            let e_time = document.getElementById("device_list-end_time");
            b_time.value = BDate.toLocaleDateString("sv-SE");
            e_time.value = EDate.toLocaleDateString("sv-SE");
        }

        // 預設查log的時間範圍
        {
            let b_time = document.getElementById("device_history-begin_time");
            let e_time = document.getElementById("device_history-end_time");
            b_time.value = BDate.toLocaleDateString("sv-SE");
            e_time.value = EDate.toLocaleDateString("sv-SE");
        }
    }

    GotoPageSelectDeviceAll();
});
