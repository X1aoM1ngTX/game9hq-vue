import axios from "axios";
import { message } from "ant-design-vue";

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
    console.log(response);

    const { data } = response;
    console.log(data);
    // 未登录
    if (data.code === 40100) {
      // 不是获取用户信息接口，或者不是登录页面，则跳转到登录页面
      if (
        !response.request.responseURL.includes("user/current") &&
        !window.location.pathname.includes("/user/login")
      ) {
        window.location.href = `/user/login?redirect=${window.location.href}`;
      }
    }
    // 常见错误码本地化提示
    if (data.code && data.code !== 0) {
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
      message.error(msg);
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
