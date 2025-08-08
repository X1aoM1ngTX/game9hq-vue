import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useLoginUserStore } from "@/stores/useLoginUserStore";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: () => import("@/pages/HomePage.vue"),
  },
  {
    path: "/user",
    name: "userLayout",
    component: () => import("@/layouts/UserLayout.vue"),
    meta: {
      layout: "blank",
    },
    children: [
      {
        path: "login",
        name: "userLogin",
        component: () => import("@/pages/user/UserLoginPage.vue"),
        meta: {
          layout: "blank",
          title: "登录",
        },
      },
      {
        path: "register",
        name: "userRegister",
        component: () => import("@/pages/user/UserRegisterPage.vue"),
        meta: {
          layout: "blank",
          title: "注册",
        },
      },
      {
        path: "reset-password",
        name: "userResetPassword",
        component: () => import("@/pages/user/ResetPasswordPage.vue"),
        meta: {
          layout: "blank",
          title: "重置密码",
        },
      },
    ],
  },
  {
    path: "/admin/userManage",
    name: "adminUserManage",
    component: () => import("@/pages/admin/UserManagePage.vue"),
  },
  {
    path: "/admin/gameManage",
    name: "adminGameManage",
    component: () => import("@/pages/admin/GamesManagePage.vue"),
  },
  {
    path: "/admin/noticeManage",
    name: "adminNoticeManage",
    component: () => import("@/pages/admin/NoticeManagePage.vue"),
  },
  {
    path: "/shop",
    name: "shop",
    component: () => import("@/pages/shop/ShopPage.vue"),
  },
  {
    path: "/notice",
    name: "notice",
    component: () => import("@/pages/NoticePage.vue"),
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
  {
    path: "/user/profile/:userId",
    name: "UserProfileByIdPage",
    component: () => import("@/pages/UserProfilePage.vue"),
  },
  {
    path: "/about",
    name: "AboutPage",
    component: () => import("@/pages/AboutPage.vue"),
    meta: {
      title: "关于",
    },
  },
  {
    path: "/news",
    name: "NewsPage",
    component: () => import("@/pages/news/NewsPage.vue"),
  },
  {
    path: "/news/edit",
    name: "EditNewsPage",
    component: () => import("@/pages/news/NewsEditPage.vue"),
  },
  {
    path: "/news/edit/:newsId",
    name: "EditNewsById",
    component: () => import("@/pages/news/NewsEditPage.vue"),
  },
  {
    path: "/news/detail/:newsId",
    name: "NewsDetail",
    component: () => import("@/pages/news/NewsDetailPage.vue"),
  },
  {
    path: "/friends",
    name: "FriendsPage",
    component: () => import("@/pages/friends/FriendsPage.vue"),
  },
  {
    path: "/wishlist",
    name: "WishlistPage",
    component: () => import("@/pages/WishlistPage.vue"),
    meta: {
      title: "愿望单",
    },
  },
  {
    path: "/403",
    name: "Exception403",
    component: () => import("@/pages/exception/403.vue"),
    meta: {
      title: "403",
    },
  },
  {
    path: "/404",
    name: "Exception404",
    component: () => import("@/pages/exception/404.vue"),
    meta: {
      title: "404",
    },
  },
  {
    path: "/500",
    name: "Exception500",
    component: () => import("@/pages/exception/500.vue"),
    meta: {
      title: "500",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
  },
  {
    path: "/test",
    name: "TestPage",
    component: () => import("@/pages/TestPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const loginUserStore = useLoginUserStore();

  // 检查是否需要管理员权限
  if (to.path.startsWith("/admin")) {
    // 如果用户不是管理员，重定向到403页面
    if (!loginUserStore.loginUser?.userIsAdmin) {
      next("/403");
      return;
    }
  }

  next();
});

export default router;
