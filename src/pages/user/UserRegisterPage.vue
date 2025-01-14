<template>
  <div id="userRegisterPage">
    <div class="register-container">
      <h2 class="title">新用户注册</h2>
      <a-form
        :model="formState"
        name="register"
        class="register-form"
        @finish="handleSubmit"
        @finishFailed="onFinishFailed"
      >
        <a-form-item
          label="账号"
          name="userName"
          :rules="[{ required: true, message: '请输入账号!' }]"
        >
          <a-input v-model:value="formState.userName" size="large">
            <template #prefix>
              <UserOutlined class="site-form-item-icon" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          label="密码"
          name="userPassword"
          :rules="[{ required: true, message: '请输入密码!' }]"
        >
          <a-input-password v-model:value="formState.userPassword" size="large">
            <template #prefix>
              <LockOutlined class="site-form-item-icon" />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item
          label="邮箱"
          name="userEmail"
          :rules="[
            { required: true, message: '请输入邮箱!' },
            { type: 'email', message: '请输入有效的邮箱地址!' },
          ]"
        >
          <a-input v-model:value="formState.userEmail" size="large">
            <template #prefix>
              <MailOutlined class="site-form-item-icon" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          label="手机号"
          name="userPhone"
          :rules="[{ required: true, message: '请输入手机号!' }]"
        >
          <a-input v-model:value="formState.userPhone" size="large">
            <template #prefix>
              <PhoneOutlined class="site-form-item-icon" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            class="register-form-button"
            size="large"
          >
            注册
          </a-button>
          <div class="login-link">
            已有账号？<a href="/user/login">立即登录</a>
          </div>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import { userRegister } from "@/api/user";
import { message } from "ant-design-vue";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons-vue";
import router from "@/router";

interface FormState {
  userEmail: string;
  userName: string;
  userPassword: string;
}

const formState = reactive<FormState>({
  userEmail: "",
  userName: "",
  userPassword: "",
});

const handleSubmit = async (value: any) => {
  const res = await userRegister(value);
  if (res.data.code === 0 && res.data.data) {
    message.success("注册成功");
    router.push("/user/login");
  } else {
    message.error(res.data.message || "注册失败");
  }
};

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};
</script>

<style scoped>
#userRegisterPage {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
}

.register-container {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  width: 400px;
}

.title {
  text-align: center;
  margin-bottom: 40px;
  color: #1890ff;
  font-size: 28px;
  font-weight: bold;
}

.register-form {
  max-width: 100%;
}

.register-form-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

.login-link {
  text-align: center;
  margin-top: 16px;
  color: #666;
}

.login-link a {
  color: #1890ff;
  margin-left: 8px;
}

.login-link a:hover {
  color: #40a9ff;
}

:deep(.ant-form-item-label > label) {
  font-size: 16px;
  color: #333;
}

:deep(.ant-input-affix-wrapper) {
  height: 40px;
}

:deep(.ant-form-item-explain-error) {
  font-size: 14px;
}
</style>
