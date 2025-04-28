<template>
  <div class="home-page">
    <div class="content">
      <div class="logo-area">
        <img alt="logo" class="logo" src="../assets/dice-d20-solid.svg" />
        <h1>GameHub</h1>
      </div>
      <p class="slogan">
        无论您是初出茅庐的玩家，还是资深游戏达人，GameHub
        将是您最坚实的游戏港湾。
      </p>
      <div class="action-area">
        <a-button
          class="main-button"
          size="large"
          type="primary"
          @click="handleButtonClick"
        >
          {{ loginUserStore.hasLogin ? "开始探索" : "立即开启" }}
        </a-button>
      </div>
      <div class="feature-cards">
        <div class="feature-card">
          <div class="icon">🎮</div>
          <h3>海量游戏</h3>
          <p>精选全球优质游戏，满足您的各类游戏需求</p>
        </div>
        <div class="feature-card">
          <div class="icon">🔒</div>
          <h3>安全可靠</h3>
          <p>正版保障，支付安全，尽情享受游戏乐趣</p>
        </div>
        <div class="feature-card">
          <div class="icon">🚀</div>
          <h3>极速体验</h3>
          <p>快速下载，一键安装，立即开始游戏之旅</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { useLoginUserStore } from "@/stores/useLoginUserStore";

const router = useRouter();
const loginUserStore = useLoginUserStore();

const handleButtonClick = () => {
  if (loginUserStore.hasLogin) {
    // 已登录，跳转到商城页面
    router.push("/shop");
  } else {
    // 未登录，跳转到登录页面
    router.push("/user/login");
  }
};
</script>

<style scoped>
.home-page {
  min-height: calc(100vh - 64px - 70px);
  padding: 40px 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.logo-area {
  margin-bottom: 40px;
}

.logo {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
}

.logo-area h1 {
  font-size: 48px;
  color: #000000;
  margin: 0;
  font-weight: bold;
}

.slogan {
  font-size: 24px;
  color: #666;
  margin-bottom: 60px;
  line-height: 1.5;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.action-area {
  margin-bottom: 80px;
}

.main-button {
  height: 50px;
  background-color: #000000;
  padding: 0 40px;
  font-size: 18px;
  border-radius: 25px;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 60px;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card .icon {
  font-size: 36px;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 20px;
  margin-bottom: 15px;
}

.feature-card p {
  color: #2c2c2c;
  line-height: 1.6;
}

@media screen and (max-width: 768px) {
  .logo-area h1 {
    font-size: 36px;
  }

  .slogan {
    font-size: 18px;
    margin-bottom: 40px;
  }

  .feature-cards {
    grid-template-columns: 1fr;
  }
}
</style>
