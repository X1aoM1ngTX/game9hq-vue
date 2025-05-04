<template>
  <div class="reset-password-page">
    <div class="reset-password-container">
      <div class="reset-password-header">
        <div class="title-text">
          <span class="primary">重置 </span>
          <span class="highlight">密码</span>
        </div>
      </div>
      <a-form
        :model="formState"
        class="reset-password-form"
        name="reset-password"
        @finish="handleSubmit"
      >
        <a-form-item
          :rules="[
            { required: true, message: '请输入邮箱!' },
            { type: 'email', message: '请输入有效的邮箱地址!' },
          ]"
          name="email"
        >
          <a-input
            v-model:value="formState.email"
            placeholder="邮箱"
            size="large"
          >
            <template #prefix>
              <MailOutlined class="form-icon" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          :rules="[{ required: true, message: '请输入验证码!' }]"
          name="verifyCode"
        >
          <div style="display: flex; gap: 8px">
            <a-input
              v-model:value="formState.verifyCode"
              placeholder="验证码"
              size="large"
              style="flex: 1"
            >
              <template #prefix>
                <SafetyOutlined class="form-icon" />
              </template>
            </a-input>
            <a-button
              :disabled="loading || codeSent"
              size="large"
              type="primary"
              @click="handleSendCode"
            >
              {{ codeSent ? "已发送" : "获取验证码" }}
            </a-button>
          </div>
        </a-form-item>

        <a-form-item
          :rules="[
            { required: true, message: '请输入新密码!' },
            { min: 8, message: '密码长度不能小于8位!' },
          ]"
          name="newPassword"
        >
          <a-input-password
            v-model:value="formState.newPassword"
            placeholder="新密码"
            size="large"
          >
            <template #prefix>
              <LockOutlined class="form-icon" />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item
          :rules="[
            { required: true, message: '请确认新密码!' },
            { validator: validateConfirmPassword },
          ]"
          name="confirmPassword"
        >
          <a-input-password
            v-model:value="formState.confirmPassword"
            placeholder="确认新密码"
            size="large"
          >
            <template #prefix>
              <LockOutlined class="form-icon" />
            </template>
          </a-input-password>
        </a-form-item>

        <div class="form-actions">
          <a-button
            :loading="loading"
            class="submit-button"
            html-type="submit"
            size="large"
            type="primary"
          >
            重置密码
          </a-button>
        </div>

        <div class="form-links">
          <span>想起密码了？</span>
          <router-link class="login-link" to="/user/login">
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
.reset-password-page {
  height: 100vh;
  width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.reset-password-container {
  width: 100%;
  height: 100%;
  padding: 40px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.reset-password-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, #4facfe, #00f2fe);
}

.reset-password-header {
  text-align: center;
  margin-bottom: 48px;
  padding-top: 48px;
}

.title-text {
  font-size: 28px;
  color: #262626;
  position: relative;
  display: inline-block;
  font-weight: 500;
}

.primary {
  color: #262626;
  font-weight: 500;
  font-size: 28px;
  font-family: "MiSans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

.highlight {
  color: #4facfe;
  font-weight: 600;
}

.reset-password-form {
  max-width: 100%;
  padding: 0 20px;
}

.form-icon {
  color: #8c8c8c;
}

:deep(.ant-input-affix-wrapper) {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  transition: all 0.2s;
}

:deep(.ant-input-affix-wrapper:hover) {
  border-color: #4facfe;
}

:deep(.ant-input-affix-wrapper-focused),
:deep(.ant-input-affix-wrapper:focus) {
  border-color: #4facfe;
  box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.1);
}

:deep(.ant-input) {
  background: transparent !important;
  color: #262626 !important;
  font-size: 14px;
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
  margin-bottom: 20px;
}

:deep(.ant-form-item-explain-error) {
  color: #ff4d4f;
  margin-top: 4px;
  font-size: 13px;
}

.form-actions {
  margin-top: 24px;
}

.submit-button {
  width: 100%;
  height: 44px;
  font-size: 15px;
  border-radius: 8px;
  background: linear-gradient(to right, #4facfe, #00f2fe);
  border: none;
  font-weight: 500;
  transition: all 0.2s;
  color: white;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.25);
}

.submit-button:hover {
  background: linear-gradient(to right, #4facfe, #00f2fe);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 172, 254, 0.35);
}

.submit-button:active {
  background: linear-gradient(to right, #3a9efd, #00e0fa);
  transform: translateY(0);
  box-shadow: 0 4px 8px rgba(79, 172, 254, 0.2);
}

/* 验证码按钮样式 */
:deep(.ant-btn:not(.submit-button)) {
  height: 44px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  color: #595959;
  font-size: 14px;
  border-radius: 8px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

:deep(.ant-btn:not(.submit-button):hover) {
  color: #4facfe;
  border-color: #4facfe;
  background: #fff;
  box-shadow: 0 2px 8px rgba(79, 172, 254, 0.1);
}

:deep(.ant-btn:not(.submit-button):active) {
  color: #3a9efd;
  border-color: #3a9efd;
  box-shadow: 0 2px 4px rgba(79, 172, 254, 0.1);
}

:deep(.ant-btn:not(.submit-button)[disabled]) {
  color: rgba(0, 0, 0, 0.25);
  border-color: #e0e0e0;
  background: #f5f5f5;
  text-shadow: none;
  box-shadow: none;
}

.form-links {
  margin-top: 20px;
  text-align: center;
}

.login-link {
  color: #595959;
  font-size: 14px;
  transition: all 0.2s;
  text-decoration: none;
  margin-left: 8px;
}

.login-link:hover {
  color: #4facfe;
}

/* 表单项文字颜色 */
:deep(.ant-form-item-label > label) {
  color: #262626 !important;
  font-size: 14px;
}

:deep(.ant-form-item-explain) {
  color: #8c8c8c;
  font-size: 13px;
}

:deep(.ant-form-item-required) {
  color: #262626 !important;
}

/* 输入框文字颜色 */
:deep(.ant-input),
:deep(.ant-input-password input) {
  color: #262626 !important;
}

:deep(.ant-input::placeholder),
:deep(.ant-input-password input::placeholder) {
  color: #bfbfbf !important;
}

/* 底部文字 */
.form-links span {
  color: #8c8c8c;
  font-size: 14px;
}

@media (max-width: 576px) {
  .reset-password-container {
    padding: 24px 16px;
  }

  .reset-password-header {
    margin-bottom: 32px;
    padding-top: 32px;
  }

  .title-text {
    font-size: 24px;
  }
}
</style>
