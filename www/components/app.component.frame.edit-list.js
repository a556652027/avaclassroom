console.log("list Loaded");

function getEditListHtml() {
  return `<div class="container">
      <form action="" class="form-box">
        <!-- 標題列 -->
        <div class="form-header">
          <div class="header-left">
            <img src="assets/images/add new_button.svg" alt="" />
            <span>編輯訂單資訊</span>
          </div>
          <img src="assets/images/X.svg" class="close-btn" alt="" />
        </div>
        <!-- 表單區塊 -->
        <div class="form-grid">
          <!-- 下單日 -->
          <div class="form-field" style= "display: flex; flex-direction: column;">
            <label for="order-date">下單日</label>
            <input type="date" id="order-date" class="date-input" />
          </div>

          <!-- 授權日期 -->
          <div class="form-field flex-row">
            <div style
             ="display: flex; flex-direction: column; margin-right: 1rem;">
              <label for="auth-start">授權日期</label>
              <input type="date" id="auth-start" class="date-input" />
            </div>
             <div style
             ="display: flex; flex-direction: column; margin-right: 1rem;">
              <label for="auth-end">到期日期</label>
              <input type="date" id="auth-end" class="date-input" />
            </div>
          </div>

          <!-- 數量 -->
          <div class="form-field" style
           ="display: flex; flex-direction: column;">
            <label>數量</label>
            <input type="text" placeholder="請輸入數量" class="text-input" />
          </div>

          <!-- 備註 -->
          <div class="form-field" style
           ="display: flex; flex-direction: column;">
            <label for="notes-input">備註</label>
            <textarea
              id="notes-input"
              placeholder="可在此輸入備註......"
              class="textarea-input"
            ></textarea>
          </div>

          <!-- 附件 -->
          <div class="form-field" style
           ="display: flex; flex-direction: column;">
            <label for="fileUpload">附件</label>
            <div style = "width: 100%;">
              <input type="file" id="fileUpload" class="hidden" />
              <label for="fileUpload" class="upload-trigger">
                <img src="/assets/images/upload (2).svg" alt="">
                <span style="color: #404040;">將文件拖曳至此處或</span>
                <span>選擇要上傳的文件</span>
              </label>

              <!-- 上傳中 -->
              <div id="uploading" class="uploading">
                <div class="progress-bar"></div>
                <p>上傳中……</p>
              </div>

              <!-- 上傳完成 -->
              <div id="uploaded" class="uploaded">
                <img src="assets/pdf.svg" alt="PDF" />
                <button id="removeFile">移除附件</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 按鈕 -->
        <div class="form-actions">
          <button type="button" class="btn cancel">取消</button>
          <button type="submit" class="btn save">儲存</button>
        </div>
      </form>
    </div>`;
}

//讀入css
(function () {
  // 檢查 CSS 是否已經載入，避免重複載入
  if (
    !document.querySelector(
      'link[href="components/app.component.frame.edit-list.css"]',
    )
  ) {
    var edit_link = document.createElement("link");
    edit_link.rel = "stylesheet";
    edit_link.type = "text/css";
    edit_link.href = "components/app.component.frame.edit-list.css";
    document.getElementsByTagName("head")[0].appendChild(edit_link);
  }
})();

// 插入 HTML 到容器的函數
function insertEditListHtml() {
  const container = document.getElementById("edit-list-container");
  if (container && !container.innerHTML.trim()) {
    container.innerHTML = getEditListHtml();
    console.log("Edit list HTML inserted successfully");
  }
}

// -----------------------------------------------------------
// 依賴狀態管理：確保核心函式庫載入後才執行
// -----------------------------------------------------------
function startEditListComponent() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", insertEditListHtml);
  } else {
    insertEditListHtml();
  }
}

if (window._CoreLoaded) {
  startEditListComponent();
} else {
  window.addEventListener("CoreDependenciesReady", startEditListComponent);
}
