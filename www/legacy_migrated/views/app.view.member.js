// home.html 的頁面事件操控程式碼相關
console.log("🚀 [DEBUG] app.view.member.js v1.0.11 - group dropdown list loaded");

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
// 直接執行

/*___________________________________________________________________________________*/
// function 相關
const def_rows_per_page = 10;

// 顯示會員列表的欄位對照表 與 順序
let key_member_list_info = [
  "member_cid",
  //"member_name",
  // "group_cid",
  //"record_state",
  //"create_time",
  //"group_cnt",
  //"phone_cell",
  //"phone_home",
  //"phone_work",
  "email",
  //"address",
  //"city",
  //"country",
  //"gender",
  //"birthday",
  //"avatar_url",
];

//let _member_info_username = "member_cid";

var member_depth = 1;

// 排序狀態管理
let currentSortField = "";
let currentSortOrder = "asc"; // 'asc' 或 'desc'

// 用於管理 Modal 事件生命週期的控制器
window._memberModalEventController = null;
window._memberRebindController = null;
window._memberUpdateEventController = null;

let _g_member_request_controller = null;

// 搜尋功能
function searchMembers() {
  let searchInput = document.getElementById("member-search-input");
  let searchValue = searchInput.value.toLowerCase().trim();

  let table = document.getElementById("member_list-list_information");
  if (!table) return;

  let tbody = table.querySelector("tbody");
  if (!tbody) return;

  let rows = tbody.querySelectorAll("tr");

  rows.forEach(function (row) {
    let shouldShow = false;

    if (searchValue === "") {
      shouldShow = true;
    } else {
      // 搜尋所有 td 內容
      let cells = row.querySelectorAll("td");
      cells.forEach(function (cell) {
        if (cell.textContent.toLowerCase().includes(searchValue)) {
          shouldShow = true;
        }
      });
    }

    row.style.display = shouldShow ? "" : "none";
  });
}

// 寄送歡迎郵件給會員
async function sendWelcomeEmail(memberCid) {
  console.log("[sendWelcomeEmail] 準備寄送郵件給:", memberCid);

  VisibleLoaderElement(true);

  try {
    // 呼叫 API
    await apiCall(CsRequestMemberSendEMail, memberCid);
    alert("歡迎郵件已成功寄送給 " + memberCid);
  } catch (e) {
    if (e.message !== "Handled Server Error") {
      console.error("[sendWelcomeEmail] 失敗:", e);
      alert("寄送郵件失敗");
    }
  } finally {
    VisibleLoaderElement(false);
  }
}

// 重新綁定搜尋功能
function rebindMemberSearchFunction() {
  // [Phase 2 優化] 註銷舊事件，重新分配生命週期
  if (window._memberRebindController) {
    window._memberRebindController.abort();
  }
  window._memberRebindController = new AbortController();
  const signal = window._memberRebindController.signal;

  let searchInput = document.getElementById("member-search-input");
  if (searchInput) {
    // 清空搜尋框
    searchInput.value = "";

    // 使用 AbortController 統一管理事件生命週期
    searchInput.addEventListener("input", searchMembers, { signal });
    searchInput.addEventListener("keypress", handleMemberSearchKeypress, {
      signal,
    });
  }

  // 綁定編輯按鈕事件
  let editButton = document.getElementById("member-edit-button");
  if (editButton) {
    editButton.addEventListener(
      "click",
      function () {
        // 獲取選中的會員
        let selectedMember = getSelectedMember();
        console.log("Selected Member for Edit:", selectedMember);
        if (selectedMember) {
          GotoPageMemberUpdateOne(selectedMember);
        } else {
          const checkedCount = document.querySelectorAll(
            "#member_list-list_information .member-row-checkbox:checked",
          ).length;
          if (checkedCount > 1) {
            alert("請只選擇單一會員進行編輯");
          } else {
            alert("請先選擇要編輯的會員");
          }
        }
      },
      { signal },
    );
  }

  // 綁定編輯頁關閉按鈕事件
  let editCloseButton = document.getElementById("member-edit-close");
  if (editCloseButton) {
    editCloseButton.addEventListener(
      "click",
      function () {
        // 隱藏 modal
        const modal = document.getElementById("member-edit-modal");
        if (modal) {
          modal.style.display = "none";
        }
      },
      { signal },
    );
  }

  // [優化] 使用事件委派處理表格內的按鈕點擊
  let table = document.getElementById("member_list-list_information");
  let tbody = table ? table.querySelector("tbody") : null;

  if (tbody) {
    tbody.addEventListener(
      "click",
      function (e) {
        // 尋找觸發事件的元素或其父元素 (具有 data-action 屬性)
        const target = e.target.closest("[data-action]");

        if (target) {
          const action = target.dataset.action;
          const memberCid = target.dataset.memberCid;

          if (action === "send-mail") {
            e.stopPropagation();
            console.log("[EventDelegation] 點擊郵件按鈕，會員:", memberCid);
            sendWelcomeEmail(memberCid);
          } else if (action === "select-member") {
            e.stopPropagation();
            console.log("[EventDelegation] 快速編輯會員:", memberCid);
            GotoPageMemberUpdateOne(memberCid); // [優化] 改為開啟編輯彈窗
          }
          return;
        }

        // [優化] 點擊行即勾選 (避開 input 元素以免重複觸發)
        if (e.target.tagName.toLowerCase() !== "input") {
          const row = e.target.closest("tr");
          if (row) {
            const checkbox = row.querySelector(".member-row-checkbox");
            if (checkbox) {
              checkbox.checked = !checkbox.checked;
              // 觸發 change 事件以更新其他 UI 狀態
              checkbox.dispatchEvent(new Event("change", { bubbles: true }));
            }
          }
        }
      },
      { signal },
    );
    // 移除舊的自定義屬性，確保代碼乾淨
    delete tbody.dataset.eventAttached;
  }
}

// 獲取選中的會員
function getSelectedMember() {
  let checkboxes = document.querySelectorAll(
    "#member_list-list_information .member-row-checkbox:checked",
  );
  if (checkboxes.length === 1) {
    let row = checkboxes[0].closest("tr");
    // 會員編號通常在第二個 td (第一個是 checkbox)
    let memberCid = row.cells[1].textContent.trim();
    return memberCid;
  }
  return null;
}

// 處理搜尋按鍵事件
function handleMemberSearchKeypress(event) {
  if (event.key === "Enter") {
    searchMembers();
  }
}

/*___________________________________________________________________________________*/
function GotoPageMemberSelectAll(parent_name) {
  MemberSelectAll(parent_name);
  change_page("page01");
}

function GotoPageMemberInsertOne() {
  change_page("page02");
}

async function GotoPageMemberUpdateOne(member_name) {
  // [優化] 等待資料完全載入並填入欄位後，才顯示 Modal，徹底消除閃爍 (FOUC)
  await MemberSelectOne(member_name);

  // 顯示編輯 modal
  const modal = document.getElementById("member-edit-modal");
  if (modal) {
    modal.style.display = "flex";
  }

  setTimeout(() => {
    const editTitleElement = document.getElementById("member-edit-title");
    const mainTitleElement = document.getElementById("member-title");

    if (editTitleElement && mainTitleElement) {
      // 獲取主標題的純文字內容（去除後綴）
      let groupCidText = mainTitleElement.textContent
        .replace(/\s*-\s*.*$/, "")
        .trim();
      // 獲取編輯頁標題的原始文字內容
      let originalEditText = editTitleElement.textContent;

      // 組合新的標題：組織ID + 編輯會員
      editTitleElement.textContent = `${originalEditText}`;
      console.log("✅ 更新編輯頁標題:", `${originalEditText}`);
    }
  }, 100);
}

/*___________________________________________________________________________________*/
async function MemberSelectAll(parent_name) {
  // 顯示帳戶角色
  {
    {
      let element = document.getElementById("member_list-role");
      if (element) {
        element.textContent = window.localeData.role[member_depth];
      }
    }
    {
      let element = document.getElementById("member_list-name");
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
      "member_list-input_search_value",
    ).value;
    member_depth = 1;
  } else {
    member_depth++;
  }

  // 搜尋條件
  // [優化] 根據側邊欄選擇的「公司 (group_cid)」來查詢專屬用戶
  let search_condition_type = window._k_search_condition_type_by_group_cid;
  let search_condtition_cid = window.sessionStorage.getItem("select_group_cid") || window.sessionStorage.getItem("group_cid");

  // [防呆] 確保搜尋對象絕對有值，若無選擇公司則退回查詢自身底下的用戶
  if (!search_condtition_cid) {
    search_condition_type = window._k_search_condition_type_by_parent_cid;
    search_condtition_cid =
      parent_name ||
      window.sessionStorage.getItem("member_cid") ||
      Cyberspace.Client.getUsername();
  }

  //   let search_condition_type = document.getElementById(
  //     "member_list-input_search_field"
  //   ).value;
  //   let search_condtition_cid = document.getElementById(
  //     "member_list-input_search_value"
  //   ).value;

  //   if (search_condtition_cid == null || search_condtition_cid == "") {
  //     search_condtition_cid = parent_name;
  //   }

  VisibleLoaderElement(true);

  if (_g_member_request_controller) {
    _g_member_request_controller.abort();
  }
  _g_member_request_controller = new AbortController();

  try {
    const json_object = await apiCall(
      CsRequestMemberSelectAllCountByCondition,
      search_condition_type,
      search_condtition_cid,
      "",
      _g_member_request_controller,
    );

    // [修正] 若無資料，直接關閉 Loader 並返回
    if (json_object.count == 0) {
      // 這裡可以選擇清空表格或顯示無資料訊息
      var element_table = document.getElementById(
        "member_list-list_information",
      );
      let tbody = element_table.querySelector("tbody");
      if (tbody) tbody.innerHTML = "";
      return;
    }

    let list_table_page = document.getElementById(
      "member_list-list_pagination",
    );
    if (list_table_page) {
      tablepage_d(
        list_table_page,
        def_rows_per_page,
        json_object.count,
        async function (now_index, count_of_page) {
          if (_g_member_request_controller) {
            _g_member_request_controller.abort();
          }
          _g_member_request_controller = new AbortController();

          VisibleLoaderElement(true);
          try {
            const result = await apiCall(
              CsRequestMemberSelectAllRecordsByCondition,
              search_condition_type,
              search_condtition_cid,
              "",
              now_index,
              count_of_page,
              _g_member_request_controller,
            );

            // apiCall 已經解析了 JSON，但這裡為了相容舊代碼結構，
            // 我們需要將物件轉回 JSON 字串再解析，或者直接使用物件。
            // 由於 apiCall 回傳的是 jsonObject，我們直接使用它。
            // 但下方的代碼預期 result 是 string 並執行 JSON.parse(result)。
            // 為了最小化改動，我們將 apiCall 回傳的物件模擬成 result。
            let json_object = result; // 這裡 result 已經是物件
            let json_tablesi = json_object.records;

            var element_table = document.getElementById(
              "member_list-list_information",
            );
            let tbody = element_table.querySelector("tbody");

            if (!tbody) {
              tbody = document.createElement("tbody");
              element_table.appendChild(tbody);
            }

            // 清空表格
            tbody.innerHTML = "";

            if (json_tablesi && json_tablesi.member_cid) {
              // 創建索引數組並根據record_state排序，啟用的帳號(白色)在前面
              let indices = Array.from(
                { length: json_tablesi.member_cid.length },
                (_, i) => i,
              );
              indices.sort((a, b) => {
                const stateA =
                  json_tablesi.record_state &&
                    json_tablesi.record_state[a] === "0"
                    ? 1
                    : 0; // 禁用為1
                const stateB =
                  json_tablesi.record_state &&
                    json_tablesi.record_state[b] === "0"
                    ? 1
                    : 0; // 禁用為1
                return stateA - stateB; // 啟用的(0)在前面，禁用的(1)在後面
              });

              // 使用 DocumentFragment 優化渲染
              const fragment = document.createDocumentFragment();

              for (let idx = 0; idx < indices.length; idx++) {
                const i = indices[idx];
                // 刪除的帳號要不要不要用跳過的 用別的顏色或標記
                let record_enabled = true;
                let disabled_color = "#d6d6d6ff";
                if (
                  json_tablesi.record_state &&
                  json_tablesi.record_state[i] === "0"
                ) {
                  record_enabled = false;
                }

                const memberCid = json_tablesi.member_cid[i];
                const email = HtmlUtil.escape(json_tablesi.email[i]);

                const row = document.createElement("tr");
                if (!record_enabled) {
                  row.style.backgroundColor = disabled_color; // 很淺的灰色 (Whitesmoke)
                }

                // [資安與效能優化] 改用 DOMUtil 安全建立節點
                const inputCheck = DOMUtil.create("input", {
                  type: "checkbox",
                  className: "member-row-checkbox",
                  "data-member-cid": memberCid,
                  style: "margin-left:1rem; cursor: pointer",
                });
                const cellCheckbox = DOMUtil.create("td", null, inputCheck);
                row.appendChild(cellCheckbox);

                const btnMemberCid = DOMUtil.create(
                  "button",
                  {
                    className: "link_text",
                    "data-action": "select-member",
                    "data-member-cid": memberCid,
                  },
                  memberCid,
                );
                const cellMemberCid = DOMUtil.create("td", null, btnMemberCid);
                row.appendChild(cellMemberCid);

                const cellEmail = document.createElement("td");
                cellEmail.textContent = email;
                row.appendChild(cellEmail);

                const cellPassword = document.createElement("td");

                cellPassword.textContent = "********";
                row.appendChild(cellPassword);

                const imgMail = DOMUtil.create("img", {
                  src: "assets/images/mail.svg",
                  alt: "",
                  style: "pointer-events: none;",
                });
                const divMailBtn = DOMUtil.create(
                  "div",
                  {
                    className: "member-mail-button",
                    "data-action": "send-mail",
                    "data-member-cid": memberCid,
                    onmouseover: "this.style.backgroundColor='#EE963F'",
                    onmouseout: "this.style.backgroundColor='#214F7C'",
                  },
                  imgMail,
                );
                const divMailContainer = DOMUtil.create(
                  "div",
                  {
                    style:
                      "display: flex; align-items: center; justify-content: flex-start;",
                  },
                  divMailBtn,
                );
                const cellMail = DOMUtil.create("td", null, divMailContainer);
                row.appendChild(cellMail);

                fragment.appendChild(row);
              }

              // 一次性掛載
              tbody.appendChild(fragment);
            }
            rebindMemberSearchFunction();
          } catch (e) {
            if (
              e.name !== "AbortError" &&
              e.message !== "Handled Server Error"
            ) {
              console.error("[MemberSelectAll] 取得分頁資料失敗", e);
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
      console.log("Member SelectAll request aborted");
      return;
    }
    if (e.message !== "Handled Server Error") {
      console.error(e);
      alert("request error");
    }
  } finally {
    // [修復] 補回外層的 finally，確保計數器完美平衡
    VisibleLoaderElement(false);
  }
}

async function MemberSelectOne(member_name) {
  // 開啟loading dialog
  VisibleLoaderElement(true);

  try {
    const json_object = await apiCall(
      CsRequestMemberSelectOneRecordByMemberCID,
      member_name,
    );

    // 填入初始資料
    {
      let record = json_object.records;
      document.getElementById("member_update-member_cid").value =
        record.member_cid[0];
      document.getElementById("member_update-email").value = record.email[0];
      document.getElementById("member_update-password").value =
        record.password[0];
      document.getElementById("member_update-member_name").value =
        record.member_name[0];
      document.getElementById("member_update-group_cid").value =
        record.group_cid[0];
      document.getElementById("member_update-gender").value = record.gender[0];
      document.getElementById("member_update-record_state").value =
        record.record_state[0];

      // [修復] 清空上次輸入的新密碼與確認密碼，防止殘留
      const newPwdEl = document.getElementById("member_update-new_password");
      if (newPwdEl) newPwdEl.value = "";
      const confirmPwdEl = document.getElementById(
        "member_update-confirm_password",
      );
      if (confirmPwdEl) confirmPwdEl.value = "";

      // [防呆] 避免沒有生日的帳號觸發 split 導致 TypeError 崩潰
      document.getElementById("member_update-birthday").value =
        record.birthday && record.birthday[0]
          ? record.birthday[0].split(" ")[0]
          : "";

      document.getElementById("member_update-phone_cell").value =
        record.phone_cell[0];
      document.getElementById("member_update-phone_home").value =
        record.phone_home[0];
      document.getElementById("member_update-phone_work").value =
        record.phone_work[0];

      document.getElementById("member_update-country").value =
        record.country[0];
      document.getElementById("member_update-city").value = record.city[0];
      document.getElementById("member_update-address").value =
        record.address[0];
      document.getElementById("member_update-note00").value = record.note00[0];
      //document.getElementById('member_update-avatar_url').value = record.avatar_url[0];
    }
  } catch (e) {
    if (e.message !== "Handled Server Error") {
      alert("request error");
    }
  } finally {
    VisibleLoaderElement(false);
  }
}

async function MemberInsertOne() {
  let parent_cid = Cyberspace.Client.getUsername();

  // [穩定性優化] 建立安全取值函式，避免因 DOM 隱藏或移除導致 .value 報錯 Crash
  function getElementValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : "";
  }

  var member_data = Object.create(MemberData);
  member_data.member_cid = getElementValue("member_insert-member_cid");
  member_data.password = getElementValue("member_insert-password");
  let confirmPassword = getElementValue("member_insert-password_confirm");

  // [新增] 密碼一致性驗證，防堵使用者輸入錯誤的密碼
  if (member_data.password !== confirmPassword) {
    alert("密碼與確認密碼不符");
    return;
  }

  member_data.member_name = getElementValue("member_insert-member_name");

  // [新增] 優先讀取表單欄位，若無則降級讀取 Session 狀態，並加入強制防呆阻擋
  let inputGroupCid = getElementValue("member_insert-group_cid").trim();
  member_data.group_cid =
    inputGroupCid ||
    window.sessionStorage.getItem("select_group_cid") ||
    window.sessionStorage.getItem("group_cid") ||
    "";

  if (!member_data.group_cid) {
    alert(
      GetLocalData("warring.no_group_cid") || "請先選擇隸屬的組織 (Company)！",
    );
    return;
  }

  member_data.gender = getElementValue("member_insert-gender");
  member_data.phone_cell = getElementValue("member_insert-phone_cell");
  member_data.phone_home = getElementValue("member_insert-phone_home");
  member_data.phone_work = getElementValue("member_insert-phone_work");
  member_data.email = getElementValue("member_insert-email");
  member_data.address = getElementValue("member_insert-address");
  member_data.city = getElementValue("member_insert-city");
  member_data.country = getElementValue("member_insert-country");
  member_data.note00 = getElementValue("member_insert-note00");

  // [資料修復] 填補 C++ 後端嚴格要求的欄位預設值，避免 API 拋出參數錯誤 (QERRNO_FAILURE_INPUT_PARAM)
  member_data.birthday =
    getElementValue("member_insert-birthday") || "1991-01-01";
  member_data.avatar_url = getElementValue("member_insert-avatar_url") || "";

  console.log(member_data);

  VisibleLoaderElement(true);
  try {
    // [修復] 修正拼寫錯誤 CsRequesMembert -> CsRequestMember
    const json_object = await apiCall(
      CsRequestMemberInsertOneRecordByParentCID,
      parent_cid, // parent_cid 先傳空
      member_data,
    );
    alert(GetLocalData("common.success"));

    // [UX 優化] 新增成功後自動關閉 Modal 並重新載入列表
    const modal = document.getElementById("member-add-modal");
    if (modal) modal.style.display = "none";
    const form = document.getElementById("member-add-form");
    if (form) form.reset();
    MemberSelectAll();
  } catch (e) {
    if (e.message !== "Handled Server Error") alert("request error");
  } finally {
    VisibleLoaderElement(false);
  }
}

async function MemberUpdateOne() {
  var member_data = Object.create(MemberData);
  member_data.member_cid = document.getElementById(
    "member_update-member_cid",
  ).value;
  // 處理密碼更新邏輯
  let newPassword = getElementValue("member_update-new_password");
  let confirmPassword = getElementValue("member_update-confirm_password");

  if (newPassword && newPassword !== confirmPassword) {
    alert("新密碼與確認密碼不符");
    return;
  } else if (newPassword && newPassword === confirmPassword) {
    member_data.password = newPassword; // 使用新密碼
  } else {
    // 如果沒輸入新密碼，保持原密碼
    member_data.password = getElementValue("member_update-password");
  }
  // 安全取得欄位值，如果元素不存在則使用空字串
  function getElementValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : "";
  }

  member_data.member_name = getElementValue("member_update-member_name");
  member_data.group_cid = getElementValue("member_update-group_cid");
  member_data.gender = getElementValue("member_update-gender");
  member_data.record_state = getElementValue("member_update-record_state");
  member_data.birthday = getElementValue("member_update-birthday");
  member_data.phone_cell = getElementValue("member_update-phone_cell");
  member_data.phone_home = getElementValue("member_update-phone_home");
  member_data.phone_work = getElementValue("member_update-phone_work");
  member_data.email = getElementValue("member_update-email");
  member_data.address = getElementValue("member_update-address");
  member_data.city = getElementValue("member_update-city");
  member_data.country = getElementValue("member_update-country");
  member_data.note00 = getElementValue("member_update-note00");

  VisibleLoaderElement(true);
  try {
    await apiCall(CsRequestMemberUpdateOneRecordByMemberCID, member_data);

    alert(GetLocalData("common.success"));

    // 隱藏 modal
    const modal = document.getElementById("member-edit-modal");
    if (modal) {
      modal.style.display = "none";
    }

    // 重新載入會員列表
    MemberSelectAll();
  } catch (e) {
    if (e.message !== "Handled Server Error") alert("request error");
  } finally {
    VisibleLoaderElement(false);
  }
  //member_data.avatar_url = document.getElementById('member_insert-avatar_url').value;
}

/*___________________________________________________________________________________*/
// 事件相關

async function initMemberView() {
  console.log("Member View Initializing...");

  // 產品類型與導覽列切換
  const urlParams = new URLSearchParams(window.location.search);
  const product =
    urlParams.get("product") ||
    window.sessionStorage.getItem("product_type") ||
    "avacast";
  window.sessionStorage.setItem("product_type", product);

  const navContainer = document.getElementById("nav-container");
  const avaclassroomNavContainer = document.getElementById(
    "avaclassroom-nav-container",
  );

  if (product === "avaclassroom") {
    if (navContainer) navContainer.style.display = "none";
    if (avaclassroomNavContainer) {
      avaclassroomNavContainer.style.display = "block";
    }
    loadScript("components/avaclassroom-nav/avaclassroom.js", () => {
      if (typeof initializeAvaclassroomNav === "function") {
        initializeAvaclassroomNav();
      }
    });
  } else {
    if (navContainer) navContainer.style.display = "block";
    if (avaclassroomNavContainer) {
      avaclassroomNavContainer.style.display = "none";
    }
    loadScript("components/app.component.frame.nav.js", () => {
      if (typeof initializeStandardNav === "function") {
        initializeStandardNav();
      }
    });
  }

  const lang = window.localStorage.getItem("language") || "zh-tw";
  if (typeof renderTemplate === "function") {
    await renderTemplate(lang, "app");
  }

  // 顯示放最後 等都完成後
  showTemplate("app");

  // [新增] 載入組織清單填寫下拉選單
  await LoadGroupCidOptions();

  // [新增] 移除靜態 Loading 遮罩
  // 初始載入交由 API 請求的 VisibleLoaderElement 管理

  // [新增] 綁定按鈕 Hover 圖片切換效果
  const memberEditButton = document.getElementById("member-edit-button");
  const memberEditIcon = memberEditButton
    ? memberEditButton.querySelector("img")
    : null;
  if (memberEditButton && memberEditIcon) {
    memberEditButton.addEventListener("mouseenter", function () {
      memberEditIcon.src = "assets/images/edit_button_change.png";
    });
    memberEditButton.addEventListener("mouseleave", function () {
      memberEditIcon.src = "assets/images/edit.svg";
    });
  }

  const addButton = document.getElementById("member_list-button-open_modal");
  const addIcon = addButton ? addButton.querySelector("img") : null;
  if (addButton && addIcon) {
    addButton.addEventListener("mouseenter", function () {
      addIcon.src = "assets/images/information_button_orange.png";
    });
    addButton.addEventListener("mouseleave", function () {
      addIcon.src = "assets/images/Group 607.svg";
    });
  }

  //_________________________________________________________________________________
  // 初始化搜尋功能
  rebindMemberSearchFunction();

  // 確保標題正確顯示選中的公司
  // 檢查是否有選中的公司，如果沒有就從 sessionStorage 讀取並更新標題
  let groupCid = sessionStorage.getItem("group_cid");
  if (!groupCid) {
    groupCid = sessionStorage.getItem("select_group_cid");
    if (groupCid) {
      // 同步兩個 sessionStorage 鍵
      sessionStorage.setItem("group_cid", groupCid);
    }
  }

  if (groupCid && typeof updatePageTitleWithGroupCid === "function") {
    // [優化] 移除 1200ms 的延遲，改為 await renderTemplate 後直接同步執行
    updatePageTitleWithGroupCid("#member-title", "", " - Members");
    console.log("✅ 頁面載入時更新標題:", groupCid);

    if (typeof addOrganizationEditClickToTitle === "function") {
      addOrganizationEditClickToTitle();
    }
  }

  // 動作
  // 當前只用者名稱
  {
    let element = document.getElementById("member_cid");
    if (element) {
      element.textContent = Cyberspace.Client.getUsername();
    }
  }

  // 預設組織帳號
  {
    let group_cid;
    {
      const hash = window.location.hash; // "#tab=2"
      const params = new URLSearchParams(hash.substring(1)); // 去掉 "#" 再解析
      group_cid = params.get("group_cid"); // 取得 "2"
      console.log(group_cid); // → "2"
    }
  }

  {
    document.getElementById("member_list-input_search_value").value =
      Cyberspace.Client.getUsername();
  }

  // [Phase 2] 統一事件委派與 Memory Leak 防護，徹底解決元件切換造成的監聽器堆疊
  if (window._memberViewEventController) window._memberViewEventController.abort();
  window._memberViewEventController = new AbortController();
  const signal = window._memberViewEventController.signal;

  document.addEventListener("click", (e) => {
    // 1. 搜尋
    if (e.target.closest("#member_list-button-search")) {
      MemberSelectAll();
      return;
    }

    // 2. 開啟新增 Modal
    if (e.target.closest("#member_list-button-open_modal")) {
      const addModal = document.getElementById("member-add-modal");
      if (addModal) addModal.style.display = "flex";
      return;
    }

    // 3. 確認新增
    if (e.target.closest("#member_insert-button-ok")) {
      e.preventDefault();
      MemberInsertOne();
      return;
    }

    // 4. 取消新增 / 關閉新增 Modal
    if (e.target.closest("#member_insert-button-cancel") || e.target.closest("#member-add-modal-close")) {
      e.preventDefault();
      const addModal = document.getElementById("member-add-modal");
      if (addModal) addModal.style.display = "none";
      const addForm = document.getElementById("member-add-form");
      if (addForm) addForm.reset();
      return;
    }

    // 5. 點擊新增 Modal 背景關閉
    if (e.target.id === "member-add-modal") {
      e.target.style.display = "none";
      const addForm = document.getElementById("member-add-form");
      if (addForm) addForm.reset();
      return;
    }

    // 6. 確認更新
    if (e.target.closest("#member_update-button-ok")) {
      e.preventDefault();
      MemberUpdateOne();
      return;
    }

    // 7. 取消更新 / 關閉編輯 Modal / 點擊編輯 Modal 背景關閉
    if (e.target.closest("#member_update-button-cancel") || e.target.id === "member-edit-modal" || e.target.closest("#member-edit-close")) {
      e.preventDefault();
      const editModal = document.getElementById("member-edit-modal");
      if (editModal) editModal.style.display = "none";
      return;
    }

    // 8. 密碼眼睛切換
    const toggleBtn = e.target.closest("[id^='member'][id*='password'][id$='-toggle']");
    if (toggleBtn) {
      const container = toggleBtn.parentElement;
      const input = container.querySelector("input");
      const icon = toggleBtn.querySelector("img");
      if (input && icon) {
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        icon.src = isPassword
          ? "assets/images/passwordeyeopen.svg"
          : "assets/images/passwordeyeclose.svg";
        e.stopImmediatePropagation();
      }
      return;
    }
  }, { signal });

  // 9. 全選 Checkbox
  document.addEventListener("change", (e) => {
    if (e.target.id === "member-select-all") {
      const checkboxes = document.querySelectorAll(".member-row-checkbox");
      checkboxes.forEach((checkbox) => {
        if (checkbox.closest("tr").style.display !== "none") {
          checkbox.checked = e.target.checked;
        }
      });
    }
  }, { signal });

  // 10. ESC 鍵關閉模態框
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const addModal = document.getElementById("member-add-modal");
      if (addModal && addModal.style.display === "flex") {
        addModal.style.display = "none";
        const form = document.getElementById("member-add-form");
        if (form) form.reset();
      }
      const editModal = document.getElementById("member-edit-modal");
      if (editModal && editModal.style.display === "flex") {
        editModal.style.display = "none";
      }
    }
  }, { signal });

  GotoPageMemberSelectAll();

}

// -----------------------------------------------------------
// 依賴狀態管理：確保核心函式庫載入後才執行
// -----------------------------------------------------------
function startMemberApp() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMemberView);
  } else {
    initMemberView();
  }
}

if (window._CoreLoaded) {
  startMemberApp();
} else {
  window.addEventListener("CoreDependenciesReady", startMemberApp);
}

async function executeCloseMemberLogic(checkboxes) {
  VisibleLoaderElement(true);

  let successCount = 0;
  let errorCount = 0;
  // const totalCount = checkboxes.length;

  // 定義單筆處理邏輯
  const processMember = async (checkbox) => {
    const memberCid = checkbox.getAttribute("data-member-cid");
    try {
      const json_object = await apiCall(
        CsRequestMemberSelectOneRecordByMemberCID,
        memberCid,
      );

      const record = json_object.records;
      if (!record || !record.member_cid || record.member_cid.length === 0) {
        console.error(
          `[closeMember] Fetched data for member_cid: ${memberCid} is empty or invalid.`,
        );
        errorCount++;
        return;
      }

      var member_data = Object.create(MemberData);
      Object.keys(member_data).forEach((key) => {
        if (record[key] && record[key][0] !== undefined) {
          member_data[key] = record[key][0];
        }
      });
      member_data.record_state = "0";
      member_data.member_cid = memberCid;

      await apiCall(CsRequestMemberUpdateOneRecordByMemberCID, member_data);
      successCount++;
    } catch (e) {
      console.error(
        `[closeMember] Error processing member_cid: ${memberCid}.`,
        e,
      );
      errorCount++;
    }
  };

  // 簡單的並發控制 (一次 3 個)
  const CONCURRENCY_LIMIT = 3;
  const chunkedCheckboxes = [];
  const checkboxesArray = Array.from(checkboxes); // NodeList to Array
  for (let i = 0; i < checkboxesArray.length; i += CONCURRENCY_LIMIT) {
    chunkedCheckboxes.push(checkboxesArray.slice(i, i + CONCURRENCY_LIMIT));
  }

  try {
    for (const chunk of chunkedCheckboxes) {
      await Promise.all(chunk.map((item) => processMember(item)));
    }
  } catch (err) {
    console.error("Batch processing error:", err);
  } finally {
    VisibleLoaderElement(false);
    alert(`作業完成。成功 ${successCount} 筆，失敗 ${errorCount} 筆。`);
    MemberSelectAll();
  }
}

function closeSelectedMembers() {
  // [資安防護 - BAC 越權攔截] 預設拒絕：Tier >= 3 (如經銷商) 禁止刪除會員
  const tier = parseInt(window.sessionStorage.getItem("tier"), 10);
  if (isNaN(tier) || tier >= 3) {
    alert(window.localeData?.common?.deny || "權限不足，無法執行此操作。");
    return;
  }

  const checkboxes = document.querySelectorAll(".member-row-checkbox:checked");

  if (checkboxes.length === 0) {
    alert("請選擇要刪除的項目");
    return;
  }

  const modal = document.getElementById("delete-confirmation-modal");
  const messageEl = document.getElementById("delete-modal-message");
  const itemsEl = document.getElementById("delete-modal-items");
  const confirmBtn = document.getElementById("delete-modal-confirm");
  const cancelBtn = document.getElementById("delete-modal-cancel");

  if (!modal || !messageEl || !itemsEl || !confirmBtn || !cancelBtn) {
    if (!confirm(`確定要刪除這 ${checkboxes.length} 筆紀錄嗎？`)) {
      return;
    }
    executeCloseMemberLogic(checkboxes);
    return;
  }

  messageEl.textContent = `您確定要刪除這 ${checkboxes.length} 位會員嗎？`;

  itemsEl.innerHTML = "";
  checkboxes.forEach((cb) => {
    const row = cb.closest("tr");
    const identifier = row.cells[1]
      ? row.cells[1].textContent.trim()
      : `ID: ${cb.getAttribute("data-member-cid")}`;
    const item = document.createElement("div");
    item.textContent = identifier;
    item.style.padding = "4px 0";
    itemsEl.appendChild(item);
  });

  modal.style.display = "flex";

  // [Phase 1 優化] 使用 AbortController 替換 cloneNode
  if (window._memberModalEventController)
    window._memberModalEventController.abort();
  window._memberModalEventController = new AbortController();
  const signal = window._memberModalEventController.signal;

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
      executeCloseMemberLogic(checkboxes);
    },
    { signal },
  );
}

function sortMemberTable(field) {
  if (currentSortField === field) {
    currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
  } else {
    currentSortField = field;
    currentSortOrder = "asc";
  }

  updateSortIcons(field, currentSortOrder);

  sortTableData(field, currentSortOrder);
}

function updateSortIcons(activeField, order) {
  const sortIcons = ["member_cid", "email", "password"];

  sortIcons.forEach((field) => {
    const icon = document.getElementById(`sort-${field}`);
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

function sortTableData(field, order) {
  const tableBody = document.querySelector(
    "#member_list-list_information tbody",
  );
  if (!tableBody) return;

  const rows = Array.from(tableBody.querySelectorAll("tr"));

  rows.sort((a, b) => {
    let aValue = getCellValueForMember(a, field);
    let bValue = getCellValueForMember(b, field);

    if (aValue < bValue) return order === "asc" ? -1 : 1;
    if (aValue > bValue) return order === "asc" ? 1 : -1;
    return 0;
  });

  rows.forEach((row) => tableBody.appendChild(row));
}

function getCellValueForMember(row, field) {
  const fieldMap = {
    member_cid: 1,
    email: 2,
    password: 3,
  };

  const cellIndex = fieldMap[field];
  if (cellIndex === undefined) return "";

  const cell = row.cells[cellIndex];
  return cell ? cell.textContent.trim() : "";
}

// [新增] 載入使用者能管理的所有組織清單並填寫下拉選單
async function LoadGroupCidOptions() {
  const insertSelect = document.getElementById("member_insert-group_cid");
  const updateSelect = document.getElementById("member_update-group_cid");

  if (!insertSelect && !updateSelect) return;

  const owner_cid = sessionStorage.getItem("member_cid") || Cyberspace.Client.getUsername();
  const search_condition_type = window._k_search_condition_type_by_owner_cid || "2";

  try {
    // 呼叫 API 取得所有組織（上限 1000 筆已足夠）
    const result = await apiCall(
      CsRequestGroupSelectAllRecordsByCondition,
      search_condition_type,
      owner_cid,
      0,
      1000
    );

    if (result && result.records && result.records.group_cid) {
      const groupCids = result.records.group_cid;
      const groupNames = result.records.group_name || [];

      // 產生 option HTML
      let optionsHtml = '<option value="">-- 請選擇組織 --</option>';
      for (let i = 0; i < groupCids.length; i++) {
        const cid = groupCids[i];
        const name = groupNames[i] || cid;
        optionsHtml += `<option value="${HtmlUtil.escape(cid)}">${HtmlUtil.escape(name)} (${HtmlUtil.escape(cid)})</option>`;
      }

      // 填充新增選單
      if (insertSelect) {
        insertSelect.innerHTML = optionsHtml;
        // 自動預選當前 sessionStorage 中選定的 group_cid
        const curGroup = sessionStorage.getItem("select_group_cid") || sessionStorage.getItem("group_cid") || "";
        if (curGroup) {
          insertSelect.value = curGroup;
        }
      }
      
      // 填充編輯選單
      if (updateSelect) {
        updateSelect.innerHTML = optionsHtml;
      }
    } else {
      console.warn("[LoadGroupCidOptions] No group records returned or empty list.");
    }
  } catch (e) {
    console.error("[LoadGroupCidOptions] Failed to load group options:", e);
  }
}
