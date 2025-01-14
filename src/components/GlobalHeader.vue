<template>
  <div class="GlobalHeader" v-if="!isAuthPage">
    <a-row :wrap="false">
      <a-col flex="140px">
        <div class="title-bar">
          <img class="logo" src="../assets/XM_1024.png" alt="logo" />
          <div class="title">千夜の詩</div>
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
          <template v-if="loginUserStore.loginUser?.userId">
            <a-dropdown>
              <a class="user-link">
                {{ loginUserStore.loginUser.userName }}
                <down-outlined />
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="profile">个人资料</a-menu-item>
                  <a-menu-item key="logout" @click="doLogout"
                    >退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
          <template v-else>
            <a-button type="primary" @click="goToLogin">登录</a-button>
          </template>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, ref } from "vue";
import {
  AppstoreOutlined,
  DownOutlined,
  MailOutlined,
  SettingOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { useRoute, useRouter } from "vue-router";
import { useLoginUserStore } from "@/store/useLoginUserStore";

const loginUserStore = useLoginUserStore();

const router = useRouter();
const route = useRoute();

const goToLogin = () => {
  router.push("/user/login");
};

const doLogout = () => {
  loginUserStore.logout();
  message.success("退出成功");
  router.push("/user/login");
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

const menuItems = computed(() => {
  const items = [
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
  return route.path === "/user/login" || route.path === "/user/register";
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
  color: #2c3e50;
  font-size: 16px;
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
  color: rgba(0, 0, 0, 0.85);
  padding: 0 12px;
  cursor: pointer;
}

.user-link:hover {
  color: #1890ff;
}
</style>
