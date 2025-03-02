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
import { useLoginUserStore } from "@/stores/useLoginUserStore";
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
}

.login-container {
  width: 100%;
  height: 100%;
  padding: 40px;
  background: #1f1f1f;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 60px;
  padding-top: 60px;
}

.title-text {
  font-size: 32px;
  color: #ffffff;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.primary {
  color: #ffffff;
  font-weight: 500;
  font-size: 32px;
  font-family: "MiSans", sans-serif;
}

.highlight {
  color: #1890ff;
  font-weight: bold;
  text-shadow: 0 0 20px rgba(24, 144, 255, 0.5);
}

.login-form {
  max-width: 100%;
  padding: 0 20px;
}

.form-icon {
  color: #8c8c8c;
}

:deep(.ant-input-affix-wrapper) {
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #434343;
  background: #141414;
  transition: all 0.3s;
}

:deep(.ant-input-affix-wrapper:hover) {
  border-color: #1890ff;
  background: #141414;
}

:deep(.ant-input-affix-wrapper-focused),
:deep(.ant-input-affix-wrapper:focus) {
  border-color: #1890ff;
  background: #141414;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

:deep(.ant-input) {
  background: transparent !important;
  color: #ffffff !important;
  font-size: 16px;
}

:deep(.ant-input-password) {
  background: transparent !important;
}

:deep(.ant-input-affix-wrapper .ant-input) {
  background: transparent !important;
}

:deep(.ant-input-password-icon) {
  color: #8c8c8c;
}

:deep(.ant-form-item) {
  margin-bottom: 24px;
}

:deep(.ant-form-item-explain-error) {
  color: #ff4d4f;
  margin-top: 4px;
}

.form-actions {
  margin-top: 32px;
}

.submit-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 8px;
  background: #1890ff;
  border: none;
  font-weight: 500;
  transition: all 0.3s;
}

.submit-button:hover {
  background: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.form-links {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.register-link,
.forgot-link {
  color: #8c8c8c;
  font-size: 14px;
  transition: all 0.3s;
  text-decoration: none;
  position: relative;
}

.register-link:hover,
.forgot-link:hover {
  color: #1890ff;
}

.register-link::after,
.forgot-link::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: #1890ff;
  transition: width 0.3s;
}

.register-link:hover::after,
.forgot-link:hover::after {
  width: 100%;
}

@media (max-width: 576px) {
  .login-container {
    padding: 30px 20px;
  }

  .login-header {
    margin-bottom: 40px;
    padding-top: 40px;
  }

  .title-text {
    font-size: 28px;
  }
}

/* 表单项文字颜色 */
:deep(.ant-form-item-label > label) {
  color: #ffffff !important;
}

:deep(.ant-form-item-explain) {
  color: #ffffff;
}

:deep(.ant-form-item-required) {
  color: #ffffff !important;
}

/* 输入框文字颜色 */
:deep(.ant-input),
:deep(.ant-input-password input) {
  color: #ffffff !important;
}

:deep(.ant-input::placeholder),
:deep(.ant-input-password input::placeholder) {
  color: rgba(255, 255, 255, 0.45) !important;
}

/* 底部文字 */
.form-links span {
  color: #ffffff;
}
</style>
