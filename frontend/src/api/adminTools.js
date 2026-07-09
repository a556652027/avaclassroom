//  (原 www/modules/app.module.admin_tools.js 原封搬移)
import { Cyberspace } from '@/core/net'

// 獨立測試用的 API 模組
console.log("Reset Unreg Module loaded");

//===============================================================================
// NAME : CsRequestRebuildCache
// DESC : 呼叫 C++ API 重建系統快取 (清除幽靈資料)
//===============================================================================
export function CsRequestRebuildCache(callback, abortController) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(false, null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/system/rebuild_cache",
    { action: "rebuild" }, // [防呆] 加上一個 dummy 參數，避免 HTTP Parser 因為空物件而漏接 session_token
    (error, result) => {
      if (
        abortController &&
        abortController.signal &&
        abortController.signal.aborted
      )
        return;
      if (callback) callback(error, result);
    },
    { abortController },
  );
}

//===============================================================================
// NAME : CsRequestResetUnregCountProxy
// DESC : 【架構升級】前端直接呼叫 Rails API (跨庫驗證)，省去 C++ 轉發
//===============================================================================
export function CsRequestResetUnregCountProxy(
  license_cid,
  count,
  callback,
  abortController,
) {
  const session_token = window.sessionStorage.getItem("session_token");
  if (!session_token) {
    alert("驗證失敗：找不到登入狀態，請重新登入！");
    if (callback) callback(false, null);
    return;
  }

  const payload = {
    key: license_cid,
    count: count,
    session_token: session_token, // 帶上 Token 給 Rails 驗證
  };

  fetch("/backend/reset_unreg_count", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Token": session_token,
    },
    body: JSON.stringify(payload),
    signal: abortController ? abortController.signal : undefined,
  })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (callback) callback(true, JSON.stringify(data));
    })
    .catch((error) => {
      console.error("API 請求失敗:", error);
      if (callback) callback(false, null);
    });
}

//===============================================================================
// NAME : CsRequestDisableKeyProxy
// DESC : 呼叫 Rails API 停用金鑰
//===============================================================================
export function CsRequestDisableKeyProxy(license_cid, callback, abortController) {
  const session_token = window.sessionStorage.getItem("session_token");
  if (!session_token) {
    alert("驗證失敗：找不到登入狀態，請重新登入！");
    if (callback) callback(false, null);
    return;
  }
  const payload = { key: license_cid, session_token: session_token };

  fetch("/backend/disable_key", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Token": session_token,
    },
    body: JSON.stringify(payload),
    signal: abortController ? abortController.signal : undefined,
  })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (callback) callback(true, JSON.stringify(data));
    })
    .catch((error) => {
      console.error("API 請求失敗:", error);
      if (callback) callback(false, null);
    });
}

//===============================================================================
// NAME : CsRequestEnableKeyProxy
// DESC : 呼叫 Rails API 啟用金鑰
//===============================================================================
export function CsRequestEnableKeyProxy(license_cid, callback, abortController) {
  const session_token = window.sessionStorage.getItem("session_token");
  if (!session_token) {
    alert("驗證失敗：找不到登入狀態，請重新登入！");
    if (callback) callback(false, null);
    return;
  }
  const payload = { key: license_cid, session_token: session_token };

  fetch("/backend/enable_key", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Token": session_token,
    },
    body: JSON.stringify(payload),
    signal: abortController ? abortController.signal : undefined,
  })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (callback) callback(true, JSON.stringify(data));
    })
    .catch((error) => {
      console.error("API 請求失敗:", error);
      if (callback) callback(false, null);
    });
}

//===============================================================================
// NAME : CsRequestAddKeyProxy
// DESC : 呼叫 Rails API 新增金鑰
//===============================================================================
export function CsRequestAddKeyProxy(
  product,
  version,
  key,
  valid_date,
  duration,
  unreg_count,
  app_param,
  callback,
  abortController,
) {
  const session_token = window.sessionStorage.getItem("session_token");
  if (!session_token) {
    alert("驗證失敗：找不到登入狀態，請重新登入！");
    if (callback) callback(false, null);
    return;
  }

  const payload = {
    product: product,
    version: version,
    key: key,
    valid_date: valid_date,
    duration: duration,
    unreg_count: unreg_count,
    app_param: app_param,
    session_token: session_token,
  };

  fetch("/backend/add_key", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Token": session_token,
    },
    body: JSON.stringify(payload),
    signal: abortController ? abortController.signal : undefined,
  })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (callback) callback(true, JSON.stringify(data));
    })
    .catch((error) => {
      console.error("API 請求失敗:", error);
      if (callback) callback(false, null);
    });
}
//===============================================================================
// NAME : CsRequestBulkGenKeyProxy
// DESC : 呼叫 Rails API 批次產生金鑰
//===============================================================================
export function CsRequestBulkGenKeyProxy(
  product,
  version,
  license,
  model,
  amount,
  callback,
  abortController,
) {
  const session_token = window.sessionStorage.getItem("session_token");
  if (!session_token) {
    alert("驗證失敗：找不到登入狀態，請重新登入！");
    if (callback) callback(false, null);
    return;
  }

  const payload = {
    product: product,
    version: version,
    license: license,
    model: model,
    amount: amount,
    session_token: session_token,
  };

  fetch("/backend/bulk_genkey", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Token": session_token,
    },
    body: JSON.stringify(payload),
    signal: abortController ? abortController.signal : undefined,
  })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (callback) callback(true, JSON.stringify(data));
    })
    .catch((error) => {
      console.error("API 請求失敗:", error);
      if (callback) callback(false, null);
    });
}

//===============================================================================
// NAME : CsRequestBulkRevokeProxy
// DESC : 呼叫 Rails API 批次作廢金鑰並退還額度
//===============================================================================
export function CsRequestBulkRevokeProxy(
  product,
  version,
  keysArray,
  callback,
  abortController,
) {
  const session_token = window.sessionStorage.getItem("session_token");
  if (!session_token) {
    alert("驗證失敗：找不到登入狀態，請重新登入！");
    if (callback) callback(false, null);
    return;
  }

  const payload = {
    product: product,
    version: version,
    keys: keysArray,
    session_token: session_token,
  };

  fetch("/backend/bulk_revoke", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Token": session_token,
    },
    body: JSON.stringify(payload),
    signal: abortController ? abortController.signal : undefined,
  })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (callback) callback(true, JSON.stringify(data));
    })
    .catch((error) => {
      console.error("API 請求失敗:", error);
      if (callback) callback(false, null);
    });
}

//===============================================================================
// NAME : CsRequestAddProductProxy
// DESC : 呼叫 Rails API 建立新產品線並取得公鑰
//===============================================================================
export function CsRequestAddProductProxy(
  product,
  version,
  duration,
  valid_count,
  valid_date,
  callback,
  abortController,
) {
  const session_token = window.sessionStorage.getItem("session_token");
  if (!session_token) {
    alert("驗證失敗：找不到登入狀態，請重新登入！");
    if (callback) callback(false, null);
    return;
  }

  const payload = {
    product: product,
    version: version,
    duration: duration,
    valid_count: valid_count,
    valid_date: valid_date,
    session_token: session_token,
  };

  fetch("/backend/add_product", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Token": session_token,
    },
    body: JSON.stringify(payload),
    signal: abortController ? abortController.signal : undefined,
  })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (callback) callback(true, JSON.stringify(data));
    })
    .catch((error) => {
      console.error("API 請求失敗:", error);
      if (callback) callback(false, null);
    });
}

//===============================================================================
// NAME : CsRequestDeleteProductProxy
// DESC : 呼叫 Rails API 安全移除產品線
//===============================================================================
export function CsRequestDeleteProductProxy(
  product,
  version,
  callback,
  abortController,
) {
  const session_token = window.sessionStorage.getItem("session_token");
  if (!session_token) {
    alert("驗證失敗：找不到登入狀態，請重新登入！");
    if (callback) callback(false, null);
    return;
  }

  const payload = {
    product: product,
    version: version,
    session_token: session_token,
  };

  fetch("/backend/delete_product", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Token": session_token,
    },
    body: JSON.stringify(payload),
    signal: abortController ? abortController.signal : undefined,
  })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (callback) callback(true, JSON.stringify(data));
    })
    .catch((error) => {
      console.error("API 請求失敗:", error);
      if (callback) callback(false, null);
    });
}
