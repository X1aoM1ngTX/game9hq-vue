<template>
  <!-- 游戏详情覆盖层，点击空白区域返回上一页 -->
  <div
    :class="{ 'slide-out': isLeaving }"
    class="game-detail-overlay"
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
                    :class="{
                      'price-on-sale': game.gameOnSale === 1,
                    }"
                    class="current-price"
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
                :disabled="game.gameStock <= 0 || game.gameIsRemoved === 1"
                class="buy-button"
                @click="handleButtonClick"
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

// 接口响应类型定义
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// 获取游戏详情
const fetchGameDetail = async (gameId: string) => {
  try {
    loading.value = true;
    error.value = null;
    const res = (await getGameDetail(gameId)) as unknown as {
      data: ApiResponse<GameDetailVO>;
    };
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

// 用户游戏库中的游戏类型
interface UserGameItem {
  gameId: number;

  [key: string]: any;
}

// 检查游戏是否在用户游戏库中
const isGameInLibrary = (gameId: number) => {
  return (userLibraryStore.games as UserGameItem[]).some(
    (game) => game.gameId === gameId
  );
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
      const res = (await userBuyGame(game.value.gameId)) as unknown as {
        data: ApiResponse<any>;
      };
      if (res.data.code === 0) {
        message.success("游戏已成功添加到您的游戏库");
        // 更新全局状态
        (userLibraryStore.games as UserGameItem[]).push(
          game.value as UserGameItem
        );
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
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: slide-in 0.3s ease-out;
}

.game-detail-overlay.slide-out {
  animation: slide-out 0.3s ease-in;
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
  background-color: #ffffff;
  overflow-y: auto;
  animation: slideIn 0.4s ease-out;
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.2);
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-content h1 {
  color: #1a1a1a;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  transition: color 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  gap: 4px;
  color: #1890ff;
  font-size: 16px;
  transition: all 0.2s;
  background: rgba(24, 144, 255, 0.1);
}

.back-btn:hover {
  color: #ffffff;
  background: #1890ff;
}

.game-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 40px;
}

.game-info {
  display: flex;
  gap: 32px;
}

.game-main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.game-cover {
  width: 100%;
  height: 400px;
  background-color: #f8f8f8;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.game-cover:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
}

.game-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.game-cover:hover img {
  transform: scale(1.03);
}

.game-description {
  background-color: #ffffff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.game-description h3 {
  color: #1890ff;
  font-size: 20px;
  margin-top: 0;
  margin-bottom: 16px;
  font-weight: 600;
  position: relative;
  padding-left: 14px;
}

.game-description h3::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background: #1890ff;
  border-radius: 2px;
}

.game-description p {
  color: #333333;
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
  text-align: justify;
}

.game-sidebar {
  width: 340px;
  flex-shrink: 0;
}

.game-basic-info {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  transition: all 0.3s;
}

.game-basic-info:hover {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
}

.game-details {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.game-details:hover {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
}

.price-section {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.current-price {
  font-size: 28px;
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

.buy-button {
  width: 100%;
  padding: 14px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.25);
}

.buy-button:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
  color: rgba(0, 0, 0, 0.25);
  box-shadow: none;
}

.buy-button:not(:disabled) {
  background-color: #1890ff;
}

.buy-button:not(:disabled):hover {
  background-color: #40a9ff;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.35);
}

.buy-button:not(:disabled):active {
  background-color: #096dd9;
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

:deep(.ant-list) {
  background: transparent;
}

:deep(.ant-list-item) {
  padding: 10px 0;
  border-bottom: none;
}

:deep(.ant-tag) {
  margin: 4px 0;
  padding: 4px 8px;
  font-size: 14px;
  border: none;
}

.loading,
.error {
  text-align: center;
  padding: 60px;
  font-size: 16px;
  color: #666;
  border-radius: 12px;
  background: #f9f9f9;
  margin: 20px 0;
}

.error {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.05);
}

.countdown {
  font-family: "Roboto Mono", monospace;
  font-weight: 500;
}

@media (max-width: 992px) {
  .game-info {
    flex-direction: column;
  }

  .game-sidebar {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .game-cover {
    height: 300px;
  }

  .game-description,
  .game-basic-info,
  .game-details {
    padding: 20px;
  }
}

@media (max-width: 576px) {
  .header-content h1 {
    font-size: 20px;
  }

  .game-detail-container {
    padding: 0 16px 24px;
  }
}
</style>
