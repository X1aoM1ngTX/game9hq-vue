<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <div class="title-text">
          <span class="primary">加入 </span>
          <span class="highlight">GameHub</span>
        </div>
      </div>
      <a-form
        :model="formState"
        name="register"
        class="register-form"
        @finish="handleSubmit"
        @finishFailed="onFinishFailed"
      >
        <a-form-item
          name="userName"
          :rules="[{ required: true, message: '请输入用户名!' }]"
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
          name="userEmail"
          :rules="[
            { required: true, message: '请输入邮箱!' },
            { type: 'email', message: '请输入有效的邮箱地址!' },
          ]"
        >
          <a-input
            v-model:value="formState.userEmail"
            size="large"
            placeholder="邮箱"
          >
            <template #prefix>
              <MailOutlined class="form-icon" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          name="userPhone"
          :rules="[{ required: true, message: '请输入手机号!' }]"
        >
          <a-input
            v-model:value="formState.userPhone"
            size="large"
            placeholder="手机号"
          >
            <template #prefix>
              <PhoneOutlined class="form-icon" />
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

        <a-form-item
          name="confirmPassword"
          :rules="[
            { required: true, message: '请确认密码!' },
            { validator: validatePassword },
          ]"
        >
          <a-input-password
            v-model:value="formState.confirmPassword"
            size="large"
            placeholder="确认密码"
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
            class="register-button"
            size="large"
            :loading="loading"
          >
            注册
          </a-button>
        </div>

        <div class="form-links">
          <span>已有账号？</span>
          <router-link to="/user/login" class="login-link">
            立即登录
          </router-link>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import {
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons-vue";
import { userRegister } from "@/api/user";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";

interface FormState {
  userName: string;
  userEmail: string;
  userPhone: string;
  userPassword: string;
  confirmPassword: string;
}

const formState = reactive<FormState>({
  userName: "",
  userEmail: "",
  userPhone: "",
  userPassword: "",
  confirmPassword: "",
});

const router = useRouter();
const loading = ref(false);

const validatePassword = async (_rule: any, value: string) => {
  if (value && value !== formState.userPassword) {
    throw new Error("两次输入的密码不一致!");
  }
};

const handleSubmit = async (values: FormState) => {
  try {
    loading.value = true;
    const { confirmPassword, ...registerData } = values;
    const res = await userRegister(registerData);
    if (res.data.code === 0) {
      message.success("注册成功");
      router.push("/user/login");
    } else {
      message.error(res.data.message || "注册失败");
    }
  } catch (error: any) {
    message.error(error.response?.data?.message || "注册失败");
  } finally {
    loading.value = false;
  }
};

const onFinishFailed = (errorInfo: any) => {
  console.log("表单验证失败:", errorInfo);
};
</script>

<style scoped>
.register-page {
  height: 100vh;
  width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%);
}

.register-container {
  width: 100%;
  height: 100%;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.register-header {
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

.register-form {
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

.register-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
}

.form-links {
  margin-top: 24px;
  text-align: center;
  color: #666;
}

.login-link {
  color: #1890ff;
  margin-left: 8px;
  transition: color 0.3s;
}

.login-link:hover {
  color: #40a9ff;
}

@media (max-width: 576px) {
  .register-container {
    padding: 30px 20px;
  }
}
</style>
