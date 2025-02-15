<template>
  <div class="profile-container">
    <div class="profile-card">
      <div class="profile-header">
        <div class="avatar-section">
          <a-upload
            name="file"
            :show-upload-list="false"
            :before-upload="beforeUpload"
            :customRequest="customUpload"
          >
            <div class="avatar-wrapper">
              <a-avatar :size="64" :src="user.userAvatar">
                {{ user.userName?.charAt(0) }}
              </a-avatar>
              <div class="avatar-mask">
                <camera-outlined />
                <span>更换头像</span>
              </div>
            </div>
          </a-upload>
          <div class="online-status"></div>
        </div>
        <div class="user-info">
          <h2>
            {{ user.userNickname || user.userName }}
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
          <h3>简介</h3>
          <div class="profile-text">
            <p v-if="user.userProfile">{{ user.userProfile }}</p>
            <p v-else class="empty-text">这个人很懒，什么都没写</p>
          </div>
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

    <!-- 添加修改资料的对话框 -->
    <a-modal
      v-model:visible="modalVisible"
      title="修改个人资料"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form :model="formState" layout="vertical">
        <a-form-item
          label="昵称"
          name="userNickname"
          :rules="[{ required: true, message: '请输入昵称!' }]"
        >
          <a-input v-model:value="formState.userNickname" />
        </a-form-item>

        <a-form-item
          label="用户名"
          name="userName"
          :rules="[{ required: true, message: '请输入用户名!' }]"
        >
          <a-input v-model:value="formState.userName" disabled />
        </a-form-item>

        <a-form-item
          label="邮箱"
          name="userEmail"
          :rules="[
            { required: true, message: '请输入邮箱!' },
            { type: 'email', message: '请输入有效的邮箱地址!' },
          ]"
        >
          <a-input v-model:value="formState.userEmail" />
        </a-form-item>

        <a-form-item
          label="手机号"
          name="userPhone"
          :rules="[{ required: true, message: '请输入手机号!' }]"
        >
          <a-input v-model:value="formState.userPhone" />
        </a-form-item>

        <a-form-item label="简介" name="userProfile">
          <a-textarea
            v-model:value="formState.userProfile"
            :rows="4"
            placeholder="介绍一下你自己吧"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { getCurrentUser, userModify, updateAvatar } from "@/api/user";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import { CameraOutlined } from "@ant-design/icons-vue";
import { useLoginUserStore } from "@/store/useLoginUserStore";

interface UserInfo {
  userId: string | number;
  userName: string;
  userEmail: string;
  userPhone: string;
  userCreatedTime: string;
  userIsAdmin: number;
  userProfile: string;
  userAvatar: string;
  userNickname?: string;
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

// 表单状态
const formState = reactive({
  userName: "",
  userNickname: "",
  userEmail: "",
  userPhone: "",
  userProfile: "",
});

// 对话框可见性
const modalVisible = ref(false);

// 获取用户状态store
const loginUserStore = useLoginUserStore();

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
  } catch (error: unknown) {
    const err = error as { message?: string };
    message.error(`操作失败: ${err.message || "未知错误"}`);
  }
};

// 处理编辑按钮点击
const handleEdit = () => {
  formState.userName = user.value.userName;
  formState.userNickname = user.value.userNickname || user.value.userName;
  formState.userEmail = user.value.userEmail;
  formState.userPhone = user.value.userPhone;
  formState.userProfile = user.value.userProfile;
  modalVisible.value = true;
};

// 处理对话框确认
const handleModalOk = async () => {
  try {
    const res = await userModify({
      userName: formState.userName,
      userNickname: formState.userNickname,
      userEmail: formState.userEmail,
      userPhone: formState.userPhone,
      userProfile: formState.userProfile,
    });

    if (res.data.code === 0) {
      message.success("修改成功");
      modalVisible.value = false;
      await fetchData(); // 刷新数据
    } else {
      message.error(res.data.message || "修改失败");
    }
  } catch (error: any) {
    message.error(error.response?.data?.message || "修改失败");
  }
};

// 处理对话框取消
const handleModalCancel = () => {
  modalVisible.value = false;
};

// 上传前校验
const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("只能上传 JPG/PNG 格式的图片！");
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("图片大小不能超过 2MB！");
    return false;
  }
  return true;
};

// 自定义上传方法
const customUpload = async (options: any) => {
  const { file, onSuccess, onError } = options;
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await updateAvatar(formData);
    if (res.data.code === 0) {
      message.success("头像上传成功");
      await fetchData(); // 刷新用户数据
      // 更新全局用户状态
      const userRes = await getCurrentUser();
      if (userRes.data.code === 0) {
        loginUserStore.loginUser = userRes.data.data;
      }
      onSuccess(res, file);
    } else {
      message.error(res.data.message || "上传失败");
      onError(new Error(res.data.message));
    }
  } catch (error: any) {
    message.error(error.response?.data?.message || "上传失败");
    onError(error);
  }
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
  color: #999 !important;
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

/* 添加新样式 */
:deep(.ant-modal-content) {
  border-radius: 8px;
}

:deep(.ant-form-item-label > label) {
  font-weight: 500;
}

:deep(.ant-input) {
  border-radius: 4px;
}

:deep(.ant-input:focus) {
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.profile-text {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  min-height: 80px;
}

.profile-text p {
  margin: 0;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
  display: inline-block;
  border-radius: 50%;
}

.avatar-wrapper:hover .avatar-mask {
  opacity: 1;
}

.avatar-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-mask span {
  font-size: 12px;
  margin-top: 4px;
}

:deep(.ant-upload) {
  display: block;
}
</style>
