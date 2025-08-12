<template>
  <div class="shop-container">
    <div id="shopPage">
      <div class="header-actions">
        <a-input-search
          v-model:value="searchValue"
          enter-button="搜索🔍"
          placeholder="输入游戏名搜索🔍"
          size="large"
          @search="onSearch"
        />
      </div>
      <div class="game-cards">
        <div
          v-for="game in data"
          :key="game.gameId"
          class="game-card"
          @click="goToGameDetail(game.gameId)"
        >
          <div class="game-cover">
            <img
              v-if="game.gameCover"
              v-lazy="game.gameCover"
              :alt="game.gameName"
            />
            <a-empty v-else description="暂无封面" />
          </div>
          <div class="game-info">
            <h3 class="game-title">{{ game.gameName }}</h3>
            <div class="price-info">
              <div v-if="game.gamePrice !== 0">
                <div class="prices">
                  <span v-if="game.gameOnSale === 1" class="original-price"
                    >￥{{ game.gamePrice }}</span
                  >
                  <div v-if="game.gameOnSale === 1" class="discount-tag">
                    -{{ (game.gameDiscount * 100).toFixed(1) }}%
                  </div>
                  <span class="current-price"
                    >￥{{
                      game.gameOnSale === 1
                        ? game.gameDiscountedPrices
                        : game.gamePrice
                    }}</span
                  >
                </div>
              </div>
              <div v-else>
                <div class="discount-tag">免费</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <router-view v-slot="{ Component }">
      <transition
        mode="out-in"
        name="slide"
        @before-leave="handleBeforeLeave"
        @after-leave="handleAfterLeave"
      >
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script lang="ts" setup>
// 导入所需的组件和函数
import { onBeforeUnmount, onMounted, ref } from "vue";
import { searchGames } from "@/api/game";
// 导入日期处理库
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import router from "@/router";

// 设置 dayjs 为中文
dayjs.locale("zh-cn");

// 定义游戏项的接口
interface GameItem {
  gameId: number;
  gameName: string;
  gamePrice: number;
  gameCover: string;
  gameOnSale: number;
  gameDiscount: number;
  gameDiscountedPrices: number;

  [key: string]: any;
}

// 搜索关键词
const searchValue = ref("");
// 搜索处理函数
const onSearch = (value: string) => {
  fetchData(value);
};
// 表格数据
const data = ref<GameItem[]>([]);
// 表格列
const columns = [
  {
    title: "游戏名称",
    dataIndex: "gameName",
    key: "gameName",
  },
  {
    title: "游戏价格",
    dataIndex: "gamePrice",
    key: "gamePrice",
  },
  {
    title: "折扣价格",
    dataIndex: "gameDiscountedPrices",
    key: "gameDiscountedPrices",
  },
];

// API响应类型定义
interface ApiResponse<T> {
  code: number;
  message: string;
  data?: {
    records?: T[];
    total?: number;
    [key: string]: any;
  };
}

// 获取游戏列表数据
const fetchData = async (keyword = "") => {
  const res = (await searchGames({
    gameName: keyword,
    current: 1,
    pageSize: 10,
  })) as unknown as { data: ApiResponse<GameItem> };

  if (res.data.code === 0) {
    data.value = res.data.data?.records || [];
  }
};

const goToGameDetail = (gameId: number) => {
  if (!gameId) {
    return;
  }
  // 保存当前滚动位置
  saveScrollPosition();
  router.push(`/game/${gameId}`);
};

// 保存滚动位置的函数
const saveScrollPosition = () => {
  const shopPage = document.getElementById("shopPage");
  if (shopPage) {
    sessionStorage.setItem(
      "shopPageScrollPosition",
      shopPage.scrollTop.toString()
    );
  }
};

// 恢复滚动位置的函数
const restoreScrollPosition = () => {
  const savedPosition = sessionStorage.getItem("shopPageScrollPosition");
  if (savedPosition) {
    setTimeout(() => {
      const shopPage = document.getElementById("shopPage");
      if (shopPage) {
        shopPage.scrollTop = parseInt(savedPosition);
        sessionStorage.removeItem("shopPageScrollPosition");
      }
    }, 100); // 延迟恢复确保DOM已渲染
  }
};

// 初始化加载数据
fetchData();

// 组件挂载时恢复滚动位置
onMounted(() => {
  restoreScrollPosition();
});

// 监听路由变化，当从详情页返回时恢复滚动位置
const handleRouteChange = () => {
  if (router.currentRoute.value.path === "/shop") {
    restoreScrollPosition();
  }
};

// 在组件卸载前移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener("popstate", handleRouteChange);
});

// 添加事件监听
window.addEventListener("popstate", handleRouteChange);

// 添加过渡钩子函数
const handleBeforeLeave = (el: Element) => {
  // 确保元素在离开动画开始前是可见的
  (el as HTMLElement).style.display = "block";
};

const handleAfterLeave = (el: Element) => {
  // 清理样式
  (el as HTMLElement).style.display = "";
};
</script>

<style scoped>
.shop-container {
  position: relative;
  min-height: 100vh;
  background-color: #f5f7fa;
}

#shopPage {
  min-height: calc(100vh - 64px);
  padding: 32px 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-actions {
  max-width: 1200px;
  margin: 0 auto 16px;
  padding: 0 8px;
}

:deep(.ant-input-search) {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  overflow: hidden;
}

:deep(.ant-input) {
  font-size: 16px;
  height: 48px;
  padding-left: 16px;
}

:deep(.ant-input-search-button) {
  height: 48px;
  font-size: 16px;
  box-shadow: none !important;
  border: none !important;
  background: #1890ff;
  color: white;
  transition: all 0.2s;
}

:deep(.ant-input-search-button:hover) {
  background: #40a9ff;
}

:deep(.ant-input-search-button:active) {
  background: #096dd9;
}

.game-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 8px;
}

.game-card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.game-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.game-card:hover .game-cover img {
  transform: scale(1.05);
}

.game-cover {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  background: #f0f2f5;
  overflow: hidden;
}

.game-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.game-cover :deep(.ant-empty) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
}

.game-info {
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.game-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
  line-height: 1.4;
}

.game-card:hover .game-title {
  color: #1890ff;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
}

.discount-tag {
  background: #52c41a;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(82, 196, 26, 0.2);
}

.prices {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  font-size: 13px;
}

.current-price {
  color: #f5222d;
  font-weight: 600;
  font-size: 18px;
}

/* 修改过渡动画 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}

/* 添加空状态样式 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #8c8c8c;
}

.empty-state-icon {
  font-size: 64px;
  color: #d9d9d9;
  margin-bottom: 16px;
}

.empty-state-text {
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .game-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .game-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .game-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  #shopPage {
    padding: 24px 16px;
  }

  :deep(.ant-input) {
    height: 42px;
  }

  :deep(.ant-input-search-button) {
    height: 42px;
  }
}

@media (max-width: 480px) {
  .game-cards {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  .game-title {
    font-size: 14px;
    margin-bottom: 8px;
  }

  .game-info {
    padding: 12px;
  }

  .current-price {
    font-size: 16px;
  }
}
</style>
