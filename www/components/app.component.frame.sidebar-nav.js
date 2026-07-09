console.log("Sidebar Loaded");

//___________________________________________________________
// 替代從html讀入 因為目前不可行
function getSidebarNavHtml() {
  return `
      <aside id="sidebar" class="sidebar">
        <div class="sidebar-content">
          <!-- search  -->
          <div class="search-container">
            <svg class="search-icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M13.293 14.707a8 8 0 111.414-1.414l4.586 4.586a1 1 0 01-1.414 1.414l-4.586-4.586zM8 14a6 6 0 100-12 6 6 0 000 12z"
                clip-rule="evenodd"
              />
            </svg>
            <input
              id="sidebar-search-input"
              type="search"
              placeholder="Search"
              class="search-input"
              autocomplete="one-time-code"
              readonly
              onfocus="this.removeAttribute('readonly');"
            />
          </div>

          <!-- 經銷商跟公司國家 -->
          <div class="company-header">
            <p class="company-title">
              <img
                src="assets/images/IdentificationBadge.png"
                style
                ="width: 20px; height: 20px;"  
                alt=""
                class="company-icon"
              />
              <span class="company-text">{{sidebarnav.organization}}</span>
            </p>
          </div>

          <div class="country-header">
            <p class="country-title">{{sidebarnav.country}}</p>
          </div>

          <!-- country list -->
          <ul class="country-list">

            <li class="dropdown-item" data-country="Taiwan">
              <a href="#" class="dropdown-toggle">
                <img
                  src="assets/images/point_noramal.svg"
                  alt=""
                  class="point-icon"
                />
                <span class="country-name">{{country.taiwan}}</span>
              </a>
              <ul class="dropdown-menu">
              </ul>
            </li>

            <li class="dropdown-item" data-country="China">
              <a href="#" class="dropdown-toggle">
                <img
                  src="assets/images/point_noramal.svg"
                  alt=""
                  class="point-icon"
                />
                <span class="country-name">{{country.china}}</span>
              </a>
              <ul class="dropdown-menu">
              </ul>
            </li>

           <li class="dropdown-item" data-country="Japan">
              <a href="#" class="dropdown-toggle">
                <img
                  src="assets/images/point_noramal.svg"
                  alt=""
                  class="point-icon"
                />
                <span class="country-name">{{country.japan}}</span>
              </a>
              <ul class="dropdown-menu"> 
              </ul>
            </li>

            <li class="dropdown-item" data-country="India">
              <a href="#" class="dropdown-toggle">
                <img
                  src="assets/images/point_noramal.svg"
                  alt=""
                  class="point-icon"
                />
                <span class="country-name">{{country.india}}</span>
              </a>
              <ul class="dropdown-menu">
              </ul>
            </li>
            <li class="dropdown-item" data-country="Thailand">
              <a href="#" class="dropdown-toggle">
                <img
                  src="assets/images/point_noramal.svg"
                  alt=""
                  class="point-icon"
                />
                <span class="country-name">{{country.thailand}}</span>
              </a>
              <ul class="dropdown-menu">
              </ul>
            </li>

           </ul>
        </div>

        <!-- add company -->
        <button class="add-company-btn" id="add-company-btn">
          <img
            id="add-company-icon"
            src="assets/images/Group 606.svg"
            alt="#"
            class="add-company-icon"
            style="width: 20px; height: 20px;"
          />
          <p class="add-company-text">
             {{sidebarnav.add_new_organization}}
          </p>
        </button>

        <!-- Toggle Button -->
        <div id="toggleSidebar" class="toggle-btn">
          <img id="toggleIcon" src="assets/images/Vector.svg" alt="#" />
        </div>
      </aside>
`;
}

//___________________________________________________________
// 讀入css
(function () {
  if (
    !document.querySelector(
      'link[href="components/app.component.frame.sidebar-nav.css"]',
    )
  ) {
    var sidebar_link = document.createElement("link");
    sidebar_link.rel = "stylesheet";
    sidebar_link.type = "text/css";
    sidebar_link.href = "components/app.component.frame.sidebar-nav.css";
    document.getElementsByTagName("head")[0].appendChild(sidebar_link);
  }

  if (!document.getElementById("sidebar-custom-style")) {
    // [新增] 注入列表項目的淡入動畫樣式
    var style = document.createElement("style");
    style.id = "sidebar-custom-style";
    style.innerHTML = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .li-list-item {
        opacity: 0; /* 初始隱藏 */
        animation: fadeInUp 0.3s ease-out forwards;
      }
      /* [新增] 加深側邊欄箭頭顏色 */
      #toggleIcon {
          filter: brightness(0.6);
      }
    `;
    document.head.appendChild(style);
  }

  //loadFile('components/app.component.frame.sidebar-nav.html');
})();

//___________________________________________________________
// 加入公司
// 列表上面顯示的欄位對照表 與 順序
let key_group_bar_list_info = ["group_name", "group_cid"]; // [修改] 提取 名稱 與 代碼

// [新增] 獨立的渲染函數，供 API 回傳或快取讀取時共用
function renderSidebarMenu(menu, json_tablesi) {
  console.log("[renderSidebarMenu] 開始渲染，原始資料:", json_tablesi);
  if (
    !json_tablesi ||
    !json_tablesi.group_cid ||
    json_tablesi.group_cid.length === 0
  ) {
    console.warn("[renderSidebarMenu] 無資料可供渲染");
    return;
  }

  let companyArray = TablesiToTableii(key_group_bar_list_info, json_tablesi);

  // 1. 轉換為物件陣列以便排序
  let companies = companyArray.map((companyRow, index) => {
    // [修改] 解耦顯示名稱 (Name) 與 關聯代碼 (CID)
    let orgName = String(companyRow[0] || "").trim();
    let orgCid = String(companyRow[1] || "").trim();

    // 防呆：如果公司名稱沒有填寫，Fallback 退回顯示代碼
    let displayName = orgName !== "" ? orgName : orgCid;

    // 取得對應的 record_state
    let recordState = "1";
    if (json_tablesi.record_state && json_tablesi.record_state[index]) {
      recordState = json_tablesi.record_state[index];
    }

    let country =
      (json_tablesi.country && json_tablesi.country[index]) || "Unknown";

    return {
      displayName: displayName, // 顯示用
      cid: orgCid, // 邏輯關聯用
      state: recordState,
      country: country,
    };
  });

  console.log("[renderSidebarMenu] 轉換後的公司清單:", companies);

  // 2. 過濾已刪除 (state === "0")、空 CID 及自動生成的學校群組 (startsWith("sch_"))
  companies = companies.filter((c) => c.state !== "0" && c.cid !== "" && !c.cid.startsWith("sch_"));

  // 3. 按照字母排序 (不分大小寫)
  companies.sort((a, b) => {
    return a.displayName.localeCompare(b.displayName, undefined, {
      sensitivity: "base",
    });
  });

  let visibleIndex = 0;

  // 4. 渲染排序後的列表
  companies.forEach((company) => {
    const displayName = company.displayName;
    const cid = company.cid;

    const li = document.createElement("li");
    li.className = "li-list-item";

    // [新增] 設定動畫延遲，產生階梯式出現效果
    li.style.animationDelay = `${visibleIndex * 0.05}s`;
    visibleIndex++;

    const img = document.createElement("img");
    img.src = "assets/images/company.svg";
    img.className = "icon-img";
    img.setAttribute("data-normal", "assets/images/company.svg");
    img.setAttribute("data-change", "assets/images/company_change.svg");

    const a = document.createElement("a");
    a.href = "#"; // [資安修正] 使用 textContent 避免 XSS
    a.textContent = displayName; // [修改] 畫面上顯示公司名稱
    a.onclick = (event) => {
      event.preventDefault();

      const currentProduct = new URLSearchParams(window.location.search).get("product") || window.sessionStorage.getItem("product_type");
      if (currentProduct === "avaclassroom") {
        console.log(`[Classroom 模式] 點了代理商：${displayName} (ID: ${cid})`);

        let schoolUl = li.querySelector(".school-menu");
        if (!schoolUl) {
          schoolUl = document.createElement("ul");
          schoolUl.className = "school-menu";
          schoolUl.style.paddingLeft = "15px";
          schoolUl.style.marginLeft = "20px"; // 縮排形成階梯狀
          schoolUl.style.borderLeft = "1px dashed #cbd5e1"; // 加上階層指引虛線
          schoolUl.style.marginTop = "5px";
          schoolUl.style.marginBottom = "5px";
          schoolUl.style.display = "none";
          li.appendChild(schoolUl);
        }

        if (schoolUl.style.display === "none") {
          schoolUl.style.display = "block";
          if (!schoolUl.getAttribute("data-loaded")) {
            schoolUl.innerHTML = '<li style="padding:5px; color:#888; font-size:0.85em;">Loading schools...</li>';
            loadSchoolMenu(cid, schoolUl);
          }
        } else {
          schoolUl.style.display = "none";
        }
        return;
      }

      console.log(`你點了公司名稱：${displayName} (ID: ${cid})`);
      // [修改] 背後 Session 存入正確的關聯 ID
      window.sessionStorage.setItem("select_group_cid", cid);
      window.sessionStorage.setItem("group_cid", cid);
      // [儲存] 該公司的中文顯示名稱，確保回退時標題渲染正確
      window.sessionStorage.setItem("company_group_name", displayName);
      window.sessionStorage.setItem("select_group_name", displayName);

      // [動態 Navbar 重繪] 取得新公司的真實產品權限
      if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(true);

      if (typeof CsRequestGroupGetOwnedProducts === "function") {
        CsRequestGroupGetOwnedProducts(cid, function (ok, result) {
          if (ok && result) {
            try {
              const resJson = JSON.parse(result);

              if (Number(resJson.errno) >= 0) {
                let rawProds = resJson.owned_products || (resJson.records && resJson.records.owned_products);

                // [終極防護] 攤平巢狀陣列
                let prods = Array.isArray(rawProds) ? rawProds.flat(Infinity) : [];

                console.error("🚨 [DEBUG] Front-end received owned_products =", prods, "for group =", cid);

                window.sessionStorage.setItem("owned_products", JSON.stringify(prods));
                
                // 決定跳轉產品：如果新公司也擁有目前正在檢視的產品，則保持在該產品下；否則，使用新公司的預設/第一個產品
                let nextProduct = resJson.default_product || (prods.length > 0 ? prods[0] : "avacast");
                if (currentProduct && prods.includes(currentProduct)) {
                  nextProduct = currentProduct;
                }

                window.sessionStorage.setItem("default_product", nextProduct);
                change_page(`dashboard.html?product=${nextProduct}`);
                return;
              }
            } catch (e) { console.error("Parse error:", e); }
          }
          // [防呆修復] API 發生錯誤 (如 -1086) 時，強制給予保底產品，避免 Navbar 全滅
          console.warn("[Sidebar] GetOwnedProducts API failed, using fallback.");
          window.sessionStorage.setItem("owned_products", JSON.stringify(["avacast"]));
          window.sessionStorage.setItem("default_product", "avacast");
          change_page(`dashboard.html?product=avacast`);
        });
      } else {
        const productType = window.sessionStorage.getItem("product_type") || "avacast";
        change_page(`dashboard.html?product=${productType}`);
      }
    };

    li.appendChild(img);
    li.appendChild(a);
    menu.appendChild(li);
  });
}

// [新增] 輔助函數：載入並渲染學校列表 (採用成員合併方案，避開 select_one_record 的 502 崩潰)
async function loadSchoolMenu(groupCid, schoolUl) {
  try {
    const userTier = window.sessionStorage.getItem("tier");
    let memberCids = [];

    if (userTier === "3") {
      // 經銷商本人登入，只查詢自己擁有的學校
      memberCids = [window.sessionStorage.getItem("member_cid")];
    } else {
      // Admin / Sales 登入，先取得該代理商群組下的所有成員帳號
      memberCids = await new Promise((resolve) => {
        Cyberspace.Client.SendRequest(
          "/ava_system/member/select_all_records",
          {
            condition_type: 5, // 以 group_cid 查詢
            condition_value: groupCid,
            search_name: "",
            offset: 0,
            row_count: 100
          },
          (ok, result) => {
            if (!ok) return resolve([]);
            try {
              const json = JSON.parse(result);
              if (json.errno == 1 || json.errno == 0) {
                const m_cids = (json.records && json.records.member_cid) || json.member_cid;
                const list = Array.isArray(m_cids) ? m_cids : (m_cids ? [m_cids] : []);
                resolve(list);
              } else { resolve([]); }
            } catch (e) { resolve([]); }
          }
        );
      });
    }

    if (memberCids.length === 0) {
      schoolUl.innerHTML = '<li style="padding:5px; color:#888; font-size:0.85em;">無學校資料</li>';
      schoolUl.setAttribute("data-loaded", "true");
      return;
    }

    // 併發查詢這群成員擁建立的學校群組
    const groupPromises = memberCids.map((memberCid) => {
      return new Promise((resolve) => {
        Cyberspace.Client.SendRequest(
          "/ava_system/group/select_all_records",
          {
            condition_type: "2", // 以 owner_cid 查詢
            condition_value: memberCid,
            offset: 0,
            row_count: 100
          },
          (ok, result) => {
            if (!ok) return resolve({ names: [], cids: [] });
            try {
              const json = JSON.parse(result);
              if (json.errno == 1 || json.errno == 0) {
                const names = (json.records && json.records.group_name) || [];
                const cids = (json.records && json.records.group_cid) || [];
                resolve({
                  names: Array.isArray(names) ? names : (names ? [names] : []),
                  cids: Array.isArray(cids) ? cids : (cids ? [cids] : [])
                });
              } else { resolve({ names: [], cids: [] }); }
            } catch (e) { resolve({ names: [], cids: [] }); }
          }
        );
      });
    });

    const results = await Promise.all(groupPromises);

    // 合併結果，並做去重
    const mergedSchools = [];
    const seenCids = new Set();

    results.forEach((res) => {
      for (let i = 0; i < res.cids.length; i++) {
        const sCid = String(res.cids[i]).trim();
        const sName = String(res.names[i] || sCid).trim();
        if (sCid && sCid.startsWith("sch_") && !seenCids.has(sCid)) {
          seenCids.add(sCid);
          mergedSchools.push({ name: sName, cid: sCid });
        }
      }
    });

    schoolUl.innerHTML = "";

    if (mergedSchools.length === 0) {
      schoolUl.innerHTML = '<li style="padding:5px; color:#888; font-size:0.85em;">無學校資料</li>';
      schoolUl.setAttribute("data-loaded", "true");
      return;
    }

    // 渲染學校選單
    mergedSchools.forEach((school) => {
      const sLi = document.createElement("li");
      sLi.style.listStyle = "none";
      sLi.style.padding = "5px 0";

      const sA = document.createElement("a");
      sA.href = "#";
      sA.textContent = "🏫 " + school.name;
      sA.style.fontSize = "0.9em";
      sA.style.color = "#4b5563";
      sA.onclick = (e) => {
        e.preventDefault();
        console.log(`點擊了學校：${school.name} (ID: ${school.cid})`);

        window.sessionStorage.setItem("select_group_cid", school.cid);
        window.sessionStorage.setItem("group_cid", school.cid);
        // [新增] 儲存該學校所屬的代理商/公司群組 ID
        window.sessionStorage.setItem("school_parent_company_cid", groupCid);
        // [新增] 儲存該學校的顯示名稱
        window.sessionStorage.setItem("select_group_name", school.name);

        change_page("dashboard.html?product=avaclassroom");
      };
      sLi.appendChild(sA);
      schoolUl.appendChild(sLi);
    });

    schoolUl.setAttribute("data-loaded", "true");

    // [優化] 在 Classroom 模式下，若加載學校列表成功，但當前選中群組仍為公司 ID (代表沒有選中學校)，則自動選取列表中的第一所學校
    const currentProduct = new URLSearchParams(window.location.search).get("product") || window.sessionStorage.getItem("product_type") || "avacast";
    let currentGroup = window.sessionStorage.getItem("group_cid") || window.sessionStorage.getItem("select_group_cid") || "";
    if (currentProduct === "avaclassroom" && currentGroup === groupCid && mergedSchools.length > 0) {
      const firstSchool = mergedSchools[0];
      console.log(`[Sidebar] 自動為公司 ${groupCid} 選取旗下第一所學校: ${firstSchool.name} (${firstSchool.cid})`);
      window.sessionStorage.setItem("group_cid", firstSchool.cid);
      window.sessionStorage.setItem("select_group_cid", firstSchool.cid);
      
      // 觸發重載以更新頁面與圖表
      change_page("dashboard.html?product=avaclassroom");
    }

  } catch (err) {
    console.error("loadSchoolMenu error:", err);
    schoolUl.innerHTML = '<li style="padding:5px; color:red; font-size:0.85em;">系統錯誤</li>';
  }
}

function autoSelectFirstSchoolOfCompany(companyCid) {
  const userTier = window.sessionStorage.getItem("tier");
  
  const querySchools = (memberCids) => {
    if (memberCids.length === 0) return;
    
    const promises = memberCids.map((memberCid) => {
      return new Promise((resolve) => {
        if (typeof Cyberspace === "undefined" || !Cyberspace.Client) return resolve({ names: [], cids: [] });
        Cyberspace.Client.SendRequest(
          "/ava_system/group/select_all_records",
          {
            condition_type: "2", // 以 owner_cid 查詢
            condition_value: memberCid,
            offset: 0,
            row_count: 100
          },
          (ok, result) => {
            if (!ok) return resolve({ names: [], cids: [] });
            try {
              const json = JSON.parse(result);
              if (json.errno == 1 || json.errno == 0) {
                const names = (json.records && json.records.group_name) || [];
                const cids = (json.records && json.records.group_cid) || [];
                resolve({
                  names: Array.isArray(names) ? names : (names ? [names] : []),
                  cids: Array.isArray(cids) ? cids : (cids ? [cids] : [])
                });
              } else { resolve({ names: [], cids: [] }); }
            } catch (e) { resolve({ names: [], cids: [] }); }
          }
        );
      });
    });

    Promise.all(promises).then((results) => {
      let firstSchool = null;
      let firstSchoolName = "";
      for (let i = 0; i < results.length; i++) {
        const res = results[i];
        for (let j = 0; j < res.cids.length; j++) {
          const sCid = String(res.cids[j]).trim();
          if (sCid && sCid.startsWith("sch_")) {
            firstSchool = sCid;
            firstSchoolName = String(res.names[j] || sCid).trim();
            break;
          }
        }
        if (firstSchool) break;
      }

      if (firstSchool) {
        console.log(`[Sidebar] 背景自動查詢成功，為公司 ${companyCid} 選取第一所學校: ${firstSchoolName} (${firstSchool})`);
        window.sessionStorage.setItem("group_cid", firstSchool);
        window.sessionStorage.setItem("select_group_cid", firstSchool);
        // [新增] 儲存該學校所屬的代理商/公司群組 ID
        window.sessionStorage.setItem("school_parent_company_cid", companyCid);
        // [新增] 儲存該學校的顯示名稱
        window.sessionStorage.setItem("select_group_name", firstSchoolName);
        change_page("dashboard.html?product=avaclassroom");
      } else {
        console.warn(`[Sidebar] 背景自動查詢：公司 ${companyCid} 下無 any 學校`);
      }
    });
  };

  if (userTier === "3") {
    const memberCid = window.sessionStorage.getItem("member_cid");
    if (memberCid) querySchools([memberCid]);
  } else {
    if (typeof Cyberspace === "undefined" || !Cyberspace.Client) return;
    Cyberspace.Client.SendRequest(
      "/ava_system/member/select_all_records",
      {
        condition_type: 5, // 以 group_cid 查詢
        condition_value: companyCid,
        search_name: "",
        offset: 0,
        row_count: 100
      },
      (ok, result) => {
        if (!ok) return;
        try {
          const json = JSON.parse(result);
          if (json.errno == 1 || json.errno == 0) {
            const m_cids = (json.records && json.records.member_cid) || json.member_cid;
            const list = Array.isArray(m_cids) ? m_cids : (m_cids ? [m_cids] : []);
            querySchools(list);
          }
        } catch (e) {}
      }
    );
  }
}

function ListOrganization(
  span,
  country,
  isBackground = false,
  onComplete = null,
  retryCount = 0,
) {
  const dropdownItem = span.closest(".dropdown-item");
  const menu = dropdownItem.querySelector(".dropdown-menu");

  // 狀態檢查，避免重複呼叫
  if (
    menu.getAttribute("data-loading") === "true" ||
    menu.getAttribute("data-loaded") === "true"
  ) {
    if (onComplete) onComplete();
    return;
  }

  menu.setAttribute("data-loading", "true");
  menu.innerHTML =
    '<li style="padding:10px; text-align:center; color:#888; font-size:0.9em;">Loading...</li>';

  // [新增] 權限判斷：經銷商只顯示自己的公司
  const userTier = window.sessionStorage.getItem("tier");
  if (userTier === "3") {
    const myGroupCid = window.sessionStorage.getItem("group_cid") || "Unknown";

    // [修正] 經銷商模式：需驗證該公司是否屬於當前點擊的國家
    if (typeof CsRequestGroupSelectOneRecordByGroupCID === "function") {
      CsRequestGroupSelectOneRecordByGroupCID(
        myGroupCid,
        function (ok, result) {
          menu.removeAttribute("data-loading");
          if (ok) {
            try {
              const json = JSON.parse(result);
              const record = json.records;

              // 取得 DB 中的國家設定
              const myCountry = (record.country && record.country[0]) || "";

              // [DEBUG] 顯示比對資訊，確認為何不顯示
              console.log(
                `[ListOrganization] Distributor: ${myGroupCid}, DB Country: '${myCountry}', Clicked: '${country}'`,
              );

              // 比對點擊的國家 (忽略大小寫與前後空白)
              if (
                String(myCountry).trim().toLowerCase() ===
                String(country).trim().toLowerCase()
              ) {
                // [修正] 渲染前先清除 "Loading..." 訊息
                menu.innerHTML = "";
                renderSidebarMenu(menu, record);
              } else {
                menu.innerHTML =
                  '<li style="padding:10px; text-align:center; color:#888; font-size:0.9em;">無資料</li>';
              }
              menu.setAttribute("data-loaded", "true");
            } catch (e) {
              console.error("經銷商資料解析錯誤", e);
              menu.innerHTML =
                '<li style="padding:10px; text-align:center; color:red;">資料錯誤</li>';
            }
          } else {
            menu.innerHTML =
              '<li style="padding:10px; text-align:center; color:red;">載入失敗</li>';
          }
          if (onComplete) onComplete();
        },
      );
    } else {
      console.warn("Organization module not ready, retrying...");
      // [修正] 若 API 尚未就緒，稍後重試 (最多 5 次)
      if (retryCount < 5) {
        menu.removeAttribute("data-loading"); // [解鎖] 重試前必須先解除狀態鎖，否則下一次呼叫會在開頭防呆被直接 return 導致死結
        setTimeout(() => {
          ListOrganization(
            span,
            country,
            isBackground,
            onComplete,
            retryCount + 1,
          );
        }, 500);
      } else {
        menu.innerHTML =
          '<li style="padding:10px; text-align:center; color:#888; font-size:0.9em;">載入逾時</li>';
        menu.removeAttribute("data-loading");
        if (onComplete) onComplete();
      }
    }
    return;
  }

  // [新增] 快取機制：檢查 SessionStorage 是否已有資料
  const cacheKey = "sidebar_cache_" + country;
  const cachedData = window.sessionStorage.getItem(cacheKey);

  if (cachedData) {
    let json_tablesi = JSON.parse(cachedData);
    if (
      !json_tablesi ||
      !json_tablesi.group_cid ||
      json_tablesi.group_cid.length === 0
    ) {
      menu.innerHTML =
        '<li style="padding:10px; text-align:center; color:#888; font-size:0.9em;">無資料</li>';
    } else {
      menu.innerHTML = ""; // [修正] 渲染前先清除 "Loading..." 訊息
      renderSidebarMenu(menu, json_tablesi);
    }

    menu.setAttribute("data-loaded", "true");
    menu.removeAttribute("data-loading");
    if (onComplete) onComplete();
    return; // 直接返回，不發送 API
  }

  // 開啟loading dialog 關閉了
  VisibleLoaderElement(false);

  // [測試] 恢復使用後端 API 進行國家查詢 (Type 3)
  // 後端已修復權限過濾問題，現在應該能正確回傳該使用者權限下的特定國家公司
  let condition_type = 3; // _k_search_condition_type_by_country
  let condition_value = country;

  console.log(
    `[ListOrganization] 發送查詢: type=${condition_type}, value='${condition_value}'`,
  );

  CsRequestGroupSelectAllRecordsByCondition(
    condition_type,
    condition_value,
    0,
    100, // Limit
    function (ok, result) {
      // 移除 loading 狀態
      menu.removeAttribute("data-loading");

      if (ok) {
        try {
          const json = JSON.parse(result);
          console.log(`[ListOrganization] API 回傳結果:`, json);

          let json_tablesi = json.records;
          menu.innerHTML = ""; // 清除 Loading

          if (
            !json_tablesi ||
            !json_tablesi.group_cid ||
            json_tablesi.group_cid.length === 0
          ) {
            console.warn(`[ListOrganization] 國家 ${country} 查無資料`);
            menu.innerHTML =
              '<li style="padding:10px; text-align:center; color:#888; font-size:0.9em;">無資料</li>';
            // 即使無資料也紀錄快取，避免重複查詢空結果
            window.sessionStorage.setItem(
              cacheKey,
              JSON.stringify({ group_cid: [] }),
            );
          } else {
            // 成功取得資料，進行渲染
            renderSidebarMenu(menu, json_tablesi);
            // [新增] 寫入快取
            window.sessionStorage.setItem(
              cacheKey,
              JSON.stringify(json_tablesi),
            );
          }

          menu.setAttribute("data-loaded", "true");
          if (onComplete) onComplete();
        } catch (e) {
          console.error("[ListOrganization] 解析 API 回應失敗", e);
          menu.innerHTML =
            '<li style="padding:10px; text-align:center; color:red;">資料格式錯誤</li>';
        }
      } else {
        console.error("[ListOrganization] API 請求失敗", result);

        // [新增] 失敗重試機制 (Retry once)
        if (retryCount < 1) {
          console.log(
            `[ListOrganization] 載入失敗，0.5秒後重試... (Retry: ${retryCount + 1})`,
          );
          setTimeout(() => {
            ListOrganization(
              span,
              country,
              isBackground,
              onComplete,
              retryCount + 1,
            );
          }, 500);
        } else {
          menu.innerHTML = `<li style="padding:10px; text-align:center; color:red;">載入失敗</li>`;
          if (onComplete) onComplete(); // [修復佇列] API 徹底失敗時，必須通知背景佇列接力，否則背景隊列會永遠凍結
        }
      }
    },
  );
}

//___________________________________________________________
// 讀入sidebar
// 暫時找不到可以 從 html 中讀取的方式
// 先還是以 .js 的方法讀入吧
async function mountSidebar() {
  const container = document.getElementById("sidebar-nav-container");
  if (container) {
    container.innerHTML = getSidebarNavHtml();
    // [新增] 立即翻譯側邊欄，解決管理員登入後顯示 {{...}} 模板代碼的問題
    if (typeof renderTemplate === "function") {
      const lang = window.localStorage.getItem("language") || "zh-tw";
      await renderTemplate(lang, "sidebar-nav-container");
    }
  }
  initAllSidebarLogic();
}

function initAllSidebarLogic() {
  console.log("Initializing Sidebar Logic...");

  // [防呆] 如果目前產品不是 avaclassroom，但 group_cid 是學校群組，自動退回代理商公司群組
  const currentProduct = new URLSearchParams(window.location.search).get("product") || window.sessionStorage.getItem("product_type") || "avacast";
  if (currentProduct !== "avaclassroom") {
    let currentGroup = window.sessionStorage.getItem("group_cid") || window.sessionStorage.getItem("select_group_cid") || "";
    if (currentGroup && currentGroup.startsWith("sch_")) {
      // [修正] 優先使用儲存的公司 ID (school_parent_company_cid) 或登入保底 ID，防範字串解析退回為人 (member_cid)
      const parentCompanyCid = window.sessionStorage.getItem("school_parent_company_cid") || window.sessionStorage.getItem("login_group_cid");
      if (parentCompanyCid) {
        console.log(`[Sidebar] 偵測到非 avaclassroom 產品，且當前群組為學校 (${currentGroup})，自動回退至代理商公司群組 (${parentCompanyCid})`);
        window.sessionStorage.setItem("group_cid", parentCompanyCid);
        window.sessionStorage.setItem("select_group_cid", parentCompanyCid);
        // [新增] 回退至公司時，清除已選的學校顯示名稱，還原為登入時的公司名稱
        const companyName = window.sessionStorage.getItem("company_group_name");
        if (companyName) {
          window.sessionStorage.setItem("select_group_name", companyName);
        } else {
          window.sessionStorage.removeItem("select_group_name");
        }
      }
    }
  } else {
    // [優化] 在 Classroom 模式下，若當前選中群組仍為公司 ID (不以 sch_ 開頭)，則主動異步查詢並選取該公司旗下第一所學校
    let currentGroup = window.sessionStorage.getItem("group_cid") || window.sessionStorage.getItem("select_group_cid") || "";
    if (currentGroup && !currentGroup.startsWith("sch_")) {
      autoSelectFirstSchoolOfCompany(currentGroup);
    }
  }

  const userTier = window.sessionStorage.getItem("tier");

  // [記憶體優化] 統一管理 Sidebar 事件
  if (window._sidebarEventController) window._sidebarEventController.abort();
  window._sidebarEventController = new AbortController();
  const signal = window._sidebarEventController.signal;

  // [優化] 統一委派 Click 事件
  document.addEventListener(
    "click",
    function (e) {
      // 1. 攔截：側邊欄 Toggle 收合按鈕
      const toggleBtn = e.target.closest("#toggleSidebar");
      if (toggleBtn) {
        e.stopPropagation();
        const sidebar = document.getElementById("sidebar");
        const toggleIcon = document.getElementById("toggleIcon");
        if (sidebar) sidebar.classList.toggle("expanded");
        if (toggleIcon) {
          toggleIcon.style.transform = sidebar.classList.contains("expanded")
            ? "rotate(180deg)"
            : "rotate(0deg)";
        }
        return;
      }

      // 2. 攔截：新增組織按鈕
      const addCompanyBtn = e.target.closest("#add-company-btn");
      if (addCompanyBtn) {
        e.preventDefault();
        if (typeof showOrganizationAddModal === "function")
          showOrganizationAddModal();
        return;
      }

      // 3. 攔截：國家下拉選單
      const toggle = e.target.closest(".dropdown-toggle");
      if (toggle) {
        e.preventDefault();
        const dropdownItem = toggle.closest(".dropdown-item");
        // [重構] 取得不受翻譯影響的英文國家 ID
        const countryId = dropdownItem ? dropdownItem.getAttribute("data-country") : "";
        const countrySpan = toggle.querySelector(".country-name");
        const dropdownMenu = toggle.nextElementSibling;
        const isOpen = dropdownMenu?.classList.contains("show");

        document.querySelectorAll(".dropdown-menu.show").forEach((menu) => {
          if (menu !== dropdownMenu) menu.classList.remove("show");
        });
        
        // [優化] 展開選單時記錄狀態，收合時清除，並立刻觸發載入
        if (dropdownMenu) {
          if (!isOpen) {
            dropdownMenu.classList.add("show");
            window.sessionStorage.setItem("sidebar_expanded_country", countryId);
            if (!dropdownMenu.getAttribute("data-loaded") && countryId) {
              ListOrganization(countrySpan, countryId);
            }
          } else {
            dropdownMenu.classList.remove("show");
            window.sessionStorage.removeItem("sidebar_expanded_country");
          }
        }
        return;
      }
    },
    { signal },
  );

  // [優化] 統一委派 Input (搜尋) 事件
  document.addEventListener(
    "input",
    function (e) {
      if (e.target.id === "sidebar-search-input") {
        const query = e.target.value.toLowerCase().trim();
        document.querySelectorAll(".li-list-item").forEach((item) => {
          const text = item.querySelector("a").textContent.toLowerCase();
          const parentMenu = item.closest(".dropdown-menu");
          if (text.includes(query)) {
            item.style.display = "flex";
            if (query !== "" && parentMenu) parentMenu.classList.add("show");
          } else {
            item.style.display = "none";
          }
        });
        if (query === "") {
          document
            .querySelectorAll(".dropdown-menu.show")
            .forEach((menu) => menu.classList.remove("show"));
        }
      }
    },
    { signal },
  );

  // [優化] 統一委派 MouseOver/Out (Hover) 事件給新增按鈕
  document.addEventListener(
    "mouseover",
    function (e) {
      const btn = e.target.closest("#add-company-btn");
      if (btn) {
        btn.style.backgroundColor = "#ee963f";
        const icon = btn.querySelector("#add-company-icon");
        if (icon) icon.src = "assets/images/information_button_orange.png";
      }
    },
    { signal },
  );

  document.addEventListener(
    "mouseout",
    function (e) {
      const btn = e.target.closest("#add-company-btn");
      if (btn) {
        btn.style.backgroundColor = "";
        const icon = btn.querySelector("#add-company-icon");
        if (icon) icon.src = "assets/images/Group 606.svg";
      }
    },
    { signal },
  );

  // [優化] 狀態持久化：還原上次展開的國家選單並秒渲染快取 (管理員適用)
  if (userTier !== "3") {
    const expandedCountry = window.sessionStorage.getItem("sidebar_expanded_country");
    if (expandedCountry) {
      const item = document.querySelector(`.dropdown-item[data-country="${expandedCountry}"]`);
      if (item) {
        const span = item.querySelector(".country-name");
        const dropdownMenu = item.querySelector(".dropdown-menu");
        if (dropdownMenu && !dropdownMenu.classList.contains("show")) {
          dropdownMenu.classList.add("show");
          // 主動觸發查詢，因為內部已實作快取，若命中將 0 毫秒瞬間渲染完成
          ListOrganization(span, expandedCountry); 
        }
      }
    }
  }

  // [優化] 自動載入所有國家的公司資料 (解決 Mustache 重繪導致的 Detached DOM 競爭問題)

  setTimeout(function () {
    // [效能優化] 經銷商 (Tier 3) 只有單一國家，會在下方獨立載入，不需啟動背景全區隊列
    if (userTier === "3") return;

    const countries = Array.from(
      document.querySelectorAll(".dropdown-item"),
    )
      .map((item) => item.getAttribute("data-country"))
      .filter((name) => name);

    // [安全修復] 將並發數限制為 1，強制排隊載入，防範後端舊 SDK 展開函數並發 Race 導致 Nginx 502
    const maxConcurrent = 1;
    const queue = [...countries];
    let activeCount = 0;

    function processNext() {
      while (activeCount < maxConcurrent && queue.length > 0) {
        const countryId = queue.shift();

        // 每次動態抓取當前 DOM 中的元素，確保獲取的是最新的節點
        const items = Array.from(document.querySelectorAll(".dropdown-item"));
        const liveItem = items.find((item) => item.getAttribute("data-country") === countryId);
        if (!liveItem) continue;

        const liveSpan = liveItem.querySelector(".country-name");
        const toggle = liveItem.querySelector(".dropdown-toggle");
        const dropdownMenu = toggle ? toggle.nextElementSibling : null;

        if (
          dropdownMenu &&
          dropdownMenu.getAttribute("data-loaded") !== "true"
        ) {
          activeCount++;
          ListOrganization(liveSpan, countryId, true, () => {
            activeCount--;
            setTimeout(processNext, 200);
          });
        } else {
          // 已經載入過，直接處理下一個
          processNext();
        }
      }
    }

    processNext();
  }, 2000); // 頁面載入後 2 秒開始背景載入

  // 摺疊按鈕功能 - 已停用
  // const toggleSidebar = document.getElementById("toggleSidebar");
  // const sidebar = document.getElementById("sidebar");

  // if (toggleSidebar && sidebar) {
  //   toggleSidebar.addEventListener("click", function () {
  //     sidebar.classList.toggle("collapsed");
  //   });
  // }

  // 新增公司按鈕功能
  const addCompanyBtn = document.getElementById("add-company-btn");
  const addCompanyIcon = document.getElementById("add-company-icon");

  if (addCompanyBtn) {
    if (userTier === "3") {
      // [資安與權限加固] 經銷商無權新增組織，強制隱藏按鈕
      addCompanyBtn.style.display = "none";
    } else {
      addCompanyBtn.addEventListener("click", function (e) {
        e.preventDefault();
        console.log("點擊新增公司按鈕，顯示 modal");
        if (typeof showOrganizationAddModal === "function") {
          showOrganizationAddModal();
        } else {
          console.error("showOrganizationAddModal 函數尚未載入");
        }
      });

      // Hover 效果：改變背景色 and 圖示
      if (addCompanyIcon) {
        addCompanyBtn.addEventListener("mouseenter", function () {
          addCompanyBtn.style.backgroundColor = "#ee963f";
          addCompanyIcon.src = "assets/images/information_button_orange.png";
        });

        addCompanyBtn.addEventListener("mouseleave", function () {
          addCompanyBtn.style.backgroundColor = "";
          addCompanyIcon.src = "assets/images/Group 606.svg";
        });
      }
    }
  }

  // [資安與穩定性優化] 避免非同步呼叫 document.write 導致頁面被清空
  const safeLoadScript = (src) => {
    if (!document.querySelector(`script[src="${src}"]`)) {
      const script = document.createElement("script");
      script.src = src;
      script.type = "text/javascript";
      document.head.appendChild(script);
    }
  };
  safeLoadScript("modules/app.module.organization.js");
  safeLoadScript("components/app.component.frame.organization-add.js");

  // 暫時先用國家簡碼轉換
  {
    //i18nIsoCountries.registerLocale(window["en"]);
  }
}

// -----------------------------------------------------------
// 依賴狀態管理：確保核心函式庫與 DOM 皆載入後再初始化
// -----------------------------------------------------------
function startSidebarComponent() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountSidebar);
  } else {
    mountSidebar();
  }
}

if (window._CoreLoaded) {
  startSidebarComponent();
} else {
  window.addEventListener("CoreDependenciesReady", startSidebarComponent);
}
