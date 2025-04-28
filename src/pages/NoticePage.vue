<template>
  <div class="notice-page">
    <div class="notice-header">
      <h1>游戏公告</h1>
      <p class="subtitle">及时了解游戏最新动态</p>
    </div>

    <a-alert
      v-if="error"
      :message="error"
      class="mb-4"
      closable
      type="error"
      @close="error = ''"
    />

    <div class="notice-container">
      <a-spin :spinning="loading">
        <div v-if="notices.length" class="notice-grid">
          <div
            v-for="(item, index) in notices"
            :key="index"
            :class="['notice-item', getNoticeSize(item)]"
            :style="{
              'z-index': notices.length - index,
              'animation-delay': `${index * 0.1}s`,
            }"
          >
            <a-card
              :class="['notice-card', `notice-type-${item.noticeType}`]"
              :title="item.noticeTitle"
              hoverable
            >
              <template #extra>
                <a-tag
                  :color="getNoticeTypeColor(item.noticeType)"
                  class="notice-tag"
                >
                  {{ getNoticeTypeText(item.noticeType) }}
                </a-tag>
              </template>
              <div class="notice-card-content">
                <div class="notice-content">{{ item.noticeContent }}</div>
                <div class="notice-footer">
                  <div class="notice-meta">
                    <a-space class="notice-time">
                      <clock-circle-outlined />
                      {{ formatDate(item.noticePublishTime) }}
                    </a-space>
                    <div v-if="item.noticeCreatorId" class="notice-creator">
                      <user-outlined />
                      <span>{{ getUserName(item.noticeCreatorId) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </a-card>
          </div>
        </div>
        <div v-else-if="!loading" class="empty-state">
          <a-empty description="暂无公告">
            <template #image>
              <img
                alt="暂无公告"
                class="empty-notice-image"
                src="@/assets/images/empty-notice.svg"
              />
            </template>
          </a-empty>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 为每个公告项设置延迟动画
const getItemDelay = (index: number): string => {
  return `animation-delay: ${index * 0.1}s;`;
};
import { onMounted, ref } from "vue";
import { getActiveNotices, type INotice, NoticeType } from "@/api/notice";
import { ClockCircleOutlined, UserOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { getUserById } from "@/api/user";

const notices = ref<INotice[]>([]);
const loading = ref(true);
const error = ref("");

// 添加用户信息状态
const userMap = ref<Record<string, any>>({});

// 获取用户信息
const fetchUserInfo = async (userId: number) => {
  try {
    // 如果已经获取过该用户信息，直接返回
    if (userMap.value[userId]) return;

    const resp = await getUserById(userId);
    if (resp.data && resp.data.data) {
      userMap.value[userId] = resp.data.data;
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
  }
};

// 获取公告列表
const fetchNotices = async () => {
  try {
    loading.value = true;
    error.value = "";
    const response = await getActiveNotices();
    console.log("获取到的公告数据:", response);

    // 检查响应结构
    const responseData = response.data;
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      // 后端返回格式: { data: INotice[] }
      notices.value = (responseData as { data: INotice[] }).data;
    } else if (Array.isArray(responseData)) {
      // 后端直接返回数组
      notices.value = responseData as INotice[];
    } else {
      console.error("响应数据结构不符合预期:", responseData);
      error.value = "数据格式错误";
      message.error("数据格式错误");
      return;
    }

    // 获取所有公告的创建者信息
    for (const notice of notices.value) {
      if (notice.noticeCreatorId) {
        await fetchUserInfo(notice.noticeCreatorId);
      }
    }
  } catch (err) {
    console.error("获取公告失败:", err);
    const errorMessage =
      err instanceof Error ? err.message : "获取公告列表失败";
    error.value = errorMessage;
    message.error(errorMessage);
  } finally {
    loading.value = false;
  }
};

// 获取公告卡片尺寸
const getNoticeSize = (notice: INotice): string => {
  // 根据公告类型和内容长度决定卡片大小
  if (
    notice.noticeType === NoticeType.IMPORTANT ||
    notice.noticeType === NoticeType.ACTIVITY
  ) {
    return "notice-item-large";
  }
  // 使用内容长度和索引位置来随机分配尺寸，使布局更加不规则
  const contentLength = notice.noticeContent.length;
  if (contentLength > 200) {
    return "notice-item-medium";
  }
  if (contentLength > 100) {
    // 随机决定是小卡片还是中等卡片
    return Math.random() > 0.5 ? "notice-item-small" : "notice-item-medium";
  }
  return "notice-item-small";
};

// 格式化日期
const formatDate = (dateString?: string): string => {
  if (!dateString) return "未知时间";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "无效日期";

    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "日期格式错误";
  }
};

// 获取公告类型颜色
const getNoticeTypeColor = (type: number): string => {
  const typeColors: Record<number, string> = {
    0: "#1677ff", // 普通公告 - 蓝色
    1: "#f5222d", // 重要公告 - 红色
    2: "#fa8c16", // 系统公告 - 橙色
    3: "#52c41a", // 活动公告 - 绿色
  };
  return typeColors[type] || "default";
};

// 获取公告类型文本
const getNoticeTypeText = (type: number): string => {
  const typeTexts: Record<number, string> = {
    0: "普通公告",
    1: "重要公告",
    2: "系统公告",
    3: "活动公告",
  };
  return typeTexts[type] || "其他";
};

// 获取用户名的方法
const getUserName = (userId: number): string => {
  if (!userId) return "未知用户";
  const user = userMap.value[userId];
  return user
    ? user.userNickname || user.userName || `用户 ${userId}`
    : `用户 ${userId}`;
};

onMounted(() => {
  fetchNotices();
});
</script>

<style scoped>
.notice-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 64px);
}

.notice-header {
  text-align: center;
  margin-bottom: 48px;
}

.notice-header h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--ant-primary-color);
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.notice-container {
  position: relative;
  padding: 20px 0;
}

.notice-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 0 12px;
  justify-content: center;
}

.notice-item {
  transition: all 0.3s ease;
  margin-bottom: 15px;
  position: relative;
  animation: fadeIn 0.6s ease-out;
  animation-fill-mode: backwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notice-item-small {
  width: 280px;
}

.notice-item-medium {
  width: 320px;
}

.notice-item-large {
  width: 360px;
}

.notice-card {
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background-color: #fff;
}

/* 为不同类型的卡片添加微妙的背景色 */
.notice-type-0 {
  background-color: rgba(22, 119, 255, 0.02);
}

.notice-type-1 {
  background-color: rgba(245, 34, 45, 0.02);
}

.notice-type-2 {
  background-color: rgba(250, 140, 22, 0.02);
}

.notice-type-3 {
  background-color: rgba(82, 196, 26, 0.02);
}

/* 添加装饰元素 */
.notice-card::after {
  content: "";
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30px;
  height: 30px;
  background-color: rgba(0, 0, 0, 0.03);
  clip-path: polygon(100% 0, 0% 100%, 100% 100%);
}

.notice-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--ant-primary-color);
  opacity: 0.8;
}

.notice-type-0::before {
  background: #1677ff;
}

.notice-type-1::before {
  background: #f5222d;
}

.notice-type-2::before {
  background: #fa8c16;
}

.notice-type-3::before {
  background: #52c41a;
}

.notice-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.notice-card :deep(.ant-card-body) {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.notice-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.notice-content {
  color: #333;
  line-height: 1.8;
  margin: 0 0 16px;
  font-size: 1rem;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}

.notice-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.notice-time {
  color: #999;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.notice-tag {
  font-weight: 500;
  padding: 0 12px;
  border-radius: 4px;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

.empty-notice-image {
  width: 240px;
  height: 200px;
  opacity: 0.8;
}

:deep(.ant-card-head) {
  min-height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.ant-card-head-title) {
  padding: 12px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

:deep(.ant-card-actions) {
  background: #fafafa;
}

@media (max-width: 1200px) {
  .notice-item-small {
    width: 260px;
  }

  .notice-item-medium {
    width: 300px;
  }

  .notice-item-large {
    width: 340px;
  }
}

@media (max-width: 768px) {
  .notice-page {
    padding: 20px 16px;
  }

  .notice-header h1 {
    font-size: 2rem;
  }

  .notice-grid {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .notice-item-small,
  .notice-item-medium,
  .notice-item-large {
    width: 100%;
    max-width: 400px;
    --rotate: 0deg;
  }
}

.notice-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notice-creator {
  font-size: 0.9rem;
  color: #999;
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
