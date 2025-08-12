<template>
  <div class="wishlist-container">
    <!-- Steam风格头部 -->
    <div class="wishlist-header">
      <div class="header-content">
        <div class="header-info">
          <h1>愿望单</h1>
          <p>收藏你感兴趣的游戏，随时查看</p>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-number">{{ wishlistGames.length }}</span>
            <span class="stat-label">个游戏</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <a-spin size="large" />
      <p>加载中...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="wishlistGames.length === 0" class="empty-wishlist">
      <div class="empty-content">
        <heart-outlined class="empty-icon" />
        <h2>愿望单为空</h2>
        <p>去商店发现你感兴趣的游戏吧</p>
        <a-button size="large" type="primary" @click="goToShop">
          浏览商店
        </a-button>
      </div>
    </div>

    <!-- 游戏列表 -->
    <div v-else class="wishlist-content">
      <div class="wishlist-toolbar">
        <div class="toolbar-left">
          <span class="game-count">共 {{ wishlistGames.length }} 个游戏</span>
        </div>
        <div class="toolbar-right">
          <a-button @click="goToShop">
            <template #icon>
              <shop-outlined />
            </template>
            添加更多游戏
          </a-button>
        </div>
      </div>

      <div class="games-list">
        <div v-for="game in wishlistGames" :key="game.gameId" class="game-item">
          <div class="game-cover">
            <img
              v-lazy="game.gameCover"
              :alt="game.gameName"
              @click="goToGameDetail(game.gameId)"
            />
            <div class="game-overlay">
              <div class="game-actions">
                <a-button type="primary" @click="goToGameDetail(game.gameId)">
                  查看详情
                </a-button>
                <a-button danger @click="removeFromWishlist(game.gameId)">
                  <template #icon>
                    <delete-outlined />
                  </template>
                  移除
                </a-button>
              </div>
            </div>
          </div>
          <div class="game-details">
            <div class="game-title">
              <h3 @click="goToGameDetail(game.gameId)">{{ game.gameName }}</h3>
            </div>
            <div class="game-description">
              {{ game.gameDescription || "暂无描述" }}
            </div>
            <div class="game-meta">
              <div class="game-price">
                <span v-if="game.gamePrice && game.gamePrice > 0" class="price">
                  ¥{{ game.gamePrice }}
                </span>
                <span v-else class="price free">免费</span>
              </div>
              <div class="game-date">
                <calendar-outlined />
                <span>添加于 {{ formatDate(game.addTime) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { message } from "ant-design-vue";
import {
  CalendarOutlined,
  DeleteOutlined,
  HeartOutlined,
  ShopOutlined,
} from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { getMyWishlist, removeGameFromWishlist } from "@/api/wishlist";
import dayjs from "dayjs";

interface Game {
  gameId: number;
  gameName: string;
  gameDescription: string;
  gameCover: string;
  gamePrice?: number;
  addTime?: string;
}

const router = useRouter();
const wishlistGames = ref<Game[]>([]);
const loading = ref(false);

const fetchWishlist = async () => {
  try {
    loading.value = true;
    const res = await getMyWishlist();
    if (res.data.code === 0) {
      // 转换后端数据结构为前端期望的结构
      wishlistGames.value = (res.data.data || []).map((wishlistVO: any) => ({
        gameId: wishlistVO.game?.gameId,
        gameName: wishlistVO.game?.gameName,
        gameDescription: wishlistVO.game?.gameDescription,
        gameCover: wishlistVO.game?.gameCover,
        gamePrice: wishlistVO.game?.gamePrice
          ? Number(wishlistVO.game.gamePrice)
          : undefined,
        addTime: wishlistVO.createTime,
      }));
    } else {
      message.error("获取愿望单失败");
    }
  } catch (error) {
    console.error("获取愿望单失败:", error);
    message.error("获取愿望单失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

const removeFromWishlist = async (gameId: number) => {
  try {
    const res = await removeGameFromWishlist(gameId);
    if (res.data.code === 0) {
      message.success("已从愿望单移除");
      wishlistGames.value = wishlistGames.value.filter(
        (game) => game.gameId !== gameId
      );
    } else {
      message.error(res.data.description || "移除失败");
    }
  } catch (error) {
    console.error("移除游戏失败:", error);
    message.error("移除失败，请稍后重试");
  }
};

const goToGameDetail = (gameId: number) => {
  router.push(`/game/${gameId}`);
};

const goToShop = () => {
  router.push("/shop");
};

const formatDate = (date?: string) => {
  if (!date) return "未知时间";
  return dayjs(date).format("YYYY-MM-DD");
};

onMounted(() => {
  fetchWishlist();
});
</script>

<style scoped>
/* 网站统一风格设计 */
.wishlist-container {
  background: #ffffff;
  min-height: calc(100vh - 64px);
  color: #333333;
}

/* 头部样式 */
.wishlist-header {
  background: #ffffff;
  padding: 24px 0;
  border-bottom: 1px solid #f0f0f0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info h1 {
  font-size: 32px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 8px 0;
}

.header-info p {
  color: #595959;
  font-size: 16px;
  margin: 0;
}

.header-stats .stat-item {
  text-align: center;
  background: #f8f9fa;
  padding: 16px 24px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.stat-number {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: #000000;
}

.stat-label {
  font-size: 14px;
  color: #595959;
}

/* 内容区域 */
.wishlist-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* 工具栏 */
.wishlist-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.game-count {
  font-size: 16px;
  color: #595959;
}

/* 游戏列表 */
.games-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.game-item {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.game-item:hover {
  background: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border-color: #e0e0e0;
}

.game-item {
  display: flex;
  height: 184px;
}

.game-cover {
  width: 464px;
  height: 184px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.game-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.game-cover:hover img {
  transform: scale(1.05);
}

.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.game-cover:hover .game-overlay {
  opacity: 1;
}

.game-actions {
  display: flex;
  gap: 12px;
}

.game-details {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.game-title h3 {
  font-size: 21px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 8px 0;
  cursor: pointer;
  transition: color 0.3s ease;
  line-height: 1.2;
}

.game-title h3:hover {
  color: #1890ff;
}

.game-description {
  color: #595959;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.game-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.game-price .price {
  font-size: 18px;
  font-weight: bold;
  color: #000000;
}

.game-price .free {
  color: #52c41a;
}

.game-date {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #999999;
  font-size: 12px;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.loading-container p {
  margin-top: 16px;
  color: #595959;
}

/* 空状态 */
.empty-wishlist {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.empty-content {
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: #999999;
  margin-bottom: 16px;
}

.empty-content h2 {
  font-size: 24px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 8px 0;
}

.empty-content p {
  color: #595959;
  font-size: 16px;
  margin-bottom: 24px;
}

/* 移动端适配 */
@media (max-width: 1200px) {
  .game-cover {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .wishlist-toolbar {
    flex-direction: column;
    gap: 12px;
  }

  .game-item {
    flex-direction: column;
    height: auto;
  }

  .game-cover {
    width: 100%;
    height: 200px;
  }

  .game-details {
    padding: 16px;
  }

  .game-title h3 {
    font-size: 18px;
  }

  .game-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .wishlist-content {
    padding: 16px;
  }

  .header-content {
    padding: 0 16px;
  }

  .game-cover {
    height: 180px;
  }

  .game-actions {
    flex-direction: column;
  }
}
</style>
