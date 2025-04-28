<template>
  <div class="exception-page">
    <div class="exception-content">
      <h1 class="exception-code">403</h1>
      <h2 class="exception-title">抱歉，您无权访问此页面</h2>
      <p class="exception-desc">
        当前页面需要更高的访问权限，请确认您的账号权限或联系管理员。
      </p>
      <a-button size="large" type="primary" @click="$router.push('/')">
        返回首页
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 组件逻辑
</script>

<style scoped>
.exception-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.exception-content {
  text-align: center;
  padding: 48px;
}

.exception-code {
  font-size: 120px;
  color: #1890ff;
  margin-bottom: 24px;
}

.exception-title {
  font-size: 24px;
  color: #1f1f1f;
  margin-bottom: 16px;
}

.exception-desc {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
}
</style>
