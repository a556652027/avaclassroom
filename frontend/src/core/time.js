//  時間工具 (原 www/scripts/lib/lib.proc.time.js 原封搬移)

//====================================================
// 取得當下日期的字串
//====================================================
export function GeDateText(date) {
  return date.toISOString().slice(0, 10)
}

//=============================================================================
// 指定時間的相加減
// e.g 加五天 DateAdd("d", 5, now)、加兩個月 DateAdd("m", 2, now)、加一年 DateAdd("y", 1, now)
//=============================================================================
export function DateAdd(interval, number, date) {
  switch (interval) {
    case 'y': {
      date.setFullYear(date.getFullYear() + number)
      return date
    }
    case 'q': {
      date.setMonth(date.getMonth() + number * 3)
      return date
    }
    case 'm': {
      date.setMonth(date.getMonth() + number)
      return date
    }
    case 'w': {
      date.setDate(date.getDate() + number * 7)
      return date
    }
    case 'd': {
      date.setDate(date.getDate() + number)
      return date
    }
    case 'h': {
      date.setHours(date.getHours() + number)
      return date
    }
    case 's': {
      date.setSeconds(date.getSeconds() + number)
      return date
    }
    default: {
      date.setDate(date.getDate() + number)
      return date
    }
  }
}

//====================================================
// 將日期改成最後的 時 分 秒
//====================================================
export function SetToEndOfDay(date) {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

//====================================================
// 轉換日期格式 yyyy-MM-dd HH:mm:ss
//====================================================
export function FormatDateTime(date) {
  const pad = (n) => n.toString().padStart(2, '0')

  const yyyy = date.getFullYear()
  const mm = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const hh = pad(date.getHours())
  const mi = pad(date.getMinutes())
  const ss = pad(date.getSeconds())

  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
}

//====================================================
// 有沒有超過今天
//====================================================
export function IsAfterToday(dateToCheck) {
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  return new Date(dateToCheck).getTime() > today.getTime()
}
