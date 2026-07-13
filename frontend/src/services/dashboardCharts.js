//  Dashboard 圖表繪製 (原 views/app.view.dashboard.js 的 Render* 函式，繪製邏輯與配色不變)
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { getLocalData } from '@/locales'

// 匯出用的折線圖資料快取 (原 _g_line_chart_data / _g_line_chart_image_base64)
export const lineChartExport = {
  data: null,
  imageBase64: null,
}

function normalizeDashboardData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      recordState: [],
      spec04: [],
      deviceCount: [],
      activeTime: [],
    }
  }

  const readArray = (key) => {
    const value = data[key]
    return Array.isArray(value) ? value : []
  }

  return {
    recordState: readArray('record_state'),
    spec04: readArray('spec04'),
    deviceCount: readArray('device_count'),
    activeTime: readArray('active_time'),
  }
}

function hasRenderableChartData(data) {
  const normalized = normalizeDashboardData(data)
  return normalized.recordState.length > 0 || normalized.deviceCount.length > 0 || normalized.spec04.length > 0 || normalized.activeTime.length > 0
}

// 算出 啟動/撤銷 數量 (原 GetStateCount)
export function GetStateCount(data, state) {
  const normalized = normalizeDashboardData(data)
  let di = 0
  let total_count = 0
  for (let value of normalized.recordState) {
    if (value == state) {
      total_count += Number(normalized.deviceCount[di] || 0)
    }
    di++
  }
  return total_count
}

function destroyChartOn(canvas) {
  const existingChart = Chart.getChart(canvas)
  if (existingChart) existingChart.destroy()
}

function hideNoDataMsg(canvas) {
  if (canvas && canvas.parentElement) {
    const msgDiv = canvas.parentElement.querySelector('.chart-no-data-msg')
    if (msgDiv) msgDiv.style.display = 'none'
  }
}

// 顯示沒有資料的訊息 (原 showNoDataMessage 的圖表部分)
export function showNoDataOnCharts(canvases) {
  canvases.forEach((canvas) => {
    if (!canvas) return
    destroyChartOn(canvas)
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 改用 HTML div 來顯示文字，避免 canvas 解析度導致的文字模糊與拉伸變形
    const parent = canvas.parentElement
    if (parent) {
      parent.style.position = 'relative'
      let msgDiv = parent.querySelector('.chart-no-data-msg')
      if (!msgDiv) {
        msgDiv = document.createElement('div')
        msgDiv.className = 'chart-no-data-msg'
        msgDiv.style.cssText =
          'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #898c94; font-size: 16px; pointer-events: none;'
        parent.appendChild(msgDiv)
      }
      msgDiv.textContent = getLocalData('dashboard.no_data') || '目前沒有資料'
      msgDiv.style.display = 'block'
    }
  })
  lineChartExport.data = null
}

// 銷毀所有指定 canvas 上的圖表 (原 spa:page-change-before 的清理)
export function destroyCharts(canvases) {
  canvases.forEach((canvas) => {
    if (canvas) destroyChartOn(canvas)
  })
  lineChartExport.data = null
}

// 畫出設備條件0003圓餅圖 (原 RenderDevice003PieChart)
export function RenderDevice003PieChart(canvas, data) {
  const normalized = normalizeDashboardData(data)
  if (!canvas || !hasRenderableChartData(data)) {
    showNoDataOnCharts([canvas])
    return
  }

  // 先整理資料
  let labels = []
  let datasets_data = []
  let datasets_background_color = []
  let datasets_border_color = []

  {
    let device_model_count = new Map()
    {
      let di = 0
      for (let value of normalized.recordState) {
        // 原版 Dashboard 圓餅圖僅排除已撤銷狀態 -1，保留 0 或 1 作為平台機型分佈
        if (String(value) !== '-1') {
          let spec_model = normalized.spec04[di]
          let device_count = Number(normalized.deviceCount[di] || 0)

          // 將空字串或空值顯示為 "Other"
          if (!spec_model || spec_model.trim() === '') {
            spec_model = 'Other'
          }

          if (device_model_count.has(spec_model)) {
            device_model_count.set(
              spec_model,
              Number(device_model_count.get(spec_model)) + device_count,
            )
          } else {
            device_model_count.set(spec_model, device_count)
          }
        }
        di++
      }
    }

    // 預定義圓餅圖顏色 - 基於三個主色的漸層配色
    const pieColors = [
      'rgba(146, 191, 255, 1)',
      'rgba(151, 170, 194, 1)',
      'rgba(33, 79, 124, 1)',
      'rgba(139, 181, 235, 1)',
      'rgba(149, 180, 224, 1)',
      'rgba(92, 125, 159, 1)',
      'rgba(142, 185, 245, 1)',
      'rgba(156, 175, 204, 1)',
      'rgba(43, 89, 134, 1)',
      'rgba(135, 176, 225, 1)',
      'rgba(67, 104, 149, 1)',
      'rgba(148, 188, 235, 1)',
    ]

    let colorIndex = 0
    for (let [key, value] of device_model_count) {
      labels.push(key)
      datasets_data.push(value)
      datasets_background_color.push(pieColors[colorIndex % pieColors.length])
      datasets_border_color.push('#ffffff')
      colorIndex++
    }
  }

  if (!datasets_data.length) {
    showNoDataOnCharts([canvas])
    return
  }

  Chart.register(ChartDataLabels)
  hideNoDataMsg(canvas)

  const ctx = canvas.getContext('2d')
  destroyChartOn(canvas)

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [
        {
          label: getLocalData('dashboard.device_spec_distribution'),
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
      // 縮短進場動畫時間，關閉 Hover 漸變重繪，消除手機版滑動卡頓
      animation: { duration: 400 },
      transitions: { active: { animation: { duration: 0 } } },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: window.innerWidth < 850 ? 'bottom' : 'right', // 手機版將圖例移至下方，防擠壓
          align: 'left',
          labels: {
            boxWidth: 20,
            padding: 15,
            generateLabels: function (chart) {
              const data = chart.data
              if (data.labels.length && data.datasets.length) {
                const dataset = data.datasets[0]
                const total = dataset.data.reduce((acc, val) => acc + Number(val), 0)

                return data.labels.map((label, index) => {
                  const value = dataset.data[index]
                  const percentage = ((value / total) * 100).toFixed(1)

                  return {
                    text: `${label} (${percentage}%)`,
                    fillStyle: dataset.backgroundColor[index],
                    strokeStyle: dataset.borderColor[index],
                    lineWidth: dataset.borderWidth,
                    hidden:
                      isNaN(dataset.data[index]) ||
                      chart.getDatasetMeta(0).data[index].hidden,
                    index: index,
                  }
                })
              }
              return []
            },
          },
        },
        title: {
          display: true,
          text: getLocalData('dashboard.chart_platform_ratio'),
          padding: { top: 0, bottom: 20 },
          font: { size: 18 },
        },
        datalabels: { display: false },
      },
    },
  })
}

// 畫出設備條件0003長條圖 (原 RenderDevice003BarChart)
export function RenderDevice003BarChart(canvas, data) {
  const normalized = normalizeDashboardData(data)
  if (!canvas || !hasRenderableChartData(data)) {
    showNoDataOnCharts([canvas])
    return
  }

  // 過濾並整理資料
  const filteredData = normalized.activeTime
    .map((time, index) => ({
      time,
      count: Number(normalized.deviceCount[index] || 0),
      spec: normalized.spec04[index],
      state: normalized.recordState[index],
    }))
    .filter((item) => String(item.state) === '1')

  if (filteredData.length === 0) {
    showNoDataOnCharts([canvas])
    return
  }

  const allMonths = [...new Set(filteredData.map((d) => d.time))].sort()

  const totalData = {}
  allMonths.forEach((month) => {
    totalData[month] = 0
  })
  filteredData.forEach(({ time, count }) => {
    totalData[time] = (totalData[time] || 0) + count
  })

  const monthlyData = allMonths.map((month) => totalData[month] || 0)

  const datasets = [
    {
      label: getLocalData('dashboard.chart_monthly_activation'),
      data: monthlyData,
      backgroundColor: 'rgba(151, 170, 194, 1)',
      borderWidth: 0,
      borderRadius: 8,
      borderSkipped: false,
      normalized: true,
    },
  ]

  const maxYValue = Math.ceil(Math.max(...monthlyData) * 1.1)

  hideNoDataMsg(canvas)
  const ctx = canvas.getContext('2d')
  destroyChartOn(canvas)

  new Chart(ctx, {
    type: 'bar',
    data: { labels: allMonths, datasets: datasets },
    options: {
      animation: { duration: 400 },
      transitions: { active: { animation: { duration: 0 } } },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: maxYValue },
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: getLocalData('dashboard.chart_total_activation'),
          font: { size: 16 },
          align: 'start',
          position: 'top',
          padding: { top: 20, bottom: 20 },
        },
        datalabels: { display: false },
      },
      barPercentage: 0.4,
      categoryPercentage: 0.6,
    },
  })
}

// 畫出設備條件0003折線圖 (原 RenderDevice003LineChart，累積計算)
export function RenderDevice003LineChart(canvas, data, isExportSource) {
  const normalized = normalizeDashboardData(data)
  if (!canvas || !hasRenderableChartData(data)) {
    showNoDataOnCharts([canvas])
    return
  }

  // 過濾並整理資料
  const filteredData = normalized.activeTime
    .map((time, index) => ({
      time,
      count: Number(normalized.deviceCount[index] || 0),
      spec: normalized.spec04[index],
      state: normalized.recordState[index],
    }))
    .filter((item) => String(item.state) === '1')

  if (filteredData.length === 0) {
    showNoDataOnCharts([canvas])
    return
  }

  const allMonths = [...new Set(filteredData.map((d) => d.time))].sort()

  // 分組 spec04 並建立每個 spec04 對應的月份數據
  const groupedData = {}
  filteredData.forEach(({ time, count, spec }) => {
    if (!groupedData[spec]) groupedData[spec] = {}
    groupedData[spec][time] = (groupedData[spec][time] || 0) + count
  })

  // 為每個 spec04 補全月份，並進行累積計算
  Object.keys(groupedData).forEach((spec) => {
    let cumulative = 0
    allMonths.forEach((month) => {
      if (!groupedData[spec][month]) {
        groupedData[spec][month] = 0
      }
      cumulative += groupedData[spec][month]
      groupedData[spec][month] = cumulative
    })
  })

  // 基於指定配色的多色系
  const lineColors = [
    { line: 'rgba(151, 170, 194, 1)', fill: 'rgba(151, 170, 194, 0.1)' },
    { line: 'rgba(146, 191, 255, 1)', fill: 'rgba(146, 191, 255, 0.1)' },
    { line: 'rgba(238, 150, 63, 1)', fill: 'rgba(238, 150, 63, 0.1)' },
    { line: 'rgba(151, 170, 194, 1)', fill: 'rgba(151, 170, 194, 0.1)' },
    { line: 'rgba(165, 185, 210, 1)', fill: 'rgba(165, 185, 210, 0.1)' },
    { line: 'rgba(160, 206, 255, 1)', fill: 'rgba(160, 206, 255, 0.1)' },
    { line: 'rgba(245, 171, 93, 1)', fill: 'rgba(245, 171, 93, 0.1)' },
    { line: 'rgba(137, 155, 179, 1)', fill: 'rgba(137, 155, 179, 0.1)' },
    { line: 'rgba(132, 176, 235, 1)', fill: 'rgba(132, 176, 235, 0.1)' },
    { line: 'rgba(225, 130, 45, 1)', fill: 'rgba(225, 130, 45, 0.1)' },
    { line: 'rgba(179, 195, 220, 1)', fill: 'rgba(179, 195, 220, 0.1)' },
    { line: 'rgba(251, 185, 115, 1)', fill: 'rgba(251, 185, 115, 0.1)' },
  ]

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
    normalized: true,
  }))

  const maxYValue = Math.ceil(Math.max(...datasets.flatMap((ds) => ds.data)) * 1.5)

  hideNoDataMsg(canvas)
  const ctx = canvas.getContext('2d')
  destroyChartOn(canvas)

  const chart = new Chart(ctx, {
    type: 'line',
    data: { labels: allMonths, datasets: datasets },
    options: {
      animation: { duration: 400 },
      transitions: { active: { animation: { duration: 0 } } },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: maxYValue },
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 6,
            boxHeight: 6,
            padding: 6,
            textAlign: 'right',
          },
        },
        title: {
          display: true,
          text: getLocalData('dashboard.chart_cumulative_activation'),
          font: { size: 16 },
          align: 'center',
          position: 'top',
          padding: { bottom: 20 },
        },
        datalabels: { display: false },
      },
    },
  })

  // 匯出來源圖表：保留資料與圖片供 Excel 匯出 (原 _g_line_chart_data)
  if (isExportSource) {
    lineChartExport.data = { labels: allMonths, datasets: datasets }
    lineChartExport.imageBase64 = chart.toBase64Image()
  }
}
