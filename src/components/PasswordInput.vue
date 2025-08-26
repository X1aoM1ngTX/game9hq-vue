<template>
  <div class="password-input">
    <a-form-item :name="name" :rules="rules">
      <a-input-password
        :value="modelValue"
        :placeholder="placeholder"
        size="large"
        @update:value="handleInput"
        @compositionstart="isComposing = true"
        @compositionend="isComposing = false"
      >
        <template #prefix>
          <LockOutlined class="form-icon" />
        </template>
      </a-input-password>

      <div
        v-if="showStrength && modelValue"
        class="password-strength"
        :style="{ color: strengthColor }"
      >
        {{ strengthText }}
      </div>
    </a-form-item>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, defineProps, defineEmits, withDefaults } from "vue";
import { LockOutlined } from "@ant-design/icons-vue";
import {
  calculatePasswordStrength,
  getPasswordStrengthText,
  getPasswordStrengthColor,
} from "@/utils/passwordStrength";

interface Props {
  modelValue: string;
  name: string;
  placeholder: string;
  rules: any[];
  showStrength?: boolean;
}

interface Emits {
  (e: "update:modelValue", value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  showStrength: true,
});

const emit = defineEmits<Emits>();
const isComposing = ref(false);

const handleInput = (value: string) => {
  emit("update:modelValue", value);
};

const strength = computed(() => calculatePasswordStrength(props.modelValue));
const strengthText = computed(() => getPasswordStrengthText(strength.value));
const strengthColor = computed(() => getPasswordStrengthColor(strength.value));
</script>

<style scoped>
.form-icon {
  color: #8c8c8c;
}

.password-strength {
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.4;
  min-height: 18px;
  transition: color 0.3s ease;
}
</style>
