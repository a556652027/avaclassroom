// home.html 的頁面事件操控程式碼相關

// [新增] 動態載入腳本的輔助函式
function loadScript(src, callback) {
  if (document.querySelector(`script[src="${src}"]`)) {
    if (callback) callback();
    return;
  }
  const script = document.createElement("script");
  script.src = src;
  script.type = "text/javascript";
  script.onload = callback;
  script.onerror = () => console.error(`Failed to load script: ${src}`);
  document.head.appendChild(script);
}

/*___________________________________________________________________________________*/

/*___________________________________________________________________________________*/
// 列表上面顯示的欄位對照表 與 順序
let key_device_list_info = [
  "create_time",
  "spec04",
  "device_cid",
  "license_key",
];

let key_history_list_info = [
  "create_time",
  "event_type",
  "label",
  "content_text",
];

/* 全域變數 - 快取與狀態 */
window._allDeviceRecordsCache = null; // [修正] 移除客戶端快取
window._revokedDeviceRecordsCache = null;
window._revokedLicenseRecordsCache = null;

// [Phase 1 優化] 主動清除其他頁面的全域快取，避免切換頁面時發生記憶體洩漏
if (typeof window._allLicenseRecordsCache !== "undefined")
  window._allLicenseRecordsCache = null;

// 用於管理 Modal 事件生命週期的控制器
window._deviceModalEventController = null;

let _g_device_request_controller = null;
let _g_history_request_controller = null;

// [新增] 分頁與排序狀態
let _g_current_page = 1;
let _g_revoked_current_page = 1;
let _g_rows_per_page = 10;
let currentSortField = "create_time";
let currentSortOrder = "desc";

/*___________________________________________________________________________________*/
// function 相關
const def_rows_per_page = 10;

// 全選處理函數
function handleSelectAll() {
  let selectAllCheckbox = document.getElementById("selectAll");
  let rowCheckboxes = document.querySelectorAll(".row-checkbox");
  rowCheckboxes.forEach(function (checkbox) {
    checkbox.checked = selectAllCheckbox.checked;
  });
}

// 重新綁定全選功能
function rebindSelectAllFunction() {
  let selectAllCheckbox = document.getElementById("selectAll");
  if (selectAllCheckbox) {
    // 移除舊的事件監聽器
    selectAllCheckbox.removeEventListener("change", handleSelectAll);
    // 添加新的事件監聽器
    selectAllCheckbox.addEventListener("change", handleSelectAll);
  }
}

// 重新綁定搜尋功能
function rebindSearchFunction() {
  let searchInput = document.getElementById("device-search-input");
  if (searchInput) {
    // 清空搜尋框
    searchInput.value = "";
    // 移除舊的事件監聽器
    searchInput.removeEventListener("input", handleSearchInput);

    // 添加新的事件監聽器
    searchInput.addEventListener("input", handleSearchInput);
  }
}

// 處理搜尋輸入 (加入簡單的防抖動)
let searchTimeout;
function handleSearchInput() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    SelectDeviceAll({ page: 1 });
  }, 1000);
}

// [移除] 客戶端過濾與排序函式，改由後端處理
// filterDevicesByKeyword, sortTablesiData

async function GotoPageSelectDeviceAll() {
  await SelectDeviceAll();
  change_page("page01");
}

async function GotoPageUpdateDeviceOne(device_cid) {
  await SelectDeviceOne(device_cid);
  change_page("page02");
}

async function GotoPageHistoryDevice(device_cid) {
  await SelectHistoryAll(device_cid);
  change_page("page04");
}

async function GotoPageRevokedDevices() {
  await SelectRevokedDevices();
  change_page("page05");
}

// 生成設備資料的 Excel 檔案
async function generateDevicesExcel(devicesList) {
  console.log(
    "[generateDevicesExcel] 開始生成 Excel，筆數:",
    devicesList.length,
  );

  // [Plan 2 優化] 惰性載入 SheetJS (XLSX)，使用原生 Promise 確保絕對載入完成
  if (typeof XLSX === 'undefined') {
    VisibleLoaderElement(true);
    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "vender/node_modules/xlsx/dist/xlsx.full.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error("Failed to load XLSX library:", error);
      alert("匯出功能載入失敗，請稍後再試。");
      return;
    } finally {
      VisibleLoaderElement(false);
    }
  }

  // 準備 Excel 資料
  const headers = [
    window.localeData.device.device_cid,
    window.localeData.common.create_time,
    window.localeData.device.active_time,
    window.localeData.common.product_type,
    window.localeData.common.license_Key,
    window.localeData.member.record_state,
    "Spec00",
    "Spec01",
    "Spec02",
    "Spec03",
    "Spec04",
    "Spec05",
    "Spec06",
    "Spec07",
    window.localeData.common.note00,
  ];
  const excelData = [headers];

  devicesList.forEach((device) => {
    const row = [
      (device.device_cid && device.device_cid[0]) || "",
      (device.create_time && device.create_time[0]) || "",
      (device.active_time && device.active_time[0]) || "",
      (device.product_type && device.product_type[0]) || "",
      (device.license_key && device.license_key[0]) || "",
      device.record_state && device.record_state[0] === "1"
        ? window.localeData.device.status_on
        : window.localeData.device.status_off,
      (device.spec00 && device.spec00[0]) || "",
      (device.spec01 && device.spec01[0]) || "",
      (device.spec02 && device.spec02[0]) || "",
      (device.spec03 && device.spec03[0]) || "",
      (device.spec04 && device.spec04[0]) || "",
      (device.spec05 && device.spec05[0]) || "",
      (device.spec06 && device.spec06[0]) || "",
      (device.spec07 && device.spec07[0]) || "",
      (device.note00 && device.note00[0]) || "",
    ];
    excelData.push(row);
  });

  // 建立工作簿
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(excelData);

  // 設定欄寬
  ws["!cols"] = [
    { wch: 20 }, // 設備編號
    { wch: 20 }, // 建立時間
    { wch: 20 }, // 啟用時間
    { wch: 15 }, // 產品類型
    { wch: 30 }, // 授權金鑰
    { wch: 10 }, // 狀態
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 }, // Specs
    { wch: 30 }, // 備註
  ];

  // 加入工作表
  XLSX.utils.book_append_sheet(wb, ws, "設備列表");

  // 生成檔名 (使用設備編號和日期)
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const fileName = `${window.localeData.common.export_filename_device}_${year}${month}${day}_${hours}${minutes}${seconds}.xlsx`;

  // 匯出檔案
  XLSX.writeFile(wb, fileName);

  console.log("[generateDevicesExcel] Excel 檔案已生成:", fileName);
}

// 顯示自動消失的提示訊息
function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText =
    "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(0, 0, 0, 0.8); color: white; padding: 20px 40px; border-radius: 8px; z-index: 10000; font-size: 16px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2);";
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = "opacity 0.5s ease";
    toast.style.opacity = "0";
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 500);
  }, 3000);
}

// 下載選中設備的 Excel 檔案（支援多選）
async function downloadSelectedDevicesExcel() {
  const checkedBoxes = document.querySelectorAll(".row-checkbox:checked");

  if (checkedBoxes.length === 0) {
    alert(GetLocalData("device.msg_select_export") || "請選擇要匯出的設備");
    return;
  }

  const deviceCids = Array.from(checkedBoxes)
    .map((checkbox) => {
      const row = checkbox.closest("tr");
      if (row && row.cells.length > 3) {
        return row.cells[3].textContent.trim();
      }
      return null;
    })
    .filter((cid) => cid !== null);

  if (deviceCids.length === 0) {
    alert(GetLocalData("device.msg_cannot_get_id") || "無法獲取選中設備的ID");
    return;
  }

  console.log(
    "[downloadSelectedDevicesExcel] 準備匯出",
    deviceCids.length,
    "個設備的 Excel",
  );
  VisibleLoaderElement(true);

  try {
    // 使用 apiCall 包裝請求
    const fetchDevicePromise = async (deviceCid) => {
      try {
        const json_object = await apiCall(
          CsRequestDeviceSelectOneRecord,
          deviceCid,
        );
        if (json_object.records) {
          // 確保 device_cid 存在於 record 中
          if (!json_object.records.device_cid) {
            json_object.records.device_cid = [deviceCid];
          }
          return json_object.records;
        }
      } catch (e) {
        console.error(`解析設備 ${deviceCid} 失敗:`, e);
      }
      return null;
    };

    // 限制並行請求數量
    const CONCURRENCY_LIMIT = 3;
    const promiseAllLimit = async (items, limit, fn) => {
      const results = [];
      const executing = [];
      for (const item of items) {
        const p = fn(item).then((res) => results.push(res));
        executing.push(p);
        if (executing.length >= limit) {
          await Promise.race(executing);
          // 移除已完成的 Promise
          // 簡單處理：全部重整有點複雜，這裡用簡單的 await 確保不會一次發太多
          // 更好的實作可以使用 Promise queue，但這裡維持原邏輯結構
          executing.splice(0, executing.indexOf(p) + 1);
        }
      }
      await Promise.all(executing);
      return results;
    };

    // 簡單的並行控制 (原邏輯的 async 版本)
    const chunkArray = (array, size) => {
      const result = [];
      for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
      }
      return result;
    };

    let allDevices = [];
    const chunks = chunkArray(deviceCids, CONCURRENCY_LIMIT);

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map((cid) => fetchDevicePromise(cid)),
      );
      allDevices = allDevices.concat(chunkResults.filter((r) => r !== null));
    }

    if (allDevices.length > 0) {
      console.log("[downloadSelectedDevicesExcel] 開始生成整合 Excel 檔案");
      generateDevicesExcel(allDevices);
      if (allDevices.length === deviceCids.length) {
        showToast(
          (
            GetLocalData("device.msg_export_success") ||
            "已成功匯出 {{count}} 筆資料"
          ).replace("{{count}}", allDevices.length),
        );
      } else {
        alert(
          (
            GetLocalData("device.msg_export_partial") ||
            "匯出完成，但有部分資料讀取失敗。\n預計: {{total}} 筆\n成功: {{success}} 筆\n失敗: {{failed}} 筆"
          )
            .replace("{{total}}", deviceCids.length)
            .replace("{{success}}", allDevices.length)
            .replace("{{failed}}", deviceCids.length - allDevices.length),
        );
      }
    } else {
      alert(GetLocalData("device.msg_cannot_get_data") || "無法獲取設備資料");
    }
  } catch (err) {
    console.error("匯出過程發生錯誤:", err);
    alert(GetLocalData("device.msg_export_failed") || "匯出失敗，請稍後再試");
  } finally {
    VisibleLoaderElement(false);
  }
}

// 匯出所有（符合篩選條件）的設備
async function downloadAllDevices() {
  let member_cid = window.sessionStorage.getItem("member_cid") || "";
  let group_cid = window.sessionStorage.getItem("select_group_cid") || window.sessionStorage.getItem("group_cid") || "";
  let product_type = window.sessionStorage.getItem("product_type") || "";
  const userTier = window.sessionStorage.getItem("tier");
  const isDistributor = userTier === "3";
  let condition_value = isDistributor ? `%%; ${group_cid}; 1; ${product_type}; %%` : `${member_cid}; ${group_cid}; 1; ${product_type}; %%`;
  let condition_type = window._k_search_condition_type_by_agent_cid__and__owner_cid__and__record_state__and__product_type__and__spec04;

  const b_time_el = document.getElementById("device_list-begin_time");
  const e_time_el = document.getElementById("device_list-end_time");
  let b_time = b_time_el ? b_time_el.value : "";
  let e_time = e_time_el ? e_time_el.value : "";
  if (b_time) b_time = b_time.replace(/\//g, "-");
  if (e_time) e_time = e_time.replace(/\//g, "-");
  if (b_time && b_time.length === 10) b_time += " 00:00:00";
  if (e_time && e_time.length === 10) e_time += " 23:59:59";

  const search_keyword = document.getElementById("device-search-input")?.value || "";

  // [資安與UI防護] 確保舊的遮罩已移除，防止疊加
  const oldOverlay = document.getElementById("device-export-overlay");
  if (oldOverlay) oldOverlay.remove();

  // 動態建立進度條 UI 防範 XSS
  const overlay = document.createElement("div");
  overlay.id = "device-export-overlay";
  overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:10000; display:flex; justify-content:center; align-items:center;";
  const box = document.createElement("div");
  box.style.cssText = "background:white; padding:30px; border-radius:12px; width:400px; text-align:center; box-shadow:0 4px 20px rgba(0,0,0,0.2); font-family: sans-serif;";
  box.innerHTML = `
      <h3 style="margin:0 0 10px 0; color:#214f7c; font-size:18px;">資料匯出中</h3>
      <p id="export-progress-text" style="color:#666; font-size:14px; margin-bottom:15px;">正在準備任務...</p>
      <div style="width:100%; background:#e5e8ea; border-radius:8px; height:16px; overflow:hidden;">
          <div id="export-progress-bar" style="width:0%; height:100%; background:#ee963f; transition:width 0.3s ease;"></div>
      </div>
  `;
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const updateProgress = (text, percent) => {
    const txtEl = document.getElementById("export-progress-text");
    const barEl = document.getElementById("export-progress-bar");
    if (txtEl) txtEl.textContent = text;
    if (barEl) barEl.style.width = percent + "%";
  };

  try {
    // [僵屍遮罩防護] 將任務綁定至全域視圖 Controller，確保切換頁面時遮罩必將自毀
    const exportController = new AbortController();
    if (window._deviceStaticEventController) {
      window._deviceStaticEventController.signal.addEventListener("abort", () => {
        exportController.abort();
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
      });
    }

    // 1. 發起匯出請求
    const json_object = await apiCall(
      CsRequestDeviceExportStart,
      condition_type, condition_value, b_time, e_time,
      search_keyword, currentSortField, currentSortOrder, exportController
    );

    const jobId = json_object.job_id;
    if (!jobId) throw new Error("無法取得 Job ID");

    // 2. 開始輪詢進度
    const pollInterval = 2000;
    let failCount = 0; // [新增] 前端網路重試計數器
    const pollStatus = async () => {
      if (exportController.signal.aborted) return; // 視圖切換，直接終止輪詢
      try {
        const statusRes = await apiCall(CsRequestDeviceExportStatus, jobId, exportController);
        failCount = 0; // 成功取得則重置計數

        if (statusRes.status === "processing") {
          const total = parseInt(statusRes.total) || 0;
          const processed = parseInt(statusRes.processed) || 0;
          const percent = total === 0 ? 0 : Math.round((processed / total) * 100);

          updateProgress(`處理中... ${processed.toLocaleString()} / ${total.toLocaleString()} 筆`, percent);
          setTimeout(pollStatus, pollInterval);
        }
        else if (statusRes.status === "completed") {
          updateProgress("匯出完成！正在下載檔案...", 100);

          CsRequestDeviceExportDownload(jobId, (err, downloadedBlob) => {
            if (document.body.contains(overlay)) document.body.removeChild(overlay);
            if (err || !downloadedBlob || downloadedBlob.size === 0) {
              alert("檔案下載失敗，無法從伺服器取得資料");
              return;
            }
            const blob = new Blob([downloadedBlob], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${window.localeData.common.export_filename_device}_${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          });
        } else {
          throw new Error("匯出狀態異常");
        }
      } catch (e) {
        failCount++;
        if (failCount < 5) {
          console.warn(`輪詢進度失敗，進行重試 (${failCount}/5)...`);
          setTimeout(pollStatus, pollInterval);
        } else {
          if (document.body.contains(overlay)) document.body.removeChild(overlay);
          console.error(e);
          alert("查詢匯出進度失敗，已達最大重試次數");
        }
      }
    };

    setTimeout(pollStatus, 1000);

  } catch (e) {
    if (document.body.contains(overlay)) document.body.removeChild(overlay);
    alert(GetLocalData("device.msg_exec_error") || "匯出失敗");
  }
}

// 批量刪除設備（設置record_state為0）
function DeleteSelectedDevices() {
  // [資安防護 - BAC 越權攔截] 預設拒絕：Tier >= 3 (如經銷商) 禁止刪除設備
  const tier = parseInt(window.sessionStorage.getItem("tier"), 10);
  if (isNaN(tier) || tier >= 3) {
    alert(window.localeData?.common?.deny || "權限不足，無法執行此操作。");
    return;
  }

  let checkedBoxes = document.querySelectorAll(".row-checkbox:checked");

  if (checkedBoxes.length === 0) {
    alert(GetLocalData("device.msg_select_delete") || "請選擇要刪除的設備");
    return;
  }

  const modal = document.getElementById("delete-confirmation-modal");
  const messageEl = document.getElementById("delete-modal-message");
  const itemsEl = document.getElementById("delete-modal-items");
  const confirmBtn = document.getElementById("delete-modal-confirm");
  const cancelBtn = document.getElementById("delete-modal-cancel");

  if (!modal || !messageEl || !itemsEl || !confirmBtn || !cancelBtn) {
    // Fallback to confirm if modal elements are not found
    if (
      !confirm(
        (
          GetLocalData("device.msg_confirm_delete") ||
          "確定要刪除這 {{count}} 個設備嗎？"
        ).replace("{{count}}", checkedBoxes.length),
      )
    ) {
      return;
    }
    executeDeleteDeviceLogic(checkedBoxes);
    return;
  }

  messageEl.textContent = (
    GetLocalData("device.msg_confirm_delete") ||
    "確定要刪除這 {{count}} 個設備嗎？"
  ).replace("{{count}}", checkedBoxes.length);

  itemsEl.innerHTML = "";
  checkedBoxes.forEach((checkbox) => {
    const row = checkbox.closest("tr");
    if (row && row.cells.length > 3) {
      // 設備CID在第3個cell（索引2，因為第0個是checkbox）
      const deviceCid = row.cells[3].textContent.trim();
      if (deviceCid) {
        const item = document.createElement("div");
        item.textContent = deviceCid;
        item.style.padding = "4px 0";
        itemsEl.appendChild(item);
      }
    }
  });

  modal.style.display = "flex";

  // [Phase 1 優化] 使用 AbortController 取代 cloneNode 來重置事件監聽器
  if (window._deviceModalEventController)
    window._deviceModalEventController.abort();
  window._deviceModalEventController = new AbortController();
  const signal = window._deviceModalEventController.signal;

  cancelBtn.addEventListener(
    "click",
    () => {
      modal.style.display = "none";
    },
    { signal },
  );

  confirmBtn.addEventListener(
    "click",
    () => {
      modal.style.display = "none";
      executeDeleteDeviceLogic(checkedBoxes);
    },
    { signal },
  );
}

// 執行實際的刪除邏輯
async function executeDeleteDeviceLogic(checkedBoxes) {
  VisibleLoaderElement(true);

  let successCount = 0;
  let errorCount = 0;

  try {
    for (const checkbox of checkedBoxes) {
      let row = checkbox.closest("tr");
      let deviceCid = "";

      if (row && row.cells.length > 3) {
        deviceCid = row.cells[3].textContent.trim();
      }

      if (!deviceCid) {
        console.error("[executeDeleteDeviceLogic] 無法獲取設備ID");
        errorCount++;
        continue;
      }

      try {
        let record = null;

        console.log(`[executeDeleteDeviceLogic] Fetching from API for device: ${deviceCid}`);
        const json_object = await apiCall(
          CsRequestDeviceSelectOneRecord,
          deviceCid,
        );
        record = json_object.records;

        if (!record) {
          console.error(
            `[executeDeleteDeviceLogic] Fetched data for device_cid: ${deviceCid} is empty.`,
          );
          errorCount++;
          continue;
        }

        // Step 2: 檢查設備是否已經被刪除
        const currentRecordState = record.record_state
          ? record.record_state[0]
          : "1";
        if (currentRecordState === "0") {
          console.log(
            `[executeDeleteDeviceLogic] Device already deleted: ${deviceCid}`,
          );
          successCount++;
          continue;
        }

        // Step 3: 準備完整的設備資料對象
        var deviceData = Object.create(DeviceData);

        // 填入所有欄位
        deviceData.device_cid = record.device_cid
          ? record.device_cid[0]
          : deviceCid;
        deviceData.product_type = record.product_type
          ? record.product_type[0]
          : "";
        deviceData.create_time = record.create_time
          ? record.create_time[0]
          : "";
        deviceData.record_state = "0"; // 設為刪除狀態
        deviceData.active_time = record.active_time
          ? record.active_time[0]
          : "";
        deviceData.owner_type = record.owner_type ? record.owner_type[0] : "";
        deviceData.owner_cid = record.owner_cid ? record.owner_cid[0] : "";
        deviceData.agent_cid = record.agent_cid ? record.agent_cid[0] : "";
        deviceData.license_key = record.license_key
          ? record.license_key[0]
          : "";
        deviceData.customer_name = record.customer_name
          ? record.customer_name[0]
          : "";
        deviceData.customer_gender = record.customer_gender
          ? record.customer_gender[0]
          : "";
        deviceData.customer_birthday = record.customer_birthday
          ? record.customer_birthday[0]
          : "";
        deviceData.customer_phone = record.customer_phone
          ? record.customer_phone[0]
          : "";
        deviceData.customer_postalcode = record.customer_postalcode
          ? record.customer_postalcode[0]
          : "";
        deviceData.customer_address = record.customer_address
          ? record.customer_address[0]
          : "";
        deviceData.customer_email = record.customer_email
          ? record.customer_email[0]
          : "";
        deviceData.spec00 = record.spec00 ? record.spec00[0] : "";
        deviceData.spec01 = record.spec01 ? record.spec01[0] : "";
        deviceData.spec02 = record.spec02 ? record.spec02[0] : "";
        deviceData.spec03 = record.spec03 ? record.spec03[0] : "";
        deviceData.spec04 = record.spec04 ? record.spec04[0] : "";
        deviceData.spec05 = record.spec05 ? record.spec05[0] : "";
        deviceData.spec06 = record.spec06 ? record.spec06[0] : "";
        deviceData.spec07 = record.spec07 ? record.spec07[0] : "";
        deviceData.note00 = record.note00 ? record.note00[0] : "";

        // Step 4: 發送更新請求
        await apiCall(CsRequestDeviceUpdateOneRecord, deviceData);
        console.log(
          `[executeDeleteDeviceLogic] Successfully deleted device: ${deviceCid}`,
        );
        successCount++;
      } catch (e) {
        if (e.message !== "Handled Server Error") {
          console.error(
            `[executeDeleteDeviceLogic] Error processing device ${deviceCid}:`,
            e,
          );
        }
        errorCount++;
      }
    }

    alert(
      (
        GetLocalData("device.msg_delete_result") ||
        "刪除完成。成功 {{success}} 個，失敗 {{failed}} 個。"
      )
        .replace("{{success}}", successCount)
        .replace("{{failed}}", errorCount),
    );
    if (successCount > 0) {
      SelectDeviceAll(); // 重新載入設備列表
    }
  } catch (err) {
    console.error("批量刪除過程發生嚴重錯誤:", err);
    alert(
      GetLocalData("device.msg_exec_error") ||
      "執行過程中發生錯誤，請重新整理頁面檢查",
    );
  } finally {
    VisibleLoaderElement(false);
  }
}

// 【優化】輔助函數：渲染表格
function renderDeviceTable(json_tablesi, totalCount) {
  var element_table = document.getElementById("device_list-list_information");
  if (!element_table) return;

  let tbody = element_table.querySelector("tbody");
  if (!tbody) {
    tbody = document.createElement("tbody");
    element_table.appendChild(tbody);
  }

  // 清空現有內容
  tbody.innerHTML = "";

  if (
    !json_tablesi ||
    Object.keys(json_tablesi).length === 0 ||
    (json_tablesi.device_cid && json_tablesi.device_cid.length === 0)
  ) {
    return;
  }

  // 使用 DocumentFragment 優化渲染
  const fragment = document.createDocumentFragment();
  const count = json_tablesi.device_cid.length;

  for (let i = 0; i < count; i++) {
    const row = document.createElement("tr");

    // 處理 record_state (啟用/停用樣式)
    let record_state = json_tablesi.record_state
      ? json_tablesi.record_state[i]
      : "1";
    let disabled_color = "#d6d6d6ff";
    if (record_state === "0") {
      row.style.backgroundColor = disabled_color;
    }

    // [資安與效能優化] 1. Checkbox (Row Checkbox)
    const inputCheck = DOMUtil.create("input", {
      type: "checkbox",
      className: "row-checkbox",
      name: "deviceCheckbox",
    });
    const cellCheckbox = DOMUtil.create("td", null, inputCheck);
    row.appendChild(cellCheckbox);

    // 2. 資料欄位 (依據 key_device_list_info 順序: create_time, spec04, device_cid, license_key)

    // Create Time
    const cellTime = document.createElement("td");
    cellTime.textContent = json_tablesi.create_time
      ? json_tablesi.create_time[i]
      : "";
    row.appendChild(cellTime);

    // Spec04 (型號/規格)
    const cellSpec = document.createElement("td");
    cellSpec.textContent = json_tablesi.spec04 ? json_tablesi.spec04[i] : "";
    row.appendChild(cellSpec);

    // Device CID (設備編號)
    const cellCid = document.createElement("td");
    cellCid.textContent = json_tablesi.device_cid
      ? json_tablesi.device_cid[i]
      : "";
    row.appendChild(cellCid);

    // License Key
    const cellKey = document.createElement("td");
    cellKey.textContent = json_tablesi.license_key
      ? json_tablesi.license_key[i]
      : "";
    row.appendChild(cellKey);

    fragment.appendChild(row);
  }

  // 一次性掛載
  tbody.appendChild(fragment);
}

// 全選處理函數
function handleSelectAllRevoked() {
  let selectAllCheckbox = document.getElementById("selectAllRevoked");
  let rowCheckboxes = document.querySelectorAll(".row-checkbox-revoked");
  rowCheckboxes.forEach(function (checkbox) {
    checkbox.checked = selectAllCheckbox.checked;
  });
}


let _is_rendering_pagination = false;
// [重構] 分頁渲染邏輯
function renderPagination(totalRecords) {
  let order_table_page = document.getElementById("device_list-list_pagination");
  if (order_table_page) {
    _is_rendering_pagination = true;
    tablepage_d(
      order_table_page,
      def_rows_per_page,
      totalRecords,
      function (now_index, count_of_page) {
        if (_is_rendering_pagination) return; // 阻斷初始化時的同步回呼
        // now_index 是 offset，轉換成目標頁碼
        let n = Number(now_index) || 0;
        let c = Number(count_of_page) || def_rows_per_page;
        const target_page = Math.floor(n / c) + 1;
        // 【防無窮迴圈】避免 tablepage_d 初始化時同步觸發 callback 造成無限遞迴
        if (target_page !== _g_current_page && !isNaN(target_page)) {
          SelectDeviceAll({ page: target_page, keepFilters: true });
        }
      },
    );
    _is_rendering_pagination = false;
  }
}

/*___________________________________________________________________________________*/
async function SelectDeviceAll(options = {}) {
  const { page = 1, keepFilters = false } = options;
  _g_current_page = page;

  // 如果不是保持過濾條件 (例如：點擊日期搜尋)，則重設頁碼和搜尋/排序狀態
  if (!keepFilters) {
    _g_current_page = 1;
    // currentSortField 和 search keyword 從 UI 元素讀取，不需在此重設
  }

  const offset = (_g_current_page - 1) * _g_rows_per_page;

  // 搜尋條件
  let condition_type =
    window._k_search_condition_type_by_agent_cid__and__owner_cid__and__record_state__and__product_type__and__spec04;

  // 條件的內容
  console.log(condition_type);
  // [修正] 安全讀取 Session 參數，避免 null 導致查詢失敗
  let member_cid = window.sessionStorage.getItem("member_cid") || "";
  let group_cid =
    window.sessionStorage.getItem("select_group_cid") ||
    window.sessionStorage.getItem("group_cid") ||
    "";
  let product_type = window.sessionStorage.getItem("product_type") || "";

  // [新增] 權限判斷：若是經銷商，強制查詢所有 Agent (%%)，否則依 Member ID
  const userTier = window.sessionStorage.getItem("tier");
  const isDistributor = userTier === "3";

  let condition_value;
  if (isDistributor) {
    // 經銷商: 查詢旗下所有 Agent (%%)
    condition_value = `%%; ${group_cid}; 1; ${product_type}; %%`;
  } else {
    // 管理員: 依 Member ID 查詢
    condition_value = `${member_cid}; ${group_cid}; 1; ${product_type}; %%`;
  }

  const b_time_el = document.getElementById("device_list-begin_time");
  const e_time_el = document.getElementById("device_list-end_time");
  let b_time = b_time_el ? b_time_el.value : "";
  let e_time = e_time_el ? e_time_el.value : "";

  // [修正]：標準化日期格式 (斜線轉橫線)
  if (b_time) b_time = b_time.replace(/\//g, "-");
  if (e_time) e_time = e_time.replace(/\//g, "-");

  // [修正]：補上時分秒
  if (b_time && b_time.length === 10) b_time += " 00:00:00";
  if (e_time && e_time.length === 10) e_time += " 23:59:59";

  // [新增] 讀取搜尋與排序條件
  const search_keyword =
    document.getElementById("device-search-input")?.value || "";
  const sort_field = currentSortField;
  const sort_order = currentSortOrder;

  console.log("Device Search Params:", {
    condition_value,
    b_time,
    e_time,
  });

  // 開啟loading dialog
  VisibleLoaderElement(true);

  if (_g_device_request_controller) {
    _g_device_request_controller.abort();
  }
  _g_device_request_controller = new AbortController();

  try {
    // [重構] 改為後端分頁請求
    const json_object = await apiCall(
      CsRequestDeviceSelectAllRecords,
      condition_type,
      condition_value,
      b_time,
      e_time,
      offset,
      _g_rows_per_page,
      search_keyword,
      sort_field,
      sort_order,
      _g_device_request_controller,
    );

    const records = json_object.records;
    const totalRecords = parseInt(json_object.total_records) || 0;

    // 渲染當前頁面的表格
    renderDeviceTable(records, totalRecords);

    // 只有在第一頁或過濾條件改變時，才需要重新渲染分頁元件
    if (_g_current_page === 1 || !keepFilters) {
      renderPagination(totalRecords);
    }
  } catch (e) {
    if (e.name === "AbortError") {
      console.log("Device SelectAll request aborted");
      return;
    }
    if (e.message !== "Handled Server Error") {
      console.error(e);
      showToast(
        GetLocalData("device.msg_read_failed_net") ||
        "資料讀取失敗，請檢查網路連線",
      );
    }
  } finally {
    VisibleLoaderElement(false);
  }
}

// 載入已撤銷的設備 (record_state = 0)
async function SelectRevokedDevices(options = {}) {
  const { page = 1, keepFilters = false } = options;
  if (!keepFilters) {
    _g_revoked_current_page = 1;
  } else {
    _g_revoked_current_page = page;
  }
  const offset = (_g_revoked_current_page - 1) * _g_rows_per_page;

  let condition_type = window._k_search_condition_type_by_agent_cid__and__owner_cid__and__record_state__and__product_type__and__spec04;
  let group_cid = window.sessionStorage.getItem("select_group_cid") || window.sessionStorage.getItem("group_cid") || "";
  let product_type = window.sessionStorage.getItem("product_type") || "";
  let condition_value = `%%; ${group_cid}; 0; ${product_type}; %%`;

  const b_time_el = document.getElementById("device_list-begin_time");
  const e_time_el = document.getElementById("device_list-end_time");
  let b_time = b_time_el
    ? b_time_el.value
    : sessionStorage.getItem("dashboard_begin_time") || "2000-01-01";
  let e_time = e_time_el
    ? e_time_el.value
    : sessionStorage.getItem("dashboard_end_time") || "2099-12-31";

  if (b_time) b_time = b_time.replace(/\//g, "-");
  if (e_time) e_time = e_time.replace(/\//g, "-");
  if (b_time && b_time.length === 10) b_time += " 00:00:00";
  if (e_time && e_time.length === 10) e_time += " 23:59:59";

  const search_keyword = document.getElementById("device-revoked-search-input")?.value.trim() || "";
  const sort_field = currentRevokedSortField;
  const sort_order = currentRevokedSortOrder;

  VisibleLoaderElement(true);

  if (_g_device_request_controller) {
    _g_device_request_controller.abort();
  }
  _g_device_request_controller = new AbortController();

  try {
    const json_object = await apiCall(
      CsRequestDeviceSelectAllRecords,
      condition_type,
      condition_value,
      b_time,
      e_time,
      offset,
      _g_rows_per_page,
      search_keyword,
      sort_field,
      sort_order,
      _g_device_request_controller,
    );

    let json_tablesi = json_object.records || {};
    const totalRecords = parseInt(json_object.total_records) || 0;

    // 綁定搜尋功能
    rebindRevokedSearchFunction();

    // 綁定全選功能
    rebindSelectAllRevokedFunction();

    renderRevokedDeviceTable(json_tablesi);

    if (_g_revoked_current_page === 1 || !keepFilters) {
      renderRevokedPagination(totalRecords);
    }
  } catch (e) {
    if (e.name === "AbortError") {
      console.log("Revoked Devices request aborted");
      return;
    }
    if (e.message !== "Handled Server Error") {
      console.error(e);
      showToast(
        GetLocalData("device.msg_read_failed_net") ||
        "資料讀取失敗，請稍後再試",
      );
    }
  } finally {
    VisibleLoaderElement(false);
  }
}

let _is_rendering_revoked_pagination = false;
function renderRevokedPagination(totalRecords) {
  let order_table_page = document.getElementById("device_revoked-list_pagination");
  if (order_table_page) {
    _is_rendering_revoked_pagination = true;
    tablepage_d(
      order_table_page,
      def_rows_per_page,
      totalRecords,
      function (now_index, count_of_page) {
        if (_is_rendering_revoked_pagination) return; // 阻斷初始化時的同步回呼
        // now_index 是 offset，轉換成目標頁碼
        let n = Number(now_index) || 0;
        let c = Number(count_of_page) || def_rows_per_page;
        const target_page = Math.floor(n / c) + 1;
        // 【防無窮迴圈】避免 tablepage_d 初始化時同步觸發 callback 造成無限遞迴
        if (target_page !== _g_revoked_current_page && !isNaN(target_page)) {
          SelectRevokedDevices({ page: target_page, keepFilters: true });
        }
      },
    );
    _is_rendering_revoked_pagination = false;
  }
}
// 【新增】安全的已撤銷設備表格渲染
function renderRevokedDeviceTable(json_tablesi) {
  let element_table = document.getElementById(
    "device_revoked-list_information",
  );
  if (!element_table) return;

  let tbody = element_table.querySelector("tbody");
  if (!tbody) {
    tbody = document.createElement("tbody");
    element_table.appendChild(tbody);
  }
  tbody.innerHTML = "";

  if (
    !json_tablesi ||
    !json_tablesi.device_cid ||
    json_tablesi.device_cid.length === 0
  )
    return;

  const fragment = document.createDocumentFragment();
  const count = json_tablesi.device_cid.length;

  for (let i = 0; i < count; i++) {
    const row = document.createElement("tr");
    row.style.backgroundColor = "#d6d6d6ff";

    const deviceCid = json_tablesi.device_cid[i] || "";

    // [資安與效能優化] Checkbox
    const inputCheck = DOMUtil.create("input", {
      type: "checkbox",
      className: "row-checkbox-revoked",
      "data-device-cid": deviceCid,
    });
    const cellCheckbox = DOMUtil.create("td", null, inputCheck);
    row.appendChild(cellCheckbox);

    // Data cells
    [
      json_tablesi.create_time ? json_tablesi.create_time[i] : "",
      json_tablesi.spec04 ? json_tablesi.spec04[i] : "",
      deviceCid,
      json_tablesi.license_key ? json_tablesi.license_key[i] : "",
    ].forEach((text) => {
      const td = document.createElement("td");
      td.textContent = text;
      row.appendChild(td);
    });

    fragment.appendChild(row);
  }
  tbody.appendChild(fragment);

  // 重新綁定該分頁的全選功能
  rebindSelectAllRevokedFunction();
}

// 搜尋已撤銷設備 (防抖動)
let revokedSearchTimeout;
function searchRevokedDevices() {
  clearTimeout(revokedSearchTimeout);
  revokedSearchTimeout = setTimeout(() => {
    SelectRevokedDevices({ page: 1 });
  }, 500);
}

// 綁定已撤銷設備的搜尋功能
function rebindRevokedSearchFunction() {
  let searchInput = document.getElementById("device-revoked-search-input");
  if (searchInput) {
    searchInput.value = "";
    searchInput.removeEventListener("input", searchRevokedDevices);
    searchInput.addEventListener("input", searchRevokedDevices);
  }
}

// 綁定已撤銷設備的全選功能
function rebindSelectAllRevokedFunction() {
  let selectAllCheckbox = document.getElementById("selectAllRevoked");
  if (selectAllCheckbox) {
    selectAllCheckbox.removeEventListener("change", handleSelectAllRevoked);
    selectAllCheckbox.addEventListener("change", handleSelectAllRevoked);
  }
}

// 恢復選中的設備 (設置 record_state 為 1)
async function RestoreSelectedDevices() {
  // [資安防護 - BAC 越權攔截] 預設拒絕：Tier >= 3 (如經銷商) 禁止恢復設備
  const tier = parseInt(window.sessionStorage.getItem("tier"), 10);
  if (isNaN(tier) || tier >= 3) {
    alert(window.localeData?.common?.deny || "權限不足，無法執行此操作。");
    return;
  }

  let checkedBoxes = document.querySelectorAll(".row-checkbox-revoked:checked");

  if (checkedBoxes.length === 0) {
    alert(GetLocalData("device.msg_select_restore") || "請選擇要恢復的設備");
    return;
  }

  if (
    !confirm(
      (
        GetLocalData("device.msg_confirm_restore") ||
        "確定要恢復這 {{count}} 個設備嗎？"
      ).replace("{{count}}", checkedBoxes.length),
    )
  ) {
    return;
  }

  VisibleLoaderElement(true);

  let successCount = 0;
  let errorCount = 0;

  try {
    const cache = window._revokedDeviceRecordsCache;

    for (const checkbox of checkedBoxes) {
      const deviceCid = checkbox.getAttribute("data-device-cid");

      try {
        console.log(`[RestoreSelectedDevices] Fetching from API for device: ${deviceCid}`);
        const json_object = await apiCall(
          CsRequestDeviceSelectOneRecord,
          deviceCid,
        );
        let record = json_object.records;

        if (!record) {
          console.error(
            `[RestoreSelectedDevices] No record for device: ${deviceCid}`,
          );
          errorCount++;
          continue;
        }

        // Step 2: 準備更新的資料
        var deviceData = Object.create(DeviceData);
        deviceData.device_cid = record.device_cid
          ? record.device_cid[0]
          : deviceCid;
        deviceData.product_type = record.product_type
          ? record.product_type[0]
          : "";
        deviceData.create_time = record.create_time
          ? record.create_time[0]
          : "";
        deviceData.record_state = "1"; // 設為啟用狀態
        deviceData.active_time = record.active_time
          ? record.active_time[0]
          : "";
        deviceData.owner_type = record.owner_type ? record.owner_type[0] : "";
        deviceData.owner_cid = record.owner_cid ? record.owner_cid[0] : "";
        deviceData.agent_cid = record.agent_cid ? record.agent_cid[0] : "";
        deviceData.license_key = record.license_key
          ? record.license_key[0]
          : "";
        deviceData.customer_name = record.customer_name
          ? record.customer_name[0]
          : "";
        deviceData.customer_gender = record.customer_gender
          ? record.customer_gender[0]
          : "";
        deviceData.customer_birthday = record.customer_birthday
          ? record.customer_birthday[0]
          : "";
        deviceData.customer_phone = record.customer_phone
          ? record.customer_phone[0]
          : "";
        deviceData.customer_postalcode = record.customer_postalcode
          ? record.customer_postalcode[0]
          : "";
        deviceData.customer_address = record.customer_address
          ? record.customer_address[0]
          : "";
        deviceData.customer_email = record.customer_email
          ? record.customer_email[0]
          : "";
        deviceData.spec00 = record.spec00 ? record.spec00[0] : "";
        deviceData.spec01 = record.spec01 ? record.spec01[0] : "";
        deviceData.spec02 = record.spec02 ? record.spec02[0] : "";
        deviceData.spec03 = record.spec03 ? record.spec03[0] : "";
        deviceData.spec04 = record.spec04 ? record.spec04[0] : "";
        deviceData.spec05 = record.spec05 ? record.spec05[0] : "";
        deviceData.spec06 = record.spec06 ? record.spec06[0] : "";
        deviceData.spec07 = record.spec07 ? record.spec07[0] : "";
        deviceData.note00 = record.note00 ? record.note00[0] : "";

        // Step 3: 發送更新請求
        await apiCall(CsRequestDeviceUpdateOneRecord, deviceData);
        console.log(
          `[RestoreSelectedDevices] Successfully restored device: ${deviceCid}`,
        );
        successCount++;
      } catch (e) {
        if (e.message !== "Handled Server Error") {
          console.error(
            `[RestoreSelectedDevices] Error processing device ${deviceCid}:`,
            e,
          );
        }
        errorCount++;
      }
    }

    alert(
      (
        GetLocalData("device.msg_restore_result") ||
        "恢復完成。成功 {{success}} 個，失敗 {{failed}} 個。"
      )
        .replace("{{success}}", successCount)
        .replace("{{failed}}", errorCount),
    );
    if (successCount > 0) {
      // 重新載入已撤銷設備列表
      SelectRevokedDevices();
    }
  } catch (err) {
    console.error("批量恢復過程發生錯誤:", err);
  } finally {
    VisibleLoaderElement(false);
  }
}

async function SelectDeviceOne(device_cid) {
  // 開啟loading dialog
  VisibleLoaderElement(true);

  try {
    const json_object = await apiCall(
      CsRequestDeviceSelectOneRecord,
      device_cid,
    );

    // 填入初始資料
    let record = json_object.records;
    document.getElementById("device_update-device_cid").value =
      record.device_cid[0];
    document.getElementById("device_update-product_type").value =
      record.product_type[0];
    document.getElementById("device_update-record_state").value =
      record.record_state[0];
    document.getElementById("device_update-create_time").value =
      record.create_time[0];
    document.getElementById("device_update-active_time").value =
      record.active_time[0];
    document.getElementById("device_update-owner_type").value =
      record.owner_type[0];
    document.getElementById("device_update-owner_cid").value =
      record.owner_cid[0];
    document.getElementById("device_update-agent_cid").value =
      record.agent_cid[0];
    document.getElementById("device_update-license_Key").value =
      record.license_key[0];
    document.getElementById("device_update-customer_name").value =
      record.customer_name[0];
    document.getElementById("device_update-customer_gender").value =
      record.customer_gender[0];
    document.getElementById("device_update-customer_birthday").value =
      record.customer_birthday[0];
    document.getElementById("device_update-customer_phone").value =
      record.customer_phone[0];
    document.getElementById("device_update-customer_postalcode").value =
      record.customer_postalcode[0];
    document.getElementById("device_update-customer_address").value =
      record.customer_address[0];
    document.getElementById("device_update-customer_email").value =
      record.customer_email[0];
    document.getElementById("device_update-spec00").value = record.spec00[0];
    document.getElementById("device_update-spec01").value = record.spec01[0];
    document.getElementById("device_update-spec02").value = record.spec02[0];
    document.getElementById("device_update-spec03").value = record.spec03[0];
    document.getElementById("device_update-spec04").value = record.spec04[0];
    document.getElementById("device_update-spec05").value = record.spec05[0];
    document.getElementById("device_update-spec06").value = record.spec06[0];
    document.getElementById("device_update-spec07").value = record.spec07[0];
    document.getElementById("device_update-note00").value = record.note00[0];
  } catch (e) {
    if (e.message !== "Handled Server Error") {
      console.error(e);
      alert(GetLocalData("device.msg_read_failed") || "讀取設備資料失敗");
    }
  } finally {
    VisibleLoaderElement(false);
  }
}

// function InserDeviceOne(device_data) {
//     // 保留原樣，暫未啟用
// }

async function UpdateDeviceOne() {
  var device_data = Object.create(DeviceData);

  device_data.device_cid = document.getElementById(
    "device_update-device_cid",
  ).value;
  device_data.product_type = document.getElementById(
    "device_update-product_type",
  ).value;
  device_data.record_state = document.getElementById(
    "device_update-record_state",
  ).value;
  device_data.create_time = document.getElementById(
    "device_update-create_time",
  ).value;
  device_data.active_time = document.getElementById(
    "device_update-active_time",
  ).value;
  device_data.owner_type = document.getElementById(
    "device_update-owner_type",
  ).value;
  device_data.owner_cid = document.getElementById(
    "device_update-owner_cid",
  ).value;
  device_data.agent_cid = document.getElementById(
    "device_update-agent_cid",
  ).value;
  device_data.license_key = document.getElementById(
    "device_update-license_Key",
  ).value;
  device_data.owner_cid = document.getElementById(
    "device_update-owner_cid",
  ).value;
  device_data.customer_name = document.getElementById(
    "device_update-customer_name",
  ).value;
  device_data.customer_gender = document.getElementById(
    "device_update-customer_gender",
  ).value;
  device_data.customer_birthday = document.getElementById(
    "device_update-customer_birthday",
  ).value;
  device_data.customer_phone = document.getElementById(
    "device_update-customer_phone",
  ).value;
  device_data.customer_postalcode = document.getElementById(
    "device_update-customer_postalcode",
  ).value;
  device_data.customer_address = document.getElementById(
    "device_update-customer_address",
  ).value;
  device_data.customer_email = document.getElementById(
    "device_update-customer_email",
  ).value;

  device_data.spec00 = document.getElementById("device_update-spec00").value;
  device_data.spec01 = document.getElementById("device_update-spec01").value;
  device_data.spec02 = document.getElementById("device_update-spec02").value;
  device_data.spec03 = document.getElementById("device_update-spec03").value;
  device_data.spec04 = document.getElementById("device_update-spec04").value;
  device_data.spec05 = document.getElementById("device_update-spec05").value;
  device_data.spec06 = document.getElementById("device_update-spec06").value;
  device_data.spec07 = document.getElementById("device_update-spec07").value;

  device_data.note00 = document.getElementById("device_update-note00").value;

  VisibleLoaderElement(true);

  try {
    const json_object = await apiCall(
      CsRequestDeviceUpdateOneRecord,
      device_data,
    );
    alert(GetLocalData("common.success"));
    GotoPageSelectDeviceAll();
  } catch (e) {
    if (e.message !== "Handled Server Error") {
      console.error(e);
      alert(GetLocalData("device.msg_update_failed") || "更新失敗");
    }
  } finally {
    VisibleLoaderElement(false);
  }
}

async function SelectHistoryAll(device_cid) {
  {
    let element = document.getElementById("device_history-device_cid");
    if (element) {
      element.textContent = device_cid;
    }
  }

  let condition_type = search_condition_type_by_subject_cid;
  let condition_value = device_cid;

  const b_time = document.getElementById("device_history-begin_time");
  const e_time = document.getElementById("device_history-end_time");

  VisibleLoaderElement(true);

  if (_g_history_request_controller) {
    _g_history_request_controller.abort();
  }
  _g_history_request_controller = new AbortController();

  try {
    const json_object = await apiCall(
      CsRequestHistorySelectAllCount,
      condition_type,
      condition_value,
      b_time.value,
      e_time.value,
      _g_history_request_controller,
    );

    if (json_object.count == 0) {
      // 繼續執行以清空表格
    }

    let order_table_page = document.getElementById(
      "device_history-list_pagination",
    );
    if (order_table_page) {
      tablepage_d(
        order_table_page,
        def_rows_per_page,
        json_object.count,
        async function (now_index, count_of_page) {
          // 動態 取得 分頁內的資料
          if (_g_history_request_controller) {
            _g_history_request_controller.abort();
          }
          _g_history_request_controller = new AbortController();

          VisibleLoaderElement(true);
          try {
            const resultJson = await apiCall(
              CsRequestHistorySelectAllRecords,
              condition_type,
              condition_value,
              b_time.value,
              e_time.value,
              now_index,
              count_of_page,
              _g_history_request_controller,
            );

            let json_tablesi = resultJson.records;
            let field_count = Object.keys(json_tablesi).length;

            var element_table = document.getElementById(
              "device_history-list_information",
            );

            if (field_count > 0) {
              let tableii = TablesiToTableii(
                key_history_list_info,
                json_tablesi,
              );
              create_Json2DArrayToTable(element_table, tableii);
            } else {
              // Clear table if no data
              let tbody = element_table.querySelector("tbody");
              if (tbody) tbody.innerHTML = "";
            }
          } catch (innerE) {
            if (innerE.name !== "AbortError") {
              console.error("History Page Error:", innerE);
            }
          } finally {
            VisibleLoaderElement(false);
          }
        },
      );
    }
  } catch (e) {
    if (e.name === "AbortError") {
      console.log("History request aborted");
      return;
    }
    if (e.message !== "Handled Server Error") {
      console.error(e);
      alert(
        GetLocalData("device.msg_read_history_failed") || "讀取歷史紀錄失敗",
      );
    }
  } finally {
    VisibleLoaderElement(false);
  }
}

/*___________________________________________________________________________________*/
// 事件相關

// 初始化整個 View 的函數，確保相依性載入後才執行
async function initDeviceView() {
  console.log("Device View Initializing...");

  // i18n 渲染 (必須在 Core Dependencies 載入後執行)
  const lang = window.localStorage.getItem("language") || "zh-tw";
  if (typeof renderTemplate === "function") {
    await renderTemplate(lang, "app");
  }

  // [整合] Get product from URL and set it in session storage
  const urlParams = new URLSearchParams(window.location.search);
  const product = urlParams.get("product") || "avacast"; // Default to avacast
  window.sessionStorage.setItem("product_type", product);

  // [新增] 權限判斷
  const userTier = window.sessionStorage.getItem("tier");
  const isDistributor = userTier === "3";

  console.log(`Configuring device page for product: ${product}`);

  // 顯示放最後 等都完成後
  showTemplate("app");

  // [新增] 移除靜態 Loading 遮罩
  // 初始載入交由 API 請求的 VisibleLoaderElement 管理

  // [新增] 動態載入元件與 UI 調整
  if (isDistributor) {
    // 1. [修正] 改用標準元件 (因為經銷商元件已棄用/合併)
    loadScript("components/app.component.frame.navbar.js");
    loadScript("components/app.component.frame.sidebar-nav.js");
    loadScript("components/app.component.profile.modal.js");

    // [新增] 載入 Organization 模組，確保側邊欄點擊國家時能查詢公司
    loadScript("modules/app.module.organization.js");

    // 2. 顯示導覽列 (Dashboard/訂單資訊/License)
    const navContainer = document.getElementById("nav-container");
    if (navContainer) navContainer.style.display = "block";

    // 2-1. [新增] 載入並初始化第二層導覽列
    loadScript("components/app.component.frame.nav.js", () => {
      if (typeof initializeStandardNav === "function") {
        initializeStandardNav();
      }
    });

    // 3. 隱藏管理員專用功能
    const deleteBtn = document.getElementById("device_list-button-delete");
    if (deleteBtn) deleteBtn.style.setProperty("display", "none", "important");

    const revokedLink = document.getElementById("device-revoked-link");
    if (revokedLink)
      revokedLink.style.setProperty("display", "none", "important");
  } else {
    // 管理員邏輯
    const navContainer = document.getElementById("nav-container");
    if (navContainer) navContainer.style.display = "block";

    loadScript("components/app.component.frame.nav.js", () => {
      if (typeof initializeStandardNav === "function") initializeStandardNav();
    });
    loadScript("components/app.component.frame.navbar.js");
    loadScript("components/app.component.frame.sidebar-nav.js");
    loadScript("components/app.component.frame.organization-edit.js"); // 管理員才需要編輯組織
    loadScript("components/app.component.profile.modal.js");
  }

  // [整合] 初始化按鈕圖片切換效果 (來自 device.html 內聯腳本)
  // 下載按鈕的圖片切換
  const downloadButton = document.getElementById("device-download-button");
  const downloadIcon = downloadButton?.querySelector("img");

  if (downloadButton && downloadIcon) {
    downloadButton.addEventListener("mouseenter", function () {
      downloadIcon.src = "assets/images/dowload_button_change.png";
    });

    downloadButton.addEventListener("mouseleave", function () {
      downloadIcon.src = "assets/images/download.svg";
    });
  }

  // 匯出全部按鈕的圖片切換
  const downloadAllButton = document.getElementById(
    "device-download-all-button",
  );
  const downloadAllIcon = document.getElementById("device-download-all-icon");

  if (downloadAllButton && downloadAllIcon) {
    downloadAllButton.addEventListener("mouseenter", function () {
      downloadAllIcon.src = "assets/images/download_all_white.svg";
    });

    downloadAllButton.addEventListener("mouseleave", function () {
      downloadAllIcon.src = "assets/images/download_all_light_blue.svg";
    });
  }

  // 恢復按鈕的圖片切換
  const restoreButton = document.getElementById(
    "device_revoked-button-restore",
  );
  const restoreIcon = restoreButton?.querySelector("img");
  if (restoreButton && restoreIcon) {
    restoreButton.addEventListener("mouseenter", function () {
      restoreIcon.src = "assets/images/revoke_recover.png";
    });
    restoreButton.addEventListener("mouseleave", function () {
      restoreIcon.src = "assets/images/revoke_reback.png";
    });
  }

  // [Phase 2 優化] 統一綁定靜態按鈕與表頭排序事件，消除 CSP unsafe-inline 風險
  if (window._deviceStaticEventController)
    window._deviceStaticEventController.abort();
  window._deviceStaticEventController = new AbortController();
  const staticSignal = window._deviceStaticEventController.signal;

  // [Memory Leak 防護] 監聽視圖切換的 abort 事件，主動清除未完成的防抖動定時器
  staticSignal.addEventListener('abort', () => {
    if (typeof searchTimeout !== 'undefined') clearTimeout(searchTimeout);
    if (typeof revokedSearchTimeout !== 'undefined') clearTimeout(revokedSearchTimeout);
  });

  const bindClick = (id, handler) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", handler, { signal: staticSignal });
  };

  bindClick("device-download-button", downloadSelectedDevicesExcel);
  bindClick("device-download-all-button", downloadAllDevices);
  bindClick("device-revoked-link", GotoPageRevokedDevices);
  bindClick("device_revoked-button-back", GotoPageSelectDeviceAll);

  document.querySelectorAll("th[data-sort]").forEach((th) => {
    th.addEventListener("click", () => sortDeviceTable(th.dataset.sort), {
      signal: staticSignal,
    });
  });
  document.querySelectorAll("th[data-sort-revoked]").forEach((th) => {
    th.addEventListener(
      "click",
      () => sortRevokedDeviceTable(th.dataset.sortRevoked),
      { signal: staticSignal },
    );
  });

  //_________________________________________________________________________________
  // 初始化全選功能
  rebindSelectAllFunction();

  // 初始化搜尋功能
  rebindSearchFunction();

  // 動作

  // 預設資料
  {
    // 取得預設組織帳號
    {
      let group_cid;
      {
        group_cid = window.sessionStorage.getItem("group_cid");
        if (!IsValidString(group_cid)) {
          alert(window.localeData.warring.no_group_cid);
          change_page("home.html");
          return;
        }
      }
    }
  }

  {
    // 搜尋
    {
      let button = document.getElementById("device_list-button-search");
      if (button) {
        button.addEventListener("click", function (event) {
          SelectDeviceAll();
        });
      }
    }

    // 刪除
    {
      let button = document.getElementById("device_list-button-delete");
      if (button) {
        button.addEventListener("click", function (event) {
          DeleteSelectedDevices();
        });
      }
    }

    // 搜尋歷史
    {
      let button = document.getElementById("device_history-button-search");
      if (button) {
        button.addEventListener("click", function (event) {
          let element = document.getElementById("device_history-device_cid");
          if (element) {
            SelectHistoryAll(element.innerHTML);
          }
        });
      }
    }

    // 確認更新
    {
      let button = document.getElementById("device_update-button-ok");
      if (button) {
        button.addEventListener("click", function (event) {
          UpdateDeviceOne();
        });
      }
    }
  }

  // 頁面切換
  {
    // 回到使用者列表
    {
      let button = document.getElementById("device_insert-button-cancel");
      if (button) {
        button.addEventListener("click", function (event) {
          GotoPageSelectDeviceAll();
        });
      }
    }

    // 回到使用者列表
    {
      let button = document.getElementById("device_update-button-cancel");
      if (button) {
        button.addEventListener("click", function (event) {
          GotoPageSelectDeviceAll();
        });
      }
    }

    // 回到使用者列表
    {
      let button = document.getElementById("device_history-button-cancel");
      if (button) {
        button.addEventListener("click", function (event) {
          GotoPageSelectDeviceAll();
        });
      }
    }

    // 設備恢復按鈕
    {
      let button = document.getElementById("device_revoked-button-restore");
      if (button) {
        button.addEventListener("click", function (event) {
          RestoreSelectedDevices();
        });
      }
    }

    // 授權恢復按鈕
    {
      let button = document.getElementById("license_revoked-button-restore");
      if (button) {
        button.addEventListener("click", function (event) {
          RestoreSelectedLicenses();
        });
      }
    }

    // 設備全選checkbox
    {
      let checkbox = document.getElementById("selectAllRevoked");
      if (checkbox) {
        checkbox.addEventListener("change", function () {
          const checkboxes = document.querySelectorAll(".row-checkbox-revoked");
          checkboxes.forEach((cb) => {
            cb.checked = this.checked;
          });
        });
      }
    }

    // 授權全選checkbox
    {
      let checkbox = document.getElementById("selectAllRevokedLicense");
      if (checkbox) {
        checkbox.addEventListener("change", function () {
          const checkboxes = document.querySelectorAll(
            ".row-checkbox-revoked-license",
          );
          checkboxes.forEach((cb) => {
            cb.checked = this.checked;
          });
        });
      }
    }
  }

  // 預設為三個月前到現在
  {
    const BDate = DateAdd("m", -3, new Date());
    const EDate = new Date();
    let b_time = document.getElementById("device_list-begin_time");
    let e_time = document.getElementById("device_list-end_time");
    let dateSearchButton = document.getElementById(
      "device_list-button-date_search",
    );

    // 檢查 sessionStorage 中是否有儲存的日期
    const savedBeginTime = sessionStorage.getItem("dashboard_begin_time");
    const savedEndTime = sessionStorage.getItem("dashboard_end_time");

    if (savedBeginTime && savedEndTime) {
      b_time.value = savedBeginTime;
      e_time.value = savedEndTime;
      console.log(
        "device.html: 從 sessionStorage 載入日期:",
        savedBeginTime,
        "~",
        savedEndTime,
      );
    } else {
      b_time.value = BDate.toLocaleDateString("sv-SE");
      e_time.value = EDate.toLocaleDateString("sv-SE");
    }

    if (dateSearchButton) {
      dateSearchButton.addEventListener("click", function () {
        console.log("日期搜尋按鈕點擊");
        sessionStorage.setItem("dashboard_begin_time", b_time.value);
        sessionStorage.setItem("dashboard_end_time", e_time.value);
        SelectDeviceAll({ page: 1 }); // 重設為第一頁
      });
    }

    // 預設查log的時間範圍
    {
      let b_time = document.getElementById("device_history-begin_time");
      let e_time = document.getElementById("device_history-end_time");
      b_time.value = BDate.toLocaleDateString("sv-SE");
      e_time.value = EDate.toLocaleDateString("sv-SE");
    }
  }

  // [修正] 移除重複呼叫
  console.log("device.html: 頁面載入完成，執行初始搜尋。");
  const b_time_val = document.getElementById("device_list-begin_time")?.value;
  const e_time_val = document.getElementById("device_list-end_time")?.value;
  if (b_time_val && e_time_val) {
    sessionStorage.setItem("dashboard_begin_time", b_time_val);
    sessionStorage.setItem("dashboard_end_time", e_time_val);
  }
  // 執行第一次查詢 (預設第一頁)
  await SelectDeviceAll();
}

// -----------------------------------------------------------
// 依賴狀態管理：確保核心函式庫載入後才綁定 DOMContentLoaded
// -----------------------------------------------------------
function startDeviceApp() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDeviceView);
  } else {
    initDeviceView();
  }
}

if (window._CoreLoaded) {
  startDeviceApp();
} else {
  window.addEventListener("CoreDependenciesReady", startDeviceApp);
}

// 排序表格函數
function sortDeviceTable(field) {
  // 切換排序順序
  if (currentSortField === field) {
    currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
  } else {
    currentSortField = field;
    currentSortOrder = "asc";
  }

  // 更新排序圖標
  updateSortIcons(field, currentSortOrder);

  // 對表格數據進行排序 (改為呼叫 updateDeviceList 重新渲染)
  SelectDeviceAll({ page: 1 }); // 排序時重設為第一頁
}

// 更新排序圖標
function updateSortIcons(activeField, order) {
  // 重置所有圖標
  const sortIcons = ["create_time", "spec04", "device_cid", "license_key"];

  sortIcons.forEach((field) => {
    const icon = document.getElementById(`sort-${field}`);
    if (icon) {
      if (field === activeField) {
        // 設置當前排序欄位的圖標
        icon.style.transform =
          order === "asc" ? "rotate(0deg)" : "rotate(180deg)";
        icon.style.opacity = "1";
      } else {
        // 重置其他欄位的圖標
        icon.style.transform = "rotate(0deg)";
        icon.style.opacity = "0.5";
      }
    }
  });
}

// 獲取特定欄位的值
function getCellValue(row, field) {
  const fieldMap = {
    create_time: 1,
    spec04: 2,
    device_cid: 3,
    license_key: 4,
  };

  const cellIndex = fieldMap[field];
  if (cellIndex === undefined) return "";

  const cell = row.cells[cellIndex];
  return cell ? cell.textContent.trim() : "";
}

// ============= 已撤銷設備頁面的排序功能 =============
let currentRevokedSortField = "";
let currentRevokedSortOrder = "asc";

function sortRevokedDeviceTable(field) {
  if (currentRevokedSortField === field) {
    currentRevokedSortOrder =
      currentRevokedSortOrder === "asc" ? "desc" : "asc";
  } else {
    currentRevokedSortField = field;
    currentRevokedSortOrder = "asc";
  }

  updateRevokedSortIcons(field, currentRevokedSortOrder);
  SelectRevokedDevices({ page: 1 });
}

function updateRevokedSortIcons(activeField, order) {
  const sortIcons = ["create_time", "spec04", "device_cid", "license_key"];

  sortIcons.forEach((field) => {
    const icon = document.getElementById(`sort-revoked-${field}`);
    if (icon) {
      if (field === activeField) {
        icon.style.transform =
          order === "asc" ? "rotate(0deg)" : "rotate(180deg)";
        icon.style.opacity = "1";
      } else {
        icon.style.transform = "rotate(0deg)";
        icon.style.opacity = "0.5";
      }
    }
  });
}
