<template>
  <a-layout class="basic-layout">
    <a-layout-header class="header">
      <GlobalHeader />
    </a-layout-header>
    <a-layout-content class="content">
      <router-view />
    </a-layout-content>
    <a-layout-footer class="footer">
      <div class="footer-content">
        <div class="footer-links">
          <a href="https://space.bilibili.com/35291489">关于我们</a>
          <a href="https://www.antdv.com/">帮助中心</a>
          <a href="#">用户协议</a>
          <a href="#">隐私政策</a>
        </div>
        <div class="copyright">© 2024 GameHub. All rights reserved.</div>
      </div>
    </a-layout-footer>
  </a-layout>
</template>

<script setup lang="ts">
import GlobalHeader from "@/components/GlobalHeader.vue";
</script>

<style scoped>
.basic-layout {
  min-height: 100vh;
}

.header {
  position: fixed;
  width: 100%;
  z-index: 1000;
  padding: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 0 2px 4px rgba(0, 0, 0, 0.03),
    0 4px 8px rgba(0, 0, 0, 0.03);
}

.content {
  margin-top: 64px;
  min-height: calc(100vh - 64px - 70px);
  background: #f8fafc;
}

.footer {
  background: white;
  padding: 24px 0;
  box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.03);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footer-links {
  margin-bottom: 12px;
}

.footer-links a {
  color: #666;
  margin: 0 12px;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #1890ff;
}

.copyright {
  color: #999;
  font-size: 14px;
}

@media screen and (max-width: 768px) {
  .footer-links a {
    margin: 0 8px;
    font-size: 14px;
  }
}
</style>
