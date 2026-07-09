async function initResetPasswordView() {
  // [新增] 移除靜態 Loading 遮罩
  if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(false);

  // 1. Render Template
  const lang = window.localStorage.getItem("language") || "zh-tw";
  if (typeof renderTemplate === "function") {
    await renderTemplate(lang, "app");
    showTemplate("app");
  } else {
    console.error("renderTemplate not found");
    document.getElementById("app").style.visibility = "visible";
  }

  // Helper to get locale string safely
  function t(key) {
    if (
      window.localeData &&
      window.localeData.reset_password &&
      window.localeData.reset_password[key]
    ) {
      return window.localeData.reset_password[key];
    }
    return key; // Fallback
  }

  // 2. Original Logic with Multi-language support
  const params = new URLSearchParams(window.location.search);
  const user = params.get("user") || params.get("member_cid"); // Support member_cid if that's what backend sends

  const tempPassword = params.get("password");
  const expiration = params.get("expiration");

  const emailDisplay = document.getElementById("email-display");
  const infoBox = document.getElementById("infoBox");
  const msgBox = document.getElementById("msgBox");
  const btnConfirm = document.getElementById("update-btn");

  var json_user = null;
  var member_data = null;

  btnConfirm.disabled = true;

  // If using reset_token (future proofing or if C++ changed)
  const resetToken = params.get("reset_token");

  // Logic for handling reset_token
  if (resetToken) {
    // [Phase 3 資安強化] 使用 textContent 避免 XSS
    infoBox.textContent = t("parsing_link");
    msgBox.textContent = t("verifying");

    try {
      // [修正] 改為 async/await 流程控制，不再使用 setTimeout，並保留原有邏輯
      const verifyRes = await new Promise((resolve, reject) => {
        CsRequestVerifyResetToken(resetToken, (ok, res) => {
          if (!ok) reject(new Error("Network error"));
          else resolve(JSON.parse(res));
        });
      });

      json_user = verifyRes;

      if (json_user.errno < 0) {
        // e.g. -1084 Expired
        if (json_user.errno == -1084) {
          alert(t("link_expired"));
          msgBox.textContent = t("link_expired");
        } else {
          alert(t("invalid_link"));
          msgBox.textContent = t("invalid_link");
        }
        return;
      }

      // 驗證成功，獲取用戶詳細資訊
      const userCid =
        json_user.member_cid || window.sessionStorage.getItem("member_cid");
      if (!userCid) {
        alert("Error: Could not retrieve user ID.");
        return;
      }

      const memberRes = await new Promise((resolve, reject) => {
        CsRequestMemberSelectOneRecordByMemberCID(userCid, (ok, res) => {
          if (!ok) reject(new Error("Network error"));
          else resolve(JSON.parse(res));
        });
      });

      if (memberRes.errno < 0) {
        alert(t("failed"));
        return;
      }

      const record = memberRes.records;
      if (!record || !record.member_cid || record.member_cid.length === 0) {
        return;
      }

      member_data = Object.assign({}, MemberData);
      Object.keys(record).forEach((key) => {
        if (record[key] && record[key][0] !== undefined) {
          member_data[key] = record[key][0];
        }
      });

      emailDisplay.textContent = member_data.email;
      btnConfirm.disabled = false;

      // 更新 Header 標題
      const headerTitle = document.getElementById("headerTitle");
      let headerTmpl = t("header_title_with_user");
      if (headerTmpl && headerTmpl.includes("{{user}}")) {
        headerTitle.textContent = headerTmpl.replace(
          "{{user}}",
          member_data.member_cid,
        );
      } else {
        headerTitle.textContent =
          t("header_title") + " " + member_data.member_cid;
      }

      infoBox.style.display = "none";
      msgBox.textContent = t("verified");
    } catch (e) {
      console.error("Token verification failed:", e);
      msgBox.textContent = t("invalid_link");
      alert(t("invalid_link"));
    }
  } else {
    // [Phase 3 資安強化] 對動態文字進行 HTML 轉義
    if (!resetToken) {
      infoBox.innerHTML = `<span class="error">${HtmlUtil.escape(t("invalid_link"))}</span>`;
    }
  }

  if (window._resetPwdEventController) window._resetPwdEventController.abort();
  window._resetPwdEventController = new AbortController();

  btnConfirm.addEventListener(
    "click",
    async () => {
      const newPassword = document.getElementById("new-password").value.trim();
      const repeatPassword = document
        .getElementById("repeat-password")
        .value.trim();

      if (newPassword.length < 8) {
        alert(t("password_too_short"));
        return;
      }
      if (newPassword !== repeatPassword) {
        alert(t("password_mismatch"));
        return;
      }

      msgBox.textContent = t("updating");

      member_data.password = newPassword;

      try {
        const updateRes = await new Promise((resolve, reject) => {
          CsRequestMemberUpdateOneRecordByMemberCID(member_data, (ok, res) => {
            if (!ok) reject(new Error("Network error"));
            else resolve(JSON.parse(res));
          });
        });

        if (updateRes.errno < 0) {
          alert(t("failed"));
          return;
        }

        msgBox.textContent = t("success_redirect");

        // 根據權限等級決定跳轉頁面
        const currentGroupCid = window.sessionStorage.getItem("group_cid");
        window.sessionStorage.setItem("select_group_cid", currentGroupCid);

        // 統一導向儀表板，由 dashboard 內部判斷使用者權限與顯示 UI
        change_page("dashboard.html");
      } catch (e) {
        console.error("Password update failed:", e);
        alert(t("failed"));
      }
    },
    { signal: window._resetPwdEventController.signal },
  );
}

// -----------------------------------------------------------
// 依賴狀態管理：確保核心函式庫載入後才執行
// -----------------------------------------------------------
function startResetPasswordApp() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initResetPasswordView);
  } else {
    initResetPasswordView();
  }
}

if (window._CoreLoaded) {
  startResetPasswordApp();
} else {
  window.addEventListener("CoreDependenciesReady", startResetPasswordApp);
}
