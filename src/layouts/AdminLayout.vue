<template>
  <div class="admin-layout">
    <div class="admin-sidebar">
      <div class="sidebar-header">
        <div class="admin-title">管理中心</div>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        class="admin-menu"
        @click="handleMenuClick"
      >
        <a-menu-item key="/admin/userManage">
          <span>用户管理</span>
        </a-menu-item>
        <a-menu-item key="/admin/gameManage">
          <span>游戏管理</span>
        </a-menu-item>
        <a-menu-item key="/admin/noticeManage">
          <span>公告管理</span>
        </a-menu-item>
      </a-menu>
    </div>
    <div class="admin-content">
      <div class="admin-main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const selectedKeys = ref<string[]>([route.path]);

// 监听路由变化，更新选中状态
watch(
  () => route.path,
  (newPath) => {
    selectedKeys.value = [newPath];
  }
);

const handleMenuClick = ({ key }: { key: string }) => {
  router.push(key);
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
  overflow: hidden;
}

.admin-sidebar {
  width: 240px;
  background: white;
  color: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  border-right: 1px solid #f0f0f0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.admin-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  text-align: center;
}

.admin-menu {
  flex: 1;
  border-right: none;
  background: transparent;
}

.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.admin-main {
  flex: 1;
  overflow-y: auto;
  height: 100vh;
}

:deep(.ant-menu-item) {
  color: rgba(0, 0, 0, 0.65);
}

:deep(.ant-menu-item:hover) {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.05);
}

:deep(.ant-menu-item-selected) {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
  font-weight: 500;
}

:deep(.ant-menu-item::after) {
  border-right: 3px solid #1890ff;
}

@media screen and (max-width: 768px) {
  .admin-sidebar {
    width: 200px;
  }
  .admin-main {
    padding: 16px;
  }
}
</style>
