<template>
  <div id="noticeManagePage">
    <div class="header-actions">
      <a-space>
        <a-button size="large" type="primary" @click="showAddModal">
          发布公告
        </a-button>
      </a-space>
      <a-input-search
        style="border-radius: 0 8px 8px 0"
        v-model:value="searchValue"
        enter-button="搜索🔍"
        placeholder="输入公告标题搜索🔍"
        size="large"
        @search="onSearch"
      />
    </div>

    <a-table :columns="columns" :data-source="data" row-key="noticeId">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'noticeType'">
          <a-tag :color="getNoticeTypeColor(record.noticeType)">
            {{ getNoticeTypeText(record.noticeType) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'noticeStatus'">
          <a-tag :color="getStatusColor(record.noticeStatus)">
            {{ getStatusText(record.noticeStatus) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'noticeCreateTime'">
          {{
            record.noticeCreateTime
              ? dayjs(record.noticeCreateTime).format("YYYY-MM-DD HH:mm:ss")
              : "-"
          }}
        </template>
        <template v-else-if="column.key === 'noticePublishTime'">
          {{
            record.noticePublishTime
              ? dayjs(record.noticePublishTime).format("YYYY-MM-DD HH:mm:ss")
              : "-"
          }}
        </template>
        <template v-else-if="column.key === 'noticeExpireTime'">
          {{
            record.noticeExpireTime
              ? dayjs(record.noticeExpireTime).format("YYYY-MM-DD HH:mm:ss")
              : "-"
          }}
        </template>
        <template v-else-if="column.key === 'noticeCreatorId'">
          {{ getUserName(record.noticeCreatorId) }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space :direction="'vertical'">
            <a-button type="primary" @click="showEditModal(record)"
              >编辑
            </a-button>
            <a-button
              :type="
                record.noticeStatus === NoticeStatus.PUBLISHED
                  ? 'default'
                  : 'primary'
              "
              @click="toggleStatus(record)"
            >
              {{
                record.noticeStatus === NoticeStatus.PUBLISHED ? "下架" : "发布"
              }}
            </a-button>
            <a-button danger @click="doDelete(record.noticeId)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:visible="modalVisible"
      :destroyOnClose="true"
      :title="modalTitle"
      @cancel="handleModalCancel"
      @ok="handleModalOk"
    >
      <a-form
        v-if="editFormState.noticeId"
        :model="editFormState"
        layout="vertical"
      >
        <a-form-item
          :rules="[{ required: true, message: '请输入公告标题!' }]"
          label="公告标题"
          name="noticeTitle"
        >
          <a-input v-model:value="editFormState.noticeTitle" />
        </a-form-item>

        <a-form-item
          :rules="[{ required: true, message: '请选择公告类型!' }]"
          label="公告类型"
          name="noticeType"
        >
          <a-select v-model:value="editFormState.noticeType">
            <a-select-option :value="NoticeType.NORMAL"
              >普通公告
            </a-select-option>
            <a-select-option :value="NoticeType.IMPORTANT"
              >重要公告
            </a-select-option>
            <a-select-option :value="NoticeType.SYSTEM"
              >系统公告
            </a-select-option>
            <a-select-option :value="NoticeType.ACTIVITY"
              >活动公告
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          :rules="[{ required: true, message: '请输入公告内容!' }]"
          label="公告内容"
          name="noticeContent"
        >
          <a-textarea v-model:value="editFormState.noticeContent" :rows="6" />
        </a-form-item>

        <a-form-item label="过期时间" name="noticeExpireTime">
          <a-date-picker
            v-model:value="editFormState.noticeExpireTime"
            :show-time="true"
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>

      <a-form v-else :model="addFormState" layout="vertical">
        <a-form-item
          :rules="[{ required: true, message: '请输入公告标题!' }]"
          label="公告标题"
          name="noticeTitle"
        >
          <a-input v-model:value="addFormState.noticeTitle" />
        </a-form-item>

        <a-form-item
          :rules="[{ required: true, message: '请选择公告类型!' }]"
          label="公告类型"
          name="noticeType"
        >
          <a-select v-model:value="addFormState.noticeType">
            <a-select-option :value="NoticeType.NORMAL"
              >普通公告
            </a-select-option>
            <a-select-option :value="NoticeType.IMPORTANT"
              >重要公告
            </a-select-option>
            <a-select-option :value="NoticeType.SYSTEM"
              >系统公告
            </a-select-option>
            <a-select-option :value="NoticeType.ACTIVITY"
              >活动公告
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          :rules="[{ required: true, message: '请输入公告内容!' }]"
          label="公告内容"
          name="noticeContent"
        >
          <a-textarea v-model:value="addFormState.noticeContent" :rows="6" />
        </a-form-item>

        <a-form-item label="过期时间" name="noticeExpireTime">
          <a-date-picker
            v-model:value="addFormState.noticeExpireTime"
            :show-time="true"
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import { message, Modal } from "ant-design-vue";
import { useLoginUserStore } from "@/stores/useLoginUserStore";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import {
  createNotice,
  deleteNotice,
  draftNotice,
  getNoticeList,
  type INotice,
  type INoticeCreateRequest,
  type INoticeQueryParams,
  type INoticeUpdateRequest,
  NoticeStatus,
  NoticeType,
  publishNotice,
  updateNotice,
} from "@/api/notice";
import { getUserById } from "@/api/user";

const router = useRouter();
const loginUserStore = useLoginUserStore();

// 检查管理员权限
onMounted(() => {
  if (!loginUserStore.loginUser?.userIsAdmin) {
    router.push("/403");
  }
  fetchData();
});

// 搜索相关
const searchValue = ref("");
const onSearch = () => {
  fetchData();
};

// 表格列定义
const columns = [
  {
    title: "公告ID",
    dataIndex: "noticeId",
    key: "noticeId",
  },
  {
    title: "公告标题",
    dataIndex: "noticeTitle",
    key: "noticeTitle",
  },
  {
    title: "公告类型",
    dataIndex: "noticeType",
    key: "noticeType",
  },
  {
    title: "发布状态",
    dataIndex: "noticeStatus",
    key: "noticeStatus",
  },
  {
    title: "创建者ID",
    dataIndex: "noticeCreatorId",
    key: "noticeCreatorId",
  },
  {
    title: "创建时间",
    dataIndex: "noticeCreateTime",
    key: "noticeCreateTime",
  },
  {
    title: "发布时间",
    dataIndex: "noticePublishTime",
    key: "noticePublishTime",
  },
  {
    title: "过期时间",
    dataIndex: "noticeExpireTime",
    key: "noticeExpireTime",
  },
  {
    title: "操作",
    key: "action",
  },
];

// 表格数据
const data = ref<INotice[]>([]);

interface ResponseData<T> {
  code: number;
  message: string;
  data: T;
}

interface PageData<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// 添加用户映射和获取用户信息的方法
const userMap = ref<Record<string, any>>({});

// 获取用户信息的方法
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
const fetchData = async (searchTitle?: string) => {
  try {
    const params: INoticeQueryParams = {
      pageNum: 1,
      pageSize: 100,
    };

    // 如果有搜索标题，添加到查询参数
    if (searchTitle) {
      params.title = searchTitle;
    }

    const res = await getNoticeList(params);
    console.log("获取公告响应:", res);

    // 先转为 unknown 类型再断言
    const responseData = res.data as unknown as ResponseData<
      PageData<INotice> | INotice[]
    >;

    if (responseData && responseData.code === 0) {
      if (responseData.data) {
        // 检查是否是分页数据
        if ("records" in responseData.data) {
          data.value = responseData.data.records;
        }
        // 检查是否直接是数组
        else if (Array.isArray(responseData.data)) {
          data.value = responseData.data;
        } else {
          data.value = [];
        }

        // 获取所有公告的创建者信息
        for (const notice of data.value) {
          if (notice.noticeCreatorId) {
            await fetchUserInfo(notice.noticeCreatorId);
          }
        }
      } else {
        data.value = [];
      }
    } else {
      message.error(responseData?.message || "获取公告失败");
      data.value = [];
    }
  } catch (error) {
    message.error("获取公告列表失败");
    data.value = [];
  }
};

// 删除公告
const doDelete = (noticeId: number) => {
  Modal.confirm({
    title: "确认删除",
    content: "确定要删除这条公告吗？此操作不可恢复。",
    okText: "确认",
    cancelText: "取消",
    async onOk() {
      try {
        await deleteNotice(noticeId);
        message.success("删除成功");
        // 本地删除数据，避免重新请求整个列表
        removeLocalNoticeData(noticeId);
      } catch (error) {
        console.error("删除公告失败:", error);
        message.error("删除失败");
      }
    },
  });
};

// 切换公告状态
const toggleStatus = async (record: INotice) => {
  if (!record.noticeId) {
    message.error("公告ID不存在");
    return;
  }

  try {
    if (record.noticeStatus === NoticeStatus.PUBLISHED) {
      await draftNotice(record.noticeId);
    } else {
      await publishNotice(record.noticeId);
    }
    message.success(
      record.noticeStatus === NoticeStatus.PUBLISHED ? "下架成功" : "发布成功"
    );
    // 本地更新公告状态，避免重新请求整个列表
    updateLocalNoticeStatus(
      record.noticeId,
      record.noticeStatus === NoticeStatus.PUBLISHED
        ? NoticeStatus.DRAFT
        : NoticeStatus.PUBLISHED
    );
  } catch (error) {
    console.error("更新公告状态失败:", error);
    message.error("操作失败");
  }
};

// 模态框相关
const modalVisible = ref(false);
const modalTitle = ref("");

// 新增表单状态
interface AddFormState {
  noticeTitle: string;
  noticeContent: string;
  noticeType: NoticeType;
  noticeExpireTime: dayjs.Dayjs | null;
}

const addFormState = reactive<AddFormState>({
  noticeTitle: "",
  noticeContent: "",
  noticeType: NoticeType.NORMAL,
  noticeExpireTime: null,
});

// 编辑表单状态
interface EditFormState {
  noticeId: number;
  noticeTitle: string;
  noticeContent: string;
  noticeType: NoticeType;
  noticeExpireTime: dayjs.Dayjs | null;
}

const editFormState = reactive<EditFormState>({
  noticeId: 0,
  noticeTitle: "",
  noticeContent: "",
  noticeType: NoticeType.NORMAL,
  noticeExpireTime: null,
});

// 显示新增模态框
const showAddModal = () => {
  modalTitle.value = "添加公告";
  Object.assign(addFormState, {
    noticeTitle: "",
    noticeContent: "",
    noticeType: NoticeType.NORMAL,
    noticeExpireTime: null,
  });
  modalVisible.value = true;
};

// 显示编辑模态框
const showEditModal = (record: INotice) => {
  modalTitle.value = "编辑公告";
  Object.assign(editFormState, {
    noticeId: record.noticeId,
    noticeTitle: record.noticeTitle,
    noticeContent: record.noticeContent,
    noticeType: record.noticeType,
    noticeExpireTime: record.noticeExpireTime
      ? dayjs(record.noticeExpireTime)
      : null,
  });
  modalVisible.value = true;
};

// 处理模态框确认
const handleModalOk = async () => {
  try {
    const formData = editFormState.noticeId
      ? {
          noticeId: editFormState.noticeId,
          noticeTitle: editFormState.noticeTitle,
          noticeContent: editFormState.noticeContent,
          noticeType: editFormState.noticeType,
          noticeExpireTime:
            editFormState.noticeExpireTime?.toISOString() || null,
        }
      : {
          noticeTitle: addFormState.noticeTitle,
          noticeContent: addFormState.noticeContent,
          noticeType: addFormState.noticeType,
          noticeExpireTime:
            addFormState.noticeExpireTime?.toISOString() || null,
        };

    if (editFormState.noticeId) {
      console.log("更新公告请求参数:", editFormState.noticeId, formData);
      const response = await updateNotice(
        editFormState.noticeId,
        formData as INoticeUpdateRequest
      );
      console.log("更新公告响应:", response);
      message.success("更新成功");
    } else {
      await createNotice(formData as INoticeCreateRequest);
      message.success("创建成功");
    }

    modalVisible.value = false;
    // 本地更新数据，避免重新请求整个列表
    updateLocalNoticeData(formData);
  } catch (error) {
    console.error("操作失败:", error);
    message.error("操作失败");
  }
};

// 处理模态框取消
const handleModalCancel = () => {
  modalVisible.value = false;
};

// 获取公告类型颜色
const getNoticeTypeColor = (type: NoticeType): string => {
  const typeColors: Record<number, string> = {
    [NoticeType.NORMAL]: "blue",
    [NoticeType.IMPORTANT]: "red",
    [NoticeType.SYSTEM]: "orange",
    [NoticeType.ACTIVITY]: "green",
  };
  return typeColors[type] || "default";
};

// 获取公告类型文本
const getNoticeTypeText = (type: NoticeType): string => {
  const typeTexts: Record<number, string> = {
    [NoticeType.NORMAL]: "普通公告",
    [NoticeType.IMPORTANT]: "重要公告",
    [NoticeType.SYSTEM]: "系统公告",
    [NoticeType.ACTIVITY]: "活动公告",
  };
  return typeTexts[type] || "其他";
};

// 获取状态颜色
const getStatusColor = (status: NoticeStatus): string => {
  const statusColors: Record<number, string> = {
    [NoticeStatus.DRAFT]: "orange",
    [NoticeStatus.PUBLISHED]: "green",
    [NoticeStatus.EXPIRED]: "red",
  };
  return statusColors[status] || "default";
};

// 获取状态文本
const getStatusText = (status: NoticeStatus): string => {
  const statusTexts: Record<number, string> = {
    [NoticeStatus.DRAFT]: "草稿",
    [NoticeStatus.PUBLISHED]: "已发布",
    [NoticeStatus.EXPIRED]: "已过期",
  };
  return statusTexts[status] || "未知";
};

// 本地更新公告数据，避免重新请求整个列表
const updateLocalNoticeData = (updateData: any) => {
  const index = data.value.findIndex(
    (notice) => notice.noticeId === updateData.noticeId
  );
  if (index !== -1) {
    // 创建新对象，保持响应性
    data.value[index] = {
      ...data.value[index],
      noticeTitle: updateData.noticeTitle,
      noticeContent: updateData.noticeContent,
      noticeType: updateData.noticeType,
      noticeExpireTime: updateData.noticeExpireTime,
    };
  }
};

// 本地更新公告状态，避免重新请求整个列表
const updateLocalNoticeStatus = (noticeId: number, status: number) => {
  const index = data.value.findIndex((notice) => notice.noticeId === noticeId);
  if (index !== -1) {
    // 创建新对象，保持响应性
    data.value[index] = {
      ...data.value[index],
      noticeStatus: status,
      noticePublishTime:
        status === NoticeStatus.PUBLISHED ? new Date().toISOString() : null,
    };
  }
};

// 本地删除公告数据，避免重新请求整个列表
const removeLocalNoticeData = (noticeId: number) => {
  const index = data.value.findIndex((notice) => notice.noticeId === noticeId);
  if (index !== -1) {
    // 使用 splice 保持响应性
    data.value.splice(index, 1);
  }
};

// 获取用户名的方法
const getUserName = (userId: number): string => {
  if (!userId) return "未知用户";
  const user = userMap.value[userId];
  return user
    ? user.userNickname || user.userName || `用户 ${userId}`
    : `用户 ${userId}`;
};
</script>

<style scoped>
#noticeManagePage {
  padding: 24px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

:deep(.ant-form-item) {
  margin-bottom: 24px;
}

:deep(.ant-modal-body) {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

:deep(.ant-input-search) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.ant-input) {
  border-radius: 8px;
  height: 40px !important;
}

:deep(.ant-input-search-button) {
  border-radius: 0 8px 8px 0 !important;
  height: 40px !important;
}

:deep(.ant-input-search-button) {
  box-shadow: none !important;
  border-bottom: none !important;
}
</style>
