import axios from "axios";

const myAxios = axios.create({
  baseURL: "http://localhost:8080",
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
    return response;
  },
  function (error) {
    // 任何状态码超出2xx范围的都会触发这个函数
    // 处理响应错误
    return Promise.reject(error);
  }
);

export default myAxios;
