import { defineStore } from "pinia";

import { getARiskOverview, getCreditNote, getDetail, getRelatedParty, getTaxation } from "../services";
/* 
{
  
  const detailData = ref(null)
  const aRiskOverviewList = ref(null)
  const aRiskOverviewObj = ref(null)
  const creditNoteData = ref(null)
  const relatedPartyData = ref(null)
  const taxationData = ref(null)

  return { detailData, aRiskOverviewList, aRiskOverviewObj, creditNoteData, relatedPartyData, taxationData }
}
*/
export const useDataStore = defineStore('dataStore', {
  state: () => ({
    isReady: false,
    companyName: '', // 企业名称
    sj: '', // 时间
    sjShow: '', // 时间
    overviewList: [], // 概述检测结果

  }),
  actions: {
    async getAllData(params, headers) {
      return Promise.all([]).then()
      // try {
      //   let detail = await getDetail(params, headers)
      //   if (detail.code == 200) {
      //     this.dealDetail(detail.data)
      //   } else {
      //     return false
      //   }
      // } catch (error) {
      //   return false
      // }
    },
    dealDetail(data) {
      this.companyName = data.qymc
      this.sj = data.bgsj
      this.sjShow = dayjs(data.bgsj).format("YYYY年MM月DD日")
    }

  }
})