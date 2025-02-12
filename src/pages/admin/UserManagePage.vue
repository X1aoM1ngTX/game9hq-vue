<template>
  <div id="userManagePage">
    <div class="header-actions">
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
        <template v-if="column.key === 'userCreatedTime'">
          {{ dayjs(record.userCreatedTime).format("YYYY-MM-DD HH:mm:ss") }}
        </template>
        <template v-else-if="column.key === 'userIsAdmin'">
          <a-tag :color="record.userIsAdmin === 1 ? 'green' : 'blue'">
            {{ record.userIsAdmin === 1 ? "管理员" : "用户" }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button
            type="primary"
            @click="showEditModal(record)"
            style="margin-right: 8px"
            >编辑
          </a-button>
          <a-button danger @click="doDelete(record.userId)">删除</a-button>
        </template>
      </template>
    </a-table>
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :destroyOnClose="true"
    >
      <a-form
        v-if="editFormState.userId"
        :model="editFormState"
        layout="vertical"
      >
        <a-form-item
          label="用户名"
          name="userName"
          :rules="[{ required: true, message: '请输入用户名!' }]"
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
  </div>
</template>

<script lang="ts" setup>
import { adminUpdateUser, deleteUser, searchUsers } from "@/api/user";
import { reactive, ref } from "vue";
import { message, Modal } from "ant-design-vue";
import dayjs from "dayjs";

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
  userEmail: string;
  userPhone: string;
  userIsAdmin: number;
}

// 编辑表单状态初始化
const editFormState = reactive<EditFormState>({
  userId: "",
  userName: "",
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
    const updateData: Partial<EditFormState> = {
      userId: editFormState.userId,
      userName: editFormState.userName,
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
  } catch (error) {
    message.error(`操作失败: ${error.message || "未知错误"}`);
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
    userEmail: "",
    userPhone: "",
    userIsAdmin: "",
  });
};

const data = ref([]);

const fetchData = async (username = "") => {
  const res = await searchUsers(username);
  if (res.data.data) {
    data.value = res.data.data;
  } else {
    message.error("用户数据获取失败");
  }
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
}
</style>
