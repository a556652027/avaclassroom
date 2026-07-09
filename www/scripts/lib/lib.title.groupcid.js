// 通用標題更新函數 - 顯示當前組織 ID

/**
 * 更新頁面標題為當前組織 ID
 * @param {string} titleSelector - 標題元素的選擇器，預設為 '.page-caption h1'
 * @param {string} prefix - 標題前綴，預設為空
 * @param {string} suffix - 標題後綴，預設為空
 */
function updatePageTitleWithGroupCid(
  titleSelector = ".page-caption h1",
  prefix = "",
  suffix = "",
) {
  try {
    // 從 sessionStorage 獲取組織 ID
    const groupCid = window.sessionStorage.getItem("group_cid");

    if (!groupCid || !IsValidString(groupCid)) {
      console.warn("No valid group_cid found in sessionStorage");
      return;
    }

    // [優化] 優先顯示真實名稱 (select_group_name 或 group_name)，若無才退回顯示 ID (groupCid)
    let displayName = groupCid;
    let curName = window.sessionStorage.getItem("select_group_name") || window.sessionStorage.getItem("group_name");
    
    // [修正] 當 select_group_name 被移除（例如從學校退回公司時），若當前 groupCid 不是學校 (不以 sch_ 開頭)，則優先使用登入時儲存的公司名稱 company_group_name
    if ((!curName || curName === "undefined" || curName === "null" || !IsValidString(curName)) && groupCid && !groupCid.startsWith("sch_")) {
      const companyName = window.sessionStorage.getItem("company_group_name");
      if (companyName && IsValidString(companyName)) {
        curName = companyName;
      }
    }

    if (curName && curName !== "undefined" && curName !== "null" && IsValidString(curName)) {
      displayName = curName;
    }

    // 找到標題元素
    const titleElements = document.querySelectorAll(titleSelector);

    if (titleElements.length === 0) {
      // 如果找不到預設選擇器，嘗試其他可能的選擇器
      const fallbackSelectors = [
        "h1",
        ".page-title",
        "[data-org-title]",
        ".page-caption h2",
      ];

      let found = false;
      for (const selector of fallbackSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          elements[0].textContent = `${prefix}${displayName}${suffix}`;
          found = true;
          console.log(`Updated title using fallback selector: ${selector}`);
          break;
        }
      }

      if (!found) {
        console.warn("No title element found to update");
      }
      return;
    }

    // 更新所有找到的標題元素
    titleElements.forEach((element, index) => {
      element.textContent = `${prefix}${displayName}${suffix}`;
      if (index === 0) {
        console.log(`Updated page title to: ${prefix}${displayName}${suffix}`);
      }
    });
  } catch (error) {
    console.error("Error updating page title with group_cid:", error);
  }
}

/**
 * 在 DOM 載入完成後自動更新標題
 * @param {string} prefix - 標題前綴
 * @param {string} suffix - 標題後綴
 */
function initAutoUpdateTitle(prefix = "", suffix = "") {
  document.addEventListener("DOMContentLoaded", function () {
    // 延遲執行確保其他初始化完成
    setTimeout(() => {
      updatePageTitleWithGroupCid(".page-caption h1", prefix, suffix);
    }, 500);
  });
}

/**
 * 監聽 sessionStorage 變化並更新標題
 * @param {string} prefix - 標題前綴
 * @param {string} suffix - 標題後綴
 */
let _groupCidWatchTimer = null;
let _groupCidStorageHandler = null;

function watchGroupCidChanges(prefix = "", suffix = "") {
  // 移除舊的監聽器，防止 Memory Leak
  if (_groupCidStorageHandler) {
    window.removeEventListener("storage", _groupCidStorageHandler);
  }

  _groupCidStorageHandler = function (e) {
    if (e.key === "group_cid" && e.newValue) {
      updatePageTitleWithGroupCid(".page-caption h1", prefix, suffix);
    }
  };
  window.addEventListener("storage", _groupCidStorageHandler);

  // 由於 sessionStorage 在同一頁面內變化不會觸發 storage 事件
  // 我們需要手動檢查變化
  let lastGroupCid = window.sessionStorage.getItem("group_cid");

  if (_groupCidWatchTimer) {
    clearInterval(_groupCidWatchTimer);
  }
  _groupCidWatchTimer = setInterval(() => {
    const currentGroupCid = window.sessionStorage.getItem("group_cid");
    if (currentGroupCid !== lastGroupCid) {
      lastGroupCid = currentGroupCid;
      updatePageTitleWithGroupCid(".page-caption h1", prefix, suffix);
    }
  }, 1000);
}
