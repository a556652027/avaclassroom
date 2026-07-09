/**
 * License/Distributor List Common Logic
 * 提取 app.view.license.js 與 app.view.distributor.list.js 的共用邏輯
 */

var LicenseSortState = {
  field: "",
  order: "asc",
};

var LicenseCommon = {
  // 計算季度開始日期
  getQuarterStartDate: function (date) {
    const currentDate = new Date(date);
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const quarterStartMonth = Math.floor(month / 3) * 3;
    return new Date(year, quarterStartMonth, 1);
  },

  // 對 records 物件進行切片 (分頁用)
  sliceTablesi: function (tablesi, offset, limit) {
    const sliced_tablesi = {};
    const keys = Object.keys(tablesi);
    if (keys.length === 0) return {};
    const total = tablesi[keys[0]] ? tablesi[keys[0]].length : 0;
    const end = Math.min(offset + limit, total);

    keys.forEach((key) => {
      if (Array.isArray(tablesi[key])) {
        sliced_tablesi[key] = tablesi[key].slice(offset, end);
      }
    });
    return sliced_tablesi;
  },

  // 前端日期過濾
  filterRecordsByDateRange: function (
    allRecords,
    target_b_date,
    target_e_date,
  ) {
    if (!allRecords || !allRecords["license_begin_time"]) {
      return {};
    }

    const validIndices = [];
    const startDates = allRecords["license_begin_time"];
    const daysList = allRecords["license_days"];

    for (let i = 0; i < startDates.length; i++) {
      const s_str = startDates[i];
      if (s_str) {
        const orderStartDate = s_str.substring(0, 10);
        let orderEndDate = orderStartDate;
        if (daysList && daysList[i]) {
          const days = parseInt(daysList[i]);
          if (!isNaN(days) && days > 0) {
            const startDateObj = new Date(s_str.replace(/-/g, "/"));
            startDateObj.setDate(startDateObj.getDate() + days);
            orderEndDate = startDateObj.toISOString().substring(0, 10);
          }
        }
        if (orderStartDate <= target_e_date && orderEndDate >= target_b_date) {
          validIndices.push(i);
        }
      }
    }

    const filtered_tablesi = {};
    const keys = Object.keys(allRecords);
    keys.forEach((key) => {
      filtered_tablesi[key] = [];
      const originalArray = allRecords[key];
      if (Array.isArray(originalArray)) {
        validIndices.forEach((idx) => {
          filtered_tablesi[key].push(originalArray[idx]);
        });
      }
    });
    return filtered_tablesi;
  },

  // 生成 Excel
  generateOrderListExcel: function (ordersList) {
    console.log(
      "[generateOrderListExcel] 開始生成 Excel，共",
      ordersList.length,
      "筆資料",
    );

    if (ordersList.length === 0) return;

    const header = [
      "訂單編號",
      "建立時間",
      "授權開始時間",
      "授權天數",
      "授權數量",
      "授權金鑰",
      "備註",
    ];

    const dataRows = ordersList.map((orderData) => {
      const getValue = (key) => (orderData[key] ? orderData[key][0] : "");
      return [
        getValue("license_cid"),
        getValue("create_time"),
        getValue("license_begin_time"),
        getValue("license_days"),
        getValue("license_count"),
        getValue("license_key"),
        getValue("note00"),
      ];
    });

    const excelData = [header, ...dataRows];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    const wscols = [
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
      { wch: 25 },
      { wch: 30 },
    ];
    ws["!cols"] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "訂單列表");

    const date = new Date();
    const dateStr = date.toISOString().split("T")[0];
    const fileName = `訂單列表_${dateStr}.xlsx`;

    XLSX.writeFile(wb, fileName);
    console.log("[generateOrderListExcel] Excel 檔案已生成:", fileName);
  },

  // 排序相關
  sortLicenseTable: function (field, tableId) {
    if (LicenseSortState.field === field) {
      LicenseSortState.order =
        LicenseSortState.order === "asc" ? "desc" : "asc";
    } else {
      LicenseSortState.field = field;
      LicenseSortState.order = "asc";
    }
    this.updateSortIcons(field, LicenseSortState.order);
    this.sortTableData(field, LicenseSortState.order, tableId);
  },

  updateSortIcons: function (activeField, order) {
    const sortIcons = [
      "create_time",
      "license_begin_time",
      "license_end_time",
      "license_count",
    ];
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
  },

  sortTableData: function (field, order, tableId) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    if (!tableBody) return;

    const rows = Array.from(tableBody.querySelectorAll("tr"));

    rows.sort((a, b) => {
      let aValue = this.getCellValue(a, field);
      let bValue = this.getCellValue(b, field);

      if (field.includes("time")) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (field === "license_count") {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      }

      if (aValue < bValue) return order === "asc" ? -1 : 1;
      if (aValue > bValue) return order === "asc" ? 1 : -1;
      return 0;
    });

    rows.forEach((row) => tableBody.appendChild(row));
  },

  getCellValue: function (row, field) {
    // 統一欄位索引：create_time(1), begin(2), end(4), count(6)
    const fieldMap = {
      create_time: 1,
      license_begin_time: 2,
      license_end_time: 4,
      license_count: 6,
    };

    const cellIndex = fieldMap[field];
    if (cellIndex === undefined) return "";

    const cell = row.cells[cellIndex];
    return cell ? cell.textContent.trim() : "";
  },

  // 計算並顯示 YoY (Year Over Year)
  calculateAndDisplayYoY: function (allRecords) {
    const today = new Date();
    const lastYearSameDate = new Date();
    lastYearSameDate.setFullYear(today.getFullYear() - 1);

    let cumulative_total_today = 0;
    let active_total_today = 0;
    let active_total_last_year = 0;

    if (allRecords.license_count) {
      for (let i = 0; i < allRecords.license_count.length; i++) {
        if (allRecords.record_state[i] == "1") {
          const licenseCount = parseInt(allRecords.license_count[i]) || 0;
          cumulative_total_today += licenseCount;

          const beginTime = new Date(allRecords.license_begin_time[i]);
          const licenseDays = parseInt(allRecords.license_days[i]) || 0;
          let endTime = new Date(beginTime);
          endTime.setDate(endTime.getDate() + licenseDays);

          if (beginTime <= today && endTime >= today) {
            active_total_today += licenseCount;
          }
          if (beginTime <= lastYearSameDate && endTime >= lastYearSameDate) {
            active_total_last_year += licenseCount;
          }
        }
      }
    }

    // Update DOM
    const totalCountEl = document.getElementById("license-total-count");
    if (totalCountEl)
      totalCountEl.innerText = cumulative_total_today.toLocaleString();

    const growthContainer = document.getElementById(
      "license-total-growth-rate",
    );
    const growthPercentageElement = document.getElementById(
      "license-total-growth-percentage",
    );
    const growthIconElement = document.getElementById(
      "license-total-growth-icon",
    );

    if (active_total_last_year === 0) {
      if (growthContainer) growthContainer.style.display = "none";
    } else {
      const growthRate =
        ((active_total_today - active_total_last_year) /
          active_total_last_year) *
        100;
      const growthRateFormatted = Math.abs(growthRate).toFixed(1);

      if (growthPercentageElement) {
        growthPercentageElement.textContent = `${growthRate >= 0 ? "+" : "-"}${growthRateFormatted}%`;
        growthPercentageElement.style.color = "#1c1c1c";
      }
      if (growthIconElement) {
        growthIconElement.src =
          growthRate >= 0 ? "assets/images/up.svg" : "assets/images/down.svg";
      }
      if (growthContainer) {
        growthContainer.style.display = "flex";
      }
    }
  },

  // 計算並顯示 QoQ (Quarter Over Quarter)
  calculateAndDisplayQoQ: function (allRecords) {
    const currentDate = new Date();
    const currentQuarterStart = this.getQuarterStartDate(currentDate);
    const lastQuarterEnd = new Date(currentQuarterStart);
    lastQuarterEnd.setDate(lastQuarterEnd.getDate() - 1);
    const lastQuarterStart = this.getQuarterStartDate(lastQuarterEnd);

    let quarterlyLicenseCount = 0;
    let lastQuarterCount = 0;

    if (allRecords.license_count && allRecords.create_time) {
      for (let i = 0; i < allRecords.license_count.length; i++) {
        if (allRecords.record_state[i] == "1") {
          const createTime = new Date(allRecords.create_time[i]);
          const count = parseInt(allRecords.license_count[i]) || 0;

          if (createTime >= currentQuarterStart && createTime <= currentDate) {
            quarterlyLicenseCount += count;
          }
          if (createTime >= lastQuarterStart && createTime <= lastQuarterEnd) {
            lastQuarterCount += count;
          }
        }
      }
    }

    // Update DOM
    const quarterlyCountEl = document.getElementById("license-quarterly-count");
    if (quarterlyCountEl)
      quarterlyCountEl.innerText = quarterlyLicenseCount.toLocaleString();

    const quarterlyGrowthPercentageEl = document.getElementById(
      "license-quarterly-growth-percentage",
    );
    const quarterlyGrowthIconEl = document.getElementById(
      "license-quarterly-growth-icon",
    );

    if (quarterlyGrowthPercentageEl && quarterlyGrowthIconEl) {
      if (lastQuarterCount === 0) {
        quarterlyGrowthPercentageEl.textContent =
          quarterlyLicenseCount > 0 ? "+∞%" : "0%";
        quarterlyGrowthIconEl.src = "assets/images/up.svg";
      } else {
        const growthRate =
          ((quarterlyLicenseCount - lastQuarterCount) / lastQuarterCount) * 100;
        const growthRateFormatted = Math.abs(growthRate).toFixed(1);
        quarterlyGrowthPercentageEl.textContent = `${growthRate >= 0 ? "+" : "-"}${growthRateFormatted}%`;
        quarterlyGrowthIconEl.src =
          growthRate >= 0 ? "assets/images/up.svg" : "assets/images/down.svg";
      }
    }
    return quarterlyLicenseCount;
  },

  // 篩選授權狀態
  filterLicenseByStatus: function (
    status,
    tableId,
    totalCountId,
    statusTextId,
    callback,
  ) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    const rows = tbody.querySelectorAll("tr");
    let filteredLicenseCount = 0;

    rows.forEach((row) => {
      // 授權數量在索引 6 (create_time, begin, days, end, status, count, note, dashboard)
      if (status === "all") {
        row.style.display = "";
        const licenseCountCell = row.cells[6];
        if (licenseCountCell) {
          const count = parseInt(licenseCountCell.textContent) || 0;
          filteredLicenseCount += count;
        }
        return;
      }

      const statusCell = row.cells[5];
      if (!statusCell) {
        row.style.display = "";
        return;
      }

      const statusText = statusCell.textContent.trim();
      const isExpired =
        statusText.includes("已到期") ||
        statusCell.innerHTML.includes("color:red");

      if (status === "expired" && isExpired) {
        row.style.display = "";
        const licenseCountCell = row.cells[6];
        if (licenseCountCell) {
          const count = parseInt(licenseCountCell.textContent) || 0;
          filteredLicenseCount += count;
        }
      } else if (status === "active" && !isExpired) {
        row.style.display = "";
        const licenseCountCell = row.cells[6];
        if (licenseCountCell) {
          const count = parseInt(licenseCountCell.textContent) || 0;
          filteredLicenseCount += count;
        }
      } else {
        row.style.display = "none";
      }
    });

    // Update Total Count
    const totalCountElement = document.getElementById(totalCountId);
    if (totalCountElement) {
      totalCountElement.innerText = filteredLicenseCount.toLocaleString();
    }

    // Update Status Text
    const statusTextElement = document.getElementById(statusTextId);
    if (statusTextElement) {
      switch (status) {
        case "all":
          statusTextElement.textContent = "全部訂單";
          break;
        case "active":
          statusTextElement.textContent = "未到期";
          break;
        case "expired":
          statusTextElement.textContent = "已到期";
          break;
      }
    }

    if (callback) callback();
  },

  // 初始化按鈕 Hover 效果 (圖示切換)
  initButtonHoverEffects: function () {
    const buttons = [
      {
        id: "license_list-button-gotopage_insert",
        iconId: "license_insert_button_icon",
        hoverSrc: "assets/images/information_button_orange.png",
        normalSrc: "assets/images/Group 607.svg",
      },
      {
        id: "license-edit-button",
        iconId: "license-edit-icon",
        hoverSrc: "assets/images/edit_button_change.png",
        normalSrc: "assets/images/edit.svg",
      },
      {
        id: "license-download-button",
        iconId: "license-download-icon",
        hoverSrc: "assets/images/dowload_button_change.png",
        normalSrc: "assets/images/download.svg",
      },
    ];

    // [Phase 1 優化] 使用 AbortController 取代 cloneNode
    if (window._hoverEventController) window._hoverEventController.abort();
    window._hoverEventController = new AbortController();
    const signal = window._hoverEventController.signal;

    buttons.forEach((btnConfig) => {
      const btn = document.getElementById(btnConfig.id);
      // 嘗試透過 ID 找 icon，若找不到則找按鈕內的 img 標籤 (相容 distributor_list.html 的結構)
      const icon =
        document.getElementById(btnConfig.iconId) ||
        (btn ? btn.querySelector("img") : null);

      if (btn && icon) {
        btn.addEventListener(
          "mouseenter",
          function () {
            icon.src = btnConfig.hoverSrc;
          },
          { signal },
        );

        btn.addEventListener(
          "mouseleave",
          function () {
            icon.src = btnConfig.normalSrc;
          },
          { signal },
        );
      }
    });
  },
};
