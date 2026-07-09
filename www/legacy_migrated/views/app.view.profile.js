// home.html 的頁面事件操控程式碼相關

/*___________________________________________________________________________________*/
// 直接執行
/*___________________________________________________________________________________*/
// function 相關

// 顯示單一會員的詳細資料
let key_license_one = [
  "member_cid",
  "member_name",
  "create_time",
  "gender",
  "birthday",
  "phone_cell",
  "phone_home",
  "phone_work",
  "email",
  "country",
  "city",
  "address",
  "note",
  "avatar_url",
];

//let _member_info_username = "member_cid";

/*___________________________________________________________________________________*/

function GotoPageUpdateProfileOne() {
  SelectProfileOne();
}

/*___________________________________________________________________________________*/

async function SelectProfileOne() {
  let profile_cid = Cyberspace.Client.getUsername();

  // 開啟loading dialog
  VisibleLoaderElement(true);

  try {
    const json_object = await apiCall(CsRequestProfileSelectOne, profile_cid);

    // 填入初始資料
    let record = json_object.records;
    document.getElementById("profile_update-member_cid").value =
      record.member_cid[0];
    document.getElementById("profile_update-password").value =
      record.password[0];
    document.getElementById("profile_update-member_name").value =
      record.member_name[0];
    document.getElementById("profile_update-gender" || "").value =
      record.gender[0];
    document.getElementById("profile_update-record_state").value =
      record.record_state[0];
    document.getElementById("profile_update-birthday").value =
      record.birthday[0].split(" ")[0];
    document.getElementById("profile_update-phone_cell").value =
      record.phone_cell[0];
    document.getElementById("profile_update-phone_home").value =
      record.phone_home[0];
    document.getElementById("profile_update-phone_work").value =
      record.phone_work[0];
    document.getElementById("profile_update-email").value = record.email[0];
    document.getElementById("profile_update-country").value = record.country[0];
    document.getElementById("profile_update-city").value = record.city[0];
    document.getElementById("profile_update-address").value = record.address[0];
    document.getElementById("profile_update-note00").value = record.note00[0];
  } catch (e) {
    if (e.message !== "Handled Server Error") alert("request error");
  } finally {
    VisibleLoaderElement(false);
  }
}

async function UpdateProfileOne() {
  var profile_data = Object.create(ProfileData);
  profile_data.member_cid = document.getElementById(
    "profile_update-member_cid" || "",
  ).value;

  // 處理密碼更新邏輯
  let newPassword = getElementValue("profile_update-new_password");
  let confirmPassword = getElementValue("profile_update-confirm_password");

  if (newPassword && newPassword !== confirmPassword) {
    alert("新密碼與確認密碼不符");
    return;
  } else if (newPassword && newPassword === confirmPassword) {
    profile_data.password = newPassword; // 使用新密碼
  } else {
    // 如果沒輸入新密碼，保持原密碼
    profile_data.password = getElementValue("profile_update-password");
  }

  // 安全取得欄位值，如果元素不存在則使用空字串
  function getElementValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : "";
  }

  profile_data.member_name = getElementValue("profile_update-member_name");
  profile_data.gender = getElementValue("profile_update-gender");
  profile_data.record_state = getElementValue("profile_update-record_state");
  profile_data.birthday = getElementValue("profile_update-birthday");
  profile_data.phone_cell = getElementValue("profile_update-phone_cell");
  profile_data.phone_home = getElementValue("profile_update-phone_home");
  profile_data.phone_work = getElementValue("profile_update-phone_work");
  profile_data.email = getElementValue("profile_update-email");
  profile_data.address = getElementValue("profile_update-address");
  profile_data.city = getElementValue("profile_update-city");
  profile_data.country = getElementValue("profile_update-country");
  profile_data.note00 = getElementValue("profile_update-note00");

  VisibleLoaderElement(true);
  try {
    await apiCall(CsRequestProfileUpdateOne, profile_data);

    alert(GetLocalData("common.success"));

    // 隱藏 modal
    const modal = document.getElementById("profile-edit-modal");
    if (modal) {
      modal.style.display = "none";
    }

    if (window.location.pathname.includes("distributor_profile.html")) {
      window.location.href = "distributor_dashboard.html";
    } else {
      window.location.href = "dashboard.html";
    }
  } catch (e) {
    if (e.message !== "Handled Server Error") alert("request error");
  } finally {
    VisibleLoaderElement(false);
  }
  //profile_data.avatar_url = document.getElementById('member_insert-avatar_url').value;
}

/*___________________________________________________________________________________*/
// 事件相關

async function initProfileView() {
  console.log("Profile View Initializing...");

  // i18n 渲染
  const lang = window.localStorage.getItem("language") || "zh-tw";
  if (typeof renderTemplate === "function") {
    await renderTemplate(lang, "app");
  }

  // 顯示放最後 等都完成後
  showTemplate("app");

  // [新增] 移除靜態 Loading 遮罩
  // 初始載入交由 API 請求的 VisibleLoaderElement 管理

  // [優化] 統一事件委派與 Memory Leak 防護
  if (window._profilePageEventController)
    window._profilePageEventController.abort();
  window._profilePageEventController = new AbortController();
  const signal = window._profilePageEventController.signal;

  const navigateToDashboard = () => {
    if (window.location.pathname.includes("distributor_profile.html")) {
      window.location.href = "distributor_dashboard.html";
    } else {
      window.location.href = "dashboard.html";
    }
  };

  document.addEventListener(
    "click",
    (e) => {
      // 1. 確認更新
      if (e.target.closest("#profile_update-button-ok")) {
        e.preventDefault();
        UpdateProfileOne();
        return;
      }

      // 2. 關閉/取消按鈕 或 點擊背景
      if (
        e.target.closest("#profile-close-btn") ||
        e.target.closest("#profile-cancel-btn") ||
        e.target.id === "profile-edit-modal"
      ) {
        e.preventDefault();
        navigateToDashboard();
        return;
      }

      // 3. 密碼顯示切換 (限定 profile)
      const toggleBtn = e.target.closest(
        "[id^='profile'][id*='password'][id$='-toggle']",
      );
      if (toggleBtn) {
        const container = toggleBtn.parentElement;
        const input = container.querySelector("input");
        const icon = toggleBtn.querySelector("img");
        if (input && icon) {
          const isPassword = input.type === "password";
          input.type = isPassword ? "text" : "password";
          icon.src = isPassword
            ? "assets/images/passwordeyeopen.svg"
            : "assets/images/passwordeyeclose.svg";
          e.stopImmediatePropagation();
        }
        return;
      }
    },
    { signal },
  );

  GotoPageUpdateProfileOne();
}

// -----------------------------------------------------------
// 依賴狀態管理：確保核心函式庫載入後才執行
// -----------------------------------------------------------
function startProfileApp() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProfileView);
  } else {
    initProfileView();
  }
}

if (window._CoreLoaded) {
  startProfileApp();
} else {
  window.addEventListener("CoreDependenciesReady", startProfileApp);
}
