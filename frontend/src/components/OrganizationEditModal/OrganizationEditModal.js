import { onBeforeUnmount, reactive, ref } from 'vue'
import { t, getLocalData } from '@/locales'
import { emitter } from '@/core/emitter'
import { apiCall, IsValidString } from '@/core/util'
import { VisibleLoaderElement } from '@/core/loader'
import {
  GroupData,
  CsRequestGroupSelectOneRecordByGroupCID,
  CsRequestGroupUpdateOneRecordByGroupCID,
} from '@/api/organization'

// 原 OrganizationEditModal.vue <script setup> 的邏輯，模板繫結經由 useOrganizationEditModal() 回傳
export function useOrganizationEditModal() {
// 原 components/app.component.frame.organization-edit.js (載入/儲存/刪除流程與錯誤碼處理不變)

const visible = ref(false)
const form = reactive({ ...GroupData })

// 權限驗證關鍵參數 (原 _current_editing_* 全域變數)
let editingCid = null
let editingUid = null
let editingIdx = null
let editingUpdateCount = null

async function show(organizationCid = null) {
  // 如果沒有傳入組織ID，從 sessionStorage 獲取
  if (!organizationCid) {
    organizationCid = window.sessionStorage.getItem('group_cid')
  }
  if (organizationCid) organizationCid = organizationCid.trim()

  if (!organizationCid || !IsValidString(organizationCid)) {
    alert('無法獲取組織資訊')
    return
  }

  editingCid = organizationCid

  // 先等待 API 取回組織資料並填入完畢後，再顯示 Modal，防止畫面閃爍
  const ok = await loadOrganizationData(organizationCid)
  if (ok) visible.value = true
}

function close() {
  visible.value = false
  editingCid = null
  editingUid = null
  editingIdx = null
  editingUpdateCount = null
  Object.assign(form, GroupData)
}

// 原 loadOrganizationData (含 -1089 / -1081 錯誤處理與一次重試)
async function loadOrganizationData(organizationCid, retryCount = 0) {
  console.log('🚀 準備載入組織資料, CID:', organizationCid)
  VisibleLoaderElement(true)

  try {
    const result = await new Promise((resolve, reject) => {
      CsRequestGroupSelectOneRecordByGroupCID(organizationCid, function (ok, res) {
        if (!ok) reject(new Error(res || 'Network Error'))
        else resolve(res)
      })
    })

    const json_object = JSON.parse(result)
    console.log('📡 載入組織資料結果:', true, result)

    if (json_object.errno < 0) {
      // 針對 -1089 錯誤代碼提供明確提示
      if (json_object.errno == -1089) {
        console.error(`載入組織資料失敗 (API Error: ${json_object.errno})`, json_object)
        alert('您沒有權限編輯此組織資訊。')
        return false
      }
      // 針對 -1081 (資料庫中查無此組織) 提供友善提示
      if (json_object.errno == -1081) {
        console.error(`載入組織資料失敗 (API Error: ${json_object.errno})`, json_object)
        alert(
          `找不到組織 [${organizationCid}] 的資料！\n\n可能原因：\n1. 您只有被指派 ID，但該組織尚未建立詳細資料。\n2. 該組織已被刪除。\n\n請前往「新增組織」將資料補齊。`,
        )
        return false
      }
      let errMsg = `載入組織資料失敗 (API Error)\nCode: ${json_object.errno}`
      errMsg += `\nMessage: ${json_object.message || json_object.msg || 'unknown'}`
      console.error(errMsg, json_object)
      alert(errMsg)
      return false
    }

    // 填入資料
    const record = json_object.records
    editingUid = record.group_uid ? record.group_uid[0] : null
    editingIdx = record.group_idx ? record.group_idx[0] : null
    editingUpdateCount = record.update_count ? record.update_count[0] : '0'

    console.log('🔑 取得關鍵參數:', {
      uid: editingUid,
      idx: editingIdx,
      count: editingUpdateCount,
    })

    const first = (key) => (record[key] ? record[key][0] || '' : '')
    form.group_cid = first('group_cid')
    form.group_name = first('group_name')
    form.group_type = first('group_type')
    form.contact = first('contact')
    form.group_ubn = first('group_ubn')
    form.contact_phone_01 = first('contact_phone_01')
    form.contact_email_01 = first('contact_email_01')
    form.country = first('country')
    form.address = first('address')
    form.billing_addr = first('billing_addr')
    form.note00 = first('note00')
    form.owner_cid = first('owner_cid')
    form.city = first('city')

    return true
  } catch (error) {
    if (retryCount < 1) {
      console.warn(`[loadOrganizationData] 載入失敗，重試... (Retry: ${retryCount + 1})`)
      return loadOrganizationData(organizationCid, retryCount + 1)
    }
    console.error('載入組織資料失敗', error)
    alert(`載入組織資料失敗\nCID: [${organizationCid}]`)
    return false
  } finally {
    VisibleLoaderElement(false)
  }
}

// 收集表單資料 (原 save/delete 共用的欄位收集與防呆邏輯)
function collectGroupData(recordState) {
  const group_data = { ...GroupData, ...form }
  delete group_data.object_name

  group_data.group_name = (form.group_name || '').trim()
  // 確保有值 (預設 "0")，避免發送 undefined 導致 502
  group_data.group_type = (form.group_type || '0').trim()
  // 確保 owner_cid 有值，避免 -1103
  group_data.owner_cid = (
    form.owner_cid || window.sessionStorage.getItem('member_cid') || ''
  ).trim()

  // 優先使用已載入的 group_uid，並注入 idx / update_count (後端資料一致性驗證)
  if (editingUid) {
    group_data.group_uid = editingUid
    group_data.group_idx = editingIdx || '0'
    group_data.update_count = editingUpdateCount || '0'
  } else {
    console.warn('⚠️ 警告：缺少 group_uid，更新可能會失敗 (-1103)')
  }

  // 確保數值欄位存在且有預設值，避免 -1086 (參數不足)
  for (const key of ['licensing_remaining_days', 'licensing_remaining_seats']) {
    if (group_data[key] === undefined || group_data[key] === null || group_data[key] === '') {
      group_data[key] = '0'
    }
  }

  group_data.contact = (form.contact || '').trim()
  group_data.group_ubn = (form.group_ubn || '').trim()
  group_data.city = (form.city || '').trim()
  group_data.country = (form.country || '').trim()
  group_data.address = (form.address || '').trim()
  group_data.billing_addr = (form.billing_addr || '').trim()
  group_data.record_state = recordState

  return group_data
}

function clearSidebarCache() {
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith('sidebar_cache_')) {
      sessionStorage.removeItem(key)
    }
  })
}

// 原 saveOrganizationData
async function save() {
  if (!editingCid) {
    alert('無效的組織資訊')
    return
  }

  const group_data = collectGroupData('1')
  console.log('準備儲存組織 (Standard API)，發送的資料:', group_data)
  VisibleLoaderElement(true)

  try {
    await apiCall(CsRequestGroupUpdateOneRecordByGroupCID, group_data)
    alert(getLocalData('common.success'))
    clearSidebarCache()
    close()
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('更新組織資料失敗 (API Error)')
  } finally {
    VisibleLoaderElement(false)
  }
}

// 原 deleteOrganization (record_state 設為 0)
async function remove() {
  if (!editingCid) {
    alert('無效的組織資訊')
    return
  }
  if (!confirm('確定要刪除此組織嗎？刪除後該組織將不會顯示在列表中。')) {
    console.log('用戶取消刪除')
    return
  }

  const group_data = collectGroupData('0')
  console.log('📦 準備刪除組織，發送的資料:', group_data)
  VisibleLoaderElement(true)

  try {
    await apiCall(CsRequestGroupUpdateOneRecordByGroupCID, group_data)
    alert('組織已刪除')
    clearSidebarCache()
    close()
    location.reload()
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('刪除組織失敗 (API Error)')
  } finally {
    VisibleLoaderElement(false)
  }
}

const off = emitter.on('org-edit-modal:show', show)
onBeforeUnmount(off)

  return {
    visible,
    form,
    editingCid,
    editingUid,
    editingIdx,
    editingUpdateCount,
    show,
    close,
    loadOrganizationData,
    collectGroupData,
    clearSidebarCache,
    save,
    remove,
    off,
    t,
  }
}
