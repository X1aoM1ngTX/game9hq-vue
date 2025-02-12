<template>
  <div class="home-page">
    <a-layout class="container">
      <a-layout-content class="content">
        <div class="slogan">
          <h2>GameHub</h2>
          <h3>包容万物，从源头出发，一切从简</h3>
        </div>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup></script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #ffffff, #7bb1ff);
}

.content {
  padding: 96px 24px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.slogan h2 {
  font-size: 64px;
  font-weight: 500;
  color: rgb(0, 157, 255);
  margin-bottom: 48px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .slogan h2 {
    font-size: 24px;
  }

  .content {
    padding: 48px 16px;
  }
}
</style>
