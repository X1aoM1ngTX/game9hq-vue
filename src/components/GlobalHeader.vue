<template>
  <div v-if="!isAuthPage" class="GlobalHeader">
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-logo">
          <img
            alt="Game9"
            class="logo-icon"
            src="../assets/GAME9/game9-blue.png"
          />
          <span class="logo-text">Game9</span>
        </div>

        <!-- 桌面端导航 -->
        <div class="nav-center">
          <div class="nav-links">
            <router-link to="/" class="nav-link">首页</router-link>
            <router-link to="/shop" class="nav-link">商城</router-link>
            <router-link to="/news" class="nav-link">社区</router-link>
            <router-link to="/notice" class="nav-link">公告</router-link>
          </div>
        </div>

        <!-- 桌面端用户操作 -->
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
                  <a-menu-item key="chat" @click="toChat">
                    <template #icon>
                      <MessageOutlined />
                    </template>
                    消息
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

        <!-- 移动端菜单按钮 -->
        <div class="mobile-menu-btn" @click="toggleMobileMenu">
          <div class="hamburger" :class="{ active: mobileMenuOpen }">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <!-- 移动端导航菜单 -->
      <div class="mobile-menu" :class="{ active: mobileMenuOpen }">
        <div class="mobile-menu-content">
          <!-- 移动端导航链接 -->
          <div class="mobile-nav-links">
            <router-link
              to="/"
              class="mobile-nav-link"
              @click="closeMobileMenu"
            >
              <HomeOutlined />
              <span>首页</span>
            </router-link>
            <router-link
              to="/shop"
              class="mobile-nav-link"
              @click="closeMobileMenu"
            >
              <ShoppingOutlined />
              <span>商城</span>
            </router-link>
            <router-link
              to="/news"
              class="mobile-nav-link"
              @click="closeMobileMenu"
            >
              <MessageOutlined />
              <span>社区</span>
            </router-link>
            <router-link
              to="/notice"
              class="mobile-nav-link"
              @click="closeMobileMenu"
            >
              <BellOutlined />
              <span>公告</span>
            </router-link>
          </div>

          <!-- 移动端用户操作 -->
          <div class="mobile-user-section">
            <template v-if="loginUserStore.hasLogin">
              <div class="mobile-user-info">
                <a-avatar
                  :size="40"
                  :src="loginUserStore.loginUser?.userAvatar"
                  class="mobile-user-avatar"
                >
                  {{
                    loginUserStore.loginUser?.userNickname?.charAt(0) ||
                    loginUserStore.loginUser?.userName?.charAt(0)
                  }}
                </a-avatar>
                <div class="mobile-user-details">
                  <div class="mobile-user-name">
                    {{
                      loginUserStore.loginUser?.userNickname ||
                      loginUserStore.loginUser?.userName
                    }}
                  </div>
                  <div class="mobile-user-status">在线</div>
                </div>
              </div>

              <div class="mobile-user-menu">
                <div
                  class="mobile-menu-item"
                  @click="handleMobileMenuClick(toUserProfile)"
                >
                  <UserOutlined />
                  <span>我的主页</span>
                </div>
                <div
                  class="mobile-menu-item"
                  @click="handleMobileMenuClick(toFirends)"
                >
                  <TeamOutlined />
                  <span>我的好友</span>
                </div>
                <div
                  class="mobile-menu-item"
                  @click="handleMobileMenuClick(toChat)"
                >
                  <MessageOutlined />
                  <span>消息</span>
                </div>
                <div
                  class="mobile-menu-item"
                  @click="handleMobileMenuClick(toWishlist)"
                >
                  <HeartOutlined />
                  <span>我的愿望单</span>
                </div>
                <div
                  v-if="loginUserStore.loginUser?.userIsAdmin === 1"
                  class="mobile-menu-item"
                  @click="handleMobileMenuClick(toAdmin)"
                >
                  <SettingOutlined />
                  <span>管理中心</span>
                </div>
                <div
                  class="mobile-menu-item logout"
                  @click="handleMobileMenuClick(handleLogout)"
                >
                  <LogoutOutlined />
                  <span>退出登录</span>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="mobile-auth-buttons">
                <a-button
                  type="default"
                  class="mobile-login-btn"
                  @click="handleMobileMenuClick(toLogin)"
                >
                  登录
                </a-button>
                <a-button
                  type="primary"
                  class="mobile-register-btn"
                  @click="handleMobileMenuClick(toRegister)"
                >
                  注册
                </a-button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- 移动端遮罩层 -->
    <div
      v-if="mobileMenuOpen"
      class="mobile-menu-overlay"
      @click="closeMobileMenu"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import {
  DownOutlined,
  LogoutOutlined,
  UserOutlined,
  HeartOutlined,
  SettingOutlined,
  HomeOutlined,
  ShoppingOutlined,
  MessageOutlined,
  BellOutlined,
  TeamOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { useRoute, useRouter } from "vue-router";
import { useLoginUserStore } from "@/stores/useLoginUserStore";
import { userLogout } from "@/api/user";

const loginUserStore = useLoginUserStore();
const router = useRouter();
const route = useRoute();

// 移动端菜单状态
const mobileMenuOpen = ref(false);

// 切换移动端菜单
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
  // 防止背景滚动
  if (mobileMenuOpen.value) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
};

// 关闭移动端菜单
const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
  document.body.style.overflow = "";
};

// 处理移动端菜单项点击
const handleMobileMenuClick = (callback: () => void) => {
  closeMobileMenu();
  // 延迟执行回调，确保菜单关闭动画完成
  setTimeout(() => {
    callback();
  }, 300);
};

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

const toChat = () => {
  router.push("/chat");
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

// 监听路由变化，关闭移动端菜单
router.beforeEach(() => {
  closeMobileMenu();
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

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  cursor: pointer;
  padding: 8px;
  z-index: 1001;
}

.hamburger {
  width: 24px;
  height: 18px;
  position: relative;
  transform: rotate(0deg);
  transition: 0.5s ease-in-out;
}

.hamburger span {
  display: block;
  position: absolute;
  height: 2px;
  width: 100%;
  background: #000;
  border-radius: 9px;
  opacity: 1;
  left: 0;
  transform: rotate(0deg);
  transition: 0.25s ease-in-out;
}

.hamburger span:nth-child(1) {
  top: 0px;
}

.hamburger span:nth-child(2) {
  top: 8px;
}

.hamburger span:nth-child(3) {
  top: 16px;
}

.hamburger.active span:nth-child(1) {
  top: 8px;
  transform: rotate(135deg);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
  left: -60px;
}

.hamburger.active span:nth-child(3) {
  top: 8px;
  transform: rotate(-135deg);
}

/* 移动端导航菜单 */
.mobile-menu {
  position: fixed;
  top: 0;
  right: -100%;
  width: 280px;
  height: 100vh;
  background: #ffffff;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: right 0.3s ease-in-out;
  overflow-y: auto;
}

.mobile-menu.active {
  right: 0;
}

.mobile-menu-content {
  padding: 80px 20px 20px;
}

.mobile-nav-links {
  margin-bottom: 32px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.mobile-nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 12px;
  border-radius: 8px;
  text-decoration: none;
  color: #262626;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
  min-height: 100px;
}

.mobile-nav-link:hover {
  background: #f5f5f5;
  color: #1890ff;
}

.mobile-nav-link.router-link-active {
  background: #e6f7ff;
  color: #1890ff;
}

.mobile-nav-link .anticon {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

/* 移动端用户信息 */
.mobile-user-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 24px;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.mobile-user-avatar {
  flex-shrink: 0;
}

.mobile-user-details {
  flex: 1;
  min-width: 0;
}

.mobile-user-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-user-status {
  font-size: 12px;
  color: #52c41a;
  display: flex;
  align-items: center;
  gap: 4px;
}

.mobile-user-status::before {
  content: "";
  width: 6px;
  height: 6px;
  background: #52c41a;
  border-radius: 50%;
}

/* 移动端用户菜单 */
.mobile-user-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #595959;
  transition: all 0.2s;
}

.mobile-menu-item:hover {
  background: #f5f5f5;
  color: #262626;
}

.mobile-menu-item .anticon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.mobile-menu-item.logout {
  color: #ff4d4f;
}

.mobile-menu-item.logout:hover {
  background: #fff2f0;
  color: #ff4d4f;
}

/* 移动端认证按钮 */
.mobile-auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-login-btn,
.mobile-register-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  border-radius: 8px;
}

.mobile-login-btn {
  border: 1px solid #d9d9d9;
  color: #262626;
}

.mobile-register-btn {
  background: linear-gradient(to right, #4facfe, #00f2fe);
  border: none;
  color: white;
}

/* 移动端遮罩层 */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .nav-center {
    display: none;
  }

  .nav-actions {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .nav-container {
    padding: 0 16px;
    height: 56px;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
  }

  .logo-text {
    font-size: 18px;
  }
}

@media screen and (max-width: 480px) {
  .nav-container {
    padding: 0 12px;
  }

  .logo-text {
    font-size: 16px;
  }

  .mobile-menu {
    width: 100%;
    right: -100%;
  }

  .mobile-menu-content {
    padding: 80px 16px 16px;
  }

  .mobile-nav-link {
    padding: 14px 16px;
    font-size: 15px;
  }

  .mobile-menu-item {
    padding: 10px 14px;
    font-size: 13px;
  }
}

/* 移动端横屏优化 */
@media screen and (max-width: 768px) and (orientation: landscape) {
  .mobile-menu {
    width: 320px;
  }

  .mobile-menu-content {
    padding: 60px 20px 20px;
  }
}
</style>
