<template>
  <!-- 游戏详情覆盖层，点击空白区域返回上一页 -->
  <div
    class="game-detail-overlay"
    :class="{ 'slide-out': isLeaving }"
    @click.self="handleBack"
  >
    <div class="game-detail-sidebar">
      <!-- 游戏详情头部，包含返回按钮和游戏名称 -->
      <div class="game-detail-header">
        <div class="header-content">
          <!-- 返回按钮，点击返回上一页 -->
          <a-button class="back-btn" type="text" @click="handleBack">
            <template #icon>
              <RightOutlined style="font-size: 20px; color: #000000" />
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
                <div v-if="game.gamePrice !== 0">
                  <span v-if="game.gameOnSale === 1" class="original-price"
                    >￥{{ game.gamePrice }}</span
                  >
                  <span
                    class="current-price"
                    :class="{
                      'price-on-sale': game.gameOnSale === 1,
                    }"
                    >￥{{
                      game.gameOnSale === 1
                        ? game.gameDiscountedPrices
                        : game.gamePrice
                    }}</span
                  >
                </div>
                <div v-else>
                  <span class="current-price">免费</span>
                </div>
              </div>
              <button
                class="buy-button"
                @click="handleButtonClick"
                :disabled="game.gameStock <= 0 || game.gameIsRemoved === 1"
              >
                {{ getBuyButtonText }}
              </button>
            </div>
            <div class="game-details">
              <a-list>
                <a-list-item>
                  <a-tag color="blue"
                    ><strong>发行日期：</strong>{{ game.gameReleaseDate }}
                  </a-tag>
                </a-list-item>
                <a-list-item>
                  <a-tag color="green"
                    ><strong>开发商：</strong>{{ game.gameDev }}
                  </a-tag>
                </a-list-item>
                <a-list-item>
                  <a-tag color="purple"
                    ><strong>发行商：</strong>{{ game.gamePub }}
                  </a-tag>
                </a-list-item>
                <a-list-item>
                  <a-tag color="orange"
                    ><strong>库存：</strong>{{ game.gameStock }}
                  </a-tag>
                </a-list-item>
                <a-list-item v-if="game.gameOnSale === 1">
                  <a-tag color="magenta"
                    ><strong>促销折扣：</strong>{{ game.gameDiscount }}折
                  </a-tag>
                </a-list-item>
                <a-list-item v-if="game.gameOnSale === 1">
                  <a-tag color="red">
                    <strong>促销截止：</strong>
                    {{ formatDateTime(game.gameSaleEndTime) }}
                  </a-tag>
                </a-list-item>
                <a-list-item v-if="game.gameOnSale === 1">
                  <a-tag color="blue"
                    ><strong>促销剩余：</strong>{{ countdown }}
                  </a-tag>
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
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { type GameDetailVO, getGameDetail, userBuyGame } from "@/api/game";
import { message } from "ant-design-vue";
import { RightOutlined } from "@ant-design/icons-vue";
import { useUserLibraryStore } from "@/stores/userLibraryStore";
import dayjs from "dayjs";

// 路由对象
const route = useRoute();
const router = useRouter();
// 游戏详情数据
const game = ref<GameDetailVO | null>(null);
// 加载状态
const loading = ref(true);
// 错误信息
const error = ref<string | null>(null);
// 用户游戏库
const userLibraryStore = useUserLibraryStore();

// 倒计时相关
const countdown = ref("");
let timer: ReturnType<typeof setInterval> | null = null;

// 格式化日期时间
const formatDateTime = (date: string) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm");
};

// 更新倒计时
const updateCountdown = () => {
  if (!game.value?.gameSaleEndTime) return;

  const now = dayjs();
  const end = dayjs(game.value.gameSaleEndTime);
  const diff = end.diff(now);

  if (diff <= 0) {
    countdown.value = "已结束";
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    return;
  }

  // 计算天、小时、分钟和秒
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // 格式化倒计时显示
  const parts = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0 || days > 0) parts.push(`${hours}小时`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}分`);
  parts.push(`${seconds}秒`);

  countdown.value = parts.join("");
};

// 计算按钮文本
const getBuyButtonText = computed(() => {
  if (!game.value) return "加载中...";
  if (game.value.gameStock <= 0) return "已售罄";
  if (game.value.gameIsRemoved === 1) return "已下架";
  return isGameInLibrary(game.value.gameId) ? "前往游戏库" : "添加到游戏库";
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

// 处理按钮点击
const handleButtonClick = async () => {
  if (!game.value) return;

  if (isGameInLibrary(game.value.gameId)) {
    router.push({
      path: "/user/profile",
    });
  } else {
    // 如果游戏不在库中，添加到游戏库
    if (game.value.gameStock <= 0) {
      message.warning("该游戏已售罄");
      return;
    }
    if (game.value.gameIsRemoved === 1) {
      message.warning("该游戏已下架");
      return;
    }

    try {
      const res = await userBuyGame(game.value.gameId);
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
  }
};

// 页面挂载时获取游戏详情和启动倒计时
onMounted(() => {
  userLibraryStore.fetchUserLibrary();
  const gameId = route.params.gameId as string;
  fetchGameDetail(gameId);
  updateCountdown();
  // 每秒更新一次倒计时
  timer = setInterval(updateCountdown, 1000);
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});

const isLeaving = ref(false);

// 处理返回按钮点击
const handleBack = () => {
  isLeaving.value = true;
  // 等待动画完成后再返回
  setTimeout(() => {
    router.back();
  }, 300); // 动画时长为300ms
};
</script>

<style scoped>
.game-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 添加进入动画 */
  animation: slide-in 0.3s ease-out;
}

/* 添加离开动画类 */
.game-detail-overlay.slide-out {
  animation: slide-out 0.3s ease-in;
}

.game-detail {
  /* ... 其他样式保持不变 ... */
  /* 确保内容跟随overlay一起移动 */
  transform-origin: right center;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

.game-detail-sidebar {
  width: 100%;
  height: 100%;
  background-color: #f8f8f8;
  overflow-y: auto;
  animation: slideIn 0.4s ease-out;
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
  color: #000000;
  font-weight: bold;
}

.price-on-sale {
  color: #67c23a;
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

.buy-button:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
  color: rgba(0, 0, 0, 0.25);
}

/* 添加新的样式用于区分不同状态 */
.buy-button:not(:disabled) {
  background-color: #1890ff;
}

.buy-button:not(:disabled):hover {
  background-color: #40a9ff;
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

.countdown {
  margin-left: 8px;
  font-size: 14px;
  color: #ff4d4f;
  font-family: monospace; /* 使用等宽字体，让数字对齐 */
}
</style>
