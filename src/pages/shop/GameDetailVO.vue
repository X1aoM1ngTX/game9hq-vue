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

      <!-- 游戏玩家统计卡片 -->
      <div class="game-stat-card">
        <h2 class="stat-title">玩家统计</h2>
        <hr class="stat-divider" />
        <div ref="chartRef" class="stat-chart"></div>
      </div>

      <!-- 游戏评论区域 -->
      <div class="game-review-section">
        <h2 class="review-title">玩家评价</h2>
        <hr class="review-divider" />

        <!-- 评分统计 -->
        <div class="rating-summary">
          <div class="average-rating">
            <span class="rating-number">{{ averageRating }}</span>
            <span class="rating-max">/5</span>
          </div>
          <div class="rating-stars">
            <a-rate :value="averageRating" disabled allow-half />
          </div>
          <div class="total-reviews">共 {{ totalReviews }} 条评价</div>
        </div>

        <!-- 发表评论 -->
        <div class="review-form" v-if="!hasReviewed">
          <h3>发表评价</h3>
          <div class="rating-input">
            <span>评分：</span>
            <a-rate v-model:value="newReview.rating" allow-half />
          </div>
          <a-textarea
            v-model:value="newReview.content"
            :rows="4"
            placeholder="分享您的游戏体验..."
            :maxlength="500"
            show-count
          />
          <a-button type="primary" @click="submitReview" :loading="submitting">
            提交评价
          </a-button>
        </div>

        <!-- 评论列表 -->
        <div class="review-list">
          <div
            v-for="review in reviews"
            :key="review.reviewId"
            class="review-item"
          >
            <div class="review-header">
              <div class="reviewer-info">
                <span class="reviewer-name">{{ review.userName }}</span>
                <a-rate :value="review.rating" disabled allow-half />
              </div>
              <span class="review-time">{{
                formatDateTime(review.createTime)
              }}</span>
            </div>
            <div class="review-content">{{ review.content }}</div>
            <div class="review-actions" v-if="review.userId === currentUserId">
              <a-button type="link" @click="editReview(review)">编辑</a-button>
              <a-button
                type="link"
                danger
                @click="deleteReview(review.reviewId)"
                >删除</a-button
              >
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination">
            <a-pagination
              v-model:current="currentPage"
              :total="totalReviews"
              :pageSize="pageSize"
              @change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import * as echarts from "echarts";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { type GameDetailVO, getGameDetail, userBuyGame } from "@/api/game";
import { message } from "ant-design-vue";
import { RightOutlined } from "@ant-design/icons-vue";
import { useUserLibraryStore } from "@/stores/userLibraryStore";
import dayjs from "dayjs";
import {
  type Review,
  getGameReviews,
  getGameAverageRating,
  addGameReview,
  updateGameReview,
  deleteGameReview,
} from "@/api/gameReview";

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
// 图表实例
const chartRef = ref(null);
const trendData = {
  dates: [
    "04-22",
    "04-23",
    "04-24",
    "04-25",
    "04-26",
    "04-27",
    "04-28",
    "04-29",
    "04-30",
    "05-01",
    "05-02",
    "05-03",
    "05-04",
    "05-05",
    "05-06",
    "05-07",
    "05-08",
    "05-09",
    "05-10",
    "05-11",
    "05-12",
  ],
  values: [
    1200, 1300, 1100, 1400, 1500, 1200, 1100, 1300, 1250, 1400, 1600, 1800,
    2500, 3000, 3400, 3800, 4100, 3700, 3900, 4000, 4183,
  ],
};

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

// 评论相关数据
const reviews = ref<Review[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalReviews = ref(0);
const averageRating = ref(0);
const hasReviewed = ref(false);
const submitting = ref(false);
const currentUserId = ref(0); // 需要从用户状态获取

const newReview = ref({
  rating: 5,
  content: "",
});

// 获取评论列表
const fetchReviews = async () => {
  try {
    const res = await getGameReviews(
      Number(route.params.gameId),
      currentPage.value,
      pageSize.value
    );
    if (res.data.code === 0) {
      reviews.value = res.data.data.records;
      totalReviews.value = res.data.data.total;
    }
  } catch (error) {
    message.error("获取评论失败");
  }
};

// 获取平均评分
const fetchAverageRating = async () => {
  try {
    const res = await getGameAverageRating(Number(route.params.gameId));
    if (res.data.code === 0) {
      averageRating.value = res.data.data;
    }
  } catch (error) {
    message.error("获取评分失败");
  }
};

// 提交评论
const submitReview = async () => {
  if (!newReview.value.content.trim()) {
    message.warning("请输入评价内容");
    return;
  }

  submitting.value = true;
  try {
    const res = await addGameReview({
      gameId: Number(route.params.gameId),
      rating: newReview.value.rating,
      content: newReview.value.content,
    });
    if (res.data.code === 0) {
      message.success("评价发布成功");
      newReview.value.content = "";
      newReview.value.rating = 5;
      hasReviewed.value = true;
      fetchReviews();
      fetchAverageRating();
    } else {
      message.error(res.data.message || "评价发布失败");
    }
  } catch (error) {
    message.error("评价发布失败");
  } finally {
    submitting.value = false;
  }
};

// 删除评论
const deleteReview = async (reviewId: number) => {
  try {
    const res = await deleteGameReview(reviewId);
    if (res.data.code === 0) {
      message.success("评论删除成功");
      fetchReviews();
      fetchAverageRating();
    } else {
      message.error(res.data.message || "评论删除失败");
    }
  } catch (error) {
    message.error("评论删除失败");
  }
};

// 编辑评论
const editReview = async (review: Review) => {
  newReview.value = {
    rating: review.rating,
    content: review.content,
  };

  try {
    const res = await updateGameReview({
      reviewId: review.reviewId,
      rating: newReview.value.rating,
      content: newReview.value.content,
    });
    if (res.data.code === 0) {
      message.success("评论更新成功");
      fetchReviews();
      fetchAverageRating();
    } else {
      message.error(res.data.message || "评论更新失败");
    }
  } catch (error) {
    message.error("评论更新失败");
  }
};

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchReviews();
};

// 页面挂载时获取游戏详情和启动倒计时
onMounted(() => {
  userLibraryStore.fetchUserLibrary();
  const gameId = route.params.gameId as string;
  fetchGameDetail(gameId);
  updateCountdown();
  // 每秒更新一次倒计时
  timer = setInterval(updateCountdown, 1000);

  const chart = echarts.init(chartRef.value);
  chart.setOption({
    title: {
      text: "在线玩家趋势图",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    xAxis: {
      type: "category",
      data: trendData.dates,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: trendData.values,
        type: "line",
        barWidth: "60%",
        itemStyle: {
          color: "#FFA500",
        },
      },
    ],
  });
  window.addEventListener("resize", () => {
    chart.resize();
  });

  fetchReviews();
  fetchAverageRating();
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

  .game-stat-card {
    padding: 16px 4px;
  }
  .stat-title {
    font-size: 18px;
    margin-bottom: 16px;
  }
  .stat-chart {
    height: 220px;
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

.game-stat-card {
  margin: 40px auto 0 auto;
  max-width: 900px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  padding: 32px 24px;
  text-align: center;
}

.stat-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 32px;
  color: #222;
  letter-spacing: 2px;
}

.stat-chart {
  width: 100%;
  height: 400px;
  margin: 0 auto;
}

.game-detail-sidebar > .game-stat-card {
  margin-top: 48px;
}

.stat-divider {
  border: none;
  border-top: 1px solid #eee;
  margin: 0 0 24px 0;
}

.game-review-section {
  margin: 40px auto 0;
  max-width: 900px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  padding: 32px 24px;
}

.review-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 32px;
  color: #222;
  letter-spacing: 2px;
}

.review-divider {
  border: none;
  border-top: 1px solid #eee;
  margin: 0 0 24px 0;
}

.rating-summary {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.average-rating {
  display: flex;
  align-items: baseline;
}

.rating-number {
  font-size: 36px;
  font-weight: bold;
  color: #1890ff;
}

.rating-max {
  font-size: 18px;
  color: #999;
}

.total-reviews {
  color: #666;
  font-size: 14px;
}

.review-form {
  margin-bottom: 32px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
}

.review-form h3 {
  margin-bottom: 16px;
  color: #333;
}

.rating-input {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-list {
  margin-top: 32px;
}

.review-item {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-name {
  font-weight: 500;
  color: #333;
}

.review-time {
  color: #999;
  font-size: 14px;
}

.review-content {
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
}

.review-actions {
  display: flex;
  gap: 12px;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .game-review-section {
    padding: 20px 16px;
  }

  .rating-summary {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .review-form {
    padding: 16px;
  }
}
</style>
