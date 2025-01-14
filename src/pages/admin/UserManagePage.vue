<template>
  <div id="userManagePage">
    <a-input-search
      v-model:value="searchValue"
      enter-button="搜索🔍"
      placeholder="输入用户名搜索🔍"
      size="large"
      @search="onSearch"
    />
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
          <a-button danger @click="doDelete(record.userId)">删除</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { deleteUser, searchUsers } from "@/api/user";
import { ref } from "vue";
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

<style scoped></style>
