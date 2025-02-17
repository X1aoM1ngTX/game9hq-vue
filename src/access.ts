import router from "./router";
import { useLoginUserStore } from "@/stores/useLoginUserStore";
import { message } from "ant-design-vue";

// 在每次路由跳转前执行
router.beforeEach(async (to, from, next) => {
  const loginUserStore = useLoginUserStore(); // 获取登录用户的 store
  const loginUser = loginUserStore.loginUser; // 获取登录用户信息
  const toUrl = to.fullPath; // 获取目标路由的完整路径

  // 如果目标路由以 /admin 开头
  if (toUrl.startsWith("/admin")) {
    // 检查用户是否有权限访问
    if (!loginUser.userId || loginUser.userIsAdmin !== 1) {
      message.error("没有权限"); // 显示错误信息
      next(`/user/login?redirectTo=${to.fullPath}`); // 重定向到登录页面，并传递重定向路径
      return;
    }
  }
  next(); // 允许路由跳转
});
