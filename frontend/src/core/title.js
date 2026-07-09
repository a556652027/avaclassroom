//  頁面標題顯示的組織名稱 (原 scripts/lib/lib.title.groupcid.js 的解析邏輯)
import { IsValidString } from './util'

export function getGroupDisplayName() {
  const groupCid = window.sessionStorage.getItem('group_cid')
  if (!groupCid || !IsValidString(groupCid)) return ''

  // 優先顯示真實名稱 (select_group_name 或 group_name)，若無才退回顯示 ID
  let displayName = groupCid
  let curName =
    window.sessionStorage.getItem('select_group_name') ||
    window.sessionStorage.getItem('group_name')

  // 當 select_group_name 被移除（例如從學校退回公司時），若當前 groupCid 不是學校，
  // 則優先使用登入時儲存的公司名稱 company_group_name
  if (
    (!curName || curName === 'undefined' || curName === 'null' || !IsValidString(curName)) &&
    groupCid &&
    !groupCid.startsWith('sch_')
  ) {
    const companyName = window.sessionStorage.getItem('company_group_name')
    if (companyName && IsValidString(companyName)) {
      curName = companyName
    }
  }

  if (curName && curName !== 'undefined' && curName !== 'null' && IsValidString(curName)) {
    displayName = curName
  }

  return displayName
}
