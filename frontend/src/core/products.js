//  全域產品名稱對照表 (原 modules/app.module.def.js)
export const PRODUCT_DICTIONARY = {
  avacast: 'AVACAST',
  illuminet: 'IllumiNet',
  avaclassroom: 'AVA Classroom',
}

// 取得產品顯示名稱 (如果找不到對應，就將第一個字母大寫)
export function getProductName(productKey) {
  if (!productKey) return ''
  return (
    PRODUCT_DICTIONARY[productKey] ||
    productKey.charAt(0).toUpperCase() + productKey.slice(1)
  )
}
