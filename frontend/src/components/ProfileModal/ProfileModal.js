import { onBeforeUnmount, reactive, ref } from 'vue'
import { t, getLocalData } from '@/locales'
import { emitter } from '@/core/emitter'
import { apiCall } from '@/core/util'
import { VisibleLoaderElement } from '@/core/loader'
import Client from '@/core/net'
import {
  ProfileData,
  CsRequestProfileSelectOne,
  CsRequestProfileUpdateOne,
} from '@/api/profile'

// 原 ProfileModal.vue <script setup> 的邏輯，模板繫結經由 useProfileModal() 回傳
export function useProfileModal() {

const visible = ref(false)
const showOld = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')

// 表單欄位 (含原本以 hidden input 保留的欄位，更新時原樣回傳)
const form = reactive({ ...ProfileData })

const eyeIcon = (open) =>
  open ? '/assets/images/passwordeyeopen.svg' : '/assets/images/passwordeyeclose.svg'

// 原 SelectProfileOne: 先取回資料填入完畢後才顯示 Modal，防止畫面閃爍
async function show() {
  const profile_cid = Client.getUsername()
  VisibleLoaderElement(true)
  try {
    const json_object = await apiCall(CsRequestProfileSelectOne, profile_cid)
    const record = json_object.records
    const first = (key) => (record[key] ? record[key][0] || '' : '')

    form.member_cid = first('member_cid')
    form.password = first('password')
    form.member_name = first('member_name')
    form.gender = first('gender')
    form.record_state = first('record_state')
    form.birthday = String(first('birthday')).split(' ')[0]
    form.phone_cell = first('phone_cell')
    form.phone_home = first('phone_home')
    form.phone_work = first('phone_work')
    form.email = first('email')
    form.country = first('country')
    form.city = first('city')
    form.address = first('address')
    form.note00 = first('note00')

    newPassword.value = ''
    confirmPassword.value = ''
    visible.value = true
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

function hide() {
  visible.value = false
  // 通知頁面 Modal 已關閉 (profile 頁需導回 dashboard，原 navigateToDashboard)
  emitter.emit('profile-modal:hidden')
}

// 原 UpdateProfileOne
async function save() {
  // 處理密碼更新邏輯
  if (newPassword.value && newPassword.value !== confirmPassword.value) {
    alert('新密碼與確認密碼不符')
    return
  }
  const profile_data = { ...form }
  if (newPassword.value && newPassword.value === confirmPassword.value) {
    profile_data.password = newPassword.value
  }

  VisibleLoaderElement(true)
  try {
    await apiCall(CsRequestProfileUpdateOne, profile_data)
    alert(getLocalData('common.success'))
    hide()
  } catch (e) {
    if (e.message !== 'Handled Server Error') alert('request error')
  } finally {
    VisibleLoaderElement(false)
  }
}

const off = emitter.on('profile-modal:show', show)
onBeforeUnmount(off)

  return {
    visible,
    showOld,
    showNew,
    showConfirm,
    newPassword,
    confirmPassword,
    form,
    eyeIcon,
    show,
    hide,
    save,
    off,
    t,
  }
}
