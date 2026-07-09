console.log("Master Module Definition Loading...");

// [新增] 全域產品名稱對照表 (Global Product Dictionary)
window.PRODUCT_DICTIONARY = {
    "avacast": "AVACAST",
    "illuminet": "IllumiNet",
    "avaclassroom": "AVA Classroom"
};

// [新增] 取得產品顯示名稱 (如果找不到對應，就將第一個字母大寫)
window.getProductName = function(productKey) {
    if (!productKey) return "";
    return window.PRODUCT_DICTIONARY[productKey] || 
           (productKey.charAt(0).toUpperCase() + productKey.slice(1));
};
// [資安防護] 生產環境 Console 遮罩與隱藏開發者模式 (Hidden Debug Mode)
(function initSecurityMask() {
  const isDebugMode = window.localStorage.getItem("LMS_DEBUG_MODE") === "true";
  if (!isDebugMode) {
    // 靜音一般日誌與資訊，防堵 PII (個資) 與 Token 洩漏，僅保留 warn 與 error
    window.console.log = function () { };
    window.console.info = function () { };
  } else {
    console.warn(
      "⚠️ [LMS_DEBUG_MODE 開啟]：目前處於開發者除錯模式，Console 封印已解除！",
    );
  }
})();

// [集中管理] 同步注入 Critical CSS，解決非同步載入時的 Loading 跑版問題 (FOUC)
(function injectCriticalCSS() {
  if (document.getElementById("critical-loader-css")) return;
  const style = document.createElement("style");
  style.id = "critical-loader-css";
  style.textContent = `
    #initial-loader { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #ffffff; z-index: 99999; display: flex; justify-content: center; align-items: center; flex-direction: column; transition: opacity 0.3s ease-out; }
    #initial-loader .scan { text-align: center; }
    #initial-loader img { width: 300px; height: 300px; margin-bottom: 10px; }
    #initial-loader .loading-text { font-size: 60px; color: #92bfff; font-family: sans-serif; font-weight: bold; animation: blink 1.5s infinite; }
    @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    /* 覆寫 loader.css 中可能引發 404 的指紋背景 */
    .fingerprint { background-image: none !important; }
  `;
  document.head.appendChild(style);
})();

(async function initCoreModules() {
  // 小型 Promise Wrapper，用來確保載入順序
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const script = document.createElement("script");
      script.src = src;
      script.type = "text/javascript";
      script.async = false; // 保持執行順序
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  function loadStyle(href) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`link[href="${href}"]`)) return resolve();
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = href;
      link.onload = resolve;
      link.onerror = () => reject(new Error(`Failed to load style: ${href}`));
      document.head.appendChild(link);
    });
  }

  try {
    const useFramework = window.__USE_UI_FRAMEWORK__;
    const isLoginPage =
      window.location.pathname.includes("login.html") ||
      window.location.pathname.endsWith("/");

    // ==========================================
    // Phase 1: 核心與網路層 (登入頁必須等待)
    // ==========================================
    const phase1Scripts = [];
    if (typeof window.jQuery === "undefined")
      phase1Scripts.push("vender/node_modules/jquery/dist/jquery.min.js");

    if (typeof window.Mustache === "undefined")
      phase1Scripts.push("https://cdn.jsdelivr.net/npm/mustache@4.2.0/mustache.min.js"); // [資安注意] 建議未來補上 SRI 或改為本地端載入

    phase1Scripts.push(
      "scripts/lib/lib.proc.util.js",
      "scripts/lib/lib.proc.net.js",
      "views/app.html.utility.js"
    );

    // [極速優化] 平行載入所有 Phase 1 腳本與 CSS，並利用 async=false 確保執行順序
    await Promise.all([
      ...phase1Scripts.map(src => loadScript(src)),
      loadStyle("css/layout.style.utility.css"),
      loadStyle("css/layout.style.loader.css"),
    ]);

    if (isLoginPage) {
      console.log(
        "✅ [Login] Phase 1 Critical Dependencies Loaded. Unlocking UI...",
      );
      window._CoreLoaded = true;
      window.dispatchEvent(new Event("CoreDependenciesReady"));
    }

    // ==========================================
    // Phase 2: UI 元件與框架 (非登入頁必須等待)
    // ==========================================
    const loadPhase2 = async () => {
      document.documentElement.dataset.phase2 = "loading";

      const phase2Styles = [
        "css/popout.css",
        "css/layout.style.components.default.css",
        "css/layout.style.table.css",
        "css/layout.style.msgbox.css",
        "css/layout.style.modal.css",
      ];

      const phase2Scripts = [];
      if (useFramework) {
        phase2Styles.unshift("vender/node_modules/bootstrap/dist/css/bootstrap.min.css");
        phase2Scripts.push("vender/node_modules/bootstrap/dist/js/bootstrap.bundle.min.js");
      }

      phase2Scripts.push(
        "scripts/lib/lib.proc.time.js",
        "scripts/lib/lib.html.pagecontainer.js",
        "scripts/lib/lib.html.js",
        "scripts/lib/lib.html.tablepage.js",
        "scripts/lib/lib.html.datepicker.js",
        "scripts/lib/lib.html.msgbox.js",
        "scripts/inactivity.js"
      );

      // [極速優化] 平行載入所有 Phase 2 腳本與 CSS
      await Promise.all([
        ...phase2Styles.map((href) => loadStyle(href)),
        ...phase2Scripts.map((src) => loadScript(src))
      ]);

      document.documentElement.dataset.phase2 = "ready";
      document.dispatchEvent(new Event("Phase2Ready"));
    };

    if (isLoginPage) {
      console.log("⏳ [Login] Prefetching Phase 2 resources in background...");
      loadPhase2()
        .then(() => console.log("✅ [Login] Background prefetch complete."))
        .catch((e) => {
          console.error("❌ Phase 2 load error:", e);
          document.documentElement.dataset.phase2 = "error";
          document.dispatchEvent(new Event("Phase2Error"));
        });
    } else {
      await loadPhase2();
      console.log("✅ [Dashboard] All Dependencies Loaded.");
      window._CoreLoaded = true;
      window.dispatchEvent(new Event("CoreDependenciesReady"));
    }
  } catch (error) {
    console.error("❌ Failed to load core dependencies:", error);
  }
})();
