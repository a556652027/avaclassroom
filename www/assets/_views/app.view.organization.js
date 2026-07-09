// home.html 的頁面事件操控程式碼相關

/*___________________________________________________________________________________*/
// 直接執行
// i18n ***必定放在載入頁面完成後的最前面 避免導致後面的addEventListener失效
(function () {
    renderTemplate("zh-tw", "app");
})();

/*___________________________________________________________________________________*/
// function 相關
const def_rows_per_page = 10;

// 列表上面顯示的欄位對照表 與 順序
let key_group_list_info = [
    "group_cid",
    "create_time",
    "agent_cid",
    "group_name",
    "country",
    "licensing_remaining_seats",
    "contact",
    "contact_phone_01",
    "contact_email_01",
    //"avatar_url",
];

//let _organization_info_username = "group_cid";

/*___________________________________________________________________________________*/
function GotoPageOrganizationSelectAll(owner_cid) {
    OrganizationSelectAll(owner_cid);
    change_page("page01");
}

function GotoPageOrganizationInsertOne() {
    change_page("page02");
}

function GotoPageOrganizationUpdateOne(organization_cid) {
    OrganizationSelectOne(organization_cid);
    change_page("page03");
}

/*___________________________________________________________________________________*/
function OrganizationSelectAll(owner_cid) {
    if (owner_cid == null) {
        owner_cid = "";
    }

    // 搜尋條件
    let search_field = document.getElementById("organization_list-input_search_field");
    const selected_field = search_field.value;
    let search_value = document.getElementById("organization_list-input_search_value");

    // 開啟loading dialog
    VisibleLoaderElement(true);

    setTimeout(function () {
        CsRequestGroupSelectAllCountByOwnerCode(owner_cid, function (ok, result) {
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

            // 把結果填入表格中
            //let member_table_grid = document.getElementById('member_list-member_information');
            var element_table = document.getElementById("organization_list-list_information");
            if (element_table) {
                ClearTableBody(element_table);
            }

            let list_table_page = document.getElementById("organization_list-list_pagination");
            if (list_table_page) {
                tablepage_d(list_table_page, def_rows_per_page, json_object.count, function (now_index, count_of_page) {
                    // 動態 取得 分頁內的資料
                    CsRequestGroupSelectAllRecordsByOwnerCode(owner_cid, now_index, count_of_page, function (ok, result) {
                        let json_object = JSON.parse(result); // 解析 JSON
                        let json_tablesi = json_object.records;
                        let field_count = Object.keys(json_tablesi).length;
                        if (field_count == 0) {
                        } else {
                            let tableii = TablesiToTableii(key_group_list_info, json_tablesi);
                            //element_table.innerHTML = "";
                            var element_table = document.getElementById("organization_list-list_information");
                            create_Json2DArrayToTable(element_table, tableii);

                            // 在最前面加入 修改 跟 刪除 的按鈕
                            // {
                            //     let thead = element_table.querySelector("thead");
                            //     let headerRow = thead.rows[0];
                            //     let newHeader = document.createElement("th");
                            //     newHeader.textContent = "";
                            //     headerRow.insertBefore(newHeader, headerRow.cells[0]); // 插入到最前面
                            // }

                            // 顯示帳戶角色
                            {
                                //let role_element = document.querySelector('.page-caption h4');
                                // let role_element = document.getElementById('organization_list-role');
                                // if (role_element) {
                                //     role_element.innerHTML = window.localeData.role[member_depth];
                                // }
                            }

                            {
                                let tbody = element_table.querySelectorAll("tbody");
                                if (tbody) {
                                    console.log(tbody instanceof HTMLElement); // 應該輸出 true
                                    let rows = tbody[0].querySelectorAll("tr"); // 只選 tbody 內的 tr
                                    rows.forEach((row) => {
                                        // 組織帳號
                                        let text = row.cells[0].textContent; // 取得文字內容
                                        //
                                        let newCell = document.createElement("td");
                                        newCell.innerHTML = '<button class="link_text" onclick="GotoPageOrganizationUpdateOne(\'' + text + "')\" >" + '<i class="iconfont">&#xe764</i>' + "</button>";
                                        newCell.innerHTML += '<button class="link_text" onclick="window.location.href=\'dashboard.html#group_cid=' + encodeURIComponent(text) + "'\">" + '<i class="iconfont">&#xe767;&nbsp;</i>' + "</button>";
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

function OrganizationSelectOne(organization_cid) {
    // 開啟loading dialog
    VisibleLoaderElement(true);

    setTimeout(function () {
        CsRequestGroupSelectOneRecordByGroupCID(organization_cid, function (ok, result) {
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
                document.getElementById("organization_update-group_cid").value = record.group_cid[0];
                document.getElementById("organization_update-group_name").value = record.group_name[0];
                document.getElementById("organization_update-group_type").value = record.group_type[0];
                document.getElementById("organization_update-owner_cid").value = record.owner_cid[0];
                document.getElementById("organization_update-contact").value = record.contact[0];
                document.getElementById("organization_update-group_ubn").value = record.group_ubn[0];
                document.getElementById("organization_update-contact_phone_01").value = record.contact_phone_01[0];
                //document.getElementById("organization_update-contact_phone_02").value = record.contact_phone_02[0];
                document.getElementById("organization_update-contact_email_01").value = record.contact_email_01[0];
                //document.getElementById("organization_update-contact_email_02").value = record.contact_email_02[0];
                document.getElementById("organization_update-country").value = record.country[0];
                document.getElementById("organization_update-city").value = record.city[0];
                document.getElementById("organization_update-address").value = record.address[0];
                document.getElementById("organization_update-billing_addr").value = record.billing_addr[0];
                document.getElementById("organization_update-note00").value = record.note00[0];
            }
        });
    }, 500);
}

function OrganizationInsertOne(owner_cid) {
    var group_data = Object.create(GroupData);
    group_data.group_cid = document.getElementById("organization_insert-group_cid").value;
    group_data.group_name = document.getElementById("organization_insert-group_name").value;
    group_data.group_type = document.getElementById("organization_insert-group_type").value;
    group_data.owner_cid = document.getElementById("organization_insert-owner_cid").value;
    group_data.contact = document.getElementById("organization_insert-contact").value;
    group_data.group_ubn = document.getElementById("organization_insert-group_ubn").value;
    group_data.contact_phone_01 = document.getElementById("organization_insert-contact_phone_01").value;
    //group_data.contact_phone_02 = document.getElementById("organization_insert-contact_phone_02").value;
    group_data.contact_email_01 = document.getElementById("organization_insert-contact_email_01").value;
    //group_data.contact_email_02 = document.getElementById("organization_insert-contact_email_02").value;
    group_data.country = document.getElementById("organization_insert-country").value;
    group_data.city = document.getElementById("organization_insert-city").value;
    group_data.address = document.getElementById("organization_insert-address").value;
    group_data.billing_addr = document.getElementById("organization_insert-billing_addr").value;
    group_data.note00 = document.getElementById("organization_insert-note00").value;

    VisibleLoaderElement(true);

    setTimeout(function () {
        CsRequesGroupInsertOneRecordByOwnerCID(group_data, function (ok, result) {
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

            let _organization_info_username = json_object.group_cid;
            alert(GetLocalData("common.success"));
        });
    }, 500);
}

function OrganizationUpdateOne() {
    var group_data = Object.create(GroupData);
    group_data.group_cid = document.getElementById("organization_update-group_cid").value;
    group_data.group_name = document.getElementById("organization_update-group_name").value;
    group_data.group_type = document.getElementById("organization_update-group_type").value;
    group_data.owner_cid = document.getElementById("organization_update-owner_cid").value;
    group_data.contact = document.getElementById("organization_update-contact").value;
    group_data.group_ubn = document.getElementById("organization_update-group_ubn").value;
    group_data.contact_phone_01 = document.getElementById("organization_update-contact_phone_01").value;
    //group_data.contact_phone_02 = document.getElementById("organization_update-contact_phone_02").value;
    group_data.contact_email_01 = document.getElementById("organization_update-contact_email_01").value;
    //group_data.contact_email_02 = document.getElementById("organization_update-contact_email_02").value;
    group_data.country = document.getElementById("organization_update-country").value;
    group_data.city = document.getElementById("organization_update-city").value;
    group_data.address = document.getElementById("organization_update-address").value;
    group_data.billing_addr = document.getElementById("organization_update-billing_addr").value;
    group_data.note00 = document.getElementById("organization_update-note00").value;

    VisibleLoaderElement(true);

    setTimeout(function () {
        CsRequestGroupUpdateOneRecordByGroupCID(group_data, function (ok, result) {
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

            OrganizationSelectOne(json_object.group_cid);
            alert(GetLocalData("common.success"));
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
            let button = document.getElementById("organization_list-button-search");
            if (button) {
                button.addEventListener("click", function (event) {
                    GotoPageOrganizationSelectAll("");
                });
            }
        }

        // 確認新增
        {
            let button = document.getElementById("organization_insert-button-ok");
            if (button) {
                button.addEventListener("click", function (event) {
                    OrganizationInsertOne();
                });
            }
        }

        // 確認更新
        {
            let button = document.getElementById("organization_update-button-ok");
            if (button) {
                button.addEventListener("click", function (event) {
                    OrganizationUpdateOne();
                });
            }
        }
    }

    // 頁面切換
    {
        // 切換到新增使用者頁面
        {
            let button = document.getElementById("organization_list-button-gotopage_insert");
            if (button) {
                button.addEventListener("click", function (event) {
                    GotoPageOrganizationInsertOne();
                });
            }
        }

        // 回到使用者列表
        {
            let button = document.getElementById("organization_insert-button-cancel");
            if (button) {
                button.addEventListener("click", function (event) {
                    GotoPageOrganizationSelectAll("");
                });
            }
        }

        // 回到使用者列表
        {
            let button = document.getElementById("organization_update-button-cancel");
            if (button) {
                button.addEventListener("click", function (event) {
                    GotoPageOrganizationSelectAll("");
                });
            }
        }
    }

    // 預設資料
    {
        document.getElementById("organization_insert-owner_cid").value = Cyberspace.Client.getUsername();
    }

    // 預設要取得有擁有的組織
    {
        let owner_cid = "";
        {
            const hash = window.location.hash; // "#tab=2"
            const params = new URLSearchParams(hash.substring(1)); // 去掉 "#" 再解析
            owner_cid = params.get("owner_cid"); // 取得 "2"
            console.log(owner_cid); // → "2"
        }
        //document.getElementById("dashboard_device_001-search_group_cid").value = owner_cid;
        GotoPageOrganizationSelectAll(owner_cid);
    }
});
