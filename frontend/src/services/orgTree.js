//  公司/學校群組查詢 (原 navbar/sidebar 元件內的共用查詢邏輯，API 呼叫序列不變)
import { Cyberspace } from '@/core/net'

// 查詢指定群組下所有成員帳號 (condition_type 5: by group_cid)
export function queryMembersOfGroup(groupCid) {
  return new Promise((resolve) => {
    Cyberspace.Client.SendRequest(
      '/ava_system/member/select_all_records',
      {
        condition_type: 5,
        condition_value: groupCid,
        search_name: '',
        offset: 0,
        row_count: 100,
      },
      (ok, result) => {
        if (!ok) return resolve([])
        try {
          const json = JSON.parse(result)
          if (json.errno == 1 || json.errno == 0) {
            const m_cids =
              (json.records && json.records.member_cid) || json.member_cid
            resolve(Array.isArray(m_cids) ? m_cids : m_cids ? [m_cids] : [])
          } else {
            resolve([])
          }
        } catch (e) {
          resolve([])
        }
      },
    )
  })
}

// 查詢某成員擁有的群組 (condition_type "2": by owner_cid)
export function queryGroupsOfMember(memberCid) {
  return new Promise((resolve) => {
    Cyberspace.Client.SendRequest(
      '/ava_system/group/select_all_records',
      {
        condition_type: '2',
        condition_value: memberCid,
        offset: 0,
        row_count: 100,
      },
      (ok, result) => {
        if (!ok) return resolve({ names: [], cids: [] })
        try {
          const json = JSON.parse(result)
          if (json.errno == 1 || json.errno == 0) {
            const names = (json.records && json.records.group_name) || []
            const cids = (json.records && json.records.group_cid) || []
            resolve({
              names: Array.isArray(names) ? names : names ? [names] : [],
              cids: Array.isArray(cids) ? cids : cids ? [cids] : [],
            })
          } else {
            resolve({ names: [], cids: [] })
          }
        } catch (e) {
          resolve({ names: [], cids: [] })
        }
      },
    )
  })
}

// 取得公司旗下所有學校群組 (sch_ 開頭)，合併去重 (原 loadSchoolMenu 的查詢邏輯)
export async function querySchoolsOfCompany(companyCid) {
  const userTier = window.sessionStorage.getItem('tier')
  let memberCids = []

  if (userTier === '3') {
    // 經銷商本人登入，只查詢自己擁有的學校
    const memberCid = window.sessionStorage.getItem('member_cid')
    memberCids = memberCid ? [memberCid] : []
  } else {
    // Admin / Sales 登入，先取得該代理商群組下的所有成員帳號
    memberCids = await queryMembersOfGroup(companyCid)
  }

  if (memberCids.length === 0) return []

  const results = await Promise.all(memberCids.map(queryGroupsOfMember))

  const mergedSchools = []
  const seenCids = new Set()
  results.forEach((res) => {
    for (let i = 0; i < res.cids.length; i++) {
      const sCid = String(res.cids[i]).trim()
      const sName = String(res.names[i] || sCid).trim()
      if (sCid && sCid.startsWith('sch_') && !seenCids.has(sCid)) {
        seenCids.add(sCid)
        mergedSchools.push({ name: sName, cid: sCid })
      }
    }
  })
  return mergedSchools
}

// 找出公司旗下第一所學校 (原 navbar 的 fetchFirstSchoolOfCompanyDirect，含 2.5 秒超時保底)
export function fetchFirstSchoolOfCompanyDirect(companyCid, onComplete) {
  let finished = false
  const safeComplete = (schoolObj) => {
    if (!finished && onComplete) {
      finished = true
      onComplete(schoolObj)
    }
  }

  // 2.5 秒超時保底
  const timeoutTimer = setTimeout(() => {
    console.warn('[Navbar] 查詢學校群組超時，啟動跳轉保底...')
    safeComplete(null)
  }, 2500)

  querySchoolsOfCompany(companyCid)
    .then((schools) => {
      clearTimeout(timeoutTimer)
      safeComplete(schools.length > 0 ? schools[0] : null)
    })
    .catch(() => {
      clearTimeout(timeoutTimer)
      safeComplete(null)
    })
}

// [防呆] 非 avaclassroom 產品時，若當前 group 是學校 (sch_ 開頭)，回退為 parent 公司群組
// (原 navbar / sidebar / dashboard 三處相同邏輯)
export function fallbackSchoolToCompany() {
  let currentGroup =
    window.sessionStorage.getItem('group_cid') ||
    window.sessionStorage.getItem('select_group_cid') ||
    ''
  if (currentGroup && currentGroup.startsWith('sch_')) {
    // 優先使用儲存的公司 ID (school_parent_company_cid) 或登入保底 ID
    const parentCompanyCid =
      window.sessionStorage.getItem('school_parent_company_cid') ||
      window.sessionStorage.getItem('login_group_cid')
    if (parentCompanyCid) {
      console.log(
        `[OrgTree] 當前群組為學校 (${currentGroup})，自動回退至代理商公司群組 (${parentCompanyCid})`,
      )
      window.sessionStorage.setItem('group_cid', parentCompanyCid)
      window.sessionStorage.setItem('select_group_cid', parentCompanyCid)
      // 回退至公司時，還原為登入時的公司名稱
      const companyName = window.sessionStorage.getItem('company_group_name')
      if (companyName) {
        window.sessionStorage.setItem('select_group_name', companyName)
      } else {
        window.sessionStorage.removeItem('select_group_name')
      }
    }
  }
}

// 選定學校群組並寫入 session (原 sidebar 學校點擊 / 自動選取邏輯)
export function selectSchool(school, parentCompanyCid) {
  window.sessionStorage.setItem('group_cid', school.cid)
  window.sessionStorage.setItem('select_group_cid', school.cid)
  window.sessionStorage.setItem('school_parent_company_cid', parentCompanyCid)
  window.sessionStorage.setItem('select_group_name', school.name)
}
