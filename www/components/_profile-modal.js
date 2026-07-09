console.log("Profile Modal Component Loaded");

// 創建 Profile 模態框的 HTML 結構
function getProfileModalHtml() {
  // 使用 GetLocalData 函數獲取國際化文字
  const getText = (key) => GetLocalData(key) || key;

  return `
    <!-- Profile 設定彈出表單 -->
    <div id="profile-modal" class="modal" style="display: none;">
      <div class="modal-content">
        <div style="display: flex; justify-content: space-between; padding: 1rem 1rem 0rem 1rem;">
          <div style="display: flex; gap: 1rem; align-items: center;">
            <img src="assets/images/帳戶.svg" alt="" style="width: 24px; height: 24px;" />
            <div class="modal-header">
              <h2>${getText("profile.title_update_profile")}</h2>
            </div>
          </div>
          <span class="close" id="profile-modal-close">&times;</span>
        </div>

        <div class="modal-body">
          <form id="profile-update-form">
            <div class="form-row">
              <div class="form-group">
                <label for="profile_update-member_cid">${getText(
                  "member.member_cid"
                )}</label>
                <input
                  id="profile_update-member_cid"
                  type="text"
                  name="profile_update-member_cid"
                  placeholder="${getText("member.member_cid")}..."
                  required
                />
              </div>
              <div class="form-group">
                <label for="profile_update-email">${getText(
                  "member.email"
                )}</label>
                <input
                  id="profile_update-email"
                  type="email"
                  name="profile_update-email"
                  placeholder="${getText("member.email")}..."
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="profile_update-member_name">${getText(
                  "member.member_name"
                )}</label>
                <input
                  id="profile_update-member_name"
                  type="text"
                  name="profile_update-member_name"
                  placeholder="${getText("member.member_name")}..."
                  required
                />
              </div>
              <div class="form-group" style="display:none">
                <label for="profile_update-gender">${getText(
                  "member.gender"
                )}</label>
                <input
                  id="profile_update-gender"
                  type="text"
                  name="profile_update-gender"
                  placeholder="${getText("member.gender")}..."
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="profile_update-password">${getText(
                  "member.password"
                )}</label>
                <input
                  id="profile_update-password"
                  type="password"
                  name="profile_update-password"
                  placeholder="${getText("member.password")}..."
                  required
                />
              </div>
              ${
                /* 這邊 有用 visibility的消失 可以用於 讓他介面上消失 但還在 */ ""
              }
              <div class="form-group" style="visibility: hidden;">
                <label for="profile_update-password-confirm">確認${getText(
                  "member.password"
                )}</label>
                <input
                  id="profile_update-password-confirm"
                  type="password"
                  name="profile_update-password-confirm"
                  placeholder="確認${getText("member.password")}..."
                />
              </div>
            </div>

            <h4 style="margin-bottom:1rem">變更密碼</h4>

            <div class="form-row" style="display:none">>
              <div class="form-group">
                <label for="profile_update-birthday">${getText(
                  "member.birthday"
                )}</label>
                <input
                  id="profile_update-birthday"
                  type="date"
                  name="profile_update-birthday"
                />
              </div>
              <div class="form-group">
                <label for="profile_update-phone_cell">${getText(
                  "member.phone_cell"
                )}</label>
                <input
                  id="profile_update-phone_cell"
                  type="tel"
                  name="profile_update-phone_cell"
                  placeholder="${getText("member.phone_cell")}..."
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="profile_update-address">${getText(
                  "member.new_password"
                )}</label>
                <input
                  id="profile_update-address"
                  type="text"
                  name="profile_update-address"
                  placeholder="${getText("member.new_password")}..."
                  required
                />
              </div>
              <div class="form-group">
                <label for="profile_update-address">${getText(
                  "member.new_password_comfirm"
                )}</label>
                <input
                  id="profile_update-address"
                  type="text"
                  name="profile_update-address"
                  placeholder="${getText("member.new_password_comfirm")}..."
                  required
                />
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button
            id="profile_update-button-cancel"
            class="modal-cancel-btn"
            type="button"
          >
            ${getText("common.cancel")}
          </button>
          <button
            id="profile_update-button-ok"
            class="modal-ok-btn"
            type="submit"
            form="profile-update-form"
          >
            ${getText("common.save")}
          </button>
        </div>
      </div>
    </div>
    `;
}

// 創建 Profile 模態框的 CSS 樣式
function getProfileModalCss() {
  return `
    <style id="profile-modal-styles">
      /* Profile 模態框樣式 */
      .modal {
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .modal-content {
        background-color: #fefefe;
        margin: 0;
        border-radius: 10px;
        width: 80%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }

      .modal-header {
        background-color: #ffffff;
        border-radius: 10px 10px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .modal-header h2 {
        margin: 0;
        color: #333;
        font-size: 1.5rem;
      }

      .close {
        color: #aaa;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
        line-height: 1;
      }

      .close:hover,
      .close:focus {
        color: #000;
      }

      .modal-body {
        padding: 1rem 1rem;
      }

      .modal-footer {
        padding-right: 1rem;
        padding-bottom: 1rem;
        border-radius: 0 0 10px 10px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }

      /* 表單樣式 */
      .form-row {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
      }

      .form-group {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .form-group.full-width {
        flex: 1;
      }

      .form-group label {
        margin-bottom: 5px;
        font-weight: 500;
        color: #333;
      }

      .form-group input {
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 14px;
      }

      .form-group input:focus {
        border-color: #214f7c;
        outline: none;
        box-shadow: 0 0 0 2px rgba(33, 79, 124, 0.1);
      }

      .modal-cancel-btn {
        background-color: #ffffff;
        border: 1px solid #e5e8ea;
        padding: 4px 48px;
        border-radius: 10px;
        cursor: pointer;
        height: 48px;
      }

      .modal-ok-btn {
        background-color: #214f7c;
        border-radius: 10px;
        padding: 4px 48px;
        border: none;
        color: #ffffff;
        height: 48px;
        cursor: pointer;
      }
    </style>
    `;
}

// 初始化 Profile 模態框
function initProfileModal() {
  // 檢查是否已經存在模態框
  if (document.getElementById("profile-modal")) {
    return;
  }

  // 添加 CSS 樣式（如果不存在）
  if (!document.getElementById("profile-modal-styles")) {
    document.head.insertAdjacentHTML("beforeend", getProfileModalCss());
  }

  // 添加 HTML 結構
  document.body.insertAdjacentHTML("beforeend", getProfileModalHtml());

  // 設置事件監聽器
  setupProfileModalEvents();
}

// 設置 Profile 模態框事件監聽器
function setupProfileModalEvents() {
  const modal = document.getElementById("profile-modal");
  const closeBtn = document.getElementById("profile-modal-close");
  const cancelBtn = document.getElementById("profile_update-button-cancel");

  if (!modal || !closeBtn || !cancelBtn) {
    console.error("Profile modal elements not found");
    return;
  }

  // 關閉模態框函數
  function closeProfileModal() {
    modal.style.display = "none";
    // 清空表單
    document.getElementById("profile-update-form").reset();
  }

  // 開啟模態框函數
  window.openProfileModal = function () {
    modal.style.display = "flex";
  };

  // 點擊關閉按鈕
  closeBtn.onclick = closeProfileModal;

  // 點擊取消按鈕
  cancelBtn.onclick = closeProfileModal;

  // 點擊模態框外部關閉
  window.onclick = function (event) {
    if (event.target == modal) {
      closeProfileModal();
    }
  };

  // ESC 鍵關閉模態框
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.style.display === "flex") {
      closeProfileModal();
    }
  });

  console.log("Profile modal events initialized");
}

// 當 DOM 載入完成後初始化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProfileModal);
} else {
  initProfileModal();
}
