//  網路底層 (原 www/scripts/lib/lib.proc.net.js 原封搬移)
//  邏輯不變：RequestThrottle 節流、retry/backoff、session 注入、-1001 攔截
import { navigateToLogin } from './navigation'

const request_timeout = 60000

// =============================================================================
// [全域請求節流器] RequestThrottle
// 限制同時打到後端的 API 請求數，防止並發過多造成後端 502 Connection reset
// 設計：Queue-based concurrency limiter，對所有呼叫端透明，不需修改 view/module
// =============================================================================
var RequestThrottle = (function () {
  var _maxConcurrent = 1 // 後端同時只處理 1 條請求，超過的進佇列等待
  var _running = 0
  var _queue = []

  function next() {
    if (_running >= _maxConcurrent || _queue.length === 0) return
    var task = _queue.shift()
    _running++
    task().finally(function () {
      _running--
      next()
    })
  }

  return {
    // 將 fn (必須回傳 Promise) 放入佇列，回傳一個 Promise 讓呼叫端 await
    run: function (fn) {
      return new Promise(function (resolve, reject) {
        _queue.push(function () {
          return fn().then(resolve, reject)
        })
        next()
      })
    },
    // 取得目前狀態，供 debug 用
    status: function () {
      return { running: _running, queued: _queue.length }
    },
  }
})()

var Cyberspace = window.Cyberspace || {}
Cyberspace.Client = new (function () {
  // [自動切換環境] 預設為正式機，若偵測到 localhost 則切換為開發機
  var _hostname = 'https://lms.narvitech.com/orbital/'
  var _isLocal = false

  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    _hostname = '/orbital' // 本地開發 API (經 Vite proxy 轉發至 127.0.0.1:8023)
    _isLocal = true
    console.log('🔧 Development Mode: Using Local API -> ' + _hostname)
  }

  var self = this

  this.getSessionToken = function () {
    return window.sessionStorage.getItem('session_token')
  }

  this.getUsername = function () {
    return window.sessionStorage.getItem('member_cid')
  }

  this.getTier = function () {
    return window.sessionStorage.getItem('tier')
  }

  this.getLevelUID = function () {
    return window.sessionStorage.getItem('level_uid')
  }

  this.getGroupCID = function () {
    return window.sessionStorage.getItem('group_cid')
  }

  this.getPermission = function (permissionKey) {
    return window.permissions ? window.permissions[permissionKey] : undefined
  }

  //====================================================
  //
  //====================================================
  this.setSession = async function (
    session_token,
    member_cid,
    tier,
    level_uid,
    group_cid,
  ) {
    if (session_token) {
      window.sessionStorage.setItem('session_token', session_token)
    }

    if (member_cid) {
      window.sessionStorage.setItem('member_cid', member_cid)
    }

    if (tier) {
      window.sessionStorage.setItem('tier', tier)
    }

    if (level_uid) {
      window.sessionStorage.setItem('level_uid', level_uid)
    }

    if (group_cid) {
      window.sessionStorage.setItem('group_cid', group_cid)
    }
  }

  //====================================================
  //
  //====================================================
  this.setPermission = async function (permissions) {
    if (permissions) {
      window.permissions = permissions
    }
  }

  //====================================================
  //
  //====================================================
  this.clsSession = async function () {
    window.sessionStorage.removeItem('session_token')
    window.sessionStorage.removeItem('member_cid')
    window.sessionStorage.removeItem('tier')
    window.sessionStorage.removeItem('level_uid')
    window.sessionStorage.removeItem('group_cid')
  }

  // [新增] 安全 Log：僅在開發環境顯示原始資料，防止正式機資訊暴露
  this.DebugLog = function (message, data) {
    if (_isLocal) {
      if (data) console.log(`[DEBUG] ${message}`, data)
      else console.log(`[DEBUG] ${message}`)
    }
  }

  // [新增] 統一回應處理器，攔截 Session 失效與解析錯誤
  this.handleResponse = function (ok, result, callback) {
    if (!ok) {
      this.DebugLog('Network Error:', result)
      if (callback) callback(false, result)
      return
    }
    try {
      const json = JSON.parse(result)
      this.DebugLog('API Response:', json)
      // 統一攔截 Session 過期 (-1001)
      if (json.errno === -1001) {
        alert(
          window.localeData?.login?.session_expired || '連線逾時，請重新登入。',
        )
        navigateToLogin()
        return
      }
      if (callback) callback(true, result)
    } catch (e) {
      console.error('JSON Parse Error', e)
      if (callback) callback(false, 'Invalid JSON')
    }
  }

  //====================================================
  // 呼叫
  // callback( bool ok?, int status or text)
  // options: { abortController: AbortController }
  //====================================================
  this.SendRequest = async function (act, params, callback, options) {
    // [Phase2.1] 唯讀輕量請求（export 輪詢）bypass 節流佇列，避免阻塞一般操作
    // 這類請求只做 SELECT，不寫入，與主佇列的業務請求不競爭資源
    var _bypass_acts = [
      '/ava_system/license/export_status',
      '/ava_system/license/export_download',
      '/ava_system/device/export_status',
      '/ava_system/device/export_download',
    ]
    var shouldBypass = _bypass_acts.some(function (a) {
      return act.indexOf(a) !== -1
    })
    if (shouldBypass) {
      return self._doSendRequest(act, params, callback, options)
    }
    // 一般請求透過全域 RequestThrottle 排隊，確保同時只有 1 條請求打到後端
    return RequestThrottle.run(() =>
      self._doSendRequest(act, params, callback, options),
    )
  }

  // [內部實作] 實際執行 HTTP 請求（不直接暴露，透過 SendRequest 的 throttle 呼叫）
  this._doSendRequest = async function (act, params, callback, options) {
    const max_retries = 3
    const base_delay = 500
    // [修正] 避免出現雙斜線 (例如 orbital//ava_system)
    const url = (_hostname + act).replace(/([^:]\/)\/+/g, '$1')

    // 插入 session_token
    const session_token = self.getSessionToken()
    if (session_token) {
      params.session_token = session_token
    }

    // 避免 Unicode 混亂與非法字元，強制 normalize
    for (const key in params) {
      if (typeof params[key] === 'string') {
        params[key] = params[key].normalize('NFC')
      }
    }

    // 手動 encode，替代 URLSearchParams，避免隱性錯誤
    function encodeFormData(data) {
      return Object.keys(data)
        .map(
          (key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]),
        )
        .join('&')
    }

    const request_body = encodeFormData(params)
    self.DebugLog(
      '[DEBUG] Request body length (bytes):',
      new TextEncoder().encode(request_body).length,
    )
    self.DebugLog(
      '[DEBUG] Request body (preview):',
      request_body.slice(0, 200) + '...',
    )

    for (let attempt = 0; attempt <= max_retries; attempt++) {
      // 若外部已 abort（換頁），直接放棄不重試
      const externalSignal =
        options && options.abortController && options.abortController.signal
      if (externalSignal && externalSignal.aborted) {
        self.handleResponse(false, { name: 'AbortError' }, callback)
        return
      }

      const controller =
        options && options.abortController
          ? options.abortController
          : new AbortController()
      const timeout = setTimeout(() => {
        controller.abort()
      }, request_timeout)

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: request_body,
          credentials: 'include',
          signal: controller.signal,
        })

        for (let [key, value] of response.headers) {
          self.DebugLog(`[RESPONSE HEADER] ${key}: ${value}`)
        }

        const text = await response.text()
        clearTimeout(timeout)

        if (!response.ok) {
          if (response.status >= 400 && response.status < 500) {
            throw new Error(`HTTP ${response.status}: ${text.substring(0, 200)}`)
          }
          throw new Error(`Server Error ${response.status}`)
        }

        // [新增] 後端 busy 信號 (errno=-1)：解析 JSON 並 throw，觸發 retry 迴圈
        // 此處必須在 handleResponse 之前處理，才能進入下面的 catch → retry
        try {
          const quickJson = JSON.parse(text)
          if (quickJson.errno === -1) {
            const busyErr = new Error('Server Busy')
            busyErr.name = 'ServerBusy'
            throw busyErr
          }
        } catch (parseErr) {
          if (parseErr.name === 'ServerBusy') throw parseErr
          // JSON 解析失敗（非 JSON 回應）→ 忽略，交給 handleResponse 處理
        }

        self.handleResponse(true, text, callback)
        return
      } catch (error) {
        clearTimeout(timeout)
        const is_abort = error.name === 'AbortError'
        const is_4xx = error.message && error.message.startsWith('HTTP 4')
        const is_busy = error.name === 'ServerBusy'

        if (attempt === max_retries || is_abort || is_4xx) {
          if (is_abort) console.error('Request timed out')
          else if (is_busy)
            console.warn('[SendRequest] Server busy after all retries.')
          else console.error('Fetch error:', error)

          // busy 耗盡 retry：回傳 ok=false，讓上層顯示錯誤
          self.handleResponse(
            false,
            is_busy
              ? new Error('Server temporarily busy, please retry.')
              : error,
            callback,
          )
          throw error
        }

        const delay = base_delay * Math.pow(2, attempt)
        console.warn(
          `[SendRequest] Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`,
          error.message,
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  // 用一個物件 data，裡面既可放一般參數，也可放 File/Blob/FileList/Array
  this.SendFormDataWithFiles = async function (act, data, callback, options) {
    const max_retries = 3
    const base_delay = 500

    // [修正] 避免出現雙斜線
    const url = (_hostname + act).replace(/([^:]\/)\/+/g, '$1')

    const formData = new FormData()

    // 不改動呼叫端的 data，這裡單獨 append session_token
    const session_token = self.getSessionToken && self.getSessionToken()
    if (session_token) formData.append('session_token', session_token)

    // 工具：判斷型別
    const isFile = (v) => typeof File !== 'undefined' && v instanceof File
    const isBlob = (v) => typeof Blob !== 'undefined' && v instanceof Blob
    const isFileList = (v) =>
      typeof FileList !== 'undefined' && v instanceof FileList

    // 工具：安全 append（支援 Array / FileList）
    function appendField(key, val) {
      if (val == null) return // 跳過 null/undefined

      // 多值：Array 或 FileList → 重複同名欄位 append
      if (Array.isArray(val) || isFileList(val)) {
        Array.from(val).forEach((item) => appendField(key, item))
        return
      }

      // 檔案：File / Blob
      if (isFile(val) || isBlob(val)) {
        formData.append(key, val, val.name || key)
        return
      }

      // 物件：轉成 JSON（避免 [object Object]）
      if (typeof val === 'object') {
        formData.append(key, JSON.stringify(val))
        return
      }

      // 其餘（字串/數字/布林）：正規化後當成文字
      if (typeof val === 'string') {
        formData.append(key, val.normalize('NFC'))
      } else {
        formData.append(key, String(val))
      }
    }

    // 把 data 的每個欄位 append 進去
    if (data && typeof data === 'object') {
      Object.keys(data).forEach((key) => appendField(key, data[key]))
    }

    for (const [k, v] of formData.entries()) {
      self.DebugLog('[FD]', k, v instanceof File ? `${v.name} (${v.size})` : v)
    }

    for (let attempt = 0; attempt <= max_retries; attempt++) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), request_timeout)

      try {
        const response = await fetch(url, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        })

        const text = await response.text()
        clearTimeout(timeout)

        if (!response.ok) {
          if (response.status >= 400 && response.status < 500)
            throw new Error(`HTTP ${response.status}`)
          throw new Error(`Server Error ${response.status}`)
        }

        self.handleResponse(true, text, callback)
        return
      } catch (error) {
        clearTimeout(timeout)
        const is_abort = error.name === 'AbortError'
        const is_4xx = error.message && error.message.includes('HTTP 4')

        if (attempt === max_retries || is_abort || is_4xx) {
          self.handleResponse(false, error, callback)
          throw error
        }

        const delay = base_delay * Math.pow(2, attempt)
        console.warn(
          `[SendFormDataWithFiles] Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`,
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }
})()

// 舊程式碼相容：部份模組透過 window.Cyberspace 檢查 Client 是否就緒
window.Cyberspace = Cyberspace

export { Cyberspace }
export default Cyberspace.Client
