<template>
  <div class="news-edit-page">
    <div class="news-edit-container">
      <a-card :bordered="false" class="edit-card">
        <div class="page-title">
          {{ isEditMode ? "编辑资讯" : "创建新资讯" }}
        </div>

        <!-- 标题输入 -->
        <a-form-item label="标题">
          <a-input
            v-model:value="newsForm.newsTitle"
            :maxLength="100"
            class="title-input"
            placeholder="请输入标题"
            showCount
          />
        </a-form-item>

        <!-- 封面图上传 -->
        <a-form-item label="封面">
          <div class="cover-upload">
            <a-upload
              v-model:file-list="fileList"
              :before-upload="beforeUpload"
              :show-upload-list="false"
              list-type="picture-card"
              @change="handleCoverChange"
            >
              <div v-if="uploading" class="uploading-container">
                <a-spin />
                <div class="uploading-text">上传中...</div>
              </div>
              <div
                v-else-if="!newsForm.newsCoverImage"
                class="upload-placeholder"
              >
                <plus-outlined />
                <div class="ant-upload-text">上传封面</div>
              </div>
              <img
                v-else
                :src="newsForm.newsCoverImage"
                alt="封面图"
                class="cover-preview"
              />
            </a-upload>
            <div class="upload-tip">建议尺寸：16:9，最大不超过 2MB</div>
          </div>
        </a-form-item>

        <!-- 正文编辑器 -->
        <a-form-item label="正文">
          <a-textarea
            v-model:value="newsForm.newsContent"
            :auto-size="{ minRows: 10, maxRows: 20 }"
            class="content-editor"
            placeholder="请输入正文内容"
          />
        </a-form-item>

        <!-- 摘要输入 -->
        <a-form-item label="摘要">
          <a-textarea
            v-model:value="newsForm.newsSummary"
            :auto-size="{ minRows: 3, maxRows: 6 }"
            :maxLength="200"
            placeholder="请输入摘要，如果不输入将自动提取正文前 200 字"
            showCount
          />
          <div class="form-tip">
            摘要将显示在资讯列表中，帮助用户快速了解资讯内容
          </div>
        </a-form-item>

        <!-- 游戏标签选择 -->
        <a-form-item label="游戏标签">
          <a-select
            v-model:value="newsForm.newsGameTag"
            :options="gameOptions"
            :field-names="{ label: 'gameName', value: 'gameId' }"
            :loading="gamesLoading"
            placeholder="请选择相关游戏（可选）"
            allow-clear
            show-search
            :filter-option="filterGameOption"
            style="width: 100%"
          >
            <template #suffixIcon>
              <game-outlined />
            </template>
          </a-select>
          <div class="form-tip">
            选择相关游戏后，该资讯将在该游戏的标签页中显示
          </div>
        </a-form-item>

        <!-- 自定义标签输入 -->
        <a-form-item label="自定义标签">
          <a-input
            v-model:value="customTagsInput"
            placeholder="输入自定义标签，如：#人工智能 #Java #科技"
            @change="handleCustomTagsChange"
          />
          <div class="custom-tags-preview" v-if="parsedCustomTags.length > 0">
            <a-tag
              v-for="tag in parsedCustomTags"
              :key="tag"
              color="blue"
              class="custom-tag"
            >
              {{ tag }}
            </a-tag>
          </div>
          <div class="form-tip">
            支持输入多个标签，用空格分隔，标签以#开头（如：#人工智能）
          </div>
        </a-form-item>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <a-button @click="goBack">取消</a-button>
          <a-space>
            <a-button v-if="!isPublished" :loading="saving" @click="saveDraft"
              >保存草稿
            </a-button>
            <a-button :loading="publishing" type="primary" @click="publish">
              {{ isEditMode && isPublished ? "更新" : "发布" }}
            </a-button>
          </a-space>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import type { UploadChangeParam } from "ant-design-vue";
import { message } from "ant-design-vue";
import { PlusOutlined, GameOutlined } from "@ant-design/icons-vue";
import { useRoute, useRouter } from "vue-router";
import {
  createNews,
  draftNews,
  getDraftNews,
  getNewsDetail,
  publishNews,
  updateNews,
  uploadImage,
} from "@/api/news";
import { getAllGames, type GameDetailVO } from "@/api/game";

const router = useRouter();
const route = useRoute();
const isEditMode = ref(false);
const newsId = ref<number | null>(null);
const isPublished = ref(false);

// 表单数据
const newsForm = reactive({
  newsTitle: "",
  newsContent: "",
  newsSummary: "",
  newsCoverImage: "",
  newsGameTag: undefined as number | undefined,
  newsCustomTags: "",
});

// 自定义标签相关
const customTagsInput = ref("");
const parsedCustomTags = ref<string[]>([]);

// 上传相关
const fileList = ref([]);
const saving = ref(false);
const publishing = ref(false);
const uploading = ref(false);

// 游戏相关
const gameOptions = ref<GameDetailVO[]>([]);
const gamesLoading = ref(false);

// 加载游戏列表
const loadGames = async () => {
  try {
    gamesLoading.value = true;
    const games = await getAllGames();
    gameOptions.value = games;
  } catch (error) {
    console.error("加载游戏列表失败:", error);
    message.error("加载游戏列表失败");
  } finally {
    gamesLoading.value = false;
  }
};

// 加载资讯数据
const loadNewsData = async (id: number) => {
  try {
    // 判断是否是从草稿编辑进入的
    const isDraft = route.query.draft === "true";
    const response = isDraft ? await getDraftNews(id) : await getNewsDetail(id);

    if (response.data && response.data.code === 0 && response.data.data) {
      const newsData = response.data.data;
      // 填充表单数据
      newsForm.newsTitle = newsData.newsTitle;
      newsForm.newsContent = newsData.newsContent;
      newsForm.newsSummary = newsData.newsSummary || "";
      newsForm.newsCoverImage = newsData.newsCoverImage;
      newsForm.newsGameTag = newsData.newsGameTag || undefined;

      // 处理自定义标签
      if (newsData.newsCustomTags) {
        try {
          const tagsArray = JSON.parse(newsData.newsCustomTags);
          if (Array.isArray(tagsArray)) {
            parsedCustomTags.value = tagsArray;
            customTagsInput.value = tagsArray.join(" ");
          }
        } catch (e) {
          console.error("解析自定义标签失败:", e);
        }
      }

      // 判断资讯是否已发布（根据状态字段）
      // 通常 0: 草稿, 1: 已发布
      isPublished.value = newsData.newsStatus === 1;

      message.success("资讯加载成功");
    } else {
      message.error(response.data?.message || "资讯加载失败");
      router.push("/news");
    }
  } catch (error) {
    console.error("加载资讯失败:", error);
    message.error("加载资讯失败，请重试");
    router.push("/news");
  }
};

// 初始化
onMounted(() => {
  // 加载游戏列表
  loadGames();

  // 检查是否有newsId参数，如果有则是编辑模式
  if (route.params.newsId) {
    isEditMode.value = true;
    newsId.value = Number(route.params.newsId);
    loadNewsData(newsId.value);
  }
});

// 游戏搜索过滤函数
const filterGameOption = (input: string, option: any) => {
  return option.gameName.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

// 自定义标签处理
const handleCustomTagsChange = () => {
  const input = customTagsInput.value.trim();
  if (!input) {
    parsedCustomTags.value = [];
    newsForm.newsCustomTags = "";
    return;
  }

  // 使用正则表达式匹配 #标签
  const tagRegex = /#([a-zA-Z0-9_\u4e00-\u9fa5]+)/g;
  const matches = [];
  let match;

  while ((match = tagRegex.exec(input)) !== null) {
    const tag = "#" + match[1];
    if (tag.length <= 21) {
      // 限制标签长度
      matches.push(tag);
    }
  }

  parsedCustomTags.value = [...new Set(matches)]; // 去重
  newsForm.newsCustomTags = parsedCustomTags.value.join(" ");
};

// 获取图片预览
const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// 上传前校验
const beforeUpload = (file: File) => {
  // 检查文件类型
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    message.error("只能上传图片文件！");
    return false;
  }

  // 检查文件大小
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("图片必须小于 2MB！");
    return false;
  }

  return true;
};

// 处理封面图变化
const handleCoverChange = async (info: UploadChangeParam) => {
  if (info.file.status === "uploading") {
    uploading.value = true;
    return;
  }

  if (info.file.status === "done") {
    uploading.value = false;
  }

  if (info.file.originFileObj) {
    try {
      // 预览图片
      const base64 = await getBase64(info.file.originFileObj);

      // 创建 FormData 对象并添加文件
      const formData = new FormData();
      formData.append("file", info.file.originFileObj);

      uploading.value = true;

      // 调用上传接口
      const response = await uploadImage(formData);

      // 从响应中获取图片 URL
      if (response.data && response.data.code === 0 && response.data.data) {
        newsForm.newsCoverImage = response.data.data;
        message.success("上传成功");
      } else {
        throw new Error(response.data?.message || "上传失败");
      }
    } catch (error) {
      console.error("上传失败:", error);
      message.error(error instanceof Error ? error.message : "上传失败");
    } finally {
      uploading.value = false;
    }
  }
};

// 保存草稿
const saveDraft = async () => {
  if (!validateForm()) return;

  saving.value = true;
  try {
    let response;
    let newsIdToSave = null;

    if (isEditMode.value && newsId.value) {
      // 更新现有资讯
      response = await updateNews({
        newsId: newsId.value,
        ...newsForm,
      });
      newsIdToSave = newsId.value;
    } else {
      // 创建新资讯
      response = await createNews({
        ...newsForm,
      });

      if (response.data?.code === 0 && response.data?.data?.newsId) {
        newsIdToSave = response.data.data.newsId;
      }
    }

    // 处理返回结果
    if (response.data && response.data.code === 0) {
      // 如果是编辑模式且成功更新，调用设为草稿API
      if (newsIdToSave) {
        try {
          await draftNews(newsIdToSave);
          message.success("保存草稿成功");
          router.push("/news");
        } catch (draftError) {
          console.error("设置草稿状态失败:", draftError);
          // 即使设置草稿状态失败，还是认为保存成功了
          message.success("内容已保存，但设置草稿状态失败");
          router.push("/news");
        }
      } else {
        message.success("保存草稿成功");
        router.push("/news");
      }
    } else {
      message.error(response.data?.message || "保存失败");
    }
  } catch (error) {
    console.error("保存失败:", error);
    message.error("保存失败");
  } finally {
    saving.value = false;
  }
};

// 发布资讯
const publish = async () => {
  if (!validateForm()) return;

  publishing.value = true;
  try {
    let newsIdToPublish = newsId.value;

    // 如果不是编辑模式，需要先创建资讯
    if (!isEditMode.value || !newsIdToPublish) {
      // 先创建资讯
      const createResponse = await createNews({
        ...newsForm,
      });

      console.log("创建资讯响应:", createResponse);

      if (
        createResponse.data?.code === 0 &&
        createResponse.data?.data !== undefined
      ) {
        // 从响应中获取资讯ID，后端返回的是 BaseResponse<Long> 格式
        newsIdToPublish = createResponse.data.data;
        console.log("获取到资讯ID:", newsIdToPublish);

        if (!newsIdToPublish || newsIdToPublish <= 0) {
          throw new Error("获取的资讯ID无效");
        }

        // 创建成功后立即发布
        const publishResponse = await publishNews(newsIdToPublish);
        console.log("发布资讯响应:", publishResponse);

        if (publishResponse.data?.code === 0) {
          message.success("发布成功");
        } else if (
          publishResponse.data?.message &&
          (publishResponse.data.message.includes("资讯已发布") ||
            publishResponse.data.message.includes("已经发布"))
        ) {
          message.success("发布成功");
        } else {
          throw new Error(publishResponse.data?.message || "发布失败");
        }
      } else {
        throw new Error(createResponse.data?.message || "创建资讯失败");
      }
    } else {
      // 如果是编辑模式，先更新资讯
      const updateResponse = await updateNews({
        newsId: newsIdToPublish,
        ...newsForm,
      });

      console.log("更新资讯响应:", updateResponse);

      if (updateResponse.data?.code !== 0) {
        throw new Error(updateResponse.data?.message || "更新资讯失败");
      }

      // 如果不是已发布状态，则需要调用发布API
      if (!isPublished.value) {
        // 发布资讯
        const publishResponse = await publishNews(newsIdToPublish);
        console.log("发布资讯响应:", publishResponse);

        if (publishResponse.data?.code === 0) {
          message.success("发布成功");
        } else if (
          publishResponse.data?.message &&
          (publishResponse.data.message.includes("资讯已发布") ||
            publishResponse.data.message.includes("已经发布"))
        ) {
          message.success("发布成功");
        } else {
          throw new Error(publishResponse.data?.message || "发布失败");
        }
      } else {
        message.success("更新成功");
      }
    }

    router.push("/news");
  } catch (error) {
    console.error("发布/更新失败:", error);
    message.error(error instanceof Error ? error.message : "操作失败");
  } finally {
    publishing.value = false;
  }
};

// 表单验证
const validateForm = () => {
  if (!newsForm.newsTitle.trim()) {
    message.error("请输入标题");
    return false;
  }
  if (!newsForm.newsContent.trim()) {
    message.error("请输入正文内容");
    return false;
  }
  return true;
};

// 返回列表
const goBack = () => {
  router.push("/news");
};
</script>

<style scoped>
.news-edit-page {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}

.news-edit-container {
  max-width: 900px;
  margin: 0 auto;
}

.edit-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}

.title-input {
  font-size: 18px;
}

.cover-upload {
  display: flex;
  flex-direction: column;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-tip,
.form-tip {
  margin-top: 8px;
  color: #999;
  font-size: 12px;
}

.content-editor {
  border-radius: 4px;
  font-size: 15px;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.uploading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.uploading-text {
  margin-top: 8px;
  color: #1890ff;
}

:deep(.ant-form-item) {
  margin-bottom: 24px;
}

:deep(.ant-form-item-label) {
  font-weight: 500;
}

.custom-tags-preview {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.custom-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}
</style>
