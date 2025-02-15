/**
 * 从 `@vue/cli-service` 包中导入 `defineConfig` 函数。
 * 这个函数用于定义 Vue.js 项目的配置。
 */
const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: "warning",
});
