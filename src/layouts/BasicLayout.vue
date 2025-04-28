<template>
  <div class="basic-layout">
    <GlobalHeader class="header" />
    <div class="main-content">
      <router-view />
    </div>
    <GlobalFooter class="footer" />
  </div>
</template>

<script lang="ts" setup>
import GlobalHeader from "@/components/GlobalHeader.vue";
import GlobalFooter from "@/components/GlobalFooter.vue";
</script>

<style scoped>
.basic-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.main-content {
  flex: 1;
  background: #f5f5f5;
}

.footer {
  margin-top: auto;
}
</style>
