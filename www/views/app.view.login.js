// login.html 的頁面事件操控程式碼相關

const params = new URLSearchParams(window.location.search);
const defUser = params.get("user");

//_____________________________________________________________________________________
// function 相關

// [新增] 安全跳轉處理：確保 Phase 2 (例如 pagecontainer) 載入完成再切換，避免 FOUC 或報錯
function safeChangePage(targetUrl) {
  // [修復] 徹底移除不穩定的 Phase2Ready 事件等待機制，防止事件錯過而引發跳轉死結 (Deadlock)
  if (typeof change_page === "function") {
    change_page(targetUrl);
  } else {
    window.location.href = targetUrl;
  }
}

function GotoPageLogin() {
  safeChangePage("login.html");
}

function GotoPageResetPassword() {
  safeChangePage("page02");
}

// [新增] 動態載入腳本的輔助函式 (取代不穩定的 WriteIncludeRelativeScript)
function loadScript(src, callback) {
  if (document.querySelector(`script[src="${src}"]`)) {
    if (callback) callback();
    return;
  }
  const script = document.createElement("script");
  script.src = src;
  script.type = "text/javascript";
  script.onload = callback;
  script.onerror = (e) => console.error(`Failed to load script: ${src}`, e);
  document.head.appendChild(script);
}

// [整合] 語言切換功能
window.changeLanguage = function (lang) {
  console.log("切換語言到: " + lang);
  const languageSelector = document.getElementById("language-selector");
  if (languageSelector) languageSelector.style.display = "none";
  window.localStorage.setItem("language", lang);
  window.location.reload();
};

// [整合] 初始化語言選單與密碼開關
function initLoginUI() {
  const languageToggle = document.getElementById("language-toggle");
  const languageSelector = document.getElementById("language-selector");

  if (languageToggle && languageSelector) {
    languageToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      if (
        languageSelector.style.display === "none" ||
        languageSelector.style.display === ""
      ) {
        languageSelector.style.display = "block";
      } else {
        languageSelector.style.display = "none";
      }
    });
    document.addEventListener("click", function () {
      languageSelector.style.display = "none";
    });
  }

  const passwordToggle = document.getElementById("password-eye-toggle");
  const passwordInput = document.getElementById("login_password");
  const passwordIcon = document.getElementById("password-eye-icon");

  if (passwordToggle && passwordInput && passwordIcon) {
    passwordToggle.addEventListener("click", function () {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        passwordIcon.src = "assets/images/passwordeyeopen.svg";
      } else {
        passwordInput.type = "password";
        passwordIcon.src = "assets/images/passwordeyeclose.svg";
      }
    });
  }
}

// [強化版方案 A] 顯示組織選擇彈窗
function showCompanySelectModal(records, onSelect) {
  // 1. 建立遮罩
  const overlay = document.createElement("div");
  overlay.id = "company-select-overlay";
  overlay.style.cssText =
    'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); z-index:100000; display:flex; align-items:center; justify-content:center; font-family: "Microsoft JhengHei", sans-serif;';

  // 2. 建立視窗本體
  const modal = document.createElement("div");
  modal.style.cssText =
    "background:white; border-radius:20px; width:450px; max-width:90%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); overflow: hidden;";

  // 注入動畫 CSS
  if (!document.getElementById("modal-animation-css")) {
    const style = document.createElement("style");
    style.id = "modal-animation-css";
    style.textContent = `@keyframes modalSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`;
    document.head.appendChild(style);
  }

  // [優化] 新增品牌色標題列
  const header = document.createElement("div");
  header.style.cssText =
    "background: linear-gradient(90deg, #4A90E2 0%, #214F7C 100%); padding: 20px 30px;";
  modal.appendChild(header);

  const title = document.createElement("h3");
  title.textContent = window.localeData.login.select_org_title;
  title.style.cssText =
    "margin:0; color:white; text-align:left; font-size:20px; font-weight:bold;";
  header.appendChild(title);

  const content = document.createElement("div");
  content.style.cssText = "padding: 25px 30px 30px 30px;";
  modal.appendChild(content);

  const listContainer = document.createElement("div");
  listContainer.style.cssText =
    "max-height:350px; overflow-y:auto; margin-bottom:25px; border:1px solid #E5E8EA; border-radius:12px; background:#F9FAFB; padding:5px;";

  // 解析 Tablesi 格式 (Column-Oriented)
  let groupCids =
    records && Array.isArray(records.group_cid) ? records.group_cid : [];
  let groupNames =
    records && Array.isArray(records.group_name) ? records.group_name : [];

  console.log("[Debug] Parsed Groups:", groupCids);

  if (groupCids.length === 0) {
    const noData = document.createElement("div");
    noData.textContent = window.localeData.login.no_org_msg;
    noData.style.cssText =
      "text-align:center; padding:40px 20px; color:#898C94; font-size:15px;";
    listContainer.appendChild(noData);
  } else {
    groupCids.forEach((cid, index) => {
      const name = groupNames[index] || cid;
      const item = document.createElement("div");
      item.style.cssText =
        "padding:16px; cursor:pointer; border-radius:10px; margin-bottom:4px; transition: all 0.2s; display:flex; flex-direction:column; gap:4px; background:white; border:1px solid transparent;";
      item.innerHTML = `<span style="color:#1A1C1E; font-weight:600; font-size:16px;">${HtmlUtil.escape(name)}</span><span style="color:#6C727A; font-size:13px;">ID: ${HtmlUtil.escape(cid)}</span>`;

      item.onmouseover = () => {
        item.style.background = "#F1F4F8";
        item.style.borderColor = "#92BFFF";
        item.style.transform = "translateX(5px)";
      };
      item.onmouseout = () => {
        item.style.background = "white";
        item.style.borderColor = "transparent";
        item.style.transform = "translateX(0)";
      };
      item.onclick = () => {
        document.body.removeChild(overlay);
        onSelect(cid);
      };
      listContainer.appendChild(item);
    });
  }
  content.appendChild(listContainer);

  const footer = document.createElement("div");
  footer.style.cssText = "display:flex; justify-content:center;";
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = window.localeData.login.enter_personal_dashboard;
  cancelBtn.style.cssText =
    "padding:12px 30px; border-radius:30px; border:1px solid #D9DDE3; background:white; cursor:pointer; color:#404040; font-size:14px; font-weight:600; transition:all 0.2s;";
  cancelBtn.onmouseover = () => {
    cancelBtn.style.background = "#214F7C";
    cancelBtn.style.color = "white";
    cancelBtn.style.borderColor = "#214F7C";
  };
  cancelBtn.onmouseout = () => {
    cancelBtn.style.background = "white";
    cancelBtn.style.color = "#404040";
    cancelBtn.style.borderColor = "#D9DDE3";
  };
  cancelBtn.onclick = () => {
    document.body.removeChild(overlay);
    onSelect(null);
  };
  footer.appendChild(cancelBtn);
  content.appendChild(footer);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// [強化版方案 A] 獲取組織列表，並自動選擇字母排序後的第一家公司作為預設 (不再彈出 dialog)
function fetchTier2Organizations(username, callback) {
  console.log("[方案 A] 開始獲取組織列表，User:", username);

  // [參考 sidebar.js] 確保模組已載入後，使用標準 API 函式
  if (typeof CsRequestGroupSelectAllRecordsByCondition === "function") {
    // [修正] 補足參數：(condition_type, condition_value, index, count, callback)
    CsRequestGroupSelectAllRecordsByCondition(
      "owner_cid",
      username,
      0,
      999,
      function (ok, result) {
        if (!ok) {
          console.error("[方案 A] API 請求失敗");
          VisibleLoaderElement(false);
          callback(null);
          return;
        }
        try {
          let json = JSON.parse(result);
          console.log("[方案 A] 模組 API 回傳:", json);
          
          let records = json.records || {};
          if (records && records.group_cid && records.group_cid.length > 0) {
            let keyInfo = ["group_name", "group_cid"];
            let companyArray = TablesiToTableii(keyInfo, records);
            let companies = companyArray.map((companyRow, index) => {
              let orgName = String(companyRow[0] || "").trim();
              let orgCid = String(companyRow[1] || "").trim();
              let displayName = orgName !== "" ? orgName : orgCid;
              let recordState = "1";
              if (records.record_state && records.record_state[index]) {
                recordState = records.record_state[index];
              }
              return {
                displayName: displayName,
                cid: orgCid,
                state: recordState,
              };
            });

            // 過濾掉已刪除、空 CID 以及學校群組
            companies = companies.filter((c) => c.state !== "0" && c.cid !== "" && !c.cid.startsWith("sch_"));

            // 按照字母排序 (與 sidebar 的排序邏輯完全一致)
            companies.sort((a, b) => {
              return a.displayName.localeCompare(b.displayName, undefined, {
                sensitivity: "base",
              });
            });

            if (companies.length > 0) {
              const firstCid = companies[0].cid;
              const firstName = companies[0].displayName;
              console.log(`[方案 A] 自動選取排序後的第一間公司: ${firstName} (${firstCid})`);
              
              // [儲存] 該公司的中文顯示名稱，確保 dashboard 標題正常渲染
              window.sessionStorage.setItem("select_group_name", firstName);
              window.sessionStorage.setItem("company_group_name", firstName);
              
              callback(firstCid);
              return;
            }
          }
          
          callback(null);
        } catch (e) {
          console.error("[方案 A] 解析或選擇第一家公司失敗:", e);
          VisibleLoaderElement(false);
          callback(null);
        }
      },
    );
  } else {
    console.error("[方案 A] 找不到組織模組函式，請確認模組是否載入");
    VisibleLoaderElement(false);
    callback(null);
  }
}

function SubmitLogin() {
  // [防禦性檢查] 確保元素存在再讀取值
  const userEl = document.getElementById("login_username");
  const rememberEl = document.getElementById("remember_me");

  let login_username = userEl ? userEl.value : "";
  let is_remember_username = rememberEl ? rememberEl.checked : false;

  if (is_remember_username) {
    window.localStorage.setItem("member_cid", login_username);
  } else {
    window.localStorage.removeItem("member_cid");
  }

  // 開啟loading dialog
  VisibleLoaderElement(true);

  const passwordEl = document.getElementById("login_password");
  if (!passwordEl) {
    console.error("找不到密碼輸入框元素");
    VisibleLoaderElement(false);
    return;
  }

  // [優化] 移除不必要的 setTimeout 延遲，立即執行登入請求
  CsRequestLogin(login_username, passwordEl.value, function (ok, result) {
    // [修正] 1. 優先檢查 API 連線狀態
    if (!ok) {
      VisibleLoaderElement(false);
      alert("無法連接伺服器，請檢查網路連線。");
      return;
    }

    // [修正] 2. 擴大 try-catch 範圍，捕獲所有可能的邏輯錯誤
    try {
      let json_object = JSON.parse(result);

      if (json_object.errno < 0) {
        VisibleLoaderElement(false);
        alert("帳號密碼錯誤!");
        return;
      }

      // 嘗試執行可能出錯的輔助函式
      try {
        listCookiesOnConsole();
      } catch (e) {
        console.warn("Cookie log failed", e);
      }

      // -----------------------------------------------------------
      // [關鍵修復]：將後端回傳的重要資訊存入 sessionStorage
      // -----------------------------------------------------------

      // 1. 儲存當前登入的會員帳號
      window.sessionStorage.setItem("member_cid", login_username);

      // [新增] 儲存 Session Token 供後端 Filter 校驗
      if (json_object.session_token) {
        window.sessionStorage.setItem(
          "session_token",
          json_object.session_token,
        );
      } else if (json_object.session_id) {
        window.sessionStorage.setItem("session_token", json_object.session_id);
      } else if (json_object.session_uid) {
        window.sessionStorage.setItem("session_token", json_object.session_uid);
      }

      // 2. 儲存組織 ID
      if (json_object.group_cid) {
        window.sessionStorage.setItem("group_cid", json_object.group_cid);
        window.sessionStorage.setItem("login_group_cid", json_object.group_cid);
      } else if (json_object.group_uid) {
        // 備用：有時候後端欄位名稱可能是 group_uid
        window.sessionStorage.setItem("group_cid", json_object.group_uid);
        window.sessionStorage.setItem("login_group_cid", json_object.group_uid);
      }

      // 3. 儲存產品類型
      if (json_object.product_type) {
        window.sessionStorage.setItem("product_type", json_object.product_type);
      }

      // [新增] 4. 儲存擁有的產品清單與預設產品 (配合後端 API 升級)
      let defaultProduct = "avacast"; // 預設防呆
      let rawProds = json_object.owned_products || (json_object.records && json_object.records.owned_products);
      if (rawProds) {
        // [終極防護] 攤平巢狀陣列，確保資料格式絕對正確
        let prods = Array.isArray(rawProds) ? rawProds.flat(Infinity) : [];
        window.sessionStorage.setItem("owned_products", JSON.stringify(prods));
        if (prods.length > 0) defaultProduct = prods[0];
      }
      if (json_object.default_product) {
        defaultProduct = json_object.default_product;
        window.sessionStorage.setItem("default_product", defaultProduct);
      }

      // -----------------------------------------------------------

      // 根據權限等級決定跳轉頁面
      // 先設定 select_group_cid，確保 dashboard 讀取正確
      let currentGroupCid = window.sessionStorage.getItem("group_cid");
      window.sessionStorage.setItem("select_group_cid", currentGroupCid);

      // [修正] 強化型別判斷，確保數字或字串都能正確識別
      const userTier = String(json_object.tier || json_object.level_uid);

      // [新增] 將 tier 存入 sessionStorage 供後續頁面判斷權限
      window.sessionStorage.setItem("tier", userTier);

      if (userTier === "3") {
        // 跳轉前不關閉 Loader，由新頁面載入後接手處理，避免畫面閃爍
        safeChangePage(`dashboard.html?product=${defaultProduct}`);
      } else if (userTier === "2") {
        // [強化版方案 A] 攔截跳轉，彈出選擇視窗
        fetchTier2Organizations(login_username, (selectedCid) => {
          if (selectedCid) {
            // 同步更新 SessionStorage
            window.sessionStorage.setItem("select_group_cid", selectedCid);
            window.sessionStorage.setItem("group_cid", selectedCid);

            // [動態 Navbar 重繪] 取得使用者所選公司的真實產品權限
            if (typeof CsRequestGroupGetOwnedProducts === "function") {
              CsRequestGroupGetOwnedProducts(selectedCid, function (ok, result) {
                if (ok && result) {
                  try {
                    const resJson = JSON.parse(result);

                    if (Number(resJson.errno) >= 0) {
                      let rawProds = resJson.owned_products || (resJson.records && resJson.records.owned_products);
                      
                      // [終極防護] 攤平巢狀陣列
                      let prods = Array.isArray(rawProds) ? rawProds.flat(Infinity) : [];
                      
                      window.sessionStorage.setItem("owned_products", JSON.stringify(prods));
                      const finalDefaultProduct = resJson.default_product || (prods.length > 0 ? prods[0] : "avacast");
                      window.sessionStorage.setItem("default_product", finalDefaultProduct);
                      safeChangePage(`dashboard.html?product=${finalDefaultProduct}`);
                      return;
                    }
                  } catch (e) { console.error("Parse err", e); }
                }
                // [防呆修復] 發生錯誤時強制覆寫 Session，確保 Navbar 至少有基礎產品
                console.warn("[Login] GetOwnedProducts API failed, using fallback.");
                window.sessionStorage.setItem("owned_products", JSON.stringify(["avacast"]));
                window.sessionStorage.setItem("default_product", "avacast");
                safeChangePage(`dashboard.html?product=avacast`);
              });
              return;
            }
          }
          // 無論是否有選（點取消則用預設），都進入 dashboard
          safeChangePage(`dashboard.html?product=${defaultProduct}`);
        });
      } else {
        // 預設跳轉，避免卡在登入頁
        // 跳轉前不關閉 Loader，確保視覺連續性
        safeChangePage(`dashboard.html?product=${defaultProduct}`);
      }
    } catch (e) {
      // [修正] 3. 捕獲所有未預期的錯誤，確保 Loader 關閉
      console.error("Login Process Error:", e);
      VisibleLoaderElement(false);
      alert("登入過程中發生錯誤，請稍後再試。");
    }
  });
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

// 初始化整個 View 的函數，確保相依性載入後才執行
async function initLoginView() {
  console.log("Login View Initializing...");

  // 1. i18n 渲染 (必須在 Core Dependencies 載入後執行)
  const lang = window.localStorage.getItem("language") || "zh-tw";
  if (typeof renderTemplate === "function") {
    await renderTemplate(lang, "app");
  }

  // [新增] 進入登入頁面時，強制清除 SessionStorage，防止殘留狀態
  window.sessionStorage.clear();

  // 顯示放最後 等都完成後
  if (typeof showTemplate === "function") {
    showTemplate("app");
  }

  // [新增] 初始化 UI 互動邏輯
  initLoginUI();

  // [新增] 移除靜態 Loading 遮罩
  if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(false);

  // [修正] 改用 loadScript 動態載入組織模組，避免 WriteIncludeRelativeScript 報錯
  loadScript("modules/app.module.organization.js", () => {
    console.log("Organization module loaded successfully");
  });

  // 幫忙填入 之前的 帳號
  let member_cid = null;
  if (defUser != null) {
    member_cid = defUser;
  } else {
    member_cid = window.localStorage.getItem("member_cid");
  }

  if (member_cid && document.getElementById("login_username")) {
    document.getElementById("login_username").value = member_cid;
    const rememberMeCheckbox = document.getElementById("remember_me");
    if (rememberMeCheckbox) {
      rememberMeCheckbox.checked = true;
    }
  }

  // [記憶體優化] 避免全域事件重複綁定
  if (window._loginEventController) window._loginEventController.abort();
  window._loginEventController = new AbortController();
  const signal = window._loginEventController.signal;

  // [修正] 改用事件委派 (Event Delegation) 解決按鈕可能尚未渲染的問題
  document.addEventListener(
    "click",
    (e) => {
      const loginBtn = e.target.closest("#Login");
      if (loginBtn) {
        console.log("send login (delegated)");
        e.preventDefault();
        SubmitLogin();
        return;
      }

      const resetBtn = e.target.closest("#reset_password");
      if (resetBtn) {
        console.log("goto reset_password (delegated)");
        e.preventDefault();
        GotoPageResetPassword();
        return;
      }

      const resetSendBtn = e.target.closest("#reset_password-send");
      if (resetSendBtn) {
        e.preventDefault();
        SubmitResetPassword();
        return;
      }

      const resetCancelBtn = e.target.closest("#reset_password-cancel");
      if (resetCancelBtn) {
        e.preventDefault();
        safeChangePage("page01");
        return;
      }
    },
    { signal },
  );

  // 針對密碼框的 Enter 鍵監聽
  document.addEventListener(
    "keyup",
    (e) => {
      if (e.target && e.target.id === "login_password") {
        console.log("keyup password (delegated)");
        e.preventDefault();
        if (e.key === "Enter") {
          SubmitLogin();
        }
      }
    },
    { signal },
  );

  if (typeof CsRequestLogout === "function") {
    CsRequestLogout();
  }
}

// -----------------------------------------------------------
// 依賴狀態管理：確保核心函式庫載入後才綁定 DOMContentLoaded
// -----------------------------------------------------------
function startLoginApp() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLoginView);
  } else {
    initLoginView();
  }
}

if (window._CoreLoaded) {
  startLoginApp();
} else {
  window.addEventListener("CoreDependenciesReady", startLoginApp);
}
