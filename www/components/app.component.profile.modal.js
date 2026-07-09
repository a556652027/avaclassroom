// Profile Modal Component

// [Phase 3 優化] 加入 Promise 快取，防止重複載入
let _profileModalPromise = null;

// 載入 profile modal HTML
async function loadProfileModal() {
  if (_profileModalPromise) return _profileModalPromise;
  _profileModalPromise = (async () => {
    try {
      const response = await fetch("components/app.component.profile.modal.html");
      const html = await response.text();

      // 找到合適的容器插入 modal
      const container = document.getElementById("app") || document.body;
      const modalContainer = document.createElement("div");
      modalContainer.innerHTML = html;
      container.appendChild(modalContainer);

      // 渲染多語言文字
      const currentLang = localStorage.getItem("language") || "zh-tw";
      if (typeof renderTemplate === "function") {
        await renderTemplate(currentLang, "profile-edit-modal");
      }

      console.log("✅ Profile modal component loaded");

      // [修正] HTML 載入完成後立即初始化事件，確保動態載入時也能運作
      if (window.ProfileModal && typeof window.ProfileModal.init === "function") {
        window.ProfileModal.init();
      }
    } catch (error) {
      console.error("❌ Failed to load profile modal component:", error);
      _profileModalPromise = null; // 失敗時重置
    }
  })();
  return _profileModalPromise;
}

// -----------------------------------------------------------
// 依賴狀態管理：確保核心函式庫與 DOM 皆載入後再初始化
// -----------------------------------------------------------
function startProfileModalComponent() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadProfileModal);
  } else {
    loadProfileModal();
  }
}

if (window._CoreLoaded) {
  startProfileModalComponent();
} else {
  window.addEventListener("CoreDependenciesReady", startProfileModalComponent);
}

// API 功能：讀取個人資料
async function SelectProfileOne() {
  let profile_cid = Cyberspace.Client.getUsername();

  if (typeof VisibleLoaderElement === "function") {
    VisibleLoaderElement(true);
  }

  try {
    const json_object = await apiCall(CsRequestProfileSelectOne, profile_cid);

    let record = json_object.records;
    const setValueIfExists = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.value = value || "";
    };

    setValueIfExists("profile_update-member_cid", record.member_cid[0]);
    setValueIfExists("profile_update-password", record.password[0]);
    setValueIfExists("profile_update-member_name", record.member_name[0]);
    setValueIfExists("profile_update-gender", record.gender[0]);
    setValueIfExists("profile_update-record_state", record.record_state[0]);
    setValueIfExists(
      "profile_update-birthday",
      record.birthday[0].split(" ")[0],
    );
    setValueIfExists("profile_update-phone_cell", record.phone_cell[0]);
    setValueIfExists("profile_update-phone_home", record.phone_home[0]);
    setValueIfExists("profile_update-phone_work", record.phone_work[0]);
    setValueIfExists("profile_update-email", record.email[0]);
    setValueIfExists("profile_update-country", record.country[0]);
    setValueIfExists("profile_update-city", record.city[0]);
    setValueIfExists("profile_update-address", record.address[0]);
    setValueIfExists("profile_update-note00", record.note00[0]);
  } catch (e) {
    if (e.message !== "Handled Server Error") alert("request error");
  } finally {
    if (typeof VisibleLoaderElement === "function") {
      VisibleLoaderElement(false);
    }
  }
}

// API 功能：更新個人資料
async function UpdateProfileOne() {
  const getValueIfExists = (id) => {
    const element = document.getElementById(id);
    return element ? element.value : "";
  };

  var profile_data = Object.create(ProfileData);
  profile_data.member_cid = getValueIfExists("profile_update-member_cid");

  // 處理密碼更新邏輯
  let newPassword = getValueIfExists("profile_update-new_password");
  let confirmPassword = getValueIfExists("profile_update-confirm_password");

  if (newPassword && newPassword !== confirmPassword) {
    alert("新密碼與確認密碼不符");
    return;
  } else if (newPassword && newPassword === confirmPassword) {
    profile_data.password = newPassword;
  } else {
    profile_data.password = getValueIfExists("profile_update-password");
  }

  profile_data.member_name = getValueIfExists("profile_update-member_name");
  profile_data.gender = getValueIfExists("profile_update-gender");
  profile_data.record_state = getValueIfExists("profile_update-record_state");
  profile_data.birthday = getValueIfExists("profile_update-birthday");
  profile_data.phone_cell = getValueIfExists("profile_update-phone_cell");
  profile_data.phone_home = getValueIfExists("profile_update-phone_home");
  profile_data.phone_work = getValueIfExists("profile_update-phone_work");
  profile_data.email = getValueIfExists("profile_update-email");
  profile_data.address = getValueIfExists("profile_update-address");
  profile_data.city = getValueIfExists("profile_update-city");
  profile_data.country = getValueIfExists("profile_update-country");
  profile_data.note00 = getValueIfExists("profile_update-note00");

  if (typeof VisibleLoaderElement === "function") {
    VisibleLoaderElement(true);
  }

  try {
    await apiCall(CsRequestProfileUpdateOne, profile_data);
    if (typeof GetLocalData === "function") {
      alert(GetLocalData("common.success"));
    } else {
      alert("更新成功");
    }
    ProfileModal.hide();
  } catch (e) {
    if (e.message !== "Handled Server Error") alert("request error");
  } finally {
    if (typeof VisibleLoaderElement === "function") {
      VisibleLoaderElement(false);
    }
  }
}

// Profile Modal 控制函數
window.ProfileModal = {
  // 顯示 modal
  show: async function () {
    // [Phase 3 優化] 確保 DOM 載入完成才嘗試抓取節點
    await loadProfileModal();

    const modal = document.getElementById("profile-edit-modal");
    if (modal) {
      // 先等待 API 取回資料並填入完畢後，再將 Modal 顯示出來，防止畫面閃爍
      if (typeof SelectProfileOne === "function") {
        await SelectProfileOne();
      }
      modal.style.display = "flex";
    }
  },

  // 隱藏 modal
  hide: function () {
    const modal = document.getElementById("profile-edit-modal");
    if (modal) {
      modal.style.display = "none";
    }
  },

  // 初始化事件監聽器
  init: function () {
    if (window._profileEventController) window._profileEventController.abort();
    window._profileEventController = new AbortController();
    const signal = window._profileEventController.signal;

    document.addEventListener(
      "click",
      function (e) {
        // 1. 攔截：關閉與取消按鈕
        if (
          e.target.closest("#profile-close-btn") ||
          e.target.closest("#profile-cancel-btn")
        ) {
          e.preventDefault();
          ProfileModal.hide();
          return;
        }

        // 2. 攔截：儲存按鈕
        if (e.target.closest("#profile_update-button-ok")) {
          e.preventDefault();
          if (typeof UpdateProfileOne === "function") UpdateProfileOne();
          return;
        }

        // 3. 攔截：密碼顯示/隱藏切換
        // 限定只攔截 profile 相關的按鈕，避免與 Member 模組衝突造成雙重切換
        const toggleBtn = e.target.closest(
          ".password-toggle, [id^='profile'][id*='password'][id$='-toggle']",
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
            e.stopImmediatePropagation(); // 阻止事件繼續傳遞給其他模組
          }
          return;
        }
      },
      { signal },
    );

    console.log("✅ Profile modal events initialized");
  },
};
