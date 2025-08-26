<template>
  <div class="form-input">
    <a-form-item :name="name" :rules="rules">
      <a-input
        :value="modelValue"
        :placeholder="placeholder"
        size="large"
        @blur="handleBlur"
        @update:value="handleInput"
        @compositionstart="isComposing = true"
        @compositionend="isComposing = false"
      >
        <template #prefix>
          <component :is="icon" class="form-icon" />
        </template>
      </a-input>

      <div v-if="checking" class="validation-message checking">
        {{ checkingMessage }}
      </div>
      <div
        v-else-if="!isValid && modelValue && showValidation"
        class="validation-message error"
      >
        {{ errorMessage }}
      </div>
      <div
        v-else-if="isValid && modelValue && showValidation"
        class="validation-message success"
      >
        {{ successMessage }}
      </div>
    </a-form-item>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, defineProps, defineEmits, withDefaults } from "vue";

interface Props {
  modelValue: string;
  name: string;
  placeholder: string;
  icon: any;
  rules: any[];
  checking: boolean;
  isValid: boolean;
  checkingMessage?: string;
  errorMessage?: string;
  successMessage?: string;
  minLength?: number;
  validationPattern?: RegExp;
}

interface Emits {
  (e: "update:modelValue", value: string): void;
  (e: "blur"): void;
  (e: "input"): void;
}

const props = withDefaults(defineProps<Props>(), {
  checkingMessage: "检查中...",
  errorMessage: "已被占用",
  successMessage: "可用",
  minLength: 3,
  validationPattern: undefined,
});

const emit = defineEmits<Emits>();
const isComposing = ref(false);

const showValidation = computed(() => {
  if (!props.modelValue || typeof props.modelValue !== "string") {
    return false;
  }
  if (props.validationPattern) {
    return props.validationPattern.test(props.modelValue);
  }
  return props.modelValue.length >= props.minLength;
});

const handleBlur = () => {
  emit("blur");
};

const handleInput = (value: string) => {
  // 如果正在组合输入（中文输入法），不处理防抖
  if (!isComposing.value) {
    emit("input");
  }
  emit("update:modelValue", value);
};
</script>

<style scoped>
.form-icon {
  color: #8c8c8c;
}

.validation-message {
  margin-bottom: 8px;
  font-size: 12px;
  transition: all 0.3s ease;
}

.validation-message.checking {
  color: #8c8c8c;
}

.validation-message.error {
  color: #ff4d4f;
}

.validation-message.success {
  color: #52c41a;
}
</style>
