console.log("app.view.dashboard.js Loaded");
// home.html 的頁面事件操控程式碼相關

// Helper function to dynamically load a script
function loadScript(src, callback) {
  // Avoid duplicate loading
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

// New function to configure the dashboard based on the product
function configureDashboardForProduct(product) {
  const navContainer = document.getElementById("nav-container");
  const avaclassroomNavContainer = document.getElementById(
    "avaclassroom-nav-container",
  );

  // Default product if not specified
  product = product || "avacast";

  console.log(`Configuring dashboard for product: ${product}`);

  // [防呆] 切換非 avaclassroom 產品時，若當前選中 group_cid 為學校 (以 sch_ 開頭)，則將其退回為 parent 代理商/公司 ID
  if (product !== "avaclassroom") {
    let currentGroup = window.sessionStorage.getItem("group_cid") || window.sessionStorage.getItem("select_group_cid") || "";
    if (currentGroup && currentGroup.startsWith("sch_")) {
      // [修正] 優先使用儲存的公司 ID (school_parent_company_cid) 或登入保底 ID，防範字串解析退回為人 (member_cid)
      const parentCompanyCid = window.sessionStorage.getItem("school_parent_company_cid") || window.sessionStorage.getItem("login_group_cid");
      if (parentCompanyCid) {
        console.log(`[Dashboard] 偵測到載入非 avaclassroom 產品，且當前群組為學校 (${currentGroup})，自動回退至代理商公司群組 (${parentCompanyCid})`);
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
  }

  // Set product_type in sessionStorage for API calls to work correctly
  window.sessionStorage.setItem("product_type", product);

  if (product === "avaclassroom") {
    if (navContainer) navContainer.style.display = "none";
    if (avaclassroomNavContainer)
      avaclassroomNavContainer.style.display = "block";
    // Dynamically load the specific nav script for avaclassroom
    loadScript("components/avaclassroom-nav/avaclassroom.js", () => {
      if (typeof initializeAvaclassroomNav === "function") {
        initializeAvaclassroomNav();
      } else {
        console.error("AVA Classroom nav initialization function not found.");
      }
    });
  } else {
    if (navContainer) navContainer.style.display = "block";
    if (avaclassroomNavContainer)
      avaclassroomNavContainer.style.display = "none";
    // Dynamically load the standard nav and initialize it
    loadScript("components/app.component.frame.nav.js", () => {
      if (typeof initializeStandardNav === "function") {
        initializeStandardNav();
      } else {
        console.error("Standard nav initialization function not found.");
      }
    });
  }
}

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
  [
    document.getElementById("dashboard_device_001-pie_chart"),
    document.getElementById("dashboard_device_001-line_chart"),
    document.getElementById("dashboard_device_001-new_line_chart")
  ].forEach((canvas) => {
    if (canvas) {
      const existingChart = Chart.getChart(canvas);
      if (existingChart) existingChart.destroy();
    }
  });
  _g_pie_chart = null;
  _g_multi_line_chart = null;
  _g_bar_chart = null;
  if (typeof _g_new_line_chart !== 'undefined') _g_new_line_chart = null;

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

      // [UI 修復] 改用 HTML div 來顯示文字，避免 canvas 解析度導致的文字模糊與拉伸變形
      const parent = canvas.parentElement;
      if (parent) {
        parent.style.position = "relative";
        let msgDiv = parent.querySelector(".chart-no-data-msg");
        if (!msgDiv) {
          msgDiv = document.createElement("div");
          msgDiv.className = "chart-no-data-msg";
          msgDiv.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #898c94; font-size: 16px; pointer-events: none;";
          parent.appendChild(msgDiv);
        }
        msgDiv.textContent = window.localeData.dashboard?.no_data || "目前沒有資料";
        msgDiv.style.display = "block";
      }
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

  // [UI 修復] 隱藏無資料提示文字
  if (canvas && canvas.parentElement) {
    const msgDiv = canvas.parentElement.querySelector(".chart-no-data-msg");
    if (msgDiv) msgDiv.style.display = "none";
  }

  const ctx = canvas.getContext("2d");

  // [效能修復] 透過 Chart.getChart 確保精準銷毀實例，防止 Ghost Canvas 記憶體洩漏
  const existingChart = Chart.getChart(canvas);
  if (existingChart) existingChart.destroy();

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
      // [Plan 3 效能優化] 縮短進場動畫時間，並徹底關閉 Hover 漸變重繪，消除手機版滑動卡頓
      animation: {
        duration: 400,
      },
      transitions: {
        active: {
          animation: { duration: 0 },
        },
      },
      responsive: true,
      maintainAspectRatio: false, // [優化] 解除高寬比綁定，使圖表能適應外層容器高度
      plugins: {
        legend: {
          position: window.innerWidth < 850 ? "bottom" : "right", // [優化] 手機版將圖例移至下方，防擠壓
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
      normalized: true, // [Plan 3 效能優化] 宣告資料已排序且無重複，跳過底層耗時的解析演算法
    },
  ];

  // 建立長條圖
  const maxYValue = Math.ceil(Math.max(...monthlyData) * 1.1);

  // [UI 修復] 隱藏無資料提示文字
  if (canvas && canvas.parentElement) {
    const msgDiv = canvas.parentElement.querySelector(".chart-no-data-msg");
    if (msgDiv) msgDiv.style.display = "none";
  }

  const ctx = canvas.getContext("2d");

  // [效能修復] 透過 Chart.getChart 確保精準銷毀實例，防止 Ghost Canvas 記憶體洩漏
  const existingChart = Chart.getChart(canvas);
  if (existingChart) existingChart.destroy();

  _g_bar_chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: allMonths,
      datasets: datasets,
    },
    options: {
      // [Plan 3 效能優化] 縮短進場動畫時間，並徹底關閉 Hover 漸變重繪
      animation: {
        duration: 400,
      },
      transitions: {
        active: {
          animation: { duration: 0 },
        },
      },
      responsive: true,
      maintainAspectRatio: false, // [優化] 解除高寬比綁定
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
            top: 20,
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

  // 為每個 spec04 補全月份
  // Object.keys(groupedData).forEach(spec => {
  //     allMonths.forEach(month => {
  //         if (!groupedData[spec][month]) {
  //             groupedData[spec][month] = 0;
  //         }
  //     });
  // });
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
    normalized: true, // [Plan 3 效能優化] 宣告資料已排序且無重複，極速渲染
  }));

  // 建立折線圖
  const maxYValue = Math.ceil(
    Math.max(...datasets.flatMap((ds) => ds.data)) * 1.5,
  );

  // [UI 修復] 隱藏無資料提示文字
  if (canvas && canvas.parentElement) {
    const msgDiv = canvas.parentElement.querySelector(".chart-no-data-msg");
    if (msgDiv) msgDiv.style.display = "none";
  }

  const ctx = canvas.getContext("2d");

  // 根據 canvas ID 決定使用哪個圖表變數
  const isNewChart = canvas.id === "dashboard_device_001-new_line_chart";

  // [效能修復] 透過 Chart.getChart 確保精準銷毀實例，防止 Ghost Canvas 記憶體洩漏
  const existingChart = Chart.getChart(canvas);
  if (existingChart) existingChart.destroy();

  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: allMonths,
      datasets: datasets,
    },
    options: {
      // [Plan 3 效能優化] 縮短進場動畫時間，並徹底關閉 Hover 漸變重繪
      animation: {
        duration: 400,
      },
      transitions: {
        active: {
          animation: { duration: 0 },
        },
      },
      responsive: true,
      maintainAspectRatio: false, // [優化] 解除高寬比綁定
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

  /*
    
        // 1. 動態生成數據集
        function generateDatasets(labels, data) {
            return data.map((dataset, index) => ({
                label: labels[index],
                data: dataset,
                borderColor: getRandomColor(),
                backgroundColor: 'transparent', // 線條背景顏色
                fill: false,                    // 不填滿
                tension: 0.2                    // 曲線張力
            }));
        }
    
        // 2. 建立多條折線圖
        function createMultiLineChart(ctx, xLabels, lineLabels, lineData) {
            const multiLineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: xLabels,    // X 軸標籤
                    datasets: generateDatasets(lineLabels, lineData) // 動態產生多條線
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top'
                        },
                        title: {
                            display: true,
                            text: '動態多條折線圖'
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'X 軸標籤'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Y 軸數值'
                            }
                        }
                    }
                }
            });
        }
    
        // 先整理資料
        // 0. 動態數據範例
        const xLabels = ['一月', '二月', '三月', '四月', '五月'];
        const lineLabels = ['折線A', '折線B', '折線C'];
        const lineData = [
            [10, 20, 30, 40, 50], // 折線A資料
            [15, 25, 35, 45, 55], // 折線B資料
            [5, 15, 25, 35, 45]   // 折線C資料
        ];
    
        {
            const xLabels_set = new Set(arr);
            {
                let di = 0;
                for (let value of data['record_state']) {
                    // 排除掉撤銷的設備資料
                    if (value != '-1') {
                        let active_time = data['active_time'][di];
                        if (xLabels.find())
                            //let device_count = data['device_count'][di];
                            if (device_model_count.has(spec_model)) {
                                device_model_count.set(spec_model, device_model_count.get(spec_model) + device_count);
                            } else {
                                device_model_count.set(spec_model, device_count);
                            }
                    }
                    di++;
                }
            }
    
            for (let [key, value] of device_model_count) {
                labels.push(key);
                datasets_data.push(value);
                datasets_background_color.push(getRandomColorRGB(0.6));
                datasets_border_color.push(getRandomColorRGB(0));
            }
        }
    
        // 套用
        const ctx = canvas.getContext('2d');
    
        // 6. 建立圖表
        createMultiLineChart(ctx, xLabels, lineLabels, lineData);
    */
  /*
    const multiLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Dataset 1',
                    data: [12, 19, 3, 5, 2, 3],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false
                },
                {
                    label: 'Dataset 2',
                    data: [8, 11, 5, 6, 7, 8],
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: false
                },
                {
                    label: 'Dataset 3',
                    data: [15, 14, 10, 9, 6, 5],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    enabled: true,
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Month'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            }
        }
    });
    */
}

let _g_dashboard_request_controller = null;

async function SelectDeviceSpec003(retryCount = 0, callback = null) {
  let search_group_cid =
    window.sessionStorage.getItem("group_cid") ||
    window.sessionStorage.getItem("select_group_cid");

  // [新增] 權限判斷
  const userTier = window.sessionStorage.getItem("tier");
  const isDistributor = userTier === "3";

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

  // [安全防護] 避免因 DOM 尚未準備好導致 b_time 為 null 而拋出錯誤
  const bTimeVal = b_time
    ? b_time.value
    : new Date().toLocaleDateString("sv-SE");
  const eTimeVal = e_time
    ? e_time.value
    : new Date().toLocaleDateString("sv-SE");

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

  // [安全防護] 避免 VisibleLoaderElement 未定義時引發全域錯誤導致白屏
  if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(true);

  // 準備去年同期的時間範圍
  const beginTimeObj = new Date(bTimeVal);
  const endTimeObj = new Date(eTimeVal);
  const lastYearBegin = new Date(beginTimeObj);
  lastYearBegin.setFullYear(lastYearBegin.getFullYear() - 1);
  const lastYearEnd = new Date(endTimeObj);
  lastYearEnd.setFullYear(lastYearEnd.getFullYear() - 1);
  const formatDate = (date) => date.toISOString().split("T")[0];

  try {
    // [修正] 由於模組已合併，統一使用 CsRequestDashboardSelectDeviceSpec
    const apiFunction = CsRequestDashboardSelectDeviceSpec;

    // [修正] 統一參數清單，包含 product_type 以符合合併後的函式簽名
    const getApiArgs = (group, start, end) => {
      return [group, start, end, search_product_type, search_spec];
    };

    // [效能大躍進] 後端資料庫連線池已優化，恢復「並行請求 (Concurrent Requests)」，將載入時間砍半！
    const currentYearPromise = apiCall(
      apiFunction,
      ...getApiArgs(search_group_cid, bTimeVal, eTimeVal),
      _g_dashboard_request_controller,
    );

    const lastYearPromise = apiCall(
      apiFunction,
      ...getApiArgs(
        search_group_cid,
        formatDate(lastYearBegin),
        formatDate(lastYearEnd),
      ),
      _g_dashboard_request_controller,
    );

    // 使用 allSettled 確保即使去年資料撈取失敗，今年的主資料依然能渲染
    const [currentYearResult, lastYearResult] = await Promise.allSettled([
      currentYearPromise,
      lastYearPromise,
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
        bTimeVal,
        eTimeVal,
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

    // [修復] 1. 成功取得資料並渲染完成後，才顯示畫面並關閉 Loading
    safeExecuteCallback();
    if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(false);
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Dashboard request aborted");
      // [修復] 2. 請求被主動取消時，解除畫面鎖定
      safeExecuteCallback();
      if (typeof VisibleLoaderElement === "function")
        VisibleLoaderElement(false);
    } else {
      console.error("Dashboard API Error:", error);
      // 簡單重試邏輯 (可選)
      if (retryCount < 2) {
        console.warn(`Retry SelectDeviceSpec003 (${retryCount + 1})...`);
        setTimeout(() => SelectDeviceSpec003(retryCount + 1, callback), 1000);
        return; // [修復] 3. 觸發重試時直接返回。保持 Loading 動畫繼續轉動，絕不提早顯示空畫面
      }
      alert("Request error: " + (error.message || "Unknown error"));

      // [修復] 4. 重試次數耗盡，確認最終失敗，才顯示空框架並關閉 Loading
      safeExecuteCallback();
      if (typeof VisibleLoaderElement === "function")
        VisibleLoaderElement(false);
    }
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

  // [新增] 權限判斷
  const userTier = window.sessionStorage.getItem("tier");
  const isDistributor = userTier === "3";

  // 開啟loading dialog
  if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(true);

  // 定義回呼函式
  const handleResult = function (ok, result) {
    // 關閉loading dialog
    if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(false);

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
  };

  // [修正] 統一呼叫合併後的更新 API
  CsRequestDashboardUpdateDeviceSpec(
    search_group_cid,
    t_time.value,
    t_count.value,
    handleResult,
  );
}

async function ExportDeviceSpec003() {
  if (_g_line_chart_data == null) {
    return;
  }

  // [Plan 2 優化] 惰性載入 ExcelJS 與 FileSaver，使用原生 Promise 確保絕對載入完成
  if (typeof ExcelJS === 'undefined' || typeof saveAs === 'undefined') {
    VisibleLoaderElement(true);
    try {
      await Promise.all([
        new Promise((resolve, reject) => {
          const s1 = document.createElement("script");
          s1.src = "vender/node_modules/exceljs/dist/exceljs.min.js";
          s1.onload = resolve;
          s1.onerror = reject;
          document.head.appendChild(s1);
        }),
        new Promise((resolve, reject) => {
          const s2 = document.createElement("script");
          s2.src = "vender/node_modules/file-saver/dist/FileSaver.min.js";
          s2.onload = resolve;
          s2.onerror = reject;
          document.head.appendChild(s2);
        })
      ]);
    } catch (error) {
      console.error("Failed to load export libraries:", error);
      alert("匯出功能載入失敗，請稍後再試。");
      return;
    } finally {
      VisibleLoaderElement(false);
    }
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

// 初始化整個 View 的函數，確保相依性載入後才執行
async function initDashboardView() {
  console.log("Dashboard View Initializing...");

  // i18n 渲染 (必須在 Core Dependencies 載入後執行)
  const lang = window.localStorage.getItem("language") || "zh-tw";
  if (typeof renderTemplate === "function") {
    await renderTemplate(lang, "app");
  }

  // [體驗優化] 提早顯示頁面骨架！多語系翻譯完成後立刻解除隱藏，讓使用者先看到 UI 框架，徹底消除等待 API 時的白屏現象。
  if (typeof showTemplate === "function") {
    showTemplate("app");
  }

  // [新增] 移除靜態 Loading 遮罩
  // 由後續 API 的 VisibleLoaderElement 自動接管隱藏

  // [新增] 安全檢查：如果沒有 session_token，強制導回登入頁
  if (!window.sessionStorage.getItem("session_token")) {
    console.warn(
      "Unauthorized access: No session token. Redirecting to login.",
    );
    if (typeof VisibleLoaderElement === "function") VisibleLoaderElement(false);
    window.location.href = "login.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);

  // [優化] 1. 優先處理 URL 參數與日期初始化，確保 API 請求時有正確數值
  const product = urlParams.get("product");
  configureDashboardForProduct(product);

  // 設定預設日期
  {
    const urlLicenseBeginTime = urlParams.get("begin_time");
    const urlLicenseEndTime = urlParams.get("end_time");
    const licenseCount = urlParams.get("license_count");

    let b_time_input = document.getElementById(
      "dashboard_device_001-begin_time",
    );
    let e_time_input = document.getElementById("dashboard_device_001-end_time");

    const savedBeginTime = sessionStorage.getItem("dashboard_begin_time");
    const savedEndTime = sessionStorage.getItem("dashboard_end_time");

    if (b_time_input && e_time_input) {
      if (urlLicenseBeginTime && urlLicenseEndTime) {
        b_time_input.value = urlLicenseBeginTime.split(" ")[0];
        e_time_input.value = urlLicenseEndTime.split(" ")[0];
        if (licenseCount) {
          const targetCountInput = document.getElementById(
            "dashboard_device_001-target_count",
          );
          if (targetCountInput) targetCountInput.value = licenseCount;
        }
      } else if (savedBeginTime && savedEndTime) {
        b_time_input.value = savedBeginTime;
        e_time_input.value = savedEndTime;
      } else {
        const NDate = new Date();
        const BDate = new Date(NDate);
        BDate.setFullYear(NDate.getFullYear() - 1);
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

  // 初始化標題更新
  updatePageTitleWithGroupCid("#dashboard-title", "", "");

  // [優化] 移除不必要的 setTimeout，確保事件精準綁定
  if (typeof addOrganizationEditClickToTitle === "function") {
    addOrganizationEditClickToTitle();
  }

  //_________________________________________________________________________________
  // 動作

  // [效能修復] 使用 AbortController 徹底清除舊的事件監聽器，防止 SPA 切換造成的 API 重複請求與記憶體洩漏
  if (window._dashboardUIEventController) window._dashboardUIEventController.abort();
  window._dashboardUIEventController = new AbortController();
  const signal = window._dashboardUIEventController.signal;

  // [Phase 2 優化] 攔截全域路由切換廣播，徹底釋放圖表記憶體參考
  window.addEventListener("spa:page-change-before", () => {
    if (_g_pie_chart) { _g_pie_chart.destroy(); _g_pie_chart = null; }
    if (_g_bar_chart) { _g_bar_chart.destroy(); _g_bar_chart = null; }
    if (_g_new_line_chart) { _g_new_line_chart.destroy(); _g_new_line_chart = null; }
    if (_g_multi_line_chart) { _g_multi_line_chart.destroy(); _g_multi_line_chart = null; }
    _g_line_chart_data = null;
  }, { signal });

  // 預設資料
  {
    // 取得預設組織帳號
    // [優化] 改用主動輪詢檢查 Session，取代直接讀取，提升反應速度並解決閃爍
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
        console.warn(
          "No group_cid found after retries. Dashboard data will not load until a group is selected.",
        );
        if (typeof VisibleLoaderElement === "function")
          VisibleLoaderElement(false);
        showTemplate("app"); // 即使沒資料也要顯示框架
        return;
      }

      const searchInput = document.getElementById(
        "dashboard_device_001-search_group_cid",
      );
      if (searchInput) {
        searchInput.value = group_cid;
      }

      // 執行初始資料請求，並在完成後才顯示模板
      SelectDeviceSpec003(0, () => {
        // showTemplate("app"); 已移至最上方提早執行，這裡可以留空或做其他處理
        console.log("Dashboard Initial Data Loaded.");
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
        }, { signal });
      }
    }

    {
      let button = document.getElementById("dashboard_device_001-update-ok");
      if (button) {
        button.addEventListener("click", function (event) {
          UpdateDeviceSpec003();
        }, { signal });
      }
    }

    {
      let button = document.getElementById("dashboard_device_001-export");
      if (button) {
        button.addEventListener("click", function (event) {
          ExportDeviceSpec003();
        }, { signal });
      }
    }
  }

  // 時間輸入框事件監聽器 - 放在最後確保元素已渲染
  {
    let dateSearchButton = document.getElementById(
      "dashboard_device_001-button-date_search",
    );
    if (dateSearchButton) {
      dateSearchButton.addEventListener("click", function (event) {
        console.log("日期搜尋按鈕點擊");
        SelectDeviceSpec003();
      }, { signal });
    }
  }
}

// -----------------------------------------------------------
// 依賴狀態管理：確保核心函式庫載入後才綁定 DOMContentLoaded
// -----------------------------------------------------------
function startDashboardApp() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDashboardView);
  } else {
    initDashboardView();
  }
}

if (window._CoreLoaded) {
  startDashboardApp();
} else {
  window.addEventListener("CoreDependenciesReady", startDashboardApp);
}
