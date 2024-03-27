<script setup>
import { onMounted, onServerPrefetch, ref, useSSRContext } from "vue";
// api
import { getARiskOverview, getCreditNote, getDetail, getRelatedParty, getTaxation, downloadPDF, whetherYouHavePermission } from "../services/index";
// utils
import { parseUrl, toRequest } from "./IndexView";

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
  <header>Hello, World!</header>
  <main>
    {{ data }}
  </main>
</template>
