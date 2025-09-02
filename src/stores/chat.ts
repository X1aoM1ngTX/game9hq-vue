import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ChatMessageVO, ChatSessionVO } from "@/api/chat";
import { useLoginUserStore } from "@/stores/useLoginUserStore";

export const useChatStore = defineStore("chat", () => {
  const userStore = useLoginUserStore();

  // 状态
  const sessions = ref<ChatSessionVO[]>([]);
  const messages = ref<Map<number, ChatMessageVO[]>>(new Map());
  const currentSessionId = ref<number | null>(null);
  const unreadCount = ref<number>(0);
  const isConnected = ref<boolean>(false);

  // 计算属性
  const currentMessages = computed(() => {
    if (!currentSessionId.value) return [];
    // 找到当前会话对应的好友ID
    const currentSession = sessions.value.find(
      (s) => s.sessionId === currentSessionId.value
    );
    if (!currentSession) return [];
    // 使用好友ID作为键来获取消息
    return messages.value.get(currentSession.friendId) || [];
  });

  const currentSession = computed(() => {
    if (!currentSessionId.value) return null;
    return sessions.value.find((s) => s.sessionId === currentSessionId.value);
  });

  // 方法
  const setSessions = (newSessions: ChatSessionVO[]) => {
    sessions.value = newSessions;
  };

  const addOrUpdateSession = (session: ChatSessionVO) => {
    const index = sessions.value.findIndex(
      (s) => s.sessionId === session.sessionId
    );
    if (index >= 0) {
      sessions.value[index] = session;
    } else {
      sessions.value.unshift(session);
    }
  };

  const setMessages = (friendId: number, newMessages: ChatMessageVO[]) => {
    messages.value.set(friendId, newMessages.reverse());
  };

  const addMessage = (message: ChatMessageVO) => {
    const friendId =
      message.senderId === userStore.loginUser?.userId
        ? message.receiverId
        : message.senderId;

    // 获取或创建好友的消息列表
    let friendMessages = messages.value.get(friendId);
    if (!friendMessages) {
      friendMessages = [];
      messages.value.set(friendId, friendMessages);
    }
    // 添加新消息到列表末尾
    friendMessages.push(message);
    // 强制触发响应式更新
    messages.value.set(friendId, [...friendMessages]);

    // 更新或创建会话
    let session = sessions.value.find((s) => s.friendId === friendId);
    if (!session) {
      // 如果会话不存在，创建新会话
      session = {
        sessionId: Date.now(), // 临时ID
        friendId: friendId,
        friendNickname: message.senderNickname || `用户${friendId}`,
        friendAvatar: message.senderAvatar || "",
        lastMessage: message.content,
        lastMessageTime: message.createTime,
        unreadCount: 0,
        isOnline: false,
      };
      sessions.value.unshift(session); // 添加到列表顶部
    } else {
      // 更新现有会话
      session.lastMessage = message.content;
      session.lastMessageTime = message.createTime;
      // 将会话移到顶部
      const sessionIndex = sessions.value.findIndex(
        (s) => s.sessionId === session!.sessionId
      );
      if (sessionIndex > 0) {
        sessions.value.splice(sessionIndex, 1);
        sessions.value.unshift(session);
      }
    }

    // 如果不是当前会话，增加未读数
    if (
      session.sessionId !== currentSessionId.value &&
      message.senderId !== userStore.loginUser?.userId
    ) {
      session.unreadCount += 1;
      unreadCount.value += 1;
    }
    console.log(
      `消息已添加到store: 发送者=${message.senderId}, 接收者=${message.receiverId}, 内容=${message.content}`
    );
    console.log(
      `当前会话ID: ${currentSessionId.value}, 消息会话ID: ${session.sessionId}`
    );
  };

  const setCurrentSession = (sessionId: number | null) => {
    currentSessionId.value = sessionId;
  };

  const setUnreadCount = (count: number) => {
    unreadCount.value = count;
  };

  const clearUnreadCount = (friendId: number) => {
    const session = sessions.value.find((s) => s.friendId === friendId);
    if (session) {
      unreadCount.value -= session.unreadCount;
      session.unreadCount = 0;
    }
  };

  const updateMessage = (
    messageId: number,
    updates: Partial<ChatMessageVO>
  ) => {
    // 遍历所有消息列表，找到对应的消息并更新
    for (const [friendId, friendMessages] of messages.value.entries()) {
      const messageIndex = friendMessages.findIndex(
        (msg) => msg.messageId === messageId
      );
      if (messageIndex !== -1) {
        friendMessages[messageIndex] = {
          ...friendMessages[messageIndex],
          ...updates,
        };
        break;
      }
    }
  };

  const setConnected = (connected: boolean) => {
    isConnected.value = connected;
  };

  const clearChat = () => {
    sessions.value = [];
    messages.value.clear();
    currentSessionId.value = null;
    unreadCount.value = 0;
    isConnected.value = false;
  };

  return {
    // 状态
    sessions,
    messages,
    currentSessionId,
    unreadCount,
    isConnected,

    // 计算属性
    currentMessages,
    currentSession,

    // 方法
    setSessions,
    addOrUpdateSession,
    setMessages,
    addMessage,
    updateMessage,
    setCurrentSession,
    setUnreadCount,
    clearUnreadCount,
    setConnected,
    clearChat,
  };
});
