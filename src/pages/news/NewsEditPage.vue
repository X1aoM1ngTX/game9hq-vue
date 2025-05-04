<template>
  <div class="edit-news-page">
    <div class="edit-container">
      <a-card :bordered="false" class="edit-card">
        <div class="page-title">
          {{ isEditMode ? "编辑资讯" : "创建新资讯" }}
        </div>

        <!-- 标题输入 -->
        <a-form-item label="标题">
          <a-input
            v-model:value="newsForm.newsTitle"
            placeholder="请输入标题"
            class="title-input"
            :maxLength="100"
            showCount
          />
        </a-form-item>

        <!-- 封面图上传 -->
        <a-form-item label="封面">
          <div class="cover-upload">
            <a-upload
              v-model:file-list="fileList"
              list-type="picture-card"
              :show-upload-list="false"
              :before-upload="beforeUpload"
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
            placeholder="请输入正文内容"
            :auto-size="{ minRows: 10, maxRows: 20 }"
            class="content-editor"
          />
        </a-form-item>

        <!-- 摘要输入 -->
        <a-form-item label="摘要">
          <a-textarea
            v-model:value="newsForm.newsSummary"
            placeholder="请输入摘要，如果不输入将自动提取正文前 200 字"
            :auto-size="{ minRows: 3, maxRows: 6 }"
            :maxLength="200"
            showCount
          />
          <div class="form-tip">
            摘要将显示在资讯列表中，帮助用户快速了解资讯内容
          </div>
        </a-form-item>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <a-button @click="goBack">取消</a-button>
          <a-space>
            <a-button @click="saveDraft" :loading="saving" v-if="!isPublished"
              >保存草稿</a-button
            >
            <a-button type="primary" @click="publish" :loading="publishing">
              {{ isEditMode && isPublished ? "更新" : "发布" }}
            </a-button>
          </a-space>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { useRouter, useRoute } from "vue-router";
import type { UploadChangeParam } from "ant-design-vue";
import {
  createNews,
  publishNews,
  uploadImage,
  getNewsDetail,
  getDraftNews,
  updateNews,
  draftNews,
} from "@/api/news";

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
});

// 上传相关
const fileList = ref([]);
const saving = ref(false);
const publishing = ref(false);
const uploading = ref(false);

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
  // 检查是否有newsId参数，如果有则是编辑模式
  if (route.params.newsId) {
    isEditMode.value = true;
    newsId.value = Number(route.params.newsId);
    loadNewsData(newsId.value);
  }
});

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
    } else if (
      response.data &&
      response.data.message &&
      (response.data.message.includes("资讯已发布") ||
        response.data.message.includes("已经发布"))
    ) {
      // 当错误信息包含"资讯已发布"时，尝试转为草稿
      if (newsIdToSave) {
        try {
          // 尝试设置为草稿状态
          const draftResponse = await draftNews(newsIdToSave);
          if (draftResponse.data?.code === 0) {
            message.success("已将发布的资讯转为草稿状态");
            router.push("/news");
          } else {
            // 如果无法转为草稿（可能后端有限制），则告知用户
            message.info("内容已更新，但该资讯已发布无法设为草稿");
            router.push("/news");
          }
        } catch (draftError) {
          console.error("设置草稿状态失败:", draftError);
          message.info("内容已更新，但无法设为草稿状态");
          router.push("/news");
        }
      } else {
        message.success("内容已更新");
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

      if (
        createResponse.data?.code === 0 &&
        createResponse.data?.data?.newsId
      ) {
        newsIdToPublish = createResponse.data.data.newsId;
      } else {
        throw new Error(createResponse.data?.message || "创建资讯失败");
      }
    } else {
      // 如果是编辑模式，先更新资讯
      const updateResponse = await updateNews({
        newsId: newsIdToPublish,
        ...newsForm,
      });

      // 处理已发布资讯特殊情况
      if (
        updateResponse.data?.code === 0 ||
        (updateResponse.data?.message &&
          (updateResponse.data.message.includes("资讯已发布") ||
            updateResponse.data.message.includes("已经发布")))
      ) {
        // 更新成功或资讯已发布
        console.log("资讯更新成功");

        // 如果已经是发布状态，直接提示更新成功并返回
        if (isPublished.value) {
          message.success("更新成功");
          router.push("/news");
          publishing.value = false;
          return;
        }
      } else {
        throw new Error(updateResponse.data?.message || "更新资讯失败");
      }
    }

    // 如果不是已发布状态，则需要调用发布API
    if (!isPublished.value) {
      // 发布资讯
      const publishResponse = await publishNews(newsIdToPublish);

      // 处理已发布情况
      if (publishResponse.data?.code === 0) {
        message.success("发布成功");
      } else if (
        publishResponse.data?.message &&
        (publishResponse.data.message.includes("资讯已发布") ||
          publishResponse.data.message.includes("已经发布"))
      ) {
        // 对于已经发布的资讯，这是正常的情况，应该显示更新成功
        message.success("更新已发布资讯成功");
      } else {
        throw new Error(publishResponse.data?.message || "发布失败");
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
.edit-news-page {
  padding: 24px;
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}

.edit-container {
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
</style>
