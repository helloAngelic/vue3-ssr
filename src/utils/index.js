/**
 * 判断是否是JSON字符串
 * @param {string} text 
 * @returns {boolean}
 */
export function isJsonString(text) {
  try {
    let obj = JSON.parse(text)
    if (obj && typeof obj === 'object') {
      return true
    }
  } catch (error) { }
  return false
}