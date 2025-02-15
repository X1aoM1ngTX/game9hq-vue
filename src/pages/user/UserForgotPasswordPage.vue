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
      userEmail: formState.email, // 修改这里，使用 userEmail
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
  background: linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%);
}

.forgot-password-container {
  width: 100%;
  height: 100%;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.forgot-password-header {
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

.forgot-password-form {
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
  .forgot-password-container {
    padding: 30px 20px;
  }
}
</style>
