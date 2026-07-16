//  全站統一 Toast 通知 — 取代原生 alert() 與各頁自製的 showToast
//  純 DOM 實作 (不依賴 Vue)，views/api/core 任何模組都可直接呼叫
//  視覺語言對齊 LoginView 的右上角 Toast 與 styles/variables.css Token
//
//  用法:
//    notify('已儲存')                    // 依訊息語氣自動判斷類型
//    notify.success('匯出完成')
//    notify.error('連線失敗', 6000)      // 自訂顯示毫秒數
//    installAlertBridge()                // main.js 呼叫一次，讓原生 alert() 全走 Toast

const STYLE_ID = 'app-notify-style'
const REGION_ID = 'app-notify-region'
const MAX_STACK = 5

// 各類型圖示 (線條風格與 LoginView Toast 一致，吃 currentColor)
const ICONS = {
  success:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
  error:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
  warning:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  info:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
}

const CSS = `
#${REGION_ID} {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  pointer-events: none;
}
.notify-toast {
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 260px;
  max-width: 400px;
  padding: 13px 16px 15px;
  background: var(--color-bg-card, #ffffff);
  border: 1px solid #e5eaf1;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(30, 60, 90, 0.16);
  font-family: var(--font-base, 'Inter', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif);
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-primary, #1f2d3d);
  cursor: pointer;
  animation: notify-in 0.35s cubic-bezier(0.21, 1.02, 0.55, 1) both;
  transition:
    opacity 0.22s ease,
    transform 0.22s ease,
    height 0.22s ease,
    padding 0.22s ease,
    margin 0.22s ease,
    border-color 0.22s ease;
}
.notify-toast.notify-leave {
  opacity: 0;
  transform: translateX(30%);
  border-color: transparent;
}
.notify-success { --notify-accent: var(--color-success, #2f9e63); }
.notify-error   { --notify-accent: var(--color-danger, #d64545); }
.notify-warning { --notify-accent: var(--color-warning, #e0a23c); }
.notify-info    { --notify-accent: var(--color-primary-light, #3a76c2); }
.notify-toast .notify-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--notify-accent);
  animation: notify-icon-pop 0.45s 0.12s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.notify-toast .notify-icon svg {
  display: block;
  width: 100%;
  height: 100%;
}
.notify-toast .notify-text {
  white-space: pre-line;
  word-break: break-word;
}
.notify-toast .notify-progress {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  width: 100%;
  background: var(--notify-accent);
  opacity: 0.5;
  border-radius: 0 3px 3px 0;
  transform-origin: left;
  animation-name: notify-countdown;
  animation-timing-function: linear;
  animation-fill-mode: both;
}
/* 滑鼠移入時暫停倒數 (JS 計時器同步暫停) */
.notify-toast:hover .notify-progress {
  animation-play-state: paused;
}
@keyframes notify-in {
  from { opacity: 0; transform: translateX(110%) scale(0.96); }
  60%  { opacity: 1; transform: translateX(-6px) scale(1); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes notify-icon-pop {
  0%   { transform: scale(0); }
  70%  { transform: scale(1.25); }
  100% { transform: scale(1); }
}
@keyframes notify-countdown {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}
@media (max-width: 640px) {
  #${REGION_ID} {
    top: 16px;
    left: 16px;
    right: 16px;
    align-items: stretch;
  }
  .notify-toast {
    min-width: 0;
    max-width: none;
  }
}
`

function ensureRegion() {
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = CSS
    document.head.appendChild(style)
  }
  let region = document.getElementById(REGION_ID)
  if (!region) {
    region = document.createElement('div')
    region.id = REGION_ID
    region.setAttribute('aria-live', 'polite')
    document.body.appendChild(region)
  }
  return region
}

//  依訊息語氣推斷類型 (橋接原生 alert 時無法取得語意，靠關鍵字判斷)
function inferType(text) {
  const lower = text.toLowerCase()
  // 表單/操作提示: 「請選擇...」「必填」「不符」等
  if (/請(先|選擇|輸入|完整)|必填|不符|不能|必須|介於/.test(text)) return 'warning'
  // 判斷錯誤前先剔除「失敗 0 筆」這類統計字樣，避免全數成功卻標成錯誤
  const scrubbed = text.replace(/失敗\s*0\s*筆?/g, '')
  const scrubbedLower = lower.replace(/failed:?\s*0/g, '')
  if (
    /失敗|錯誤|無法|逾時|過期|權限不足|找不到/.test(scrubbed) ||
    /error|fail|expired|invalid|denied|deny|unauthorized/.test(scrubbedLower)
  ) {
    return 'error'
  }
  if (/成功|已完成|已啟用|已停用|已新增|寄送|已建立|重建/.test(text) || /success|completed|sent|welcome/.test(lower)) {
    return 'success'
  }
  return 'info'
}

function dismiss(toast) {
  if (toast.dataset.leaving) return
  toast.dataset.leaving = '1'
  // 固定當前高度後收合，讓下方的通知平滑上移
  toast.style.height = toast.offsetHeight + 'px'
  requestAnimationFrame(() => {
    toast.classList.add('notify-leave')
    toast.style.height = '0px'
    toast.style.paddingTop = '0px'
    toast.style.paddingBottom = '0px'
  })
  setTimeout(() => toast.remove(), 260)
}

export function notify(message, type, duration) {
  const text = message == null ? '' : String(message)
  if (!text) return
  const kind = ICONS[type] ? type : inferType(text)
  // 錯誤訊息預設停留久一點，讓使用者來得及閱讀
  const ms = Number(duration) > 0 ? Number(duration) : kind === 'error' ? 4500 : 3000

  const region = ensureRegion()

  // 疊放超過上限時，先收掉最舊的一則
  const active = region.querySelectorAll('.notify-toast:not([data-leaving])')
  if (active.length >= MAX_STACK) dismiss(active[0])

  const toast = document.createElement('div')
  toast.className = `notify-toast notify-${kind}`
  toast.setAttribute('role', 'status')

  const icon = document.createElement('span')
  icon.className = 'notify-icon'
  icon.innerHTML = ICONS[kind]

  const textEl = document.createElement('span')
  textEl.className = 'notify-text'
  textEl.textContent = text

  const progress = document.createElement('span')
  progress.className = 'notify-progress'
  progress.style.animationDuration = ms + 'ms'

  toast.append(icon, textEl, progress)
  region.appendChild(toast)

  // 自動消失計時；hover 暫停、移開續倒 (與進度條動畫同步)
  let remaining = ms
  let startAt = Date.now()
  let timer = setTimeout(() => dismiss(toast), remaining)
  toast.addEventListener('mouseenter', () => {
    clearTimeout(timer)
    remaining -= Date.now() - startAt
  })
  toast.addEventListener('mouseleave', () => {
    startAt = Date.now()
    timer = setTimeout(() => dismiss(toast), Math.max(remaining, 600))
  })
  toast.addEventListener('click', () => {
    clearTimeout(timer)
    dismiss(toast)
  })
}

notify.success = (message, duration) => notify(message, 'success', duration)
notify.error = (message, duration) => notify(message, 'error', duration)
notify.warning = (message, duration) => notify(message, 'warning', duration)
notify.info = (message, duration) => notify(message, 'info', duration)

//  將原生 alert() 全面導向 Toast (main.js 啟動時呼叫一次)
//  confirm() 需要阻塞式的是/否回傳值，不在此橋接範圍
export function installAlertBridge() {
  if (window.__nativeAlert) return
  window.__nativeAlert = window.alert.bind(window)
  window.alert = (message) => notify(message)
}
