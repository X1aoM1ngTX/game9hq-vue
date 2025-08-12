<template>
  <div class="news-detail-page">
    <a-spin :spinning="loading">
      <div v-if="newsData" class="news-container">
        <a-card :bordered="false">
          <div class="breadcrumb">
            <a @click="goBack">资讯中心</a>
            <span class="separator">/</span>
            <span>资讯详情</span>
          </div>

          <h1 class="news-title">{{ newsData.newsTitle }}</h1>

          <div class="news-meta">
            <div class="author-info">
              <a-avatar
                :size="40"
                :src="authorAvatar"
                class="author-avatar"
                @click="goToUserProfile(newsData.newsAuthorId)"
              />
              <span
                class="author-name"
                @click="goToUserProfile(newsData.newsAuthorId)"
                >{{ authorName }}</span
              >
            </div>
            <div class="meta-details">
              <div class="meta-item">
                <calendar-outlined />
                <span>
                  {{
                    newsData.newsPublishTime
                      ? formatDate(newsData.newsPublishTime)
                      : formatDate(newsData.newsCreateTime)
                  }}
                </span>
              </div>
              <div class="meta-item">
                <eye-outlined />
                <span>浏览 {{ newsData.newsViews }}</span>
              </div>
            </div>
          </div>

          <div v-if="newsData.newsCoverImage" class="news-cover-container">
            <img
              :src="newsData.newsCoverImage"
              alt="资讯封面"
              class="news-cover"
            />
          </div>

          <div class="news-content">
            <template v-for="(block, index) in contentBlocks" :key="index">
              <!-- 图片块 -->
              <div
                v-if="block.type === 'image'"
                class="content-image-container"
              >
                <img
                  :src="block.content"
                  alt="内容图片"
                  class="content-image"
                />
              </div>
              <!-- 文本块 -->
              <p v-else class="paragraph">{{ block.content }}</p>
            </template>
          </div>

          <div class="news-actions">
            <a-button @click="goBack">
              <arrow-left-outlined />
              返回列表
            </a-button>
            <a-button v-if="isAuthor" type="primary" @click="editNews">
              <edit-outlined />
              编辑文章
            </a-button>
          </div>
        </a-card>
      </div>

      <a-result
        v-else
        status="404"
        sub-title="您查找的资讯不存在或已被删除"
        title="未找到资讯"
      >
        <template #extra>
          <a-button type="primary" @click="goBack">返回列表</a-button>
        </template>
      </a-result>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons-vue";
import { getNewsDetail, type NewsItemWithAuthor } from "@/api/news";
import { useLoginUserStore } from "@/stores/useLoginUserStore";

const route = useRoute();
const router = useRouter();
const userStore = useLoginUserStore();

const newsData = ref<NewsItemWithAuthor | null>(null);
const loading = ref(false);

// 判断是否是作者
const isAuthor = computed(() => {
  if (!newsData.value || !userStore.loginUser) return false;
  return newsData.value.newsAuthorId === userStore.loginUser.userId;
});

// 作者信息
const authorName = computed(() => {
  if (!newsData.value) return "";

  // 如果是当前用户，显示登录用户昵称
  if (newsData.value.newsAuthorId === userStore.loginUser?.userId) {
    return userStore.loginUser.userNickname;
  }

  // 如果后端返回了作者信息
  if (newsData.value.authorName) {
    return newsData.value.authorName;
  }

  // 默认显示为匿名作者
  return "匿名作者";
});

const authorAvatar = computed(() => {
  if (!newsData.value) return "";

  // 如果是当前用户，显示登录用户头像
  if (newsData.value.newsAuthorId === userStore.loginUser?.userId) {
    return userStore.loginUser.userAvatar;
  }

  // 如果后端返回了作者头像
  if (newsData.value.authorAvatar) {
    return newsData.value.authorAvatar;
  }

  // 默认为空
  return "";
});

// 内容处理为块
const contentBlocks = computed(() => {
  if (!newsData.value || !newsData.value.newsContent) return [];

  const blocks: Array<{ type: "text" | "image"; content: string }> = [];
  const paragraphs = newsData.value.newsContent
    .split("\n")
    .filter((p) => p.trim() !== "");

  const imgRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp))/gi;

  paragraphs.forEach((paragraph) => {
    // 重置正则表达式状态
    imgRegex.lastIndex = 0;

    // 检查段落是否仅包含图片链接
    const isParagraphJustImage =
      imgRegex.test(paragraph) &&
      paragraph.trim().match(imgRegex)?.[0] === paragraph.trim();

    // 重置正则表达式状态
    imgRegex.lastIndex = 0;

    if (isParagraphJustImage) {
      // 如果段落仅包含图片，直接添加为图片块
      blocks.push({
        type: "image",
        content: paragraph.trim(),
      });
    } else {
      // 处理包含文本和可能嵌入图片的段落
      let lastIndex = 0;
      let match;

      // 用于标记是否在段落中找到了图片
      let foundImageInParagraph = false;

      // 临时存储当前段落的文本和图片块
      const currentParagraphBlocks: Array<{
        type: "text" | "image";
        content: string;
      }> = [];

      // 查找段落中的所有图片
      while ((match = imgRegex.exec(paragraph)) !== null) {
        foundImageInParagraph = true;

        // 添加图片前的文本（如果有）
        if (match.index > lastIndex) {
          const textContent = paragraph.substring(lastIndex, match.index);
          if (textContent.trim()) {
            currentParagraphBlocks.push({ type: "text", content: textContent });
          }
        }

        // 添加图片
        currentParagraphBlocks.push({ type: "image", content: match[0] });
        lastIndex = match.index + match[0].length;
      }

      // 处理段落的剩余部分
      if (foundImageInParagraph) {
        // 如果找到了图片，添加最后一部分文本（如果有）
        if (lastIndex < paragraph.length) {
          const textContent = paragraph.substring(lastIndex);
          if (textContent.trim()) {
            currentParagraphBlocks.push({ type: "text", content: textContent });
          }
        }

        // 将当前段落生成的所有块添加到最终的blocks数组
        blocks.push(...currentParagraphBlocks);
      } else {
        // 如果段落中没有图片，将整个段落作为一个文本块添加
        blocks.push({ type: "text", content: paragraph });
      }
    }
  });

  return blocks;
});

// 格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 获取资讯详情
const fetchNewsDetail = async (newsId: number): Promise<void> => {
  loading.value = true;
  try {
    const response = await getNewsDetail(Number(newsId));
    if (response.data && response.data.code === 0 && response.data.data) {
      // 检查是否有重复的摘要内容
      const newsDataFromApi = response.data.data;

      // 如果内容以摘要开头，且摘要不为空，则从内容中移除摘要
      if (
        newsDataFromApi.newsSummary &&
        newsDataFromApi.newsContent.startsWith(newsDataFromApi.newsSummary)
      ) {
        newsDataFromApi.newsContent = newsDataFromApi.newsContent
          .substring(newsDataFromApi.newsSummary.length)
          .trim();
      }

      // 赋值给响应式数据
      newsData.value = newsDataFromApi;
      console.log("详情页资讯数据:", newsData.value);
    }
  } catch (error) {
    console.error("获取资讯详情失败:", error);
  } finally {
    loading.value = false;
  }
};

// 返回列表
const goBack = () => {
  router.push("/news");
};

// 编辑文章
const editNews = () => {
  if (newsData.value) {
    router.push(`/news/edit/${newsData.value.newsId}`);
  }
};

// 跳转到用户主页
const goToUserProfile = (userId: number) => {
  router.push(`/user/profile/${userId}`);
};

onMounted(() => {
  const newsId = route.params.newsId;
  if (newsId) {
    fetchNewsDetail(Number(newsId));
  } else {
    router.push("/news");
  }
});
</script>

<style scoped>
.news-detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 16px;
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}

.news-container {
  border-radius: 8px;
  overflow: hidden;
}

.breadcrumb {
  font-size: 14px;
  margin-bottom: 24px;
  color: #8c8c8c;
}

.breadcrumb a {
  color: #1677ff;
  cursor: pointer;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.separator {
  margin: 0 8px;
}

.news-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  line-height: 1.4;
  color: #262626;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  cursor: pointer;
  transition: transform 0.2s;
}

.author-avatar:hover {
  transform: scale(1.1);
}

.author-name {
  font-weight: 600;
  font-size: 16px;
  color: #262626;
  cursor: pointer;
  transition: color 0.2s;
}

.author-name:hover {
  color: #1677ff;
}

.meta-details {
  display: flex;
  gap: 24px;
  color: #8c8c8c;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.news-cover-container {
  margin-bottom: 32px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.news-cover {
  width: auto;
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

.news-content {
  font-size: 16px;
  line-height: 1.8;
  color: #262626;
  margin-bottom: 40px;
}

.paragraph {
  margin-bottom: 24px;
}

.content-image-container {
  margin: 24px 0;
  text-align: center;
  overflow: visible;
}

.content-image {
  max-width: 100%;
  width: auto;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  object-fit: contain;
}

.news-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .news-detail-page {
    padding: 16px;
  }

  .news-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .news-title {
    font-size: 24px;
  }
}
</style>
