<script setup>
import { onMounted, onServerPrefetch, ref, useSSRContext } from "vue";
// api
import { getARiskOverview, getCreditNote, getDetail, getRelatedParty, getTaxation, downloadPDF, whetherYouHavePermission } from "../services/index";
// utils
import { parseUrl, toRequest, toDealDetail } from "./indexView.js";

// ref
const lydm = ref("");
const bgId = ref("");
const headers = ref(null);

const isReady = ref(true);
const detailData = ref(null);

onServerPrefetch(async () => {
  const ctx = useSSRContext();
  const searchParams = parseUrl(ctx.url);
  try {
    let res = await toRequest(searchParams);
    setRef(res);
  } catch (error) {
    console.log(`Error toRequest: "${error}". Using original value`);
  }
  if (isReady.value) {
    try {
      let params = {
        bgId: bgId.value,
      };
      let res = await toDealDetail(params, headers.value);
      detailData.value = res;
    } catch (error) {
      console.log("getARiskOverview", error);
    }
  }
});

onMounted(async () => {});

// 设置ref
function setRef(searchParams) {
  if (searchParams.success) {
    lydm.value = searchParams.lydm || "nqa";
    bgId.value = searchParams.id || "";
    headers.value = {
      "X-Access-Token": searchParams.token,
    };
    isReady.value = searchParams.success;
  }
}
</script>

<template>
  <!-- 可展示内容 -->
  <main v-if="isReady" class="print-pdf">
    <!-- banner -->
    <section class="banner">
      <img src="../assets/banner.png" alt="" class="img" />
      <div class="banner-content">
        <img src="../assets/banner-title.png" alt="" class="banner-title" />
        <h1 class="title">{{ detailData.qymc || "广东航天信息爱信诺科技有限公司" }}</h1>
        <p class="time">
          <img src="../assets/banner-time.png" alt="" class="banner-time" />
          报告生成时间：{{ detailData.bgsj || "2023-10-20" }}
        </p>
      </div>
    </section>
    <!-- 报告说明 -->
    <section class="description">
      <header class="section-title-wrapper">
        <h1 class="section-title">
          报告说明
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
          目&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;录
          <img src="../assets/title.png" alt="" class="img" />
        </h1>
      </header>
      <main class="content"></main>
    </section>
    <!-- 风险概述 -->
    <section class="">
      <header class="section-title-wrapper">
        <h1 class="section-title">
          一、风险概述
          <img src="../assets/title.png" alt="" class="img" />
        </h1>
      </header>
      <main class="content"></main>
    </section>
    <!-- 税务风险提示 -->
    <section class=""></section>
    <!-- 税局风险提示 -->
    <section class=""></section>
    <!-- 业务伙伴风险 -->
    <section class=""></section>
  </main>
  <!-- 不可展示 -->
  <main v-if="!isReady"></main>
</template>

<style>
@import url("./indexView.css");
</style>
