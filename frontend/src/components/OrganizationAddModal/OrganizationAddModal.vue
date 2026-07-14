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
// 邏輯抽離至 OrganizationAddModal.js，此處僅保留模板繫結
import { useOrganizationAddModal } from './OrganizationAddModal.js'

const {
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
} = useOrganizationAddModal()
</script>

<style src="./OrganizationAddModal.css"></style>
