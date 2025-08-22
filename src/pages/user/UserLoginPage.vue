<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="title-text">
          <span class="primary">欢迎来到 </span>
          <span class="highlight">Game9</span>
        </div>
      </div>
      <a-form
        :model="formState"
        class="login-form"
        name="login"
        @finish="handleSubmit"
        @finishFailed="onFinishFailed"
        @keyup.enter="handleSubmit"
      >
        <a-form-item
          :rules="[{ required: true, message: '请输入账号!' }]"
          name="userName"
        >
          <a-input
            v-model:value="formState.userName"
            placeholder="用户名"
            size="large"
          >
            <template #prefix>
              <UserOutlined class="form-icon" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          :rules="[{ required: true, message: '请输入密码!' }]"
          name="userPassword"
        >
          <a-input-password
            v-model:value="formState.userPassword"
            placeholder="密码"
            size="large"
          >
            <template #prefix>
              <LockOutlined class="form-icon" />
            </template>
          </a-input-password>
        </a-form-item>

        <div class="form-options">
          <a-checkbox v-model:checked="rememberMe">记住我</a-checkbox>
        </div>

        <div class="form-actions">
          <a-button
            :disabled="loading || lockInfo.locked"
            :loading="loading"
            class="submit-button"
            html-type="submit"
            size="large"
            type="primary"
          >
            {{ lockInfo.locked ? `账号已锁定(${lockInfo.seconds}s)` : "登录" }}
          </a-button>
        </div>

        <div v-if="lockInfo.locked" class="lock-warning">
          <span>账号已锁定，请{{ lockInfo.seconds }}秒后再试</span>
        </div>

        <div class="form-links">
          <router-link class="register-link" to="/user/register">
            创建新账号
          </router-link>
          <router-link class="reset-link" to="/user/reset-password">
            忘记密码？
          </router-link>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from "vue";
import { LockOutlined, UserOutlined } from "@ant-design/icons-vue";
import { userLogin } from "@/api/user";
import { useLoginUserStore } from "@/stores/useLoginUserStore";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { debounce } from "lodash-es";

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
const lockInfo = ref({ locked: false, seconds: 0 });
const rememberMe = ref(false);
let lockTimer: ReturnType<typeof setInterval> | null = null;

const handleSubmit = debounce(
  async (values: FormState) => {
    if (lockInfo.value.locked) {
      message.error(`账号已锁定，请${lockInfo.value.seconds}秒后再试`);
      return;
    }
    try {
      loading.value = true;
      const res = await userLogin(values);
      if (res.data.code === 0) {
        saveCredentials();
        await loginUserStore.getLoginUser();
        message.success("登录成功");
        router.push("/");
      } else {
        if (
          res.data.description?.includes("锁定") ||
          res.data.description?.includes("请10分钟后再试")
        ) {
          lockInfo.value.locked = true;
          lockInfo.value.seconds = 600;
          message.error(res.data.description || "账号已锁定");
          if (lockTimer) clearInterval(lockTimer);
          lockTimer = setInterval(() => {
            lockInfo.value.seconds--;
            if (lockInfo.value.seconds <= 0) {
              lockInfo.value.locked = false;
              if (lockTimer) clearInterval(lockTimer);
            }
          }, 1000);
        }
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      loading.value = false;
    }
  },
  1000,
  { leading: true, trailing: false }
);

const onFinishFailed = (errorInfo: any) => {
  console.log("表单验证失败:", errorInfo);
};

// 记住密码功能
const saveCredentials = () => {
  if (rememberMe.value) {
    localStorage.setItem(
      "rememberedUser",
      JSON.stringify({
        userName: formState.userName,
        userPassword: formState.userPassword,
      })
    );
  } else {
    localStorage.removeItem("rememberedUser");
  }
};

const loadCredentials = () => {
  const saved = localStorage.getItem("rememberedUser");
  if (saved) {
    try {
      const credentials = JSON.parse(saved);
      formState.userName = credentials.userName;
      formState.userPassword = credentials.userPassword;
      rememberMe.value = true;
    } catch (e) {
      localStorage.removeItem("rememberedUser");
    }
  }
};

// 页面加载时读取保存的凭据
onMounted(() => {
  loadCredentials();
});
</script>

<style scoped>
.login-page {
  height: 100vh;
  width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.login-container {
  width: 100%;
  height: 100%;
  padding: 40px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, #4facfe, #00f2fe);
}

.login-header {
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

.login-form {
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
}

:deep(.ant-checkbox-wrapper) {
  color: #595959;
  font-size: 14px;
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

.form-links {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.register-link,
.reset-link {
  color: #595959;
  font-size: 14px;
  transition: all 0.2s;
  text-decoration: none;
  position: relative;
}

.register-link:hover,
.reset-link:hover {
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

/* 锁定警告 */
.lock-warning {
  margin-top: 12px;
  text-align: center;
  color: #ff4d4f;
  font-size: 13px;
  background: #fff2f0;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ffccc7;
}

@media (max-width: 576px) {
  .login-container {
    padding: 24px 16px;
  }

  .login-header {
    margin-bottom: 32px;
    padding-top: 32px;
  }

  .title-text {
    font-size: 24px;
  }
}
</style>
