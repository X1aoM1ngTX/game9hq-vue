<template>
  <div class="verify-code-input">
    <a-form-item :name="name" :rules="rules">
      <div class="verify-code-container">
        <div class="verify-code-inputs">
          <a-input
            v-for="(char, index) in codeLength"
            :key="index"
            :value="code[index] || ''"
            @input="handleInput($event, index)"
            @keydown="handleKeydown($event, index)"
            @paste="handlePaste"
            @compositionstart="isComposing = true"
            @compositionend="handleCompositionEnd($event, index)"
            placeholder=""
            size="large"
            class="verify-code-field"
            maxlength="1"
            :ref="(el) => setRef(el, index)"
            inputmode="numeric"
            pattern="[0-9]*"
          />
        </div>
        <a-button
          :disabled="disabled || codeSent"
          size="large"
          type="primary"
          class="send-code-button"
          @click="handleSendCode"
        >
          {{ codeSent ? `重新获取(${countdown}s)` : buttonText }}
        </a-button>
      </div>
    </a-form-item>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, defineProps, defineEmits, withDefaults } from "vue";

interface Props {
  code: string;
  name: string;
  rules: any[];
  disabled?: boolean;
  codeSent?: boolean;
  countdown?: number;
  buttonText?: string;
  codeLength?: number;
}

interface Emits {
  (e: "update:code", value: string): void;
  (e: "send-code"): void;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  codeSent: false,
  countdown: 60,
  buttonText: "获取验证码",
  codeLength: 6,
});

const emit = defineEmits<Emits>();

const inputRefs = ref<any[]>([]);
const isComposing = ref(false);

const setRef = (el: any, index: number) => {
  if (el) {
    inputRefs.value[index] = el;
  }
};

const handleCompositionEnd = (event: any, index: number) => {
  isComposing.value = false;
  // 在组合输入结束后，手动触发一次输入处理
  handleInput(event, index);
};

const handleInput = (event: any, index: number) => {
  // 如果正在组合输入（中文输入法），不处理
  if (isComposing.value) {
    return;
  }

  const value = event.target?.value || event;
  const finalValue = value.length > 1 ? value[value.length - 1] : value;

  if (finalValue && /^[0-9]$/.test(finalValue)) {
    const currentCode = props.code.split("");
    currentCode[index] = finalValue;
    emit("update:code", currentCode.join(""));

    if (index < props.codeLength - 1) {
      nextTick(() => {
        inputRefs.value[index + 1]?.focus();
      });
    }
  } else if (!value) {
    const currentCode = props.code.split("");
    currentCode[index] = "";
    emit("update:code", currentCode.join(""));
  }

  if (event.target) {
    event.target.value = finalValue;
  }
};

const handleKeydown = (event: any, index: number) => {
  // 防止中文输入法的组合事件干扰
  if (event instanceof CompositionEvent) {
    return;
  }

  const key = event.key;

  if (key === "Backspace" && !props.code[index] && index > 0) {
    nextTick(() => {
      inputRefs.value[index - 1]?.focus();
    });
  }

  if (key === "ArrowLeft" && index > 0) {
    nextTick(() => {
      inputRefs.value[index - 1]?.focus();
    });
  }

  if (key === "ArrowRight" && index < props.codeLength - 1) {
    nextTick(() => {
      inputRefs.value[index + 1]?.focus();
    });
  }
};

const handlePaste = (event: any) => {
  // 防止中文输入法的组合事件干扰
  if (event instanceof CompositionEvent) {
    return;
  }

  event.preventDefault();
  const pastedData =
    event.clipboardData
      ?.getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, props.codeLength) || "";

  if (pastedData) {
    emit("update:code", pastedData);

    const lastIndex = Math.min(pastedData.length - 1, props.codeLength - 1);
    nextTick(() => {
      inputRefs.value[lastIndex]?.focus();
    });
  }
};

const handleSendCode = () => {
  emit("send-code");
};
</script>

<style scoped>
.verify-code-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.verify-code-inputs {
  display: flex;
  gap: 4px;
  flex: 1;
}

.verify-code-field {
  width: 48px;
  text-align: center;
}

.send-code-button {
  white-space: nowrap;
  min-width: 120px;
}
</style>
