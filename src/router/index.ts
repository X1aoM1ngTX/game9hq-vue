import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: () => import("@/pages/HomePage.vue"),
  },
  {
    path: "/user/login",
    name: "userLogin",
    component: () => import("@/pages/user/UserLoginPage.vue"),
  },
  {
    path: "/user/register",
    name: "userRegister",
    component: () => import("@/pages/user/UserRegisterPage.vue"),
  },
  {
    path: "/user/forgot-password",
    name: "UserForgotPassword",
    component: () => import("@/pages/user/UserForgotPasswordPage.vue"),
    meta: {
      title: "找回密码",
    },
  },
  {
    path: "/admin/userManage",
    name: "adminUserManage",
    component: () => import("@/pages/admin/UserManagePage.vue"),
  },
  {
    path: "/admin/games",
    name: "adminGamesManage",
    component: () => import("@/pages/admin/GamesManagePage.vue"),
  },
  {
    path: "/shop",
    name: "shop",
    component: () => import("@/pages/shop/ShopPage.vue"),
  },
  {
    path: "/game/:gameId",
    name: "GameDetail",
    component: () => import("@/pages/shop/GameDetailVO.vue"),
  },
  {
    path: "/user/profile",
    name: "UserProfilePage",
    component: () => import("@/pages/UserProfilePage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
