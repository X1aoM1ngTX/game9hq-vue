<template>
  <div id="userManagePage">
    <div class="header-actions">
      <a-space>
        <a-upload
          :before-upload="handleJsonUpload"
          :show-upload-list="false"
          accept=".json"
        >
          <a-button size="large" type="primary">
            <upload-outlined />
            批量导入用户
          </a-button>
        </a-upload>
        <a-button size="large" type="primary" @click="downloadTemplate">
          <download-outlined />
          下载模板
        </a-button>
      </a-space>
      <a-input-search
        v-model:value="searchValue"
        enter-button="搜索🔍"
        placeholder="输入用户名搜索🔍"
        size="large"
        @search="onSearch"
      />
    </div>
    <a-table :columns="columns" :data-source="data">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'userAvatar'">
          <a-avatar :size="40" :src="record.userAvatar">
            {{ record.userNickname?.charAt(0) || record.userName?.charAt(0) }}
          </a-avatar>
        </template>
        <template v-else-if="column.key === 'userCreatedTime'">
          {{ dayjs(record.userCreatedTime).format("YYYY-MM-DD HH:mm:ss") }}
        </template>
        <template v-else-if="column.key === 'userIsAdmin'">
          <a-tag :color="record.userIsAdmin === 1 ? 'green' : 'blue'">
            {{ record.userIsAdmin === 1 ? "管理员" : "用户" }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button
            style="margin-right: 8px"
            type="primary"
            @click="showEditModal(record)"
          >编辑
          </a-button>
          <a-button danger @click="doDelete(record.userId)">删除</a-button>
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
        v-if="editFormState.userId"
        :model="editFormState"
        layout="vertical"
      >
        <a-form-item
          :rules="[{ required: true, message: '请输入昵称!' }]"
          label="昵称"
          name="userNickname"
        >
          <a-input v-model:value="editFormState.userNickname" />
        </a-form-item>
        <a-form-item
          :rules="[{ required: true, message: '请输入用户名!' }]"
          label="用户名"
          name="userName"
        >
          <a-input v-model:value="editFormState.userName" />
        </a-form-item>
        <a-form-item label="手机号码" name="userPhone">
          <a-input v-model:value="editFormState.userPhone" />
        </a-form-item>
        <a-form-item label="邮箱地址" name="userEmail">
          <a-input
            v-model:value="editFormState.userEmail"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="是否为管理员" name="userIsAdmin">
          <a-switch
            v-model:checked="editFormState.userIsAdmin"
            :checkedValue="1"
            :unCheckedValue="0"
            checked-children="是"
            un-checked-children="否"
            @change="handleSaleStatusChange"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- 批量导入预览模态框 -->
    <a-modal
      v-model:visible="importModalVisible"
      :confirmLoading="importLoading"
      title="批量导入用户"
      @cancel="handleImportCancel"
      @ok="handleImportOk"
    >
      <a-alert
        v-if="importErrors.length > 0"
        :description="importErrors.join('\n')"
        :message="'导入出现以下错误：'"
        show-icon
        style="margin-bottom: 16px"
        type="error"
      />
      <a-table
        :columns="previewColumns"
        :data-source="previewData"
        :scroll="{ y: 300 }"
        size="small"
      />
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import { message, Modal } from "ant-design-vue";
import { adminUpdateUser, batchImportUsers, deleteUser, searchUsers } from "@/api/user";
import { useLoginUserStore } from "@/stores/useLoginUserStore";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons-vue";

const router = useRouter();
const loginUserStore = useLoginUserStore();

onMounted(() => {
  // 检查权限
  if (!loginUserStore.loginUser?.userIsAdmin) {
    router.push("/403");
  }
});

const searchValue = ref("");
const onSearch = () => {
  fetchData(searchValue.value);
};

const doDelete = (userId: string) => {
  if (!userId) {
    return;
  }

  Modal.confirm({
    title: "确认删除",
    content: "确定要删除这个用户吗？此操作不可恢复。",
    okText: "确认",
    cancelText: "取消",
    async onOk() {
      // 用户点击确认后执行
      const res = await deleteUser(userId);
      if (res.data.code === 0) {
        message.success("删除成功");
        await fetchData(searchValue.value);
      } else {
        message.error("删除失败");
      }
    },
    onCancel() {
      // 用户点击取消后执行
      return;
    },
  });
};

const columns = [
  {
    title: "头像",
    key: "userAvatar",
    width: 80,
  },
  {
    title: "用户ID📃",
    dataIndex: "userId",
    key: "userId",
  },
  {
    title: "用户名🙂",
    dataIndex: "userName",
    key: "userName",
  },
  {
    title: "昵称👤",
    dataIndex: "userNickname",
    key: "userNickname",
  },
  {
    title: "电子邮箱📧",
    dataIndex: "userEmail",
    key: "userEmail",
  },
  {
    title: "电话号码📞",
    dataIndex: "userPhone",
    key: "userPhone",
  },
  {
    title: "创建时间⌛️",
    key: "userCreatedTime",
  },
  {
    title: "用户身份♾️",
    key: "userIsAdmin",
  },
  {
    title: "操作🖱",
    key: "action",
  },
];

// 编辑表单状态的类型定义
interface EditFormState {
  userId: string | number;
  userName: string;
  userNickname: string;
  userEmail: string;
  userPhone: string;
  userIsAdmin: number;
}

// 编辑表单状态初始化
const editFormState = reactive<EditFormState>({
  userId: "",
  userName: "",
  userNickname: "",
  userEmail: "",
  userPhone: "",
  userIsAdmin: 0,
});

// 编辑模态框相关状态
const modalVisible = ref(false);
const modalTitle = ref("");

// 编辑方法
const showEditModal = (record: any) => {
  modalTitle.value = "编辑用户信息";
  const formData = {
    ...record,
  };
  Object.assign(editFormState, formData);
  modalVisible.value = true;
};

// 处理模态框确认（编辑游戏）
const handleEditUser = async () => {
  try {
    const updateData = {
      userId: editFormState.userId,
      userName: editFormState.userName,
      userNickname: editFormState.userNickname,
      userEmail: editFormState.userEmail,
      userPhone: editFormState.userPhone,
      userIsAdmin: editFormState.userIsAdmin,
    };

    const res = await adminUpdateUser(updateData);
    if (res.data.code === 0) {
      message.success("更新成功");
      modalVisible.value = false;
      await fetchData(searchValue.value);
    } else {
      message.error(res.data.message || "更新失败");
    }
  } catch (error: unknown) {
    const err = error as { message?: string };
    message.error(`操作失败: ${err.message || "未知错误"}`);
  }
};

// 处理模态框确认
const handleModalOk = async () => {
  if (editFormState.userId) {
    await handleEditUser();
  }
};

// 处理模态框取消，重置表单
const handleModalCancel = () => {
  modalVisible.value = false;
  Object.assign(editFormState, {
    userId: "",
    userName: "",
    userNickname: "",
    userEmail: "",
    userPhone: "",
    userIsAdmin: 0,
  });
};

const data = ref([]);

const fetchData = async (username = "") => {
  const res = await searchUsers({ userName: username });
  if (res.data.data) {
    data.value = res.data.data;
  } else {
    message.error("用户数据获取失败");
  }
};

// 1. 添加 handleSaleStatusChange 函数定义
const handleSaleStatusChange = (checked: boolean) => {
  editFormState.userIsAdmin = checked ? 1 : 0;
};

// 批量导入相关
const importModalVisible = ref(false);
const importLoading = ref(false);
const previewData = ref<any[]>([]);
const importErrors = ref<string[]>([]);

// 预览表格的列定义
const previewColumns = [
  {
    title: "用户名",
    dataIndex: "userName",
    key: "userName",
  },
  {
    title: "邮箱",
    dataIndex: "userEmail",
    key: "userEmail",
  },
  {
    title: "密码",
    dataIndex: "userPassword",
    key: "userPassword",
    customRender: () => "********", // 密码不显示明文
  },
];

// 处理 JSON 文件上传
const handleJsonUpload = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = JSON.parse(e.target?.result as string);
      // 验证数据格式
      if (!Array.isArray(content.users)) {
        message.error("文件格式错误，请使用正确的模板");
        return;
      }

      // 基本验证
      const errors: string[] = [];
      content.users.forEach((user: any, index: number) => {
        if (!user.userName) {
          errors.push(`第 ${index + 1} 条数据缺少用户名`);
        }
        if (!user.userEmail) {
          errors.push(`第 ${index + 1} 条数据缺少邮箱`);
        }
        if (!user.userPassword) {
          errors.push(`第 ${index + 1} 条数据缺少密码`);
        }
        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.userEmail)) {
          errors.push(`第 ${index + 1} 条数据邮箱格式不正确`);
        }
        // 验证密码长度
        if (user.userPassword.length < 6) {
          errors.push(`第 ${index + 1} 条数据密码长度不能小于6位`);
        }
      });

      importErrors.value = errors;
      if (errors.length === 0) {
        previewData.value = content.users;
        importModalVisible.value = true;
      }
    } catch (err) {
      message.error("文件解析失败，请确保是有效的 JSON 文件");
    }
  };
  reader.readAsText(file);
  return false; // 阻止自动上传
};

// 处理批量导入
const handleImportOk = async () => {
  try {
    importLoading.value = true;
    const res = await batchImportUsers(previewData.value);
    if (res.data.code === 0) {
      message.success("导入成功");
      importModalVisible.value = false;
      fetchData(); // 刷新数据
    } else {
      message.error(res.data.message || "导入失败");
    }
  } catch (error) {
    message.error("导入失败，请重试");
  } finally {
    importLoading.value = false;
  }
};

// 处理取消导入
const handleImportCancel = () => {
  importModalVisible.value = false;
  previewData.value = [];
  importErrors.value = [];
};

// 下载模板
const downloadTemplate = () => {
  const template = {
    users: [
      {
        userName: "示例用户1",
        userEmail: "user1@example.com",
        userPassword: "password123",
      },
    ],
  };

  const blob = new Blob([JSON.stringify(template, null, 2)], {
    type: "application/json",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "users-import-template.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

fetchData();
</script>

<style scoped>
#userManagePage {
  padding: 24px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

/* 添加头像列样式 */
:deep(.ant-table-cell .ant-avatar) {
  margin: 0 auto;
  display: block;
}

.ant-upload {
  display: inline-block;
}

:deep(.ant-input-search-button) {
  box-shadow: none !important;
  border-bottom: none !important;
}
</style>
