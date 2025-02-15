<template>
  <div class="user-left">
    <div class="logo">
      <span class="highlight">欢迎来到 GameHub</span>
    </div>
  </div>
</template>

<script></script>

<style scoped>
.user-left {
  width: calc(100% - 500px);
  height: 100vh;
  background: rgba(177, 243, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo {
  font-size: 48px;
}

.highlight {
  color: #474747;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
</style>
