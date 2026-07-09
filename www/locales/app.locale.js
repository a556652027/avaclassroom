window.used_locale = "";
//const setlations = {}; // 用於儲存已載入的翻譯資料

// function loadLocale(locale) {
//     return fetch(`locales/${locale}.json`)
//         .then(response => response.json())
//         .then(data => {
//             translations[locale] = data;
//         });
// }
//
// function getTranslation(page, key) {
//     return translations[locale][page][key] || key; // 若找不到翻譯，則回傳原始 key
// }

let localePromise = null;

function setLocaleData(lang) {
  if (window.used_locale != lang) {
    window.localeData = null;
  }

  // 不重新加載
  if (!window.localeData) {
    localePromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `locales/${lang}.js`;
      script.type = "text/javascript";
      script.onload = () => {
        window.used_locale = lang;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  } else {
    localePromise = Promise.resolve();
  }
  return localePromise;
}

// 直接這邊設定 以免他讀不到 或影響後面的 addlistner
const defaultLang = window.localStorage.getItem("language") || "zh-tw";
setLocaleData(defaultLang);

async function renderTemplate(lang, element_id) {
  // 動態載入語言檔案
  //loadScript(`locales/${lang}.js`);

  console.log("renderTemplate");

  try {
    await setLocaleData(lang);
  } catch (e) {
    console.error("Failed to load locale data:", e);
  }

  // [修正] 移除預先轉義，避免 Mustache 再次轉義導致 Double Escaping (例如 / 變成 &#x2F;)
  // Mustache 預設會對 {{variable}} 進行 HTML 轉義，已足夠安全。
  const localeData = window.localeData;

  // [資安防護] 建立安全的渲染函式，避免 XSS 模板注入 (Template Injection)
  const renderElementSafely = (el) => {
    if (!el) return;

    // 1. 首次渲染時，將「乾淨的原始 HTML 結構」快取到 DOM 節點的自訂屬性中
    if (typeof el._originalTemplate === "undefined") {
      if (el.innerHTML.includes("{{")) {
        el._originalTemplate = el.innerHTML;
      } else {
        el._originalTemplate = null; // 標記為不需處理，節省後續檢查效能
      }
    }

    // 2. 永遠只從「乾淨的快取模板」進行渲染，絕不讀取當前可能已被污染的 innerHTML
    if (el._originalTemplate) {
      try {
        el.innerHTML = Mustache.render(el._originalTemplate, localeData);
      } catch (e) {
        console.error("Mustache render error on element:", el, e);
      }
    }
  };

  if (localeData) {
    // [全局修復] 如果指定渲染整個 "app"，改為精準渲染內部內容 (.page 或 modal)
    // 這樣可以避免 Mustache 覆蓋 Navbar, Sidebar 的 DOM 導致「點擊事件全部失效」的致命錯誤
    if (element_id === "app") {
      const targets = document.querySelectorAll(
        ".page, .container, [id*='modal']",
      );
      targets.forEach((el) => {
        renderElementSafely(el);
      });
    } else {
      const el = document.getElementById(element_id);
      renderElementSafely(el);
    }
  }
}

function showTemplate(element_id) {
  var app = document.getElementById("app");
  app.style.visibility = "visible";
}

// 取得對應字串
// e.g. key = common.ok
function GetLocalData(key) {
  if (window.localeData) {
    return key.split(".").reduce((obj, k) => obj?.[k], window.localeData);
  }
  return "";
}
