// home.html 的頁面事件操控程式碼相關

//_______________________________________________________________________
// 直接執行
// i18n ***必定放在載入頁面完成後的最前面 避免導致後面的addEventListener失效
(function () {
  renderTemplate("zh-tw", "app");
})();

//_____________________________________________________________________________________
// function 相關
const def_rows_per_page = 10;

// 預設顯示欄位 (需視後端回傳實際欄位名稱調整)
const key_order_list_info = [
  "create_time",
  "order_uid",
  "product_code",
  "count",
];

async function SelectOrder(member_uid, b_time, e_time) {
  // 1. 【關鍵修正】強制處理時間格式，補上時分秒
  // 避免資料庫因為字串比對或時區問題而漏資料
  let fixed_b_time = b_time;
  let fixed_e_time = e_time;

  // 如果只有日期 (長度為10)，補上時間
  if (fixed_b_time && fixed_b_time.length === 10) {
    fixed_b_time += " 00:00:00";
  }
  if (fixed_e_time && fixed_e_time.length === 10) {
    fixed_e_time += " 23:59:59";
  }

  // 開啟loading dialog
  VisibleLoaderElement(true);

  try {
    // 取得總筆數
    const json_object = await apiCall(
      CsRequestSelectOrderCountByMemberUID,
      member_uid,
      fixed_b_time, // 使用修正後的開始時間
      fixed_e_time, // 使用修正後的結束時間
    );

    if (json_object.errno < 0 || json_object.count == 0) {
      // 若無資料，清空表格並提示 (或不提示)
      renderOrderTable({});
      VisibleLoaderElement(false);
      return;
    }

    // 設定分頁元件
    let order_table_page = document.getElementById(
      "order_list-order_pagination",
    );
    if (order_table_page) {
      tablepage_d(
        order_table_page,
        def_rows_per_page,
        json_object.count,
        async function (now_index, count_of_page) {
          // 動態 取得 分頁內的資料
          try {
            VisibleLoaderElement(true);
            const result = await apiCall(
              CsRequestSelectOrderRecordsByMemberUID, // [修正] 改用正確的 Order API
              member_uid, // [修正] 使用傳入的 member_uid
              fixed_b_time,
              fixed_e_time,
              now_index,
              count_of_page,
            );

            // 渲染表格
            renderOrderTable(result.records);
          } catch (e) {
            if (e.message !== "Handled Server Error") alert("request error");
          } finally {
            VisibleLoaderElement(false);
          }
        },
      );
    } else {
      VisibleLoaderElement(false);
    }
  } catch (e) {
    if (e.message !== "Handled Server Error") alert("request error");
    VisibleLoaderElement(false);
  }
}

// 自訂表格渲染函式
function renderOrderTable(records) {
  const element_table = document.getElementById("order_list-order_information");
  if (!element_table) return;

  // 1. 建立表頭 (若不存在)
  let thead = element_table.querySelector("thead");
  if (!thead) {
    thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    // 這裡暫時使用硬編碼的標題，建議之後改為多語系
    const headers = ["建立時間", "訂單編號", "產品代碼", "數量"];
    headers.forEach((text) => {
      const th = document.createElement("th");
      th.textContent = text;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    element_table.appendChild(thead);
  }

  // 2. 建立內容 (tbody)
  let tbody = element_table.querySelector("tbody");
  if (!tbody) {
    tbody = document.createElement("tbody");
    element_table.appendChild(tbody);
  }
  tbody.innerHTML = ""; // 清空舊資料

  if (!records || Object.keys(records).length === 0) {
    // 無資料顯示
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4; // 對應表頭欄位數
    td.textContent = "查無資料";
    td.style.textAlign = "center";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  // 3. 填充資料 (假設 records 為 Column-Oriented Tablesi 格式)
  // 如果後端回傳的是 Row-Oriented 陣列，這裡需要調整邏輯
  // 根據 app.module.device.js 等新模組，推測為 Tablesi
  const recordCount = records[key_order_list_info[0]]
    ? records[key_order_list_info[0]].length
    : 0;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < recordCount; i++) {
    const tr = document.createElement("tr");

    key_order_list_info.forEach((key) => {
      const td = document.createElement("td");
      // 安全存取
      let val = records[key] ? records[key][i] : "";

      // 特殊欄位處理 (例如時間格式化)
      if (key === "create_time" && val) {
        val = val.replace("T", " ").substring(0, 19);
      }

      td.textContent = val;
      tr.appendChild(td);
    });

    fragment.appendChild(tr);
  }
  tbody.appendChild(fragment);
}

//_____________________________________________________________________________________
// 事件相關

// 頁面啟動完成時
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Home DOMContentLoaded");

  // 顯示放最後 等都完成後
  var app = document.getElementById("app");
  app.style.visibility = "visible";

  // [新增] 移除靜態 Loading 遮罩
  const loader = document.getElementById("initial-loader");
  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => loader.remove(), 300); // 淡出效果
  }

  // 綁定「新增」按鈕
  let button_goto_addnew = document.getElementById(
    "order_list-button-gotopage_addnew_order",
  );
  if (button_goto_addnew) {
    button_goto_addnew.addEventListener("click", function (event) {
      change_page("page02");
    });
  }

  // 綁定「搜尋」按鈕
  let button_search = document.getElementById("order_list_time_search_button");
  if (button_search) {
    button_search.addEventListener("click", function (event) {
      const b = document.getElementById("begin_time").value;
      const e = document.getElementById("end_time").value;
      SelectOrder(0, b, e);
    });
  }

  const b_time = document.getElementById("begin_time");
  const e_time = document.getElementById("end_time");

  // 預設為三個月前到現在
  {
    const BDate = DateAdd("m", -3, new Date());
    const EDate = new Date();
    b_time.value = BDate.toISOString().slice(0, 10);
    e_time.value = EDate.toISOString().slice(0, 10);
  }

  // 初始載入
  SelectOrder(0, b_time.value, e_time.value);
});
