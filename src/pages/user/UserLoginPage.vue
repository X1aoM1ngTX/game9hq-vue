<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="logo-container">
          <div class="title-text">
            <span class="primary">欢迎来到 </span>
            <span class="highlight">Game9</span>
          </div>
        </div>
      </div>
      <div class="form-container">
        <a-form
          :model="formState"
          class="login-form"
          name="login"
          @finish="handleSubmit"
          @finishFailed="onFinishFailed"
          @keyup.enter="handleSubmit"
        >
          <div class="form-section">
            <div class="section-title">账户信息</div>
            <a-form-item name="userName">
              <div class="input-wrapper">
                <div class="input-prefix">
                  <UserOutlined />
                </div>
                <a-input
                  v-model:value="formState.userName"
                  placeholder="请输入用户名"
                  size="large"
                  class="custom-input"
                />
              </div>
              <div v-if="userNameError" class="validation-message error">
                <close-circle-outlined /> {{ userNameError }}
              </div>
            </a-form-item>

            <a-form-item name="userPassword">
              <div class="input-wrapper">
                <div class="input-prefix">
                  <LockOutlined />
                </div>
                <a-input-password
                  v-model:value="formState.userPassword"
                  placeholder="请输入密码"
                  size="large"
                  class="custom-input"
                />
              </div>
              <div v-if="passwordError" class="validation-message error">
                <close-circle-outlined /> {{ passwordError }}
              </div>
            </a-form-item>
          </div>

          <div class="form-options">
            <a-checkbox v-model:checked="rememberMe">记住我</a-checkbox>
          </div>

          <div v-if="lockInfo.locked" class="lock-warning">
            <exclamation-circle-outlined />
            账号已锁定，请{{ lockInfo.seconds }}秒后再试
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
              <login-outlined v-if="!lockInfo.locked" />
              <lock-outlined v-else />
              {{
                lockInfo.locked ? `账号已锁定(${lockInfo.seconds}s)` : "登录"
              }}
            </a-button>
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
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted, watch } from "vue";
import {
  LockOutlined,
  UserOutlined,
  LoginOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons-vue";
import { userLogin } from "@/api/user";
import { useLoginUserStore } from "@/stores/useLoginUserStore";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { debounce } from "lodash-es";
import { EncryptionUtil } from "@/utils/encryption";

interface FormState {
  userName: string;
  userPassword: string;
}

// 登录请求参数接口（增加加密标识）
interface LoginParams {
  userName: string;
  userPassword: string;
  encrypted: boolean; // 标识密码是否已加密
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

// 自定义验证状态
const userNameError = ref("");
const passwordError = ref("");

// 自定义验证函数
const validateUserName = () => {
  if (!formState.userName) {
    userNameError.value = "请输入用户名";
    return false;
  }
  if (formState.userName.trim().length === 0) {
    userNameError.value = "用户名不能为空";
    return false;
  }
  userNameError.value = "";
  return true;
};

const validatePassword = () => {
  if (!formState.userPassword) {
    passwordError.value = "请输入密码";
    return false;
  }
  if (formState.userPassword.trim().length === 0) {
    passwordError.value = "密码不能为空";
    return false;
  }
  passwordError.value = "";
  return true;
};

// 验证所有字段
const validateAll = () => {
  const isUserNameValid = validateUserName();
  const isPasswordValid = validatePassword();

  return isUserNameValid && isPasswordValid;
};

const handleSubmit = debounce(
  async (values: FormState) => {
    // 先进行自定义验证
    if (!validateAll()) {
      return;
    }

    if (lockInfo.value.locked) {
      message.error(`账号已锁定，请${lockInfo.value.seconds}秒后再试`);
      return;
    }

    try {
      loading.value = true;
      // 对密码进行加密
      const encryptedPassword = EncryptionUtil.encrypt(formState.userPassword);
      const loginParams: LoginParams = {
        userName: formState.userName,
        userPassword: encryptedPassword,
        encrypted: true,
      };
      const res = await userLogin(loginParams);
      if (res.data.code === 0) {
        saveCredentials();
        await loginUserStore.getLoginUser();
        message.success("登录成功");
        router.push("/");
      } else {
        message.error(res.data.description || "登录失败");

        if (
          res.data.description?.includes("锁定") ||
          res.data.description?.includes("请10分钟后再试")
        ) {
          lockInfo.value.locked = true;
          lockInfo.value.seconds = 600;
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
    } catch (error) {
      console.log(error);
      const axiosError = error as {
        response?: { data?: { description?: string } };
      };
      message.error(axiosError?.response?.data?.description || "登录失败");
    } finally {
      loading.value = false;
    }
  },
  1000,
  { leading: true, trailing: false }
);

const onFinishFailed = (errorInfo: unknown) => {
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

// 监听用户名变化，实时验证
watch(
  () => formState.userName,
  () => {
    validateUserName();
  }
);

// 监听密码变化，实时验证
watch(
  () => formState.userPassword,
  () => {
    validatePassword();
  }
);

// 页面加载时读取保存的凭据
onMounted(() => {
  loadCredentials();
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  position: relative;
  overflow: hidden;
  padding: 20px 0;
}

.login-container {
  width: 100%;
  max-width: 420px;
  margin: 0 16px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.login-header {
  background: linear-gradient(135deg, #46cde5 0%, #7c3aed 100%);
  padding: 24px 20px;
  text-align: center;
  color: white;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
}

.title-text {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.primary {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.highlight {
  color: white;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
  margin-top: 2px;
}

.form-container {
  padding: 24px 20px;
}

.login-form {
  width: 100%;
}

.form-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  background: linear-gradient(135deg, #46cde5 0%, #7c3aed 100%);
  border-radius: 2px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
  overflow: hidden;
}

.input-wrapper:hover {
  border-color: #d1d5db;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.input-wrapper:focus-within {
  border-color: #46cde5;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(70, 205, 229, 0.1);
}

.input-prefix {
  padding: 0 12px;
  color: #6b7280;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 0;
  font-size: 14px;
  color: #111827;
}

.custom-input:focus {
  outline: none;
  box-shadow: none;
}

.validation-message {
  margin-top: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.validation-message.error {
  color: #ef4444;
}

.form-options {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
}

:deep(.ant-checkbox-wrapper) {
  color: #374151;
  font-size: 13px;
  font-weight: 500;
}

.lock-warning {
  margin-bottom: 16px;
  text-align: center;
  color: #ef4444;
  font-size: 13px;
  background: #fef2f2;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #fecaca;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.form-actions {
  margin-top: 16px;
}

.submit-button {
  width: 100%;
  height: 42px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #46cde5 0%, #7c3aed 100%);
  border: none;
  color: white;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.submit-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(70, 205, 229, 0.3);
}

.submit-button:active {
  transform: translateY(0);
}

.form-links {
  margin-top: 16px;
  text-align: center;
  font-size: 13px;
  color: #6b7280;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.register-link,
.reset-link {
  color: #46cde5;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;
}

.register-link:hover,
.reset-link:hover {
  color: #7c3aed;
}

/* 移动端适配 */
@media (max-width: 640px) {
  .login-page {
    padding: 16px 0;
  }

  .login-container {
    margin: 0 12px;
    border-radius: 12px;
  }

  .login-header {
    padding: 20px 16px;
  }

  .form-container {
    padding: 20px 16px;
  }

  .title-text {
    font-size: 22px;
  }

  .form-section {
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 15px;
    margin-bottom: 14px;
  }

  .submit-button {
    height: 40px;
    font-size: 14px;
  }

  .input-wrapper {
    border-radius: 6px;
  }

  .custom-input {
    padding: 10px 0;
    font-size: 13px;
  }

  .input-prefix {
    padding: 0 10px;
    font-size: 13px;
  }
}

/* 小屏幕适配 */
@media (max-width: 480px) {
  .login-container {
    margin: 0 8px;
  }

  .login-header {
    padding: 16px 12px;
  }

  .form-container {
    padding: 16px 12px;
  }

  .title-text {
    font-size: 20px;
  }

  .form-links {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
