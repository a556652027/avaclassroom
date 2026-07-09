//  通用訊息視窗 (原 www/scripts/lib/lib.html.msgbox.js 原封搬移，純 DOM、與框架無關)
export function messageBox(text, caption, buttons, defaultClick, afterClose) {
  console.log('messageBox (Custom): ' + text)

  // 1. 建立遮罩
  var overlay = document.createElement('div')
  overlay.className = 'custom-msgbox-overlay'
  overlay.style.cssText =
    'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:99999; display:flex; align-items:center; justify-content:center; font-family: "Inter", sans-serif;'

  // 2. 建立視窗
  var modal = document.createElement('div')
  modal.className = 'custom-msgbox-modal'
  modal.style.cssText =
    'background:white; border-radius:12px; min-width:320px; max-width:90%; box-shadow:0 10px 25px rgba(0,0,0,0.2); overflow:hidden; display:flex; flex-direction:column; animation: msgboxFadeIn 0.2s ease-out;'

  // 加入動畫樣式
  if (!document.getElementById('msgbox-style')) {
    var style = document.createElement('style')
    style.id = 'msgbox-style'
    style.innerHTML =
      '@keyframes msgboxFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }'
    document.head.appendChild(style)
  }

  // 3. 標題
  if (caption) {
    var header = document.createElement('div')
    header.style.cssText =
      'padding:16px 20px; background:#f8fafc; border-bottom:1px solid #e2e8f0; font-weight:600; color:#1e293b; font-size:16px;'
    header.textContent = caption
    modal.appendChild(header)
  }

  // 4. 內容
  var content = document.createElement('div')
  content.style.cssText =
    'padding:24px 20px; color:#475569; font-size:15px; line-height:1.6; word-break: break-word;'
  content.textContent = text // 使用 textContent 防止 XSS
  modal.appendChild(content)

  // 5. 按鈕區
  var footer = document.createElement('div')
  footer.style.cssText =
    'padding:16px 20px; display:flex; justify-content:flex-end; gap:12px; border-top:1px solid #e2e8f0; background:white;'

  // 處理按鈕邏輯
  var btnDefs = []

  if (!buttons) {
    // 預設按鈕
    btnDefs.push({ text: 'OK', click: defaultClick, primary: true })
  } else if (typeof buttons === 'string') {
    btnDefs.push({ text: buttons, click: defaultClick, primary: true })
  } else if (Array.isArray(buttons)) {
    buttons.forEach(function (btnText, index) {
      // 假設最後一個是主要按鈕
      btnDefs.push({
        text: btnText,
        click: defaultClick,
        primary: index === buttons.length - 1,
      })
    })
  } else if (typeof buttons === 'object') {
    var keys = Object.keys(buttons)
    keys.forEach(function (key) {
      var val = buttons[key]
      var clickFunc =
        typeof val === 'function' ? val : val.click || defaultClick
      // 簡單判斷：如果是 "OK", "Yes", "Confirm" 視為主要按鈕
      var isPrimary = /ok|yes|confirm|確定|確認/i.test(key)
      btnDefs.push({ text: key, click: clickFunc, primary: isPrimary })
    })
  }

  btnDefs.forEach(function (def) {
    var btn = document.createElement('button')
    btn.textContent = def.text

    if (def.primary) {
      btn.style.cssText =
        'padding:8px 20px; border:none; border-radius:6px; background:#214F7C; color:white; cursor:pointer; font-size:14px; font-weight:500; transition: background 0.2s;'
      btn.onmouseover = function () {
        this.style.background = '#1a3e61'
      }
      btn.onmouseout = function () {
        this.style.background = '#214F7C'
      }
    } else {
      btn.style.cssText =
        'padding:8px 20px; border:1px solid #cbd5e1; border-radius:6px; background:white; color:#475569; cursor:pointer; font-size:14px; font-weight:500; transition: background 0.2s;'
      btn.onmouseover = function () {
        this.style.background = '#f1f5f9'
      }
      btn.onmouseout = function () {
        this.style.background = 'white'
      }
    }

    btn.onclick = function () {
      if (def.click) {
        def.click()
      }
      closeMsgBox()
    }
    footer.appendChild(btn)
  })

  modal.appendChild(footer)
  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  function closeMsgBox() {
    if (document.body.contains(overlay)) {
      document.body.removeChild(overlay)
    }
    if (typeof afterClose === 'function') {
      afterClose()
    }
  }
}
