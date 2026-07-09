//====================================================
// 取得當下日期的字串
//
//====================================================
function GeDateText(date) {
    return date.toISOString().slice(0, 10);

    // const year = date.getFullYear();
    // const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份從 0 開始，所以要 +1
    // const day = String(date.getDate()).padStart(2, '0');
    // const formattedDate = `${year}-${month}-${day}`;
    // return formattedDate;
}

//=============================================================================
//
// 指定時間的相加減
//
// e.g
//     加五天.    var newDate = DateAdd( "d ", 5, now );
//     加兩個月       newDate = DateAdd( "m ", 2, now );
//     加一年         newDate = DateAdd( "y ", 1, now );
//=============================================================================
function DateAdd(interval, number, date) {
    switch (interval) {
        case "y": {
            date.setFullYear(date.getFullYear() + number);
            return date;
            break;
        }
        case "q": {
            date.setMonth(date.getMonth() + number * 3);
            return date;
            break;
        }
        case "m": {
            date.setMonth(date.getMonth() + number);
            return date;
            break;
        }
        case "w": {
            date.setDate(date.getDate() + number * 7);
            return date;
            break;
        }
        case "d": {
            date.setDate(date.getDate() + number);
            return date;
            break;
        }
        case "h": {
            date.setHours(date.getHours() + number);
            return date;
            break;
        }
        case "m": {
            date.setMinutes(date.getMinutes() + number);
            return date;
            break;
        }
        case "s": {
            date.setSeconds(date.getSeconds() + number);
            return date;
            break;
        }
        default: {
            date.setDate(date.getDate() + number);
            return date;
            break;
        }
    }
}

//====================================================
// 將日期改成最後的 時 分 秒
//
//====================================================
function SetToEndOfDay(date) {
    const result = new Date(date); // 複製日期避免改動原始參數
    result.setHours(23, 59, 59, 999); // 時、分、秒、毫秒
    return result;
}

//====================================================
// 轉換日期格式 yyyy-MM-dd HH:mm:ss
//
//====================================================
function FormatDateTime(date) {
    const pad = (n) => n.toString().padStart(2, "0");

    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1); // 月份從 0 開始
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mi = pad(date.getMinutes());
    const ss = pad(date.getSeconds());

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

//====================================================
// 有沒有超過今天
//
//====================================================
function IsAfterToday(dateToCheck) {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // 設為今天的最後一秒

    return new Date(dateToCheck).getTime() > today.getTime();
}
