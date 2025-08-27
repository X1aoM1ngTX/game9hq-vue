<template>
  <div class="chat-page-wrapper">
    <div class="main-content">
      <!-- 左侧聊天列表 -->
      <div class="chat-sidebar">
        <div class="chat-header">
          <h3>消息</h3>
          <div class="chat-header-actions">
            <a-badge :count="unreadCount" :dot="unreadCount > 0">
              <a-button type="text" shape="circle">
                <template #icon><BellOutlined /></template>
              </a-button>
            </a-badge>
          </div>
        </div>

        <div class="session-list">
          <div
            v-for="session in sessions"
            :key="session.sessionId"
            :class="[
              'session-item',
              { active: currentSessionId === session.sessionId },
            ]"
            @click="selectSession(session)"
          >
            <div class="session-avatar">
              <a-avatar :src="session.friendAvatar" :size="40">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <div
                :class="['online-status', { online: session.isOnline }]"
              ></div>
            </div>

            <div class="session-info">
              <div class="session-name">{{ session.friendNickname }}</div>
              <div class="session-last-message">{{ session.lastMessage }}</div>
            </div>

            <div class="session-meta">
              <div class="session-time">
                {{ formatTime(session.lastMessageTime) }}
              </div>
              <a-badge
                v-if="session.unreadCount > 0"
                :count="session.unreadCount"
                :max="99"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧聊天容器 -->
      <div class="chat-container">
        <div class="chat-main">
          <div v-if="currentSession" class="chat-content">
            <div class="chat-header-main">
              <div class="chat-user-info">
                <a-avatar :src="currentSession.friendAvatar" :size="36">
                  <template #icon><UserOutlined /></template>
                </a-avatar>
                <div class="chat-user-name">
                  {{ currentSession.friendNickname }}
                </div>
                <div
                  :class="[
                    'chat-user-status',
                    { online: currentSession.isOnline },
                  ]"
                >
                  {{ currentSession.isOnline ? "在线" : "离线" }}
                </div>
              </div>
            </div>

            <div class="message-container" ref="messageContainer">
              <div
                v-for="message in currentMessages"
                :key="message.messageId"
                :class="[
                  'message-item',
                  {
                    self: message.senderId === userStore.loginUser?.userId,
                  },
                ]"
              >
                <div class="message-avatar">
                  <a-avatar :src="getUserAvatar(message.senderId)" :size="32">
                    <template #icon><UserOutlined /></template>
                  </a-avatar>
                </div>

                <div class="message-content">
                  <div class="message-bubble">
                    {{ message.content || "" }}
                  </div>
                  <div class="message-time">
                    {{ formatTime(message.createTime) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="chat-empty">
            <a-empty description="选择一个会话开始聊天" />
          </div>
        </div>

        <!-- 固定在底部的输入框 -->
        <div v-if="currentSession" class="chat-input-fixed">
          <div class="chat-input-container">
            <a-input
              v-model:value="messageInput"
              placeholder="输入消息..."
              @press-enter="sendMessage"
              :disabled="false"
            />
            <a-button
              type="primary"
              @click="sendMessage"
              :disabled="!messageInput.trim()"
            >
              发送
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import { useLoginUserStore } from "@/stores/useLoginUserStore";
import { useChatStore } from "@/stores/chat";
import { useWebSocket } from "@/composables/useWebSocket";
import {
  getSessionList,
  getChatMessageList,
  markMessagesAsRead,
  getUnreadCount,
  sendMessage as sendApiMessage,
} from "@/api/chat";
import { message } from "ant-design-vue";
import { UserOutlined, BellOutlined } from "@ant-design/icons-vue";

const route = useRoute();
const userStore = useLoginUserStore();
const chatStore = useChatStore();
const { sendMessage: sendWebSocketMessage, sendReadReceipt } = useWebSocket();

// 响应式数据
const messageInput = ref("");
const messageContainer = ref<HTMLElement>();

// 计算属性
const sessions = computed(() => chatStore.sessions);
const currentSessionId = computed(() => chatStore.currentSessionId);
const currentSession = computed(() => chatStore.currentSession);
const currentMessages = computed(() => chatStore.currentMessages);
const unreadCount = computed(() => chatStore.unreadCount);

// 用户头像缓存 - 避免重复请求
const userAvatarCache = computed(() => {
  const cache = new Map<number, string>();

  // 添加当前用户头像
  if (userStore.loginUser?.userId && userStore.loginUser?.userAvatar) {
    cache.set(userStore.loginUser.userId, userStore.loginUser.userAvatar);
  }

  // 添加当前会话好友头像
  if (currentSession.value?.friendId && currentSession.value?.friendAvatar) {
    cache.set(currentSession.value.friendId, currentSession.value.friendAvatar);
  }

  // 添加所有会话中的用户头像
  sessions.value.forEach((session) => {
    if (session.friendId && session.friendAvatar) {
      cache.set(session.friendId, session.friendAvatar);
    }
  });

  return cache;
});

// 获取用户头像的函数
const getUserAvatar = (userId: number) => {
  // 首先从缓存中获取
  const cachedAvatar = userAvatarCache.value.get(userId);
  if (cachedAvatar) {
    return cachedAvatar;
  }

  // 如果缓存中没有，返回空字符串，使用默认头像
  return "";
};

// 方法
const formatTime = (time?: string) => {
  if (!time) return "";
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (days === 1) {
    return "昨天";
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return date.toLocaleDateString("zh-CN");
  }
};

const selectSession = async (session: any) => {
  chatStore.setCurrentSession(session.sessionId);

  // 加载聊天记录
  try {
    const response = await getChatMessageList(session.friendId);
    if (response.data?.data) {
      // 后端返回的是IPage对象，需要获取records字段
      const messages = response.data.data.records || [];
      chatStore.setMessages(session.friendId, messages);
    }

    // 标记消息为已读
    await markMessagesAsRead(session.friendId);
    chatStore.clearUnreadCount(session.friendId);

    // 发送已读回执
    if (currentMessages.value.length > 0) {
      const lastMessage =
        currentMessages.value[currentMessages.value.length - 1];
      sendReadReceipt(lastMessage);
    }

    // 强制滚动到底部显示最新消息
    await nextTick();
    scrollToBottom(true);
  } catch (error) {
    console.error("加载聊天记录失败:", error);
    // 如果是临时会话（时间戳格式的ID），没有聊天记录是正常的
    if (session.sessionId.toString().length < 10) {
      // 数据库ID通常较短，临时ID是时间戳很长
      message.error("加载聊天记录失败");
    }
    // 如果是404错误，可能是没有聊天记录，这是正常的
    else if (error.response?.status === 404) {
      console.log("没有聊天记录，这是正常的");
    }
    // 其他错误才显示给用户
    else {
      message.error("加载聊天记录失败");
    }
  }
};

const sendMessage = async () => {
  if (!messageInput.value.trim() || !currentSession.value) return;

  const messageData = {
    senderId: userStore.loginUser?.userId,
    receiverId: currentSession.value.friendId,
    content: messageInput.value,
    messageType: 1,
    status: 0,
    createTime: new Date().toISOString(),
  };

  // 尝试发送WebSocket消息
  const success = sendWebSocketMessage(messageData);

  if (success) {
    // WebSocket发送成功，添加消息到本地列表
    messageInput.value = "";
    const localMessage = {
      ...messageData,
      messageId: Date.now(), // 临时ID，等待服务器确认
      status: 0, // 已发送
    };
    chatStore.addMessage(localMessage);
    await nextTick();
    scrollToBottom(true);
  } else {
    // WebSocket发送失败，尝试通过HTTP API发送
    try {
      const response = await sendApiMessage({
        receiverId: currentSession.value.friendId,
        content: messageInput.value,
        messageType: 1,
      });

      if (response.data?.code === 0) {
        messageInput.value = "";
        // 添加消息到本地列表
        const localMessage = {
          ...messageData,
          messageId: response.data.data,
          status: 1, // 已发送但可能未送达
        };
        chatStore.addMessage(localMessage);
        await nextTick();
        scrollToBottom(true);
      } else {
        message.error(response.data?.message || "消息发送失败");
      }
    } catch (error) {
      console.error("HTTP消息发送失败:", error);
      message.error("消息发送失败，请检查网络连接");
    }
  }
};

const scrollToBottom = (force = false) => {
  if (messageContainer.value) {
    const container = messageContainer.value;

    // 如果是强制滚动（比如切换会话或加载消息），直接滚动到底部
    if (force) {
      container.scrollTop = container.scrollHeight;
      return;
    }

    const isScrolledToBottom =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + 50;

    // 当用户已经在底部或者刚刚发送消息时才滚动到底部
    if (isScrolledToBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }
};

// 监听消息变化，滚动到底部
watch(
  currentMessages,
  () => {
    nextTick(() => {
      scrollToBottom(true);
    });
  },
  { deep: true }
);

// 初始化数据
const initData = async () => {
  try {
    // 加载会话列表
    const sessionResponse = await getSessionList();
    if (sessionResponse.data?.data) {
      chatStore.setSessions(sessionResponse.data.data);

      // 检查是否有URL参数指定了好友
      const friendId = route.query.friendId as string;
      if (friendId) {
        // 查找是否已有该好友的会话
        const existingSession = sessionResponse.data.data.find(
          (session: any) => session.friendId === parseInt(friendId)
        );

        if (existingSession) {
          // 选择现有会话
          await selectSession(existingSession);
        } else {
          // 创建新会话
          const friendName = (route.query.friendName as string) || "好友";
          const friendAvatar = (route.query.friendAvatar as string) || "";

          // 创建临时会话对象
          const tempSession = {
            sessionId: Date.now(), // 临时ID
            friendId: parseInt(friendId),
            friendNickname: friendName,
            friendAvatar: friendAvatar,
            lastMessage: "",
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
            isOnline: false,
          };

          // 选择临时会话
          await selectSession(tempSession);
        }
      }
    }

    // 加载未读消息数
    const unreadResponse = await getUnreadCount();
    if (unreadResponse.data?.data !== undefined) {
      chatStore.setUnreadCount(unreadResponse.data.data);
    }
  } catch (error) {
    message.error("加载聊天数据失败");
  }
};

// 生命周期
onMounted(() => {
  initData();
});
</script>

<style scoped>
/* 确保聊天页面在没有footer的情况下能够正确显示 */
.chat-page-wrapper {
  height: calc(100vh - 64px); /* 减去header高度 */
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.main-content {
  display: flex;
  flex: 1;
  min-height: 0;
}

.chat-sidebar {
  width: 300px;
  border: 1px solid #e8e8e8;
  background: #fafafa;
  overflow: hidden;
  flex-shrink: 0;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  background: white;
  min-height: 0;
}

/* 响应式调整 */
@media (max-height: 768px) {
  .chat-input-fixed {
    padding: 12px;
  }
}

@media (max-height: 600px) {
  .chat-input-fixed {
    padding: 8px;
  }
}

@media (max-width: 768px) {
  .chat-sidebar {
    width: 250px;
  }

  .chat-input-fixed {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .main-content {
    flex-direction: column;
  }

  .chat-sidebar {
    width: 100%;
    height: 200px;
  }

  .chat-input-fixed {
    padding: 8px;
  }
}

.chat-sidebar {
  width: 300px;
  border-right: 1px solid #e8e8e8;
  background: #fafafa;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* 固定在底部的输入框 */
.chat-input-fixed {
  border-top: 1px solid #e8e8e8;
  background: white;
  padding: 16px;
  flex-shrink: 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.chat-input-container {
  display: flex;
  gap: 8px;
  width: 100%;
  align-items: center;
}

.chat-input-container .ant-input {
  flex: 1;
}

.chat-input-container .ant-btn {
  height: 40px;
  min-width: 80px;
}

.chat-header {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.chat-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.connection-status {
  font-size: 12px;
  color: #999;
  padding: 4px 8px;
  border-radius: 12px;
  background: #f0f0f0;
}

.connection-status.connected {
  color: #52c41a;
  background: #f6ffed;
}

.session-list {
  height: calc(100% - 60px);
  overflow-y: auto;

  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #d9d9d9 #fafafa;
}

.session-list::-webkit-scrollbar {
  width: 6px;
}

.session-list::-webkit-scrollbar-track {
  background: #fafafa;
  border-radius: 3px;
}

.session-list::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.session-list::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.session-item:hover {
  background: #f5f5f5;
}

.session-item.active {
  background: #e6f7ff;
}

.session-avatar {
  position: relative;
  margin-right: 12px;
}

.online-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #d9d9d9;
  border: 2px solid #fafafa;
}

.online-status.online {
  background: #52c41a;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-name {
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-last-message {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.session-time {
  font-size: 11px;
  color: #999;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  min-height: 0; /* 确保flex容器能够正确收缩 */
}

.chat-header-main {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0; /* 防止头部被压缩 */
}

.chat-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-user-name {
  font-weight: 500;
}

.chat-user-status {
  font-size: 12px;
  color: #999;
}

.chat-user-status.online {
  color: #52c41a;
}

.message-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f5f5f5;
  min-height: 0; /* 确保容器能够正确滚动 */

  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #d9d9d9 #f0f0f0;

  /* 确保消息不被输入框遮挡 */
  padding-bottom: 20px;
}

.message-container::-webkit-scrollbar {
  width: 6px;
}

.message-container::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 3px;
}

.message-container::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.message-container::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
}

.message-item.self {
  flex-direction: row-reverse;
}

.message-item.self .message-content {
  align-items: flex-end;
}

.message-bubble {
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  max-width: 300px;
  word-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-item.self .message-bubble {
  background: #1677ff;
  color: white;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.message-item.self .message-time {
  text-align: right;
}

.chat-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
