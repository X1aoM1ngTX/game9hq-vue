<template>
  <div class="notice-page">
    <div class="notice-header">
      <h1>游戏公告</h1>
      <p class="subtitle">及时了解游戏最新动态</p>
    </div>

    <a-alert
      v-if="error"
      type="error"
      :message="error"
      class="mb-4"
      closable
      @close="error = ''"
    />

    <div class="notice-container">
      <a-spin :spinning="loading">
        <div v-if="notices.length" class="notice-grid">
          <div
            v-for="(item, index) in notices"
            :key="index"
            :class="['notice-item', getNoticeSize(item)]"
          >
            <a-card :title="item.noticeTitle" hoverable class="notice-card">
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
                  <a-space class="notice-time">
                    <clock-circle-outlined />
                    {{ formatDate(item.noticePublishTime) }}
                  </a-space>
                </div>
              </div>
            </a-card>
          </div>
        </div>
        <div v-else-if="!loading" class="empty-state">
          <a-empty description="暂无公告">
            <template #image>
              <img
                src="@/assets/images/empty-notice.svg"
                alt="暂无公告"
                class="empty-notice-image"
              />
            </template>
          </a-empty>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getActiveNotices, type INotice, NoticeType } from "@/api/notice";
import { ClockCircleOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

const notices = ref<INotice[]>([]);
const loading = ref(true);
const error = ref("");

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
  if (notice.noticeType === NoticeType.IMPORTANT) {
    return "notice-item-large";
  }
  if (notice.noticeContent.length > 200) {
    return "notice-item-medium";
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
    1: "blue", // 普通公告
    2: "green", // 活动公告
    3: "red", // 重要公告
    4: "orange", // 系统公告
  };
  return typeColors[type] || "default";
};

// 获取公告类型文本
const getNoticeTypeText = (type: number): string => {
  const typeTexts: Record<number, string> = {
    1: "普通公告",
    2: "活动公告",
    3: "重要公告",
    4: "系统公告",
  };
  return typeTexts[type] || "其他";
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
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  padding: 0 12px;
}

.notice-item {
  transition: all 0.3s ease;
}

.notice-item-small {
  grid-column: span 3;
}

.notice-item-medium {
  grid-column: span 4;
}

.notice-item-large {
  grid-column: span 6;
}

.notice-card {
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.notice-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
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
    grid-column: span 4;
  }

  .notice-item-medium {
    grid-column: span 6;
  }

  .notice-item-large {
    grid-column: span 8;
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
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .notice-item-small,
  .notice-item-medium,
  .notice-item-large {
    grid-column: span 12;
  }
}
</style>
