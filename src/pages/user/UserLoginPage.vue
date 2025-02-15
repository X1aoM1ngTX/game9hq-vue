<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="title-text">
          <span class="primary">欢迎来到 </span>
          <span class="highlight">GameHub</span>
        </div>
      </div>
      <a-form
        :model="formState"
        name="login"
        class="login-form"
        @finish="handleSubmit"
        @finishFailed="onFinishFailed"
      >
        <a-form-item
          name="userName"
          :rules="[{ required: true, message: '请输入账号!' }]"
        >
          <a-input
            v-model:value="formState.userName"
            size="large"
            placeholder="用户名"
          >
            <template #prefix>
              <UserOutlined class="form-icon" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          name="userPassword"
          :rules="[{ required: true, message: '请输入密码!' }]"
        >
          <a-input-password
            v-model:value="formState.userPassword"
            size="large"
            placeholder="密码"
          >
            <template #prefix>
              <LockOutlined class="form-icon" />
            </template>
          </a-input-password>
        </a-form-item>

        <div class="form-actions">
          <a-button
            type="primary"
            html-type="submit"
            class="submit-button"
            size="large"
            :loading="loading"
          >
            登录
          </a-button>
        </div>

        <div class="form-links">
          <router-link to="/user/register" class="register-link">
            创建新账号
          </router-link>
          <router-link to="/user/forgot-password" class="forgot-link">
            忘记密码？
          </router-link>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { LockOutlined, UserOutlined } from "@ant-design/icons-vue";
import { userLogin } from "@/api/user";
import { useLoginUserStore } from "@/store/useLoginUserStore";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";

interface FormState {
  userName: string;
  userPassword: string;
}

const formState = reactive<FormState>({
  userName: "",
  userPassword: "",
});

const router = useRouter();
const loginUserStore = useLoginUserStore();
const loading = ref(false);

const handleSubmit = async (values: FormState) => {
  try {
    loading.value = true;
    const res = await userLogin(values);
    if (res.data.code === 0) {
      await loginUserStore.getLoginUser();
      message.success("登录成功");
      router.push("/");
    } else {
      message.error(res.data.message || "登录失败");
    }
  } catch (error: any) {
    message.error(error.response?.data?.message || "登录失败");
  } finally {
    loading.value = false;
  }
};

const onFinishFailed = (errorInfo: any) => {
  console.log("表单验证失败:", errorInfo);
};
</script>

<style scoped>
.login-page {
  height: 100vh;
  width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%);
}

.login-container {
  width: 100%;
  height: 100%;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.title-text {
  font-size: 28px;
  color: #000000;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.primary {
  color: #303030;
  font-weight: bold;
  font-size: 26px;
  font-family: "MiSans", sans-serif;
}

.highlight {
  color: #1890ff;
  font-weight: bold;
}

.login-form {
  max-width: 100%;
}

.form-icon {
  color: #bfbfbf;
}

:deep(.ant-input-affix-wrapper) {
  padding: 8px 11px;
  border-radius: 8px;
}

:deep(.ant-input) {
  font-size: 16px;
}

.form-actions {
  margin-top: 24px;
}

.submit-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
}

.form-links {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.register-link,
.forgot-link {
  color: #1890ff;
  font-size: 14px;
  transition: color 0.3s;
  text-decoration: none;
}

.register-link:hover,
.forgot-link:hover {
  color: #40a9ff;
}

@media (max-width: 576px) {
  .login-container {
    padding: 30px 20px;
  }
}
</style>
