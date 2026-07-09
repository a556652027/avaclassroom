// home.html 的頁面事件操控程式碼相關

//_______________________________________________________________________
// 直接執行
// i18n ***必定放在載入頁面完成後的最前面 避免導致後面的addEventListener失效
(function () {
    renderTemplate("zh-tw", "app");
})();

/*___________________________________________________________________________________*/
// 列表上面顯示的欄位對照表 與 順序
let key_dashboard_device_list_info = ["spec04", "record_state", "active_time", "device_count"];

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

// 畫出設備條件0003雷達圖
let _g_pie_chart = null;
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
                if (value != "-1") {
                    let spec_model = data["spec04"][di];
                    let device_count = Number(data["device_count"][di]);
                    if (device_model_count.has(spec_model)) {
                        device_model_count.set(spec_model, Number(device_model_count.get(spec_model)) + device_count);
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
    // 確保正確註冊 ChartDataLabels
    Chart.register(ChartDataLabels);

    const ctx = canvas.getContext("2d");

    if (_g_pie_chart != null) {
        _g_pie_chart.destory();
    }

    _g_pie_chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [
                {
                    label: window.localeData.dashboard.device_spec_distribution,
                    data: datasets_data,
                    backgroundColor: datasets_background_color,
                    borderColor: datasets_border_color,
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "right", // 這裡指定圖例在右側
                    align: "center", // 水平居中
                    // labels: {
                    //     boxWidth: 20,   // 標籤色塊大小
                    //     padding: 10     // 文字間距
                    // }
                },
                title: {
                    display: true,
                    text: window.localeData.dashboard.device_spec_distribution,
                    padding: {
                        top: 0, // 標題與圖表之間的間距
                        bottom: 0, // 如果需要下方間距
                    },
                    font: {
                        size: 18, // 字體大小
                    },
                },
                datalabels: {
                    formatter: (value, context) => {
                        // 確保將數據轉為數字再相加
                        const total = context.dataset.data.reduce((acc, val) => acc + Number(val), 0);
                        const rawPercentage = (value / total) * 100;
                        // 確保顯示至少 0.1%，並修正四捨五入
                        const percentage = rawPercentage < 0.1 ? "<0.1%" : rawPercentage.toFixed(1) + "%";
                        return percentage;
                    },
                    color: "#fff", // 文字顏色
                    font: {
                        weight: "bold",
                        size: 16,
                    },
                    align: "center", // 在圓餅內部顯示
                    anchor: "center", // 在圓餅內部顯示
                },
            },
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

    // 建立 Chart.js 資料格式
    const datasets = Object.keys(groupedData).map((spec) => ({
        label: spec,
        data: allMonths.map((month) => groupedData[spec][month]),
        borderColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
        backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%, 0.3)`,
    }));

    // 建立折線圖
    const maxYValue = Math.ceil(Math.max(...datasets.flatMap((ds) => ds.data)) * 1.5);
    const ctx = canvas.getContext("2d");

    if (_g_multi_line_chart != null) {
        _g_multi_line_chart.destory();
    }

    _g_multi_line_chart = new Chart(ctx, {
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
                },
            },
        },
    });

    _g_line_chart_data = {
        labels: allMonths,
        datasets: datasets,
    };
    _g_line_chart_image_base64 = _g_multi_line_chart.toBase64Image(); // PNG base64 string

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

function SelectDeviceSpec003() {
    // 如果沒有傳字串就設為空字串

    // 搜尋條件
    // 條件的內容
    let search_group_cid = document.getElementById("dashboard_device_001-search_group_cid").value;
    let search_value = document.getElementById("dashboard_device_001-space_num").value;
    const b_time = document.getElementById("dashboard_device_001-begin_time");
    const e_time = document.getElementById("dashboard_device_001-end_time");

    // 開啟loading dialog
    VisibleLoaderElement(true);

    setTimeout(function () {
        CsRequestDashboardSelectDeviceSpec(search_group_cid, b_time.value, e_time.value, search_value, function (ok, result) {
            // 關閉loading dialog
            VisibleLoaderElement(false);

            if (!ok) {
                alert("request error");
                return;
            }

            let json_object = JSON.parse(result); // 解析 JSON

            //   loadingBox.hide()
            //loadingWater.style.visibility = 'hidden'
            if (show_errno(json_object.errno) != "") {
                return;
            }

            let json_tablesi = json_object.records;
            let field_count = Object.keys(json_tablesi).length;
            if (field_count == 0) {
            } else {
                let activated_count = GetStateCount(json_tablesi, "1");
                let revoked_count = GetStateCount(json_tablesi, "-1");
                let target_time;
                if (json_object.target_time != undefined) {
                    target_time = json_object.target_time;
                } else {
                    target_time = e_time.value;
                }

                let target_count = "0";
                if (json_object.target_count != undefined) {
                    target_count = json_object.target_count;
                }

                // 預測達標數量
                let predicted_achievement_count = 0;
                {
                    const sb_time = new Date(b_time.value);
                    const se_time = new Date(e_time.value);
                    const st_time = new Date(target_time.split(" ")[0]);

                    // 計算毫秒差距
                    const diffTime01 = Math.abs(se_time - sb_time) / 1000;
                    const diffTime02 = Math.abs(st_time - sb_time) / 1000;

                    let a = Number(diffTime01);
                    let b = Number(activated_count);
                    let c = Number(diffTime02);

                    // 每出售一台 要花多久
                    let d01 = diffTime01 / b;
                    // 剩下多少時間
                    let d02 = diffTime02 - diffTime01;
                    // 可以賣出多少台
                    let d03 = Math.ceil(d02 / d01);
                    // 預計可以賣出多少台
                    predicted_achievement_count = activated_count + d03;
                    //predicted_achievement_count = Math.round((b * c / a) * 100) / 100;

                    let e = 5;
                }

                // 已啟用百分比
                {
                    let element = document.getElementById("dashboard_device_001-activation_rate");
                    let percent = 0;
                    if (target_count != "0") {
                        percent = Number(activated_count) / Number(target_count);
                    }
                    element.innerHTML = (percent * 100).toFixed(2) + "%";
                    //percent.toFixed(2) * 100 + "%";
                }

                // 預測達標百分比
                {
                    let element = document.getElementById("dashboard_device_001-predicted_achievement_rate");
                    let percent = 0;
                    if (target_count != "0") {
                        percent = Number(predicted_achievement_count) / Number(target_count);
                    }
                    element.innerHTML = (percent * 100).toFixed(2) + "%";
                    //element.innerHTML = percent.toFixed(2) * 100 + "%";
                }

                // 啟用數量
                {
                    let element = document.getElementById("dashboard_device_001-activated_count");
                    element.innerHTML = activated_count;
                }

                // 撤銷數量
                {
                    let element = document.getElementById("dashboard_device_001-revoked_count");
                    element.innerHTML = revoked_count;
                }

                // 預測達標數量
                {
                    let element = document.getElementById("dashboard_device_001-predicted_achievement_count");
                    element.innerHTML = Math.ceil(predicted_achievement_count);
                }

                // 目標日期
                {
                    let input = document.getElementById("dashboard_device_001-target_time");
                    input.value = target_time.split(" ")[0];
                }

                // 目標數量
                {
                    let input = document.getElementById("dashboard_device_001-target_count");
                    input.value = target_count;
                }

                // 顯示雷達圖
                {
                    RenderDevice003PieChart(document.getElementById("dashboard_device_001-pie_chart"), json_tablesi);
                }

                // 顯示折線圖
                {
                    RenderDevice003LineChart(document.getElementById("dashboard_device_001-line_chart"), json_tablesi);
                }

                // 顯示資料
                {
                    let tableii = TablesiToTableii(key_dashboard_device_list_info, json_tablesi);
                    //element_table.innerHTML = "";
                    var element_table = document.getElementById("dashboard_device_001-list_information");
                    create_Json2DArrayToTable(element_table, tableii);
                    {
                        let tbody = element_table.querySelectorAll("tbody");
                        if (tbody) {
                            console.log(tbody instanceof HTMLElement); // 應該輸出 true
                            let rows = tbody[0].querySelectorAll("tr"); // 只選 tbody 內的 tr
                            rows.forEach((row) => {
                                // 在最前插入一個空白
                                let newCell = document.createElement("td");
                                newCell.innerHTML = "";
                                row.insertBefore(newCell, row.cells[0]); // 插入到最前面
                            });
                        }
                    }
                }
            }
        });
    }, 500);
}

// 儲存各樣目標數據
function UpdateDeviceSpec003() {
    let search_group_cid = document.getElementById("dashboard_device_001-search_group_cid").value;
    const t_time = document.getElementById("dashboard_device_001-target_time");
    const t_count = document.getElementById("dashboard_device_001-target_count");

    // 開啟loading dialog
    VisibleLoaderElement(true);

    setTimeout(function () {
        CsRequestDashboardUpdateDeviceSpec(search_group_cid, t_time.value, t_count.value, function (ok, result) {
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
        });
    });
}

function ExportDeviceSpec003() {
    if (_g_line_chart_data == null) {
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("折線圖資料");

    // 寫入標題列
    const headerRow = ["月份", ..._g_line_chart_data.datasets.map((ds) => ds.label)];
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
    console.log("Home DOMContentLoaded");

    // 顯示放最後 等都完成後
    var app = document.getElementById("app");
    app.style.visibility = "visible";

    //_________________________________________________________________________________

    // 動作
    {
        // 搜尋
        {
            let button = document.getElementById("dashboard_device_001-button-search");
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

    // 預設組織帳號
    {
        let group_cid;
        {
            const hash = window.location.hash; // "#tab=2"
            const params = new URLSearchParams(hash.substring(1)); // 去掉 "#" 再解析
            group_cid = params.get("group_cid"); // 取得 "2"
            console.log(group_cid); // → "2"
        }
        document.getElementById("dashboard_device_001-search_group_cid").value = group_cid;
    }

    // 預設為今年的第一天
    {
        const NDate = new Date();
        {
            document.getElementById("dashboard_device_001-today_time").innerHTML = NDate.toLocaleDateString("sv-SE"); //NDate.toISOString().slice(0, 10);
        }
        //const BDate = DateAdd('m', -6, new Date());
        const BDate = new Date(NDate.getFullYear(), 0, 1);
        const EDate = NDate;
        {
            let b_time = document.getElementById("dashboard_device_001-begin_time");
            let e_time = document.getElementById("dashboard_device_001-end_time");
            b_time.value = BDate.toLocaleDateString("sv-SE"); //BDate.toISOString().slice(0, 10);
            e_time.value = EDate.toLocaleDateString("sv-SE");
        }

        {
            const yyyy = NDate.getFullYear();
            const mm = String(NDate.getMonth() + 1).padStart(2, "0"); // 月份從 0 開始，所以要 +1
            const dd = String(NDate.getDate()).padStart(2, "0");
            const formattedDate = `${yyyy}-${mm}-${dd}`;

            let today_time = document.getElementById("dashboard_device_001-today_time");
            today_time.innerHTML = formattedDate;
        }
    }

    GotoPageSelectDeviceSpec();
});
