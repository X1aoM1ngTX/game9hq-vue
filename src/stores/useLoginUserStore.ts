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
     * 获取当前登录用户信息
     */
    const getLoginUser = async () => {
      try {
        const res = await getCurrentUser();
        if (res.data.code === 0) {
          loginUser.value = res.data.data;
          hasLogin.value = true;
        } else {
          loginUser.value = null;
          hasLogin.value = false;
        }
      } catch (error) {
        loginUser.value = null;
        hasLogin.value = false;
      }
    };

    return {
      loginUser,
      hasLogin,
      getLoginUser,
    };
  },
  {
    persist: true,
  },
);
