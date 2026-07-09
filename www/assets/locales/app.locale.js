window.used_locale = ""
//const setlations = {}; // 用於儲存已載入的翻譯資料

// function loadLocale(locale) {
//     return fetch(`locales/${locale}.json`)
//         .then(response => response.json())
//         .then(data => {
//             translations[locale] = data;
//         });
// }
//
// function getTranslation(page, key) {
//     return translations[locale][page][key] || key; // 若找不到翻譯，則回傳原始 key
// }

// function loadScript(src) {
//     return new Promise((resolve, reject) => {
//         const script = document.createElement('script');
//         script.src = src;
//         script.type = 'text/javascript';
//         script.onload = () => resolve();
//         script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
//         document.head.appendChild(script);
//     });
// }

function setLocaleData(lang) {

    if (window.used_locale != lang) {
        window.localeData = null;
    }

    // 不重新加載
    if (!window.localeData) {
        //addScript(`<script src="locales/${lang}.js"></script>`);
        document.write(`<script src="locales/${lang}.js"></script>`);
        window.used_locale = lang;
    }
}

// 直接這邊設定 以免他讀不到 或影響後面的 addlistner
setLocaleData('zh-tw');

function renderTemplate(lang, element_id) {

    // 動態載入語言檔案
    //loadScript(`locales/${lang}.js`);

    console.log("renderTemplate");

    const localeData = window.localeData;
    //console.log("string", window.localeData.login.title);

    if (localeData) {
        const template = document.getElementById(element_id).innerHTML;
        const rendered = Mustache.render(template, localeData);
        document.getElementById(element_id).innerHTML = rendered;
    }
}

// 取得對應字串
// e.g. key = common.ok
function GetLocalData(key) {
    if (window.localeData) {
        return key.split('.').reduce((obj, k) => obj?.[k], window.localeData);
    }
    return '';
}