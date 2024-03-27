import { isJsonString } from "./index"
import CryptoJS from "crypto-js"

const AES_KEY = '1234567890hijklm'
const AES_IV = '1234567890abcdef'

// AES加解密类实例
let AesEncryptionInstance = null

export class AesEncryption {
  key
  iv

  constructor(key = AES_KEY, iv = AES_IV) {
    if (AesEncryptionInstance) {
      return AesEncryptionInstance
    }

    this.key = CryptoJS.enc.Utf8.parse(key);
    this.iv = CryptoJS.enc.Utf8.parse(iv);
  }

  get getOptions() {
    return {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      iv: this.iv
    }
  }

  encryptByAES(text) {
    text = typeof text === 'string' ? text : JSON.stringify(text)
    return CryptoJS.AES.encrypt(text, this.key, this.getOptions).toString()

  }

  decryptByAES(text) {
    text = CryptoJS.AES.decrypt(text, this.key, this.getOptions).toString(CryptoJS.enc.Utf8)
    return isJsonString(text) ? JSON.parse(text) : text
  }
}

export default AesEncryptionInstance = new AesEncryption(AES_KEY, AES_IV)