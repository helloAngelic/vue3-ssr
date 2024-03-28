import AesEncryptionInstance from "../utils/cipher"
import { getARiskOverview, getCreditNote, getDetail, getRelatedParty, getTaxation } from "../services"
import dayjs from "dayjs"

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
    console.log(`Error ciphering: "${error}". Using original value`);
  }
  return text
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
/**
 * 提前获取数据
 * @param {object} params 参数
 * @param {object} headers 请求头
 * @returns 
 */
export async function toDeal(params, headers) {
  return Promise.all([
    toDealDetail(params, headers),
    toDealARiskOverview(params, headers),
    toDealCreditNote(params, headers),
    toDealRelatedParty(params, headers),
    // toDealTaxation(params, headers)
  ])
}

async function toDealDetail(params, headers) {
  return new Promise(async (resolve, reject) => {
    getDetail(params, headers).then(res => {
      if (res.code == 200) {
        resolve({
          data: {
            qymc: res.data.qymc,
            bgsj: res.data.bgsj,
            bgsjShow: dayjs(res.data.bgsj).format("YYYY年MM月DD日")
          }
        })
      } else {
        reject(false)
      }
    }).catch(err => {
      reject(false)
    })
  })
}
async function toDealARiskOverview(params, headers) {
  return new Promise(async (resolve, reject) => {
    getARiskOverview(params, headers).then(res => {
      if (res.code == 200) {
        const { list, table } = formatOverviewData(res.data)
        resolve({ list })
      } else {
        reject(false)
      }
    }).catch(err => {
      reject(false)
    })
  })
}
async function toDealCreditNote(params, headers) {
  return new Promise(async (resolve, reject) => {
    getCreditNote(params, headers).then(res => {
      if (res.code == 200) {
        let creditNote = formatCreditNote(res.data)
        resolve({ data: creditNote })
      } else {
        reject(false)
      }
    }).catch(err => {
      reject(false)
    })
  })
}
async function toDealRelatedParty(params, headers) {
  return new Promise(async (resolve, reject) => {
    getRelatedParty(params, headers).then(res => {
      if (res.code == 200) {
        let relatedParty = formatRelatedParty(res.data)
        resolve({ data: relatedParty })
      } else {
        reject(false)
      }
    }).catch(err => {
      reject(false)
    })
  })
}
async function toDealTaxation(params, headers) {
  return new Promise(async (resolve, reject) => {
    getTaxation(params, headers).then(res => {
      if (res.code == 200) {
        resolve({ data: res.data })
      } else {
        reject(false)
      }
    }).catch(err => {
      reject(false)
    })
  })
}


function formatOverviewData(data) {
  let list = [], table = {
    highListRowSpan: 2,
    highList: [],
    mediumListRowSpan: 2,
    mediumList: [],
    lowListRowSpan: 2,
    lowList: []
  }
  const types = {
    1: '税务风险',
    2: '税局风险',
    3: '',
    4: '业务伙伴风险',
  }
  const overviewTypes = [
    {
      thTitle: '高风险',
      listName: 'highList',
      thStyle: 'background-color: #a04f66',
      // thClass: 'table-title print-bgA04F66',
      // tdClass: 'print-bgFCF9FA',
      tdStyle: 'background-color: #fcf9fa;',
    },
    {
      thTitle: '中风险',
      listName: 'mediumList',
      thStyle: 'background-color: #9e6a4e;',
      // thClass: 'table-title print-bg9E6A4E',
      // tdClass: 'print-bgFCFAF9',
      tdStyle: 'background-color: #fcfaf9;',
    },
    {
      thTitle: '低风险',
      listName: 'lowList',
      thStyle: 'background-color: #9f8d4f;',
      // thClass: 'table-title print-bg9F8D4F',
      // tdClass: 'print-bgFCFBF9',
      tdStyle: 'background-color: #fcfbf9;',
    },
  ]
  list = data.fxResultList.map(item => {
    return {
      detectionNo: item.detectionNo,
      fxlx: types[item.detectionNo],
      jcx: item.detectionNum,
      fxs: item.riskNum,
      fxsStyle: 'color: #E73856;'
    }
  }).sort((a, b) => {
    return a.detectionNo < b.detectionNo
  })

  for (const key of Object.keys(table)) {
    if (data[key] && data[key].length == 1) {
      table[key].push({
        fxlxmc: data[key][0].fxlxmc,
        fxdmc: data[key][0].fxdmc,
        rowSpan1: 2,
        rowSpan2: 2,
        isFirst: true
      })
      table[key + 'Length'] = 2
    }
    if (data[key] && data[key].length > 1) {
      let currentFxlx
      data[key].forEach((ele, index) => {
        let obj = {
          fxlxmc: ele.fxlxmc,
          fxdmc: ele.fxdmc,
          rowSpan1: 1,
          rowSpan2: 1,
          isFirst: false
        }
        if (!currentFxlx || (currentFxlx && currentFxlx !== fxlx)) {
          currentFxlx = ele.fxlx
          let itemNumber = data[key].filter(val => val.fxlx === currentFxlx).length
          obj['rowSpan1'] = itemNumber
          obj['isFirst'] = true
        }
        table[key].push(obj)
      })
    }
  }
  return { list, table }
}
function formatCreditNote(data) {
  let creditNote = []

  return creditNote
}
function formatRelatedParty(data) {
  let relatedParty = []

  return relatedParty
}




// let url = '/printReport?id=JCiYnjgxAxffC0PA7eEVSA%3D%3D&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYmYiOjE3MTE1MDkzNTYsImV4cCI6MTcxMTU5NTc1NiwiaWF0IjoxNzExNTA5MzU2LCJ1c2VySWQiOjE0NDEsImxvZ2luSWRlbnRpZmljYXRpb24iOiJlZTcwOGNmYzZjMGI0YzY4YWEyNmRiZjA5ZjkyZjhmNCJ9.UJpHwNhROQGAvJAqWb9KW8tLXTtfOQU1MqPZa0d3sZE&lydm=h5'
// https://nqa-pre.aisino.cn/#/printReport?id=%2Fc3lOfgl%2BhPkWL%2FyNxeXow%3D%3D&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYmYiOjE3MTE1MTY0NzgsImV4cCI6MTcxMTYwMjg3OCwiaWF0IjoxNzExNTE2NDc4LCJ1c2VySWQiOjEzNjcsImxvZ2luSWRlbnRpZmljYXRpb24iOiJiMjQ0NWMzOWNhMGI0YjZlYTNiZjdiZGJiNThhMWExMCJ9.uwo2xO6w9_ihmgLVJ4WYistwkBpZ1nvIgrFr0pHarRw&lydm=h5