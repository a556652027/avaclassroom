# AVA Orbital Admin 專案技術文檔

## 📋 目錄

1. [專案概述](#專案概述)
2. [專案架構](#專案架構)
3. [目錄結構](#目錄結構)
4. [核心技術棧](#核心技術棧)
5. [HTML 頁面結構](#html-頁面結構)
6. [CSS 樣式系統](#css-樣式系統)
7. [JavaScript 模組系統](#javascript-模組系統)
8. [API 通訊機制](#api-通訊機制)
9. [Components 組件系統](#components-組件系統)
10. [數據流與狀態管理](#數據流與狀態管理)
11. [路由與頁面導航](#路由與頁面導航)
12. [權限控制系統](#權限控制系統)
13. [多語言系統](#多語言系統)
14. [開發指南](#開發指南)

---

## 專案概述

**專案名稱**: AVA Orbital Admin (其實是 LMS)
**類型**: Web-based 管理後台系統
**用途**: 設備授權管理、用戶管理、組織管理、儀表板數據展示
**技術架構**: 前後端分離，前端純 HTML/CSS/JavaScript

### 主要功能模組

- 用戶登入與權限管理
- 組織架構管理
- 會員帳戶管理
- 設備授權管理
- 數據儀表板（Dashboard）
- 分銷商管理
- 統計分析

---

## 專案架構

```
┌─────────────────────────────────────────────────┐
│              Browser (用戶端)                    │
├─────────────────────────────────────────────────┤
│  HTML Pages  →  CSS Styles  →  JavaScript       │
│     ↓              ↓               ↓            │
│  Templates  →  Components  →  Modules           │
│                                   ↓             │
│                              API Client         │
└────────────────────┬────────────────────────────┘
                     │ HTTP/HTTPS
                     ↓
┌─────────────────────────────────────────────────┐
│         Backend API Server (後端)                │
│         http://191.101.0.188:8023               │
└─────────────────────────────────────────────────┘
```

### 運作流程

1. **頁面載入** → HTML 載入模組定義檔 `app.module.def.js`
2. **模組初始化** → 載入所有必要的 JS/CSS 函式庫
3. **多語言渲染** → 使用 Mustache.js 渲染模板
4. **API 請求** → 透過 `Cyberspace.Client` 發送請求
5. **數據展示** → View 層處理數據並更新 DOM
6. **用戶互動** → 事件監聽與狀態更新

---

## 目錄結構

```
www/
├── assets/                          # 靜態資源
│   ├── images/                      # 圖片資源
│   └── fonts/                       # 字體檔案
│
├── components/                      # UI 組件
│   ├── app.component.frame.*.html   # 框架組件 HTML
│   ├── app.component.frame.*.js     # 框架組件 JS
│   ├── app.component.frame.*.css    # 框架組件樣式
│   ├── navigation/                  # 導航組件
│   ├── distributor/                 # 分銷商組件
│   └── avaclassroom-nav/            # AVA 教室導航
│
├── css/                             # 全域樣式
│   ├── layout.style.utility.css     # 通用工具類樣式
│   ├── layout.style.components.default.css  # 預設組件樣式
│   ├── layout.style.table.css       # 表格樣式
│   ├── layout.style.modal.css       # 模態框樣式
│   ├── layout.style.msgbox.css      # 訊息框樣式
│   ├── layout.style.loader.css      # 載入動畫樣式
│   ├── layout.style.button.css      # 按鈕樣式
│   └── layout.style.select.css      # 下拉選單樣式
│
├── locales/                         # 多語言資源
│   └── app.locale.js                # 語系定義檔
│
├── modules/                         # 業務邏輯模組
│   ├── app.module.def.js            # 核心定義與依賴載入
│   ├── app.module.login.js          # 登入模組
│   ├── app.module.member.js         # 會員管理模組
│   ├── app.module.organization.js   # 組織管理模組
│   ├── app.module.dashboard.js      # 儀表板模組
│   ├── app.module.device.js         # 設備管理模組
│   ├── app.module.license.js        # 授權管理模組
│   ├── app.module.permission.js     # 權限管理模組
│   ├── app.module.profile.js        # 個人檔案模組
│   └── app.module.utility.js        # 工具函數模組
│
├── scripts/                         # 腳本函式庫
│   ├── lib/                         # 自建函式庫
│   │   ├── lib.proc.net.js          # 網路請求處理
│   │   ├── lib.proc.util.js         # 通用工具函數
│   │   ├── lib.proc.md5.js          # MD5 加密
│   │   ├── lib.proc.time.js         # 時間處理
│   │   ├── lib.html.js              # HTML 操作
│   │   ├── lib.html.tablepage.js    # 分頁功能
│   │   ├── lib.html.msgbox.js       # 訊息框
│   │   └── lib.html.loader.scan.0016.js  # 載入掃描器
│   ├── inactivity.js                # 閒置登出處理
│   └── sdk.html.js                  # HTML SDK
│
├── views/                           # 視圖層（頁面邏輯）
│   ├── app.view.login.js            # 登入頁邏輯
│   ├── app.view.member.js           # 會員頁邏輯
│   ├── app.view.organization.js     # 組織頁邏輯
│   ├── app.view.dashboard.js        # 儀表板邏輯
│   ├── app.view.device.js           # 設備頁邏輯
│   ├── app.view.license.js          # 授權頁邏輯
│   └── app.html.utility.js          # HTML 工具函數
│
├── vender/                          # 第三方函式庫
│   └── node_modules/                # NPM 套件
│       ├── jquery/                  # jQuery
│       └── bootstrap/               # Bootstrap (選用)
│
├── *.html                           # HTML 頁面檔案
│   ├── index.html                   # 首頁
│   ├── login.html                   # 登入頁
│   ├── dashboard.html               # 儀表板
│   ├── member.html                  # 會員管理
│   ├── organization.html            # 組織管理
│   ├── device.html                  # 設備管理
│   ├── license.html                 # 授權管理
│   ├── reset_password.html          # 重置密碼
│   └── profile.html                 # 個人檔案
│
└── PROJECT_DOCUMENTATION.md         # 本文檔
```

---

## 核心技術棧

### 前端框架與函式庫

| 技術                | 版本   | 用途                 |
| ------------------- | ------ | -------------------- |
| **jQuery**          | 3.x    | DOM 操作、事件處理   |
| **Mustache.js**     | 4.2.0  | 模板渲染、多語言支援 |
| **Chart.js**        | 最新版 | 數據圖表展示         |
| **ChartDataLabels** | -      | 圖表數據標籤         |
| **ExcelJS**         | 最新版 | Excel 匯出功能       |
| **FileSaver.js**    | -      | 檔案下載             |

### 開發工具

- **Live Server** (建議開發環境)
- **瀏覽器開發者工具**

---

## HTML 頁面結構

### 標準頁面範本

每個 HTML 頁面遵循以下結構：

```html
<!DOCTYPE html>
<html>
  <head>
    <title>頁面標題</title>

    <!-- 1. 核心模組定義 (必須最先載入) -->
    <script src="modules/app.module.def.js"></script>

    <!-- 2. 多語言資源 -->
    <script type="text/javascript" src="locales/app.locale.js"></script>

    <!-- 3. 業務邏輯模組 -->
    <script
      type="text/javascript"
      src="modules/app.module.[模組名].js"
    ></script>

    <!-- 4. 頁面特定樣式 -->
    <style>
      /* 內聯樣式或外部引用 */
    </style>
  </head>

  <body>
    <!-- 主容器 -->
    <div id="app" style="visibility: hidden; flex-direction: column">
      <!-- Navbar 容器 -->
      <div id="navbar-container"></div>

      <!-- 主內容區 -->
      <div style="display: flex; height: calc(100vh - 72px)">
        <!-- Sidebar 容器 -->
        <div id="sidebar-nav-container"></div>

        <!-- 內容區域 -->
        <div
          style="display: flex; flex-direction: column; flex: 1; min-width: 0"
        >
          <div id="nav-container"></div>

          <!-- 實際頁面內容 -->
          <div
            class="content"
            style="flex: 1; overflow-y: auto; padding: 2rem 2.5rem"
          >
            <!-- 頁面內容 -->
          </div>
        </div>
      </div>
    </div>

    <!-- 頁面腳本 (必須放在最後) -->
    <script type="text/javascript" src="views/app.view.[頁面名].js"></script>

    <!-- 組件腳本 -->
    <script type="text/javascript" src="components/app.component.*.js"></script>
  </body>
</html>
```

### 關鍵元素說明

#### 1. `app.module.def.js` - 核心啟動檔

- **作用**: 載入所有必要的第三方函式庫和自建函式庫
- **載入順序**:
  1. jQuery
  2. Mustache.js (模板引擎)
  3. 多語言資源
  4. 自建函式庫 (lib.proc.\*.js)
  5. HTML 操作函式庫 (lib.html.\*.js)
  6. 樣式表 (CSS)

#### 2. 容器結構

- `#app`: 主應用容器，初始隱藏，等資源載入完成後顯示
- `#navbar-container`: 頂部導航欄
- `#sidebar-nav-container`: 側邊欄導航
- `#nav-container`: 次級導航
- `.content`: 實際頁面內容區域

---

## CSS 樣式系統

### 樣式層級架構

```
全域基礎樣式
    ↓
通用工具類 (Utility)
    ↓
組件預設樣式 (Components Default)
    ↓
特定組件樣式 (Frame Components)
    ↓
頁面特定樣式 (Page Specific)
```

### 核心 CSS 檔案

#### 1. `layout.style.utility.css` - 通用工具類

```css
/* 包含常用的工具類 */
.centered-content {
  /* 居中內容 */
}
.flex {
  /* Flexbox 佈局 */
}
.hidden {
  /* 隱藏元素 */
}
.text-center {
  /* 文字居中 */
}
```

#### 2. `layout.style.components.default.css` - 預設組件樣式

- 定義按鈕、輸入框、卡片等基礎組件樣式
- 提供統一的設計語言

#### 3. `layout.style.table.css` - 表格樣式

```css
/* 響應式表格 */
.responstable {
}
.frame-table {
}
```

#### 4. `layout.style.modal.css` - 模態框樣式

```css
.modal {
  position: fixed;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.5);
}
.modal-content {
}
.modal-header {
}
.modal-body {
}
.modal-footer {
}
```

#### 5. `layout.style.button.css` - 按鈕樣式

- 定義各種按鈕狀態和變體

### 設計系統色彩

```css
/* 主色調 */
--primary-blue: #214f7c;
--secondary-blue: #92bfff;
--accent-orange: #ee963f;

/* 中性色 */
--gray-light: #e5e8ea;
--gray-medium: #97aac2;
--gray-dark: #404040;

/* 狀態色 */
--success: #1c1c1c;
--error: #de6565;
--warning: #ee963f;
```

---

## JavaScript 模組系統

### 模組載入機制

**app.module.def.js** 是整個系統的核心啟動檔，使用 `document.write()` 動態載入所有依賴：

```javascript
// 1. 載入 jQuery
document.write(
  '<script src="vender/node_modules/jquery/dist/jquery.min.js"></script>'
);

// 2. 載入模板引擎
document.write(
  '<script src="https://cdn.jsdelivr.net/npm/mustache@4.2.0/mustache.min.js"></script>'
);

// 3. 載入多語言
document.write(
  '<script type="text/javascript" src="locales/app.locale.js"></script>'
);

// 4. 載入自建函式庫
document.write('<script src="scripts/lib/lib.proc.util.js"></script>');
document.write('<script src="scripts/lib/lib.proc.net.js"></script>');
// ... 更多函式庫

// 5. 載入樣式表
document.write('<link rel="stylesheet" href="css/layout.style.utility.css">');
// ... 更多樣式表
```

### 業務邏輯模組

每個模組負責特定的業務功能，並提供對應的 API 請求函數：

#### **app.module.member.js** - 會員管理模組

```javascript
// 會員數據結構
var MemberData = {
  member_cid: "",
  password: "",
  email: "",
  member_name: "",
  group_cid: "",
  phone_cell: "",
  // ... 更多欄位
};

// API 函數範例
function CsRequestMemberSelectAllCountByCondition(
  type,
  cid,
  keyword,
  callback
) {
  Cyberspace.Client.SendRequest(
    "/api/member/select/count/condition",
    {
      type: type,
      condition_cid: cid,
      keyword: keyword,
    },
    callback
  );
}

function CsRequesMembertInsertOneRecordByParentCID(
  parent_cid,
  member_data,
  callback
) {
  Cyberspace.Client.SendRequest(
    "/api/member/insert",
    {
      parent_cid: parent_cid,
      member_cid: member_data.member_cid,
      password: member_data.password,
      email: member_data.email,
      // ... 更多欄位
    },
    callback
  );
}
```

#### **app.module.dashboard.js** - 儀表板模組

```javascript
function CsRequestDashboardSelectDeviceSpec(
  group_cid,
  begin_time,
  end_time,
  product_type,
  spec,
  callback
) {
  Cyberspace.Client.SendRequest(
    "/api/dashboard/device/select",
    {
      group_cid: group_cid,
      begin_time: begin_time,
      end_time: end_time,
      product_type: product_type,
      spec: spec,
    },
    callback
  );
}
```

### View 層 (視圖邏輯)

View 檔案負責頁面的互動邏輯和數據展示：

#### **app.view.member.js** 結構範例

```javascript
// 1. 多語言渲染 (必須最先執行)
(function () {
  renderTemplate("zh-tw", "app");
})();

// 2. 定義頁面變數
let currentSortField = "";
let currentSortOrder = "asc";

// 3. 業務邏輯函數
function MemberSelectAll(parent_name) {
  // 搜尋條件
  let search_group_cid = window.sessionStorage.getItem("select_group_cid");

  // 顯示載入動畫
  VisibleLoaderElement(true);

  // API 請求
  CsRequestMemberSelectAllRecordsByCondition(
    search_type,
    search_cid,
    keyword,
    page_index,
    rows_per_page,
    function (ok, result) {
      VisibleLoaderElement(false);

      if (!ok) {
        alert("request error");
        return;
      }

      let json_object = JSON.parse(result);

      // 處理數據並更新 DOM
      let tbody = document.querySelector("#member_list tbody");
      tbody.innerHTML = "";

      json_object.records.forEach((record, index) => {
        let row = document.createElement("tr");
        row.innerHTML = `
                    <td>${record.member_cid}</td>
                    <td>${record.email}</td>
                    <td>********</td>
                `;
        tbody.appendChild(row);
      });
    }
  );
}

// 4. DOM 事件監聽 (頁面載入完成後)
document.addEventListener("DOMContentLoaded", async () => {
  // 顯示模板
  showTemplate("app");

  // 綁定事件
  document
    .getElementById("member_list-button-search")
    .addEventListener("click", function () {
      MemberSelectAll();
    });

  // 初始載入數據
  MemberSelectAll();
});
```

---

## API 通訊機制

### 後端 API 配置

**檔案位置**: `scripts/lib/lib.proc.net.js`

所有 API 請求都透過 `Cyberspace.Client` 進行。後端伺服器配置如下：

```javascript
var Cyberspace = window.Cyberspace || {};
Cyberspace.Client = new (function () {
  // 後端 API 地址配置
  // var _hostname = "http://191.101.0.188:8023";        // Empia 測服
  var _hostname = "https://lms.narvitech.com/orbital/"; // Empia 測服 SSL (目前使用)
  // var _hostname = "http://192.168.0.8:8080";          // 開發環境
  // var _hostname = "http://127.0.0.1:8023";            // 本地開發 orbital
  // var _hostname = "http://127.0.0.1:8025";            // 本地開發 edgehub

  // 取得 Session Token
  this.getSessionToken = function () {
    return window.sessionStorage.getItem("session_token");
  };

  // 取得使用者名稱
  this.getUsername = function () {
    return window.sessionStorage.getItem("member_cid");
  };

  // 發送 POST 請求
  this.SendRequest = async function (act, params, callback) {
    const timeout_ms = 30000 * 10; // 5 分鐘
    const controller = new AbortController();
    const signal = controller.signal;

    const url = _hostname + act;

    // 自動附加 session_token
    const session_token = this.getSessionToken();
    if (session_token) {
      params.session_token = session_token;
    }

    // 編碼表單數據
    function encodeFormData(data) {
      return Object.keys(data)
        .map(
          (key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key])
        )
        .join("&");
    }

    const request_body = encodeFormData(params);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: request_body,
        credentials: "include",
        signal: signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      callback(true, text);
    } catch (error) {
      console.error("Fetch error:", error);
      callback(false, error);
    }
  };

  // 上傳檔案 (支援 FormData)
  this.SendFormDataWithFiles = async function (act, data, callback) {
    const url = _hostname + act;
    const formData = new FormData();

    // 自動附加 session_token
    const session_token = this.getSessionToken();
    if (session_token) {
      formData.append("session_token", session_token);
    }

    // 處理數據欄位
    Object.keys(data).forEach((key) => {
      const val = data[key];

      // 檔案
      if (val instanceof File || val instanceof Blob) {
        formData.append(key, val, val.name || key);
      }
      // 物件轉 JSON
      else if (typeof val === "object") {
        formData.append(key, JSON.stringify(val));
      }
      // 一般值
      else {
        formData.append(key, String(val));
      }
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      callback(true, text);
    } catch (error) {
      console.error("Upload error:", error);
      callback(false, error);
    }
  };
})();
```

### API 請求流程

```
1. 呼叫 API 函數 (如 CsRequestMemberSelectAll)
   ↓
2. 組裝請求參數
   ↓
3. Cyberspace.Client.SendRequest()
   ↓
4. 自動附加 session_token
   ↓
5. fetch() 發送 POST 請求
   ↓
6. 接收 JSON 回應
   ↓
7. callback(ok, result)
   ↓
8. View 層處理數據並更新 UI
```

### 標準回應格式

```json
{
  "errno": 1, // 1 = 成功, < 0 = 錯誤
  "message": "成功",
  "records": {
    // 數據記錄
    "member_cid": ["user1", "user2"],
    "email": ["user1@example.com", "user2@example.com"]
  },
  "count": 2 // 記錄總數 (分頁用)
}
```

### 錯誤處理

```javascript
function show_errno(errno) {
  if (errno < 0) {
    let error_message =
      window.localeData.error[`e${Math.abs(errno)}`] || "Unknown error";
    alert(error_message);
    return error_message;
  }
  return "";
}
```

### 常見網路錯誤與處理

#### 錯誤代碼說明

| 錯誤代碼  | 說明                   | 可能原因                                                                     | 解決方法                                                               |
| --------- | ---------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **-1109** | 連線超時或伺服器無回應 | 1. 網路速度過慢<br>2. 伺服器負載過高<br>3. 瀏覽器緩存過大<br>4. SSL 握手失敗 | 1. 重新整理頁面<br>2. 清除瀏覽器緩存<br>3. 檢查網路連線<br>4. 稍後再試 |
| **-1**    | 一般性錯誤             | API 請求失敗                                                                 | 檢查 Network 標籤詳細資訊                                              |
| **-1001** | Session 過期           | 登入逾時                                                                     | 重新登入                                                               |
| **-1002** | 權限不足               | 沒有操作權限                                                                 | 聯絡管理員                                                             |
| **-1003** | 參數錯誤               | 傳送參數格式錯誤                                                             | 檢查 API 參數                                                          |

#### 網路問題排查步驟

**問題現象**: 使用 `https://lms.narvitech.com/orbital/` 時，偶爾出現 -1109 或其他錯誤

**可能原因**:

1. **機器緩存過高** - 瀏覽器暫存檔案過多，影響連線速度
2. **SSL 連線速度慢** - HTTPS 握手需要額外時間
3. **伺服器回應延遲** - 後端處理時間過長
4. **網路不穩定** - 網路斷線或延遲過高

**解決方法**:

```javascript
// 1. 清除瀏覽器緩存
// 在瀏覽器設定中：清除快取和 Cookie

// 2. 強制重新載入
// Windows: Ctrl + F5
// Mac: Cmd + Shift + R

// 3. 檢查 Session Storage
console.log("Session Token:", window.sessionStorage.getItem("session_token"));
console.log("Member CID:", window.sessionStorage.getItem("member_cid"));

// 4. 手動清除 Session (如果需要)
window.sessionStorage.clear();
window.location.reload();
```

#### 請求超時設定

目前系統設定的請求超時時間為 **5 分鐘**（300 秒）：

```javascript
// lib.proc.net.js
const request_timeout = 30000 * 10; // 300,000 毫秒 = 5 分鐘
```

如果經常遇到超時問題，可以考慮調整此數值，但不建議設定超過 10 分鐘。

#### 錯誤處理最佳實踐

```javascript
// 在 API 請求中加入錯誤處理
CsRequestSomething(param, function (ok, result) {
  if (!ok) {
    // 請求失敗
    console.error("API 請求失敗:", result);
    alert("網路連線異常，請檢查網路狀態後重試");
    return;
  }

  try {
    let json_object = JSON.parse(result);

    // 檢查錯誤代碼
    if (json_object.errno < 0) {
      // 顯示錯誤訊息
      show_errno(json_object.errno);

      // 特殊錯誤處理
      if (json_object.errno === -1001) {
        // Session 過期，跳轉到登入頁
        change_page("login.html");
      } else if (json_object.errno === -1109) {
        // 連線超時，建議重試
        if (confirm("連線超時，是否重試？")) {
          // 重新執行請求
          CsRequestSomething(param, arguments.callee);
        }
      }
      return;
    }

    // 處理正常回應
    // ...
  } catch (e) {
    console.error("解析 JSON 失敗:", e);
    alert("資料格式錯誤，請聯絡技術支援");
  }
});
```

---

## Components 組件系統

### 組件類型

#### 1. Frame Components (框架組件)

##### **Navbar** - 頂部導航欄

- **檔案**:
  - `app.component.frame.navbar.html`
  - `app.component.frame.navbar.js`
  - `app.component.frame.navbar.css`
- **功能**:
  - Logo 顯示
  - 個人資料下拉選單
  - 登出按鈕
  - 語言切換

##### **Sidebar** - 側邊欄導航

- **檔案**:
  - `app.component.frame.sidebar-nav.html`
  - `app.component.frame.sidebar-nav.js`
  - `app.component.frame.sidebar-nav.css`
- **功能**:
  - 導航選單
  - 權限控制顯示
  - 當前頁面標示

##### **Modal** - 模態框組件

- **新增帳戶模態框** (member.html)

```html
<div id="member-add-modal" class="modal" style="display: none">
  <div class="modal-content">
    <div class="modal-header">
      <h2>{{member.title_insert_member}}</h2>
      <span class="close" id="member-add-modal-close">&times;</span>
    </div>
    <div class="modal-body">
      <form id="member-add-form">
        <!-- 表單內容 -->
      </form>
    </div>
    <div class="modal-footer">
      <button id="member_insert-button-cancel">{{common.cancel}}</button>
      <button id="member_insert-button-ok">{{common.ok}}</button>
    </div>
  </div>
</div>
```

- **控制方法**:

```javascript
// 開啟模態框
document.getElementById("member-add-modal").style.display = "flex";

// 關閉模態框
function closeModal() {
  modal.style.display = "none";
  document.getElementById("member-add-form").reset();
}

// 點擊關閉按鈕
document.getElementById("member-add-modal-close").onclick = closeModal;

// 點擊取消按鈕
document.getElementById("member_insert-button-cancel").onclick = closeModal;

// ESC 鍵關閉
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && modal.style.display === "flex") {
    closeModal();
  }
});
```

#### 2. Reusable Components (可重用組件)

##### **Profile Modal** - 個人資料彈窗

- **檔案**: `app.component.profile.modal.js/html`
- **功能**: 編輯個人資料、修改密碼

##### **Add Count** - 新增計數組件

- **檔案**: `app.component.frame.add-count.js/html/css`
- **功能**: 批次新增功能

---

## 數據流與狀態管理

### Session Storage

系統使用 `sessionStorage` 儲存用戶狀態：

```javascript
// 登入成功後儲存
window.sessionStorage.setItem("session_token", "xxx");
window.sessionStorage.setItem("member_cid", "user123");
window.sessionStorage.setItem("tier", "2");
window.sessionStorage.setItem("level_uid", "2");
window.sessionStorage.setItem("group_cid", "org001");
window.sessionStorage.setItem("select_group_cid", "org001");

// 讀取狀態
let currentUser = window.sessionStorage.getItem("member_cid");
let currentOrg = window.sessionStorage.getItem("select_group_cid");

// 登出時清除
window.sessionStorage.clear();
```

### 全域變數

```javascript
// 權限資料
window.permissions = {
  /* 權限物件 */
};

// 多語言資料
window.localeData = {
  /* 語系資料 */
};

// 圖表實例 (避免重複創建)
let _g_pie_chart = null;
let _g_bar_chart = null;
let _g_multi_line_chart = null;
```

### 數據流向

```
API 回應 (JSON)
    ↓
JSON.parse(result)
    ↓
數據處理與轉換
    ↓
更新 DOM / 圖表
    ↓
用戶可見的 UI 變化
```

---

## 路由與頁面導航

### 頁面跳轉函數

```javascript
// 定義於 lib.html.pagecontainer.js
function change_page(page_url) {
  window.location.href = page_url;
}

// 範例
change_page("dashboard.html");
change_page("member.html");
```

### 帶參數導航

```javascript
// 從授權頁跳到儀表板，帶入時間範圍
function navigateToDashboard(licenseData) {
  const params = new URLSearchParams({
    begin_time: licenseData.begin_time,
    end_time: licenseData.end_time,
    license_cid: licenseData.license_cid,
    license_count: licenseData.count,
  });

  window.location.href = `dashboard.html?${params.toString()}`;
}

// 在目標頁面讀取參數
const urlParams = new URLSearchParams(window.location.search);
const beginTime = urlParams.get("begin_time");
const endTime = urlParams.get("end_time");
```

### 權限導向

```javascript
// 根據用戶權限跳轉不同頁面
if (json_user.tier === "3" || json_user.level_uid === "3") {
  change_page("distributor_dashboard.html");
} else if (json_user.tier === "2" || json_user.level_uid === "2") {
  change_page("dashboard.html");
} else {
  change_page("home.html");
}
```

---

## 權限控制系統

### 權限等級

```javascript
// Tier/Level 說明
// tier = 3, level_uid = 3 → 分銷商
// tier = 2, level_uid = 2 → 一般管理員
// tier = 1, level_uid = 1 → 超級管理員
```

### 權限檢查

```javascript
// 檢查權限
function hasPermission(permissionKey) {
  return window.permissions && window.permissions[permissionKey];
}

// 根據權限顯示/隱藏元素
if (hasPermission("member_create")) {
  document.getElementById("member-add-button").style.display = "block";
} else {
  document.getElementById("member-add-button").style.display = "none";
}
```

### 自動登出機制

```javascript
// inactivity.js - 10 分鐘無操作自動登出
let inactivityTimeout;
const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 分鐘

function resetInactivityTimer() {
  clearTimeout(inactivityTimeout);
  inactivityTimeout = setTimeout(() => {
    alert("閒置超時，即將登出");
    change_page("logout.html");
  }, INACTIVITY_LIMIT);
}

// 監聽用戶活動
["mousedown", "mousemove", "keypress", "scroll", "touchstart"].forEach(
  (event) => {
    document.addEventListener(event, resetInactivityTimer, true);
  }
);
```

---

## 多語言系統

### Mustache.js 模板引擎

系統使用 Mustache.js 進行模板渲染：

```javascript
// 定義於 app.locale.js
window.localeData = {
  "zh-tw": {
    common: {
      ok: "確定",
      cancel: "取消",
      save: "儲存",
      delete: "刪除",
      search: "搜尋",
    },
    member: {
      title_list_member: "會員列表",
      member_cid: "會員編號",
      email: "電子郵件",
      password: "密碼",
      insert: "新增帳戶",
    },
  },
  en: {
    common: {
      ok: "OK",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      search: "Search",
    },
    member: {
      title_list_member: "Member List",
      member_cid: "Member ID",
      email: "Email",
      password: "Password",
      insert: "Add Account",
    },
  },
};
```

### 模板渲染流程

```javascript
// 1. 定義於 app.html.utility.js
function renderTemplate(locale, containerId) {
  const container = document.getElementById(containerId);
  const template = container.innerHTML;

  // 使用 Mustache 渲染
  const rendered = Mustache.render(template, window.localeData[locale]);
  container.innerHTML = rendered;
}

// 2. 頁面載入時渲染
(function () {
  renderTemplate("zh-tw", "app");
})();

// 3. 顯示模板
function showTemplate(containerId) {
  document.getElementById(containerId).style.visibility = "visible";
}
```

### HTML 中使用變數

```html
<!-- 單一變數 -->
<h1>{{member.title_list_member}}</h1>
<button>{{common.ok}}</button>

<!-- 條件渲染 -->
{{#hasPermission}}
<button>{{member.insert}}</button>
{{/hasPermission}}

<!-- 列表渲染 -->
{{#members}}
<tr>
  <td>{{member_cid}}</td>
  <td>{{email}}</td>
</tr>
{{/members}}
```

### 取得語系資料

```javascript
// JavaScript 中取得語系文字
function GetLocalData(key) {
  const keys = key.split(".");
  let value = window.localeData["zh-tw"];

  for (let k of keys) {
    value = value[k];
    if (!value) return key;
  }

  return value;
}

// 使用範例
alert(GetLocalData("common.success")); // "成功"
```

---

## 開發指南

### 新增頁面步驟

#### 1. 創建 HTML 檔案 (`example.html`)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>範例頁面</title>
    <script src="modules/app.module.def.js"></script>
    <script src="locales/app.locale.js"></script>
    <script src="modules/app.module.example.js"></script>
  </head>
  <body>
    <div id="app" style="visibility: hidden;">
      <div id="navbar-container"></div>
      <div class="content">
        <h1>{{example.title}}</h1>
        <!-- 頁面內容 -->
      </div>
    </div>

    <script src="components/app.component.frame.navbar.js"></script>
    <script src="views/app.view.example.js"></script>
  </body>
</html>
```

#### 2. 創建模組檔案 (`app.module.example.js`)

```javascript
// API 請求函數
function CsRequestExampleSelectAll(callback) {
  Cyberspace.Client.SendRequest("/api/example/select/all", {}, callback);
}

function CsRequestExampleInsert(data, callback) {
  Cyberspace.Client.SendRequest(
    "/api/example/insert",
    {
      field1: data.field1,
      field2: data.field2,
    },
    callback
  );
}
```

#### 3. 創建視圖檔案 (`app.view.example.js`)

```javascript
// 多語言渲染
(function () {
  renderTemplate("zh-tw", "app");
})();

// 業務邏輯
function loadExampleData() {
  VisibleLoaderElement(true);

  CsRequestExampleSelectAll(function (ok, result) {
    VisibleLoaderElement(false);

    if (!ok) {
      alert("載入失敗");
      return;
    }

    let data = JSON.parse(result);

    // 更新 UI
    renderExampleTable(data.records);
  });
}

function renderExampleTable(records) {
  let tbody = document.querySelector("#example-table tbody");
  tbody.innerHTML = "";

  records.forEach((record) => {
    let row = document.createElement("tr");
    row.innerHTML = `
            <td>${record.field1}</td>
            <td>${record.field2}</td>
        `;
    tbody.appendChild(row);
  });
}

// DOM 事件
document.addEventListener("DOMContentLoaded", () => {
  showTemplate("app");

  // 綁定事件
  document
    .getElementById("load-button")
    .addEventListener("click", loadExampleData);

  // 初始載入
  loadExampleData();
});
```

#### 4. 更新多語言檔案 (`app.locale.js`)

```javascript
window.localeData["zh-tw"].example = {
  title: "範例頁面",
  field1: "欄位一",
  field2: "欄位二",
  load: "載入資料",
};
```

### 新增 API 請求

```javascript
// 標準 POST 請求
function CsRequestNewAPI(param1, param2, callback) {
  Cyberspace.Client.SendRequest(
    "/api/new/endpoint",
    {
      param1: param1,
      param2: param2,
    },
    callback
  );
}

// 檔案上傳
function CsRequestUploadFile(file, metadata, callback) {
  Cyberspace.Client.SendFormDataWithFiles(
    "/api/upload/file",
    {
      file: file,
      meta: metadata,
    },
    callback
  );
}
```

### 新增圖表

```javascript
// 使用 Chart.js
function renderChart(canvas, data) {
  const ctx = canvas.getContext("2d");

  new Chart(ctx, {
    type: "bar", // bar, line, pie, doughnut
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "數據集",
          data: data.values,
          backgroundColor: "rgba(33, 79, 124, 1)",
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
```

### 調試技巧

```javascript
// 1. Console 輸出
console.log("變數值:", variable);
console.table(arrayData);
console.error("錯誤訊息");

// 2. 檢查 Session
console.log("Session Token:", Cyberspace.Client.getSessionToken());
console.log("當前用戶:", Cyberspace.Client.getUsername());

// 3. 檢查 API 回應
CsRequestSomething(function (ok, result) {
  console.log("API 回應:", JSON.parse(result));
});

// 4. 檢查 DOM 元素
console.log("元素:", document.getElementById("element-id"));
```

### 常見問題排查

#### 問題 1: 頁面空白

- **檢查**: 是否載入 `app.module.def.js`
- **檢查**: Console 是否有 JavaScript 錯誤
- **檢查**: `showTemplate("app")` 是否被呼叫

#### 問題 2: 多語言未顯示

- **檢查**: `renderTemplate()` 是否正確執行
- **檢查**: `app.locale.js` 是否正確載入
- **檢查**: 模板變數名稱是否正確 (如 `{{member.title}}`)

#### 問題 3: API 請求失敗

- **檢查**: Network 標籤查看請求狀態
- **檢查**: Session Token 是否有效
- **檢查**: 參數是否正確傳遞
- **檢查**: 後端 API 路徑是否正確

#### 問題 4: 圖表不顯示

- **檢查**: Canvas 元素是否存在
- **檢查**: Chart.js 是否正確載入
- **檢查**: 數據格式是否正確
- **檢查**: 舊圖表是否已銷毀 (`chart.destroy()`)

---

## 附錄

### A. 完整 API 端點列表

#### 登入相關

**模組檔案**: `modules/app.module.login.js`
**頁面檔案**: `login.html`
**視圖檔案**: `views/app.view.login.js`

- `POST /api/login` - 用戶登入

  - **函數**: `CsRequestLogin(member_cid, password, callback)`
  - **參數**:
    - `member_cid`: 會員帳號
    - `password`: 密碼 (MD5 加密)
  - **回應**: `{ errno, session_token, member_cid, tier, level_uid, group_cid }`

- `POST /api/logout` - 用戶登出

  - **函數**: `CsRequestLogout(callback)`
  - **參數**: `session_token` (自動附加)
  - **回應**: `{ errno, message }`

- `POST /api/password/reset` - 重置密碼
  - **函數**: `CsRequestPasswordReset(email, callback)`
  - **參數**: `email` - 註冊郵箱
  - **回應**: `{ errno, message }`

---

#### 會員管理

**模組檔案**: `modules/app.module.member.js`
**頁面檔案**: `member.html`
**視圖檔案**: `views/app.view.member.js`

- `POST /api/member/select/count/condition` - 查詢會員數量

  - **函數**: `CsRequestMemberSelectAllCountByCondition(type, cid, keyword, callback)`
  - **參數**:
    - `type`: 搜尋類型 (1=parent_cid, 5=group_cid, 6=parent_cid+group_cid)
    - `condition_cid`: 條件 CID
    - `keyword`: 關鍵字
  - **回應**: `{ errno, count }`

- `POST /api/member/select/records/condition` - 查詢會員記錄

  - **函數**: `CsRequestMemberSelectAllRecordsByCondition(type, cid, keyword, index, count, callback)`
  - **參數**:
    - `type`: 搜尋類型
    - `condition_cid`: 條件 CID
    - `keyword`: 關鍵字
    - `page_index`: 頁碼
    - `rows_per_page`: 每頁筆數
  - **回應**: `{ errno, records: { member_cid[], email[], password[], ... } }`

- `POST /api/member/select/one` - 查詢單一會員

  - **函數**: `CsRequestMemberSelectOneRecordByMemberCID(member_cid, callback)`
  - **參數**: `member_cid` - 會員編號
  - **回應**: `{ errno, records: { member_cid[], email[], ... } }`

- `POST /api/member/insert` - 新增會員

  - **函數**: `CsRequesMembertInsertOneRecordByParentCID(parent_cid, member_data, callback)`
  - **參數**:
    - `parent_cid`: 父級帳號
    - `member_cid`, `password`, `email`, `group_cid`, etc.
  - **回應**: `{ errno, member_cid }`

- `POST /api/member/update` - 更新會員

  - **函數**: `CsRequestMemberUpdateOneRecordByMemberCID(member_data, callback)`
  - **參數**: 完整的 `MemberData` 物件
  - **回應**: `{ errno, message }`

- `POST /api/member/send/email` - 發送郵件
  - **函數**: `CsRequestMemberSendEMail(member_cid, callback)`
  - **參數**: `member_cid` - 會員編號
  - **回應**: `{ errno, message }`

---

#### 組織管理

**模組檔案**: `modules/app.module.organization.js`
**頁面檔案**: `organization.html`, `organization_modern.html`
**視圖檔案**: `views/app.view.organization.js`

- `POST /api/organization/select/all` - 查詢所有組織

  - **函數**: `CsRequestOrganizationSelectAll(callback)`
  - **參數**: 無
  - **回應**: `{ errno, records: { group_cid[], group_name[], ... } }`

- `POST /api/organization/select/count` - 查詢組織數量

  - **函數**: `CsRequestOrganizationSelectAllCount(callback)`
  - **參數**: 無
  - **回應**: `{ errno, count }`

- `POST /api/organization/insert` - 新增組織

  - **函數**: `CsRequestOrganizationInsertOne(organization_data, callback)`
  - **參數**: `group_cid`, `group_name`, `parent_cid`, etc.
  - **回應**: `{ errno, group_cid }`

- `POST /api/organization/update` - 更新組織
  - **函數**: `CsRequestOrganizationUpdateOne(organization_data, callback)`
  - **參數**: 完整的組織資料物件
  - **回應**: `{ errno, message }`

---

#### 設備管理

**模組檔案**: `modules/app.module.device.js`
**頁面檔案**: `device.html`
**視圖檔案**: `views/app.view.device.js`

- `POST /api/device/select/all` - 查詢所有設備

  - **函數**: `CsRequestDeviceSelectAll(group_cid, callback)`
  - **參數**: `group_cid` - 組織編號
  - **回應**: `{ errno, records: { device_cid[], status[], ... } }`

- `POST /api/device/select/count` - 查詢設備數量

  - **函數**: `CsRequestDeviceSelectCount(group_cid, callback)`
  - **參數**: `group_cid` - 組織編號
  - **回應**: `{ errno, count }`

- `POST /api/device/activate` - 啟用設備

  - **函數**: `CsRequestDeviceActivate(device_cid, license_cid, callback)`
  - **參數**:
    - `device_cid`: 設備編號
    - `license_cid`: 授權編號
  - **回應**: `{ errno, message }`

- `POST /api/device/revoke` - 撤銷設備
  - **函數**: `CsRequestDeviceRevoke(device_cid, callback)`
  - **參數**: `device_cid` - 設備編號
  - **回應**: `{ errno, message }`

---

#### 授權管理

**模組檔案**: `modules/app.module.license.js`
**頁面檔案**: `license.html`, `distributor_license.html`
**視圖檔案**: `views/app.view.license.js`, `views/app.view.distributor.license.js`

- `POST /api/license/select/all` - 查詢所有授權

  - **函數**: `CsRequestLicenseSelectAll(group_cid, callback)`
  - **參數**: `group_cid` - 組織編號
  - **回應**: `{ errno, records: { license_cid[], begin_time[], end_time[], count[], ... } }`

- `POST /api/license/select/count` - 查詢授權數量

  - **函數**: `CsRequestLicenseSelectCount(group_cid, callback)`
  - **參數**: `group_cid` - 組織編號
  - **回應**: `{ errno, count }`

- `POST /api/license/insert` - 新增授權

  - **函數**: `CsRequestLicenseInsert(license_data, callback)`
  - **參數**: `license_cid`, `group_cid`, `begin_time`, `end_time`, `count`, etc.
  - **回應**: `{ errno, license_cid }`

- `POST /api/license/upload` - 上傳授權檔案
  - **函數**: `CsRequestLicenseUpload(file, group_cid, callback)`
  - **參數**:
    - `file`: File 物件
    - `group_cid`: 組織編號
  - **回應**: `{ errno, message, license_cid }`

---

#### 儀表板

**模組檔案**: `modules/app.module.dashboard.js`
**頁面檔案**: `dashboard.html`, `distributor_dashboard.html`, `list_dashboard.html`
**視圖檔案**: `views/app.view.dashboard.js`, `views/app.view.distributor.dashboard.js`

- `POST /api/dashboard/device/select` - 查詢設備統計

  - **函數**: `CsRequestDashboardSelectDeviceSpec(group_cid, begin_time, end_time, product_type, spec, callback)`
  - **參數**:
    - `group_cid`: 組織編號
    - `begin_time`: 開始時間 (YYYY-MM-DD)
    - `end_time`: 結束時間 (YYYY-MM-DD)
    - `product_type`: 產品類型
    - `spec`: 規格
  - **回應**: `{ errno, records: { spec04[], record_state[], active_time[], device_count[] }, target_time, target_count }`

- `POST /api/dashboard/update` - 更新目標數據
  - **函數**: `CsRequestDashboardUpdateDeviceSpec(group_cid, target_time, target_count, callback)`
  - **參數**:
    - `group_cid`: 組織編號
    - `target_time`: 目標日期
    - `target_count`: 目標數量
  - **回應**: `{ errno, message }`

---

#### 權限管理

**模組檔案**: `modules/app.module.permission.js`
**頁面檔案**: `permission.html`
**視圖檔案**: `views/app.view.permission.js`

- `POST /api/permission/select` - 查詢權限

  - **函數**: `CsRequestPermissionSelect(member_cid, callback)`
  - **參數**: `member_cid` - 會員編號
  - **回應**: `{ errno, permissions: { key: value, ... } }`

- `POST /api/permission/update` - 更新權限
  - **函數**: `CsRequestPermissionUpdate(member_cid, permissions, callback)`
  - **參數**:
    - `member_cid`: 會員編號
    - `permissions`: 權限物件
  - **回應**: `{ errno, message }`

---

#### 個人檔案

**模組檔案**: `modules/app.module.profile.js`
**頁面檔案**: `profile.html`
**視圖檔案**: `views/app.view.profile.js`
**組件檔案**: `components/app.component.profile.modal.js`

- `POST /api/profile/select` - 查詢個人資料

  - **函數**: `CsRequestProfileSelect(callback)`
  - **參數**: 無 (使用 session_token)
  - **回應**: `{ errno, records: { member_cid, email, ... } }`

- `POST /api/profile/update` - 更新個人資料
  - **函數**: `CsRequestProfileUpdate(profile_data, callback)`
  - **參數**: 個人資料物件
  - **回應**: `{ errno, message }`

---

#### 分銷商管理

**模組檔案**: `modules/app.module.distributor.dashboard.js`
**頁面檔案**: `distributor_dashboard.html`, `distributor_list.html`, `distributor_profile.html`
**視圖檔案**: `views/app.view.distributor.dashboard.js`, `views/app.view.distributor.list.js`

- `POST /api/distributor/select/all` - 查詢所有分銷商

  - **函數**: `CsRequestDistributorSelectAll(callback)`
  - **參數**: 無
  - **回應**: `{ errno, records: { distributor_cid[], name[], ... } }`

- `POST /api/distributor/dashboard` - 查詢分銷商儀表板數據
  - **函數**: `CsRequestDistributorDashboard(distributor_cid, callback)`
  - **參數**: `distributor_cid` - 分銷商編號
  - **回應**: `{ errno, statistics: { ... } }`

---

#### 統計分析

**模組檔案**: `modules/app.module.analytics.js`
**頁面檔案**: `analytics.html`
**視圖檔案**: `views/app.view.analytics.js`

- `POST /api/analytics/select` - 查詢統計數據
  - **函數**: `CsRequestAnalyticsSelect(group_cid, begin_time, end_time, callback)`
  - **參數**:
    - `group_cid`: 組織編號
    - `begin_time`: 開始時間
    - `end_time`: 結束時間
  - **回應**: `{ errno, records: { ... } }`

### B. 常用工具函數

```javascript
// 日期格式化
function formatDate(date) {
  return date.toLocaleDateString("sv-SE"); // YYYY-MM-DD
}

// 千分位格式化
function formatNumber(num) {
  return parseInt(num).toLocaleString();
}

// 顯示/隱藏載入動畫
function VisibleLoaderElement(visible) {
  // 實作於 lib.html.loader.js
}

// 錯誤訊息顯示
function show_errno(errno) {
  if (errno < 0) {
    let msg = window.localeData.error[`e${Math.abs(errno)}`];
    alert(msg);
    return msg;
  }
  return "";
}

// 驗證字串
function IsValidString(str) {
  return str != null && str != "" && str != undefined;
}
```

### C. 瀏覽器支援

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### D. 效能優化建議

1. **減少 DOM 操作**

   - 使用 `DocumentFragment` 批次插入
   - 避免頻繁的 `innerHTML` 操作

2. **圖表優化**

   - 銷毀舊圖表再創建新的
   - 限制數據點數量

3. **API 請求優化**

   - 使用分頁載入
   - 實作請求去重
   - 添加載入狀態提示

4. **緩存策略**
   - 使用 sessionStorage 緩存常用數據
   - 避免重複請求相同數據

---

## 版本歷史

- **v1.0** (2025-01) - 初始版本
  - 基本功能實現
  - 會員管理
  - 組織管理
  - 儀表板

---
