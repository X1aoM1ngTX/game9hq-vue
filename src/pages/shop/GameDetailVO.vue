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
        <!-- 加载中状态 -->
        <div v-if="loading" class="loading">加载中...</div>
        <!-- 错误状态 -->
        <div v-else-if="error" class="error">
          {{ error }}
        </div>
        <!-- 游戏信息展示 -->
        <div v-else-if="game" class="game-info">
          <!-- 游戏主要内容，包括封面和描述 -->
          <div class="game-main-content">
            <!-- 游戏封面 -->
            <div class="game-cover">
              <img
                v-if="game.gameCover"
                :src="game.gameCover"
                :alt="game.gameName"
              />
              <!-- 如果没有封面图，则显示空状态 -->
              <a-empty v-else description="暂无游戏封面" />
            </div>

            <!-- 游戏描述 -->
            <div class="game-description">
              <h3>游戏描述</h3>
              <p>{{ game.gameDescription }}</p>
            </div>
          </div>

          <!-- 游戏侧边栏，包含价格、购买按钮和游戏信息 -->
          <div class="game-sidebar">
            <!-- 游戏基本信息，包括价格和购买按钮 -->
            <div class="game-basic-info">
              <div class="price-section">
                <!-- 原价 -->
                <span v-if="game.gameOnSale === 1" class="original-price"
                  >￥{{ game.gamePrice }}</span
                >
                <!-- 现价 -->
                <span class="current-price"
                  >￥{{
                    game.gameOnSale === 1
                      ? game.gameDiscountedPrices
                      : game.gamePrice
                  }}</span
                >
              </div>
              <!-- 购买按钮 -->
              <button
                class="buy-button"
                @click="handleBuy"
                :disabled="game.gameStock <= 0 || game.gameIsRemoved === 1"
              >
                {{ getBuyButtonText }}
              </button>
            </div>

            <!-- 游戏详细信息 -->
            <div class="game-details">
              <h3>游戏信息</h3>
              <ul>
                <li>
                  <span class="label">发行日期：</span>
                  <span>{{ game.gameReleaseDate }}</span>
                </li>
                <li>
                  <span class="label">开发商：</span>
                  <span>{{ game.gameDev }}</span>
                </li>
                <li>
                  <span class="label">发行商：</span>
                  <span>{{ game.gamePub }}</span>
                </li>
                <li>
                  <span class="label">库存：</span>
                  <span>{{ game.gameStock }}</span>
                </li>
                <li v-if="game.gameOnSale === 1">
                  <span class="label">促销折扣：</span>
                  <span>{{ game.gameDiscount }}折</span>
                  <span class="sale-end-time">
                    (截止至: {{ game.gameSaleEndTime }})
                  </span>
                </li>
              </ul>
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
import { message } from "ant-design-vue";
import { RightOutlined } from "@ant-design/icons-vue";

// 路由对象
const route = useRoute();
// 游戏详情数据
const game = ref<GameDetailVO | null>(null);
// 加载状态
const loading = ref(true);
// 错误信息
const error = ref<string | null>(null);

// 计算购买按钮的文本
const getBuyButtonText = computed(() => {
  if (!game.value) return "购买";
  if (game.value.gameIsRemoved === 1) return "已下架";
  if (game.value.gameStock <= 0) return "缺货";
  return "购买";
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

// 处理购买逻辑
const handleBuy = () => {
  if (!game.value) return;
  if (game.value.gameStock <= 0) {
    message.warning("该游戏已售罄");
    return;
  }
  if (game.value.gameIsRemoved === 1) {
    message.warning("该游戏已下架");
    return;
  }
  // TODO: 实现购买逻辑
  console.log("购买游戏:", game.value.gameName);
};

// 页面挂载时获取游戏详情
onMounted(() => {
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
