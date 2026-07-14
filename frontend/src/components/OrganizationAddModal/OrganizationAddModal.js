import { onBeforeUnmount, reactive, ref } from 'vue'
import { t, getLocalData } from '@/locales'
import { emitter } from '@/core/emitter'
import { apiCall } from '@/core/util'
import { VisibleLoaderElement } from '@/core/loader'
import Client from '@/core/net'
import { GroupData, CsRequestGroupInsertOneRecordByOwnerCID } from '@/api/organization'

// 原 OrganizationAddModal.vue <script setup> 的邏輯，模板繫結經由 useOrganizationAddModal() 回傳
export function useOrganizationAddModal() {

const visible = ref(false)
const sameAsCompanyAddr = ref(false)
const form = reactive({ ...GroupData })

function show() {
  // owner_cid 預設為目前登入者 (原 initOrganizationAddModal)
  form.owner_cid = Client.getUsername()
  visible.value = true
}

function hide() {
  visible.value = false
}

// 「同公司地址」勾選/地址輸入時同步帳單地址 (原 change/input 事件委派)
function onSameAddrChange() {
  form.billing_addr = sameAsCompanyAddr.value ? form.address : ''
}
function syncBillingAddr() {
  if (sameAsCompanyAddr.value) form.billing_addr = form.address
}

// 原 modalOrganizationInsertOne (驗證規則與流程不變)
async function save() {
  const group_cid = form.group_cid.trim()
  const contact_phone_01 = form.contact_phone_01.trim()
  const contact_email_01 = form.contact_email_01.trim()

  // 驗證 group_cid (只允許英文、數字、底線、減號)
  const groupCidPattern = /^[a-zA-Z0-9_-]+$/
  if (!groupCidPattern.test(group_cid)) {
    alert('經銷商/公司名稱格式錯誤！\n只能包含英文字母、數字、底線(_)、減號(-)')
    return
  }

  // 驗證 Email 格式
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(contact_email_01)) {
    alert('聯絡人信箱格式錯誤！\n請輸入有效的 Email 地址')
    return
  }

  // 驗證電話格式 (允許數字、減號、加號、空格、括號)
  const phonePattern = /^[\d\s\-\+\(\)]+$/
  if (!phonePattern.test(contact_phone_01)) {
    alert('聯絡人電話格式錯誤！\n只能包含數字、減號(-)、加號(+)、空格、括號')
    return
  }

  const group_data = {
    ...form,
    group_cid,
    contact_phone_01,
    contact_email_01,
    country: form.country.trim(),
    city: form.city.trim(),
    address: form.address.trim(),
    billing_addr: form.billing_addr.trim(),
    note00: form.note00.trim(),
  }

  console.log('收集到的資料:', group_data)
  VisibleLoaderElement(true)

  try {
    await apiCall(CsRequestGroupInsertOneRecordByOwnerCID, group_data)
    hide()
    alert(getLocalData('common.success'))

    // 清除側欄快取並重新整理 (原邏輯)
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('sidebar_cache_')) {
        sessionStorage.removeItem(key)
      }
    })
    location.reload()
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

const off = emitter.on('org-add-modal:show', show)
onBeforeUnmount(off)

  return {
    visible,
    sameAsCompanyAddr,
    form,
    show,
    hide,
    onSameAddrChange,
    syncBillingAddr,
    save,
    off,
    t,
  }
}
