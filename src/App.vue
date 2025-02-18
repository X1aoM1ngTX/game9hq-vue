<template>
  <div :class="themeClass">
    <a-config-provider :theme="themeConfig">
      <component :is="layout">
        <router-view />
      </component>
    </a-config-provider>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import BasicLayout from "@/layouts/BasicLayout.vue";
import BlankLayout from "@/layouts/BlankLayout.vue";
import { useLoginUserStore } from "@/stores/useLoginUserStore";

const route = useRoute();
const layout = computed(() => {
  return route.meta.layout === "blank" ? BlankLayout : BasicLayout;
});

const loginUserStore = useLoginUserStore();

// 页面加载时获取用户信息
onMounted(() => {
  loginUserStore.getLoginUser();
});

const isDarkMode = ref(false);

const themeClass = computed(() =>
  isDarkMode.value ? "dark-mode" : "light-mode"
);

const themeConfig = computed(() => ({
  token: {
    colorPrimary: isDarkMode.value ? "#1f1f1f" : "#000000",
  },
}));

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
};
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

.light-mode {
  --background-color: #ffffff;
  --text-color: #000000;
}

.dark-mode {
  --background-color: #1f1f1f;
  --text-color: #ffffff;
}

body {
  background-color: var(--background-color);
  color: var(--text-color);
}

/* 在全局样式中定义 */
:root {
  --dropdown-bg-color: #ffffff;
  --dropdown-text-color: #000000;
}

.dark-mode {
  --dropdown-bg-color: #333333;
  --dropdown-text-color: #ffffff;
}

.light-mode {
  --dropdown-bg-color: #ffffff;
  --dropdown-text-color: #000000;
}

/* 在组件样式中应用 */
:deep(.ant-dropdown-menu) {
  background-color: var(--dropdown-bg-color);
  color: var(--dropdown-text-color);
}

:deep(.ant-dropdown-menu-item) {
  color: var(--dropdown-text-color);
}

:deep(.ant-dropdown-menu-item:hover) {
  background-color: var(--dropdown-bg-color);
  color: var(--dropdown-text-color);
}
</style>
