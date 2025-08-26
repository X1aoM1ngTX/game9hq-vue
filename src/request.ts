import axios from "axios";

const myAxios = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || "http://localhost:8080",
  timeout: 10000,
  withCredentials: true,
});

// 添加请求拦截器
myAxios.interceptors.request.use(
  function (config) {
    // 在请求发送之前做一些事情
    return config;
  },
  function (error) {
    // 处理请求错误
    return Promise.reject(error);
  }
);

// 添加响应拦截器
myAxios.interceptors.response.use(
  function (response) {
    // 任何状态码在2xx范围内的都会触发这个函数
    // 处理响应数据
    const { data } = response;
    // 未登录
    if (data.code === 40100) {
      // 定义不需要登录的公开页面
      const publicPages = ["/", "/shop", "/notice", "/about", "/news"];
      const isPublicPage = publicPages.some(
        (page) =>
          window.location.pathname === page ||
          window.location.pathname.startsWith(page + "/")
      );

      // 如果是公开页面或获取用户信息接口，不跳转登录
      if (
        response.request.responseURL.includes("user/current") ||
        window.location.pathname.includes("/user/login") ||
        window.location.pathname.includes("/user/register") ||
        window.location.pathname.includes("/user/reset-password") ||
        isPublicPage
      ) {
        // 静默处理，不跳转
        return response;
      }

      // 只有在需要登录的页面才跳转
      window.location.href = `/user/login?redirect=${window.location.href}`;
    }
    // 常见错误码本地化提示
    if (data.code && data.code !== 0) {
      // 40100未登录错误在公开页面不显示
      if (data.code === 40100) {
        const publicPages = ["/", "/shop", "/notice", "/about", "/news"];
        const isPublicPage = publicPages.some(
          (page) =>
            window.location.pathname === page ||
            window.location.pathname.startsWith(page + "/")
        );

        if (
          isPublicPage ||
          response.request.responseURL.includes("user/current")
        ) {
          // 在公开页面或获取用户信息时，静默处理未登录错误
          return response;
        }
      }

      let msg = data.description || data.message || "操作失败";
      if (msg.includes("锁定") || msg.includes("请10分钟后再试")) {
        msg = "账号已锁定，请10分钟后再试";
      } else if (msg.includes("验证码错误")) {
        msg = "验证码错误，请检查后重新输入";
      } else if (msg.includes("邮箱已存在")) {
        msg = "该邮箱已被注册";
      } else if (msg.includes("用户名已存在")) {
        msg = "该用户名已被占用";
      } else if (msg.includes("密码错误")) {
        msg = "密码错误，请重试";
      } else if (msg.includes("用户不存在")) {
        msg = "用户不存在";
      }
      // 只要不是成功，自动弹出错误提示
      window.$message?.error(msg);
    }
    return response;
  },
  function (error) {
    // 任何状态码超出2xx范围的都会触发这个函数
    // 处理响应错误
    return Promise.reject(error);
  }
);

export default myAxios;
