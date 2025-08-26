/**
 * 密码强度计算工具
 * @param password 密码
 * @returns 强度等级 (0-3)
 */
export const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return 1; // 弱
  if (score === 3 || score === 4) return 2; // 中
  if (score === 5) return 3; // 强
  return 0;
};

/**
 * 获取密码强度文本
 * @param strength 强度等级
 * @returns 强度文本
 */
export const getPasswordStrengthText = (strength: number): string => {
  switch (strength) {
    case 1:
      return "密码强度：弱";
    case 2:
      return "密码强度：中";
    case 3:
      return "密码强度：强";
    default:
      return "";
  }
};

/**
 * 获取密码强度颜色
 * @param strength 强度等级
 * @returns 颜色值
 */
export const getPasswordStrengthColor = (strength: number): string => {
  switch (strength) {
    case 1:
      return "#ff4d4f";
    case 2:
      return "#faad14";
    case 3:
      return "#52c41a";
    default:
      return "#d9d9d9";
  }
};
