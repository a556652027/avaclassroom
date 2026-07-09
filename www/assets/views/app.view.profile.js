// home.html 的頁面事件操控程式碼相關

/*___________________________________________________________________________________*/
// 直接執行
// i18n ***必定放在載入頁面完成後的最前面 避免導致後面的addEventListener失效
(function () {
    renderTemplate("zh-tw", "app");
})();

/*___________________________________________________________________________________*/
// function 相關

// 顯示單一會員的詳細資料
let key_license_one = ["member_cid", "member_name", "create_time", "gender", "birthday", "phone_cell", "phone_home", "phone_work", "email", "country", "city", "address", "note", "avatar_url"];

//let _member_info_username = "member_cid";

/*___________________________________________________________________________________*/

function GotoPageUpdateProfileOne() {
    SelectProfileOne();
}

/*___________________________________________________________________________________*/

function SelectProfileOne() {
    let profile_cid = Cyberspace.Client.getUsername();

    // 開啟loading dialog
    VisibleLoaderElement(true);

    setTimeout(function () {
        CsRequestProfileSelectOne(profile_cid, function (ok, result) {
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
                document.getElementById("profile_update-member_cid").value = record.member_cid[0];
                document.getElementById("profile_update-password").value = record.password[0];
                document.getElementById("profile_update-member_name").value = record.member_name[0];
                document.getElementById("profile_update-gender").value = record.gender[0];
                document.getElementById("profile_update-record_state").value = record.record_state[0];
                document.getElementById("profile_update-birthday").value = record.birthday[0].split(" ")[0];
                document.getElementById("profile_update-phone_cell").value = record.phone_cell[0];
                document.getElementById("profile_update-phone_home").value = record.phone_home[0];
                document.getElementById("profile_update-phone_work").value = record.phone_work[0];
                document.getElementById("profile_update-email").value = record.email[0];
                document.getElementById("profile_update-country").value = record.country[0];
                document.getElementById("profile_update-city").value = record.city[0];
                document.getElementById("profile_update-address").value = record.address[0];
                document.getElementById("profile_update-note00").value = record.note00[0];
                //document.getElementById('profile_update-avatar_url').value = record.avatar_url[0];
            }
        });
    }, 500);
}

function UpdateProfileOne() {
    var profile_data = Object.create(ProfileData);
    profile_data.member_cid = document.getElementById("profile_update-member_cid").value;
    profile_data.password = document.getElementById("profile_update-password").value;
    profile_data.member_name = document.getElementById("profile_update-member_name").value;
    profile_data.gender = document.getElementById("profile_update-gender").value;
    profile_data.record_state = document.getElementById("profile_update-record_state").value;
    profile_data.birthday = document.getElementById("profile_update-birthday").value;
    profile_data.phone_cell = document.getElementById("profile_update-phone_cell").value;
    profile_data.phone_home = document.getElementById("profile_update-phone_home").value;
    profile_data.phone_work = document.getElementById("profile_update-phone_work").value;
    profile_data.email = document.getElementById("profile_update-email").value;
    profile_data.address = document.getElementById("profile_update-address").value;
    profile_data.city = document.getElementById("profile_update-city").value;
    profile_data.country = document.getElementById("profile_update-country").value;
    profile_data.note00 = document.getElementById("profile_update-note00").value;

    VisibleLoaderElement(true);
    setTimeout(function () {
        CsRequestProfileUpdateOne(profile_data, function (ok, result) {
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

            SelectProfileOne();
            alert(GetLocalData("common.success"));
        });
    }, 500);
    //profile_data.avatar_url = document.getElementById('member_insert-avatar_url').value;
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
        // 確認更新
        {
            let button = document.getElementById("profile_update-button-ok");
            if (button) {
                button.addEventListener("click", function (event) {
                    UpdateProfileOne();
                });
            }
        }
    }

    // 頁面切換
    {
    }

    GotoPageUpdateProfileOne();
});
