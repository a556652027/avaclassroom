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

// 顯示會員列表的欄位對照表 與 順序
let key_member_list_info = [
    "member_cid",
    "member_name",
    "group_cid",
    "record_state",
    "create_time",
    "phone_cell",
    //"phone_home",
    //"phone_work",
    "email",
    "address",
    //"city",
    //"country",
    "gender",
    "birthday",
    //"avatar_url",
];

//let _member_info_username = "member_cid";

var member_depth = 1;

/*___________________________________________________________________________________*/
function GotoPageMemberSelectAll(parent_name) {
    MemberSelectAll(parent_name);
    change_page("page01");
}

function GotoPageMemberInsertOne() {
    change_page("page02");
}

function GotoPageMemberUpdateOne(member_name) {
    MemberSelectOne(member_name);
    change_page("page03");
}

/*___________________________________________________________________________________*/
function MemberSelectAll(parent_name) {
    // 顯示帳戶角色
    {
        {
            //let role_element = document.querySelector('.page-caption h4');
            let element = document.getElementById("member_list-role");
            if (element) {
                element.innerHTML = window.localeData.role[member_depth];
            }
        }

        {
            let element = document.getElementById("member_list-name");
            if (element) {
                element.innerHTML = parent_name == "" || parent_name == null ? Cyberspace.Client.getUsername() : parent_name;
            }
        }
    }

    if (parent_name == null) {
        parent_name = "";
        member_depth = 1;
    } else {
        member_depth++;
    }

    // 搜尋條件
    // 哪一種條件
    let search_field = document.getElementById("member_list-input_search_field");
    const selected_field = search_field.value;
    // 條件的內容
    let search_name = document.getElementById("member_list-input_search_value").value;

    // 開啟loading dialog
    VisibleLoaderElement(true);

    setTimeout(function () {
        CsRequestMemberSelectAllCountByParentCID(parent_name, search_name, function (ok, result) {
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
            var element_table = document.getElementById("member_list-list_information");
            if (element_table) {
                ClearTableBody(element_table);
            }

            let list_table_page = document.getElementById("member_list-list_pagination");
            if (list_table_page) {
                tablepage_d(list_table_page, def_rows_per_page, json_object.count, function (now_index, count_of_page) {
                    // 動態 取得 分頁內的資料
                    CsRequestMemberSelectAllRecordsByParentCID(parent_name, search_name, now_index, count_of_page, function (ok, result) {
                        let json_object = JSON.parse(result); // 解析 JSON
                        let json_tablesi = json_object.records;
                        let field_count = Object.keys(json_tablesi).length;
                        if (field_count == 0) {
                        } else {
                            let tableii = TablesiToTableii(key_member_list_info, json_tablesi);
                            //element_table.innerHTML = "";
                            var element_table = document.getElementById("member_list-list_information");
                            create_Json2DArrayToTable(element_table, tableii);

                            {
                                let tbody = element_table.querySelectorAll("tbody");
                                if (tbody) {
                                    console.log(tbody instanceof HTMLElement); // 應該輸出 true
                                    let rows = tbody[0].querySelectorAll("tr"); // 只選 tbody 內的 tr
                                    rows.forEach((row) => {
                                        let text = ""; // 取得文字內容

                                        // 變成改成可以點入下一層
                                        {
                                            text = row.cells[0].textContent; // 取得文字內容
                                            row.cells[0].innerHTML = '<button class="link_text" onclick="MemberSelectAll(\'' + text + "')\" >" + text + "</button>";
                                        }
                                        // {
                                        //     let role = row.cells[2].textContent; // 取得文字內容
                                        //     row.cells[2].innerHTML = window.localeData.depth[role];
                                        // }

                                        // 在最前插入一個編輯按鈕
                                        let newCell = document.createElement("td");
                                        newCell.innerHTML = '<button class="link_text" onclick="GotoPageMemberUpdateOne(\'' + text + "')\" >" + '<i class="iconfont">&#xe764</i>' + "</button>";
                                        newCell.innerHTML += '<button class="link_text" onclick="window.location.href=\'organization.html#owner_cid=' + encodeURIComponent(text) + "'\">" + '<i class="iconfont">&#xe757;&nbsp;</i>' + "</button>";
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

function MemberSelectOne(member_name) {
    // 開啟loading dialog
    VisibleLoaderElement(true);

    setTimeout(function () {
        CsRequestMemberSelectOneRecordByMemberCID(member_name, function (ok, result) {
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
                document.getElementById("member_update-member_cid").value = record.member_cid[0];
                document.getElementById("member_update-password").value = record.password[0];
                document.getElementById("member_update-member_name").value = record.member_name[0];
                document.getElementById("member_update-group_cid").value = record.group_cid[0];
                document.getElementById("member_update-gender").value = record.gender[0];
                document.getElementById("member_update-record_state").value = record.record_state[0];
                document.getElementById("member_update-birthday").value = record.birthday[0].split(" ")[0];
                document.getElementById("member_update-phone_cell").value = record.phone_cell[0];
                document.getElementById("member_update-phone_home").value = record.phone_home[0];
                document.getElementById("member_update-phone_work").value = record.phone_work[0];
                document.getElementById("member_update-email").value = record.email[0];
                document.getElementById("member_update-country").value = record.country[0];
                document.getElementById("member_update-city").value = record.city[0];
                document.getElementById("member_update-address").value = record.address[0];
                document.getElementById("member_update-note00").value = record.note00[0];
                //document.getElementById('member_update-avatar_url').value = record.avatar_url[0];
            }
        });
    }, 500);
}

function MemberInsertOne() {
    let parent_cid = document.getElementById("member_list-name").innerHTML;

    var member_data = Object.create(MemberData);
    member_data.member_cid = document.getElementById("member_insert-member_cid").value;
    member_data.password = document.getElementById("member_insert-password").value;
    member_data.member_name = document.getElementById("member_insert-member_name").value;
    member_data.group_cid = document.getElementById("member_insert-group_cid").value;
    member_data.gender = document.getElementById("member_insert-gender").value;
    member_data.phone_cell = document.getElementById("member_insert-phone_cell").value;
    member_data.phone_home = document.getElementById("member_insert-phone_home").value;
    member_data.phone_work = document.getElementById("member_insert-phone_work").value;
    member_data.email = document.getElementById("member_insert-email").value;
    member_data.address = document.getElementById("member_insert-address").value;
    member_data.city = document.getElementById("member_insert-city").value;
    member_data.country = document.getElementById("member_insert-country").value;
    member_data.birthday = document.getElementById("member_insert-birthday").value;
    member_data.note00 = document.getElementById("member_insert-note00").value;
    //member_data.avatar_url = document.getElementById('member_insert-avatar_url').value;

    VisibleLoaderElement(true);
    setTimeout(function () {
        CsRequesMembertInsertOneRecordByParentCID(
            parent_cid, // parent_cid 先傳空
            member_data,
            function (ok, result) {
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

                let member_cid = json_object.member_cid;
                alert(GetLocalData("common.success"));
            }
        );
    }, 500);
}

function MemberUpdateOne() {
    var member_data = Object.create(MemberData);
    member_data.member_cid = document.getElementById("member_update-member_cid").value;
    member_data.password = document.getElementById("member_update-password").value;
    member_data.member_name = document.getElementById("member_update-member_name").value;
    member_data.group_cid = document.getElementById("member_update-group_cid").value;
    member_data.gender = document.getElementById("member_update-gender").value;
    member_data.record_state = document.getElementById("member_update-record_state").value;
    member_data.birthday = document.getElementById("member_update-birthday").value;
    member_data.phone_cell = document.getElementById("member_update-phone_cell").value;
    member_data.phone_home = document.getElementById("member_update-phone_home").value;
    member_data.phone_work = document.getElementById("member_update-phone_work").value;
    member_data.email = document.getElementById("member_update-email").value;
    member_data.address = document.getElementById("member_update-address").value;
    member_data.city = document.getElementById("member_update-city").value;
    member_data.country = document.getElementById("member_update-country").value;
    member_data.note00 = document.getElementById("member_update-note00").value;

    VisibleLoaderElement(true);
    setTimeout(function () {
        CsRequestMemberUpdateOneRecordByMemberCID(member_data, function (ok, result) {
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

            MemberSelectOne(json_object.member_cid);
            alert(GetLocalData("common.success"));
        });
    }, 500);
    //member_data.avatar_url = document.getElementById('member_insert-avatar_url').value;
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
    // 當前只用者名稱
    {
        let element = document.getElementById("member_cid");
        if (element) {
            element.innerHTML = Cyberspace.Client.getUsername();
        }
    }

    // 預設組織帳號
    {
        let group_cid;
        {
            const hash = window.location.hash; // "#tab=2"
            const params = new URLSearchParams(hash.substring(1)); // 去掉 "#" 再解析
            group_cid = params.get("group_cid"); // 取得 "2"
            console.log(group_cid); // → "2"
        }
    }

    {
        // 搜尋
        {
            let button = document.getElementById("member_list-button-search");
            if (button) {
                button.addEventListener("click", function (event) {
                    MemberSelectAll();
                });
            }
        }

        // 確認新增
        {
            let button = document.getElementById("member_insert-button-ok");
            if (button) {
                button.addEventListener("click", function (event) {
                    MemberInsertOne();
                });
            }
        }

        // 確認更新
        {
            let button = document.getElementById("member_update-button-ok");
            if (button) {
                button.addEventListener("click", function (event) {
                    MemberUpdateOne();
                });
            }
        }
    }

    // 頁面切換
    {
        // 切換到新增使用者頁面
        {
            let button = document.getElementById("member_list-button-gotopage_insert");
            if (button) {
                button.addEventListener("click", function (event) {
                    GotoPageMemberInsertOne();
                });
            }
        }

        // 回到使用者列表
        {
            let button = document.getElementById("member_insert-button-cancel");
            if (button) {
                button.addEventListener("click", function (event) {
                    GotoPageMemberSelectAll();
                });
            }
        }

        // 回到使用者列表
        {
            let button = document.getElementById("member_update-button-cancel");
            if (button) {
                button.addEventListener("click", function (event) {
                    GotoPageMemberSelectAll();
                });
            }
        }
    }

    GotoPageMemberSelectAll();
});
