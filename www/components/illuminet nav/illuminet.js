console.log("illuminet nav Loaded");

function getIllumiNetNavHtml() {
  return `<nav class="frame-nav">
      <div class="nav-item">
        <div class="nav-icon dashboard-icon" id="dashboard"></div>
        <span class="nav-text">Dashboard</span>
      </div>

      <div class="nav-item nav-item-second">
          <div class="nav-icon list-icon" id="list"></div>
          <span class="nav-text">訂單資訊</span>
        </div>
      </nav>`;
}

// 讀入 CSS (這部分保持不變)
(function () {
  var nav_link = document.createElement("link");
  nav_link.rel = "stylesheet";
  nav_link.type = "text/css";
  nav_link.href = "components/illuminet nav/illuminet.css";
})();

document.getElementById("illuminet-nav-container").innerHTML =
  getIllumiNetNavHtml();

document.addEventListener("DOMContentLoaded", function () {
  // 頁面切換
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      const icon = item.querySelector(".nav-icon");
      const id = icon?.id || "unknown";

      const productType = window.sessionStorage.getItem("product_type");
      console.log("✅ 當前產品類型:", productType, "點擊了:", id);

      if (productType === "illuminet") {
        if (id === "dashboard") {
          change_page("illumiNet_dashboard.html");
        } else if (id === "list") {
          change_page("illumiNet_list.html");
        }
      }
    });
  });
});
