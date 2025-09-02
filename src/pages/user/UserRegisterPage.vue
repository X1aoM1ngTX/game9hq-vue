<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <div class="logo-container">
          <div class="title-text">
            <span class="primary">加入 </span>
            <span class="highlight">Game9</span>
          </div>
        </div>
      </div>
      <div class="form-container">
        <a-form
          :model="formState"
          class="register-form"
          name="register"
          @finish="handleSubmit"
          @finishFailed="onFinishFailed"
        >
          <div class="form-section">
            <div class="section-title">基本信息</div>
            <a-form-item name="userName">
              <div class="input-wrapper">
                <div class="input-prefix">
                  <UserOutlined />
                </div>
                <a-input
                  v-model:value="formState.userName"
                  placeholder="请输入用户名"
                  size="large"
                  @blur="checkUserNameUnique"
                  @input="debouncedCheckUserName"
                  class="custom-input"
                />
              </div>
              <div class="validation-message">
                <div v-if="userNameChecking" class="checking">
                  <loading-outlined /> 检查用户名可用性...
                </div>
                <div v-else-if="userNameError" class="error">
                  <close-circle-outlined /> {{ userNameError }}
                </div>
                <div
                  v-else-if="userNameUnique && formState.userName.length >= 3"
                  class="success"
                >
                  <check-circle-outlined /> 用户名可用
                </div>
              </div>
            </a-form-item>

            <a-form-item name="userEmail">
              <div class="input-wrapper">
                <div class="input-prefix">
                  <MailOutlined />
                </div>
                <a-input
                  v-model:value="formState.userEmail"
                  placeholder="请输入邮箱地址"
                  size="large"
                  @blur="checkUserEmailUnique"
                  @input="debouncedCheckEmail"
                  class="custom-input"
                />
              </div>
              <div class="validation-message">
                <div v-if="userEmailChecking" class="checking">
                  <loading-outlined /> 检查邮箱可用性...
                </div>
                <div v-else-if="userEmailError" class="error">
                  <close-circle-outlined /> {{ userEmailError }}
                </div>
                <div
                  v-else-if="
                    userEmailUnique &&
                    isValidEmail(formState.userEmail) &&
                    !hasEmailFormatError
                  "
                  class="success"
                >
                  <check-circle-outlined /> 邮箱可用
                </div>
              </div>
            </a-form-item>
          </div>

          <div class="form-section">
            <div class="section-title">验证码</div>

            <a-form-item name="verifyCode">
              <div class="verify-code-container">
                <div class="verify-code-inputs">
                  <a-input
                    v-for="(char, index) in 6"
                    :key="index"
                    :value="formState.verifyCode[index] || ''"
                    @input="handleVerifyCodeInput($event, index)"
                    @keydown="handleVerifyCodeKeydown($event, index)"
                    @paste="handleVerifyCodePaste"
                    placeholder=""
                    size="large"
                    class="verify-code-input"
                    maxlength="1"
                    ref="verifyCodeInputs"
                    inputmode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
                <a-button
                  :disabled="loading || codeSent"
                  size="large"
                  type="primary"
                  @click="handleSendCode"
                  class="verify-code-button"
                >
                  {{ codeSent ? `重新获取(${countdown}s)` : "获取验证码" }}
                </a-button>
              </div>
              <div v-if="verifyCodeError" class="validation-message error">
                <close-circle-outlined /> {{ verifyCodeError }}
              </div>
            </a-form-item>
          </div>

          <div class="form-section">
            <div class="section-title">设置密码</div>

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
              <div
                v-if="formState.userPassword"
                class="password-strength"
                :class="getPasswordStrengthClass()"
              >
                <div class="strength-bar">
                  <div
                    class="strength-fill"
                    :style="{ width: passwordStrength * 33.33 + '%' }"
                  ></div>
                </div>
                <div class="strength-text">{{ passwordStrengthText }}</div>
              </div>
              <div v-if="passwordError" class="validation-message error">
                <close-circle-outlined /> {{ passwordError }}
              </div>
            </a-form-item>

            <a-form-item name="userCheckPassword">
              <div class="input-wrapper">
                <div class="input-prefix">
                  <LockOutlined />
                </div>
                <a-input-password
                  v-model:value="formState.userCheckPassword"
                  placeholder="请确认密码"
                  size="large"
                  class="custom-input"
                />
              </div>
              <div v-if="confirmPasswordError" class="validation-message error">
                <close-circle-outlined /> {{ confirmPasswordError }}
              </div>
            </a-form-item>
          </div>

          <div class="form-actions">
            <a-button
              :loading="loading"
              class="register-button"
              html-type="submit"
              size="large"
              type="primary"
            >
              <user-outlined />
              创建账户
            </a-button>
          </div>

          <div class="form-links">
            <span>已有账号？</span>
            <router-link class="login-link" to="/user/login">
              立即登录
            </router-link>
          </div>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, nextTick, watch } from "vue";
import {
  LockOutlined,
  MailOutlined,
  SafetyOutlined,
  UserOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons-vue";
import {
  checkUsernameAvailable,
  checkEmailAvailable,
  sendVerifyCode,
  userRegister,
  verifyCode,
} from "@/api/user";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { EncryptionUtil } from "@/utils/encryption";

interface FormState {
  userName: string;
  userEmail: string;
  userPassword: string;
  userCheckPassword: string;
  verifyCode: string;
}

// 注册请求参数接口（增加加密标识）
interface RegisterParams {
  userName: string;
  userEmail: string;
  userPassword: string;
  userCheckPassword: string;
  verifyCode: string;
  encrypted: boolean; // 标识密码是否已加密
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
const userNameUnique = ref(true);
const userEmailUnique = ref(true);
const userNameChecking = ref(false);
const userEmailChecking = ref(false);
const verifyCodeInputs = ref<any[]>([]);
const hasEmailFormatError = ref(false);

// 自定义验证状态
const userNameError = ref("");
const userEmailError = ref("");
const verifyCodeError = ref("");
const passwordError = ref("");
const confirmPasswordError = ref("");

// 验证码输入处理
const handleVerifyCodeInput = (event: any, index: number) => {
  const value = event.target.value;
  // 如果输入的是多个字符，只取最后一个有效字符
  const finalValue = value.length > 1 ? value[value.length - 1] : value;
  // 验证输入是否为有效字符（0-9）
  if (finalValue && /^[0-9]$/.test(finalValue)) {
    const currentCode = formState.verifyCode.split("");
    currentCode[index] = finalValue;
    formState.verifyCode = currentCode.join("");
    // 自动跳转到下一个输入框
    if (index < 5) {
      nextTick(() => {
        verifyCodeInputs.value[index + 1]?.focus();
      });
    }
  } else if (!value) {
    // 如果输入框为空，清除对应位置的字符
    const currentCode = formState.verifyCode.split("");
    currentCode[index] = "";
    formState.verifyCode = currentCode.join("");
  }
  // 清除输入框的值，防止显示多个字符
  event.target.value = finalValue;

  // 实时验证验证码
  validateVerifyCode();
};

// 验证码键盘事件处理
const handleVerifyCodeKeydown = (event: any, index: number) => {
  const key = event.key;

  // 处理删除键
  if (key === "Backspace" && !formState.verifyCode[index] && index > 0) {
    nextTick(() => {
      verifyCodeInputs.value[index - 1]?.focus();
    });
  }

  // 处理左右方向键
  if (key === "ArrowLeft" && index > 0) {
    nextTick(() => {
      verifyCodeInputs.value[index - 1]?.focus();
    });
  }

  if (key === "ArrowRight" && index < 5) {
    nextTick(() => {
      verifyCodeInputs.value[index + 1]?.focus();
    });
  }
};

// 验证码粘贴处理
const handleVerifyCodePaste = (event: any) => {
  event.preventDefault();
  const pastedData = event.clipboardData
    .getData("text")
    .replace(/[^0-9]/g, "")
    .slice(0, 6);

  if (pastedData) {
    formState.verifyCode = pastedData;

    // 聚焦到最后一个非空字符的下一个输入框
    const lastIndex = Math.min(pastedData.length - 1, 5);
    nextTick(() => {
      verifyCodeInputs.value[lastIndex]?.focus();
    });
  }
};

// 密码强度计算
const passwordStrength = computed(() => {
  const pwd = formState.userPassword;
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 2) return 1; // 弱
  if (score === 3 || score === 4) return 2; // 中
  if (score === 5) return 3; // 强
  return 0;
});

// 监听密码变化，实时验证
watch(
  () => formState.userPassword,
  () => {
    validatePassword();
    if (formState.userCheckPassword) {
      validateConfirmPassword();
    }
  }
);

// 监听确认密码变化，实时验证
watch(
  () => formState.userCheckPassword,
  () => {
    validateConfirmPassword();
  }
);
const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 1:
      return "密码强度：弱";
    case 2:
      return "密码强度：中";
    case 3:
      return "密码强度：强";
    default:
      return "";
  }
});
const passwordStrengthColor = computed(() => {
  switch (passwordStrength.value) {
    case 1:
      return "#ff4d4f";
    case 2:
      return "#faad14";
    case 3:
      return "#52c41a";
    default:
      return "#d9d9d9";
  }
});

// 获取密码强度类名
const getPasswordStrengthClass = () => {
  switch (passwordStrength.value) {
    case 1:
      return "weak";
    case 2:
      return "medium";
    case 3:
      return "strong";
    default:
      return "";
  }
};

// 自定义验证函数
const validateUserName = () => {
  if (!formState.userName) {
    userNameError.value = "请输入用户名";
    return false;
  }
  if (formState.userName.length < 3) {
    userNameError.value = "用户名长度不能小于3位";
    return false;
  }
  if (!userNameUnique.value) {
    userNameError.value = "用户名已被占用";
    return false;
  }
  userNameError.value = "";
  return true;
};

const validateUserEmail = () => {
  if (!formState.userEmail) {
    userEmailError.value = "请输入邮箱";
    return false;
  }
  if (!isValidEmail(formState.userEmail)) {
    userEmailError.value = "请输入有效的邮箱地址";
    return false;
  }
  if (!userEmailUnique.value) {
    userEmailError.value = "邮箱已被注册";
    return false;
  }
  userEmailError.value = "";
  return true;
};

const validateVerifyCode = () => {
  if (!formState.verifyCode) {
    verifyCodeError.value = "请输入验证码";
    return false;
  }
  if (formState.verifyCode.length !== 6) {
    verifyCodeError.value = "验证码长度必须为6位";
    return false;
  }
  if (!/^\d{6}$/.test(formState.verifyCode)) {
    verifyCodeError.value = "验证码必须为数字";
    return false;
  }
  verifyCodeError.value = "";
  return true;
};

const validatePassword = () => {
  if (!formState.userPassword) {
    passwordError.value = "请输入密码";
    return false;
  }
  if (formState.userPassword.length < 8) {
    passwordError.value = "密码长度不能小于8位";
    return false;
  }
  passwordError.value = "";
  return true;
};

const validateConfirmPassword = () => {
  if (!formState.userCheckPassword) {
    confirmPasswordError.value = "请确认密码";
    return false;
  }
  if (formState.userCheckPassword !== formState.userPassword) {
    confirmPasswordError.value = "两次输入的密码不一致";
    return false;
  }
  confirmPasswordError.value = "";
  return true;
};

// 验证所有字段
const validateAll = () => {
  const isUserNameValid = validateUserName();
  const isUserEmailValid = validateUserEmail();
  const isVerifyCodeValid = validateVerifyCode();
  const isPasswordValid = validatePassword();
  const isConfirmPasswordValid = validateConfirmPassword();

  return (
    isUserNameValid &&
    isUserEmailValid &&
    isVerifyCodeValid &&
    isPasswordValid &&
    isConfirmPasswordValid
  );
};

// 原有的验证密码函数（用于Ant Design验证）
const validatePasswordRule = async (_rule: any, value: string) => {
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
      message.error(res.data.description || "发送失败");
    }
  } catch (error: any) {
    message.error(error.description || "发送失败");
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
  // 先进行自定义验证
  if (!validateAll()) {
    return;
  }

  try {
    loading.value = true;
    const verifyRes = await verifyCode({
      email: formState.userEmail,
      code: formState.verifyCode,
    });

    if (verifyRes.data.code !== 0) {
      verifyCodeError.value = "验证码错误";
      return;
    }

    // 对密码进行加密
    const encryptedPassword = EncryptionUtil.encrypt(formState.userPassword);
    const encryptedCheckPassword = EncryptionUtil.encrypt(formState.userCheckPassword);
    const registerParams: RegisterParams = {
      userName: formState.userName,
      userEmail: formState.userEmail,
      userPassword: encryptedPassword,
      userCheckPassword: encryptedCheckPassword,
      verifyCode: formState.verifyCode,
      encrypted: true
    };
    
    const res = await userRegister(registerParams);
    if (res.data.code === 0) {
      message.success("注册成功");
      router.push("/user/login");
    } else {
      message.error(res.data.description || "注册失败");
    }
  } catch (error: any) {
    message.error(error.response?.data?.description || "注册失败");
  } finally {
    loading.value = false;
  }
};

// 表单验证失败
const onFinishFailed = (errorInfo: any) => {
  console.log("表单验证失败:", errorInfo);
};

// 防抖函数
const debounce = (fn: (...args: any[]) => void, delay: number) => {
  let timer: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

// 检查用户名是否唯一
const checkUserNameUnique = async () => {
  if (!formState.userName || formState.userName.length < 3) {
    userNameUnique.value = true;
    validateUserName(); // 验证用户名
    return;
  }
  userNameChecking.value = true;
  try {
    const res = await checkUsernameAvailable(formState.userName);
    userNameUnique.value = res.data.data;
  } catch {
    userNameUnique.value = true;
  } finally {
    userNameChecking.value = false;
    validateUserName(); // 检查完成后验证用户名
  }
};

// 检查邮箱格式
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 检查邮箱是否唯一
const checkUserEmailUnique = async () => {
  if (!formState.userEmail || !isValidEmail(formState.userEmail)) {
    userEmailUnique.value = true;
    hasEmailFormatError.value = !isValidEmail(formState.userEmail);
    validateUserEmail(); // 验证邮箱
    return;
  }

  hasEmailFormatError.value = false;
  userEmailChecking.value = true;
  try {
    const res = await checkEmailAvailable(formState.userEmail);
    userEmailUnique.value = res.data.data;
  } catch {
    userEmailUnique.value = true;
  } finally {
    userEmailChecking.value = false;
    validateUserEmail(); // 检查完成后验证邮箱
  }
};

// 创建防抖版本的检查函数
const debouncedCheckUserName = debounce(checkUserNameUnique, 800);
const debouncedCheckEmail = debounce(checkUserEmailUnique, 800);
</script>

<style scoped>
.register-page {
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

.register-container {
  width: 100%;
  max-width: 420px;
  margin: 0 16px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.register-header {
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
  padding: 12px 20px;
}

.register-form {
  width: 100%;
}

.form-section {
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
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
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
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
  border-color: #4f46e5;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
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
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.checking {
  color: #64748b;
}

.error {
  color: #ef4444;
}

.success {
  color: #10b981;
}

.verify-code-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.verify-code-inputs {
  display: flex;
  gap: 6px;
  flex: 1;
}

.verify-code-input {
  width: 40px !important;
  height: 40px !important;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
  transition: all 0.2s ease;
}

.verify-code-input:hover {
  border-color: #d1d5db;
  background: #ffffff;
}

.verify-code-input:focus {
  border-color: #4f46e5;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.verify-code-button {
  height: 40px;
  padding: 0 16px;
  font-weight: 500;
  border-radius: 6px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border: none;
  color: white;
  transition: all 0.2s ease;
  font-size: 13px;
}

.verify-code-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.verify-code-button:active {
  transform: translateY(0);
}

.verify-code-button:disabled {
  background: #f3f4f6;
  color: #6b7280;
  transform: none;
  box-shadow: none;
}

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.password-strength.weak .strength-fill {
  background: #ef4444;
}

.password-strength.medium .strength-fill {
  background: #f59e0b;
}

.password-strength.strong .strength-fill {
  background: #10b981;
}

.strength-text {
  font-size: 14px;
  font-weight: 500;
  min-width: 80px;
}

.password-strength.weak .strength-text {
  color: #ef4444;
}

.password-strength.medium .strength-text {
  color: #f59e0b;
}

.password-strength.strong .strength-text {
  color: #10b981;
}

.form-actions {
  margin-top: 12px;
}

.register-button {
  width: 100%;
  height: 42px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border: none;
  color: white;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.register-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.register-button:active {
  transform: translateY(0);
}

.form-links {
  margin-top: 16px;
  text-align: center;
  font-size: 13px;
  color: #6b7280;
}

.login-link {
  color: #4f46e5;
  font-weight: 500;
  text-decoration: none;
  margin-left: 4px;
  transition: color 0.2s ease;
}

.login-link:hover {
  color: #7c3aed;
}

/* 移动端适配 */
@media (max-width: 640px) {
  .register-page {
    padding: 16px 0;
  }

  .register-container {
    margin: 0 12px;
    border-radius: 12px;
  }

  .register-header {
    padding: 20px 16px;
  }

  .form-container {
    padding: 20px 16px;
  }

  .title-text {
    font-size: 22px;
  }

  .form-section {
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 15px;
    margin-bottom: 14px;
  }

  .verify-code-input {
    width: 36px !important;
    height: 36px !important;
    font-size: 14px;
  }

  .verify-code-button {
    height: 36px;
    padding: 0 12px;
    font-size: 12px;
  }

  .register-button {
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
  .register-container {
    margin: 0 8px;
  }

  .register-header {
    padding: 16px 12px;
  }

  .form-container {
    padding: 16px 12px;
  }

  .title-text {
    font-size: 20px;
  }

  .verify-code-input {
    width: 32px !important;
    height: 32px !important;
    font-size: 13px;
  }

  .verify-code-button {
    height: 32px;
    padding: 0 10px;
    font-size: 11px;
  }
}
</style>
