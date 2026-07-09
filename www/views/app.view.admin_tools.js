// 進階管理工具邏輯
console.log("Admin Tools View Initializing...");

let _g_reset_request_controller = null;
let _g_last_generated_keys = []; // 儲存上一批產生的金鑰，供作廢使用
let _g_last_product = "";
let _g_last_version = "";

function executeRebuildCache() {
  if (
    !confirm(
      "⚠️ 警告：此操作將會強制系統重新讀取資料庫，並重建所有記憶體快取。\n\n這個過程可能需要幾秒鐘，確定要執行嗎？",
    )
  ) {
    return;
  }

  if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(true);
  if (_g_reset_request_controller) _g_reset_request_controller.abort();
  _g_reset_request_controller = new AbortController();

  CsRequestRebuildCache(function (ok, result) {
    if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(false);
    if (!ok) {
      alert("API 請求失敗！請按 F12 查看詳細錯誤。");
      return;
    }
    try {
      const json_object = JSON.parse(result);
      // C++ API QERRNO_SUCCESS >= 0 代表成功
      if (json_object.errno && parseInt(json_object.errno) >= 0) {
        alert("系統快取重建成功！所有幽靈資料已清除。");
      } else {
        alert("重建失敗！\n錯誤碼：" + json_object.errno);
      }
    } catch (e) {
      console.error("解析回應失敗", e);
      alert("解析伺服器回應失敗");
    }
  }, _g_reset_request_controller);
}

function executeReset() {
  const cidInput = document.getElementById("test-license-cid");
  const countInput = document.getElementById("test-reset-count");

  const licenseCid = cidInput ? cidInput.value.trim() : "";
  const count = countInput ? countInput.value.trim() : "3";

  if (!licenseCid) {
    alert("請輸入要重置的金鑰序號！");
    return;
  }

  if (
    !confirm(`確定要將序號 [${licenseCid}] 的解綁次數重置為 ${count} 次嗎？`)
  ) {
    return;
  }

  // 開啟 Loading 畫面
  if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(true);

  if (_g_reset_request_controller) {
    _g_reset_request_controller.abort();
  }
  _g_reset_request_controller = new AbortController();

  CsRequestResetUnregCountProxy(
    licenseCid,
    count,
    function (ok, result) {
      // 關閉 Loading 畫面
      if (typeof VisibleLoaderElement === "function")
        VisibleLoaderElement(false);

      if (!ok) {
        alert(
          "API 請求失敗！\n\n可能原因：\n1. 登入逾時，請重新登入。\n2. 帳號權限不足 (非管理員)。\n3. Nginx 路由未通或伺服器錯誤。\n\n請按 F12 查看 Console 或 Network 了解詳細 HTTP 狀態碼。",
        );
        return;
      }

      try {
        const json_object = JSON.parse(result);
        // 檢查如果後端有實作 show_errno 的統一錯誤攔截
        if (
          typeof show_errno === "function" &&
          show_errno(json_object.errno) !== ""
        ) {
          return;
        }

        // 【邏輯修補】確實檢查 API 回傳的 result 狀態碼
        if (json_object.result === "0") {
          alert(`重置成功！序號 [${licenseCid}] 的次數已更新。`);
          cidInput.value = ""; // 成功後清空
        } else {
          alert(
            `重置失敗！\n狀態碼：${json_object.result}\n原因：${json_object.info}`,
          );
        }
      } catch (e) {
        console.error("解析回應失敗", e);
        alert("解析伺服器回應失敗");
      }
    },
    _g_reset_request_controller,
  );
}

function executeEnable() {
  const cidInput = document.getElementById("test-license-cid");
  const licenseCid = cidInput ? cidInput.value.trim() : "";

  if (!licenseCid) {
    alert("請輸入要啟用的金鑰序號！");
    return;
  }
  if (!confirm(`確定要【啟用】序號 [${licenseCid}] 嗎？`)) return;

  if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(true);
  if (_g_reset_request_controller) _g_reset_request_controller.abort();
  _g_reset_request_controller = new AbortController();

  CsRequestEnableKeyProxy(
    licenseCid,
    function (ok, result) {
      if (typeof VisibleLoaderElement === "function")
        VisibleLoaderElement(false);
      if (!ok) {
        alert("API 請求失敗！請按 F12 查看詳細錯誤。");
        return;
      }
      try {
        const json_object = JSON.parse(result);
        if (json_object.result === "0") {
          alert(`啟用成功！序號 [${licenseCid}] 狀態已恢復為可用。`);
          cidInput.value = "";
        } else {
          alert(
            `啟用失敗！\n狀態碼：${json_object.result}\n原因：${json_object.info}`,
          );
        }
      } catch (e) {
        console.error("解析回應失敗", e);
      }
    },
    _g_reset_request_controller,
  );
}

function executeDisable() {
  const cidInput = document.getElementById("test-license-cid");
  const licenseCid = cidInput ? cidInput.value.trim() : "";

  if (!licenseCid) {
    alert("請輸入要停用的金鑰序號！");
    return;
  }
  if (
    !confirm(
      `警告：確定要【強制停用】序號 [${licenseCid}] 嗎？\n停用後客戶將無法使用該金鑰！`,
    )
  )
    return;

  if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(true);
  if (_g_reset_request_controller) _g_reset_request_controller.abort();
  _g_reset_request_controller = new AbortController();

  CsRequestDisableKeyProxy(
    licenseCid,
    function (ok, result) {
      if (typeof VisibleLoaderElement === "function")
        VisibleLoaderElement(false);
      if (!ok) {
        alert("API 請求失敗！請按 F12 查看詳細錯誤。");
        return;
      }
      try {
        const json_object = JSON.parse(result);
        if (json_object.result === "0") {
          alert(`停用成功！序號 [${licenseCid}] 狀態已設為失效。`);
          cidInput.value = "";
        } else {
          alert(
            `停用失敗！\n狀態碼：${json_object.result}\n原因：${json_object.info}`,
          );
        }
      } catch (e) {
        console.error("解析回應失敗", e);
      }
    },
    _g_reset_request_controller,
  );
}

function executeAddKey() {
  const product = document.getElementById("test-add-product")?.value.trim();
  const version = document.getElementById("test-add-version")?.value.trim();
  const key = document.getElementById("test-add-key")?.value.trim();
  const validDateInput = document.getElementById("test-add-valid-date")?.value;
  const duration = document.getElementById("test-add-duration")?.value.trim();
  const unregCount = document
    .getElementById("test-add-unreg-count")
    ?.value.trim();
  const appParam = document.getElementById("test-add-app-param")?.value.trim();

  if (
    !product ||
    !version ||
    !key ||
    !validDateInput ||
    !duration ||
    !unregCount ||
    !appParam
  ) {
    alert("請確實填寫所有新增金鑰的欄位！");
    return;
  }

  // 將 datetime-local (YYYY-MM-DDThh:mm) 轉為後端好解析的格式 (YYYY-MM-DD hh:mm:ss)
  const validDate = validDateInput.replace("T", " ") + ":00";

  if (
    !confirm(`確定要為產品 [${product} - ${version}] 新增金鑰\n[${key}] 嗎？`)
  )
    return;

  if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(true);
  if (_g_reset_request_controller) _g_reset_request_controller.abort();
  _g_reset_request_controller = new AbortController();

  CsRequestAddKeyProxy(
    product,
    version,
    key,
    validDate,
    duration,
    unregCount,
    appParam,
    function (ok, result) {
      if (typeof VisibleLoaderElement === "function")
        VisibleLoaderElement(false);
      if (!ok) {
        alert("API 請求失敗！請按 F12 查看詳細錯誤。");
        return;
      }
      try {
        const json_object = JSON.parse(result);
        if (json_object.result === "0") {
          alert(`配發成功！金鑰 [${key}] 已成功寫入系統。`);
          document.getElementById("test-add-key").value = ""; // 清空金鑰欄位防呆
        } else {
          alert(
            `配發失敗！\n狀態碼：${json_object.result}\n原因：${json_object.info}`,
          );
        }
      } catch (e) {
        console.error("解析回應失敗", e);
      }
    },
    _g_reset_request_controller,
  );
}

function executeBulkGenKey() {
  const product = document.getElementById("test-bulk-product")?.value.trim();
  const version = document.getElementById("test-bulk-version")?.value.trim();
  const license = document.getElementById("test-bulk-license")?.value.trim();
  const amount = parseInt(
    document.getElementById("test-bulk-amount")?.value.trim(),
    10,
  );
  const resultBox = document.getElementById("test-bulk-result");
  const revokeBtn = document.getElementById("btn-execute-bulk-revoke");

  if (!product || !version) {
    alert("產品名稱與版本為必填！");
    return;
  }
  if (isNaN(amount) || amount < 1 || amount > 100) {
    alert("產生數量必須介於 1 到 100 之間！");
    return;
  }

  if (
    !confirm(
      `即將為產品 [${product} - ${version}] 批次產生 ${amount} 組金鑰。\n確定要執行嗎？`,
    )
  )
    return;

  if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(true);
  if (_g_reset_request_controller) _g_reset_request_controller.abort();
  _g_reset_request_controller = new AbortController();

  resultBox.value = "生產中，請稍候...";
  if (revokeBtn) revokeBtn.style.display = "none";
  _g_last_generated_keys = [];
  _g_last_product = product;
  _g_last_version = version;

  CsRequestBulkGenKeyProxy(
    product,
    version,
    license,
    "",
    amount,
    function (ok, result) {
      if (typeof VisibleLoaderElement === "function")
        VisibleLoaderElement(false);
      if (!ok) {
        alert("API 請求失敗！請按 F12 查看詳細錯誤。");
        resultBox.value = "請求失敗。";
        return;
      }
      try {
        const json_object = JSON.parse(result);
        if (json_object.result === "0") {
          const keys = json_object.info; // 後端傳回的陣列
          const actualLicense = json_object.license; // 自動產生的母鑰

          _g_last_generated_keys = keys;
          if (revokeBtn && keys.length > 0) revokeBtn.style.display = "block";

          alert(`生產成功！共產生 ${keys.length} 組金鑰。`);
          document.getElementById("test-bulk-license").value = actualLicense;
          resultBox.value = keys.join("\n");
        } else {
          alert(`生產失敗！\n原因：${json_object.info}`);
          resultBox.value = `錯誤：${json_object.info}`;
        }
      } catch (e) {
        console.error("解析回應失敗", e);
        resultBox.value = "解析伺服器回應失敗。";
      }
    },
    _g_reset_request_controller,
  );
}

function executeBulkRevoke() {
  if (_g_last_generated_keys.length === 0) return;

  if (
    !confirm(
      `【危險操作】確定要作廢剛剛為 [${_g_last_product}] 產生的 ${_g_last_generated_keys.length} 組金鑰嗎？\n此動作會將金鑰設為停用，並退還授權額度。\n請注意：如果金鑰已經交給客戶，他們將無法使用！`,
    )
  )
    return;

  if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(true);
  if (_g_reset_request_controller) _g_reset_request_controller.abort();
  _g_reset_request_controller = new AbortController();

  const resultBox = document.getElementById("test-bulk-result");
  const revokeBtn = document.getElementById("btn-execute-bulk-revoke");

  CsRequestBulkRevokeProxy(
    _g_last_product,
    _g_last_version,
    _g_last_generated_keys,
    function (ok, result) {
      if (typeof VisibleLoaderElement === "function")
        VisibleLoaderElement(false);
      if (!ok) {
        alert("API 請求失敗！請按 F12 查看詳細錯誤。");
        return;
      }
      try {
        const json_object = JSON.parse(result);
        if (json_object.result === "0") {
          alert(json_object.info); // 顯示退還的額度與數量
          resultBox.value = "";
          _g_last_generated_keys = []; // 清空緩存
          if (revokeBtn) revokeBtn.style.display = "none";
        } else {
          alert(`作廢失敗！\n原因：${json_object.info}`);
        }
      } catch (e) {
        console.error("解析回應失敗", e);
      }
    },
    _g_reset_request_controller,
  );
}

function executeAddProduct() {
  const productInput = document.getElementById("test-new-product-name");
  const versionInput = document.getElementById("test-new-product-version");
  const duration = document
    .getElementById("test-new-product-duration")
    ?.value.trim();
  const quota = document.getElementById("test-new-product-quota")?.value.trim();
  const validDateInput = document.getElementById(
    "test-new-product-valid-date",
  )?.value;
  const pubkeyBox = document.getElementById("test-new-product-pubkey");

  const product = productInput ? productInput.value.trim() : "";
  const version = versionInput ? versionInput.value.trim() : "";

  // 清空上一次的公鑰紀錄，防呆
  if (pubkeyBox) pubkeyBox.value = "";

  if (!product || !version || !duration || !quota || !validDateInput) {
    alert("請確實填寫所有產品線欄位！");
    return;
  }

  // 【資安防護】正規表達式：僅允許英數字與底線/減號，防止特殊字元破壞資料庫或未來路徑讀取
  const nameRegex = /^[A-Za-z0-9_-]+$/;
  if (!nameRegex.test(product) || !nameRegex.test(version)) {
    alert("產品名稱與版本僅允許輸入「英文字母、數字、減號 (-) 與底線 (_)」！");
    return;
  }

  // 將 HTML 的 datetime-local 格式 (T) 轉換為 MySQL/Rails 可解析的標準時間
  const validDate = validDateInput.replace("T", " ") + ":00";

  if (
    !confirm(
      `【重要】確定要建立新產品線 [${product} - ${version}] 嗎？\n建立後系統將自動配發高強度 RSA/AES 金鑰。`,
    )
  )
    return;

  if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(true);
  if (_g_reset_request_controller) _g_reset_request_controller.abort();
  _g_reset_request_controller = new AbortController();

  CsRequestAddProductProxy(
    product,
    version,
    duration,
    quota,
    validDate,
    function (ok, result) {
      if (typeof VisibleLoaderElement === "function")
        VisibleLoaderElement(false);
      if (!ok) {
        alert("API 請求失敗！請按 F12 查看詳細錯誤。");
        return;
      }
      try {
        const json_object = JSON.parse(result);
        if (json_object.result === "0") {
          alert(
            `建立成功！\n產品 [${product}-${version}] 已註冊完畢。\n\n請務必複製下方顯示的 RSA 公鑰，交給 C++ 專案開發人員。`,
          );
          // 【安全顯示】使用 .value 賦值而非 innerHTML，完美防堵 XSS (Cross-Site Scripting)
          if (pubkeyBox) pubkeyBox.value = json_object.public_key;
          if (productInput) productInput.value = "";
          if (versionInput) versionInput.value = "";
        } else {
          alert(`建立失敗！\n原因：${json_object.info}`);
        }
      } catch (e) {
        console.error("解析回應失敗", e);
      }
    },
    _g_reset_request_controller,
  );
}

function executeDeleteProduct() {
  const productInput = document.getElementById("test-new-product-name");
  const versionInput = document.getElementById("test-new-product-version");

  const product = productInput ? productInput.value.trim() : "";
  const version = versionInput ? versionInput.value.trim() : "";

  if (!product || !version) {
    alert("請先輸入要移除的「產品名稱」與「版本」！");
    return;
  }

  if (
    !confirm(
      `【危險操作】確定要移除產品線 [${product} - ${version}] 嗎？\n(注意：系統將會自動檢查，若該產品已產生過金鑰則無法刪除)`,
    )
  ) {
    return;
  }

  if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(true);
  if (_g_reset_request_controller) _g_reset_request_controller.abort();
  _g_reset_request_controller = new AbortController();

  CsRequestDeleteProductProxy(
    product,
    version,
    function (ok, result) {
      if (typeof VisibleLoaderElement === "function")
        VisibleLoaderElement(false);
      if (!ok) {
        alert("API 請求失敗！請按 F12 查看詳細錯誤。");
        return;
      }
      try {
        const json_object = JSON.parse(result);
        if (json_object.result === "0") {
          alert(json_object.info);
          if (productInput) productInput.value = "";
          if (versionInput) versionInput.value = "";
        } else {
          alert(`移除失敗！\n原因：${json_object.info}`);
        }
      } catch (e) {
        console.error("解析回應失敗", e);
      }
    },
    _g_reset_request_controller,
  );
}

async function initAdminToolsView() {
  console.log("Admin Tools View Initializing...");

  // 1. 執行多國語系渲染
  const lang = window.localStorage.getItem("language") || "zh-tw";
  if (typeof renderTemplate === "function") {
    await renderTemplate(lang, "app");
  }

  // 2. 更新標題
  document.title =
    (GetLocalData("sidebarnav.admin_tools") || "Admin Tools") + " - LMS";

  // 3. 顯示主畫面
  if (typeof showTemplate === "function") {
    showTemplate("app");
  }

  // 【資安防護 - 路由越權檢查】 (Broken Access Control 防護)
  const tier = window.sessionStorage.getItem("tier");
  if (tier !== "0" && tier !== "1") {
    alert("無權限訪問此頁面！");
    window.location.href = "dashboard.html";
    return;
  }

  // 【架構修補】使用框架標準 API 切換並顯示預設頁面
  if (typeof change_page === "function") {
    change_page("page01");
  }

  // 強制隱藏全域 Loading 動畫，確保內容不受阻擋
  if (typeof VisibleLoaderElement === "function") {
    VisibleLoaderElement(false);
  } else {
    const loader = document.getElementById("initial-loader");
    if (loader) loader.style.display = "none";
  }

  // 綁定按鈕事件
  const btnRebuildCache = document.getElementById("btn-execute-rebuild-cache");
  if (btnRebuildCache)
    btnRebuildCache.addEventListener("click", executeRebuildCache);

  const btnSubmit = document.getElementById("btn-execute-reset");
  if (btnSubmit) btnSubmit.addEventListener("click", executeReset);

  const btnEnable = document.getElementById("btn-execute-enable");
  if (btnEnable) btnEnable.addEventListener("click", executeEnable);
  const btnDisable = document.getElementById("btn-execute-disable");
  if (btnDisable) btnDisable.addEventListener("click", executeDisable);

  const btnAddKey = document.getElementById("btn-execute-add");
  if (btnAddKey) btnAddKey.addEventListener("click", executeAddKey);

  const btnBulk = document.getElementById("btn-execute-bulk");
  if (btnBulk) btnBulk.addEventListener("click", executeBulkGenKey);

  const btnRevoke = document.getElementById("btn-execute-bulk-revoke");
  if (btnRevoke) btnRevoke.addEventListener("click", executeBulkRevoke);

  const btnAddProduct = document.getElementById("btn-execute-add-product");
  if (btnAddProduct) btnAddProduct.addEventListener("click", executeAddProduct);

  const btnDeleteProduct = document.getElementById(
    "btn-execute-delete-product",
  );
  if (btnDeleteProduct)
    btnDeleteProduct.addEventListener("click", executeDeleteProduct);
}

// -----------------------------------------------------------
// 依賴狀態管理：確保核心函式庫載入後才綁定 DOMContentLoaded
// -----------------------------------------------------------
function startAdminToolsApp() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdminToolsView);
  } else {
    initAdminToolsView();
  }
}

if (window._CoreLoaded) {
  startAdminToolsApp();
} else {
  window.addEventListener("CoreDependenciesReady", startAdminToolsApp);
}
