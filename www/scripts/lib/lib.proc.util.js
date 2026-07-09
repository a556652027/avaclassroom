//=============================================================================
//
// DESC: 現代化資源載入器 (ResourceLoader)
//       用於替代 document.write，支援 Promise 與非同步順序控管
//=============================================================================
window.ResourceLoader = {
  _loaded: new Set(),

  // 載入單一 JS 腳本
  loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.type = "text/javascript";
      script.async = false; // 確保按插入順序執行
      script.onload = () => {
        this._loaded.add(src);
        resolve();
      };
      script.onerror = (e) => reject(new Error(`Script load error: ${src}`));
      document.head.appendChild(script);
    });
  },

  // 載入單一 CSS 樣式
  loadStyle(href) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`link[href="${href}"]`)) {
        resolve();
        return;
      }
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = href;
      link.onload = () => resolve();
      link.onerror = (e) => reject(new Error(`Style load error: ${href}`));
      document.head.appendChild(link);
    });
  },

  // 循序載入 (適用於有相依性的套件)
  async loadInSeries(urls) {
    for (const url of urls) {
      if (url.endsWith(".css")) {
        await this.loadStyle(url);
      } else {
        await this.loadScript(url);
      }
    }
  },

  // 並行載入 (適用於無相依性的資源)
  loadInParallel(urls) {
    return Promise.all(
      urls.map((url) =>
        url.endsWith(".css") ? this.loadStyle(url) : this.loadScript(url),
      ),
    );
  },
};

//=============================================================================
//
// DESC: 2025-02-09
//       替代 document.write
//       這樣可以避免破壞 DOM 結構，也更符合現代最佳實踐
//=============================================================================
// 絕對路徑
function WriteIncludeAbsoluteStyle(inc_file) {
  let link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = inc_file;

  document.head.appendChild(link);
}

function WriteIncludeAbsoluteScript(inc_file) {
  let script = document.createElement("script");
  script.src = inc_file;
  script.type = "text/javascript";
  script.defer = true;

  script.onload = function () {
    console.log("✅ 成功載入 organization module");
    // 你可以在這裡手動初始化，例如：
    // if (window.initOrganization) window.initOrganization();
  };

  script.onerror = function (e) {
    console.error("❌ 無法載入 organization module", e);
  };

  document.head.appendChild(script);
}

// 相對路徑 相對於目前執行到的cs檔案
function WriteIncludeRelativeStyle(inc_file) {
  let work_dir = document.currentScript.src;
  work_dir = work_dir.substring(0, work_dir.lastIndexOf("/"));

  let link = document.createElement("link");
  link.rel = "stylesheet";
  nav_link.type = "text/css";
  link.href = work_dir + "/" + inc_file;

  document.head.appendChild(link);
}

function WriteIncludeRelativeScript(inc_file) {
  let work_dir = document.currentScript.src;
  work_dir = work_dir.substring(0, work_dir.lastIndexOf("/"));

  let script = document.createElement("script");
  script.src = work_dir + "/" + inc_file;
  script.type = "text/javascript";

  script.onload = function () {
    console.log("✅ 成功載入 organization module");
    // 你可以在這裡手動初始化，例如：
    // if (window.initOrganization) window.initOrganization();
  };

  script.onerror = function (e) {
    console.error("❌ 無法載入 organization module", e);
  };

  document.head.appendChild(script);
}

//=============================================================================
//
//
//=============================================================================
function setCookie(name, value, sec) {
  var expires = "";
  var days = 30; //此 cookie 將被保存 30 天
  var date = new Date();
  if (sec) {
    date.setTime(date.getTime() + sec * 1000);
  } else {
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  }
  expires = "; expires=" + date.toGMTString(); // + added
  document.cookie = name + "=" + value + expires + ";path=/"; // + and " added
}

//=============================================================================
//
//
//=============================================================================
function getCookie(cookie_name) {
  var name = cookie_name + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

//=============================================================================
//   HTML 轉義，防止 XSS 攻擊
//=============================================================================
window.HtmlUtil = {
  escape: function (str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/\//g, "&#x2F;")
      .replace(/`/g, "&#x60;");
  },
  // 遞迴過濾物件中所有的字串欄位，防止 Stored XSS
  sanitizeObject: function (obj) {
    if (typeof obj !== "object" || obj === null) return obj;
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }
    const sanitized = {};
    for (let key in obj) {
      if (typeof obj[key] === "string") {
        sanitized[key] = this.escape(obj[key]);
      } else {
        sanitized[key] = this.sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  },
};

function escapeHTML(str) {
  return HtmlUtil.escape(str);
}

//=============================================================================
//
// List all name/value pairs in a table
//=============================================================================
function listCookiesOnConsole() {
  const cookies = document.cookie;
  console.log("Current Cookies:", cookies);
}

//=============================================================================
//
// List all name/value pairs in a table
//=============================================================================
function listCookiesOnDocument() {
  console.log("--- Cookie List ---");
  const cookieArray = document.cookie.split(";");
  const cookieData = [];
  for (var i = 0; i < cookieArray.length; i++) {
    const thisCookie = cookieArray[i].split("=");
    if (thisCookie.length === 2) {
      cookieData.push({
        Name: decodeURIComponent(thisCookie[0].trim()),
        Value: decodeURIComponent(thisCookie[1].trim()),
      });
    }
  }
  console.table(cookieData);
  alert("Cookie 資訊已輸出至 Console 控制台 (F12)");
}

//=============================================================================
//
// Show the cookie string
//=============================================================================
function listCookiesOnAlert() {
  alert(document.cookie);
}

//=============================================================================
//
// Delete all cookies
//=============================================================================
function deleteAllCookie() {
  var cookieArray = document.cookie.split(";");
  for (var i = 0; i < cookieArray.length; i++) {
    thisCookie = cookieArray[i].split("=");
    cookieName = decodeURIComponent(thisCookie[0].trim());
    setCookie(cookieName, "", -1);
  }
}

//=============================================================================
//
//
//=============================================================================
function clsCookie(cname) {
  setCookie(cname, "", -1);
}

//=============================================================================
//
//
//=============================================================================
function getCookieValueByIndex(startIndex) {
  var endIndex = document.cookie.indexOf(";", startIndex);
  if (endIndex == -1) endIndex = document.cookie.length;
  return decodeURIComponent(document.cookie.substring(startIndex, endIndex));
}

//=============================================================================
//  將server傳的json字串 轉換成 物件
//  OK
//============================================== ===============================
function StringToJson(string) {
  if (typeof string === "object") {
    return string;
  }
  try {
    // [Phase 2 優化] 優先嘗試直接解析，對於標準 API 回傳效能最佳。
    return JSON.parse(string);
  } catch (e) {
    // [Phase 2 優化] 若直接解析失敗，再嘗試移除控制字元後重試，作為向下相容的後備方案。
    console.warn(
      "Initial JSON.parse failed. Retrying after sanitizing control characters.",
    );
    try {
      const sanitizedString = string.replace(/[\u0000-\u0019]+/g, "");
      return JSON.parse(sanitizedString);
    } catch (e2) {
      console.error("JSON parsing failed even after sanitization.", e2);
    }
  }
  return null;
}

// //=============================================================================
// // 隨機傳回一種頁面切換的方式
// //
// //=============================================================================
// function RandonDataTrabsition() {
//     var fi = Math.round(Math.random() * 9)
//     switch (fi) {
//         case 0:
//             return 'fade'
//         case 1:
//             return 'flip'
//         case 2:
//             return 'flow'
//         case 3:
//             return 'pop'
//         case 4:
//             return 'slide'
//         case 5:
//             return 'slidedown'
//         case 6:
//             return 'slidefade'
//         case 7:
//             return 'slideup'
//         case 8:
//             return 'trun'
//     }
//     return 'none'
// }

// function change_page_random(page) {
//     // var mm = 'none'
//     // var fi = Math.round(Math.random() * 9)
//     // switch (fi) {
//     //     case 0:
//     //         mm = 'fade'
//     //         break
//     //     case 1:
//     //         mm = 'flip'
//     //         break
//     //     case 2:
//     //         mm = 'flow'
//     //         break
//     //     case 3:
//     //         mm = 'pop'
//     //         break
//     //     case 4:
//     //         mm = 'slide'
//     //         break
//     //     case 5:
//     //         mm = 'slidedown'
//     //         break
//     //     case 6:
//     //         mm = 'slidefade'
//     //         break
//     //     case 7:
//     //         mm = 'slideup'
//     //         break
//     //     case 8:
//     //         mm = 'trun'
//     //         break
//     // }

//     $.mobile.pageContainer.pagecontainer('change', page, {
//         transition: RandonDataTrabsition(),
//         changeHash: false,
//     })
// }

//=============================================================================
//
//
//=============================================================================
function decodeUtf8(bytes) {
  var s = "";
  var i = 0;
  while (i < bytes.length) {
    var c = bytes[i++];
    if (c > 127) {
      if (c > 191 && c < 224) {
        if (i >= bytes.length) throw "UTF-8 decode: incomplete 2-byte sequence";
        c = ((c & 31) << 6) | (bytes[i] & 63);
      } else if (c > 223 && c < 240) {
        if (i + 1 >= bytes.length)
          throw "UTF-8 decode: incomplete 3-byte sequence";
        c = ((c & 15) << 12) | ((bytes[i] & 63) << 6) | (bytes[++i] & 63);
      } else if (c > 239 && c < 248) {
        if (i + 2 >= bytes.length)
          throw "UTF-8 decode: incomplete 4-byte sequence";
        c =
          ((c & 7) << 18) |
          ((bytes[i] & 63) << 12) |
          ((bytes[++i] & 63) << 6) |
          (bytes[++i] & 63);
      } else
        throw (
          "UTF-8 decode: unknown multibyte start 0x" +
          c.toString(16) +
          " at index " +
          (i - 1)
        );
      ++i;
    }

    if (c <= 0xffff) s += String.fromCharCode(c);
    else if (c <= 0x10ffff) {
      c -= 0x10000;
      s += String.fromCharCode((c >> 10) | 0xd800);
      s += String.fromCharCode((c & 0x3ff) | 0xdc00);
    } else
      throw (
        "UTF-8 decode: code point 0x" + c.toString(16) + " exceeds UTF-16 reach"
      );
  }
  return s;
}

//=============================================================================
//
// 數字左邊補0
//=============================================================================
function padLeft(str, len) {
  str = "" + str;
  return str.length >= len
    ? str
    : new Array(len - str.length + 1).join("0") + str;
}

//=============================================================================
//
// 數字右邊補0
//=============================================================================
function padRight(str, lenght) {
  if (str.length >= lenght) return str;
  else return padRight(str + "0", lenght);
}

//=============================================================================
//
// 轉換 Date 物件成字串
//=============================================================================
function DateToString(date) {
  return (
    date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
  );
}

function DateMonthToString(date) {
  var mm = date.getMonth() + 1;

  return date.getFullYear() + "-" + ((mm > 9 ? "" : "0") + mm);
}

//=============================================================================
//
// 取得該月的最後一天
//=============================================================================
function GetLastDayOfMonth(date) {
  var end_date = new Date(date.getTime());
  //將月份移至下個月份
  end_date.setMonth(end_date.getMonth() + 1);
  //設定為下個月份的第一天
  end_date.setDate(1);
  //將日期-1為當月的最後一天
  end_date.setDate(end_date.getDate() - 1);
  return end_date;
}

//=============================================================================
//
// 判斷selected options的值，null回傳0
//=============================================================================
function CheckOptionsValue(options) {
  if (options == "") options = 0;

  return options;
}

//=============================================================================
//
// 限制input輸入的按鍵，只允許數字
//=============================================================================
function number_only(e) {
  if (
    !(
      (
        (e.keyCode > 95 && e.keyCode < 106) || // 九宮格數字
        (e.keyCode > 47 && e.keyCode < 58) || // 直式數字
        e.keyCode === 8 || // backspace
        e.keyCode === 32 || // 空白鍵....
        (e.keyCode > 36 && e.keyCode < 41) || // 上下左右
        (e.keyCode > 111 && e.keyCode < 124) || // F1~F12
        e.keyCode === 17 || // Ctrl
        e.keyCode === 65 || // A
        e.keyCode === 67 || // C
        e.keyCode === 86 || // V
        e.keyCode === 88 || // X
        e.keyCode === 90 || // Z
        e.keyCode === 89
      ) // Y
    )
  ) {
    return false;
  }
}

//=============================================================================
//
// DESC: 容器轉換
//       把一個 tablesi{ "col01": [ "a0", "a1", .... ], "col02": [ "b0", "b1", .... ] ....} 依照 key_order 的順序與欄位
//       轉換成 { [  "a0", "b0", .... ], [  "a1", "b1", .... ]}
//=============================================================================
function TablesiToTableii(key_order, tablesi) {
  // 初始化 tableii 為空陣列
  let tableii = [];

  if (!key_order.length) return tableii; // 若 key_order 為空，直接回傳空陣列

  // 計算 tableii 需要的行數（tablesi 中最大的陣列長度）
  let max_rows = 0;
  for (const key of key_order) {
    if (tablesi.hasOwnProperty(key)) {
      max_rows = Math.max(max_rows, tablesi[key].length);
    }
  }

  // 先確保 tableii 有足夠的行
  tableii = Array.from({ length: max_rows }, () =>
    Array(key_order.length).fill(null),
  );

  // 遍歷 key_order，把 tablesi[key_order[x]][y] 放到 tableii[y][x]
  for (let x = 0; x < key_order.length; x++) {
    const key = key_order[x];
    if (tablesi.hasOwnProperty(key)) {
      const col_data = tablesi[key];
      for (let y = 0; y < col_data.length; y++) {
        tableii[y][x] = col_data[y];
      }
    }
  }
  return tableii;
}

//=============================================================================
//
// DESC: 根據指定欄位的值過濾資料
//       例如: filterTableByFieldValue(data, "status", "active")
//=============================================================================
function filterablesiByFieldValue(data, filterField, targetValue) {
  const length = data[filterField]?.length;
  if (!length) return {};

  // 1️⃣ 找出符合條件的 index
  const validIndexes = [];
  for (let i = 0; i < length; i++) {
    if (data[filterField][i] === targetValue) {
      validIndexes.push(i);
    }
  }

  // 2️⃣ 依據 index 過濾所有欄位資料
  const filtered = {};
  for (const key in data) {
    if (Array.isArray(data[key])) {
      filtered[key] = validIndexes.map((i) => data[key][i]);
    }
  }

  return filtered;
}

//=============================================================================
//
//
//=============================================================================
const strToBool = (str) => str === "1";

//=============================================================================
//
// DESC: 把 Date 物件轉換成字串 YYYY-MM-DD
//=============================================================================
function setInputDate(date, inputId) {
  const dateString = date.toISOString().slice(0, 10);
  document.getElementById(inputId).value = dateString;
}

//=============================================================================
//
// DESC: 隨機產生顏色值
//=============================================================================
function getRandomColorRGB(alpha) {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const a = alpha;
  return `rgb(${r}, ${g}, ${b}, ${a})`;
}

//=============================================================================
//
// DESC: 判斷字串正不正確
//=============================================================================
function IsValidString(str) {
  if (str === null || str === undefined || str === "") {
    return false;
  }
  return true;
}

//=============================================================================
//
// DESC: 通用 API 請求包裝器 (Promise wrapper)
//       負責將 callback 風格轉為 Promise，並統一處理 JSON 解析與錯誤碼檢查
//       底層 lib.proc.net.js 已內建重試機制，此處僅負責流程控制。
//=============================================================================
function apiCall(apiFunc, ...args) {
  return new Promise((resolve, reject) => {
    try {
      let abortController = null;
      // 偵測最後一個參數是否為 AbortController
      if (args.length > 0 && args[args.length - 1] instanceof AbortController) {
        abortController = args.pop();
      }

      const callback = (ok, result) => {
        if (!ok) {
          // 網路或伺服器底層錯誤 (lib.proc.net.js 已處理重試)
          const err = new Error("Network or Server Error");
          // 捕捉來自底層 lib.proc.net.js 的 AbortError
          if (
            (result && result.name === "AbortError") ||
            (abortController && abortController.signal.aborted)
          ) {
            err.name = "AbortError";
          }
          reject(err);
          return;
        }
        try {
          const jsonObject = JSON.parse(result);
          // 若全域有定義 show_errno，則用來檢查並顯示錯誤
          if (
            typeof show_errno === "function" &&
            show_errno(jsonObject.errno) !== ""
          ) {
            reject(new Error("Handled Server Error"));
            return;
          }
          resolve(jsonObject);
        } catch (e) {
          console.error("[apiCall] JSON Parse Error:", e);
          reject(new Error("Invalid JSON response"));
        }
      };

      // 依據模組層的參數順序：(..., callback, abortController)
      if (abortController) {
        apiFunc(...args, callback, abortController);
      } else {
        apiFunc(...args, callback);
      }
    } catch (e) {
      console.error("[apiCall] Execution Error:", e);
      reject(e);
    }
  });
}

//=============================================================================
//
// [資安防護] DOMUtil: 安全的 DOM 節點建立工具
// DESC: 強制透過原生 DOM API 建立節點，徹底取代危險的 innerHTML 字串拼接。
//       傳入的 text 節點會自動轉義 (TextNode)，完美防禦 XSS 攻擊。
//=============================================================================
window.DOMUtil = {
  create: function (tagName, attributes, ...children) {
    const el = document.createElement(tagName);
    if (attributes) {
      for (const key in attributes) {
        if (key === "className") {
          el.className = attributes[key];
        } else if (key === "innerHTML") {
          // 僅允許明確指定 innerHTML 的情況 (例如靜態的 IconFont)
          el.innerHTML = attributes[key];
        } else {
          el.setAttribute(key, attributes[key]);
        }
      }
    }
    children.forEach((child) => {
      if (child === null || child === undefined) return;
      if (typeof child === "string" || typeof child === "number") {
        // 所有字串皆作為純文字節點插入，瀏覽器不會將其解析為可執行腳本
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        el.appendChild(child);
      }
    });
    return el;
  },
};
