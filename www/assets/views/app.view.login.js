// login.html 的頁面事件操控程式碼相關

//_______________________________________________________________________
// 直接執行
// i18n ***必定放在載入頁面完成後的最前面 避免導致後面的addEventListener失效
(function () {
    renderTemplate("zh-tw", "app");
})();

//_____________________________________________________________________________________
// function 相關
function GotoPageLogin() {
    change_page("login.html");
}

function GotoPageResetPassword() {
    change_page("page02");
}

// 登入
function SubmitLogin() {
    let is_remember_username = document.getElementById("login-remember_username").value;
    if (is_remember_username === "on") {
        // 記住帳號
        window.localStorage.setItem("member_cid", document.getElementById("login_username").value);
    } else {
        // 不記住帳號
        window.localStorage.removeItem("member_cid");
    }

    // 開啟loading dialog
    VisibleLoaderElement(true);

    setTimeout(function () {
        CsRequestLogin(document.getElementById("login_username").value, document.getElementById("login_password").value, function (ok, result) {
            const json_object = JSON.parse(result); // 解析 JSON

            // 關閉loading dialog
            VisibleLoaderElement(false);
            //   loadingBox.hide()
            //loadingWater.style.visibility = 'hidden'
            if (json_object.errno < 0) {
                alert("帳號密碼錯誤!");
                return;
            }

            // 避免外部廠商登入，雖然nginx有設forbidden，但還是小心點
            // if (!result.group_uid.match(/abt.*/)) {
            //   alert('無權限登入')
            //   return
            // }
            listCookiesOnConsole();

            //if (result.session_uid > 0)
            {
                //alert( '登入成功!' );
                //const queryString = window.location.search
                //const urlParams = new URLSearchParams(queryString)
                // if (
                //     urlParams.get('target') &&
                //     urlParams.get('target').includes('store')
                // ) {
                //     var next_page = './stores.html' + queryString
                // } else {
                //}
                change_page("home.html");
                return;
            }

            alert("帳號密碼錯誤!");
            //location.reload();
        });
    }, 500);
}

function SubmitResetPassword() {
    let member_cid = document.getElementById("reset_password-username").value;
    let email = document.getElementById("reset_password-email").value;

    // 開啟loading dialog
    VisibleLoaderElement(true);

    setTimeout(function () {
        CsRequestResetPassword(member_cid, email, function (ok, result) {
            const json_object = JSON.parse(result); // 解析 JSON

            // 關閉loading dialog
            VisibleLoaderElement(false);
            //   loadingBox.hide()
            //loadingWater.style.visibility = 'hidden'
            if (json_object.errno > 0) {
                alert(window.localeData.login["reset_password_check_emil"]);
            } else {
                alert(window.localeData.login["reset_password_failure"]);
            }

            GotoPageLogin();

            //if (result.session_uid > 0)
            {
                //alert( '登入成功!' );
                //const queryString = window.location.search
                //const urlParams = new URLSearchParams(queryString)
                // if (
                //     urlParams.get('target') &&
                //     urlParams.get('target').includes('store')
                // ) {
                //     var next_page = './stores.html' + queryString
                // } else {
                //}
                return;
            }

            //location.reload();
        });
    }, 500);
}

//_____________________________________________________________________________________
// 事件相關

// 頁面啟動完成時 這是jquery 才有的
// 等同於 document.addEventListener('DOMContentLoaded', async () => {
// $(document).ready(function () {

//     //VisibleLoaderElement(true)
//     //const loadingWater = document.querySelector('.loader')
//     //loadingWater.style.visibility = "visible"
//     //loadingWater.style.visibility = 'hidden'
//     console.log('Document ready...')
// })

// 頁面啟動完成時
document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOMContentLoaded");

    // 顯示放最後 等都完成後
    var app = document.getElementById("app");
    app.style.visibility = "visible";

    //_______________________________________________________________________
    //VisibleLoaderElement(true)
    // 幫忙填入 之前的 帳號

    let member_cid = window.localStorage.getItem("member_cid");
    if (member_cid) {
        document.getElementById("login_username").value = member_cid;
    }

    // 監聽 password 欄為輸入完成
    document.getElementById("login_password").addEventListener("keyup", (event) => {
        console.log("keyup password");
        event.preventDefault();

        // detect enter key
        // 填入 密碼時 直接 enter 就可以送出
        if (event.key === "Enter") {
            SubmitLogin();
        }
    });

    // 放在裡面確保文件都已經加載完成
    document.getElementById("Login").addEventListener("click", () => {
        console.log("send login");
        SubmitLogin();
    });

    // 重設密碼
    document.getElementById("reset_password").addEventListener("click", () => {
        console.log("goto reset_password");
        GotoPageResetPassword();
    });

    // 申請重設
    document.getElementById("reset_password-send").addEventListener("click", () => {
        console.log("send reset password");
        SubmitResetPassword();
    });

    // 申請取消
    document.getElementById("reset_password-cancel").addEventListener("click", () => {
        change_page("page01");
    });

    CsRequestLogout();
});
