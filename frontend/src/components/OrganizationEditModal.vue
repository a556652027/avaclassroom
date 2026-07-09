<template>
  <div
    v-if="visible"
    style="
      display: flex;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      justify-content: center;
      align-items: center;
    "
    @click.self="close"
  >
    <div
      style="
        background-color: #ffffff;
        box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.2);
        border-radius: 15px;
        padding: 30px;
        width: 90%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
      "
    >
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem">
        <div style="display: flex; align-items: center">
          <img src="/assets/images/editcompany.png" alt="" style="margin-right: 1rem; width: 30px" />
          <h2 style="font-family: Inter; font-weight: 900; font-size: 24px; line-height: 125%; margin: 0">
            {{ t('sidebarnav.organization') }}
          </h2>
        </div>
        <img src="/assets/images/X.svg" alt="" style="cursor: pointer" @click="close" />
      </div>

      <form @submit.prevent="save">
        <div class="org-edit-row">
          <div class="org-edit-field" style="width: 230px">
            <label style="color: #898c94; margin-bottom: 0.5rem">{{ t('organization.country') }}</label>
            <select v-model="form.country" class="org-edit-input" style="background-color: #ffffff; width: 230px" required>
              <option value="">{{ t('organization.select_country') }}</option>
              <option value="Taiwan">Taiwan</option>
              <option value="China">China</option>
              <option value="Japan">Japan</option>
              <option value="India">India</option>
              <option value="Thailand">Thailand</option>
            </select>
          </div>
          <div class="org-edit-field" style="width: 230px">
            <label style="color: #898c94; margin-bottom: 0.5rem">{{ t('organization.group_name') }}</label>
            <input v-model="form.group_name" type="text" :placeholder="t('organization.group_name_hint')" class="org-edit-input" required />
          </div>
        </div>

        <div class="org-edit-row">
          <div class="org-edit-field" style="width: 230px">
            <label style="color: #898c94; margin-bottom: 0.5rem">{{ t('organization.group_cid') }}</label>
            <input
              v-model="form.group_cid"
              type="text"
              :placeholder="t('organization.group_cid_hint')"
              class="org-edit-input"
              style="background-color: #f5f5f5"
              readonly
            />
          </div>
          <div class="org-edit-field" style="width: 230px">
            <label style="color: #898c94; margin-bottom: 0.5rem">{{ t('organization.group_ubn') }}</label>
            <input v-model="form.group_ubn" type="text" :placeholder="t('organization.group_ubn') + '...'" class="org-edit-input" required />
          </div>
          <div class="org-edit-field" style="width: 230px">
            <label style="color: #898c94; margin-bottom: 0.5rem">{{ t('organization.contact') }}</label>
            <input v-model="form.contact" type="text" :placeholder="t('organization.contact') + '...'" class="org-edit-input" required />
          </div>
        </div>

        <div class="org-edit-row">
          <div class="org-edit-field" style="width: 358px">
            <label style="color: #898c94; margin-bottom: 0.5rem">{{ t('organization.contact_phone_01') }}</label>
            <input v-model="form.contact_phone_01" type="text" :placeholder="t('organization.contact_phone_01') + '...'" class="org-edit-input" required />
          </div>
          <div class="org-edit-field" style="width: 358px">
            <label style="color: #898c94; margin-bottom: 0.5rem">{{ t('organization.contact_email_01') }}</label>
            <input v-model="form.contact_email_01" type="email" :placeholder="t('organization.contact_email_01') + '...'" class="org-edit-input" required />
          </div>
        </div>

        <div class="org-edit-row">
          <div class="org-edit-field" style="width: 358px">
            <label style="color: #898c94; margin-bottom: 0.5rem">{{ t('organization.address') }}</label>
            <input v-model="form.address" type="text" :placeholder="t('organization.address') + '...'" class="org-edit-input" required />
          </div>
          <div class="org-edit-field" style="width: 358px">
            <label style="color: #898c94; margin-bottom: 0.5rem">{{ t('organization.billing_addr') }}</label>
            <input v-model="form.billing_addr" type="text" :placeholder="t('organization.billing_addr') + '...'" class="org-edit-input" required />
          </div>
        </div>

        <div style="display: flex; flex-direction: column; margin-bottom: 1rem">
          <label style="color: #898c94; margin-bottom: 0.5rem">{{ t('common.note00') }}</label>
          <textarea
            v-model="form.note00"
            :placeholder="t('common.note00') + '...'"
            style="border: 1px solid #e5e8ea; outline: none; padding: 8px; height: 80px; resize: vertical; border-radius: 6px"
          ></textarea>
        </div>

        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1rem">
          <button type="button" class="org-edit-delete-btn" @click="remove">
            {{ t('common.delete') }}
          </button>
          <div style="display: flex; justify-content: flex-end; gap: 1rem">
            <button type="button" class="org-edit-cancel-btn" @click="close">
              {{ t('common.cancel') }}
            </button>
            <button type="submit" class="org-edit-save-btn">
              {{ t('common.save') }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
// 原 components/app.component.frame.organization-edit.js (載入/儲存/刪除流程與錯誤碼處理不變)
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
</script>

<style>
.org-edit-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1rem;
}
.org-edit-field {
  display: flex;
  flex-direction: column;
}
.org-edit-input {
  border: 1px solid #e5e8ea;
  outline: none;
  height: 38px;
  padding: 8px;
  border-radius: 10px;
}
.org-edit-delete-btn {
  width: 130px;
  height: 48px;
  background-color: #ffffff;
  border: 1px solid #de6565;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #de6565;
  transition: all 0.3s ease;
}
.org-edit-delete-btn:hover {
  background-color: #de6565;
  color: #ffffff;
}
.org-edit-cancel-btn {
  width: 130px;
  height: 48px;
  background-color: #ffffff;
  border: 1px solid #e5e8ea;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
}
.org-edit-cancel-btn:hover {
  background-color: #e5e8ea;
  color: #404040;
}
.org-edit-save-btn {
  width: 130px;
  height: 48px;
  background-color: #214f7c;
  border-radius: 10px;
  border: none;
  color: #ffffff;
  cursor: pointer;
  font-size: 14px;
}
.org-edit-save-btn:hover {
  background-color: #ee963f;
  color: #ffffff;
}
</style>
