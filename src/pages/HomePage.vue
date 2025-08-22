<template>
  <div class="home-page">
    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- Hero 区域 -->
      <section class="hero">
        <div class="hero-background">
          <div class="grid-overlay"></div>
          <div class="gradient-orb orb-1"></div>
          <div class="gradient-orb orb-2"></div>
          <div class="gradient-orb orb-3"></div>
        </div>

        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              <span class="title-line">为游戏玩家</span>
              <span class="title-line highlight">打造的智能平台</span>
            </h1>
            <p class="hero-subtitle">
              Game9 集游戏管理、社交互动、个性化推荐于一体，
              <br />让每一位玩家都能找到属于自己的游戏世界
            </p>
            <div class="hero-actions">
              <a-button
                size="large"
                type="primary"
                class="hero-button primary"
                @click="handleButtonClick"
              >
                <span class="button-text">
                  {{ loginUserStore.hasLogin ? "进入游戏库" : "立即注册" }}
                </span>
                <span class="button-icon">→</span>
              </a-button>
              <a-button
                size="large"
                type="default"
                class="hero-button secondary"
                @click="scrollToFeatures"
              >
                了解更多
              </a-button>
            </div>
          </div>

          <div class="hero-visual">
            <div class="code-window">
              <div class="window-header">
                <div class="window-controls">
                  <span class="control control-close"></span>
                  <span class="control control-minimize"></span>
                  <span class="control control-maximize"></span>
                </div>
                <div class="window-title">Game9 Dashboard</div>
              </div>
              <div class="window-content">
                <div class="code-line">
                  <span class="code-keyword">const</span>
                  <span class="code-variable">gamePlatform</span>
                  <span class="code-operator">=</span>
                  <span class="code-string">'Game9'</span>
                </div>
                <div class="code-line">
                  <span class="code-keyword">const</span>
                  <span class="code-variable">features</span>
                  <span class="code-operator">=</span>
                  <span class="code-punctuation">[</span>
                </div>
                <div class="code-line indent">
                  <span class="code-string">'🎮 海量游戏库'</span>
                  <span class="code-punctuation">,</span>
                </div>
                <div class="code-line indent">
                  <span class="code-string">'👥 社交互动'</span>
                  <span class="code-punctuation">,</span>
                </div>
                <div class="code-line indent">
                  <span class="code-string">'🎯 个性推荐'</span>
                </div>
                <div class="code-line">
                  <span class="code-punctuation">]</span>
                </div>
                <div class="code-line">
                  <span class="code-comment">// 开始你的游戏之旅</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 功能特色区域 -->
      <section id="features" class="features">
        <div class="section-header">
          <h2 class="section-title">强大功能，专为游戏爱好者设计</h2>
          <p class="section-subtitle">探索 Game9 的核心特色功能</p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎮</div>
            <h3 class="feature-title">海量游戏库</h3>
            <p class="feature-description">
              精选全球优质游戏，从独立小游戏到3A大作， 满足不同玩家的游戏需求
            </p>
            <div class="feature-tech">
              <span class="tech-tag">PC</span>
              <span class="tech-tag">主机</span>
              <span class="tech-tag">移动端</span>
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3 class="feature-title">社交互动</h3>
            <p class="feature-description">
              与好友分享游戏心得，建立游戏圈子， 发现志同道合的游戏伙伴
            </p>
            <div class="feature-tech">
              <span class="tech-tag">好友系统</span>
              <span class="tech-tag">签到</span>
              <span class="tech-tag">评论</span>
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3 class="feature-title">智能推荐</h3>
            <p class="feature-description">
              基于你的游戏偏好和游玩历史， 为你推荐最合适的游戏
            </p>
            <div class="feature-tech">
              <span class="tech-tag">AI驱动</span>
              <span class="tech-tag">个性化</span>
              <span class="tech-tag">实时更新</span>
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3 class="feature-title">数据统计</h3>
            <p class="feature-description">
              详细的游戏时长统计、成就追踪， 让你全面了解自己的游戏习惯
            </p>
            <div class="feature-tech">
              <span class="tech-tag">可视化</span>
              <span class="tech-tag">历史记录</span>
              <span class="tech-tag">成就系统</span>
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🛡️</div>
            <h3 class="feature-title">安全可靠</h3>
            <p class="feature-description">
              正版游戏保障，安全的支付系统， 让你放心购买和游玩
            </p>
            <div class="feature-tech">
              <span class="tech-tag">正版保障</span>
              <span class="tech-tag">加密支付</span>
              <span class="tech-tag">7×24支持</span>
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🚀</div>
            <h3 class="feature-title">极速体验</h3>
            <p class="feature-description">
              优化的下载速度，一键安装， 让你快速进入游戏世界
            </p>
            <div class="feature-tech">
              <span class="tech-tag">CDN加速</span>
              <span class="tech-tag">云存档</span>
              <span class="tech-tag">自动更新</span>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA 区域 -->
      <section class="cta">
        <div class="cta-content">
          <h2 class="cta-title">准备好开始你的游戏之旅了吗？</h2>
          <p class="cta-subtitle">加入数万游戏玩家的选择，体验全新的游戏平台</p>
          <div class="cta-actions">
            <a-button
              size="large"
              type="primary"
              class="cta-button"
              @click="handleButtonClick"
            >
              {{ loginUserStore.hasLogin ? "进入平台" : "免费注册" }}
            </a-button>
          </div>
        </div>
      </section>
    </main>
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

const scrollToFeatures = () => {
  const featuresSection = document.getElementById("features");
  if (featuresSection) {
    featuresSection.scrollIntoView({ behavior: "smooth" });
  }
};
</script>

<style scoped>
/* 全局样式 */
.home-page {
  min-height: 100vh;
  background: #ffffff;
  color: #000000;
  overflow-x: hidden;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
}

/* Hero 区域样式 */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.7;
  animation: float 6s ease-in-out infinite;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #00d4ff, #0099ff);
  top: 10%;
  right: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  bottom: 20%;
  left: 10%;
  animation-delay: 2s;
}

.orb-3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  top: 50%;
  left: 50%;
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.hero-text {
  text-align: left;
}

.hero-title {
  font-size: 64px;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 24px;
}

.title-line {
  display: block;
}

.title-line.highlight {
  background: linear-gradient(135deg, #00d4ff, #0099ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 20px;
  color: rgba(0, 0, 0, 0.7);
  line-height: 1.6;
  margin-bottom: 40px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-button {
  border-radius: 8px;
  font-weight: 500;
  height: 48px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hero-button.primary {
  background: linear-gradient(135deg, #00d4ff, #0099ff);
  border: none;
  color: white;
}

.hero-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 212, 255, 0.3);
}

.hero-button.secondary {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #000000;
}

.hero-button.secondary:hover {
  background: rgba(0, 0, 0, 0.08);
}

.button-icon {
  transition: transform 0.3s ease;
}

.hero-button:hover .button-icon {
  transform: translateX(4px);
}

/* 代码窗口样式 */
.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.code-window {
  width: 100%;
  max-width: 500px;
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.window-header {
  background: rgba(30, 30, 30, 0.8);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.window-controls {
  display: flex;
  gap: 8px;
}

.control {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.control-close {
  background: #ff5f57;
}

.control-minimize {
  background: #ffbd2e;
}

.control-maximize {
  background: #28ca42;
}

.window-title {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  flex: 1;
  text-align: center;
}

.window-content {
  padding: 24px;
  font-family: "Courier New", monospace;
  font-size: 14px;
  line-height: 1.6;
}

.code-line {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.code-keyword {
  color: #ff79c6;
}

.code-variable {
  color: #50fa7b;
}

.code-operator {
  color: #f8f8f2;
}

.code-string {
  color: #f1fa8c;
}

.code-punctuation {
  color: #f8f8f2;
}

.code-comment {
  color: #6272a4;
}

.indent {
  margin-left: 20px;
}

/* 功能特色区域 */
.features {
  padding: 120px 20px;
  background: #f8f9fa;
  position: relative;
}

.section-header {
  text-align: center;
  margin-bottom: 80px;
}

.section-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #ffffff, #a0a0a0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: 20px;
  color: rgba(0, 0, 0, 0.7);
}

.features-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
}

.feature-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  padding: 32px;
  text-align: left;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: rgba(0, 212, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 212, 255, 0.15);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 20px;
  display: block;
}

.feature-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #000000;
}

.feature-description {
  color: rgba(0, 0, 0, 0.7);
  line-height: 1.6;
  margin-bottom: 20px;
}

.feature-tech {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tech-tag {
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

/* CTA 区域 */
.cta {
  padding: 120px 20px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  text-align: center;
  position: relative;
}

.cta::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(0, 212, 255, 0.05) 0%,
    transparent 50%
  );
  z-index: 1;
}

.cta-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
  margin: 0 auto;
}

.cta-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #7d7d7d, #a0a0a0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cta-subtitle {
  font-size: 20px;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 40px;
}

.cta-button {
  background: linear-gradient(135deg, #00d4ff, #0099ff);
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  height: auto;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 212, 255, 0.3);
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 60px;
  }

  .hero-text {
    text-align: center;
  }

  .hero-title {
    font-size: 48px;
  }

  .hero-visual {
    order: -1;
  }

  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media screen and (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .hero-actions {
    justify-content: center;
  }

  .section-title {
    font-size: 36px;
  }

  .cta-title {
    font-size: 36px;
  }

  .features {
    padding: 80px 20px;
  }

  .cta {
    padding: 80px 20px;
  }
}

@media screen and (max-width: 480px) {
  .hero-content {
    padding: 0 16px;
  }

  .hero-title {
    font-size: 28px;
  }

  .code-window {
    max-width: 100%;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-text {
  animation: fadeInUp 0.8s ease-out;
}

.hero-visual {
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.feature-card {
  animation: fadeInUp 0.6s ease-out both;
}

.feature-card:nth-child(1) {
  animation-delay: 0.1s;
}
.feature-card:nth-child(2) {
  animation-delay: 0.2s;
}
.feature-card:nth-child(3) {
  animation-delay: 0.3s;
}
.feature-card:nth-child(4) {
  animation-delay: 0.4s;
}
.feature-card:nth-child(5) {
  animation-delay: 0.5s;
}
.feature-card:nth-child(6) {
  animation-delay: 0.6s;
}
</style>
