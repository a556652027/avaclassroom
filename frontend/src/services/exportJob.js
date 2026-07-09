//  非同步匯出任務 (原 device / license 頁的 downloadAll 流程：進度遮罩 + 2 秒輪詢 + 5 次重試 + Blob 下載)
import { apiCall } from '@/core/util'

// 動態建立進度條 UI (原邏輯以 DOM 建立，防範 XSS)
function createProgressOverlay(overlayId) {
  const oldOverlay = document.getElementById(overlayId)
  if (oldOverlay) oldOverlay.remove()

  const overlay = document.createElement('div')
  overlay.id = overlayId
  overlay.style.cssText =
    'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:10000; display:flex; justify-content:center; align-items:center;'
  const box = document.createElement('div')
  box.style.cssText =
    'background:white; padding:30px; border-radius:12px; width:400px; text-align:center; box-shadow:0 4px 20px rgba(0,0,0,0.2); font-family: sans-serif;'
  box.innerHTML = `
      <h3 style="margin:0 0 10px 0; color:#214f7c; font-size:18px;">資料匯出中</h3>
      <p class="export-progress-text" style="color:#666; font-size:14px; margin-bottom:15px;">正在準備任務...</p>
      <div style="width:100%; background:#e5e8ea; border-radius:8px; height:16px; overflow:hidden;">
          <div class="export-progress-bar" style="width:0%; height:100%; background:#ee963f; transition:width 0.3s ease;"></div>
      </div>
  `
  overlay.appendChild(box)
  document.body.appendChild(overlay)

  return {
    overlay,
    update(text, percent) {
      const txtEl = overlay.querySelector('.export-progress-text')
      const barEl = overlay.querySelector('.export-progress-bar')
      if (txtEl) txtEl.textContent = text
      if (barEl) barEl.style.width = percent + '%'
    },
    remove() {
      if (document.body.contains(overlay)) document.body.removeChild(overlay)
    },
  }
}

/**
 * 執行非同步匯出任務並下載 CSV
 * @param {object} opts
 *  - overlayId: 進度遮罩 DOM id
 *  - startExport: () => Promise<json> 發起匯出 (回傳含 job_id)
 *  - queryStatus: (jobId, abortController) => Promise<json> 查詢進度
 *  - download: (jobId, cb(err, blob)) => void 下載檔案
 *  - fileNamePrefix: 檔名前綴
 *  - onError: (msg) => void
 */
export function runExportJob(opts) {
  const progress = createProgressOverlay(opts.overlayId)
  const exportController = new AbortController()

  // 視圖切換時遮罩自毀
  const onPageChange = () => {
    exportController.abort()
    progress.remove()
  }
  window.addEventListener('spa:page-change-before', onPageChange, { once: true })

  const cleanup = () => {
    window.removeEventListener('spa:page-change-before', onPageChange)
  }

  ;(async () => {
    try {
      // 1. 發起匯出請求
      const json_object = await opts.startExport(exportController)
      const jobId = json_object.job_id
      if (!jobId) throw new Error('無法取得 Job ID')

      // 2. 開始輪詢進度 (2 秒間隔)
      const pollInterval = 2000
      let failCount = 0
      const pollStatus = async () => {
        if (exportController.signal.aborted) return // 視圖切換，直接終止輪詢
        try {
          const statusRes = await opts.queryStatus(jobId, exportController)
          failCount = 0

          if (statusRes.status === 'processing') {
            const total = parseInt(statusRes.total) || 0
            const processed = parseInt(statusRes.processed) || 0
            const percent = total === 0 ? 0 : Math.round((processed / total) * 100)
            progress.update(
              `處理中... ${processed.toLocaleString()} / ${total.toLocaleString()} 筆`,
              percent,
            )
            setTimeout(pollStatus, pollInterval)
          } else if (statusRes.status === 'completed') {
            progress.update('匯出完成！正在下載檔案...', 100)

            opts.download(jobId, (err, downloadedBlob) => {
              progress.remove()
              cleanup()
              if (err || !downloadedBlob || downloadedBlob.size === 0) {
                alert('檔案下載失敗，無法從伺服器取得資料')
                return
              }
              const blob = new Blob([downloadedBlob], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `${opts.fileNamePrefix}_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`
              a.click()
              URL.revokeObjectURL(url)
            })
          } else {
            throw new Error('匯出狀態異常')
          }
        } catch (e) {
          failCount++
          if (failCount < 5) {
            console.warn(`輪詢進度失敗，進行重試 (${failCount}/5)...`)
            setTimeout(pollStatus, pollInterval)
          } else {
            progress.remove()
            cleanup()
            console.error(e)
            alert('查詢匯出進度失敗，已達最大重試次數')
          }
        }
      }

      setTimeout(pollStatus, 1000)
    } catch (e) {
      progress.remove()
      cleanup()
      if (opts.onError) opts.onError(e)
    }
  })()
}
