<template>
  <div class="global-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>关于 游情9局</h3>
        <p>游情9局是一个专业的游戏分享平台，致力于为玩家提供优质的游戏体验。</p>
      </div>
      <div class="footer-section">
        <h3>联系我们</h3>
        <p>邮箱：support@game9.com</p>
        <p>电话：400-123-4567</p>
      </div>
      <div class="footer-section">
        <h3>快速链接</h3>
        <router-link to="/">首页</router-link>
        <router-link to="/shop">商城</router-link>
        <router-link to="/user/profile">个人中心</router-link>
        <router-link to="/about">关于我们</router-link>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2024 Game9. All rights reserved.</p>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.global-footer {
  background-color: #000000;
  color: #ffffff;
  padding: 40px 0 20px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  padding: 0 20px;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-section h3 {
  color: #ffffff;
  font-size: 18px;
  margin-bottom: 16px;
}

.footer-section p {
  color: #ffffff;
  margin: 0;
  line-height: 1.5;
}

.footer-section a {
  color: #ffffff;
  text-decoration: none;
  display: block;
  margin-bottom: 8px;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: #ffffff;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.footer-bottom {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #1f1f1f;
  text-align: center;
}

.footer-bottom p {
  color: #ffffff;
  margin: 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
