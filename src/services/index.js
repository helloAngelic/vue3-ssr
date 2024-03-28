import request from "../utils/request"

//获取风险概述
export function getARiskOverview(params, headers) {
  return request({
    url: '/risk-detection-service/wzbg/getARiskOverview',
    method: 'get',
    params, headers
  })
}
//税局风险提醒--总
export function getCreditNote(params, headers) {
  return request({
    url: '/risk-detection-service/wzbg/getCreditNote',
    method: 'get',
    params, headers
  })
}
//业务伙伴风险提醒--总
export function getRelatedParty(params, headers) {
  return request({
    url: '/risk-detection-service/wzbg/getRelatedParty',
    method: 'get',
    params, headers
  })
}
//税务风险提醒--总
export function getTaxation(params, headers) {
  return request({
    url: '/risk-detection-service/wzbg/getTaxation',
    method: 'get',
    params, headers
  })
}
// 获取报告的相关信息
export function getDetail(params, headers) {
  return request({
    url: '/risk-detection-service/wzbg/getDetail',
    method: 'get',
    params, headers
  })
}
// 下载pdf
export function downloadPDF(params, headers) {
  return request({
    url: '/risk-detection-service/fxBg/downloadPDF',
    method: 'get',
    params, headers
  })
}
//是否有权限查看某个报告
export function whetherYouHavePermission(params, headers) {
  return request({
    url: '/risk-detection-service/wzbg/whetherYouHavePermission',
    method: 'get',
    params, headers,
  })
}
// 第三方登录
export function accessToken(params) {
  return request({
    url: '/risk-detection-service/fxSysUser/accessToken',
    method: 'post',
    data: params
  })
}