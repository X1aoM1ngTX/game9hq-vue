<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import BasicLayout from "@/layouts/BasicLayout.vue";
import BlankLayout from "@/layouts/BlankLayout.vue";
import { useLoginUserStore } from "@/store/useLoginUserStore";

const route = useRoute();
const layout = computed(() => {
  return route.meta.layout === "blank" ? BlankLayout : BasicLayout;
});

const loginUserStore = useLoginUserStore();

// 页面加载时获取用户信息
onMounted(() => {
  loginUserStore.getLoginUser();
});
</script>

<style>
#app {
  height: 100vh;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
