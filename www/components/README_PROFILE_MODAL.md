# Profile Modal Component 使用說明

## 簡介

Profile Modal Component 是一個可重複使用的個人資料編輯 modal 組件，可以在任何頁面中引入並使用。

## 檔案結構

```
components/
├── app.component.profile.modal.html    # Modal HTML 結構
├── app.component.profile.modal.js      # Modal JavaScript 邏輯
└── README_PROFILE_MODAL.md            # 使用說明（本文件）
```

## 如何使用

### 1. 在 HTML 中引入 Component

在需要使用 profile modal 的頁面（如 dashboard.html）中，在 `</body>` 標籤前加入：

```html
<!-- Profile Modal Component -->
<script type="text/javascript" src="components/app.component.profile.modal.js"></script>

<!-- Profile View Logic (必需) -->
<script type="text/javascript" src="views/app.view.profile.js"></script>
```

**注意**：確保先引入 profile modal component，再引入 view logic。

### 2. 顯示 Modal

使用全域的 `ProfileModal` API 來控制 modal：

```javascript
// 顯示 modal
ProfileModal.show();

// 隱藏 modal
ProfileModal.hide();
```

### 3. 範例：在按鈕點擊時顯示 Profile Modal

```html
<!-- HTML -->
<button id="open-profile-btn">編輯個人資料</button>

<!-- JavaScript -->
<script>
document.getElementById("open-profile-btn").addEventListener("click", function() {
  ProfileModal.show();
});
</script>
```

### 4. 在 Navbar 中使用

如果要在 navbar 的帳戶設定選項中使用，可以修改 navbar component：

```javascript
// components/app.component.frame.navbar.js
document.querySelector(".profile-link").addEventListener("click", function(e) {
  e.preventDefault();
  ProfileModal.show();
});
```

## API 說明

### ProfileModal.show()
顯示個人資料編輯 modal，並自動載入當前使用者的資料。

### ProfileModal.hide()
隱藏個人資料編輯 modal。

### ProfileModal.init()
初始化 modal 的事件監聽器（自動執行，無需手動調用）。

## 功能特點

✅ 自動載入當前使用者的個人資料
✅ 密碼顯示/隱藏切換
✅ 新密碼與確認密碼驗證
✅ 點擊背景關閉 modal
✅ X 按鈕關閉
✅ 取消按鈕關閉
✅ 儲存按鈕自動提交並更新資料
✅ Hover 效果（取消按鈕：灰色，儲存按鈕：橘色）

## 依賴項

此 component 需要以下檔案：

1. `modules/app.module.profile.js` - Profile 資料模型
2. `views/app.view.profile.js` - Profile業務邏輯（SelectProfileOne, UpdateProfileOne）
3. `locales/app.locale.js` - 國際化文字

## 注意事項

- Modal 會自動插入到 `#app` 容器或 `document.body` 中
- 更新成功後，會根據當前頁面路徑跳轉到對應的 dashboard
  - `distributor_profile.html` → `distributor_dashboard.html`
  - 其他頁面 → `dashboard.html`
- 密碼更新是可選的，如果不填寫新密碼則保持原密碼

## 樣式

Component 已包含必要的 CSS 樣式，包括：

- 半透明背景遮罩（rgba(0, 0, 0, 0.5)）
- Modal 內容容器（白色，圓角，陰影）
- 按鈕 hover 效果
- 響應式設計（max-width: 90vw）
- 最大高度限制（max-height: 90vh）

## 完整範例

```html
<!DOCTYPE html>
<html>
<head>
  <title>Dashboard</title>
  <script src="modules/app.module.def.js"></script>
  <script type="text/javascript" src="locales/app.locale.js"></script>
  <script type="text/javascript" src="modules/app.module.profile.js"></script>
</head>
<body>
  <div id="app">
    <h1>Dashboard</h1>
    <button id="edit-profile-btn">編輯個人資料</button>
  </div>

  <!-- Profile Modal Component -->
  <script type="text/javascript" src="components/app.component.profile.modal.js"></script>
  <script type="text/javascript" src="views/app.view.profile.js"></script>

  <script>
    document.addEventListener("DOMContentLoaded", function() {
      document.getElementById("edit-profile-btn").addEventListener("click", function() {
        ProfileModal.show();
      });
    });
  </script>
</body>
</html>
```

## 更新日誌

- **v1.0.0** (2025-01-20)
  - 初始版本
  - 從 profile.html 提取為獨立 component
  - 支持在任何頁面中使用
