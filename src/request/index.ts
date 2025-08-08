import axios from "axios";
import { message } from "ant-design-vue";

const myAxios = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || "http://localhost:8080",
  timeout: 10000,
  withCredentials: true,
});

// 请求拦截器
myAxios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    message.error("请求发送失败");
    return Promise.reject(error);
  },
);

// 响应拦截器
myAxios.interceptors.response.use(
  (response) => {
    return response.data;
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
  },
);

export default myAxios;
