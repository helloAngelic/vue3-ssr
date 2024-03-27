<script setup>
import { onMounted, onServerPrefetch, ref, useSSRContext } from "vue";
// api
import { getARiskOverview, getCreditNote, getDetail, getRelatedParty, getTaxation, downloadPDF, whetherYouHavePermission } from "../services/index";
// utils
import { parseUrl, toRequest } from "./indexView.js";

// ref
const lydm = ref("");
const bgId = ref("");
const headers = ref(null);

const isReady = ref(false);
const data = ref(null);

onServerPrefetch(async () => {
  const ctx = useSSRContext();
  const searchParams = parseUrl(ctx.url);
  try {
    let res = await toRequest(searchParams);
    setRef(res);
  } catch (error) {
    console.log("toRequest", error);
  }
  if (isReady.value) {
    try {
      let params = {
        bgId: bgId.value,
      };
      let res = await getARiskOverview(params, headers.value);
      console.log("接口数据", res.data);
      data.value = res;
    } catch (error) {
      console.log("getARiskOverview", error);
    }
  }
});

onMounted(async () => {
  console.log("data", data.value);
});

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
  <main v-if="isReady">
    <!-- banner -->
    <section class="banner">
      <img src="../assets/print_banner.png" alt="" />
      <img src="" alt="" />
      <img src="" alt="" />
    </section>
    <!-- 报告说明 -->
    <section class=""></section>
    <!-- 目录 -->
    <section class=""></section>
    <!-- 风险概述 -->
    <section class=""></section>
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
