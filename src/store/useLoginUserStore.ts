import { defineStore } from "pinia";
import { ref } from "vue";
import { getCurrentUser } from "@/api/user";

export const useLoginUserStore = defineStore("loginUser", () => {
  const loginUser = ref<any>({
    userId: null,
    userName: "",
    userEmail: "",
    userPhone: "",
    userIsAdmin: 0,
  });

  // 远程获取登录用户信息
  async function fetchLoginUser() {
    const res = await getCurrentUser();
    if (res.data.code === 0 && res.data.data) {
      loginUser.value = res.data.data;
    }
  }

  // 设置用户信息
  function setLoginUser(newUser: any) {
    loginUser.value = newUser;
  }

  // 添加 logout 方法
  function logout() {
    loginUser.value = {
      userId: null,
      userName: "",
      userEmail: "",
      userPhone: "",
      userIsAdmin: 0,
    };
  }

  return { loginUser, fetchLoginUser, setLoginUser, logout };
});
