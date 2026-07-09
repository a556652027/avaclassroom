console.log("add count Loaded");

function getAddCountHtml() {
  return `
  <div class="container">
      <form action="" class="form-box">
        <!-- 標題列 -->
        <div class="form-header">
          <div class="header-left">
            <img src="assets/images/add new_button.svg" alt="" />
            <h1>新增帳號</h1>
          </div>
          <img src="assets/images/X.svg" class="close-btn" alt="" />
        </div>

        <!-- 表單欄位 -->
        <div class="form-grid">
          <!-- 用戶名稱 -->
          <div class="form-field">
            <label>用戶名稱</label>
            <input type="text" placeholder="請輸入您的用戶名稱" />
          </div>

          <!-- 電子信箱 -->
          <div class="form-field">
            <label>電子信箱</label>
            <input type="text" placeholder="請輸入您的電子郵件" />
          </div>

          <!-- 輸入密碼 -->
          <div class="form-field password-toggle">
            <label>輸入密碼</label>
            <div class="input-wrapper">
              <input
                type="password"
                class="password-input"
                placeholder="請輸入您的密碼"
              />
              <span class="toggle-eye">
                <img
                  src="assets/images/passwordeyeclose.svg"
                  alt="顯示/隱藏密碼"
                  class="eye-icon"
                />
              </span>
            </div>
          </div>

          <!-- 再次輸入密碼 -->
          <div class="form-field password-toggle">
            <label>再次輸入密碼</label>
            <div class="input-wrapper">
              <input
                type="password"
                class="password-input"
                placeholder="請再次輸入密碼"
              />
              <span class="toggle-eye">
                <img
                  src="assets/images/passwordeyeclose.svg"
                  alt="顯示/隱藏密碼"
                  class="eye-icon"
                />
              </span>
            </div>
          </div>
        </div>

        <!-- 按鈕 -->
        <div class="form-actions">
          <button type="button" class="btn cancel">取消</button>
          <button type="submit" class="btn save">新增並寄送郵件給用戶</button>
        </div>
      </form>
    </div>
  `;
}

(function () {
  // 檢查 CSS 是否已經載入，避免重複載入
  if (
    !document.querySelector(
      'link[href="components/app.component.frame.add-count.css"]',
    )
  ) {
    var add_count_link = document.createElement("link");
    add_count_link.rel = "stylesheet";
    add_count_link.type = "text/css";
    add_count_link.href = "components/app.component.frame.add-count.css";
    document.getElementsByTagName("head")[0].appendChild(add_count_link);
  }
})();

function initAddCountComponent() {
  const container = document.getElementById("add-count-container");
  if (container) {
    container.innerHTML = getAddCountHtml();
  }

  // [優化] 使用事件委派處理密碼顯示切換
  if (window._addCountEventController) window._addCountEventController.abort();
  window._addCountEventController = new AbortController();

  document.addEventListener(
    "click",
    (e) => {
      const eyeIcon = e.target.closest(".eye-icon");
      if (eyeIcon) {
        const wrapper = eyeIcon.closest(".password-toggle");
        const input = wrapper ? wrapper.querySelector(".password-input") : null;
        if (input) {
          const isHidden = input.type === "password";
          input.type = isHidden ? "text" : "password";
          eyeIcon.src = isHidden
            ? "assets/images/passwordeyeopen.svg"
            : "assets/images/passwordeyeclose.svg";
        }
      }
    },
    { signal: window._addCountEventController.signal },
  );
}

// -----------------------------------------------------------
// 依賴狀態管理：確保核心函式庫載入後才執行
// -----------------------------------------------------------
function startAddCountComponent() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAddCountComponent);
  } else {
    initAddCountComponent();
  }
}

if (window._CoreLoaded) {
  startAddCountComponent();
} else {
  window.addEventListener("CoreDependenciesReady", startAddCountComponent);
}
