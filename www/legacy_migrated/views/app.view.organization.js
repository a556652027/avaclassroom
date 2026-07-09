// home.html 的頁面事件操控程式碼相關

/*___________________________________________________________________________________*/
// 直接執行
/*___________________________________________________________________________________*/
// function 相關
const def_rows_per_page = 10;

// 列表上面顯示的欄位對照表 與 順序
let key_group_list_info = [
  "group_name",
  "group_cid",
  "create_time",
  "agent_cid",
  "country",
  "licensing_remaining_seats",
  "contact",
  "contact_phone_01",
  "contact_email_01",
  //"avatar_url",
];

//let _organization_info_username = "group_cid";

let _g_org_request_controller = null;

// [新增] 補上遺失的頁面切換函式
function GotoPageOrganizationSelectAll() {
  OrganizationSelectAll();
  change_page("page01");
}

function GotoPageOrganizationInsertOne() {
  // 清空輸入框或重置狀態 (視需求而定)
  change_page("page02");
}

function GotoPageOrganizationUpdateOne(group_cid) {
  OrganizationSelectOne(group_cid);
  change_page("page03"); // 假設更新頁面是 page03，若與新增共用 page02 請自行調整
}

async function OrganizationSelectAll(parent_name) {
  // 顯示帳戶角色
  {
    {
      let element = document.getElementById("organization_list-role");
      if (element) {
        element.textContent = window.localeData.role[member_depth];
      }
    }
    {
      let element = document.getElementById("organization_list-name");
      if (element) {
        element.textContent =
          parent_name == "" || parent_name == null
            ? Cyberspace.Client.getUsername()
            : parent_name;
      }
    }
  }

  if (parent_name == null) {
    parent_name = document.getElementById(
      "organization_list-input_search_value",
    ).value;
    member_depth = 1;
  } else {
    member_depth++;
  }

  // 搜尋條件
  let search_condition_type = window._k_search_condition_type_by_owner_cid;
  let owner_cid = parent_name;

  VisibleLoaderElement(true);

  if (_g_org_request_controller) {
    _g_org_request_controller.abort();
  }
  _g_org_request_controller = new AbortController();

  try {
    const countResult = await apiCall(
      CsRequestGroupSelectAllCountByCondition, // [修正] 移除多餘的舊函式參數
      search_condition_type,
      owner_cid,
      _g_org_request_controller,
    );
    const count = countResult.count;

    if (count == 0) {
      var element_table = document.getElementById(
        "organization_list-list_information",
      );
      let tbody = element_table.querySelector("tbody");
      if (tbody) tbody.innerHTML = "";
      return;
    }

    let list_table_page = document.getElementById(
      "organization_list-list_pagination",
    );
    if (list_table_page) {
      tablepage_d(
        list_table_page,
        def_rows_per_page,
        count,
        async function (now_index, count_of_page) {
          if (_g_org_request_controller) {
            _g_org_request_controller.abort();
          }
          _g_org_request_controller = new AbortController();

          VisibleLoaderElement(true);
          try {
            const result = await apiCall(
              CsRequestGroupSelectAllRecordsByCondition, // [修正] 移除多餘的舊函式參數
              search_condition_type,
              owner_cid,
              now_index,
              count_of_page,
              _g_org_request_controller,
            );

            let json_tablesi = result.records;
            let element_table = document.getElementById(
              "organization_list-list_information",
            );
            let tbody = element_table.querySelector("tbody");

            if (!tbody) {
              tbody = document.createElement("tbody");
              element_table.appendChild(tbody);
            }

            // 清空表格
            tbody.innerHTML = "";

            // 【優化】使用 DocumentFragment
            if (json_tablesi && json_tablesi.group_cid) {
              const fragment = document.createDocumentFragment();
              const recordCount = json_tablesi.group_cid.length;

              for (let i = 0; i < recordCount; i++) {
                const row = document.createElement("tr");
                const groupCid = json_tablesi.group_cid[i];

                // 1. 操作按鈕欄位
                const cellAction = document.createElement("td");

                // [資安與效能優化] 使用 DOMUtil 安全建立節點，不再使用字串拼接，杜絕 XSS 且加速渲染
                const iconEdit = DOMUtil.create("i", {
                  className: "iconfont",
                  innerHTML: "&#xe764;",
                });
                const btnEdit = DOMUtil.create(
                  "button",
                  {
                    className: "link_text",
                    "data-action": "update-org",
                    "data-group-cid": groupCid,
                  },
                  iconEdit,
                );

                const iconDashboard = DOMUtil.create("i", {
                  className: "iconfont",
                  innerHTML: "&#xe767;&nbsp;",
                });
                const btnDashboard = DOMUtil.create(
                  "button",
                  {
                    className: "link_text",
                    "data-action": "dashboard-org",
                    "data-group-cid": groupCid,
                  },
                  iconDashboard,
                );

                cellAction.appendChild(btnEdit);
                cellAction.appendChild(btnDashboard);
                row.appendChild(cellAction);

                // 2. 資料欄位 (key_group_list_info)
                key_group_list_info.forEach((key) => {
                  const cell = document.createElement("td");
                  cell.textContent = json_tablesi[key]
                    ? json_tablesi[key][i]
                    : "";
                  row.appendChild(cell);
                });

                fragment.appendChild(row);
              }
              tbody.appendChild(fragment);
            }
          } catch (e) {
            if (
              e.name !== "AbortError" &&
              e.message !== "Handled Server Error"
            ) {
              alert("request error");
            }
          } finally {
            VisibleLoaderElement(false);
          }
        },
      );
    }
  } catch (e) {
    if (e.name === "AbortError") {
      console.log("Organization request aborted");
      return;
    }
    if (e.message !== "Handled Server Error") alert("request error");
  } finally {
    VisibleLoaderElement(false);
  }
}

async function OrganizationSelectOne(organization_cid) {
  // 開啟loading dialog
  VisibleLoaderElement(true);

  try {
    const json_object = await apiCall(
      CsRequestGroupSelectOneRecordByGroupCID,
      organization_cid,
    );

    // 填入初始資料
    {
      let record = json_object.records;
      document.getElementById("organization_update-group_cid").value =
        record.group_cid[0];
      document.getElementById("organization_update-group_name").value =
        record.group_name[0];
      document.getElementById("organization_update-group_type").value =
        record.group_type[0];
      document.getElementById("organization_update-owner_cid").value =
        record.owner_cid[0];
      document.getElementById("organization_update-contact").value =
        record.contact[0];
      document.getElementById("organization_update-group_ubn").value =
        record.group_ubn[0];
      document.getElementById("organization_update-contact_phone_01").value =
        record.contact_phone_01[0];
      //document.getElementById("organization_update-contact_phone_02").value = record.contact_phone_02[0];
      document.getElementById("organization_update-contact_email_01").value =
        record.contact_email_01[0];
      //document.getElementById("organization_update-contact_email_02").value = record.contact_email_02[0];
      document.getElementById("organization_update-country").value =
        record.country[0];
      document.getElementById("organization_update-city").value =
        record.city[0];
      document.getElementById("organization_update-address").value =
        record.address[0];
      document.getElementById("organization_update-billing_addr").value =
        record.billing_addr[0];
      document.getElementById("organization_update-note00").value =
        record.note00[0];
    }
  } catch (e) {
    if (e.message !== "Handled Server Error") alert("request error");
  } finally {
    VisibleLoaderElement(false);
  }
}

async function OrganizationInsertOne(owner_cid) {
  console.log("OrganizationInsertOne called");

  var group_data = Object.create(GroupData);
  group_data.group_cid = document.getElementById(
    "organization_insert-group_cid",
  ).value;
  group_data.group_name = document.getElementById(
    "organization_insert-group_name",
  ).value;
  group_data.group_type = document.getElementById(
    "organization_insert-group_type",
  ).value;
  group_data.owner_cid = document.getElementById(
    "organization_insert-owner_cid",
  ).value;
  group_data.contact = document.getElementById(
    "organization_insert-contact",
  ).value;
  group_data.group_ubn = document.getElementById(
    "organization_insert-group_ubn",
  ).value;
  group_data.contact_phone_01 = document.getElementById(
    "organization_insert-contact_phone_01",
  ).value;
  //group_data.contact_phone_02 = document.getElementById("organization_insert-contact_phone_02").value;
  group_data.contact_email_01 = document.getElementById(
    "organization_insert-contact_email_01",
  ).value;
  //group_data.contact_email_02 = document.getElementById("organization_insert-contact_email_02").value;
  group_data.country = document.getElementById(
    "organization_insert-country",
  ).value;
  group_data.city = document.getElementById("organization_insert-city").value;
  group_data.address = document.getElementById(
    "organization_insert-address",
  ).value;
  group_data.billing_addr = document.getElementById(
    "organization_insert-billing_addr",
  ).value;
  group_data.note00 = document.getElementById(
    "organization_insert-note00",
  ).value;

  console.log("收集到的資料:", group_data);

  VisibleLoaderElement(true);

  try {
    const json_object = await apiCall(
      CsRequestGroupInsertOneRecordByOwnerCID,
      group_data,
    );
    let _organization_info_username = json_object.group_cid;
    alert(GetLocalData("common.success"));
  } catch (e) {
    if (e.message !== "Handled Server Error") alert("request error");
  } finally {
    VisibleLoaderElement(false);
  }
}

async function OrganizationUpdateOne() {
  var group_data = Object.create(GroupData);
  group_data.group_cid = document.getElementById(
    "organization_update-group_cid",
  ).value;
  group_data.group_name = document.getElementById(
    "organization_update-group_name",
  ).value;
  group_data.group_type = document.getElementById(
    "organization_update-group_type",
  ).value;
  group_data.owner_cid = document.getElementById(
    "organization_update-owner_cid",
  ).value;
  group_data.contact = document.getElementById(
    "organization_update-contact",
  ).value;
  group_data.group_ubn = document.getElementById(
    "organization_update-group_ubn",
  ).value;
  group_data.contact_phone_01 = document.getElementById(
    "organization_update-contact_phone_01",
  ).value;
  //group_data.contact_phone_02 = document.getElementById("organization_update-contact_phone_02").value;
  group_data.contact_email_01 = document.getElementById(
    "organization_update-contact_email_01",
  ).value;
  //group_data.contact_email_02 = document.getElementById("organization_update-contact_email_02").value;
  group_data.country = document.getElementById(
    "organization_update-country",
  ).value;
  group_data.city = document.getElementById("organization_update-city").value;
  group_data.address = document.getElementById(
    "organization_update-address",
  ).value;
  group_data.billing_addr = document.getElementById(
    "organization_update-billing_addr",
  ).value;
  group_data.note00 = document.getElementById(
    "organization_update-note00",
  ).value;
  group_data.record_state = "1"; // 設為正常狀態

  VisibleLoaderElement(true);

  try {
    const json_object = await apiCall(
      CsRequestGroupUpdateOneRecordByGroupCID,
      group_data,
    );
    OrganizationSelectOne(json_object.group_cid);
    alert(GetLocalData("common.success"));
  } catch (e) {
    if (e.message !== "Handled Server Error") alert("request error");
  } finally {
    VisibleLoaderElement(false);
  }
}

async function OrganizationDeleteOne() {
  // [資安防護 - BAC 越權攔截] 預設拒絕：Tier >= 3 (如經銷商) 禁止刪除組織
  const tier = parseInt(window.sessionStorage.getItem("tier"), 10);
  if (isNaN(tier) || tier >= 3) {
    alert(window.localeData?.common?.deny || "權限不足，無法執行此操作。");
    return;
  }

  // 確認刪除
  //   if (!confirm("確定要刪除此組織嗎？刪除後該組織將不會顯示在列表中。")) {
  //     return;
  //   }

  var group_data = Object.create(GroupData);
  group_data.group_cid = document.getElementById(
    "organization_update-group_cid",
  ).value;
  group_data.group_name = document.getElementById(
    "organization_update-group_name",
  ).value;
  group_data.group_type = document.getElementById(
    "organization_update-group_type",
  ).value;
  group_data.owner_cid = document.getElementById(
    "organization_update-owner_cid",
  ).value;
  group_data.contact = document.getElementById(
    "organization_update-contact",
  ).value;
  group_data.group_ubn = document.getElementById(
    "organization_update-group_ubn",
  ).value;
  group_data.contact_phone_01 = document.getElementById(
    "organization_update-contact_phone_01",
  ).value;
  //group_data.contact_phone_02 = document.getElementById("organization_update-contact_phone_02").value;
  group_data.contact_email_01 = document.getElementById(
    "organization_update-contact_email_01",
  ).value;
  //group_data.contact_email_02 = document.getElementById("organization_update-contact_email_02").value;
  group_data.country = document.getElementById(
    "organization_update-country",
  ).value;
  group_data.city = document.getElementById("organization_update-city").value;
  group_data.address = document.getElementById(
    "organization_update-address",
  ).value;
  group_data.billing_addr = document.getElementById(
    "organization_update-billing_addr",
  ).value;
  group_data.note00 = document.getElementById(
    "organization_update-note00",
  ).value;
  group_data.record_state = "0"; // 設為刪除狀態

  console.log("準備刪除組織，發送的資料:", group_data);

  VisibleLoaderElement(true);

  try {
    await apiCall(CsRequestGroupUpdateOneRecordByGroupCID, group_data);
    //   alert("組織已刪除");
    GotoPageOrganizationSelectAll();
  } catch (e) {
    if (e.message !== "Handled Server Error") alert("刪除組織失敗");
  } finally {
    VisibleLoaderElement(false);
  }
}

/*___________________________________________________________________________________*/
// 事件相關

async function initOrganizationView() {
  console.log("Organization View Initializing...");

  // i18n 渲染
  const lang = window.localStorage.getItem("language") || "zh-tw";
  if (typeof renderTemplate === "function") {
    await renderTemplate(lang, "app");
  }

  // 顯示放最後 等都完成後
  showTemplate("app");

  // [新增] 移除靜態 Loading 遮罩
  // 初始載入交由 API 請求的 VisibleLoaderElement 管理

  // [優化] 確保 DOM 渲染完畢後，立即精準更新標題
  if (typeof updatePageTitleWithGroupCid === "function") {
    updatePageTitleWithGroupCid("#organization-title", "", " - Organizations");
  }

  // [優化] 統一事件委派與 Memory Leak 防護
  if (window._orgPageEventController) window._orgPageEventController.abort();
  window._orgPageEventController = new AbortController();
  const signal = window._orgPageEventController.signal;

  document.addEventListener(
    "click",
    (e) => {
      if (e.target.closest("#organization_list-button-search")) {
        GotoPageOrganizationSelectAll();
        return;
      }
      if (e.target.closest("#organization_insert-button-ok")) {
        OrganizationInsertOne();
        return;
      }
      if (e.target.closest("#organization_update-button-ok")) {
        OrganizationUpdateOne();
        return;
      }
      if (e.target.closest("#organization_update-button-delete")) {
        OrganizationDeleteOne();
        return;
      }
      if (e.target.closest("#organization_list-button-gotopage_insert")) {
        GotoPageOrganizationInsertOne();
        return;
      }
      if (e.target.closest("#organization_insert-button-cancel")) {
        window.history.back();
        return;
      }
      if (e.target.closest("#organization_update-button-cancel")) {
        GotoPageOrganizationSelectAll();
        return;
      }

      // 表格內的操作按鈕 (利用事件委派統一處理，避免 Memory Leak)
      const actionBtn = e.target.closest("button[data-action]");
      if (actionBtn) {
        const action = actionBtn.dataset.action;
        const cid = actionBtn.dataset.groupCid;
        if (action === "update-org") {
          GotoPageOrganizationUpdateOne(cid);
        } else if (action === "dashboard-org") {
          window.location.href =
            "dashboard.html#group_cid=" + encodeURIComponent(cid);
        }
        return;
      }
    },
    { signal },
  );

  // 預設資料
  {
    document.getElementById("organization_insert-owner_cid").value =
      Cyberspace.Client.getUsername();
  }

  // 預設要取得有擁有的組織
  {
    let page_num = "";
    {
      const hash = window.location.hash; // "#tab=2"
      const params = new URLSearchParams(hash.substring(1)); // 去掉 "#" 再解析
      page_num = params.get("page"); // 取得 "2"
      console.log(page_num); // → "2"
    }
    //document.getElementById("dashboard_device_001-search_group_cid").value = owner_cid;
    if (page_num == "page02") {
      change_page("page02", { transition: "fade", changeHash: false });
      GotoPageOrganizationInsertOne();
    } else {
      GotoPageOrganizationSelectAll();
    }
  }
}

// -----------------------------------------------------------
// 依賴狀態管理：確保核心函式庫載入後才執行
// -----------------------------------------------------------
function startOrganizationApp() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initOrganizationView);
  } else {
    initOrganizationView();
  }
}

if (window._CoreLoaded) {
  startOrganizationApp();
} else {
  window.addEventListener("CoreDependenciesReady", startOrganizationApp);
}
