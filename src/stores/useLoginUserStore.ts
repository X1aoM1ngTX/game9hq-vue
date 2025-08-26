import { defineStore } from "pinia";
import { ref } from "vue";
import { getCurrentUser } from "@/api/user";

interface UserState {
  loginUser: any;
  hasLogin: boolean;
}

export const useLoginUserStore = defineStore(
  "loginUser",
  () => {
    const loginUser = ref<any>(null);
    const hasLogin = ref<boolean>(false);

    /**
     * 获取当前登录用户信息（静默模式，不显示错误）
     */
    const getLoginUser = async () => {
      try {
        const res = await getCurrentUser();
        if (res.data.code === 0) {
          loginUser.value = res.data.data;
          hasLogin.value = true;
        } else {
          // 未登录是正常情况，不是错误
          loginUser.value = null;
          hasLogin.value = false;
        }
      } catch (error) {
        // 网络错误或未登录都是正常情况，静默处理
        loginUser.value = null;
        hasLogin.value = false;
      }
    };

    /**
     * 检查用户登录状态（静默模式）
     */
    const checkLoginStatus = async () => {
      await getLoginUser();
      return hasLogin.value;
    };

    return {
      loginUser,
      hasLogin,
      getLoginUser,
      checkLoginStatus,
    };
  },
  {
    persist: true,
  }
);
