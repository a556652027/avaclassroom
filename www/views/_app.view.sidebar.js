// home.html 的頁面事件操控程式碼相關

//_______________________________________________________________________
// 直接執行
// i18n ***必定放在載入頁面完成後的最前面 避免導致後面的addEventListener失效

//_____________________________________________________________________________________
// function 相關

//_____________________________________________________________________________________
// 事件相關

// 頁面啟動完成時
document.addEventListener("DOMContentLoaded", async () => {
    console.log("Home DOMContentLoaded");

    {
        // 2. 建立 <script> 元素
        WriteIncludeRelativeScript("modules/app.module.organization.js");
    }
});
