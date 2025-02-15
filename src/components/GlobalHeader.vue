<template>
  <div class="GlobalHeader" v-if="!isAuthPage">
    <a-row :wrap="false">
      <a-col flex="160px">
        <div class="title-bar">
          <img class="logo" src="../assets/GameHub_500px.png" alt="logo" />
          <div class="title">GameHub</div>
        </div>
      </a-col>
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="menuItems"
          @click="doMenuClick"
        />
      </a-col>
      <a-col flex="200px">
        <div class="user-area">
          <template v-if="loginUserStore.hasLogin">
            <a-dropdown>
              <a class="user-link">
                <a-avatar
                  :size="32"
                  :src="loginUserStore.loginUser?.userAvatar"
                  class="user-avatar"
                >
                  {{ loginUserStore.loginUser?.userName?.charAt(0) }}
                </a-avatar>
                <span class="username">{{
                  loginUserStore.loginUser?.userName
                }}</span>
                <down-outlined />
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="profile" @click="toUserProfile">
                    <template #icon>
                      <UserOutlined />
                    </template>
                    个人资料
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
            <a-button
              type="primary"
              style="margin-right: 10px"
              @click="toLogin"
            >
              登录</a-button
            >
            <a-button @click="toRegister">注册</a-button>
          </template>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, ref, VNodeChild } from "vue";
import {
  AppstoreOutlined,
  DownOutlined,
  MailOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { useRoute, useRouter } from "vue-router";
import { useLoginUserStore } from "@/store/useLoginUserStore";
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

const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  });
};

const current = ref<string[]>([route.path]);
router.afterEach((to) => {
  current.value = [to.path];
});

interface MenuItem {
  key: string;
  icon?: () => VNodeChild;
  label: string;
  children?: MenuItem[];
}

const menuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [
    {
      key: "/",
      icon: () => h(MailOutlined),
      label: "首页",
    },
    {
      key: "/shop",
      icon: () => h(AppstoreOutlined),
      label: "商城",
    },
  ];

  if (loginUserStore.loginUser?.userIsAdmin === 1) {
    items.push({
      key: "/admin",
      icon: () => h(SettingOutlined),
      label: "管理",
      children: [
        {
          key: "/admin/userManage",
          label: "用户管理",
        },
        {
          key: "/admin/games",
          label: "游戏管理",
        },
      ],
    });
  }

  return items;
});

const isAuthPage = computed(() => {
  return route.meta.layout === "blank";
});
</script>

<style scoped>
.title-bar {
  display: flex;
  text-align: center;
  align-items: center;
  height: 100%;
}

.title {
  color: #6cb4ff;
  font-size: 24px;
  font-weight: bolder;
  margin-left: 10px;
}

.logo {
  height: 30px;
}

.user-area {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 24px;
  height: 100%;
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
  color: #1890ff;
}

.user-avatar {
  background: #1890ff;
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
</style>
