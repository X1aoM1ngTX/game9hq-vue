<template>
  <div class="home-page">
    <div class="content">
      <div class="logo-area">
        <img alt="logo" class="logo" src="../assets/GAME9/game9-black.png" />
        <h1>Game9</h1>
      </div>
      <p class="slogan">
        无论您是初出茅庐的玩家，还是资深游戏达人，Game9将是您最坚实的游戏港湾。
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
  padding: 80px 20px;
  background-color: #ffffff;
  position: relative;
  overflow: hidden;
}

.home-page::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 70%;
  height: 100%;
  background: radial-gradient(
    circle at 100% 0%,
    #f0f0f0 0%,
    rgba(255, 255, 255, 0) 60%
  );
  z-index: 0;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
}

.logo-area {
  margin-bottom: 40px;
  animation: fadeIn 1s ease-out;
}

.logo {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
  filter: grayscale(100%);
  transition: transform 0.5s ease, filter 0.5s ease;
}

.logo:hover {
  transform: scale(1.05);
  filter: grayscale(0%);
}

.logo-area h1 {
  font-size: 56px;
  color: #000000;
  margin: 0;
  font-weight: 700;
  letter-spacing: -1px;
}

.slogan {
  font-size: 22px;
  color: #595959;
  margin-bottom: 60px;
  line-height: 1.6;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  animation: fadeIn 1s ease-out 0.3s both;
  font-weight: 300;
}

.action-area {
  margin-bottom: 80px;
  animation: fadeIn 1s ease-out 0.6s both;
}

.main-button {
  height: 50px;
  background-color: #000000;
  padding: 0 40px;
  font-size: 16px;
  border-radius: 2px;
  border: none;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: none;
  letter-spacing: 2px;
  color: #ffffff;
}

.main-button:hover {
  background-color: #333333;
  transform: translateY(-2px);
}

.main-button:active {
  background-color: #000000;
  transform: translateY(0);
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-top: 60px;
  animation: fadeIn 1s ease-out 0.9s both;
}

.feature-card {
  background: #ffffff;
  padding: 40px 30px;
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  z-index: 1;
  border: 1px solid #f0f0f0;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border-color: #e0e0e0;
}

.feature-card .icon {
  font-size: 40px;
  margin-bottom: 24px;
  display: inline-block;
  position: relative;
  z-index: 2;
  color: #000000;
}

.feature-card h3 {
  font-size: 20px;
  margin-bottom: 16px;
  color: #000000;
  font-weight: 600;
  position: relative;
  z-index: 2;
  letter-spacing: 0.5px;
}

.feature-card p {
  color: #595959;
  line-height: 1.8;
  position: relative;
  z-index: 2;
  font-size: 14px;
  font-weight: 400;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media screen and (max-width: 768px) {
  .home-page {
    padding: 60px 20px;
  }

  .logo {
    width: 100px;
    height: 100px;
  }

  .logo-area h1 {
    font-size: 42px;
  }

  .slogan {
    font-size: 18px;
    margin-bottom: 40px;
  }

  .feature-cards {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .feature-card {
    padding: 30px 25px;
  }
}

@media screen and (max-width: 480px) {
  .home-page {
    padding: 40px 20px;
  }

  .logo-area h1 {
    font-size: 36px;
  }

  .slogan {
    font-size: 16px;
    line-height: 1.5;
  }

  .main-button {
    height: 46px;
    padding: 0 30px;
    font-size: 15px;
  }

  .feature-card .icon {
    font-size: 36px;
    margin-bottom: 20px;
  }

  .feature-card h3 {
    margin-bottom: 12px;
  }
}
</style>
