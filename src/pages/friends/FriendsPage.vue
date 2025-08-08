<template>
  <div class="friends-container">
    <!-- 顶部搜索和操作区域 -->
    <div class="friends-header">
      <div class="header-left">
        <h2 class="page-title">好友管理</h2>
        <div class="friends-stats">
          <span class="stat-item"
          >在线好友: <strong>{{ onlineFriendsCount }}</strong></span
          >
          <span class="stat-item"
          >全部好友: <strong>{{ totalFriendsCount }}</strong></span
          >
        </div>
      </div>
      <div class="header-actions">
        <a-input-search
          v-model:value="searchValue"
          class="friend-search"
          enter-button="搜索"
          placeholder="搜索好友昵称或用户名"
          size="large"
          @search="onSearch"
        />
        <a-button size="large" type="primary" @click="showAddFriendModal">
          <plus-outlined />
          添加好友
        </a-button>
      </div>
    </div>

    <!-- 好友分组标签 -->
    <div class="friend-groups">
      <a-tabs v-model:activeKey="activeGroup" @change="onGroupChange">
        <a-tab-pane key="all" tab="全部好友">
          <div class="friends-grid">
            <div
              v-for="friend in filteredFriends"
              :key="friend.friendId"
              class="friend-card"
              @click="openFriendProfile(friend)"
            >
              <div class="friend-avatar-section">
                <a-avatar :size="48" :src="friend.userAvatar">
                  {{
                    friend.userNickname?.charAt(0) || friend.userName?.charAt(0)
                  }}
                </a-avatar>
                <div
                  :class="['online-indicator', { online: friend.isOnline }]"
                ></div>
              </div>
              <div class="friend-info">
                <h4 class="friend-name">
                  {{ friend.userNickname || friend.userName }}
                </h4>
                <p class="friend-status">
                  {{ friend.isOnline ? "在线" : "离线" }}
                </p>
                <p v-if="friend.currentGame" class="friend-game">
                  正在游玩: {{ friend.currentGame }}
                </p>
              </div>
              <div class="friend-actions">
                <a-dropdown>
                  <a-button size="small" type="text">
                    <more-outlined />
                  </a-button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item @click="sendMessage(friend)">
                        <message-outlined />
                        发送消息
                      </a-menu-item>
                      <a-menu-item @click="viewProfile(friend)">
                        <user-outlined />
                        查看资料
                      </a-menu-item>
                      <a-menu-divider />
                      <a-menu-item
                        class="danger-item"
                        @click="removeFriend(friend)"
                      >
                        <delete-outlined />
                        删除好友
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="online" tab="在线好友">
          <div class="friends-grid">
            <div
              v-for="friend in onlineFriends"
              :key="friend.friendId"
              class="friend-card"
              @click="openFriendProfile(friend)"
            >
              <div class="friend-avatar-section">
                <a-avatar :size="48" :src="friend.userAvatar">
                  {{
                    friend.userNickname?.charAt(0) || friend.userName?.charAt(0)
                  }}
                </a-avatar>
                <div class="online-indicator online"></div>
              </div>
              <div class="friend-info">
                <h4 class="friend-name">
                  {{ friend.userNickname || friend.userName }}
                </h4>
                <p class="friend-status">在线</p>
                <p v-if="friend.currentGame" class="friend-game">
                  正在游玩: {{ friend.currentGame }}
                </p>
              </div>
              <div class="friend-actions">
                <a-dropdown>
                  <a-button size="small" type="text">
                    <more-outlined />
                  </a-button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item @click="sendMessage(friend)">
                        <message-outlined />
                        发送消息
                      </a-menu-item>
                      <a-menu-item @click="viewProfile(friend)">
                        <user-outlined />
                        查看资料
                      </a-menu-item>
                      <a-menu-divider />
                      <a-menu-item
                        class="danger-item"
                        @click="removeFriend(friend)"
                      >
                        <delete-outlined />
                        删除好友
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="received" tab="收到的申请">
          <div class="friends-grid">
            <div
              v-for="request in receivedRequests"
              :key="request.id"
              class="friend-card friend-card-vertical"
            >
              <div class="friend-card-main">
                <div class="friend-avatar-section">
                  <a-avatar :size="48" :src="request.avatar">
                    {{ request.username?.charAt(0) || "?" }}
                  </a-avatar>
                </div>
                <div class="friend-info">
                  <div class="friend-info-header">
                    <span class="friend-name">{{
                        request.username || "未知用户"
                      }}</span>
                  </div>
                  <div class="friend-info-meta">
                    <span class="friend-label">申请时间：</span>
                    <span class="friend-time">{{
                        formatDate(request.createTime)
                      }}</span>
                  </div>
                  <div v-if="request.remark" class="friend-info-meta">
                    <span class="friend-label">备注：</span>
                    <span class="friend-remark">{{ request.remark }}</span>
                  </div>
                </div>
              </div>
              <div class="friend-actions friend-actions-bottom">
                <a-space>
                  <a-button type="primary" @click="handleRequest(request, true)"
                  >接受
                  </a-button
                  >
                  <a-button danger @click="handleRequest(request, false)"
                  >拒绝
                  </a-button
                  >
                  <a-button @click="showRemarkModal(request)"
                  >
                    <edit-outlined />
                    备注
                  </a-button
                  >
                </a-space>
              </div>
            </div>
          </div>
          <div v-if="receivedRequests.length === 0" class="empty-state">
            <div class="empty-icon">📨</div>
            <h3>暂无好友申请</h3>
            <p>还没有人向你发送好友申请</p>
          </div>
        </a-tab-pane>
        <a-tab-pane key="sent" tab="我的申请">
          <div class="friends-grid">
            <div
              v-for="request in sentRequests"
              :key="request.id"
              class="friend-card"
            >
              <div class="friend-avatar-section">
                <a-avatar :size="48" :src="request.avatar">
                  {{ request.username?.charAt(0) || "?" }}
                </a-avatar>
              </div>
              <div class="friend-info">
                <h4 class="friend-name">
                  {{ request.username || "未知用户" }}
                </h4>
                <p class="friend-status">
                  申请时间: {{ formatDate(request.createTime) }}
                </p>
                <p class="friend-status">
                  状态: {{ getRequestStatusText(request.status) }}
                </p>
              </div>
            </div>
          </div>
          <div v-if="sentRequests.length === 0" class="empty-state">
            <div class="empty-icon">📤</div>
            <h3>暂无发送的申请</h3>
            <p>你还没有发送过好友申请</p>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredFriends.length === 0" class="empty-state">
      <div class="empty-icon">👥</div>
      <h3>暂无好友</h3>
      <p>快去添加一些好友吧！</p>
      <a-button type="primary" @click="showAddFriendModal">
        <plus-outlined />
        添加好友
      </a-button>
    </div>

    <!-- 添加好友弹窗 -->
    <a-modal
      v-model:open="addFriendModalVisible"
      title="添加好友"
      @cancel="addFriendModalVisible = false"
      @ok="handleAddFriend"
    >
      <a-form :model="addFriendForm" layout="vertical">
        <a-form-item label="用户ID或用户名">
          <a-input
            v-model:value="addFriendForm.identifier"
            placeholder="请输入用户ID或用户名"
          />
        </a-form-item>
        <a-form-item label="验证消息">
          <a-textarea
            v-model:value="addFriendForm.message"
            :rows="3"
            placeholder="请输入验证消息"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 添加备注弹窗 -->
    <a-modal
      v-model:open="remarkModalVisible"
      title="设置备注"
      @cancel="remarkModalVisible = false"
      @ok="handleRemarkSubmit"
    >
      <a-form :model="remarkForm" layout="vertical">
        <a-form-item label="备注">
          <a-input
            v-model:value="remarkForm.remark"
            :maxLength="20"
            placeholder="请输入备注信息"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import {
  DeleteOutlined,
  EditOutlined,
  MessageOutlined,
  MoreOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons-vue";
import type { FriendRequestVO } from "@/api/friend";
import {
  addFriend,
  deleteFriend,
  type FriendInfo,
  type FriendVO,
  getFriendList,
  getReceivedRequests,
  getSentRequests,
  handleFriendRequest,
  updateFriendRemark,
} from "@/api/friend";

// 扩展 FriendVO 类型
interface ExtendedFriendVO extends FriendVO {
  isOnline: boolean;
  currentGame: string | null;
}

const router = useRouter();

// 响应式数据
const searchValue = ref("");
const activeGroup = ref("all");
const addFriendModalVisible = ref(false);
const friends = ref<ExtendedFriendVO[]>([]);
const loading = ref(false);
const receivedRequests = ref<FriendRequestVO[]>([]);
const sentRequests = ref<FriendRequestVO[]>([]);

// 添加好友表单
const addFriendForm = ref({
  identifier: "",
  message: "你好，我想添加你为好友！",
});

// 添加备注相关的响应式数据
const remarkModalVisible = ref(false);
const remarkForm = ref({
  friendId: 0,
  remark: "",
});

// 计算属性
const filteredFriends = computed(() => {
  if (!searchValue.value) {
    return activeGroup.value === "online" ? onlineFriends.value : friends.value;
  }
  const filtered = friends.value.filter(
    (friend) =>
      (friend.userNickname &&
        friend.userNickname
          .toLowerCase()
          .includes(searchValue.value.toLowerCase())) ||
      (friend.userName &&
        friend.userName
          .toLowerCase()
          .includes(searchValue.value.toLowerCase())) ||
      (friend.remark &&
        friend.remark.toLowerCase().includes(searchValue.value.toLowerCase())),
  );
  return activeGroup.value === "online"
    ? filtered.filter((f) => f.isOnline)
    : filtered;
});

const onlineFriends = computed(() => {
  return friends.value.filter((friend) => friend.isOnline);
});

const onlineFriendsCount = computed(() => onlineFriends.value.length);
const totalFriendsCount = computed(() => friends.value.length);

// 方法
const fetchFriends = async () => {
  try {
    loading.value = true;
    const response = await getFriendList();
    if (response.data.code === 0) {
      friends.value = response.data.data.map((friend) => ({
        ...friend,
        isOnline: friend.isOnline ?? false,
        currentGame: null,
      }));
    }
  } catch (error) {
    console.error("获取好友列表失败:", error);
  } finally {
    loading.value = false;
  }
};

const fetchReceivedRequests = async () => {
  try {
    const response = await getReceivedRequests();
    if (response.data.code === 0) {
      receivedRequests.value = response.data.data;
    }
  } catch (error) {
    console.error("获取收到的好友申请失败:", error);
  }
};

const fetchSentRequests = async () => {
  try {
    const response = await getSentRequests();
    if (response.data.code === 0) {
      sentRequests.value = response.data.data;
    }
  } catch (error) {
    console.error("获取我发出的好友申请失败:", error);
  }
};

const onSearch = (value: string): void => {
  searchValue.value = value;
};

const onGroupChange = (key: string): void => {
  activeGroup.value = key;
  if (key === "all" || key === "online") {
    fetchFriends();
  } else if (key === "received") {
    fetchReceivedRequests();
  } else if (key === "sent") {
    fetchSentRequests();
  }
};

const showAddFriendModal = () => {
  addFriendModalVisible.value = true;
};

const handleAddFriend = async () => {
  if (!addFriendForm.value.identifier.trim()) {
    message.warning("请输入用户ID或用户名");
    return;
  }

  try {
    const response = await addFriend({
      friendId: parseInt(addFriendForm.value.identifier) || 0,
      remark: addFriendForm.value.message,
    });

    if (response.data.code === 0) {
      message.success("好友请求已发送");
      addFriendModalVisible.value = false;
      addFriendForm.value = {
        identifier: "",
        message: "你好，我想添加你为好友！",
      };
      // 刷新好友列表
      await fetchFriends();
    }
  } catch (error) {
    console.error("添加好友失败:", error);
  }
};

const openFriendProfile = (friend: ExtendedFriendVO) => {
  router.push(`/user/profile/${friend.friendId}`);
};

const sendMessage = (friend: ExtendedFriendVO) => {
  message.info(
    `向 ${friend.userNickname || friend.userName} 发送消息功能开发中...`,
  );
};

const viewProfile = (friend: ExtendedFriendVO) => {
  router.push(`/user/profile/${friend.friendId}`);
};

const removeFriend = async (friend: ExtendedFriendVO) => {
  try {
    const response = await deleteFriend(friend.friendId);
    if (response.data.code === 0) {
      message.success("已删除好友");
      await fetchFriends();
    }
  } catch (error) {
    console.error("删除好友失败:", error);
  }
};

const showRemarkModal = (request: FriendInfo) => {
  remarkForm.value = {
    friendId: request.id,
    remark: request.remark || "",
  };
  remarkModalVisible.value = true;
};

const handleRemarkSubmit = async () => {
  try {
    const response = await updateFriendRemark(
      remarkForm.value.friendId,
      remarkForm.value.remark,
    );
    if (response.data.code === 0) {
      message.success("备注设置成功");
      remarkModalVisible.value = false;
      await fetchReceivedRequests();
    }
  } catch (error) {
    console.error("备注设置失败:", error);
  }
};

const handleRequest = async (request: FriendInfo, accept: boolean) => {
  try {
    const response = await handleFriendRequest(request.id, accept);
    if (response.data.code === 0) {
      message.success(accept ? "已接受好友申请" : "已拒绝好友申请");
      await fetchReceivedRequests();
      // 如果接受了好友请求，则刷新好友列表
      if (accept) {
        await fetchFriends();
      }
    }
  } catch (error) {
    console.error("处理好友申请失败:", error);
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRequestStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "待处理";
    case 1:
      return "已接受";
    case 2:
      return "已拒绝";
    default:
      return "未知状态";
  }
};

// 生命周期
onMounted(() => {
  fetchFriends();
  fetchReceivedRequests();
  fetchSentRequests();
});
</script>

<style scoped>
.friends-container {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 64px - 70px);
}

.friends-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
}

.friends-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  color: #8c8c8c;
  font-size: 14px;
}

.stat-item strong {
  color: #1890ff;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.friend-search {
  width: 300px;
}

:deep(.ant-input) {
  height: 40px;
  border-radius: 8px;
  border: 1px solid #d9d9d9;
  transition: all 0.2s;
}

:deep(.ant-input:focus) {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

:deep(.ant-input-search-button) {
  height: 40px;
  border-radius: 0 8px 8px 0;
  background: #1890ff;
  border: none;
  transition: all 0.2s;
}

:deep(.ant-input-search-button:hover) {
  background: #40a9ff;
}

.friend-groups {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

:deep(.ant-tabs-nav) {
  margin: 0;
  padding: 0 24px;
  background: #fafafa;
}

:deep(.ant-tabs-content-holder) {
  padding: 24px;
}

.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.friend-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.friend-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #1890ff;
}

.friend-avatar-section {
  position: relative;
  flex-shrink: 0;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #d9d9d9;
  border: 2px solid #ffffff;
  transition: all 0.2s;
}

.online-indicator.online {
  background: #52c41a;
  box-shadow: 0 0 6px rgba(82, 196, 26, 0.4);
}

.friend-info {
  flex: 1;
  min-width: 0;
}

.friend-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.friend-status {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #8c8c8c;
}

.friend-game {
  margin: 0;
  font-size: 12px;
  color: #1890ff;
  background: #f0f8ff;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}

.friend-remark {
  margin: 0;
  font-size: 12px;
  color: #8c8c8c;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-actions {
  display: flex;
  gap: 8px;
  flex-direction: column;
  align-items: center;
}

.friend-actions .ant-btn {
  min-width: 64px;
}

.friend-actions .ant-btn-text {
  min-width: auto;
}

:deep(.ant-dropdown-menu-item.danger-item) {
  color: #ff4d4f;
}

:deep(.ant-dropdown-menu-item.danger-item:hover) {
  background: #fff2f0;
  color: #ff4d4f;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #262626;
  font-size: 18px;
}

.empty-state p {
  margin: 0 0 24px 0;
  color: #8c8c8c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .friends-container {
    padding: 16px;
  }

  .friends-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
    gap: 12px;
  }

  .friend-search {
    width: 100%;
  }

  .friends-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .friend-card {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .friends-stats {
    flex-direction: column;
    gap: 8px;
  }

  .friend-card {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .friend-info {
    text-align: center;
  }
}

.friend-card-vertical {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 24px 28px;
}

.friend-card-main {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 18px;
}

.friend-info {
  flex: 1;
  min-width: 0;
}

.friend-info-header {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 6px;
}

.friend-info-meta {
  font-size: 13px;
  color: #8c8c8c;
  margin-bottom: 2px;
  display: flex;
  gap: 4px;
  align-items: center;
}

.friend-label {
  color: #bfbfbf;
}

.friend-time {
  color: #8c8c8c;
}

.friend-remark {
  color: #1890ff;
  background: #f0f8ff;
  padding: 1px 6px;
  border-radius: 4px;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-actions-bottom {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  box-shadow: none;
  border: none;
  background: transparent;
}
</style>
