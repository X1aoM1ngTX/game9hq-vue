import myAxios from "@/request";

export interface FriendAddRequest {
  friendId: number;
  remark?: string;
}

export interface FriendRequest {
  friendId: number;
  friendRemark?: string;
}

export interface FriendVO {
  friendId: number;
  userName: string;
  userNickname?: string;
  userAvatar?: string;
  userProfile?: string;
  remark?: string;
  createTime: string;
  isOnline: boolean;
}

export interface FriendInfo {
  id: number;
  username: string;
  avatar?: string;
  remark?: string;
  status: number; // 0: 待处理, 1: 已接受, 2: 已拒绝
  createTime: string;
}

export interface FriendRequestVO {
  id: number;
  username: string;
  avatar?: string;
  remark?: string;
  status: number; // 0: 待处理, 1: 已接受, 2: 已拒绝
  createTime: string;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

// 发送好友请求
export async function addFriend(data: FriendAddRequest) {
  return myAxios<ApiResponse<boolean>>("/api/friend/add", {
    method: "POST",
    data,
  });
}

// 处理好友请求
export async function handleFriendRequest(id: number, accept: boolean) {
  return myAxios<ApiResponse<null>>("/api/friend/handle", {
    method: "POST",
    params: {
      id,
      accept,
    },
  });
}

// 获取好友列表
export async function getFriendList() {
  return myAxios<ApiResponse<FriendVO[]>>("/api/friend/list", {
    method: "GET",
  });
}

// 获取待处理的好友请求
export async function getFriendRequests() {
  return myAxios<ApiResponse<FriendInfo[]>>("/api/friend/request/list", {
    method: "GET",
  });
}

// 获取收到的好友申请
export async function getReceivedRequests() {
  return myAxios<ApiResponse<FriendRequestVO[]>>("/api/friend/request/list", {
    method: "GET",
  });
}

// 获取我发出的好友申请
export async function getSentRequests() {
  return myAxios<ApiResponse<FriendRequestVO[]>>("/api/friend/request/sent", {
    method: "GET",
  });
}

// 删除好友
export async function deleteFriend(friendId: number) {
  return myAxios<ApiResponse<boolean>>("/api/friend/delete", {
    method: "POST",
    params: {
      friendId,
    },
  });
}

// 修改好友备注
export async function updateFriendRemark(friendId: number, remark: string) {
  return myAxios<ApiResponse<boolean>>("/api/friend/remark", {
    method: "POST",
    params: {
      friendId,
      remark,
    },
  });
}
