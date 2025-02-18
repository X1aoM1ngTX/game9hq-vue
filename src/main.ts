import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import "@/access";
import "@/assets/global.css";
import VueLazyload from "vue-lazyload";
import { ConfigProvider } from "ant-design-vue";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(Antd);
app.use(ConfigProvider);
app.use(VueLazyload, {
  preLoad: 1, // 预加载高度比例
  error: require("@/assets/error.png"), // 加载失败时的占位图
  loading: require("@/assets/loading.gif"), // 加载中的占位图
  attempt: 3, // 尝试加载次数
});

app.mount("#app");
