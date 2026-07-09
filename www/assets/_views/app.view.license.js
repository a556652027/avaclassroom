// home.html 的頁面事件操控程式碼相關

/*___________________________________________________________________________________*/
// 直接執行
// i18n ***必定放在載入頁面完成後的最前面 避免導致後面的addEventListener失效
(function () {
    renderTemplate("zh-tw", "app");
})();

/*___________________________________________________________________________________*/
// 列表上面顯示的欄位對照表 與 順序
let key_license_list_info = ["license_cid", "create_time", "record_state", "license_type", "agent_cid", "owner_cid", "country", "license_begin_time", "license_days", "license_seats"];

/*___________________________________________________________________________________*/
// function 相關
const def_rows_per_page = 10;

function GotoPageLicenseSelectAll(condition_cid) {
    LicenseSelectAll(condition_cid);
    change_page("page01");
}

function GotoPageLicenseInsertOne() {
    const now = new Date();
    setInputDate(now, "license_insert-license_begin_time");
    change_page("page02");
}

function GotoPageLicenseUpdateOne(license_cid) {
    LicenseSelectOne(license_cid);
    change_page("page03");
}

/*___________________________________________________________________________________*/
function LicenseSelectAll(condition_cid) {
    // 如果沒有傳字串就設為空字串
    if (condition_cid == null) {
        condition_cid = "";
    }

    // 搜尋條件
    // 哪一種條件
    let search_field = document.getElementById("license_list-input_search_field");
    const selected_field = search_field.value;
    // 條件的內容
    let search_value = document.getElementById("license_list-input_search_value").value;

    // 預設是 代理人的編碼
    let condition_type = search_condition_type_by_agent_cid;
    if (search_value != "") {
        // 設為 搜尋代理人的編碼
        condition_type = search_condition_type_like_agent_cid;
        condition_cid = search_value;
    }

    const b_time = document.getElementById("license_list-begin_time");
    const e_time = document.getElementById("license_list-end_time");

    // 開啟loading dialog
    VisibleLoaderElement(true);

    setTimeout(function () {
        CsRequestLicenseSelectAllCount(condition_type, condition_cid, b_time.value, e_time.value, function (ok, result) {
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
            let license_table_page = document.getElementById("license_list-list_pagination");
            if (license_table_page) {
                tablepage_d(license_table_page, def_rows_per_page, json_object.count, function (now_index, count_of_page) {
                    // 動態 取得 分頁內的資料
                    CsRequestLicenseSelectAllRecords(condition_type, condition_cid, b_time.value, e_time.value, now_index, count_of_page, function (ok, result) {
                        let json_object = JSON.parse(result); // 解析 JSON
                        let json_tablesi = json_object.records;
                        let field_count = Object.keys(json_tablesi).length;
                        if (field_count == 0) {
                        } else {
                            let tableii = TablesiToTableii(key_license_list_info, json_tablesi);
                            //element_table.innerHTML = "";
                            var element_table = document.getElementById("license_list-list_information");
                            create_Json2DArrayToTable(element_table, tableii);
                            {
                                let tbody = element_table.querySelectorAll("tbody");
                                if (tbody) {
                                    console.log(tbody instanceof HTMLElement); // 應該輸出 true
                                    let rows = tbody[0].querySelectorAll("tr"); // 只選 tbody 內的 tr
                                    rows.forEach((row) => {
                                        let text = row.cells[0].textContent; // 取得文字內容

                                        // 在最前插入一個編輯按鈕
                                        let newCell = document.createElement("td");
                                        newCell.innerHTML = '<button class="link_text" onclick="GotoPageLicenseUpdateOne(\'' + text + "')\" >" + '<i class="iconfont">&#xe764</i>' + "</button>";
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

function LicenseSelectOne(license_cid) {
    // 開啟loading dialog
    VisibleLoaderElement(true);

    setTimeout(function () {
        CsRequestLicenseSelectOneRecordByCID(license_cid, function (ok, result) {
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
                document.getElementById("license_update-license_cid").value = record.license_cid[0];
                document.getElementById("license_update-create_time").value = record.create_time[0].split(" ")[0];
                document.getElementById("license_update-license_type").value = record.license_type[0].split(" ")[0];
                document.getElementById("license_update-agent_cid").value = record.agent_cid[0];
                document.getElementById("license_update-owner_cid").value = record.owner_cid[0];
                document.getElementById("license_update-license_Key").value = record.license_key[0];
                document.getElementById("license_update-license_begin_time").value = record.license_begin_time[0].split(" ")[0];
                document.getElementById("license_update-license_days").value = record.license_days[0];
                document.getElementById("license_update-license_seats").value = record.license_seats[0];
                document.getElementById("license_update-sale_amount").value = record.sale_amount[0];
                document.getElementById("license_update-country").value = record.country[0];
                document.getElementById("license_update-customer_name").value = record.customer_name[0];
                document.getElementById("license_update-customer_gender").value = record.customer_gender[0];
                document.getElementById("license_update-customer_birthday").value = record.customer_birthday[0];
                document.getElementById("license_update-customer_phone").value = record.customer_phone[0];
                document.getElementById("license_update-customer_postalcode").value = record.customer_postalcode[0];
                document.getElementById("license_update-customer_address").value = record.customer_address[0];
                document.getElementById("license_update-customer_email").value = record.customer_email[0];
                document.getElementById("license_update-note00").value = record.note00[0];
            }
        });
    }, 500);
}

function LicenseInsertOne(license_data) {
    var license_data = Object.create(LicenseData);
    license_data.owner_cid = document.getElementById("license_insert-owner_cid").value;
    license_data.license_begin_time = document.getElementById("license_insert-license_begin_time").value;
    license_data.license_type = document.getElementById("license_insert-license_type").value;
    license_data.license_days = document.getElementById("license_insert-license_days").value;
    license_data.license_seats = document.getElementById("license_insert-license_seats").value;
    license_data.sale_amount = document.getElementById("license_insert-sale_amount").value;
    license_data.country = document.getElementById("license_insert-country").value;
    license_data.customer_name = document.getElementById("license_insert-customer_name").value;
    license_data.customer_gender = document.getElementById("license_insert-customer_gender").value;
    license_data.customer_birthday = document.getElementById("license_insert-customer_birthday").value;
    license_data.customer_phone = document.getElementById("license_insert-customer_phone").value;
    license_data.customer_postalcode = document.getElementById("license_insert-customer_postalcode").value;
    license_data.customer_address = document.getElementById("license_insert-customer_address").value;
    license_data.customer_email = document.getElementById("license_insert-customer_email").value;
    license_data.note00 = document.getElementById("license_insert-note00").value;

    VisibleLoaderElement(true);
    setTimeout(function () {
        CsRequesLicenseInsertOneRecord(license_data, function (ok, result) {
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

function LicenseUpdateOne() {
    var license_data = Object.create(LicenseData);
    license_data.license_cid = document.getElementById("license_update-license_cid").value;
    license_data.record_state = document.getElementById("license_update-record_state").value;
    license_data.license_begin_time = document.getElementById("license_update-license_begin_time").value;
    license_data.license_days = document.getElementById("license_update-license_days").value;
    license_data.license_seats = document.getElementById("license_update-license_seats").value;
    license_data.sale_amount = document.getElementById("license_update-sale_amount").value;
    license_data.country = document.getElementById("license_update-country").value;
    license_data.customer_gender = document.getElementById("license_update-customer_gender").value;
    license_data.customer_birthday = document.getElementById("license_update-customer_birthday").value;
    license_data.customer_phone = document.getElementById("license_update-customer_phone").value;
    license_data.customer_postalcode = document.getElementById("license_update-customer_postalcode").value;
    license_data.customer_email = document.getElementById("license_update-customer_email").value;
    license_data.note00 = document.getElementById("license_update-note00").value;

    VisibleLoaderElement(true);
    setTimeout(function () {
        CsRequesLicenseUpdateOneRecord(license_data, function (ok, result) {
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

            LicenseSelectOne(json_object.license_cid);
            alert(GetLocalData("common.success"));
        });
    }, 500);
}

// function LicenseDeleteOne(license_cid) {
//     VisibleLoaderElement(true);
//     setTimeout(function () {
//         CsRequestLicenseDeleteOneRecord(member_data, function (ok, result) {
//             // 關閉loading dialog
//             VisibleLoaderElement(false);

//             if (!ok) {
//                 alert("request error");
//                 return;
//             }

//             let json_object = JSON.parse(result); // 解析 JSON

//             //   loadingBox.hide()
//             //loadingWater.style.visibility = 'hidden'
//             if (json_object.errno < 0) {
//                 alert(GetLocalData("common.failure"));
//                 return;
//             }
//             let license_cid = json_object.license_cid;
//             alert(GetLocalData("common.success"));
//         });
//     }, 500);
// }

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
            let button = document.getElementById("license_list-button-search");
            if (button) {
                button.addEventListener("click", function (event) {
                    GotoPageLicenseSelectAll("");
                });
            }
        }

        // 確認新增
        {
            let button = document.getElementById("license_insert-button-ok");
            if (button) {
                button.addEventListener("click", function (event) {
                    LicenseInsertOne();
                });
            }
        }

        // 確認更新
        {
            let button = document.getElementById("license_update-button-ok");
            if (button) {
                button.addEventListener("click", function (event) {
                    LicenseUpdateOne();
                });
            }
        }
    }

    // 頁面切換
    {
        // 切換到新增使用者頁面
        {
            let button = document.getElementById("license_list-button-gotopage_insert");
            if (button) {
                button.addEventListener("click", function (event) {
                    GotoPageLicenseInsertOne();
                });
            }
        }

        // 回到使用者列表
        {
            let button = document.getElementById("license_insert-button-cancel");
            if (button) {
                button.addEventListener("click", function (event) {
                    GotoPageLicenseSelectAll("");
                });
            }
        }

        // 回到使用者列表
        {
            let button = document.getElementById("license_update-button-cancel");
            if (button) {
                button.addEventListener("click", function (event) {
                    GotoPageLicenseSelectAll("");
                });
            }
        }
    }

    {
        // 預設為三個月前到現在
        {
            const BDate = DateAdd("m", -3, new Date());
            const EDate = new Date();
            // 預設查授權的時間範圍
            {
                let b_time = document.getElementById("license_list-begin_time");
                let e_time = document.getElementById("license_list-end_time");
                b_time.value = BDate.toLocaleDateString("sv-SE");
                e_time.value = EDate.toLocaleDateString("sv-SE");
            }
        }

        {
            let element = document.getElementById("license_update-customer_birthday");
            let kkkk = element.value;
            let aaa = 0;
        }
    }

    GotoPageLicenseSelectAll("");
});
