<template>
  <div v-if="visible" class="ui-modal-overlay org-edit-modal" @click.self="close">
    <div class="ui-modal" style="max-width: 800px">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem">
        <div style="display: flex; align-items: center">
          <img src="/assets/images/editcompany.png" alt="" style="margin-right: 1rem; width: 30px" />
          <h2 class="org-edit-title">
            {{ t('sidebarnav.organization') }}
          </h2>
        </div>
        <img src="/assets/images/X.svg" alt="" style="cursor: pointer" @click="close" />
      </div>

      <form @submit.prevent="save">
        <div class="org-edit-row">
          <div class="org-edit-field" style="width: 230px">
            <label>{{ t('organization.country') }}</label>
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
            <label>{{ t('organization.group_name') }}</label>
            <input v-model="form.group_name" type="text" :placeholder="t('organization.group_name_hint')" class="org-edit-input" required />
          </div>
        </div>

        <div class="org-edit-row">
          <div class="org-edit-field" style="width: 230px">
            <label>{{ t('organization.group_cid') }}</label>
            <input
              v-model="form.group_cid"
              type="text"
              :placeholder="t('organization.group_cid_hint')"
              class="org-edit-input"
              readonly
            />
          </div>
          <div class="org-edit-field" style="width: 230px">
            <label>{{ t('organization.group_ubn') }}</label>
            <input v-model="form.group_ubn" type="text" :placeholder="t('organization.group_ubn') + '...'" class="org-edit-input" required />
          </div>
          <div class="org-edit-field" style="width: 230px">
            <label>{{ t('organization.contact') }}</label>
            <input v-model="form.contact" type="text" :placeholder="t('organization.contact') + '...'" class="org-edit-input" required />
          </div>
        </div>

        <div class="org-edit-row">
          <div class="org-edit-field" style="width: 358px">
            <label>{{ t('organization.contact_phone_01') }}</label>
            <input v-model="form.contact_phone_01" type="text" :placeholder="t('organization.contact_phone_01') + '...'" class="org-edit-input" required />
          </div>
          <div class="org-edit-field" style="width: 358px">
            <label>{{ t('organization.contact_email_01') }}</label>
            <input v-model="form.contact_email_01" type="email" :placeholder="t('organization.contact_email_01') + '...'" class="org-edit-input" required />
          </div>
        </div>

        <div class="org-edit-row">
          <div class="org-edit-field" style="width: 358px">
            <label>{{ t('organization.address') }}</label>
            <input v-model="form.address" type="text" :placeholder="t('organization.address') + '...'" class="org-edit-input" required />
          </div>
          <div class="org-edit-field" style="width: 358px">
            <label>{{ t('organization.billing_addr') }}</label>
            <input v-model="form.billing_addr" type="text" :placeholder="t('organization.billing_addr') + '...'" class="org-edit-input" required />
          </div>
        </div>

        <div style="display: flex; flex-direction: column; margin-bottom: 1rem">
          <label>{{ t('common.note00') }}</label>
          <textarea
            v-model="form.note00"
            :placeholder="t('common.note00') + '...'"
            class="org-edit-input org-edit-textarea"
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
// 邏輯抽離至 OrganizationEditModal.js，此處僅保留模板繫結
import { useOrganizationEditModal } from './OrganizationEditModal.js'

const {
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
} = useOrganizationEditModal()
</script>

<style src="./OrganizationEditModal.css"></style>
