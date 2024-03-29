<script setup>
import { onMounted, onServerPrefetch, ref, useSSRContext } from "vue";
// utils
import { useDataStore } from "../store";
import { parseUrl } from "../utils/query-encoding";
// store
const dataStore = useDataStore();
// data

onServerPrefetch(async () => {
  const ctx = useSSRContext();
  let searchParams = parseUrl(ctx.url);
  try {
  } catch (error) {}
});

onMounted(async () => {
  console.log(dataStore);
});
</script>

<template></template>

<style></style>
