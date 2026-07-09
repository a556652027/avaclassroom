//  通用工具 (原 www/scripts/lib/lib.proc.util.js 中實際被使用的部分，邏輯不變)
import { getLocalData } from '@/locales'
import { navigateToLogin } from './navigation'

//=============================================================================
//  將server傳的json字串 轉換成 物件
//=============================================================================
export function StringToJson(string) {
  if (typeof string === 'object') {
    return string
  }
  try {
    // 優先嘗試直接解析，對於標準 API 回傳效能最佳。
    return JSON.parse(string)
  } catch (e) {
    // 若直接解析失敗，再嘗試移除控制字元後重試，作為向下相容的後備方案。
    console.warn(
      'Initial JSON.parse failed. Retrying after sanitizing control characters.',
    )
    try {
      const sanitizedString = string.replace(/[\u0000-\u0019]+/g, '')
      return JSON.parse(sanitizedString)
    } catch (e2) {
      console.error('JSON parsing failed even after sanitization.', e2)
    }
  }
  return null
}
//=============================================================================
// 數字左邊補0
//=============================================================================
export function padLeft(str, len) {
  str = '' + str
  return str.length >= len
    ? str
    : new Array(len - str.length + 1).join('0') + str
}

//=============================================================================
// 轉換 Date 物件成字串
//=============================================================================
export function DateToString(date) {
  return (
    date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
  )
}

export function DateMonthToString(date) {
  var mm = date.getMonth() + 1
  return date.getFullYear() + '-' + ((mm > 9 ? '' : '0') + mm)
}

//=============================================================================
// 取得該月的最後一天
//=============================================================================
export function GetLastDayOfMonth(date) {
  var end_date = new Date(date.getTime())
  end_date.setMonth(end_date.getMonth() + 1)
  end_date.setDate(1)
  end_date.setDate(end_date.getDate() - 1)
  return end_date
}

//=============================================================================
// DESC: 容器轉換
//       把一個 tablesi{ "col01": [ "a0", "a1", .... ], "col02": [ "b0", "b1", .... ] ....} 依照 key_order 的順序與欄位
//       轉換成 { [  "a0", "b0", .... ], [  "a1", "b1", .... ]}
//=============================================================================
export function TablesiToTableii(key_order, tablesi) {
  let tableii = []

  if (!key_order.length) return tableii

  let max_rows = 0
  for (const key of key_order) {
    if (tablesi.hasOwnProperty(key)) {
      max_rows = Math.max(max_rows, tablesi[key].length)
    }
  }

  tableii = Array.from({ length: max_rows }, () =>
    Array(key_order.length).fill(null),
  )

  for (let x = 0; x < key_order.length; x++) {
    const key = key_order[x]
    if (tablesi.hasOwnProperty(key)) {
      const col_data = tablesi[key]
      for (let y = 0; y < col_data.length; y++) {
        tableii[y][x] = col_data[y]
      }
    }
  }
  return tableii
}

//=============================================================================
// DESC: 根據指定欄位的值過濾資料 (直欄式資料)
//=============================================================================
export function filterablesiByFieldValue(data, filterField, targetValue) {
  const length = data[filterField]?.length
  if (!length) return {}

  const validIndexes = []
  for (let i = 0; i < length; i++) {
    if (data[filterField][i] === targetValue) {
      validIndexes.push(i)
    }
  }

  const filtered = {}
  for (const key in data) {
    if (Array.isArray(data[key])) {
      filtered[key] = validIndexes.map((i) => data[key][i])
    }
  }

  return filtered
}

//=============================================================================
export const strToBool = (str) => str === '1'

//=============================================================================
// DESC: 判斷字串正不正確
//=============================================================================
export function IsValidString(str) {
  if (str === null || str === undefined || str === '') {
    return false
  }
  return true
}

//=============================================================================
// DESC: 統一錯誤碼顯示 (原 views/app.html.utility.js 的 show_errno，邏輯不變)
//=============================================================================
export function show_errno(errno) {
  // 統一攔截 Session 過期，防止在失效狀態下繼續操作
  if (errno == -1001) {
    alert(getLocalData('login.session_expired') || '連線逾時，請重新登入。')
    navigateToLogin()
    return 'failure'
  }

  if (errno == -1079) {
    alert(getLocalData('common.deny'))
    return 'failure'
  }

  if (errno < 0) {
    alert(getLocalData('common.failure'))
    return 'failure'
  }

  return ''
}

//=============================================================================
// DESC: 通用 API 請求包裝器 (Promise wrapper)
//       負責將 callback 風格轉為 Promise，並統一處理 JSON 解析與錯誤碼檢查
//       底層 net.js 已內建重試機制，此處僅負責流程控制。
//=============================================================================
export function apiCall(apiFunc, ...args) {
  return new Promise((resolve, reject) => {
    try {
      let abortController = null
      // 偵測最後一個參數是否為 AbortController
      if (args.length > 0 && args[args.length - 1] instanceof AbortController) {
        abortController = args.pop()
      }

      const callback = (ok, result) => {
        if (!ok) {
          // 網路或伺服器底層錯誤 (net.js 已處理重試)
          const err = new Error('Network or Server Error')
          // 捕捉來自底層的 AbortError
          if (
            (result && result.name === 'AbortError') ||
            (abortController && abortController.signal.aborted)
          ) {
            err.name = 'AbortError'
          }
          reject(err)
          return
        }
        try {
          const jsonObject = JSON.parse(result)
          if (show_errno(jsonObject.errno) !== '') {
            reject(new Error('Handled Server Error'))
            return
          }
          resolve(jsonObject)
        } catch (e) {
          console.error('[apiCall] JSON Parse Error:', e)
          reject(new Error('Invalid JSON response'))
        }
      }

      // 依據模組層的參數順序：(..., callback, abortController)
      if (abortController) {
        apiFunc(...args, callback, abortController)
      } else {
        apiFunc(...args, callback)
      }
    } catch (e) {
      console.error('[apiCall] Execution Error:', e)
      reject(e)
    }
  })
}
