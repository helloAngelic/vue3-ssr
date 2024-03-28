<script setup>
import { onMounted, onServerPrefetch, ref, useSSRContext } from "vue";
// api
import { accessToken, downloadPDF, whetherYouHavePermission } from "../services/index";
// utils
import { parseUrl, toDeal } from "./func";
import { useDataStore } from "../store";

// ref
const lydm = ref("");
const bgId = ref("");
const headers = ref(null);

const isReady = ref(true);
const isServer = ref(false); // 服务器是否正常
const isPDF = ref(false); // 是否生成PDF
const isAuth = ref("1"); // 是否有权限：1.服务器错误；2.无权限；

// store
const dataStore = useDataStore();
// data
// const detailData = ref(null); // 报告详情数据
// const overviewList = ref(null); // 报告详情数据
// const overviewObj = ref(null); // 报告详情数据
// const creditNoteData = ref(null); // 税局风险数据
// const relatedPartyData = ref(null); // 关系伙伴风险数据
// const taxationData = ref(null); // 税务风险数据

onServerPrefetch(async () => {
  const ctx = useSSRContext();
  let searchParams = parseUrl(ctx.url);
  let { id, token, info } = searchParams;
  // init Ref
  bgId.value = id || "";
  lydm.value = searchParams.lydm || "nqa";
  isPDF.value = new Boolean(searchParams.isPDF);
  // isLogin
  if ((lydm.value == "h5" || lydm.value == "nqa") && token && id) {
    // 不需要登录
    headers.value = {
      "X-Access-Token": token,
    };
  } else if (lydm.value !== "h5" && lydm.value != "nqa" && (token || info) && id) {
    // 第三方登录
    try {
      let res = await accessToken({
        lydm: lydm.value,
        token,
        info,
      });
      if (res.code == 200) {
        headers.value = {
          "X-Access-Token": res.data.accessToken,
        };
      } else {
        isReady.value = false;
        isAuth.value = "1";
      }
    } catch (error) {
      isReady.value = false;
      isAuth.value = "1";
    }
  } else {
    isReady.value = false;
    isAuth.value = "1";
  }
  if (!isReady.value) return;
  let params = {
    bgId: bgId.value,
  };
  // isPermission
  try {
    if (!isPDF.value) {
      let res = await whetherYouHavePermission(params, headers.value);
      if (res.code == 200 && !res.data) {
        isAuth.value = "2";
      } else {
        isReady.value = false;
        isAuth.value = "1";
      }
    }
  } catch (error) {
    isReady.value = false;
    isAuth.value = "1";
  }
  if (!isReady.value) return;
  //  data
  try {
    let res = await dataStore.getAllData(params, headers.value);
    if (!res) {
      console.log("error");
      isReady.value = false;
      isAuth.value = "1";
    }
    // let res = await toDeal(params, headers.value);
    // const [detail, overview, creditNote, relatedParty, taxation] = res;
    // dataStore.detailData = detail ? detail.data : null;
    // dataStore.aRiskOverviewList = overview && overview.list ? overview.list : [];
    // dataStore.aRiskOverviewObj = overview && overview.table ? overview.table : [];
    // dataStore.creditNoteData = creditNote ? creditNote.data : [];
    // dataStore.relatedPartyData = relatedParty ? relatedParty.data : [];
    // dataStore.taxationData = taxation ? taxation.data : [];
  } catch (error) {
    isReady.value = false;
    isAuth.value = "1";
  }
  if (!isReady.value) return;
});

onMounted(async () => {
  console.log(dataStore);
  // detailData.value = dataStore.detailData;
  // overviewList.value = dataStore.aRiskOverviewList;
  // overviewObj.value = dataStore.aRiskOverviewObj;
  // creditNoteData.value = dataStore.creditNoteData;
  // relatedPartyData.value = dataStore.relatedPartyData;
  // taxationData.value = dataStore.taxationData;
});
</script>

<template>
  <!-- 可展示内容 -->
  <main v-show="isReady" class="print-pdf">
    <!-- banner -->
    <section class="banner">
      <img src="../assets/banner.png" alt="" class="img" />
      <div class="banner-content">
        <img src="../assets/banner-title.png" alt="" class="banner-title" />
        <h1 class="title">{{ dataStore.companyName || "企业名称" }}</h1>
        <p class="time">
          <img src="../assets/banner-time.png" alt="" class="banner-time" />
          报告生成时间：{{ dataStore.sj || "报告时间" }}
        </p>
      </div>
    </section>
    <!-- 报告说明 -->
    <section class="description">
      <header class="section-title-wrapper">
        <h1 class="section-title">
          <span>报告说明</span>
          <img src="../assets/title.png" alt="" class="img" />
        </h1>
      </header>
      <main class="content">
        <p class="text">经报告所涉主体授权同意，本报告由爱信诺征信有限公司（下称“爱信诺”）提供、且仅提供给经报告所涉主体确认的特定主体使用。</p>
        <p class="text">
          本报告构成商业机密。未经报告所涉主体及爱信诺同意，该等特定主体不得将本报告用于除上述授权目的之外的其他任何目的/用途；其他任何企业、机构或个人不得查看、保存、公布、泄露、提供、使用本报告中的任何内容/信息，不得将本报告之任何内容/信息用于任何目的/用途。否则，爱信诺保留采取一切法律手段追究其法律责任的权利。
        </p>
        <p class="text">
          本报告知识产权归属于爱信诺所有。未经爱信诺同意，任何企业、机构或个人不得发表、修改、歪曲、篡改、发行、展示、改编本报告全部或部分内容，不得以任何形式复制、转发或公开传播本报告的全部或部分内容，不得将本报告之全部或部分用于营利或未经允许的其他任何用途。爱信诺保留不同时期或由于某些原因，对企业风险检测报告的修改权、实时更新权、以及对企业信息异议的更正权。否则，爱信诺保留采取一切法律手段追究其法律责任的权利。
        </p>
        <p class="text">
          爱信诺恪守独立、客观和公正的原则，为报告所涉主体提供专业信用评估报告。除非特别声明，本报告信息未经复核，爱信诺力求但不保证报告数据的准确性、时效性和完整性。在任何情况下，爱信诺不对因使用本报告而产生的任何后果承担法律责任，不承担由于因此而引起的损失和损害。
        </p>
      </main>
    </section>
    <!-- 目录 -->
    <section class="directory">
      <header class="section-title-wrapper">
        <h1 class="section-title">
          <span>目&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;录</span>
          <img src="../assets/title.png" alt="" class="img" />
        </h1>
      </header>
      <main class="content"></main>
    </section>
    <!-- 风险概述 -->
    <section class="overview">
      <header class="section-title-wrapper">
        <h1 class="section-title">
          <span>一、风险概述</span>
          <img src="../assets/title.png" alt="" class="img" />
        </h1>
      </header>
      <main class="content">
        <p class="text">本次报告生成时间为 {{ dataStore.sjShow }}，通过对发票、财务报表、纳税申报表的综合分析检测结果如下:</p>
        <section style="margin-bottom: 30px">
          <table width="100%" class="table1">
            <tbody>
              <tr>
                <th>风险类型</th>
                <th>检测项</th>
                <th>风险数</th>
              </tr>
              <tr v-for="(item, index) in dataStore.overviewList" :key="index" :style="index % 2 === 1 ? '' : 'background:#f5f5f5'">
                <td>{{ item.fxlx }}</td>
                <td>{{ item.jcx }}</td>
                <td :style="item.fxsStyle">{{ item.fxs }}</td>
              </tr>
            </tbody>
          </table>
        </section>
        <!-- <section>
          <table width="100%" class="table2" v-if="overviewObj">
            <colgroup>
              <col width="8%" />
              <col width="46%" />
              <col width="46%" />
            </colgroup>
            <tbody>
              <tr>
                <td colspan="3" class="head">税务风险</td>
              </tr>
              <template v-for="(item, index) in overviewObj?.highList">
                <tr>
                  <td v-if="index == 0" class="high th" :rowspan="overviewObj?.highListLength">高风险</td>
                  <td v-if="item.isFirst" :rowspan="item.rowSpan1">{{ item.fxlxmc }}</td>
                  <td :rowspan="item.rowSpan2">{{ item.fxdmc }}</td>
                </tr>
              </template>

              <tr>
                <td class="medium th">中风险</td>
              </tr>
              <tr>
                <td class="low th">低风险</td>
              </tr>
            </tbody>
          </table>
        </section> -->
      </main>
    </section>
    <!-- 税务风险提示 -->
    <section class="taxation">
      <header class="section-title-wrapper">
        <h1 class="section-title">
          <span>二. 税务风险提示</span>
          <img src="../assets/title.png" alt="" class="img" />
        </h1>
      </header>
      <main class="content"></main>
    </section>
    <!-- 税局风险提示 -->
    <section class="creditNoteF">
      <header class="section-title-wrapper">
        <h1 class="section-title">
          <span>三. 税局风险提示</span>
          <img src="../assets/title.png" alt="" class="img" />
        </h1>
      </header>
      <main class="content"></main>
    </section>
    <!-- 业务伙伴风险 -->
    <section class="relatedParty">
      <header class="section-title-wrapper">
        <h1 class="section-title">
          <span>四. 业务伙伴风险提示</span>
          <img src="../assets/title.png" alt="" class="img" />
        </h1>
      </header>
      <main class="content"></main>
    </section>
  </main>
  <!-- 不可展示-服务器错误 -->
  <main v-show="!isReady" class="error">
    <img src="../assets/404.svg" alt="" class="error-img" />
    <span>{{ isAuth && isAuth === "1" ? "抱歉，服务器出现异常!" : "抱歉，无权查看他人报告" }}</span>
  </main>
</template>

<style>
@import url("./index.css");
</style>
./q.js
