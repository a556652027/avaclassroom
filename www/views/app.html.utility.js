//
//  這個專案的專用 html 配置檔
//
//
//
//
//
//

function check_logout(result) {
  var logout = false,
    isIDExist = false;
  var msgstring;

  switch (result.errno) {
    case QERRNO_NEED_SESSION_ID:
      {
        msgstring = "失敗: 請先登入驗證";
        logout = true;
      }
      break;
    case QERRNO_PERMISSION_DENY:
      {
        msgstring = "失敗: 權限不符，請重新登入";
        logout = true;
      }
      break;
    case QERRNO_LOGIN_TIMEOUT:
      {
        msgstring = "失敗: 登入逾時，請重新登入";
        logout = true;
      }
      break;
    case "-1012":
      msgstring = "重複ID";
      isIDExist = true;
      break;
  }

  if (logout) {
    loadingBox.hide();

    vm1.$alert(msgstring, "Error", {
      confirmButtonText: "OK",
      callback: (action) => {
        var next_page = "./login.html";
        window.location.href = next_page;
      },
    });
    return true;
  }
  if (isIDExist) {
    return "中文重複";
  }
  return false;
}

function check_errno(errno) {
  var logout = false;
  var msgstring;

  switch (errno) {
    case QERRNO_NEED_SESSION_ID:
      {
        msgstring = "失敗: 請先登入驗證";
        logout = true;
      }
      break;
    case QERRNO_PERMISSION_DENY:
      {
        msgstring = "失敗: 權限不符，請重新登入";
        logout = true;
      }
      break;
    case QERRNO_LOGIN_TIMEOUT:
      {
        msgstring = "失敗: 登入逾時，請重新登入";
        logout = true;
      }
      break;
  }

  if (logout) {
    loadingBox.hide();

    vm1.$alert(msgstring, "Error", {
      confirmButtonText: "OK",
      callback: (action) => {
        var next_page = "./login.html";
        window.location.href = next_page;
      },
    });
    return true;
  }
  return false;
}

function show_errno(errno) {
  // [優化] 統一攔截 Session 過期，防止在失效狀態下繼續操作
  if (
    errno == -1001 ||
    (typeof QERRNO_NEED_SESSION_ID !== "undefined" &&
      errno == QERRNO_NEED_SESSION_ID)
  ) {
    alert(
      window.localeData?.login?.session_expired || "連線逾時，請重新登入。",
    );
    window.location.href = "login.html";
    return "failure";
  }

  if (errno == -1079) {
    alert(GetLocalData("common.deny"));
    return "failure";
  }

  if (errno < 0) {
    alert(GetLocalData("common.failure"));
    return "failure";
  }

  return "";
}

// [Phase 3 優化] Loader 防閃爍最佳實踐 (延遲顯示 + 最少顯示時間 + 請求計數器)
const _loaderState = {
  activeRequests: 0,
  showTimer: null,
  hideTimer: null,
  fadeTimer: null,
  startTime: 0,
  isVisible: true, // [修復] HTML 預設靜態 Loader 是顯示狀態，所以初始為 true
  isInitialized: false, // [新增] 追蹤是否為首次執行
  DELAY_MS: 250, // 延遲 250ms 才顯示 (防極速 API 閃爍)
  MIN_DISPLAY_MS: 400, // 一旦顯示，至少停留 400ms (防半慢速 API 閃爍)
  FADE_OUT_MS: 300, // 對應 CSS 的 transition: 0.3s
};

function VisibleLoaderElement(is_visible) {
  const loader = document.getElementById("initial-loader");
  if (!loader) return;

  // [防呆] 首次執行時，同步真實的 DOM 時間點，避免初始畫面被強迫多等 400ms
  if (!_loaderState.isInitialized) {
    _loaderState.isInitialized = true;
    _loaderState.startTime = Date.now() - _loaderState.MIN_DISPLAY_MS;
  }

  if (is_visible) {
    _loaderState.activeRequests++;

    if (_loaderState.activeRequests === 1) {
      // 第一個請求進入，準備顯示
      clearTimeout(_loaderState.hideTimer);
      clearTimeout(_loaderState.fadeTimer);

      if (!_loaderState.isVisible) {
        _loaderState.showTimer = setTimeout(() => {
          loader.style.display = "flex";
          // 確保 display: flex 生效後才改變 opacity
          setTimeout(() => {
            loader.style.opacity = "1";
          }, 10);
          _loaderState.isVisible = true;
          _loaderState.startTime = Date.now();
        }, _loaderState.DELAY_MS);
      } else {
        // 如果剛好在淡出過程中又被呼叫顯示，立刻恢復
        loader.style.display = "flex";
        loader.style.opacity = "1";
      }
    }
  } else {
    _loaderState.activeRequests--;
    if (_loaderState.activeRequests < 0) _loaderState.activeRequests = 0;

    if (_loaderState.activeRequests === 0) {
      // 所有請求已完成，若還沒顯示則直接攔截
      clearTimeout(_loaderState.showTimer);

      if (_loaderState.isVisible) {
        const elapsed = Date.now() - _loaderState.startTime;
        const remaining = Math.max(0, _loaderState.MIN_DISPLAY_MS - elapsed);

        // 等待補足最少顯示時間後再隱藏
        _loaderState.hideTimer = setTimeout(() => {
          if (_loaderState.activeRequests === 0) {
            loader.style.opacity = "0";
            _loaderState.isVisible = false;

            _loaderState.fadeTimer = setTimeout(() => {
              if (_loaderState.activeRequests === 0) {
                loader.style.display = "none";
              }
            }, _loaderState.FADE_OUT_MS);
          }
        }, remaining);
      } else {
        // [絕對防護] 狀態為隱藏，確保 DOM 一定要乾淨關閉
        loader.style.opacity = "0";
        loader.style.display = "none";
      }
    }
  }
}
