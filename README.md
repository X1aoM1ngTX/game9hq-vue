# Game9 / GameHub 前端项目

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/X1aoM1ngTX/game9hq-vue)
[![Vue](https://img.shields.io/badge/Vue-3.2.13-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Ant Design Vue](https://img.shields.io/badge/Ant%20Design%20Vue-4.2.6-1890FF?style=flat-square&logo=antdesign&logoColor=white)](https://antdv.com/)
[![Pinia](https://img.shields.io/badge/Pinia-2.3.0-FDD835?style=flat-square&logo=pinia&logoColor=white)](https://pinia.vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js->=14.0.0-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](https://opensource.org/licenses/MIT)

## 项目介绍

Game9 是一个游戏分发平台的前端项目，基于 Vue 3 + TypeScript + Ant Design Vue 构建。该平台提供游戏管理、用户注册登录、游戏购买、社交功能和内容管理等特性。

## 技术栈

- **前端框架**: Vue 3.2.13
- **开发语言**: TypeScript 4.5.5
- **UI 组件库**: Ant Design Vue 4.2.6
- **状态管理**: Pinia 2.3.0 + 持久化插件
- **路由管理**: Vue Router 4.0.3
- **HTTP 客户端**: Axios 1.7.9
- **构建工具**: Vue CLI 5.0
- **代码规范**: ESLint + Prettier
- **其他工具**:
  - ECharts 5.6.0 (图表)
  - Cherry Markdown 0.9.1 (Markdown 编辑器)
  - Vue Lazyload 3.0.0 (图片懒加载)

## 项目结构

```
xmgame-vue/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API 接口定义
│   ├── assets/            # 静态资源
│   ├── components/        # 公共组件
│   ├── layouts/           # 布局组件
│   ├── pages/             # 页面组件
│   ├── router/            # 路由配置
│   ├── stores/            # Pinia 状态管理
│   ├── types/             # TypeScript 类型定义
│   ├── App.vue            # 根组件
│   ├── main.ts            # 入口文件
│   └── request.ts         # 请求配置
├── dist/                  # 构建输出
└── 配置文件
```

## 核心功能模块

### 1. 用户系统

- 用户注册/登录
- 个人资料管理
- 密码重置
- 用户权限管理

### 2. 游戏商店

- 游戏列表展示
- 游戏详情页
- 游戏搜索和筛选
- 游戏购买流程

### 3. 社交功能

- 好友系统
- 用户个人空间
- 在线状态显示

### 4. 内容管理

- 新闻资讯
- 公告管理
- Markdown 编辑器

### 5. 用户中心

- 游戏库管理
- 愿望单功能
- 签到日历

### 6. 管理后台

- 用户管理
- 游戏管理
- 公告管理

## 开发环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run serve
```

项目将在 `http://localhost:3000` 启动

### 3. 构建生产版本

```bash
npm run build
```

### 4. 代码检查

```bash
npm run lint
```

## 项目配置

### 环境配置

项目使用 Vue CLI 配置，主要配置文件：

- `vue.config.js` - Vue 项目配置
- `tsconfig.json` - TypeScript 配置
- `babel.config.js` - Babel 配置

### 路由配置

- 使用 Vue Router 4
- 支持路由懒加载
- 包含路由守卫，用于权限控制
- 管理员页面需要管理员权限才能访问

### 状态管理

- 使用 Pinia 进行状态管理
- 配置了持久化插件，支持状态持久化
- 主要 Store：
  - `useLoginUserStore` - 用户登录状态
  - `userLibraryStore` - 用户游戏库

### API 请求

- 基于 Axios 封装
- 统一的请求/响应拦截器
- 错误处理机制
- 支持请求取消

## 页面路由

| 路径             | 页面     | 说明           |
| ---------------- | -------- | -------------- |
| `/`              | 首页     | 平台主页       |
| `/user/login`    | 登录页   | 用户登录       |
| `/user/register` | 注册页   | 用户注册       |
| `/shop`          | 游戏商店 | 游戏列表       |
| `/game/:gameId`  | 游戏详情 | 游戏详情页     |
| `/news`          | 新闻列表 | 资讯新闻       |
| `/friends`       | 好友页面 | 好友管理       |
| `/wishlist`      | 愿望单   | 用户愿望单     |
| `/admin/*`       | 管理后台 | 需要管理员权限 |

## 开发规范

### 代码风格

- 使用 ESLint + Prettier 进行代码格式化
- 遵循 TypeScript 严格模式
- 组件名使用 PascalCase
- 文件名使用 kebab-case

### 组件规范

- 单文件组件 (.vue)
- 使用 Composition API
- Props 定义类型
- 事件命名使用 kebab-case

### API 规范

- 统一使用 BaseResponse 包装
- 错误码标准化
- 请求参数使用 TypeScript 接口定义

## 部署说明

### 生产环境构建

```bash
npm run build
```

构建后的文件位于 `dist/` 目录，可以部署到任何静态文件服务器。

### 环境变量

项目支持通过环境变量配置不同环境的参数。

## 常见问题

### 1. 端口冲突

如果 3000 端口被占用，可以修改 `package.json` 中的 serve 脚本。

### 2. 依赖问题

如果遇到依赖问题，可以尝试删除 `node_modules` 和 `package-lock.json`，然后重新安装。

### 3. TypeScript 错误

确保使用 VS Code 并安装 Volar 插件，以获得最佳的 TypeScript 支持。

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证。
