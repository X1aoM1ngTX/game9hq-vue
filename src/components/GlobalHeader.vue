<template>
  <div v-if="!isAuthPage" class="GlobalHeader">
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-logo">
          <img
            alt="Game9"
            class="logo-icon"
            src="../assets/GAME9/game9-green.png"
          />
          <span class="logo-text">Game9</span>
        </div>
        <div class="nav-center">
          <div class="nav-links">
            <router-link to="/" class="nav-link">首页</router-link>
            <router-link to="/shop" class="nav-link">商城</router-link>
            <router-link to="/news" class="nav-link">社区</router-link>
            <router-link to="/notice" class="nav-link">公告</router-link>
            <router-link
              v-if="
                loginUserStore.hasLogin &&
                loginUserStore.loginUser?.userIsAdmin === 1
              "
              to="/admin"
              class="nav-link"
            >
              管理
            </router-link>
          </div>
        </div>
        <div class="nav-actions">
          <template v-if="loginUserStore.hasLogin">
            <a-dropdown>
              <a class="user-link">
                <a-avatar
                  :size="32"
                  :src="loginUserStore.loginUser?.userAvatar"
                  class="user-avatar"
                >
                  {{
                    loginUserStore.loginUser?.userNickname?.charAt(0) ||
                    loginUserStore.loginUser?.userName?.charAt(0)
                  }}
                </a-avatar>
                <span class="username">
                  {{
                    loginUserStore.loginUser?.userNickname ||
                    loginUserStore.loginUser?.userName
                  }}
                </span>
                <down-outlined />
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="profile" @click="toUserProfile">
                    <template #icon>
                      <UserOutlined />
                    </template>
                    我的主页
                  </a-menu-item>
                  <a-menu-item key="friends" @click="toFirends">
                    <template #icon>
                      <UserOutlined />
                    </template>
                    我的好友
                  </a-menu-item>
                  <a-menu-item key="wishlist" @click="toWishlist">
                    <template #icon>
                      <HeartOutlined />
                    </template>
                    我的愿望单
                  </a-menu-item>
                  <a-menu-divider
                    v-if="loginUserStore.loginUser?.userIsAdmin === 1"
                  />
                  <a-menu-item
                    v-if="loginUserStore.loginUser?.userIsAdmin === 1"
                    key="admin"
                    @click="toAdmin"
                  >
                    <template #icon>
                      <SettingOutlined />
                    </template>
                    管理中心
                  </a-menu-item>
                  <a-menu-item key="logout" @click="handleLogout">
                    <template #icon>
                      <LogoutOutlined />
                    </template>
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
          <template v-else>
            <a-button type="text" class="nav-login" @click="toLogin">
              登录
            </a-button>
            <a-button type="primary" class="nav-cta" @click="toRegister">
              注册
            </a-button>
          </template>
        </div>
      </div>
    </nav>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import {
  DownOutlined,
  LogoutOutlined,
  UserOutlined,
  HeartOutlined,
  SettingOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { useRoute, useRouter } from "vue-router";
import { useLoginUserStore } from "@/stores/useLoginUserStore";
import { userLogout } from "@/api/user";

const loginUserStore = useLoginUserStore();
const router = useRouter();
const route = useRoute();

const toLogin = () => {
  router.push("/user/login");
};

const toRegister = () => {
  router.push("/user/register");
};

const toUserProfile = () => {
  router.push("/user/profile");
};

const toFirends = () => {
  router.push("/friends");
};

const toWishlist = () => {
  router.push("/wishlist");
};

const toAdmin = () => {
  router.push("/admin");
};

const handleLogout = async () => {
  try {
    const res = await userLogout();
    if (res.data.code === 0) {
      message.success("退出成功");
      // 清除用户状态
      loginUserStore.loginUser = null;
      loginUserStore.hasLogin = false;
      // 跳转到首页
      router.push("/");
    }
  } catch (error) {
    message.error("退出失败");
  }
};

const isAuthPage = computed(() => {
  return route.meta.layout === "blank";
});
</script>

<style scoped>
.GlobalHeader {
  width: 100%;
}

/* 导航栏样式 */
.navbar {
  position: relative;
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 0 20px;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  position: relative;
}

.nav-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #000000;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: rgba(0, 0, 0, 0.7);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #000000;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-login {
  color: rgba(0, 0, 0, 0.7);
  font-size: 14px;
}

.nav-cta {
  background: linear-gradient(135deg, #00d4ff, #0099ff);
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
}

.user-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(0, 0, 0, 0.85);
  padding: 0 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.user-link:hover {
  color: #000000;
}

.user-avatar {
  background: #2d2d2d;
  color: white;
}

.username {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.ant-dropdown-menu-item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.ant-dropdown-menu-item .anticon) {
  font-size: 16px;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .nav-container {
    padding: 0 16px;
  }

  .nav-center {
    display: none;
  }
}
</style>
