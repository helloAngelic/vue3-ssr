// function isJsonString(text) {
//   try {
//     let obj = JSON.parse(text)
//     if (obj && typeof obj === 'object') {
//       return true
//     }
//   } catch (error) { }
//   return false
// }
// import CryptoJS from "crypto-js"

// const AES_KEY = '1234567890hijklm'
// const AES_IV = '1234567890abcdef'

// // AES加解密类实例
// let AesEncryptionInstance = null

// class AesEncryption {
//   key
//   iv

//   constructor(key = AES_KEY, iv = AES_IV) {
//     if (AesEncryptionInstance) {
//       return AesEncryptionInstance
//     }

//     this.key = CryptoJS.enc.Utf8.parse(key);
//     this.iv = CryptoJS.enc.Utf8.parse(iv);
//   }

//   get getOptions() {
//     return {
//       mode: CryptoJS.mode.CBC,
//       padding: CryptoJS.pad.Pkcs7,
//       iv: this.iv
//     }
//   }

//   encryptByAES(text) {
//     text = typeof text === 'string' ? text : JSON.stringify(text)
//     return CryptoJS.AES.encrypt(text, this.key, this.getOptions).toString()

//   }

//   decryptByAES(text) {
//     text = CryptoJS.AES.decrypt(text, this.key, this.getOptions).toString(CryptoJS.enc.Utf8)
//     return isJsonString(text) ? JSON.parse(text) : text
//   }
// }

// AesEncryptionInstance = new AesEncryption(AES_KEY, AES_IV)


/*

*/
import AesEncryptionInstance from "../utils/cipher"
import { login } from "../services"

const PLUS_RE = /\+/g // %2B
const SPACE_RE = /%253D/g

/**
 * decode
 * @param {string} text 
 * @returns 
 */
function decode(text) {
  try {
    return decodeURIComponent('' + text)
  } catch (err) {
    console.log(`Error decoding "${text}". Using original value`)
  }
  return '' + text
}

/**
 * 解密
 * @param {string} text 
 * @returns 
 */
function toCipher(text) {
  try {
    text = AesEncryptionInstance.decryptByAES(text) || text
    return text
  } catch (error) {
    console.log(`Error cipher: ${error}`);
  }
  return text
}

export async function toRequest(searchParams) {
  const { lydm, id, token, info } = searchParams
  return new Promise((resolve, reject) => {
    if (!token && !info) {
      resolve({ success: false })
    } else {
      if (lydm == 'h5') {
        resolve({
          lydm, token, id, success: true
        })
      } else {
        let params = {
          lydm, token, info
        }
        login(params).then(res => {
          if (res.code == 200) {
            resolve({
              lydm, token: res.data.accessToken, id, success: true
            })
          } else {
            reject({ success: false })
          }
        }).catch(err => {
          reject({ success: false })
        })
      }
    }

  })


}

/**
 * 解析url
 * @param {string} url 
 */
export function parseUrl(url) {
  const index = url.indexOf('?')
  const query = {}
  if (url === '' || url === '/' || url === '?' || url.indexOf('?') === -1) return query

  const search = url.slice(index + 1)
  const searchParams = search.split('&')
  for (let i = 0; i < searchParams.length; ++i) {
    // pre decode the + into space
    const searchParam = searchParams[i].replace(PLUS_RE, ' ').replace(SPACE_RE, '=')
    // allow the = character
    const eqPos = searchParam.indexOf('=')
    const key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos))
    const value = toCipher(eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1)))


    if (key in query) {
      // an extra variable for ts types
      let currentValue = query[key]
      if (!isArray(currentValue)) {
        currentValue = query[key] = [currentValue]
      }
      // we force the modification
      currentValue.push(value)
    } else {
      query[key] = value
    }
  }
  return query
}


// let url = '/printReport?id=JCiYnjgxAxffC0PA7eEVSA%3D%3D&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYmYiOjE3MTE1MDkzNTYsImV4cCI6MTcxMTU5NTc1NiwiaWF0IjoxNzExNTA5MzU2LCJ1c2VySWQiOjE0NDEsImxvZ2luSWRlbnRpZmljYXRpb24iOiJlZTcwOGNmYzZjMGI0YzY4YWEyNmRiZjA5ZjkyZjhmNCJ9.UJpHwNhROQGAvJAqWb9KW8tLXTtfOQU1MqPZa0d3sZE&lydm=h5'
// console.log(parseUrl(url));
// https://nqa-pre.aisino.cn/#/printReport?id=%2Fc3lOfgl%2BhPkWL%2FyNxeXow%3D%3D&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYmYiOjE3MTE1MTY0NzgsImV4cCI6MTcxMTYwMjg3OCwiaWF0IjoxNzExNTE2NDc4LCJ1c2VySWQiOjEzNjcsImxvZ2luSWRlbnRpZmljYXRpb24iOiJiMjQ0NWMzOWNhMGI0YjZlYTNiZjdiZGJiNThhMWExMCJ9.uwo2xO6w9_ihmgLVJ4WYistwkBpZ1nvIgrFr0pHarRw&lydm=h5