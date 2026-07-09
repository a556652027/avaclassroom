//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

///////////////////////////////////////////////////////////////////////////////
//

//===============================================================================
// NAME :
// DESC : 使用者登入
//===============================================================================
function CsRequestLogin(member_cid, password, callback, abortController) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/member/login",
    {
      member_cid: member_cid,
      password: password,
    },
    (error, result) => {
      if (
        abortController &&
        abortController.signal &&
        abortController.signal.aborted
      )
        return;
      const json_object = JSON.parse(result);
      if (json_object.errno == "1") {
        Cyberspace.Client.setSession(
          json_object.session_token,
          member_cid,
          json_object.tier,
          json_object.level_uid,
          json_object.group_cid,
        );

        if (Object.keys(json_object.permissions).length != 0) {
          const paperLabel = json_object.permissions.paper_label;
          const paperValue = json_object.permissions.paper_value;
          let result = {};
          for (let i = 0; i < paperLabel.length; i++) {
            result[paperLabel[i]] = paperValue[i];
          }
          Cyberspace.Client.setPermission(result);
        }

        // [架構升級] 儲存後端動態計算的產品清單，供 Navbar 渲染使用
        if (json_object.owned_products) {
          window.sessionStorage.setItem("owned_products", JSON.stringify(json_object.owned_products));
          window.sessionStorage.setItem("default_product", json_object.default_product);
        }
      } else {
        Cyberspace.Client.clsSession();
      }

      if (callback) {
        // test
        // Success!
        // [資安優化] 不在 Console 印出含有 session token 的詳細 result
        Cyberspace.Client.DebugLog("Login Complete", "HIDDEN_FOR_SECURITY");
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 使用者登出
//===============================================================================
function CsRequestLogout() {
  if (window.Cyberspace && window.Cyberspace.Client) {
    Cyberspace.Client.clsSession();
  }
}

//===============================================================================
// NAME :
// DESC : 重設密碼
//===============================================================================
function CsRequestResetPassword(member_cid, email, callback, abortController) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/member/reset_password",
    {
      member_cid: member_cid,
      email: email,
    },
    (error, result) => {
      if (
        abortController &&
        abortController.signal &&
        abortController.signal.aborted
      )
        return;
      const json_object = JSON.parse(result);

      if (callback) {
        // test
        // Success!
        Cyberspace.Client.DebugLog("Login Result", result);
        callback(error, result);
      }
    },
    { abortController },
  );
}

//===============================================================================
// NAME :
// DESC : 驗證重設密碼 Token 並自動登入
//===============================================================================
function CsRequestVerifyResetToken(reset_token, callback, abortController) {
  if (!window.Cyberspace || !window.Cyberspace.Client) {
    if (callback) callback(new Error("Network Client not ready"), null);
    return;
  }

  Cyberspace.Client.SendRequest(
    "/ava_system/member/verify_reset_token",
    {
      reset_token: reset_token,
    },
    (error, result) => {
      if (
        abortController &&
        abortController.signal &&
        abortController.signal.aborted
      )
        return;
      const json_object = JSON.parse(result);
      if (json_object.errno == "1") {
        // 登入成功，設定 Session
        // 注意：後端必須回傳 member_cid
        const member_cid = json_object.member_cid;
        Cyberspace.Client.setSession(
          json_object.session_token,
          member_cid,
          json_object.tier,
          json_object.level_uid,
          json_object.group_cid,
        );

        if (
          json_object.permissions &&
          Object.keys(json_object.permissions).length != 0
        ) {
          const paperLabel = json_object.permissions.paper_label;
          const paperValue = json_object.permissions.paper_value;
          let permResult = {};
          if (paperLabel && paperValue) {
            for (let i = 0; i < paperLabel.length; i++) {
              permResult[paperLabel[i]] = paperValue[i];
            }
            Cyberspace.Client.setPermission(permResult);
          }
        }
      } else {
        Cyberspace.Client.clsSession();
      }

      if (callback) {
        // [資安優化] 不在 Console 印出含有 session token 的詳細 result
        Cyberspace.Client.DebugLog(
          "Verify Reset Token Complete",
          "HIDDEN_FOR_SECURITY",
        );
        callback(error, result);
      }
    },
    { abortController },
  );
}
