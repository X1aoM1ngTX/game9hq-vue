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
          name="verifyCode"
          :rules="[{ required: true, message: '请输入验证码!' }]"
        >
          <div style="display: flex; gap: 8px">
            <a-input
              v-model:value="formState.verifyCode"
              size="large"
              placeholder="验证码"
              style="flex: 1"
            >
              <template #prefix>
                <SafetyOutlined class="form-icon" />
              </template>
            </a-input>
            <a-button
              size="large"
              type="primary"
              @click="handleSendCode"
              :disabled="loading || codeSent"
            >
              {{ codeSent ? `${countdown}s` : "获取验证码" }}
            </a-button>
          </div>
        </a-form-item>

        <a-form-item
          name="userPassword"
          :rules="[
            { required: true, message: '请输入密码!' },
            { min: 8, message: '密码长度不能小于8位!' },
          ]"
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
          name="userCheckPassword"
          :rules="[
            { required: true, message: '请确认密码!' },
            { validator: validatePassword },
          ]"
        >
          <a-input-password
            v-model:value="formState.userCheckPassword"
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
  UserOutlined,
  SafetyOutlined,
} from "@ant-design/icons-vue";
import { userRegister, sendVerifyCode, verifyCode } from "@/api/user";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";

interface FormState {
  userName: string;
  userEmail: string;
  userPassword: string;
  userCheckPassword: string;
  verifyCode: string;
}

const formState = reactive<FormState>({
  userName: "",
  userEmail: "",
  userPassword: "",
  userCheckPassword: "",
  verifyCode: "",
});

const router = useRouter();
const loading = ref(false);
const codeSent = ref(false);
const countdown = ref(60);
let timer: ReturnType<typeof setInterval> | null = null;

// 验证密码
const validatePassword = async (_rule: any, value: string) => {
  if (value && value !== formState.userPassword) {
    throw new Error("两次输入的密码不一致!");
  }
};

// 发送验证码
const handleSendCode = async () => {
  if (!formState.userEmail) {
    message.error("请先输入邮箱地址");
    return;
  }

  try {
    loading.value = true;
    const res = await sendVerifyCode({
      toEmail: formState.userEmail,
    });
    if (res.data.code === 0) {
      message.success("验证码已发送到您的邮箱");
      codeSent.value = true;
      startCountdown();
    } else {
      message.error(res.data.message || "发送失败");
    }
  } catch (error: any) {
    message.error(error.message || "发送失败");
  } finally {
    loading.value = false;
  }
};

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60;
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      codeSent.value = false;
      if (timer) {
        clearInterval(timer);
      }
    }
  }, 1000);
};

// 提交表单
const handleSubmit = async () => {
  try {
    loading.value = true;
    const verifyRes = await verifyCode({
      email: formState.userEmail,
      code: formState.verifyCode,
    });

    if (verifyRes.data.code !== 0) {
      message.error("验证码错误");
      return;
    }

    const res = await userRegister(formState);
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

// 表单验证失败
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
}

.register-container {
  width: 100%;
  height: 100%;
  padding: 40px;
  background: #1f1f1f;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.register-header {
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

.register-form {
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

.register-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 8px;
  background: #1890ff;
  border: none;
  font-weight: 500;
  transition: all 0.3s;
}

.register-button:hover {
  background: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.form-links {
  margin-top: 24px;
  text-align: center;
  color: #8c8c8c;
}

.login-link {
  color: #8c8c8c;
  margin-left: 8px;
  transition: all 0.3s;
  text-decoration: none;
  position: relative;
}

.login-link:hover {
  color: #1890ff;
}

.login-link::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: #1890ff;
  transition: width 0.3s;
}

.login-link:hover::after {
  width: 100%;
}

/* 验证码按钮样式 */
:deep(.ant-btn:not(.register-button)) {
  background: #141414;
  border-color: #434343;
  color: #8c8c8c;
}

:deep(.ant-btn:not(.register-button):hover) {
  background: #1890ff;
  border-color: #1890ff;
  color: #ffffff;
}

@media (max-width: 576px) {
  .register-container {
    padding: 30px 20px;
  }

  .register-header {
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
