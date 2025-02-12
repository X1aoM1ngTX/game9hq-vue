<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <h2>找回密码</h2>
      <a-form :model="formState" @finish="handleSubmit">
        <!-- 邮箱地址 -->
        <a-form-item
          label="邮箱地址"
          name="email"
          :rules="[{ required: true, message: '请输入邮箱地址' }]"
        >
          <a-input
            v-model:value="formState.email"
            placeholder="请输入注册时的邮箱"
          />
        </a-form-item>

        <!-- 验证码 -->
        <a-form-item
          label="验证码"
          name="verifyCode"
          :rules="[{ required: true, message: '请输入验证码' }]"
        >
          <a-input
            v-model:value="formState.verifyCode"
            placeholder="请输入邮箱收到的验证码"
          />
          <a-button
            type="link"
            @click="handleSendCode"
            :disabled="loading || codeSent"
          >
            {{ codeSent ? "已发送" : "获取验证码" }}
          </a-button>
        </a-form-item>

        <!-- 新密码 -->
        <a-form-item
          label="新密码"
          name="newPassword"
          :rules="[
            { required: true, message: '请输入新密码' },
            { min: 8, message: '密码长度不能小于8位' },
          ]"
        >
          <a-input-password
            v-model:value="formState.newPassword"
            placeholder="请输入新密码"
          />
        </a-form-item>

        <!-- 确认密码 -->
        <a-form-item
          label="确认密码"
          name="confirmPassword"
          :rules="[
            { required: true, message: '请确认新密码' },
            { validator: validateConfirmPassword },
          ]"
        >
          <a-input-password
            v-model:value="formState.confirmPassword"
            placeholder="请再次输入新密码"
          />
        </a-form-item>

        <!-- 提交按钮 -->
        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="loading" block>
            重置密码
          </a-button>
        </a-form-item>
      </a-form>

      <div class="form-footer">
        <a-button type="link" @click="$router.push('/login')"
          >返回登录
        </a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { resetPassword, sendVerifyCode, verifyCode } from "@/api/user";

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
      organization: "GameHub",
      email: formState.email,
      title: "GameHub 密码重置验证码",
      content: "",
    });
    if (res.data.code === 0) {
      message.success("验证码已发送到您的邮箱");
      codeSent.value = true;
    } else {
      message.error(res.data.message || "发送失败");
    }
  } catch (error: any) {
    console.error("发送验证码失败:", error);
    message.error(error.message || "发送失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

// 提交表单
const handleSubmit = async () => {
  try {
    loading.value = true;
    // 验证验证码
    const verifyRes = await verifyCode({
      email: formState.email,
      code: formState.verifyCode,
    });
    if (verifyRes.data.code !== 0) {
      message.error(verifyRes.data.message || "验证码错误");
      return;
    }

    // 重置密码
    const resetRes = await resetPassword({
      email: formState.email,
      verifyCode: formState.verifyCode,
      newPassword: formState.newPassword,
    });
    if (resetRes.data.code === 0) {
      message.success("密码重置成功");
      router.push("/login");
    } else {
      message.error(resetRes.data.message || "重置失败");
    }
  } catch (error) {
    message.error("操作失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);
  padding: 20px;
}

.forgot-password-card {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #1a1a1a;
}

.form-section {
  margin-bottom: 24px;
}

.form-footer {
  text-align: center;
  margin-top: 16px;
}
</style>
