<template>
  <div class="forgot-password-page">
    <div class="forgot-password-container">
      <div class="forgot-password-header">
        <div class="title-text">
          <span class="primary">重置 </span>
          <span class="highlight">密码</span>
        </div>
      </div>
      <a-form
        :model="formState"
        name="forgot-password"
        class="forgot-password-form"
        @finish="handleSubmit"
      >
        <a-form-item
          name="email"
          :rules="[
            { required: true, message: '请输入邮箱!' },
            { type: 'email', message: '请输入有效的邮箱地址!' },
          ]"
        >
          <a-input
            v-model:value="formState.email"
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
              {{ codeSent ? "已发送" : "获取验证码" }}
            </a-button>
          </div>
        </a-form-item>

        <a-form-item
          name="newPassword"
          :rules="[
            { required: true, message: '请输入新密码!' },
            { min: 8, message: '密码长度不能小于8位!' },
          ]"
        >
          <a-input-password
            v-model:value="formState.newPassword"
            size="large"
            placeholder="新密码"
          >
            <template #prefix>
              <LockOutlined class="form-icon" />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item
          name="confirmPassword"
          :rules="[
            { required: true, message: '请确认新密码!' },
            { validator: validateConfirmPassword },
          ]"
        >
          <a-input-password
            v-model:value="formState.confirmPassword"
            size="large"
            placeholder="确认新密码"
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
            重置密码
          </a-button>
        </div>

        <div class="form-links">
          <span>记起密码了？</span>
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
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { resetPassword, sendVerifyCode, verifyCode } from "@/api/user";
import {
  LockOutlined,
  MailOutlined,
  SafetyOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();
const loading = ref(false);
const codeSent = ref(false);

const formState = reactive({
  email: "",
  verifyCode: "",
  newPassword: "",
  confirmPassword: "",
});

const validateConfirmPassword = async (_rule: any, value: string) => {
  if (value !== formState.newPassword) {
    throw new Error("两次输入的密码不一致");
  }
};

// 发送验证码
const handleSendCode = async () => {
  try {
    loading.value = true;
    const res = await sendVerifyCode({
      toEmail: formState.email,
    });
    if (res.data.code === 0) {
      message.success("验证码已发送到您的邮箱");
      codeSent.value = true;
    } else {
      message.error(res.data.message || "发送失败");
    }
  } catch (error: any) {
    message.error(error.message || "发送失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

// 提交表单
const handleSubmit = async () => {
  try {
    loading.value = true;
    const verifyRes = await verifyCode({
      email: formState.email,
      code: formState.verifyCode,
    });
    if (verifyRes.data.code !== 0) {
      message.error(verifyRes.data.message || "验证码错误");
      return;
    }

    const resetRes = await resetPassword({
      email: formState.email,
      verifyCode: formState.verifyCode,
      newPassword: formState.newPassword,
    });
    if (resetRes.data.code === 0) {
      message.success("密码重置成功");
      router.push("/user/login");
    } else {
      message.error(resetRes.data.message || "重置失败");
    }
  } catch (error: any) {
    message.error(error.response?.data?.message || "操作失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.forgot-password-page {
  height: 100vh;
  width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.forgot-password-container {
  width: 100%;
  height: 100%;
  padding: 40px;
  background: #1f1f1f;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.forgot-password-header {
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

.forgot-password-form {
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
:deep(.ant-btn) {
  background: #1890ff;
  border: none;
  color: #ffffff;
  font-weight: 500;
  transition: all 0.3s;
}

:deep(.ant-btn:hover) {
  background: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
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

/* 验证码按钮文字 */
:deep(.ant-btn) {
  color: #ffffff !important;
}

/* 底部文字 */
.form-links span {
  color: #ffffff;
}

@media (max-width: 576px) {
  .forgot-password-container {
    padding: 30px 20px;
  }

  .forgot-password-header {
    margin-bottom: 40px;
    padding-top: 40px;
  }

  .title-text {
    font-size: 28px;
  }
}
</style>
