<template>
  <div id="basic-layout">
    <a-layout>
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer">
        <a href="https://space.bilibili.com/35291489">Code By 千夜の詩</a>
        <a href="https://www.antdv.com/components/overview-cn/"
          >Ant Design of Vue</a
        >
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from "@/components/GlobalHeader.vue";
// import { getCurrentUser } from "@/api/user";
//
// getCurrentUser().then((res) => {
//   console.log(res);
// });
</script>

<style scoped>
#basic-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

#basic-layout .header {
  background-color: #fff;
}

#basic-layout .content {
  flex: 1;
  padding: 0px;
  margin-bottom: 0px;
}

#basic-layout .footer {
  background-color: #ffffff;
  text-align: center;
}
</style>
