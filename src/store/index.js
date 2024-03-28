import { defineStore } from "pinia";
import dayjs from "dayjs";
import { getARiskOverview, getCreditNote, getDetail, getRelatedParty, getTaxation } from "../services";

export const useDataStore = defineStore('dataStore', {
  state: () => ({
    isReady: false,
    companyName: '', // 企业名称
    sj: '', // 时间
    sjShow: '', // 时间
    overviewList: [], // 概述检测结果
    // overviewHigh: {
    //   title: '高风险',
    //   titleStyle: '',
    //   lineStyle: '',
    //   thRowSpan: 2,
    //   flag: 1,
    //   list: []
    // }, // 概述高风险
    // overviewMediumTable: [],// 概述中风险
    // overviewLowTable: [],// 概述低风险
    overviewTable: []
  }),
  actions: {
    async getAllData(params, headers) {
      return new Promise((resolve, reject) => {
        Promise.all([
          getARiskOverview(params, headers),
          getCreditNote(params, headers),
          getDetail(params, headers),
          getRelatedParty(params, headers),
          // getTaxation(params, headers)
        ]).then(res => {
          let [overview, creditNote, detail, relatedParty, taxation] = res
          let flag = true
          try {
            if (detail.code == 200) {
              this.dealDetail(detail.data)
            }
            if (overview.code == 200) {
              this.dealOverviewList(overview.data)
              // this.dealOverviewHighList(overview.data)
              // this.dealOverviewMediumList(overview.data)
              // this.dealOverviewLowList(overview.data)
              this.dealOverviewTable(overview.data)
            }
            resolve(true)
          } catch (error) {
            flag = false
            console.log(error);
            reject(flag)
          }
        }).catch(err => {
          reject(false)
        })
      })
    },
    dealDetail(data) {
      this.companyName = data.qymc
      this.sj = data.bgsj
      this.sjShow = dayjs(data.bgsj).format("YYYY年MM月DD日")
    },
    dealOverviewList(data) {
      const types = {
        1: '税务风险',
        2: '税局风险',
        3: '',
        4: '业务伙伴风险',
      }
      this.overviewList = data.fxResultList.map(item => {
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
    },
    dealOverviewTable(data) {
      this.overviewTable = []
      let types = [
        {
          listName: 'highList',
          thTitle: '高风险',
          thStyle: '',
          thRowSpan: 1,
          tdStyle: '',
          tdRowSpan: 1,
        },
        {
          listName: 'mediumList',
          thTitle: '中风险',
          thStyle: '',
          thRowSpan: 1,
          tdStyle: '',
          tdRowSpan: 1,
        },
        {
          listName: 'lowList',
          thTitle: '低风险',
          thStyle: '',
          thRowSpan: 1,
          tdStyle: '',
          tdRowSpan: 1,
        }
      ]
      types.forEach(elem => {
        let listName = elem.listName
        let space = {
          isSpace: true
        }
        if (data[listName].length === 0) {
          let obj = {
            isSpace: false,
            thTitle: elem.thTitle,
            thStyle: elem.thStyle,
            thRowSpan: 2,
            tdRowSpan: 2,
            tdStyle: elem.tdStyle,
            isTh: true,
            isTd: true,
            isBlock: true
          }
          this.overviewTable.push(obj)
          this.overviewTable.push(space)
        } else if (data[listName].length === 1) {
          let obj = {
            isSpace: false,
            thTitle: elem.thTitle,
            thStyle: elem.thStyle,
            thRowSpan: 2,
            tdRowSpan: 2,
            tdStyle: elem.tdStyle,
            isTh: true,
            isTd: true,
            isBlock: false,
            fxlxmc: data[listName][0].fxlxmc,
            fxdmc: data[listName][0].fxdmc
          }
          this.overviewTable.push(obj)
          this.overviewTable.push(space)
        } else {
          let currentFxlx
          data[listName].forEach((item, index) => {
            let obj = {
              isSpace: false,
              thTitle: elem.thTitle,
              thStyle: elem.thStyle,
              thRowSpan: data[listName].length,
              tdRowSpan: 1,
              tdStyle: elem.tdStyle,
              isTh: false,
              isTd: false,
              isBlock: false,
              fxlxmc: item.fxlxmc,
              fxdmc: item.fxdmc
            }
            if (!currentFxlx || (currentFxlx && currentFxlx !== item.fxlx)) {
              currentFxlx = item.fxlx
              let length = data[listName].filter(val => val.fxlx === currentFxlx).length
              obj['tdRowSpan'] = length || 1
              obj['isTd'] = true
            }
            obj['isTh'] = index === 0
            obj['tdStyle'] = index % 2 === 1 ? '' : obj.tdStyle
            this.overviewTable.push(obj)
          })
        }
      })
      console.log(this.overviewTable);
    },
    // dealOverviewHighList(data) {
    //   let length = data['highList'].length
    //   if (length == 0) {
    //     this.overviewHigh.flag = 1
    //   } else if (length == 1) {
    //     this.overviewHigh.flag = 2
    //     this.overviewHigh.list.push({
    //       fxlxmc: data['highList'][0].fxlxmc,
    //       fxdmc: data['highList'][0].fxdmc,
    //     })
    //   } else if (length > 1) {
    //     this.overviewHigh.flag = 3
    //     let currentFxlx
    //     data['highList'].forEach((ele, index) => {
    //       let obj = {
    //         isTd: false,
    //         tdRowSpan: 1,
    //         fxlxmc: ele.fxlxmc,
    //         fxdmc: ele.fxdmc,
    //       }
    //       if (!currentFxlx || (currentFxlx && currentFxlx !== ele.fxlx)) {
    //         let tdRowSpan = data['highList'].filter(val => val.fxlx === currentFxlx).length
    //         obj['tdRowSpan'] = tdRowSpan
    //         obj['isTd'] = true
    //       }
    //       this.overviewHigh.list.push(obj)
    //     })
    //   }
    // },
    // dealOverviewMediumList(data) {
    //   if (data['mediumList'].length) {

    //   }
    // },
    // dealOverviewLowList(data) {
    //   if (data['lowList'].length) {

    //   }
    // },
  }
})