// distributor.dashboard.html 的頁面事件操控程式碼相關
console.log("app.view.distributor.dashboard.js Loaded");

// i18n ***必定放在載入頁面完成後的最前面 避免導致後面的addEventListener失效
(function () {
  if (typeof renderTemplate === "function") {
    const lang = window.localStorage.getItem("language") || "zh-tw";
    renderTemplate(lang, "app");
  }
})();

/*___________________________________________________________________________________*/
// 列表上面顯示的欄位對照表 與 順序
let key_dashboard_device_list_info = [
  "spec04",
  "record_state",
  "active_time",
  "device_count",
];

//_____________________________________________________________________________________
// function 相關
function GotoPageSelectDeviceSpec() {
  SelectDeviceSpec003();
  change_page("page01");
}

// 算出 啟動/撤銷 數量
function GetStateCount(data, state) {
  let di = 0;
  let total_count = 0;
  for (let value of data["record_state"]) {
    if (value == state) {
      total_count += Number(data["device_count"][di]);
    }
    di++;
  }
  return total_count;
}

// 顯示沒有資料的訊息
function showNoDataMessage() {
  // 清空所有數據顯示
  document.getElementById("dashboard_device_001-activated_count").textContent =
    "0";
  document.getElementById("dashboard_device_001-revoked_count").textContent =
    "0";
  document.getElementById("dashboard_device_001-activation_rate").textContent =
    "0%";
  document.getElementById(
    "dashboard_device_001-predicted_achievement_rate",
  ).textContent = "0%";
  document.getElementById(
    "dashboard_device_001-predicted_achievement_count",
  ).textContent = "0";

  // 清空圖表
  if (_g_pie_chart) {
    _g_pie_chart.destroy();
    _g_pie_chart = null;
  }
  if (_g_multi_line_chart) {
    _g_multi_line_chart.destroy();
    _g_multi_line_chart = null;
  }
  if (_g_bar_chart) {
    _g_bar_chart.destroy();
    _g_bar_chart = null;
  }

  // 在圖表區域顯示「目前沒有資料」
  const pieCanvas = document.getElementById("dashboard_device_001-pie_chart");
  const lineCanvas = document.getElementById("dashboard_device_001-line_chart");
  const barCanvas = document.getElementById(
    "dashboard_device_001-new_line_chart",
  );

  // 清空 canvas 並顯示提示文字
  [pieCanvas, lineCanvas, barCanvas].forEach((canvas) => {
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "16px Arial";
      ctx.fillStyle = "#666";
      ctx.textAlign = "center";
      ctx.fillText(
        window.localeData.dashboard.no_data,
        canvas.width / 2,
        canvas.height / 2,
      );
    }
  });
  console.log("選定的授權時間範圍沒有設備資料");
}

// 畫出設備條件0003雷達圖
let _g_pie_chart = null;
let _g_new_line_chart = null;
function RenderDevice003PieChart(canvas, data) {
  // 先整理資料
  let labels = [];
  let datasets_data = [];
  let datasets_background_color = [];
  let datasets_border_color = [];

  {
    let device_model_count = new Map();
    {
      let di = 0;
      for (let value of data["record_state"]) {
        //這邊用來判斷 record_state 是否為 0 或是 1 的判斷
        if (value != "0") {
          let spec_model = data["spec04"][di];
          let device_count = Number(data["device_count"][di]);

          // 將空字串或空值顯示為 "Other"
          if (!spec_model || spec_model.trim() === "") {
            spec_model = "Other";
          }

          if (device_model_count.has(spec_model)) {
            device_model_count.set(
              spec_model,
              Number(device_model_count.get(spec_model)) + device_count,
            );
          } else {
            device_model_count.set(spec_model, device_count);
          }
        }
        di++;
      }
    }

    // 預定義圓餅圖顏色 - 基於三個主色的漸層配色
    const pieColors = [
      "rgba(146, 191, 255, 1)", // 主色1 - 最淺藍
      "rgba(151, 170, 194, 1)", // 主色2 - 中間灰藍
      "rgba(33, 79, 124, 1)", // 主色3 - 最深藍
      "rgba(139, 181, 235, 1)", // 主色1與2之間
      "rgba(149, 180, 224, 1)", // 漸層色
      "rgba(92, 125, 159, 1)", // 主色2與3之間
      "rgba(142, 185, 245, 1)", // 接近主色1的變化
      "rgba(156, 175, 204, 1)", // 接近主色2的變化
      "rgba(43, 89, 134, 1)", // 接近主色3的變化
      "rgba(135, 176, 225, 1)", // 淺色變化
      "rgba(67, 104, 149, 1)", // 深色變化
      "rgba(148, 188, 235, 1)", // 額外漸層色
    ];

    let colorIndex = 0;
    for (let [key, value] of device_model_count) {
      labels.push(key);
      datasets_data.push(value);
      datasets_background_color.push(pieColors[colorIndex % pieColors.length]);
      datasets_border_color.push("#ffffff");
      colorIndex++;
    }
  }

  // 套用
  // 確保正確註冊 ChartDataLabels
  Chart.register(ChartDataLabels);

  const ctx = canvas.getContext("2d");

  if (_g_pie_chart != null) {
    _g_pie_chart.destroy();
  }

  _g_pie_chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          label: window.localeData.dashboard.device_spec_distribution,
          data: datasets_data,
          backgroundColor: datasets_background_color,
          borderColor: datasets_border_color,
          borderWidth: 4,
          spacing: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "right", // 這裡指定圖例在右側
          align: "left", // 水平居中
          labels: {
            boxWidth: 20, // 標籤色塊大小
            padding: 15, // 文字間距
            generateLabels: function (chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                const dataset = data.datasets[0];
                const total = dataset.data.reduce(
                  (acc, val) => acc + Number(val),
                  0,
                );

                return data.labels.map((label, index) => {
                  const value = dataset.data[index];
                  const percentage = ((value / total) * 100).toFixed(1);

                  return {
                    text: `${label} (${percentage}%)`,
                    fillStyle: dataset.backgroundColor[index],
                    strokeStyle: dataset.borderColor[index],
                    lineWidth: dataset.borderWidth,
                    hidden:
                      isNaN(dataset.data[index]) ||
                      chart.getDatasetMeta(0).data[index].hidden,
                    index: index,
                  };
                });
              }
              return [];
            },
          },
        },
        title: {
          display: true,
          text: window.localeData.dashboard.chart_platform_ratio,
          padding: {
            top: 0, // 標題與圖表之間的間距
            bottom: 20, // 如果需要下方間距
          },
          font: {
            size: 18, // 字體大小
          },
        },
        datalabels: {
          display: false, // 關閉圓餅圖內的數字標籤
        },
      },
    },
  });
}

// 畫出設備條件0003長條圖
let _g_bar_chart = null;
function RenderDevice003BarChart(canvas, data) {
  // 過濾並整理資料
  const filteredData = data.active_time
    .map((time, index) => ({
      time,
      count: Number(data.device_count[index]),
      spec: data.spec04[index],
      state: data.record_state[index],
    }))
    .filter((item) => item.state === "1");

  // 取得所有月份並補全缺失月份
  const allMonths = [...new Set(filteredData.map((d) => d.time))].sort();

  // 建立總和的月份數據
  const totalData = {};
  allMonths.forEach((month) => {
    totalData[month] = 0;
  });

  // 計算每個月份所有規格的總和
  filteredData.forEach(({ time, count }) => {
    totalData[time] = (totalData[time] || 0) + count;
  });

  // 取得每個月的數據（不累積）
  const monthlyData = allMonths.map((month) => totalData[month] || 0);

  // 建立 Chart.js 資料格式 - 只有一條總和的長條
  const datasets = [
    {
      label: window.localeData.dashboard.chart_monthly_activation,
      data: monthlyData,
      backgroundColor: "rgba(151, 170, 194, 1)",
      borderWidth: 0,
      borderRadius: 8,
      borderSkipped: false,
    },
  ];

  // 建立長條圖
  const maxYValue = Math.ceil(Math.max(...monthlyData) * 1.1);
  const ctx = canvas.getContext("2d");

  if (_g_bar_chart != null) {
    _g_bar_chart.destroy();
  }

  _g_bar_chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: allMonths,
      datasets: datasets,
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: maxYValue,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: window.localeData.dashboard.chart_total_activation,
          font: {
            size: 16,
          },
          align: "start",
          position: "top",
          padding: {
            bottom: 20,
          },
        },
        datalabels: {
          display: false, // 移除長條圖內的數字
        },
      },
      barPercentage: 0.4, // 長條寬度比例 - 更細
      categoryPercentage: 0.6, // 類別寬度比例 (預設 0.8)
    },
  });
}

// 畫出設備條件0003折線圖
let _g_line_chart_data;
let _g_line_chart_image_base64;
let _g_multi_line_chart = null;
function RenderDevice003LineChart(canvas, data) {
  // 過濾並整理資料
  const filteredData = data.active_time
    .map((time, index) => ({
      time,
      count: Number(data.device_count[index]),
      spec: data.spec04[index],
      state: data.record_state[index],
    }))
    .filter((item) => item.state === "1");

  // 取得所有月份並補全缺失月份
  const allMonths = [...new Set(filteredData.map((d) => d.time))].sort();

  // 分組 spec04 並建立每個 spec04 對應的月份數據
  const groupedData = {};
  filteredData.forEach(({ time, count, spec }) => {
    if (!groupedData[spec]) groupedData[spec] = {};
    groupedData[spec][time] = (groupedData[spec][time] || 0) + count;
  });

  // 為每個 spec04 補全月份，並進行累積計算
  Object.keys(groupedData).forEach((spec) => {
    let cumulative = 0;
    allMonths.forEach((month) => {
      // 若該月份不存在，設為 0
      if (!groupedData[spec][month]) {
        groupedData[spec][month] = 0;
      }
      // 將當月數量累加至累積變數
      cumulative += groupedData[spec][month];
      // 將累積數量儲存回去
      groupedData[spec][month] = cumulative;
    });
  });

  // 建立 Chart.js 資料格式 - 基於指定配色的多色系
  const lineColors = [
    { line: "rgba(151, 170, 194, 1)", fill: "rgba(151, 170, 194, 0.1)" }, // 主色1 - 灰藍色
    { line: "rgba(146, 191, 255, 1)", fill: "rgba(146, 191, 255, 0.1)" }, // 主色2 - 淺藍色
    { line: "rgba(238, 150, 63, 1)", fill: "rgba(238, 150, 63, 0.1)" }, // 主色3 - 橘色
    { line: "rgba(151, 170, 194, 1)", fill: "rgba(151, 170, 194, 0.1)" }, // 主色4 - 重複灰藍
    { line: "rgba(165, 185, 210, 1)", fill: "rgba(165, 185, 210, 0.1)" }, // 變化1 - 淺灰藍
    { line: "rgba(160, 206, 255, 1)", fill: "rgba(160, 206, 255, 0.1)" }, // 變化2 - 更淺藍
    { line: "rgba(245, 171, 93, 1)", fill: "rgba(245, 171, 93, 0.1)" }, // 變化3 - 淺橘色
    { line: "rgba(137, 155, 179, 1)", fill: "rgba(137, 155, 179, 0.1)" }, // 變化4 - 深灰藍
    { line: "rgba(132, 176, 235, 1)", fill: "rgba(132, 176, 235, 0.1)" }, // 變化5 - 中藍色
    { line: "rgba(225, 130, 45, 1)", fill: "rgba(225, 130, 45, 0.1)" }, // 變化6 - 深橘色
    { line: "rgba(179, 195, 220, 1)", fill: "rgba(179, 195, 220, 0.1)" }, // 變化7 - 很淺灰藍
    { line: "rgba(251, 185, 115, 1)", fill: "rgba(251, 185, 115, 0.1)" }, // 變化8 - 很淺橘
  ];

  const datasets = Object.keys(groupedData).map((spec, index) => ({
    label: spec,
    data: allMonths.map((month) => groupedData[spec][month]),
    borderColor: lineColors[index % lineColors.length].line,
    backgroundColor: lineColors[index % lineColors.length].fill,
    borderWidth: 2,
    fill: true,
    tension: 0.4,
    pointBorderWidth: 0,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: lineColors[index % lineColors.length].line,
  }));

  // 建立折線圖
  const maxYValue = Math.ceil(
    Math.max(...datasets.flatMap((ds) => ds.data)) * 1.5,
  );
  const ctx = canvas.getContext("2d");

  // 根據 canvas ID 決定使用哪個圖表變數
  const isNewChart = canvas.id === "dashboard_device_001-new_line_chart";
  let chartVariable = isNewChart ? _g_new_line_chart : _g_multi_line_chart;

  if (chartVariable != null) {
    chartVariable.destroy();
  }

  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: allMonths,
      datasets: datasets,
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: maxYValue,
        },
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 6,
            boxHeight: 6,
            padding: 6,
            textAlign: "right",
          },
        },
        title: {
          display: true,
          text: window.localeData.dashboard.chart_cumulative_activation,
          font: {
            size: 16,
          },
          align: "center",
          position: "top",
          padding: {
            bottom: 20,
          },
        },
        datalabels: {
          display: false, // 關閉數據點上的文字標籤
        },
      },
    },
  });

  // 將圖表指派給正確的變數
  if (isNewChart) {
    _g_new_line_chart = chart;
  } else {
    _g_multi_line_chart = chart;
    _g_line_chart_data = {
      labels: allMonths,
      datasets: datasets,
    };
    _g_line_chart_image_base64 = chart.toBase64Image(); // PNG base64 string
  }
}

let _g_dashboard_request_controller = null;

async function SelectDeviceSpec003(retryCount = 0, callback = null) {
  let search_group_cid =
    window.sessionStorage.getItem("group_cid") ||
    window.sessionStorage.getItem("select_group_cid");

  const safeExecuteCallback = () => {
    if (typeof callback === "function") {
      const cb = callback;
      callback = null;
      cb();
    }
  };

  if (!search_group_cid) {
    console.warn("尚未取得 group_cid，暫停 SelectDeviceSpec003 請求");
    safeExecuteCallback();
    return;
  }

  let search_product_type = window.sessionStorage.getItem("product_type");
  let search_spec =
    document.getElementById("dashboard_device_001-space_num")?.value || "%%";
  const b_time = document.getElementById("dashboard_device_001-begin_time");
  const e_time = document.getElementById("dashboard_device_001-end_time");

  if (b_time && e_time) {
    if (b_time.value > e_time.value) {
      alert("開始日期不能晚於結束日期");
      safeExecuteCallback();
      return;
    }
    sessionStorage.setItem("dashboard_begin_time", b_time.value);
    sessionStorage.setItem("dashboard_end_time", e_time.value);
  }

  // Cancel previous request
  if (_g_dashboard_request_controller) {
    _g_dashboard_request_controller.abort();
  }
  _g_dashboard_request_controller = new AbortController();

  VisibleLoaderElement(true);

  // 準備去年同期的時間範圍
  const beginTimeObj = new Date(b_time.value);
  const endTimeObj = new Date(e_time.value);
  const lastYearBegin = new Date(beginTimeObj);
  lastYearBegin.setFullYear(lastYearBegin.getFullYear() - 1);
  const lastYearEnd = new Date(endTimeObj);
  lastYearEnd.setFullYear(lastYearEnd.getFullYear() - 1);
  const formatDate = (date) => date.toISOString().split("T")[0];

  try {
    // [優化] 並行發起兩個請求
    const [currentYearResult, lastYearResult] = await Promise.allSettled([
      apiCall(
        CsRequestDashboardSelectDeviceSpec,
        search_group_cid,
        b_time.value,
        e_time.value,
        search_product_type,
        search_spec,
      ),
      apiCall(
        CsRequestDashboardSelectDeviceSpec,
        search_group_cid,
        formatDate(lastYearBegin),
        formatDate(lastYearEnd),
        search_product_type,
        search_spec,
      ),
    ]);

    // 處理今年數據 (主數據)
    if (currentYearResult.status === "rejected") {
      throw currentYearResult.reason;
    }

    const json_object = currentYearResult.value;
    const json_tablesi = json_object.records;
    const field_count = Object.keys(json_tablesi).length;

    if (field_count == 0) {
      showNoDataMessage();
    } else {
      // 1. 計算今年基礎數據
      const activated_count = GetStateCount(json_tablesi, "1");
      const revoked_count = GetStateCount(json_tablesi, "0");

      // 2. 處理去年數據 (即使失敗也不影響主流程)
      processLastYearData(lastYearResult, activated_count);

      // 3. 更新目標與預測
      updateTargetAndPrediction(
        json_object,
        activated_count,
        b_time.value,
        e_time.value,
      );

      // 4. 更新 UI 數字
      document.getElementById(
        "dashboard_device_001-activated_count",
      ).textContent = activated_count;
      document.getElementById(
        "dashboard_device_001-revoked_count",
      ).textContent = revoked_count;

      // 5. 繪製圖表
      RenderDevice003PieChart(
        document.getElementById("dashboard_device_001-pie_chart"),
        json_tablesi,
      );
      RenderDevice003LineChart(
        document.getElementById("dashboard_device_001-line_chart"),
        json_tablesi,
      );
      RenderDevice003BarChart(
        document.getElementById("dashboard_device_001-new_line_chart"),
        json_tablesi,
      );
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Dashboard request aborted");
    } else {
      console.error("Dashboard API Error:", error);
      // 簡單重試邏輯
      if (retryCount < 2) {
        console.warn(`Retry SelectDeviceSpec003 (${retryCount + 1})...`);
        setTimeout(() => SelectDeviceSpec003(retryCount + 1, callback), 1000);
        return;
      }
      alert("Request error: " + (error.message || "Unknown error"));
    }
  } finally {
    safeExecuteCallback();
    VisibleLoaderElement(false);
  }
}

// 輔助函式：處理去年同期數據
function processLastYearData(lastYearResult, currentActivatedCount) {
  const growthContainer = document.getElementById(
    "dashboard_device_001-growth_rate",
  );
  const growthPercentageElement = document.getElementById(
    "dashboard_device_001-growth_percentage",
  );
  const growthIconElement = document.getElementById(
    "dashboard_device_001-growth_icon",
  );

  if (lastYearResult.status === "rejected" || !lastYearResult.value) {
    console.warn("無法取得去年資料:", lastYearResult.reason);
    if (growthContainer) growthContainer.style.display = "none";
    return;
  }

  try {
    const lastYearData = lastYearResult.value;
    if (
      !lastYearData.records ||
      Object.keys(lastYearData.records).length === 0
    ) {
      if (growthContainer) growthContainer.style.display = "none";
      return;
    }

    const lastYearActivatedCount = GetStateCount(lastYearData.records, "1");

    if (lastYearActivatedCount === 0) {
      if (growthContainer) growthContainer.style.display = "none";
      return;
    }

    const growthRate =
      ((currentActivatedCount - lastYearActivatedCount) /
        lastYearActivatedCount) *
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
  } catch (e) {
    console.error("處理去年數據錯誤:", e);
    if (growthContainer) growthContainer.style.display = "none";
  }
}

// 輔助函式：更新目標與預測
function updateTargetAndPrediction(
  json_object,
  activated_count,
  b_time_str,
  e_time_str,
) {
  const target_time = json_object.target_time || e_time_str;
  const target_count = json_object.target_count || "0";

  // 預測達標數量計算
  let predicted_achievement_count = 0;
  const sb_time = new Date(b_time_str);
  const se_time = new Date(e_time_str);
  const st_time = new Date(target_time.split(" ")[0]);

  const diffTime01 = Math.abs(se_time - sb_time) / 1000;
  const diffTime02 = Math.abs(st_time - sb_time) / 1000;

  if (activated_count > 0 && diffTime01 > 0) {
    const speed = diffTime01 / activated_count; // 秒/台
    const remainingTime = diffTime02 - diffTime01;
    const predictedAdditional = Math.ceil(remainingTime / speed);
    predicted_achievement_count = activated_count + predictedAdditional;
  } else {
    predicted_achievement_count = activated_count;
  }

  // 更新 UI
  const targetNum = Number(target_count);
  const activationRate = targetNum > 0 ? activated_count / targetNum : 0;
  const predictionRate =
    targetNum > 0 ? predicted_achievement_count / targetNum : 0;

  document.getElementById("dashboard_device_001-activation_rate").textContent =
    (activationRate * 100).toFixed(2) + "%";
  document.getElementById(
    "dashboard_device_001-predicted_achievement_rate",
  ).textContent = (predictionRate * 100).toFixed(2) + "%";
  document.getElementById(
    "dashboard_device_001-predicted_achievement_count",
  ).textContent = Math.ceil(predicted_achievement_count);

  const inputTime = document.getElementById("dashboard_device_001-target_time");
  if (inputTime) inputTime.value = target_time.split(" ")[0];

  const inputCount = document.getElementById(
    "dashboard_device_001-target_count",
  );
  if (inputCount) inputCount.value = target_count;
}

// 儲存各樣目標數據
function UpdateDeviceSpec003() {
  //let search_group_cid = document.getElementById("dashboard_device_001-search_group_cid").value;
  let search_group_cid = window.sessionStorage.getItem("select_group_cid");
  const t_time = document.getElementById("dashboard_device_001-target_time");
  const t_count = document.getElementById("dashboard_device_001-target_count");

  // 開啟loading dialog
  VisibleLoaderElement(true);

  CsRequestDashboardUpdateDeviceSpec(
    search_group_cid,
    t_time.value,
    t_count.value,
    function (ok, result) {
      // 關閉loading dialog
      VisibleLoaderElement(false);

      if (!ok) {
        alert("request error");
        return;
      }

      let json_object = JSON.parse(result); // 解析 JSON

      if (show_errno(json_object.errno) != "") {
        return;
      }

      SelectDeviceSpec003();
      alert(GetLocalData("common.success"));
    },
  );
}

function ExportDeviceSpec003() {
  if (_g_line_chart_data == null) {
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("折線圖資料");

  // 寫入標題列
  const headerRow = [
    "月份",
    ..._g_line_chart_data.datasets.map((ds) => ds.label),
  ];
  worksheet.addRow(headerRow);

  // 寫入資料列
  for (let i = 0; i < _g_line_chart_data.labels.length; i++) {
    const row = [_g_line_chart_data.labels[i]];
    for (const ds of _g_line_chart_data.datasets) {
      row.push(ds.data[i]);
    }
    worksheet.addRow(row);
  }

  // 圖片 base64 去除開頭
  if (_g_line_chart_image_base64) {
    const imageId = workbook.addImage({
      base64: _g_line_chart_image_base64,
      extension: "png",
    });

    // 插入圖片（設定位置與大小）
    worksheet.addImage(imageId, {
      tl: { col: 0, row: _g_line_chart_data.labels.length + 3 },
      ext: { width: 600, height: 300 },
    });
  }

  // 匯出為 xlsx
  // 下載 Excel（不用 await）
  workbook.xlsx
    .writeBuffer()
    .then((buffer) => {
      saveAs(new Blob([buffer]), "chart_data_with_image.xlsx");
    })
    .catch((error) => {
      console.error("Excel 匯出錯誤:", error);
    });
}

//_____________________________________________________________________________________
// 事件相關

// 頁面啟動完成時
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Distributor Dashboard Initializing...");

  // [優化] 確保 Loader 持續顯示，直到資料載入完成
  VisibleLoaderElement(true);

  // [新增] 移除靜態 Loading 遮罩
  const loader = document.getElementById("initial-loader");
  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => loader.remove(), 300); // 淡出效果
  }

  // [新增] 安全檢查：如果沒有 session_token，強制導回登入頁
  if (!window.sessionStorage.getItem("session_token")) {
    console.warn("No session token. Redirecting to login.");
    VisibleLoaderElement(false);
    window.location.href = "login.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);

  // [優化] 1. 優先處理 URL 參數與產品類型
  const urlProduct = urlParams.get("product");
  if (urlProduct) {
    window.sessionStorage.setItem("product_type", urlProduct);
  }
  const productType =
    window.sessionStorage.getItem("product_type") || "avacast";

  // 設定預設日期
  {
    const urlLicenseBeginTime = urlParams.get("begin_time");
    const urlLicenseEndTime = urlParams.get("end_time");
    const licenseCount = urlParams.get("license_count");

    const b_time_input = document.getElementById(
      "dashboard_device_001-begin_time",
    );
    const e_time_input = document.getElementById(
      "dashboard_device_001-end_time",
    );
    const targetCountInput = document.getElementById(
      "dashboard_device_001-target_count",
    );

    const savedBeginTime = sessionStorage.getItem("dashboard_begin_time");
    const savedEndTime = sessionStorage.getItem("dashboard_end_time");

    if (b_time_input && e_time_input) {
      if (urlLicenseBeginTime && urlLicenseEndTime) {
        b_time_input.value = urlLicenseBeginTime.split(" ")[0];
        e_time_input.value = urlLicenseEndTime.split(" ")[0];
        if (licenseCount && targetCountInput)
          targetCountInput.value = licenseCount;
      } else if (savedBeginTime && savedEndTime) {
        b_time_input.value = savedBeginTime;
        e_time_input.value = savedEndTime;
      } else {
        const NDate = new Date();
        const BDate = new Date(NDate.getFullYear(), 0, 1);
        b_time_input.value = BDate.toLocaleDateString("sv-SE");
        e_time_input.value = NDate.toLocaleDateString("sv-SE");
      }
    }
  }

  // 設定今天日期顯示
  {
    const NDate = new Date();
    const formattedDate = NDate.toISOString().split("T")[0];
    let today_time = document.getElementById("dashboard_device_001-today_time");
    if (today_time) today_time.textContent = formattedDate;
  }

  // [優化] 確保 space_num 有預設值
  const spaceNumInput = document.getElementById(
    "dashboard_device_001-space_num",
  );
  if (spaceNumInput && !spaceNumInput.value) {
    spaceNumInput.value = "%%";
  }

  //_________________________________________________________________________________
  // 動作

  // 預設資料
  {
    // 取得預設組織帳號
    // [優化] 改用主動輪詢檢查 Session，取代死等 200ms，提升反應速度並解決閃爍
    let checkSessionRetry = 0;
    const checkSession = () => {
      const group_cid =
        window.sessionStorage.getItem("group_cid") ||
        window.sessionStorage.getItem("select_group_cid");

      if (!IsValidString(group_cid)) {
        if (checkSessionRetry < 5) {
          checkSessionRetry++;
          console.log(
            `[Session] 尚未取得 group_cid，100ms 後進行第 ${checkSessionRetry} 次重試...`,
          );
          setTimeout(checkSession, 100);
          return;
        }
        VisibleLoaderElement(false);
        alert(window.localeData.warring.no_group_cid);
        change_page("home.html");
        return;
      }

      const searchInput = document.getElementById(
        "dashboard_device_001-search_group_cid",
      );
      if (searchInput) {
        searchInput.value = group_cid;
      }

      // 執行初始資料請求，並在完成後才顯示模板與更新標題
      SelectDeviceSpec003(0, () => {
        showTemplate("app");
        updatePageTitleWithGroupCid("#dashboard-title", "", "");
      });
    };

    checkSession();
  }

  // 動作
  {
    // 搜尋
    {
      let button = document.getElementById(
        "dashboard_device_001-button-search",
      );
      if (button) {
        button.addEventListener("click", function (event) {
          SelectDeviceSpec003();
        });
      }
    }

    {
      let button = document.getElementById("dashboard_device_001-update-ok");
      if (button) {
        button.addEventListener("click", function (event) {
          UpdateDeviceSpec003();
        });
      }
    }

    {
      let button = document.getElementById("dashboard_device_001-export");
      if (button) {
        button.addEventListener("click", function (event) {
          ExportDeviceSpec003();
        });
      }
    }
  }

  // 檢查是否有從 license 頁面傳來的參數
  {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLicenseBeginTime = urlParams.get("begin_time");
    const urlLicenseEndTime = urlParams.get("end_time");
    const licenseCid = urlParams.get("license_cid");
    const licenseCount = urlParams.get("license_count");

    // 取得日期輸入框元素
    let b_time_input = document.getElementById(
      "dashboard_device_001-begin_time",
    );
    let e_time_input = document.getElementById("dashboard_device_001-end_time");

    // 檢查 sessionStorage 中是否有儲存的日期
    const savedBeginTime = sessionStorage.getItem("dashboard_begin_time");
    const savedEndTime = sessionStorage.getItem("dashboard_end_time");

    if (urlLicenseBeginTime && urlLicenseEndTime) {
      // 如果有從 license 傳來的參數，使用授權的開始和結束時間
      b_time_input.value = urlLicenseBeginTime.split(" ")[0]; // 只取日期部分
      e_time_input.value = urlLicenseEndTime.split(" ")[0]; // 只取日期部分

      // 設定目標數量為 license 的訂單數量
      if (licenseCount) {
        const targetCountElement = document.getElementById(
          "dashboard-target-count",
        );
        if (targetCountElement) {
          targetCountElement.textContent =
            parseInt(licenseCount).toLocaleString();
        }
        // 同時設定隱藏的目標數量輸入框
        const targetCountInput = document.getElementById(
          "dashboard_device_001-target_count",
        );
        if (targetCountInput) {
          targetCountInput.value = licenseCount;
        }
      }
      console.log(
        `從 URL 載入日期: ${urlLicenseBeginTime} ~ ${urlLicenseEndTime}`,
      );
    } else if (savedBeginTime && savedEndTime) {
      // 如果沒有 URL 參數，但 sessionStorage 有儲存日期，則使用 (次高優先級)
      b_time_input.value = savedBeginTime;
      e_time_input.value = savedEndTime;
      console.log(
        "從 sessionStorage 載入日期:",
        savedBeginTime,
        "~",
        savedEndTime,
      );
    } else {
      // 預設為今年的第一天 (最低優先級)
      const NDate = new Date();
      //const BDate = DateAdd('m', -6, new Date());
      const BDate = new Date(NDate);
      BDate.setFullYear(NDate.getFullYear() - 1);
      const EDate = NDate;
      b_time_input.value = BDate.toLocaleDateString("sv-SE");
      e_time_input.value = EDate.toLocaleDateString("sv-SE");
      console.log(
        "設定預設日期:",
        BDate.toLocaleDateString("sv-SE"),
        "~",
        EDate.toLocaleDateString("sv-SE"),
      );
    }
  }

  // 時間搜尋按鈕監聽
  let dateSearchButton = document.getElementById(
    "dashboard_device_001-button-date_search",
  );
  if (dateSearchButton) {
    dateSearchButton.addEventListener("click", function (event) {
      console.log("日期搜尋按鈕點擊");
      SelectDeviceSpec003();
    });
  }
});
