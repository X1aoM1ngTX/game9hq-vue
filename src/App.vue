<template>
  <div :class="themeClass" @contextmenu.prevent="handleContextMenu">
    <a-config-provider :theme="themeConfig">
      <component :is="layout">
        <router-view />
      </component>
    </a-config-provider>

    <!-- 通用右键菜单 -->
    <div
      v-show="showContextMenu && menuType === 'default'"
      class="custom-context-menu"
      :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
    >
      <ul class="context-menu-list">
        <li @click="handleRefresh"><reload-outlined /> 刷新页面</li>
        <li @click="handleGoBack"><left-outlined /> 返回上一页</li>
        <li @click="handleGoForward"><right-outlined /> 前进下一页</li>
        <li @click="handleToggleTheme"><bulb-outlined /> 切换主题</li>
        <li @click="handleGoHome"><home-outlined /> 返回首页</li>
      </ul>
    </div>

    <!-- 图片右键菜单 -->
    <div
      v-show="showContextMenu && menuType === 'image'"
      class="custom-context-menu"
      :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
    >
      <ul class="context-menu-list">
        <li @click="handleSaveImage"><download-outlined /> 保存图片</li>
      </ul>
    </div>

    <!-- 文本右键菜单 -->
    <div
      v-show="showContextMenu && menuType === 'text'"
      class="custom-context-menu"
      :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
    >
      <ul class="context-menu-list">
        <li @click="handleCopyText"><copy-outlined /> 复制文本</li>
        <li @click="handleSearchText"><search-outlined /> 搜索文本</li>
      </ul>
    </div>

    <!-- 用户游戏库图片右键菜单 -->
    <div
      v-show="showContextMenu && menuType === 'userGameImage'"
      class="custom-context-menu"
      :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
    >
      <ul class="context-menu-list">
        <li @click="handleRemoveGame"><delete-outlined /> 移除游戏</li>
        <li @click="handleSaveImage"><download-outlined /> 下载图片</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import BasicLayout from "@/layouts/BasicLayout.vue";
import BlankLayout from "@/layouts/BlankLayout.vue";
import { useLoginUserStore } from "@/stores/useLoginUserStore";
import {
  ReloadOutlined,
  LeftOutlined,
  RightOutlined,
  BulbOutlined,
  HomeOutlined,
  DownloadOutlined,
  SearchOutlined,
  DeleteOutlined,
  CopyOutlined,
} from "@ant-design/icons-vue";
import { message, Modal } from "ant-design-vue";

const route = useRoute();
const layout = computed(() => {
  return route.meta.layout === "blank" ? BlankLayout : BasicLayout;
});

const loginUserStore = useLoginUserStore();

// 页面加载时获取用户信息
onMounted(() => {
  loginUserStore.getLoginUser();
  document.addEventListener("contextmenu", handleContextMenu);
  document.addEventListener("click", handleClickOutside);
});

const isDarkMode = ref(false);

const themeClass = computed(() =>
  isDarkMode.value ? "dark-mode" : "light-mode"
);

const themeConfig = computed(() => ({
  token: {
    colorPrimary: isDarkMode.value ? "#1f1f1f" : "#000000",
  },
}));

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
};

const router = useRouter();
const showContextMenu = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const menuType = ref<"default" | "image" | "text" | "userGameImage">("default");
const selectedElement = ref<HTMLElement | null>(null);
const selectedText = ref("");

// 处理右键点击事件
const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  const target = e.target as HTMLElement;

  // 获取点击位置
  contextMenuX.value = e.clientX;
  contextMenuY.value = e.clientY;

  // 获取选中的文本
  const currentSelectedText = window.getSelection()?.toString().trim();

  // 检查是否是用户游戏库中的图片
  if (target.tagName === "IMG" && target.closest(".games-list")) {
    menuType.value = "userGameImage";
    selectedElement.value = target as HTMLElement;
  } else if (target.tagName === "IMG") {
    menuType.value = "image";
    selectedElement.value = target as HTMLElement;
  } else if (currentSelectedText) {
    menuType.value = "text";
    selectedElement.value = target;
    selectedText.value = currentSelectedText;
  } else {
    menuType.value = "default";
    selectedElement.value = null;
    selectedText.value = "";
  }

  showContextMenu.value = true;
};

// 处理点击其他区域关闭菜单
const handleClickOutside = () => {
  showContextMenu.value = false;
};

// 菜单项点击处理函数
const handleRefresh = () => {
  window.location.reload();
  showContextMenu.value = false;
};

const handleGoBack = () => {
  router.back();
  showContextMenu.value = false;
};

const handleGoForward = () => {
  router.forward();
  showContextMenu.value = false;
};

const handleToggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  showContextMenu.value = false;
};

const handleGoHome = () => {
  router.push("/");
  showContextMenu.value = false;
};

// 图片相关操作
const handleSaveImage = () => {
  if (selectedElement.value?.tagName === "IMG") {
    const img = selectedElement.value as HTMLImageElement;
    window.open(img.src, "_blank");
  }
  showContextMenu.value = false;
};

// 文本相关操作
const handleCopyText = () => {
  if (selectedText.value) {
    navigator.clipboard
      .writeText(selectedText.value)
      .then(() => message.success("文本已复制"))
      .catch(() => message.error("复制失败"));
  }
  showContextMenu.value = false;
};

const handleSearchText = () => {
  showContextMenu.value = false;

  if (selectedText.value) {
    window.open(
      `https://www.bing.com/search?q=${encodeURIComponent(selectedText.value)}`,
      "_blank"
    );
  } else {
    message.warning("请先选择要搜索的文本");
  }
};

// 添加移除游戏的处理函数
const handleRemoveGame = () => {
  if (!selectedElement.value) return;

  const gameItem = selectedElement.value.closest(".game-item");
  if (!gameItem) return;

  const gameId = gameItem.getAttribute("data-game-id");
  if (!gameId) return;

  Modal.confirm({
    title: "确认移除",
    content: "确定要从游戏库中移除这个游戏吗？",
    okText: "确认",
    cancelText: "取消",
    onOk: () => {
      // 触发自定义事件，让 UserProfilePage 处理移除逻辑
      const event = new CustomEvent("removeGame", {
        detail: { gameId: parseInt(gameId) },
      });
      document.dispatchEvent(event);
    },
  });

  showContextMenu.value = false;
};

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener("contextmenu", handleContextMenu);
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style>
#app {
  height: 100vh;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.light-mode {
  --background-color: #ffffff;
  --text-color: #000000;
}

.dark-mode {
  --background-color: #1f1f1f;
  --text-color: #ffffff;
}

body {
  background-color: var(--background-color);
  color: var(--text-color);
}

/* 在全局样式中定义 */
:root {
  --dropdown-bg-color: #ffffff;
  --dropdown-text-color: #000000;
}

.dark-mode {
  --dropdown-bg-color: #333333;
  --dropdown-text-color: #ffffff;
}

.light-mode {
  --dropdown-bg-color: #ffffff;
  --dropdown-text-color: #000000;
}

/* 在组件样式中应用 */
:deep(.ant-dropdown-menu) {
  background-color: var(--dropdown-bg-color);
  color: var(--dropdown-text-color);
}

:deep(.ant-dropdown-menu-item) {
  color: var(--dropdown-text-color);
}

:deep(.ant-dropdown-menu-item:hover) {
  background-color: var(--dropdown-bg-color);
  color: var(--dropdown-text-color);
}

.custom-context-menu {
  position: fixed;
  background: var(--dropdown-bg-color);
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
  padding: 4px 0;
  z-index: 1000;
  min-width: 160px;
}

.context-menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.context-menu-list li {
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--dropdown-text-color);
  transition: all 0.3s;
}

.context-menu-list li:hover {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

/* 图标样式 */
.context-menu-list .anticon {
  font-size: 16px;
}

/* 暗色主题适配 */
.dark-mode .custom-context-menu {
  background: #1f1f1f;
  border-color: #434343;
}

.dark-mode .context-menu-list li:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* 为不同类型的菜单添加特殊样式 */
.custom-context-menu[data-type="image"] {
  /* 图片菜单特殊样式 */
}

.custom-context-menu[data-type="text"] {
  /* 文本菜单特殊样式 */
}
</style>
