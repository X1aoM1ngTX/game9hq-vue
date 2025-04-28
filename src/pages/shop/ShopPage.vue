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
import { ref } from "vue";
import { message } from "ant-design-vue";
import { searchGames } from "@/api/game";
// 导入日期处理库
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import router from "@/router";

// 设置 dayjs 为中文
dayjs.locale("zh-cn");

// 搜索关键词
const searchValue = ref("");
// 搜索处理函数
const onSearch = (value: string) => {
  fetchData(value);
};
// 表格数据
const data = ref([]);
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

// 获取游戏列表数据
const fetchData = async (keyword = "") => {
  const res = await searchGames({
    gameName: keyword,
    current: 1,
    pageSize: 10,
  });
  if (res.data.code === 0) {
    data.value = res.data.data?.records || [];
  } else {
    message.error("游戏数据获取失败");
    data.value = [];
  }
};

const goToGameDetail = (gameId: string) => {
  if (!gameId) {
    return;
  }
  router.push(`/game/${gameId}`);
};

// 初始化加载数据
fetchData();

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
#shopPage {
  min-height: calc(100vh - 64px);
  padding: 24px;
}

.header-actions {
  max-width: 1200px;
  margin: 0 auto 24px;
}

.game-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.game-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.game-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.game-cover {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  background: #f0f0f0;
}

.game-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.game-cover :deep(.ant-empty) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
}

.game-info {
  padding: 12px;
}

.game-title {
  margin: 0 0 8px;
  font-size: 16px;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.discount-tag {
  background: #4caf50;
  color: white;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 14px;
  font-weight: bold;
}

.prices {
  display: flex;
  align-items: center;
  gap: 8px;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  font-size: 12px;
}

.current-price {
  color: #1890ff;
  font-weight: bold;
  font-size: 16px;
}

/* 修改过渡动画 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-cards {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 480px) {
  .game-cards {
    grid-template-columns: 1fr;
  }
}

:deep(.ant-input-search-button) {
  box-shadow: none !important;
  border-bottom: none !important;
}
</style>
