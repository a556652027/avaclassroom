// home.html 的頁面事件操控程式碼相關

//_______________________________________________________________________
// 直接執行
// i18n ***必定放在載入頁面完成後的最前面 避免導致後面的addEventListener失效
(function () {
    renderTemplate("zh-tw", "app");
})();

//_____________________________________________________________________________________
// function 相關
function goto_page() {
    change_page_random("#page2");
}

//_____________________________________________________________________________________
// 事件相關

// 頁面啟動完成時
document.addEventListener("DOMContentLoaded", async () => {
    console.log("Home DOMContentLoaded");

    // 顯示放最後 等都完成後
    showTemplate("app");

    // [新增] 移除靜態 Loading 遮罩
    const loader = document.getElementById("initial-loader");
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 300); // 淡出效果
    }
});
