import axios from "axios";
import { message } from "ant-design-vue";

console.log("当前环境:", process.env.VUE_APP_ENV);
console.log("API地址:", process.env.VUE_APP_BASE_API);

const myAxios = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: process.env.VUE_APP_ENV === "production" ? 15000 : 10000,
  withCredentials: true,
});

// 请求拦截器
myAxios.interceptors.request.use(
  (config) => {
    // 生产环境可能需要添加额外的安全头
    if (process.env.VUE_APP_ENV === "production") {
      config.headers["X-Environment"] = "production";
    }
    return config;
  },
  (error) => {
    message.error("请求发送失败");
    return Promise.reject(error);
  }
);

// 响应拦截器
myAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          message.error("请求的接口不存在");
          break;
        case 500:
          message.error("服务器错误");
          break;
        default:
          message.error(error.response.data?.message || "请求失败");
      }
    } else {
      message.error("网络错误，请检查网络连接");
    }
    return Promise.reject(error);
  }
);

export default myAxios;
