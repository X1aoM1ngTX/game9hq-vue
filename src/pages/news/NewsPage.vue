<template>
  <div class="news-page-layout">
    <!-- 左侧导航 -->
    <aside class="sidebar">
      <a-card :bordered="false" class="sidebar-card">
        <div class="nav-title">资讯中心</div>
        <div class="nav-group">
          <div
            :class="['nav-item', activeTab === 'community' ? 'active' : '']"
            @click="switchTab('community')"
          >
            <read-outlined />
            社区内容
          </div>
          <div
            :class="['nav-item', activeTab === 'drafts' ? 'active' : '']"
            @click="switchTab('drafts')"
          >
            <edit-outlined />
            我的草稿
          </div>
          <div
            :class="['nav-item', activeTab === 'published' ? 'active' : '']"
            @click="switchTab('published')"
          >
            <file-done-outlined />
            我的发布
          </div>
        </div>
        <a-button
          block
          class="publish-btn"
          type="primary"
          @click="createNewNews"
        >
          <plus-outlined />
          发布资讯
        </a-button>
      </a-card>
    </aside>

    <!-- 资讯内容流 -->
    <main class="news-main">
      <a-card :bordered="false" class="news-card-container">
        <template #title>
          <div class="section-title">
            <span>{{ getSectionTitle() }}</span>
            <a-input-search
              v-if="activeTab === 'community'"
              v-model:value="searchKeyword"
              class="search-input"
              placeholder="搜索资讯..."
              @search="onSearch"
            />
          </div>
        </template>
        <a-spin :spinning="loading">
          <!-- 社区内容 -->
          <template
            v-if="activeTab === 'community' && newsList && newsList.length > 0"
          >
            <div v-for="item in newsList" :key="item.newsId" class="news-card">
              <div class="news-header">
                <div class="author-info">
                  <a-avatar :size="32" :src="item.authorAvatar" />
                  <span class="author">{{ item.authorName }}</span>
                </div>
                <span class="publish-time">{{
                  formatDate(item.newsPublishTime || item.newsCreateTime)
                }}</span>
              </div>
              <div
                class="news-content-container"
                @click="goToDetail(item.newsId)"
              >
                <div class="news-text">
                  <div class="news-title">{{ item.newsTitle }}</div>
                  <div class="news-summary">{{ item.newsSummary }}</div>
                </div>
                <div v-if="item.newsCoverImage" class="news-image">
                  <img
                    v-lazy="item.newsCoverImage"
                    alt="资讯封面"
                    class="news-cover"
                  />
                </div>
              </div>
              <div class="news-footer">
                <span><eye-outlined /> {{ item.newsViews }}</span>
              </div>
            </div>
          </template>

          <!-- 草稿内容 -->
          <template
            v-else-if="
              activeTab === 'drafts' && draftsList && draftsList.length > 0
            "
          >
            <div
              v-for="item in draftsList"
              :key="item.newsId"
              class="news-card"
            >
              <div class="news-header">
                <a-tag color="orange">草稿</a-tag>
                <span class="publish-time"
                  >创建于 {{ formatDate(item.newsCreateTime) }}</span
                >
              </div>
              <div class="news-content-container">
                <div class="news-text">
                  <div class="news-title">{{ item.newsTitle }}</div>
                  <div class="news-summary">{{ item.newsSummary }}</div>
                </div>
                <div v-if="item.newsCoverImage" class="news-image">
                  <img
                    v-lazy="item.newsCoverImage"
                    alt="资讯封面"
                    class="news-cover"
                  />
                </div>
              </div>
              <div class="news-footer">
                <a-space>
                  <a-button
                    size="small"
                    type="primary"
                    @click="goToEdit(item.newsId)"
                  >
                    <edit-outlined />
                    编辑
                  </a-button>
                  <a-button
                    size="small"
                    type="primary"
                    @click="publishDraft(item.newsId)"
                  >
                    <send-outlined />
                    发布
                  </a-button>
                  <a-button
                    danger
                    size="small"
                    @click="deleteDraft(item.newsId)"
                  >
                    <delete-outlined />
                    删除
                  </a-button>
                </a-space>
              </div>
            </div>
          </template>

          <!-- 我发布的内容 -->
          <template
            v-else-if="
              activeTab === 'published' &&
              myPublishedList &&
              myPublishedList.length > 0
            "
          >
            <div
              v-for="item in myPublishedList"
              :key="item.newsId"
              class="news-card"
            >
              <div class="news-header">
                <a-tag color="green">已发布</a-tag>
                <span class="publish-time"
                  >发布于 {{ formatDate(item.newsPublishTime) }}</span
                >
              </div>
              <div
                class="news-content-container"
                @click="goToDetail(item.newsId)"
              >
                <div class="news-text">
                  <div class="news-title">{{ item.newsTitle }}</div>
                  <div class="news-summary">{{ item.newsSummary }}</div>
                </div>
                <div v-if="item.newsCoverImage" class="news-image">
                  <img
                    v-lazy="item.newsCoverImage"
                    alt="资讯封面"
                    class="news-cover"
                  />
                </div>
              </div>
              <div class="news-footer">
                <div class="news-stats">
                  <span><eye-outlined /> {{ item.newsViews }}</span>
                </div>
                <div class="news-actions">
                  <a-space>
                    <a-button
                      size="small"
                      type="primary"
                      @click="goToEdit(item.newsId)"
                    >
                      <edit-outlined />
                      编辑
                    </a-button>
                    <a-button
                      ghost
                      size="small"
                      type="primary"
                      @click="setAsDraft(item.newsId)"
                    >
                      <file-outlined />
                      转为草稿
                    </a-button>
                    <a-button
                      danger
                      size="small"
                      @click="deletePublished(item.newsId)"
                    >
                      <delete-outlined />
                      删除
                    </a-button>
                  </a-space>
                </div>
              </div>
            </div>
          </template>

          <!-- 空状态提示 -->
          <a-empty v-else :description="getEmptyDescription()" />
        </a-spin>
      </a-card>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { message, Modal } from "ant-design-vue";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileDoneOutlined,
  FileOutlined,
  PlusOutlined,
  ReadOutlined,
  SendOutlined,
} from "@ant-design/icons-vue";
import {
  deleteNews,
  draftNews,
  listMyDrafts,
  listMyPublishedNews,
  listPublishedNews,
  type NewsItem,
  type NewsItemWithAuthor,
  publishNews,
} from "@/api/news";
import { useLoginUserStore } from "@/stores/useLoginUserStore";

const router = useRouter();
const userStore = useLoginUserStore();
const newsList = ref<NewsItemWithAuthor[]>([]);
const draftsList = ref<NewsItem[]>([]);
const myPublishedList = ref<NewsItem[]>([]);
const loading = ref(false);
const activeTab = ref("community");
const searchKeyword = ref("");

// 切换标签页
const switchTab = (tab: string) => {
  activeTab.value = tab;
  if (tab === "community") {
    fetchPublishedNews();
  } else if (tab === "drafts") {
    fetchMyDrafts();
  } else if (tab === "published") {
    fetchMyPublishedNews();
  }
};

// 获取空状态提示
const getEmptyDescription = () => {
  switch (activeTab.value) {
    case "drafts":
      return "暂无草稿资讯";
    case "published":
      return "暂无已发布资讯";
    default:
      return "暂无资讯";
  }
};

// 前往编辑页面
const goToEdit = (newsId?: number) => {
  if (newsId) {
    if (activeTab.value === "drafts") {
      router.push({
        path: `/news/edit/${newsId}`,
        query: { draft: "true" },
      });
    } else {
      router.push(`/news/edit/${newsId}`);
    }
  } else {
    router.push("/news/edit");
  }
};

// 前往详情页面
const goToDetail = (newsId: number) => {
  router.push(`/news/detail/${newsId}`);
};

// 发布草稿
const publishDraft = (newsId: number) => {
  Modal.confirm({
    title: "确认发布",
    content: "确定要发布这篇草稿资讯吗？",
    okText: "确认",
    cancelText: "取消",
    async onOk() {
      try {
        loading.value = true;
        const res = await publishNews(newsId);
        if (res.data && res.data.code === 0) {
          message.success("发布成功");
          fetchMyDrafts(); // 刷新草稿列表
        } else {
          message.error(res.data?.message || "发布失败");
        }
      } catch (error) {
        console.error("发布失败:", error);
        message.error("发布失败");
      } finally {
        loading.value = false;
      }
    },
  });
};

// 删除草稿
const deleteDraft = (newsId: number) => {
  Modal.confirm({
    title: "确认删除",
    content: "确定要删除这篇草稿资讯吗？此操作不可恢复。",
    okText: "确认",
    cancelText: "取消",
    async onOk() {
      try {
        loading.value = true;
        const res = await deleteNews(String(newsId));
        if (res.data && res.data.code === 0) {
          message.success("删除成功");
          fetchMyDrafts(); // 刷新草稿列表
        } else {
          message.error(res.data?.message || "删除失败");
        }
      } catch (error) {
        console.error("删除失败:", error);
        message.error("删除失败");
      } finally {
        loading.value = false;
      }
    },
  });
};

// 将已发布的资讯转为草稿
const setAsDraft = (newsId: number) => {
  Modal.confirm({
    title: "转为草稿",
    content: "确定要将此资讯转为草稿状态吗？转为草稿后该资讯将不再公开显示。",
    okText: "确认",
    cancelText: "取消",
    async onOk() {
      try {
        loading.value = true;
        const res = await draftNews(newsId);
        if (res.data && res.data.code === 0) {
          message.success("已转为草稿");
          fetchMyPublishedNews(); // 刷新已发布列表
          fetchMyDrafts(); // 同时刷新草稿列表
        } else {
          message.error(res.data?.message || "操作失败");
        }
      } catch (error) {
        console.error("转为草稿失败:", error);
        message.error("操作失败");
      } finally {
        loading.value = false;
      }
    },
  });
};

// 删除已发布的资讯
const deletePublished = (newsId: number) => {
  Modal.confirm({
    title: "确认删除",
    content: "确定要删除这篇已发布的资讯吗？此操作不可恢复。",
    okText: "确认",
    cancelText: "取消",
    async onOk() {
      try {
        loading.value = true;
        const res = await deleteNews(String(newsId));
        if (res.data && res.data.code === 0) {
          message.success("删除成功");
          fetchMyPublishedNews(); // 刷新已发布列表
        } else {
          message.error(res.data?.message || "删除失败");
        }
      } catch (error) {
        console.error("删除失败:", error);
        message.error("删除失败");
      } finally {
        loading.value = false;
      }
    },
  });
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 24小时内显示相对时间
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours < 1) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} 分钟前`;
    }
    return `${hours} 小时前`;
  }

  // 超过24小时显示具体日期
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 获取已发布资讯
const fetchPublishedNews = async () => {
  loading.value = true;
  try {
    const response = await listPublishedNews();
    if (!response || !response.records) {
      console.warn("API 返回的数据结构不正确:", response);
      newsList.value = [];
      return;
    }
    newsList.value = response.records;
  } catch (error) {
    console.error("获取资讯列表失败:", error);
    message.error("网络错误，请稍后重试");
  } finally {
    loading.value = false;
  }
};

// 获取我的草稿资讯
const fetchMyDrafts = async () => {
  if (!userStore.loginUser?.userId) {
    message.error("请先登录");
    return;
  }

  loading.value = true;
  try {
    const response = await listMyDrafts();
    if (response && response.data && response.data.code === 0) {
      draftsList.value = response.data.data.records || [];
    } else {
      console.warn("获取草稿列表失败:", response);
      draftsList.value = [];
    }
  } catch (error) {
    console.error("获取草稿列表失败:", error);
    message.error("获取草稿列表失败");
  } finally {
    loading.value = false;
  }
};

// 获取我发布的资讯
const fetchMyPublishedNews = async () => {
  if (!userStore.loginUser?.userId) {
    message.error("请先登录");
    return;
  }

  loading.value = true;
  try {
    const response = await listMyPublishedNews();
    if (response && response.data && response.data.code === 0) {
      myPublishedList.value = response.data.data.records || [];
    } else {
      console.warn("获取我的发布列表失败:", response);
      myPublishedList.value = [];
    }
  } catch (error) {
    console.error("获取我的发布列表失败:", error);
    message.error("获取我的发布列表失败");
  } finally {
    loading.value = false;
  }
};

// 获取板块标题
const getSectionTitle = () => {
  switch (activeTab.value) {
    case "drafts":
      return "我的草稿";
    case "published":
      return "我的发布";
    default:
      return "社区内容";
  }
};

// 搜索资讯
const onSearch = (value: string) => {
  console.log("搜索关键词:", value);
  // TODO: 实现搜索逻辑
};

// 新增函数，专门用于创建新资讯
const createNewNews = () => {
  router.push("/news/edit");
};

// 初始化加载
onMounted(() => {
  // 默认加载社区内容
  fetchPublishedNews();
});
</script>

<style scoped>
.news-page-layout {
  display: flex;
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 16px;
  min-height: 80vh;
  background: #f5f5f5;
}

.sidebar {
  width: 240px;
  margin-right: 24px;
}

.sidebar-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 24px;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.nav-group {
  margin-bottom: 24px;
}

.nav-item {
  padding: 12px 16px;
  font-weight: 500;
  color: #595959;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 6px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item:hover {
  color: #40a9ff;
  background: #f0f7ff;
}

.nav-item.active {
  color: #1677ff;
  background: #e6f4ff;
}

.publish-btn {
  margin-top: 16px;
  height: 40px;
  font-weight: 500;
}

.news-main {
  flex: 1;
  min-width: 0;
}

.news-card-container {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
}

.search-input {
  width: 250px;
}

.news-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 24px;
  transition: all 0.2s;
  border: 1px solid #f0f0f0;
}

.news-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: transparent;
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author {
  font-weight: 500;
  color: #1677ff;
}

.publish-time {
  color: #999;
  font-size: 13px;
}

.news-content-container {
  display: flex;
  gap: 20px;
  cursor: pointer;
}

.news-text {
  flex: 1;
  min-width: 0;
}

.news-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  line-height: 1.4;
  color: #262626;
}

.news-summary {
  color: #595959;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.news-image {
  width: 200px;
  height: 120px;
  flex-shrink: 0;
}

.news-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #999;
  font-size: 14px;
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px solid #f5f5f5;
}

.news-stats {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 768px) {
  .news-page-layout {
    flex-direction: column;
    padding: 16px;
  }

  .sidebar {
    width: 100%;
    margin-right: 0;
    margin-bottom: 16px;
  }

  .news-content-container {
    flex-direction: column;
  }

  .news-image {
    width: 100%;
    height: auto;
    margin-top: 12px;
  }
}
</style>
