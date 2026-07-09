<template>
  <div
    v-if="visible"
    class="modal-overlay org-add-modal"
    style="
      display: flex;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      justify-content: center;
      align-items: center;
      z-index: 9999;
    "
  >
    <div
      class="modal-content"
      style="
        background-color: #ffffff;
        box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.2);
        border-radius: 15px;
        padding: 30px;
        width: 800px;
        max-height: 90vh;
        overflow-y: auto;
      "
    >
      <div class="page-caption" style="display: flex; align-items: center; justify-content: space-between">
        <div style="display: flex; align-items: center">
          <img src="/assets/images/add_group_icon.svg" alt="" style="margin-right: 1rem; width: 30px" />
          <h1 style="font-family: Inter; font-weight: 900; font-size: 24px; line-height: 125%">
            {{ t('organization.title_insert_organization') }}
          </h1>
        </div>
        <div style="cursor: pointer" @click="hide">
          <img src="/assets/images/X.svg" alt="" />
        </div>
      </div>

      <div class="org-add-grid">
        <div class="org-row">
          <div class="org-field" style="width: 230px">
            <label style="color: #898c94">{{ t('organization.country') }}</label>
            <select v-model="form.country" class="org-input" style="background-color: #ffffff; width: 230px" required>
              <option value="">{{ t('organization.select_country') || '請選擇國家' }}</option>
              <option value="Taiwan">Taiwan</option>
              <option value="China">China</option>
              <option value="Japan">Japan</option>
              <option value="India">India</option>
              <option value="Thailand">Thailand</option>
            </select>
          </div>
          <div class="org-field" style="width: 230px">
            <label style="color: #898c94">{{ t('organization.group_name') }}</label>
            <input v-model="form.group_name" type="text" :placeholder="t('organization.group_name_hint')" class="org-input" required />
          </div>
        </div>

        <div class="org-row">
          <div class="org-field" style="width: 230px">
            <label style="color: #898c94">{{ t('organization.group_cid') }}</label>
            <input v-model="form.group_cid" type="text" :placeholder="t('organization.group_cid_hint')" class="org-input" required />
          </div>
          <div class="org-field" style="width: 230px">
            <label style="color: #898c94">{{ t('organization.group_ubn') }}</label>
            <input v-model="form.group_ubn" type="text" :placeholder="t('organization.group_ubn_hint')" class="org-input" required />
          </div>
          <div class="org-field" style="width: 230px">
            <label style="color: #898c94">{{ t('organization.contact') }}</label>
            <input v-model="form.contact" type="text" :placeholder="t('organization.contact_hint')" class="org-input" required />
          </div>
        </div>

        <div class="org-row">
          <div class="org-field" style="width: 358px">
            <label style="color: #898c94">{{ t('organization.contact_phone_01') }}</label>
            <input v-model="form.contact_phone_01" type="text" :placeholder="t('organization.contact_phone_01_hint')" class="org-input" required />
          </div>
          <div class="org-field" style="width: 358px">
            <label style="color: #898c94">{{ t('organization.contact_email_01') }}</label>
            <input v-model="form.contact_email_01" type="text" :placeholder="t('organization.contact_email_01_hint')" class="org-input" required />
          </div>
        </div>

        <div class="org-row">
          <div class="org-field" style="width: 358px">
            <label style="color: #898c94">{{ t('organization.address') }}</label>
            <input v-model="form.address" type="text" :placeholder="t('organization.address_hint')" class="org-input" required @input="syncBillingAddr" />
          </div>
          <div class="org-field" style="width: 358px">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px">
              <label style="color: #898c94; margin: 0">{{ t('organization.billing_addr') }}</label>
              <div style="display: flex; align-items: center; gap: 4px">
                <input
                  id="organization_insert-same_as_company_addr"
                  v-model="sameAsCompanyAddr"
                  type="checkbox"
                  @change="onSameAddrChange"
                />
                <span style="font-size: 14px; color: #898c94">同公司地址</span>
              </div>
            </div>
            <input v-model="form.billing_addr" type="text" :placeholder="t('organization.billing_addr_hint')" class="org-input" required />
          </div>
        </div>

        <div class="org-field" style="margin-top: 1rem">
          <label style="color: #898c94">{{ t('common.note00') }}</label>
          <textarea
            v-model="form.note00"
            :placeholder="t('common.note00_hint')"
            class="org-input"
            style="height: 80px; resize: vertical"
            required
          ></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem">
          <button
            type="button"
            style="cursor: pointer; width: 130px; height: 48px; background-color: #ffffff; border: 1px solid #e5e8ea; border-radius: 10px"
            @click="hide"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="button"
            style="cursor: pointer; width: 130px; height: 48px; background-color: #214f7c; border-radius: 10px; border: none; color: #ffffff"
            @click="save"
          >
            {{ t('common.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, reactive, ref } from 'vue'
import { t, getLocalData } from '@/locales'
import { emitter } from '@/core/emitter'
import { apiCall } from '@/core/util'
import { VisibleLoaderElement } from '@/core/loader'
import Client from '@/core/net'
import { GroupData, CsRequestGroupInsertOneRecordByOwnerCID } from '@/api/organization'

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
</script>

<style>
/* 原 organization-add.html 的 placeholder 樣式 */
.org-add-modal input::placeholder,
.org-add-modal textarea::placeholder {
  color: #d1d5db !important;
  opacity: 1;
}
.org-add-modal .org-row {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}
.org-add-modal .org-field {
  display: flex;
  flex-direction: column;
}
.org-add-modal .org-input {
  border: 1px solid #e5e8ea;
  outline: none;
  height: 38px;
  padding: 8px;
  border-radius: 10px;
}
.org-add-modal textarea.org-input {
  height: 80px;
}
#organization_insert-same_as_company_addr {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid #e5e8ea;
  border-radius: 3px;
  cursor: pointer;
  position: relative;
}
#organization_insert-same_as_company_addr:checked {
  background-color: #ff8c00;
  border-color: #ff8c00;
}
</style>
