<template>
  <div class="profile-container">
    <div class="profile-card">
      <div class="profile-header">
        <div class="avatar-section">
          <a-avatar :size="64" :src="user.userAvatar">
            {{ user.userName?.charAt(0) }}
          </a-avatar>
          <div class="online-status"></div>
        </div>
        <div class="user-info">
          <h2>
            {{ user.userName }}
            <a-tag v-if="user.userIsAdmin === 1" color="blue">管理员</a-tag>
            <a-tag v-else color="green">用户</a-tag>
          </h2>
          <span class="user-id">ID：{{ user.userId }}</span>
        </div>
        <a-button class="edit-btn" type="link" @click="handleEdit">
          修改资料
        </a-button>
      </div>

      <div class="profile-content">
        <div class="info-section">
          <h3>自我介绍</h3>
          <p v-if="user.userProfile">{{ user.userProfile }}</p>
          <p v-else class="empty-text">
            {{ user.userProfile || "这个人很懒，什么都没写" }}
          </p>
          <a-button type="link" @click="handleEditProfile"> 编辑介绍</a-button>
        </div>

        <div class="info-section">
          <h3>基本信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">邮箱：</span>
              <span>{{ user.userEmail || "未设置" }}</span>
            </div>
            <div class="info-item">
              <span class="label">手机：</span>
              <span>{{ user.userPhone || "未设置" }}</span>
            </div>
            <div class="info-item">
              <span class="label">注册时间：</span>
              <span>{{ formatDate(user.userCreatedTime) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getCurrentUser } from "@/api/user";
import { message } from "ant-design-vue";
import dayjs from "dayjs";

interface UserInfo {
  userId: string | number;
  userName: string;
  userEmail: string;
  userPhone: string;
  userCreatedTime: string;
  userIsAdmin: number;
  userProfile: string;
  userAvatar: string;
}

const user = ref<UserInfo>({
  userId: "",
  userName: "",
  userEmail: "",
  userPhone: "",
  userCreatedTime: "",
  userIsAdmin: 0,
  userProfile: "",
  userAvatar: "",
});

const formatDate = (date: string) => {
  return dayjs(date).format("YYYY-MM-DD");
};

const fetchData = async () => {
  try {
    const res = await getCurrentUser();
    if (res.data.code === 0) {
      user.value = res.data.data;
    } else {
      message.error("用户数据获取失败");
    }
  } catch (error) {
    message.error(`操作失败: ${error.message || "未知错误"}`);
  }
};

const handleEdit = () => {
  // TODO: 弹出修改资料的对话框
  console.log("修改资料");
};

const handleEditProfile = () => {
  // TODO: 实现修改介绍的逻辑
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.profile-container {
  padding: 24px;
  background: linear-gradient(to bottom, #ffffff, #7bb1ff);
  min-height: calc(100vh - 64px);
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.avatar-section {
  position: relative;
}

.online-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background-color: #52c41a;
  border-radius: 50%;
  border: 2px solid white;
}

.user-info {
  flex: 1;
}

.user-info h2 {
  margin: 0;
  font-size: 24px;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-id {
  color: #666;
  font-size: 14px;
}

.edit-btn {
  position: absolute;
  right: 24px;
  top: 24px;
}

.profile-content {
  padding: 24px;
}

.info-section {
  margin-bottom: 32px;
}

.info-section h3 {
  font-size: 18px;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  color: #666;
  font-size: 14px;
}

.empty-text {
  color: #999;
  font-style: italic;
}

:deep(.ant-avatar) {
  background: #1890ff;
  color: white;
  font-size: 24px;
}

:deep(.ant-tag) {
  margin: 0;
  font-weight: normal;
  line-height: 20px;
  height: 20px;
  text-transform: uppercase;
  font-size: 12px;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 12px;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .edit-btn {
    position: static;
    margin-top: 12px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
