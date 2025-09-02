<template>
  <div class="reset-password-page">
    <div class="reset-password-container">
      <div class="reset-password-header">
        <div class="title-text">
          <span class="primary">重置 </span>
          <span class="highlight">密码</span>
        </div>
      </div>
      <div class="form-container">
        <a-form
          :model="formState"
          class="reset-password-form"
          name="reset-password"
          @finish="handleSubmit"
        >
          <a-form-item name="email">
            <div class="input-wrapper">
              <div class="input-prefix">
                <MailOutlined />
              </div>
              <a-input
                v-model:value="formState.email"
                placeholder="请输入邮箱"
                size="large"
                class="custom-input"
              />
            </div>
            <div v-if="emailError" class="validation-message error">
              <close-circle-outlined /> {{ emailError }}
            </div>
          </a-form-item>

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
                  :ref="(el) => (verifyCodeInputs[index] = el)"
                  inputmode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              <a-button
                :disabled="loading || codeSent"
                size="large"
                type="primary"
                class="verify-code-button"
                @click="handleSendCode"
              >
                {{ codeSent ? `重新获取(${countdown}s)` : "获取验证码" }}
              </a-button>
            </div>
            <div v-if="verifyCodeError" class="validation-message error">
              <close-circle-outlined /> {{ verifyCodeError }}
            </div>
          </a-form-item>

          <a-form-item name="newPassword">
            <div class="input-wrapper">
              <div class="input-prefix">
                <LockOutlined />
              </div>
              <a-input-password
                v-model:value="formState.newPassword"
                placeholder="请输入新密码"
                size="large"
                class="custom-input"
              />
            </div>
            <div v-if="newPasswordError" class="validation-message error">
              <close-circle-outlined /> {{ newPasswordError }}
            </div>
          </a-form-item>

          <div
            v-if="formState.newPassword"
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

          <a-form-item name="confirmPassword">
            <div class="input-wrapper">
              <div class="input-prefix">
                <LockOutlined />
              </div>
              <a-input-password
                v-model:value="formState.confirmPassword"
                placeholder="请确认新密码"
                size="large"
                class="custom-input"
              />
            </div>
            <div v-if="confirmPasswordError" class="validation-message error">
              <close-circle-outlined /> {{ confirmPasswordError }}
            </div>
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
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, nextTick, watch } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { resetPassword, sendVerifyCode, verifyCode } from "@/api/user";
import { EncryptionUtil } from "@/utils/encryption";
import {
  LockOutlined,
  MailOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();
const loading = ref(false);
const codeSent = ref(false);
const countdown = ref(60);
let timer: ReturnType<typeof setInterval> | null = null;
const verifyCodeInputs = ref<HTMLInputElement[]>([]);

// 自定义验证状态
const emailError = ref("");
const verifyCodeError = ref("");
const newPasswordError = ref("");
const confirmPasswordError = ref("");

const formState = reactive({
  email: "",
  verifyCode: "",
  newPassword: "",
  confirmPassword: "",
});

// 重置密码请求参数接口（增加加密标识）
interface ResetPasswordParams {
  email: string;
  verifyCode: string;
  newPassword: string;
  encrypted: boolean; // 标识密码是否已加密
}

// 自定义验证函数
const validateEmail = () => {
  if (!formState.email) {
    emailError.value = "请输入邮箱";
    return false;
  }
  if (formState.email.trim().length === 0) {
    emailError.value = "邮箱不能为空";
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formState.email)) {
    emailError.value = "请输入有效的邮箱地址";
    return false;
  }
  emailError.value = "";
  return true;
};

const validateVerifyCode = () => {
  if (!formState.verifyCode) {
    verifyCodeError.value = "请输入验证码";
    return false;
  }
  if (formState.verifyCode.trim().length === 0) {
    verifyCodeError.value = "验证码不能为空";
    return false;
  }
  if (formState.verifyCode.length !== 6) {
    verifyCodeError.value = "验证码长度必须为6位";
    return false;
  }
  if (!/^\d{6}$/.test(formState.verifyCode)) {
    verifyCodeError.value = "验证码只能包含数字";
    return false;
  }
  verifyCodeError.value = "";
  return true;
};

const validateNewPassword = () => {
  if (!formState.newPassword) {
    newPasswordError.value = "请输入新密码";
    return false;
  }
  if (formState.newPassword.trim().length === 0) {
    newPasswordError.value = "新密码不能为空";
    return false;
  }
  if (formState.newPassword.length < 8) {
    newPasswordError.value = "密码长度不能小于8位";
    return false;
  }
  newPasswordError.value = "";
  return true;
};

const validateConfirmPassword = () => {
  if (!formState.confirmPassword) {
    confirmPasswordError.value = "请确认新密码";
    return false;
  }
  if (formState.confirmPassword.trim().length === 0) {
    confirmPasswordError.value = "确认密码不能为空";
    return false;
  }
  if (formState.confirmPassword !== formState.newPassword) {
    confirmPasswordError.value = "两次输入的密码不一致";
    return false;
  }
  confirmPasswordError.value = "";
  return true;
};

// 验证所有字段
const validateAll = () => {
  const isEmailValid = validateEmail();
  const isVerifyCodeValid = validateVerifyCode();
  const isNewPasswordValid = validateNewPassword();
  const isConfirmPasswordValid = validateConfirmPassword();

  return (
    isEmailValid &&
    isVerifyCodeValid &&
    isNewPasswordValid &&
    isConfirmPasswordValid
  );
};

// 验证码输入处理
const handleVerifyCodeInput = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;
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
  target.value = finalValue;
  // 验证码变化时触发验证
  validateVerifyCode();
};

// 验证码键盘事件处理
const handleVerifyCodeKeydown = (event: KeyboardEvent, index: number) => {
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
const handleVerifyCodePaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const pastedData = event.clipboardData
    ?.getData("text")
    .replace(/[^0-9]/g, "")
    .slice(0, 6);

  if (pastedData) {
    formState.verifyCode = pastedData;

    // 聚焦到最后一个非空字符的下一个输入框
    const lastIndex = Math.min(pastedData.length - 1, 5);
    nextTick(() => {
      verifyCodeInputs.value[lastIndex]?.focus();
    });
    // 粘贴后触发验证
    validateVerifyCode();
  }
};

// 发送验证码
const handleSendCode = async () => {
  if (codeSent.value) return;

  // 先验证邮箱
  if (!validateEmail()) {
    return;
  }

  try {
    loading.value = true;
    const res = await sendVerifyCode({
      toEmail: formState.email,
    });
    if (res.data.code === 0) {
      message.success("验证码已发送到您的邮箱");
      codeSent.value = true;
      startCountdown();
    } else {
      message.error(res.data.description || "发送失败，请稍后重试");
    }
  } catch (error) {
    const axiosError = error as {
      response?: { data?: { description?: string } };
    };
    message.error(
      axiosError?.response?.data?.description || "发送失败，请稍后重试"
    );
  } finally {
    loading.value = false;
  }
};

// 倒计时逻辑
const startCountdown = () => {
  countdown.value = 60;
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      codeSent.value = false;
      if (timer) clearInterval(timer);
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
      email: formState.email,
      code: formState.verifyCode,
    });
    if (verifyRes.data.code !== 0) {
      message.error("验证码错误");
      return;
    }

    // 对新密码进行加密
    const encryptedNewPassword = EncryptionUtil.encrypt(formState.newPassword);
    const resetParams: ResetPasswordParams = {
      email: formState.email,
      verifyCode: formState.verifyCode,
      newPassword: encryptedNewPassword,
      encrypted: true
    };
    
    const resetRes = await resetPassword(resetParams);
    if (resetRes.data.code === 0) {
      message.success("密码重置成功");
      router.push("/user/login");
    } else {
      message.error(resetRes.data.description || "重置失败");
    }
  } catch (error) {
    const axiosError = error as {
      response?: { data?: { description?: string } };
    };
    message.error(
      axiosError?.response?.data?.description || "操作失败，请稍后重试"
    );
  } finally {
    loading.value = false;
  }
};

// 密码强度计算
const passwordStrength = computed(() => {
  const pwd = formState.newPassword;
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

// 监听邮箱变化，实时验证
watch(
  () => formState.email,
  () => {
    validateEmail();
  }
);

// 监听新密码变化，实时验证
watch(
  () => formState.newPassword,
  () => {
    validateNewPassword();
    // 新密码变化时重新验证确认密码
    if (formState.confirmPassword) {
      validateConfirmPassword();
    }
  }
);

// 监听确认密码变化，实时验证
watch(
  () => formState.confirmPassword,
  () => {
    validateConfirmPassword();
  }
);
</script>

<style scoped>
.reset-password-page {
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

.reset-password-container {
  width: 100%;
  max-width: 420px;
  margin: 0 16px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.reset-password-header {
  background: linear-gradient(135deg, #46cde5 0%, #7c3aed 100%);
  padding: 24px 20px;
  text-align: center;
  color: white;
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

.form-container {
  padding: 24px 20px;
}

.reset-password-form {
  width: 100%;
}

:deep(.ant-form-item) {
  margin-bottom: 20px;
}

.form-actions {
  margin-top: 24px;
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
  color: #7c3aed;
}

/* 底部文字 */
.form-links span {
  color: #8c8c8c;
  font-size: 14px;
}

/* 输入框样式 */
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

/* 验证码容器样式 */
.verify-code-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.verify-code-inputs {
  display: flex;
  gap: 8px;
  flex: none;
}

.verify-code-input {
  width: 42px !important;
  text-align: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.verify-code-input:hover {
  border-color: #d1d5db;
  background: #ffffff;
}

.verify-code-input:focus {
  border-color: #46cde5;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(70, 205, 229, 0.1);
}

.verify-code-button {
  height: 44px;
  min-width: 100px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  color: #595959;
  font-size: 13px;
  border-radius: 8px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  white-space: nowrap;
  flex-shrink: 0;
}

.verify-code-button:hover {
  color: #46cde5;
  border-color: #46cde5;
  background: #fff;
  box-shadow: 0 2px 8px rgba(70, 205, 229, 0.1);
}

.verify-code-button:active {
  color: #46cde5;
  border-color: #46cde5;
  box-shadow: 0 2px 4px rgba(70, 205, 229, 0.1);
}

.verify-code-button[disabled] {
  color: rgba(0, 0, 0, 0.25);
  border-color: #e0e0e0;
  background: #f5f5f5;
  text-shadow: none;
  box-shadow: none;
}

/* 验证消息样式 */
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

/* 密码强度提示 */
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

/* 移动端适配 */
@media (max-width: 640px) {
  .reset-password-page {
    padding: 16px 0;
  }

  .reset-password-container {
    margin: 0 12px;
    border-radius: 12px;
  }

  .reset-password-header {
    padding: 20px 16px;
  }

  .form-container {
    padding: 20px 16px;
  }

  .title-text {
    font-size: 22px;
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

  .verify-code-container {
    gap: 8px;
  }

  .verify-code-inputs {
    gap: 6px;
  }

  .verify-code-input {
    width: 38px !important;
  }

  .verify-code-button {
    min-width: 90px;
    font-size: 12px;
  }
}

/* 小屏幕适配 */
@media (max-width: 480px) {
  .reset-password-container {
    margin: 0 8px;
  }

  .reset-password-header {
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

  .verify-code-container {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .verify-code-inputs {
    justify-content: center;
  }

  .verify-code-input {
    width: 35px !important;
  }

  .verify-code-button {
    min-width: auto;
    width: 100%;
  }
}
</style>
