import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import Antd, { message, notification, Modal } from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import "@/access";
import "@/assets/global.css";
import VueLazyload from "vue-lazyload";

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.use(Antd);

// 在 window 上注册，方便在非 Vue 组件中使用
declare global {
  interface Window {
    $message: typeof message;
    $notification: typeof notification;
    $Modal: typeof Modal;
  }
}

window.$message = message;
window.$notification = notification;
window.$Modal = Modal;

app.use(VueLazyload, {
  preLoad: 1, // 预加载高度比例
  error: require("@/assets/error.png"), // 加载失败时的占位图
  loading: require("@/assets/loading.gif"), // 加载中的占位图
  attempt: 3, // 尝试加载次数
});

app.mount("#app");
