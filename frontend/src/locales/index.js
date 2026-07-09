//  多語系 (原 www/locales/app.locale.js 的行為：localStorage 記憶語言、GetLocalData 取值、Mustache {{}} 插值)
import { computed, ref } from 'vue'
import zhTw from './zh-tw'
import enUs from './en-us'

const LOCALES = { 'zh-tw': zhTw, 'en-us': enUs }

export const currentLang = ref(
  window.localStorage.getItem('language') || 'zh-tw',
)

// 舊版模組相容：部分底層直接讀 window.localeData
window.localeData = LOCALES[currentLang.value] || zhTw

export const localeData = computed(() => LOCALES[currentLang.value] || zhTw)

export function setLanguage(lang) {
  if (!LOCALES[lang]) return
  currentLang.value = lang
  window.localStorage.setItem('language', lang)
  window.localeData = LOCALES[lang]
}

// 取得對應字串 (原 GetLocalData)
// e.g. key = common.ok
export function getLocalData(key) {
  const data = localeData.value
  if (data) {
    return key.split('.').reduce((obj, k) => obj?.[k], data)
  }
  return ''
}

// Mustache 風格 {{var}} 插值 (原本頁面用 Mustache.render 渲染訊息字串)
export function formatLocal(template, params) {
  if (!template) return ''
  return String(template).replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k) =>
    params && k in params ? params[k] : '',
  )
}

// 常用縮寫：t('common.ok') / tf('device.msg_export_success', { count: 3 })
export const t = getLocalData
export const tf = (key, params) => formatLocal(getLocalData(key), params)
