<template>
  <div class="user-left">
    <div class="background">
      <div class="grid-overlay"></div>
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>
    <div class="content">
      <div class="logo">
        <img
          alt="Game9"
          class="logo-icon"
          src="../assets/GAME9/game9-blue.png"
        />
        <span class="logo-text">Game9</span>
      </div>
      <div class="welcome-text">
        <h1 class="welcome-title">
          <span class="title-line">为游戏玩家</span>
          <span class="title-line highlight">打造的智能平台</span>
        </h1>
      </div>
    </div>
  </div>
</template>

<script></script>

<style scoped>
.user-left {
  width: calc(100% - 500px);
  height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.background {
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

.content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 40px;
  max-width: 500px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
}

.logo-icon {
  width: 48px;
  height: 48px;
}

.logo-text {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #00d4ff, #0099ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-text {
  margin-bottom: 40px;
}

.welcome-title {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 16px;
}

.title-line {
  display: block;
  color: #000000;
}

.title-line.highlight {
  background: linear-gradient(135deg, #00d4ff, #0099ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .user-left {
    width: 40%;
  }
  .welcome-title {
    font-size: 28px;
  }
  .welcome-subtitle {
    font-size: 14px;
  }
  .logo-text {
    font-size: 28px;
  }
}

@media screen and (max-width: 768px) {
  .user-left {
    display: none;
  }
}
</style>
