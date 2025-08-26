import myAxios from "@/request";

export interface ChatMessageRequest {
  receiverId: number;
  content: string;
  messageType?: number;
}

export interface ChatMessageVO {
  messageId: number;
  senderId: number;
  senderNickname?: string;
  senderAvatar?: string;
  receiverId: number;
  content: string;
  messageType: number;
  status: number;
  createTime: string;
}

export interface ChatSessionVO {
  sessionId: number;
  friendId: number;
  friendNickname?: string;
  friendAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline?: boolean;
}

export interface IPage<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

// 发送消息
export async function sendMessage(data: ChatMessageRequest) {
  return myAxios<ApiResponse<number>>("/api/chat/message/send", {
    method: "POST",
    data,
  });
}

// 获取聊天消息列表
export async function getChatMessageList(
  friendId: number,
  page = 1,
  size = 20
) {
  return myAxios<ApiResponse<IPage<ChatMessageVO>>>(
    `/api/chat/message/list?friendId=${friendId}&page=${page}&size=${size}`,
    {
      method: "GET",
    }
  );
}

// 获取会话列表
export async function getSessionList() {
  return myAxios<ApiResponse<ChatSessionVO[]>>("/api/chat/session/list", {
    method: "GET",
  });
}

// 获取未读消息数量
export async function getUnreadCount() {
  return myAxios<ApiResponse<number>>("/api/chat/message/unread/count", {
    method: "GET",
  });
}

// 标记消息为已读
export async function markMessagesAsRead(friendId: number) {
  return myAxios<ApiResponse<boolean>>("/api/chat/message/read", {
    method: "POST",
    params: {
      friendId,
    },
  });
}
