// Distributor Profile Modal Component
// 載入 distributor profile modal HTML
(async function loadDistributorProfileModal() {
  try {
    const response = await fetch("components/app.component.distributor-profile.modal.html");
    const html = await response.text();

    // 找到合適的容器插入 modal
    const container = document.getElementById("app") || document.body;
    const modalContainer = document.createElement("div");
    modalContainer.innerHTML = html;
    container.appendChild(modalContainer);

    // 渲染多語言文字
    const currentLang = localStorage.getItem("language") || "zh-tw";
    if (typeof renderTemplate === "function") {
      renderTemplate(currentLang, "distributor-profile-edit-modal");
    }

    console.log("✅ Distributor profile modal component loaded");
  } catch (error) {
    console.error("❌ Failed to load distributor profile modal component:", error);
  }
})();

// API 功能：讀取個人資料
function SelectDistributorProfileOne() {
  let profile_cid = Cyberspace.Client.getUsername();

  if (typeof VisibleLoaderElement === "function") {
    VisibleLoaderElement(true);
  }

  setTimeout(function () {
    CsRequestProfileSelectOne(profile_cid, function (ok, result) {
      if (typeof VisibleLoaderElement === "function") {
        VisibleLoaderElement(false);
      }

      if (!ok) {
        alert("request error");
        return;
      }

      let json_object = JSON.parse(result);
      if (typeof show_errno === "function" && show_errno(json_object.errno) != "") {
        return;
      }

      // 填入資料到表單（使用 distributor 前綴的 ID）
      let record = json_object.records;
      const setValueIfExists = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.value = value || "";
      };

      setValueIfExists("distributor_profile_update-member_cid", record.member_cid[0]);
      setValueIfExists("distributor_profile_update-password", record.password[0]);
      setValueIfExists("distributor_profile_update-member_name", record.member_name[0]);
      setValueIfExists("distributor_profile_update-gender", record.gender[0]);
      setValueIfExists("distributor_profile_update-record_state", record.record_state[0]);
      setValueIfExists("distributor_profile_update-birthday", record.birthday[0].split(" ")[0]);
      setValueIfExists("distributor_profile_update-phone_cell", record.phone_cell[0]);
      setValueIfExists("distributor_profile_update-phone_home", record.phone_home[0]);
      setValueIfExists("distributor_profile_update-phone_work", record.phone_work[0]);
      setValueIfExists("distributor_profile_update-email", record.email[0]);
      setValueIfExists("distributor_profile_update-country", record.country[0]);
      setValueIfExists("distributor_profile_update-city", record.city[0]);
      setValueIfExists("distributor_profile_update-address", record.address[0]);
      setValueIfExists("distributor_profile_update-note00", record.note00[0]);
    });
  }, 500);
}

// API 功能：更新個人資料
function UpdateDistributorProfileOne() {
  const getValueIfExists = (id) => {
    const element = document.getElementById(id);
    return element ? element.value : "";
  };

  var profile_data = Object.create(ProfileData);
  profile_data.member_cid = getValueIfExists("distributor_profile_update-member_cid");

  // 處理密碼更新邏輯
  let newPassword = getValueIfExists("distributor_profile_update-new_password");
  let confirmPassword = getValueIfExists("distributor_profile_update-confirm_password");

  if (newPassword && newPassword !== confirmPassword) {
    alert("新密碼與確認密碼不符");
    return;
  } else if (newPassword && newPassword === confirmPassword) {
    profile_data.password = newPassword;
  } else {
    profile_data.password = getValueIfExists("distributor_profile_update-password");
  }

  profile_data.member_name = getValueIfExists("distributor_profile_update-member_name");
  profile_data.gender = getValueIfExists("distributor_profile_update-gender");
  profile_data.record_state = getValueIfExists("distributor_profile_update-record_state");
  profile_data.birthday = getValueIfExists("distributor_profile_update-birthday");
  profile_data.phone_cell = getValueIfExists("distributor_profile_update-phone_cell");
  profile_data.phone_home = getValueIfExists("distributor_profile_update-phone_home");
  profile_data.phone_work = getValueIfExists("distributor_profile_update-phone_work");
  profile_data.email = getValueIfExists("distributor_profile_update-email");
  profile_data.address = getValueIfExists("distributor_profile_update-address");
  profile_data.city = getValueIfExists("distributor_profile_update-city");
  profile_data.country = getValueIfExists("distributor_profile_update-country");
  profile_data.note00 = getValueIfExists("distributor_profile_update-note00");

  if (typeof VisibleLoaderElement === "function") {
    VisibleLoaderElement(true);
  }

  setTimeout(function () {
    CsRequestProfileUpdateOne(profile_data, function (ok, result) {
      if (typeof VisibleLoaderElement === "function") {
        VisibleLoaderElement(false);
      }

      if (!ok) {
        alert("request error");
        return;
      }

      let json_object = JSON.parse(result);
      if (typeof show_errno === "function" && show_errno(json_object.errno) != "") {
        return;
      }

      if (typeof GetLocalData === "function") {
        alert(GetLocalData("common.success"));
      } else {
        alert("更新成功");
      }

      // 隱藏 modal
      DistributorProfileModal.hide();
    });
  }, 500);
}

// Distributor Profile Modal 控制函數
window.DistributorProfileModal = {
  // 顯示 modal
  show: function () {
    const modal = document.getElementById("distributor-profile-edit-modal");
    if (modal) {
      modal.style.display = "flex";
      // 載入個人資料
      if (typeof SelectDistributorProfileOne === "function") {
        SelectDistributorProfileOne();
      }
    }
  },

  // 隱藏 modal
  hide: function () {
    const modal = document.getElementById("distributor-profile-edit-modal");
    if (modal) {
      modal.style.display = "none";
    }
  },

  // 初始化事件監聽器
  init: function () {
    // 關閉按鈕
    const closeBtn = document.getElementById("distributor-profile-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        DistributorProfileModal.hide();
      });
    }

    // 取消按鈕
    const cancelBtn = document.getElementById("distributor-profile-cancel-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        DistributorProfileModal.hide();
      });
    }

    // 儲存按鈕
    const saveBtn = document.getElementById("distributor_profile_update-button-ok");
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        if (typeof UpdateDistributorProfileOne === "function") {
          UpdateDistributorProfileOne();
        }
      });
    }


    // 密碼顯示/隱藏切換
    setupDistributorPasswordToggle(
      "distributor-profile-old-password-toggle",
      "distributor_profile_update-password",
      "distributor-profile-old-password-icon"
    );
    setupDistributorPasswordToggle(
      "distributor-profile-new-password-toggle",
      "distributor_profile_update-new_password",
      "distributor-profile-new-password-icon"
    );
    setupDistributorPasswordToggle(
      "distributor-profile-confirm-password-toggle",
      "distributor_profile_update-confirm_password",
      "distributor-profile-confirm-password-icon"
    );

    console.log("✅ Distributor profile modal events initialized");
  },
};

// 密碼顯示/隱藏切換函數
function setupDistributorPasswordToggle(toggleId, inputId, iconId) {
  const toggle = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  if (toggle && input && icon) {
    toggle.addEventListener("click", function () {
      if (input.type === "password") {
        input.type = "text";
        icon.src = "assets/images/passwordeyeopen.svg";
      } else {
        input.type = "password";
        icon.src = "assets/images/passwordeyeclose.svg";
      }
    });
  }
}

// 當 DOM 載入完成後初始化
document.addEventListener("DOMContentLoaded", function () {
  // 延遲初始化以確保 modal HTML 已載入
  setTimeout(function () {
    DistributorProfileModal.init();
  }, 500);
});
