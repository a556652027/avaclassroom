// home.html 的頁面事件操控程式碼相關

//_______________________________________________________________________
// 直接執行
// i18n ***必定放在載入頁面完成後的最前面 避免導致後面的addEventListener失效
(function () {
    renderTemplate("zh-tw", "app");
})();

/*___________________________________________________________________________________*/
//_____________________________________________________________________________________
// function 相關

var _g_permission_code = 0;

function GotoPageUpdate01() {
    _g_permission_code = 1;
    document.getElementById("permission-button-gotopage_admin").disabled = true;
    document.getElementById("permission-button-gotopage_agent").disabled = false;
    document.getElementById("permission-button-gotopage_manager").disabled = false;
    document.getElementById("permission-button-gotopage_user").disabled = false;
    PermissionSelectOne();
}

function GotoPageUpdate02() {
    _g_permission_code = 2;
    document.getElementById("permission-button-gotopage_admin").disabled = false;
    document.getElementById("permission-button-gotopage_agent").disabled = true;
    document.getElementById("permission-button-gotopage_manager").disabled = false;
    document.getElementById("permission-button-gotopage_user").disabled = false;
    PermissionSelectOne();
}

function GotoPageUpdate03() {
    _g_permission_code = 3;
    document.getElementById("permission-button-gotopage_admin").disabled = false;
    document.getElementById("permission-button-gotopage_agent").disabled = false;
    document.getElementById("permission-button-gotopage_manager").disabled = true;
    document.getElementById("permission-button-gotopage_user").disabled = false;
    PermissionSelectOne();
}

function GotoPageUpdate04() {
    _g_permission_code = 4;
    document.getElementById("permission-button-gotopage_admin").disabled = false;
    document.getElementById("permission-button-gotopage_agent").disabled = false;
    document.getElementById("permission-button-gotopage_manager").disabled = false;
    document.getElementById("permission-button-gotopage_user").disabled = true;
    PermissionSelectOne();
}

/*___________________________________________________________________________________*/
function PermissionSelectOne() {
    // 開啟loading dialog
    VisibleLoaderElement(true);

    setTimeout(function () {
        CsRequestPermissionSelectOne(_g_permission_code, function (ok, result) {
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
                {
                    document.getElementById("permission-is_operate_member").checked = false;
                    document.getElementById("permission-is_operate_organization").checked = false;
                    document.getElementById("permission-is_operate_license").checked = false;
                    document.getElementById("permission-is_operate_device").checked = false;
                    document.getElementById("permission-is_operate_analytics").checked = false;

                    document.getElementById("permission-is_select_own_member").checked = false;
                    document.getElementById("permission-is_insert_own_member").checked = false;
                    document.getElementById("permission-is_update_own_member").checked = false;
                    //document.getElementById("permission-is_ban_own_member").checked = false;

                    document.getElementById("permission-is_select_own_organization").checked = false;
                    document.getElementById("permission-is_insert_own_organization").checked = false;
                    document.getElementById("permission-is_update_own_organization").checked = false;
                    //document.getElementById("permission-is_close_own_organization").checked = false;

                    document.getElementById("permission-is_select_own_license").checked = false;
                    document.getElementById("permission-is_insert_own_license").checked = false;
                    document.getElementById("permission-is_update_own_license").checked = false;
                    //document.getElementById("permission-is_cancel_own_license").checked = false;

                    document.getElementById("permission-is_select_own_device").checked = false;
                    document.getElementById("permission-is_insert_own_device").checked = false;
                    document.getElementById("permission-is_update_own_device").checked = false;
                    //document.getElementById("permission-is_cancel_own_device").checked = false;

                    document.getElementById("permission-is_select_own_analytics").checked = false;
                    document.getElementById("permission-is_insert_own_analytics").checked = false;
                    document.getElementById("permission-is_update_own_analytics").checked = false;
                    //document.getElementById("permission-is_cancel_own_analytics").checked = false;
                }

                if (Object.keys(json_object.permissions).length != 0) {
                    const paperLabel = json_object.permissions.paper_label;
                    const paperValue = json_object.permissions.paper_value;

                    let result = {};
                    for (let i = 0; i < paperLabel.length; i++) {
                        result[paperLabel[i]] = paperValue[i];
                    }

                    document.getElementById("permission-is_operate_member").checked = strToBool(result["is_operate_member"]);
                    document.getElementById("permission-is_operate_organization").checked = strToBool(result["is_operate_organization"]);
                    document.getElementById("permission-is_operate_license").checked = strToBool(result["is_operate_license"]);
                    document.getElementById("permission-is_operate_device").checked = strToBool(result["is_operate_device"]);
                    document.getElementById("permission-is_operate_analytics").checked = strToBool(result["is_operate_analytics"]);

                    document.getElementById("permission-is_select_own_member").checked = strToBool(result["is_select_own_member"]);
                    document.getElementById("permission-is_insert_own_member").checked = strToBool(result["is_insert_own_member"]);
                    document.getElementById("permission-is_update_own_member").checked = strToBool(result["is_update_own_member"]);
                    //document.getElementById("permission-is_ban_own_member").checked = strToBool(result["is_ban_own_member"]);

                    document.getElementById("permission-is_select_own_organization").checked = strToBool(result["is_select_own_organization"]);
                    document.getElementById("permission-is_insert_own_organization").checked = strToBool(result["is_insert_own_organization"]);
                    document.getElementById("permission-is_update_own_organization").checked = strToBool(result["is_update_own_organization"]);
                    //document.getElementById("permission-is_close_own_organization").checked = strToBool(result["is_close_own_organization"]);

                    document.getElementById("permission-is_select_own_license").checked = strToBool(result["is_select_own_license"]);
                    document.getElementById("permission-is_insert_own_license").checked = strToBool(result["is_insert_own_license"]);
                    document.getElementById("permission-is_update_own_license").checked = strToBool(result["is_update_own_license"]);
                    //document.getElementById("permission-is_cancel_own_license").checked = strToBool(result["is_cancel_own_license"]);

                    document.getElementById("permission-is_select_own_device").checked = strToBool(result["is_select_own_device"]);
                    document.getElementById("permission-is_insert_own_device").checked = strToBool(result["is_insert_own_device"]);
                    document.getElementById("permission-is_update_own_device").checked = strToBool(result["is_update_own_devres"]);
                    //document.getElementById("permission-is_cancel_own_device").checked = strToBool(result["is_cancel_own_device"]);

                    document.getElementById("permission-is_select_own_analytics").checked = strToBool(result["is_select_own_analytics"]);
                    document.getElementById("permission-is_insert_own_analytics").checked = strToBool(result["is_insert_own_analytics"]);
                    document.getElementById("permission-is_update_own_analytics").checked = strToBool(result["is_update_own_analytics"]);
                    //document.getElementById("permission-is_cancel_own_analytics").checked = strToBool(result["is_cancel_own_analytics"]);
                }
            }
        });
    }, 500);
}

function PermissionUpdateOne() {
    var permissin_data = Object.create(PermissionData);
    permissin_data.code = _g_permission_code;

    permissin_data.is_operate_member = +document.getElementById("permission-is_operate_member").checked;
    permissin_data.is_operate_organization = +document.getElementById("permission-is_operate_organization").checked;
    permissin_data.is_operate_license = +document.getElementById("permission-is_operate_license").checked;
    permissin_data.is_operate_device = +document.getElementById("permission-is_operate_device").checked;
    permissin_data.is_operate_analytics = +document.getElementById("permission-is_operate_analytics").checked;

    permissin_data.is_select_own_member = +document.getElementById("permission-is_select_own_member").checked;
    permissin_data.is_insert_own_member = +document.getElementById("permission-is_insert_own_member").checked;
    permissin_data.is_update_own_member = +document.getElementById("permission-is_update_own_member").checked;
    //permissin_data.is_ban_own_member = +document.getElementById("permission-is_ban_own_member").checked;

    permissin_data.is_select_own_organization = +document.getElementById("permission-is_select_own_organization").checked;
    permissin_data.is_insert_own_organization = +document.getElementById("permission-is_insert_own_organization").checked;
    permissin_data.is_update_own_organization = +document.getElementById("permission-is_update_own_organization").checked;
    //permissin_data.is_close_own_organization = +document.getElementById("permission-is_close_own_organization").checked;

    permissin_data.is_select_own_license = +document.getElementById("permission-is_select_own_license").checked;
    permissin_data.is_insert_own_license = +document.getElementById("permission-is_insert_own_license").checked;
    permissin_data.is_update_own_license = +document.getElementById("permission-is_update_own_license").checked;
    //permissin_data.is_cancel_own_license = +document.getElementById("permission-is_cancel_own_license").checked;

    permissin_data.is_select_own_device = +document.getElementById("permission-is_select_own_device").checked;
    permissin_data.is_insert_own_device = +document.getElementById("permission-is_insert_own_device").checked;
    permissin_data.is_update_own_device = +document.getElementById("permission-is_update_own_device").checked;
    //permissin_data.is_cancel_own_device = +document.getElementById("permission-is_cancel_own_device").checked;

    permissin_data.is_select_own_analytics = +document.getElementById("permission-is_select_own_analytics").checked;
    permissin_data.is_insert_own_analytics = +document.getElementById("permission-is_insert_own_analytics").checked;
    permissin_data.is_update_own_analytics = +document.getElementById("permission-is_update_own_analytics").checked;
    //permissin_data.is_cancel_own_analytics = +document.getElementById("permission-is_cancel_own_analytics").checked;

    //member_data.avatar_url = document.getElementById('member_insert-avatar_url').value;

    VisibleLoaderElement(true);
    setTimeout(function () {
        CsRequestPermissionUpdateOne(_g_permission_code, permissin_data, function (ok, result) {
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
        });
    }, 500);
}

/*___________________________________________________________________________________*/
//_____________________________________________________________________________________
// 事件相關

// 頁面啟動完成時
document.addEventListener("DOMContentLoaded", async () => {
    console.log("Home DOMContentLoaded");

    // 顯示放最後 等都完成後
    var app = document.getElementById("app");
    app.style.visibility = "visible";

    // 頁面切換
    {
        // 切換到系統管理員權限設定
        {
            let button = document.getElementById("permission-button-gotopage_admin");
            if (button) {
                button.addEventListener("click", function (event) {
                    GotoPageUpdate01();
                });
            }
        }

        // 切換到代理員權限設定
        {
            let button = document.getElementById("permission-button-gotopage_agent");
            if (button) {
                button.addEventListener("click", function (event) {
                    GotoPageUpdate02();
                });
            }
        }

        // 切換到群組管理員權限設定
        {
            let button = document.getElementById("permission-button-gotopage_manager");
            if (button) {
                button.addEventListener("click", function (event) {
                    GotoPageUpdate03();
                });
            }
        }

        // 切換到使用者權限設定
        {
            let button = document.getElementById("permission-button-gotopage_user");
            if (button) {
                button.addEventListener("click", function (event) {
                    PermissionSelectOne();
                    GotoPageUpdate04();
                });
            }
        }
    }

    // 功能
    {
        let button = document.getElementById("permission-button-update_ok");
        if (button) {
            button.addEventListener("click", function (event) {
                PermissionUpdateOne();
            });
        }
    }

    // 第一頁是系統管理員 所以隱藏按鈕
    {
        GotoPageUpdate01();
    }
});
