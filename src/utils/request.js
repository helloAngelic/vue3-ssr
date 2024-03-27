import axios from "axios";
import AesEncryptionInstance from "./cipher"

const axiosInstance = axios.create({
  baseURL: import.meta.env.BASE_URL,
  timeout: 600000
})

const baseURL = 'https://nqa-pre.aisino.cn/'

axiosInstance.interceptors.request.use(config => {
  const _urlArr = config.url.split('/')
  const _method = config.method
  const apiFlag = import.meta.env.VITE_SERVICES_FLAG

  config.url = baseURL + (apiFlag || '') + config.url
  // 加密
  if (import.meta.env.VITE_IS_REQUEST_CIPHER === 'true') {
    if (_method === 'get') {
      config.params = config.params ? {
        data: AesEncryptionInstance.encryptByAES(JSON.stringify(config.params))
      } : null
    }
    if (_method === 'post') {
      config.data = config.data ? {
        data: AesEncryptionInstance.encryptByAES(JSON.stringify(config.data))
      } : null
    }
  }

  return config
}, error => {
  return Promise.reject(error)
})

axiosInstance.interceptors.response.use(
  response => {
    const res = {}
    const status = response.status
    let code, data
    // 解密
    if (import.meta.env.VITE_IS_REQUEST_CIPHER === 'true' && !response.data.code) {
      data = JSON.parse(AesEncryptionInstance.decryptByAES(response.data.data))
    } else {
      data = response.data
    }

    code = status !== 200 ? status : response.data.code || status
    // code码处理
    if (code == 500) {
      return {
        code,
        data: data.data || data.result,
        message: data.message || data.msg || data.userMsg
      }
    } else if (code == 404) {
      return {
        code,
        data: data.data || data.result,
        message: data.message || data.msg
      }
    } else if (code == 200) {
      return {
        code,
        data: data.data || data.result,
        message: data.message || data.msg
      }
    }

  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
        case 500:
        case 404:
      }
    } else {
      return Promise.reject(error.message)
    }
  }
)

export default axiosInstance