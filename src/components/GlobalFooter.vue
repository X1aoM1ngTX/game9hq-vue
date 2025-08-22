<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <div class="footer-logo">
          <img
            alt="Game9"
            class="footer-logo-icon"
            src="../assets/GAME9/game9-green.png"
          />
          <span class="footer-logo-text">Game9</span>
        </div>
        <p class="footer-description">为游戏玩家打造的智能平台</p>
      </div>

      <div class="footer-links">
        <div class="footer-column">
          <h4 class="footer-heading">产品</h4>
          <router-link to="/shop" class="footer-link">商城</router-link>
          <router-link to="/news" class="footer-link">社区</router-link>
          <router-link to="/notice" class="footer-link">公告</router-link>
        </div>
        <div class="footer-column">
          <h4 class="footer-heading">公司</h4>
          <router-link to="/about" class="footer-link">关于我们</router-link>
          <router-link to="/contact" class="footer-link">联系我们</router-link>
        </div>
        <div class="footer-column">
          <h4 class="footer-heading">社区</h4>
          <router-link to="/forum" class="footer-link">论坛</router-link>
          <router-link to="/blog" class="footer-link">博客</router-link>
          <a
            class="footer-link"
            href="https://github.com/X1aoM1ngTX"
            target="_blank"
            >开发者</a
          >
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; 2024 Game9. All rights reserved.</p>
    </div>
  </footer>
</template>

<script lang="ts" setup></script>

<style scoped>
/* 页脚样式 */
.footer {
  background: #f8f9fa;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding: 60px 20px 20px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 60px;
  margin-bottom: 40px;
}

.footer-section {
  text-align: left;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.footer-logo-icon {
  width: 32px;
  height: 32px;
}

.footer-logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #000000;
}

.footer-description {
  color: rgba(0, 0, 0, 0.7);
  font-size: 14px;
  line-height: 1.6;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.footer-column h4 {
  color: #000000;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.footer-link {
  display: block;
  color: rgba(0, 0, 0, 0.7);
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #00d4ff;
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.footer-bottom p {
  color: rgba(0, 0, 0, 0.5);
  font-size: 12px;
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .footer-links {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .footer-links {
    grid-template-columns: 1fr;
  }
}
</style>
