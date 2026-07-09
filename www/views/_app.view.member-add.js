// member-add.html 的頁面事件操控程式碼相關

/*___________________________________________________________________________________*/
// 直接執行
// i18n ***必定放在載入頁面完成後的最前面 避免導致後面的addEventListener失效
(function () {
  renderTemplate("zh-tw", "app");
})();

/*___________________________________________________________________________________*/
// function 相關

function MemberInsertOne() {
  var member_data = Object.create(MemberData);
  member_data.member_cid = document.getElementById(
    "member_insert-member_cid",
  ).value;
  member_data.password = document.getElementById(
    "member_insert-password",
  ).value;
  member_data.member_name = document.getElementById(
    "member_insert-member_name",
  ).value;
  member_data.group_cid = document.getElementById(
    "member_insert-group_cid",
  ).value;
  member_data.gender = document.getElementById("member_insert-gender").value;
  member_data.phone_cell = document.getElementById(
    "member_insert-phone_cell",
  ).value;
  member_data.phone_home = document.getElementById(
    "member_insert-phone_home",
  ).value;
  member_data.phone_work = document.getElementById(
    "member_insert-phone_work",
  ).value;
  member_data.email = document.getElementById("member_insert-email").value;
  member_data.address = document.getElementById("member_insert-address").value;
  member_data.city = document.getElementById("member_insert-city").value;
  member_data.country = document.getElementById("member_insert-country").value;
  member_data.birthday = document.getElementById(
    "member_insert-birthday",
  ).value;
  member_data.note00 = document.getElementById("member_insert-note00").value;

  VisibleLoaderElement(true);
  setTimeout(function () {
    CsRequestMemberInsertOneRecordByParentCID(
      "", // parent_cid 先傳空
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

        // 新增成功後返回會員列表頁面
        window.location.href = "member.html";
      },
    );
  }, 500);
}

function CancelMemberInsert() {
  // 取消新增，返回會員列表頁面
  window.location.href = "member.html";
}

/*___________________________________________________________________________________*/
// 事件相關

// 頁面啟動完成時
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Member Add DOMContentLoaded");

  // 顯示放最後 等都完成後
  showTemplate("app");

  // [新增] 移除靜態 Loading 遮罩
  const loader = document.getElementById("initial-loader");
  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => loader.remove(), 300); // 淡出效果
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

  // 取消新增
  {
    let button = document.getElementById("member_insert-button-cancel");
    if (button) {
      button.addEventListener("click", function (event) {
        CancelMemberInsert();
      });
    }
  }
});
