<template>
  <!-- 游戏详情覆盖层，点击空白区域返回上一页 -->
  <div class="game-detail-overlay" @click.self="$router.back()">
    <div class="game-detail-sidebar">
      <!-- 游戏详情头部，包含返回按钮和游戏名称 -->
      <div class="game-detail-header">
        <div class="header-content">
          <!-- 返回按钮，点击返回上一页 -->
          <a-button class="back-btn" type="text" @click="$router.back()">
            <template #icon>
              <right-outlined />
            </template>
          </a-button>
          <!-- 游戏名称 -->
          <h1>{{ game?.gameName }}</h1>
        </div>
      </div>

      <!-- 游戏详情容器 -->
      <div class="game-detail-container">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="error" class="error">
          {{ error }}
        </div>
        <div v-else-if="game" class="game-info">
          <div class="game-main-content">
            <div class="game-cover">
              <img v-lazy="game.gameCover" :alt="game.gameName" />
            </div>
            <div class="game-description">
              <h3>游戏描述</h3>
              <p>{{ game.gameDescription }}</p>
            </div>
          </div>

          <div class="game-sidebar">
            <div class="game-basic-info">
              <div class="price-section">
                <span v-if="game.gameOnSale === 1" class="original-price"
                  >￥{{ game.gamePrice }}</span
                >
                <span class="current-price"
                  >￥{{
                    game.gameOnSale === 1
                      ? game.gameDiscountedPrices
                      : game.gamePrice
                  }}</span
                >
              </div>
              <button
                class="buy-button"
                @click="handleBuy"
                :disabled="
                  isGameInLibrary(game.gameId) ||
                  game.gameStock <= 0 ||
                  game.gameIsRemoved === 1
                "
              >
                {{ getBuyButtonText }}
              </button>
            </div>
            <div class="game-details">
              <a-list>
                <a-list-item>
                  <a-tag color="blue"
                    ><strong>发行日期：</strong
                    >{{ game.gameReleaseDate }}</a-tag
                  >
                </a-list-item>
                <a-list-item>
                  <a-tag color="green"
                    ><strong>开发商：</strong>{{ game.gameDev }}</a-tag
                  >
                </a-list-item>
                <a-list-item>
                  <a-tag color="purple"
                    ><strong>发行商：</strong>{{ game.gamePub }}</a-tag
                  >
                </a-list-item>
                <a-list-item>
                  <a-tag color="orange"
                    ><strong>库存：</strong>{{ game.gameStock }}</a-tag
                  >
                </a-list-item>
                <a-list-item v-if="game.gameOnSale === 1">
                  <a-tag color="magenta"
                    ><strong>促销折扣：</strong>{{ game.gameDiscount }}折</a-tag
                  >
                  <span class="sale-end-time">
                    (截止至: {{ game.gameSaleEndTime }})
                  </span>
                </a-list-item>
              </a-list>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { type GameDetailVO, getGameDetail } from "@/api/game";
import { addGameToUserLibrary } from "@/api/userLibrary";
import { message } from "ant-design-vue";
import { RightOutlined } from "@ant-design/icons-vue";
import { useUserLibraryStore } from "@/stores/userLibraryStore";

// 路由对象
const route = useRoute();
// 游戏详情数据
const game = ref<GameDetailVO | null>(null);
// 加载状态
const loading = ref(true);
// 错误信息
const error = ref<string | null>(null);
// 用户游戏库
const userLibraryStore = useUserLibraryStore();

// 计算添加到游戏库中按钮的文本
const getBuyButtonText = computed(() => {
  if (!game.value) return "添加到游戏库中";
  if (game.value.gameIsRemoved === 1) return "已下架";
  if (game.value.gameStock <= 0) return "缺货";
  if (isGameInLibrary(game.value.gameId)) return "已在库中";
  return "添加到游戏库中";
});

// 获取游戏详情
const fetchGameDetail = async (gameId: string) => {
  try {
    loading.value = true;
    error.value = null;
    const res = await getGameDetail(gameId);
    if (res.data.code === 0 && res.data.data) {
      game.value = res.data.data;
    } else {
      error.value = res.data.message || "获取游戏详情失败";
    }
  } catch (err) {
    error.value = "获取游戏详情失败，请稍后重试";
    console.error("获取游戏详情失败:", err);
  } finally {
    loading.value = false;
  }
};

// 检查游戏是否在用户游戏库中
const isGameInLibrary = (gameId: number) => {
  return userLibraryStore.games.some((game) => game.gameId === gameId);
};

// 处理添加到游戏库中逻辑
const handleBuy = async () => {
  if (!game.value) return;
  if (game.value.gameStock <= 0) {
    message.warning("该游戏已售罄");
    return;
  }
  if (game.value.gameIsRemoved === 1) {
    message.warning("该游戏已下架");
    return;
  }

  try {
    const res = await addGameToUserLibrary(game.value.gameId);
    if (res.data.code === 0) {
      message.success("游戏已成功添加到您的游戏库");
      userLibraryStore.games.push(game.value); // 更新全局状态
    } else {
      message.error(res.data.message || "添加游戏失败");
    }
  } catch (error: unknown) {
    const err = error as { message?: string };
    message.error(`操作失败: ${err.message || "未知错误"}`);
  }
};

// 页面挂载时获取游戏详情
onMounted(() => {
  userLibraryStore.fetchUserLibrary();
  const gameId = route.params.gameId as string;
  fetchGameDetail(gameId);
});
</script>

<style scoped>
.game-detail-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.game-detail-sidebar {
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #ffffff, #7bb1ff);
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.game-detail-header {
  padding: 16px 0;
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-content h1 {
  color: #1a1a1a;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #1890ff;
  font-size: 16px;
}

.back-btn:hover {
  color: #40a9ff;
}

.game-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.game-info {
  display: flex;
  gap: 24px;
}

.game-main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.game-cover {
  width: 100%;
  height: 400px;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.game-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.game-sidebar {
  width: 320px;
  flex-shrink: 0;
}

.game-basic-info,
.game-description,
.game-details {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.game-basic-info {
  margin-bottom: 24px;
}

/* Price styles */
.price-section {
  margin-bottom: 16px;
}

.current-price {
  font-size: 24px;
  color: #1890ff;
  font-weight: bold;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 16px;
  margin-right: 8px;
}

/* Button styles */
.buy-button {
  width: 100%;
  padding: 12px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s;
}

.buy-button:hover {
  background-color: #40a9ff;
}

.buy-button:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
  color: rgba(0, 0, 0, 0.25);
}

/* Details styles */
.game-details .label {
  color: #666;
  min-width: 100px;
}

.sale-end-time {
  color: #999;
  font-size: 14px;
  margin-top: 4px;
  padding-left: 100px;
}

/* Loading and error states */
.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #666;
}

.error {
  color: #ff4d4f;
}

/* Empty state */
:deep(.ant-empty) {
  margin: 32px 0;
  color: #666;
}

:deep(.ant-empty-description) {
  color: #666;
}

/* Responsive design */
@media (max-width: 768px) {
  .game-info {
    flex-direction: column;
  }

  .game-sidebar {
    width: 320px;
    align-self: flex-start;
  }

  .game-cover {
    height: 300px;
  }
}
</style>
