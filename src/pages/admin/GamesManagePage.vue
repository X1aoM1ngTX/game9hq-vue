<template>
  <div id="gamesManagePage">
    <div class="header-actions">
      <a-button
        type="primary"
        size="large"
        style="margin-right: 16px"
        @click="showAddModal"
      >
        添加游戏
      </a-button>
      <a-input-search
        v-model:value="searchValue"
        enter-button="搜索🔍"
        placeholder="输入游戏名搜索🔍"
        size="large"
        @search="onSearch"
      />
    </div>
    <a-table :columns="columns" :data-source="data">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'gameIsRemoved'">
          <a-tag :color="record.gameIsRemoved === true ? 'red' : 'green'">
            {{ record.gameIsRemoved === true ? "已下架" : "已上架" }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'gamePrice'">
          <a-tag :color="record.gamePrice === 0 ? 'blue' : 'default'">
            {{ record.gamePrice === 0 ? "免费" : record.gamePrice + "￥" }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'gameCover'">
          <img
            v-lazy="record.gameCover"
            style="width: 50px; height: 50px; object-fit: cover"
            alt="gameCover"
          />
        </template>
        <template v-else-if="column.key === 'gameDiscountedPrices'">
          <template v-if="record.gameOnSale !== 0">
            <a-tag :color="record.gameOnSale === 0 ? 'default' : 'green'">
              {{ record.gameDiscountedPrices + "￥" }}
            </a-tag>
          </template>
        </template>
        <template v-else-if="column.key === 'gameOnSale'">
          <template v-if="record.gamePrice == 0">
            <a-tag :color="'blue'">
              {{ "免费" }}
            </a-tag>
          </template>
          <template v-else>
            <template v-if="record.gameOnSale !== 0">
              <a-tag :color="'green'">
                {{ "-" + (record.gameDiscount * 100).toFixed(1) + "%" }}
              </a-tag>
            </template>
            <template v-if="record.gameOnSale == 0">
              <a-tag :color="'default'">
                {{ "无折扣" }}
              </a-tag>
            </template>
          </template>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space :direction="'vertical'">
            <a-button type="primary" @click="showEditModal(record)"
              >编辑
            </a-button>
            <a-button type="default" @click="toggleStatus(record)">
              {{ record.gameIsRemoved === true ? "上架" : "下架" }}
            </a-button>
            <a-button danger @click="doDelete(record.gameId)">删除</a-button>
          </a-space>
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
        v-if="editFormState.gameId"
        :model="editFormState"
        layout="vertical"
      >
        <a-form-item
          label="游戏名称"
          name="gameName"
          :rules="[{ required: true, message: '请输入游戏名称!' }]"
        >
          <a-input v-model:value="editFormState.gameName" />
        </a-form-item>
        <a-form-item label="游戏封面" name="gameCover">
          <a-upload
            v-model:file-list="fileList"
            name="file"
            list-type="picture-card"
            class="avatar-uploader"
            :show-upload-list="false"
            action="http://localhost:8080/api/game/upload"
            :before-upload="beforeUpload"
            :headers="getHeaders()"
            @change="handleChange"
            withCredentials="true"
          >
            <img v-if="imageUrl" :src="imageUrl" alt="gameCover" />
            <div v-else>
              <loading-outlined v-if="loading"></loading-outlined>
              <plus-outlined v-else></plus-outlined>
              <div class="ant-upload-text">上传</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item label="游戏描述" name="gameDescription">
          <a-textarea v-model:value="editFormState.gameDescription" />
        </a-form-item>
        <a-form-item
          label="游戏价格"
          name="gamePrice"
          :rules="[{ required: true, message: '请输入游戏价格!' }]"
        >
          <a-input-number
            v-model:value="editFormState.gamePrice"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item
          label="游戏库存"
          name="gameStock"
          :rules="[{ required: true, message: '请输入游戏库存!' }]"
        >
          <a-input-number
            v-model:value="editFormState.gameStock"
            :min="0"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="游戏发行商" name="gamePub">
          <a-input v-model:value="editFormState.gamePub" />
        </a-form-item>
        <a-form-item label="游戏开发商" name="gameDev">
          <a-input v-model:value="editFormState.gameDev" />
        </a-form-item>
        <a-form-item label="发行日期" name="gameReleaseDate">
          <a-date-picker
            v-model:value="editFormState.gameReleaseDate"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="是否打折" name="gameOnSale">
          <a-switch
            v-model:checked="editFormState.gameOnSale"
            :checkedValue="true"
            :unCheckedValue="false"
            checked-children="是"
            un-checked-children="否"
            @change="handleSaleStatusChange"
          />
        </a-form-item>
        <a-form-item label="游戏折扣开始时间" name="gameSaleStartTime">
          <a-date-picker
            v-model:value="editFormState.gameSaleStartTime"
            :show-time="true"
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
            @change="handleStartTimeChange"
          />
        </a-form-item>
        <a-form-item
          label="游戏折扣结束时间"
          name="gameSaleEndTime"
          :rules="[
            { validator: validateEndTime, message: '结束时间不能早于开始时间' },
          ]"
        >
          <a-date-picker
            v-model:value="editFormState.gameSaleEndTime"
            :show-time="true"
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item
          label="游戏折扣"
          name="gameDiscount"
          :rules="[
            { required: true, message: '请输入游戏折扣!' },
            { type: 'number', min: 0, max: 1, message: '折扣必须在0-1之间!' },
          ]"
        >
          <a-input-number
            v-model:value="editFormState.gameDiscount"
            :min="0"
            :max="1"
            :step="0.1"
            :precision="2"
            style="width: 100%"
            placeholder="输入0.2表示打8折"
            @change="handleDiscountChange"
          />
        </a-form-item>
      </a-form>
      <a-form v-else :model="addFormState" layout="vertical">
        <a-form-item
          label="游戏名称"
          name="gameName"
          :rules="[{ required: true, message: '请输入游戏名称!' }]"
        >
          <a-input v-model:value="addFormState.gameName" />
        </a-form-item>
        <a-form-item
          label="游戏价格"
          name="gamePrice"
          :rules="[{ required: true, message: '请输入游戏价格!' }]"
        >
          <a-input-number
            v-model:value="addFormState.gamePrice"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item
          label="游戏库存"
          name="gameStock"
          :rules="[{ required: true, message: '请输入游戏库存!' }]"
        >
          <a-input-number
            v-model:value="addFormState.gameStock"
            :min="0"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
// 导入所需的组件和函数
import { h, reactive, ref } from "vue";
import type { UploadChangeParam, UploadProps } from "ant-design-vue";
import { message, Modal } from "ant-design-vue";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons-vue";
import {
  createGame,
  deleteGame,
  searchGames,
  updateGame,
  updateGameStatus,
} from "@/api/game";
// 导入日期处理库
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

// 设置 dayjs 为中文
dayjs.locale("zh-cn");

// 搜索关键词
const searchValue = ref("");
// 搜索处理函数
const onSearch = (value: string) => {
  fetchData(value);
};

// 删除游戏处理函数
const doDelete = (gameId: string) => {
  if (!gameId) return;

  // 确认框
  Modal.confirm({
    title: "确认删除",
    content: "确定要删除这个游戏吗？此操作不可恢复。",
    okText: "确认",
    cancelText: "取消",
    async onOk() {
      // 用户点击"确认"时的回调函数
      const res = await deleteGame(gameId); // 调用删除游戏的接口
      if (res.data.code === 0) {
        // 判断删除是否成功
        message.success("删除成功");
        await fetchData(searchValue.value); // 刷新数据
      } else {
        message.error("删除失败");
      }
    },
    onCancel() {
      // 用户点击"取消"时的回调函数
      return; // 直接返回，不执行任何操作
    },
  });
};

interface GameTableRecord {
  gameOnSale: number;
  gameDiscount: number;
  gamePrice: number;
  gameDiscountedPrices: number | null;
  gameCover: string;
}

// 表格列定义
const columns = [
  {
    title: "游戏ID🎮",
    dataIndex: "gameId",
    key: "gameId",
  },
  {
    title: "游戏名称🎯",
    dataIndex: "gameName",
    key: "gameName",
  },
  {
    title: "游戏描述📝",
    dataIndex: "gameDescription",
    key: "gameDescription",
  },
  {
    title: "游戏库存📦",
    dataIndex: "gameStock",
    key: "gameStock",
  },
  {
    title: "游戏发行日📅",
    dataIndex: "gameReleaseDate",
    key: "gameReleaseDate",
  },
  {
    title: "游戏开发商💻",
    dataIndex: "gameDev",
    key: "gameDev",
  },
  {
    title: "游戏发行商📤",
    dataIndex: "gamePub",
    key: "gamePub",
  },
  {
    title: "游戏封面",
    dataIndex: "gameCover",
    key: "gameCover",
    customRender: ({ record }: { record: GameTableRecord }) => {
      return h(
        record.gameCover ? "img" : "span",
        record.gameCover
          ? {
              src: record.gameCover,
              alt: "Game Cover",
              style: {
                width: "50px",
                height: "50px",
                objectFit: "cover",
              },
            }
          : { innerHTML: "-" }
      );
    },
  },
  {
    title: "游戏价格💰",
    dataIndex: "gamePrice",
    key: "gamePrice",
    customRender: ({ record }: { record: GameTableRecord }) => {
      if (record.gamePrice === 0) {
        return "免费";
      }
    },
  },
  {
    title: "折扣状态 💹",
    key: "gameOnSale",
    dataIndex: "gameOnSale",
    customRender: ({ record }: { record: GameTableRecord }) => {
      if (record.gamePrice === 0) {
        return "-";
      }
      if (record.gameOnSale === 1) {
        return `${((1 - record.gameDiscount) * 100).toFixed(1)}%`;
      }
      return "无折扣";
    },
  },
  {
    title: "折扣价格💰",
    dataIndex: "gameDiscountedPrices",
    key: "gameDiscountedPrices",
    customRender: ({ record }: { record: GameTableRecord }) => {
      if (record.gameOnSale === 1 && record.gameDiscountedPrices !== null) {
        return `¥${Number(record.gameDiscountedPrices).toFixed(2)}`;
      }
      return "-"; // 没有折扣时显示 "-"
    },
  },
  {
    title: "状态🔄",
    key: "gameIsRemoved",
  },
  {
    title: "操作⚡",
    key: "action",
  },
];

// 表格数据
const data = ref([]);

// 获取游戏列表数据
const fetchData = async (keyword = "") => {
  const res = await searchGames({
    gameName: keyword,
    current: 1,
    pageSize: 10,
  });
  if (res.data.code === 0) {
    data.value = res.data.data?.records || [];
  } else {
    message.error("游戏数据获取失败");
    data.value = [];
  }
};

// 游戏上下架状态
interface GameStatusRecord {
  gameId: string | number;
  gameIsRemoved: boolean;
}

// 切换游戏上下架状态
const toggleStatus = async (record: GameStatusRecord) => {
  try {
    // 根据当前状态决定新状态：如果已下架（true），则上架（0）；否则下架（1）
    const newStatus = record.gameIsRemoved ? 0 : 1;

    // 调用接口更新游戏状态
    const res = await updateGameStatus({
      gameId: record.gameId, // 游戏ID
      status: newStatus, // 新状态
    });

    // 判断操作是否成功
    if (res.data.code === 0) {
      message.success(`${newStatus === 1 ? "下架" : "上架"}成功`);
      record.gameIsRemoved = Boolean(newStatus); // 使用 Boolean 转换,更新本地状态
      await fetchData(searchValue.value); // 刷新数据
    } else {
      message.error(`操作失败：${res.data.message || "未知错误"}`);
    }
  } catch (error) {
    message.error("请求失败，请重试");
  }
};

// 编辑模态框相关状态
const modalVisible = ref(false);
const modalTitle = ref("");

// 新增表单状态的类型定义
interface AddFormState {
  gameName: string;
  gamePrice: number;
  gameStock: number;
}

// 新增表单状态初始化
const addFormState = reactive<AddFormState>({
  gameName: "",
  gamePrice: 0,
  gameStock: 0,
});

// 编辑表单状态的类型定义
interface EditFormState {
  gameId: string | number;
  gameName: string;
  gameDescription: string;
  gamePrice: number;
  gameStock: number;
  gamePub: string;
  gameReleaseDate: dayjs.Dayjs | null; // any 或者使用 dayjs.Dayjs | null 更严格
  gameDev: string;
  gameIsRemoved: boolean;
  gameOnSale: boolean;
  gameSaleStartTime: dayjs.Dayjs | null; // any 或者使用 dayjs.Dayjs | null 更严格
  gameSaleEndTime: dayjs.Dayjs | null; // any 或者使用 dayjs.Dayjs | null 更严格
  gameDiscount: number;
  gameCover: string;
}

// 编辑表单状态初始化
const editFormState = reactive<EditFormState>({
  gameId: "",
  gameName: "",
  gameDescription: "",
  gamePrice: 0,
  gameStock: 0,
  gamePub: "",
  gameReleaseDate: null,
  gameDev: "",
  gameIsRemoved: false,
  gameOnSale: false,
  gameSaleStartTime: null,
  gameSaleEndTime: null,
  gameDiscount: 0,
  gameCover: "",
});

// 新增模态框
const showAddModal = () => {
  modalTitle.value = "新增游戏";
  // 重置表单状态
  Object.assign(addFormState, {
    gameName: "",
    gamePrice: 0,
    gameStock: 0,
  });
  // 显示模态框
  modalVisible.value = true;
};

// 编辑方法
const showEditModal = (record: any) => {
  modalTitle.value = "编辑游戏";
  const formData = {
    ...record,
    gameReleaseDate: record.gameReleaseDate
      ? dayjs(record.gameReleaseDate)
      : null,
    gameCover: record.gameCover,
    gameSaleStartTime: record.gameSaleStartTime
      ? dayjs(record.gameSaleStartTime)
      : null,
    gameSaleEndTime: record.gameSaleEndTime
      ? dayjs(record.gameSaleEndTime)
      : null,
    gameOnSale: record.gameDiscount > 0,
    gameDiscount: record.gameDiscount || 0,
  };
  Object.assign(editFormState, formData);
  if (record.gameCover) {
    imageUrl.value = record.gameCover;
  }
  modalVisible.value = true;
};

// 处理模态框确认（新增游戏）
const handleAddGame = async () => {
  try {
    const addData: Partial<AddFormState> = {
      gameName: addFormState.gameName,
      gamePrice: addFormState.gamePrice,
      gameStock: addFormState.gameStock,
    };

    const res = await createGame(addData);
    if (res.data.code === 0) {
      message.success("添加成功");
      modalVisible.value = false;
      await fetchData(searchValue.value);
    } else {
      message.error(res.data.message || "添加失败");
    }
  } catch (error) {
    message.error("操作失败，请重试");
  }
};

// 处理模态框确认（编辑游戏）
const handleEditGame = async () => {
  try {
    const updateData: Partial<EditFormState> = {
      gameId: editFormState.gameId,
      gameName: editFormState.gameName,
      gamePrice: editFormState.gamePrice,
      gameDescription: editFormState.gameDescription,
      gameStock: editFormState.gameStock,
      gamePub: editFormState.gamePub,
      gameReleaseDate: editFormState.gameReleaseDate?.toISOString(),
      gameDev: editFormState.gameDev,
      gameOnSale: editFormState.gameOnSale,
      gameSaleStartTime: editFormState.gameSaleStartTime?.toISOString(),
      gameSaleEndTime: editFormState.gameSaleEndTime?.toISOString(),
      gameDiscount: editFormState.gameDiscount,
      gameCover: editFormState.gameCover,
    };

    const res = await updateGame(updateData);
    if (res.data.code === 0) {
      message.success("更新成功");
      modalVisible.value = false;
      await fetchData(searchValue.value);
    } else {
      message.error(res.data.message || "更新失败");
    }
  } catch (error) {
    message.error("操作失败，请重试");
  }
};

// 处理模态框确认
const handleModalOk = async () => {
  if (editFormState.gameId) {
    await handleEditGame();
  } else {
    await handleAddGame();
  }
};

// 处理模态框取消，重置表单
const handleModalCancel = () => {
  modalVisible.value = false;
  Object.assign(editFormState, {
    gameId: "",
    gameName: "",
    gameDescription: "",
    gamePrice: 0,
    gameStock: 0,
    gamePub: "",
    gameReleaseDate: null,
    gameDev: "",
    gameOnSale: false,
    gameSaleStartTime: null,
    gameSaleEndTime: null,
    gameDiscount: 0,
    gameCover: "",
  });
};

// 在 script 部分添加验证函数
const validateEndTime = (_rule: any, value: any) => {
  if (editFormState.gameSaleStartTime && value) {
    if (value.isBefore(editFormState.gameSaleStartTime)) {
      return Promise.reject("结束时间不能早于开始时间");
    }
  }
  return Promise.resolve();
};

// 处理是否打折开关变化
const handleSaleStatusChange = async (checked: boolean) => {
  if (!checked) {
    editFormState.gameDiscount = 0;
    editFormState.gameSaleStartTime = null;
    editFormState.gameSaleEndTime = null;
  }
};

// 修改折扣值变化的处理函数
const handleDiscountChange = (value: number) => {
  // 当输入折扣值时，只更新开关状态
  editFormState.gameOnSale = value > 0;

  // 只有当折扣值为0且是用户手动输入的情况下才清空时间
  if (value === 0 && !editFormState.gameOnSale) {
    editFormState.gameSaleStartTime = null;
    editFormState.gameSaleEndTime = null;
  }
};

// 监听开始时间变化，重置结束时间的验证
const handleStartTimeChange = () => {
  if (editFormState.gameSaleEndTime) {
    validateEndTime(null, editFormState.gameSaleEndTime);
  }
};

function getBase64(img: Blob, callback: (base64Url: string) => void) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
}

const fileList = ref([]);
const loading = ref<boolean>(false);
const imageUrl = ref<string>("");

const handleChange = (info: UploadChangeParam) => {
  if (info.file.status === "uploading") {
    loading.value = true;
    return;
  }
  if (info.file.status === "done") {
    if (info.file.response.code === 0) {
      getBase64(info.file.originFileObj, (base64Url: string) => {
        imageUrl.value = base64Url;
        loading.value = false;
        editFormState.gameCover = info.file.response.data;
      });
    } else {
      message.error(info.file.response.message || "上传失败");
      loading.value = false;
    }
  }
  if (info.file.status === "error") {
    loading.value = false;
    message.error("上传失败");
  }
};

const beforeUpload = (file: UploadProps["fileList"][number]) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("你只能上传 JPG 文件!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("文件必须小于 2MB!");
  }
  return isJpgOrPng && isLt2M;
};

const getHeaders = () => {
  return {
    // 如果使用了token认证，添加token
    // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
    // 确保发送cookie
    withCredentials: "true",
  };
};

// 初始化加载数据
fetchData();
</script>

<style scoped>
#gamesManagePage {
  padding: 24px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.avatar-uploader > .ant-upload {
  width: 128px;
  height: 128px;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}

.ant-upload-text {
  margin-top: 8px;
  font-size: 14px;
}

:deep(.ant-upload.ant-upload-select-picture-card) {
  width: 128px;
  height: 128px;
  margin: 0;
}

.avatar-uploader img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 确保图片适应预览框 */
}
</style>
