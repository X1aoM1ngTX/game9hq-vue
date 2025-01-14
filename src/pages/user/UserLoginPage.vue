<template>
  <div id="userLoginPage">
    <div class="login-container">
      <h2 class="title">Welcome To XMGame</h2>
      <a-form
        :model="formState"
        name="normal_login"
        class="login-form"
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

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            class="login-form-button"
            size="large"
          >
            登录
          </a-button>
          <div class="register-link">
            还没有账号？<a href="/user/register">立即注册</a>
          </div>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import { userLogin } from "@/api/user";
import { useLoginUserStore } from "@/store/useLoginUserStore";
import { message } from "ant-design-vue";
import router from "@/router";

interface FormState {
  userName: string;
  userPassword: string;
}

const formState = reactive<FormState>({
  userName: "",
  userPassword: "",
});

const loginUserStore = useLoginUserStore();

const handleSubmit = async (value: any) => {
  const res = await userLogin(value);
  if (res.data.code === 0 && res.data.data) {
    await loginUserStore.fetchLoginUser();
    message.success("登录成功");
    router.push({
      path: "/",
      replace: true,
    });
  }
  console.log(value);
};

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};
</script>

<style scoped>
#userLoginPage {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
}

.login-container {
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

.login-form {
  max-width: 100%;
}

.login-form-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

.register-link {
  text-align: center;
  margin-top: 16px;
  color: #666;
}

.register-link a {
  color: #1890ff;
  margin-left: 8px;
}

.register-link a:hover {
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
