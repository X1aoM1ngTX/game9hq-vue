import { ref, onMounted, onUnmounted } from "vue";
import { useLoginUserStore } from "@/stores/useLoginUserStore";
import { useChatStore } from "@/stores/chat";
import { ChatMessageVO } from "@/api/chat";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export function useWebSocket() {
  const userStore = useLoginUserStore();
  const chatStore = useChatStore();

  const stompClient = ref<any>(null);
  const isConnected = ref(false);

  // 连接WebSocket
  const connect = () => {
    if (!userStore.hasLogin || !userStore.loginUser?.userId) {
      console.error("用户未登录，无法连接WebSocket");
      console.log("用户登录状态:", userStore.hasLogin);
      console.log("用户信息:", userStore.loginUser);
      return;
    }

    // 使用SockJS连接WebSocket
    const socket = new SockJS(
      `http://localhost:8080/api/ws?userId=${userStore.loginUser.userId}`
    );
    stompClient.value = Stomp.over(socket);

    // 设置调试日志
    stompClient.value.debug = (str: string) => {
      console.log("WebSocket Debug:", str);
    };

    stompClient.value.connect(
      {},
      () => {
        console.log("WebSocket连接成功!");
        isConnected.value = true;
        chatStore.setConnected(true);

        // 订阅个人消息队列
        console.log("开始订阅WebSocket消息队列...");
        subscribeToMessages();
        subscribeToConfirm();
        subscribeToRead();
        subscribeToOffline();
        console.log("所有WebSocket订阅完成!");
      },
      (error: any) => {
        console.error("WebSocket连接失败:", error);
        isConnected.value = false;
        chatStore.setConnected(false);

        // 3秒后重连
        setTimeout(() => {
          connect();
        }, 3000);
      }
    );
  };

  // 订阅消息
  const subscribeToMessages = () => {
    if (!stompClient.value || !userStore.loginUser?.userId) return;

    stompClient.value.subscribe(
      `/user/${userStore.loginUser.userId}/queue/messages`,
      (message: any) => {
        console.log("收到WebSocket消息:", message.body);
        try {
          const chatMessage: ChatMessageVO = JSON.parse(message.body);
          console.log("解析后的消息:", chatMessage);
          console.log("当前用户ID:", userStore.loginUser?.userId);
          console.log("消息发送者ID:", chatMessage.senderId);
          console.log("消息接收者ID:", chatMessage.receiverId);
          // 确保消息格式正确
          if (!chatMessage.messageId) {
            console.warn("消息缺少messageId，使用时间戳作为临时ID");
            chatMessage.messageId = Date.now();
          }
          if (!chatMessage.createTime) {
            console.warn("消息缺少createTime，使用当前时间");
            chatMessage.createTime = new Date().toISOString();
          }
          chatStore.addMessage(chatMessage);
          console.log("消息已添加到store");
        } catch (error) {
          console.error("解析WebSocket消息失败:", error);
        }
      }
    );
  };

  // 订阅发送确认
  const subscribeToConfirm = () => {
    if (!stompClient.value || !userStore.loginUser?.userId) return;

    stompClient.value.subscribe(
      `/user/${userStore.loginUser.userId}/queue/confirm`,
      (message: any) => {
        const chatMessage: ChatMessageVO = JSON.parse(message.body);

        // 更新本地消息的ID和状态
        if (chatMessage.messageId) {
          // 查找临时消息（使用createTime匹配）并更新为服务器返回的ID
          const tempMessageId = new Date(chatMessage.createTime).getTime();
          chatStore.updateMessage(tempMessageId, {
            messageId: chatMessage.messageId,
            status: chatMessage.status || 0,
          });
        }
      }
    );
  };

  // 订阅已读回执
  const subscribeToRead = () => {
    if (!stompClient.value || !userStore.loginUser?.userId) return;

    stompClient.value.subscribe(
      `/user/${userStore.loginUser.userId}/queue/read`,
      (message: any) => {
        const chatMessage: ChatMessageVO = JSON.parse(message.body);
      }
    );
  };

  // 订阅离线消息
  const subscribeToOffline = () => {
    if (!stompClient.value || !userStore.loginUser?.userId) return;

    stompClient.value.subscribe(
      `/user/${userStore.loginUser.userId}/queue/offline`,
      (message: any) => {
        console.log("收到离线消息:", message.body);
        try {
          const chatMessage: ChatMessageVO = JSON.parse(message.body);
          console.log("解析后的离线消息:", chatMessage);
          chatStore.addMessage(chatMessage);
          console.log("离线消息已添加到store");
        } catch (error) {
          console.error("解析离线消息失败:", error);
        }
      }
    );
  };

  // 发送消息
  const sendMessage = (message: ChatMessageVO) => {
    if (!stompClient.value || !isConnected.value) {
      console.error("WebSocket未连接");
      return false;
    }

    const messagePayload = JSON.stringify(message);
    stompClient.value.send("/app/chat.send", {}, messagePayload);

    return true;
  };

  // 发送已读回执
  const sendReadReceipt = (message: ChatMessageVO) => {
    if (!stompClient.value || !isConnected.value) {
      console.error("WebSocket未连接");
      return false;
    }

    stompClient.value.send("/app/chat.read", {}, JSON.stringify(message));

    return true;
  };

  // 断开连接
  const disconnect = () => {
    if (stompClient.value) {
      stompClient.value.disconnect();
      stompClient.value = null;
      isConnected.value = false;
      chatStore.setConnected(false);
    }
  };

  // 组件挂载时连接
  onMounted(() => {
    if (userStore.hasLogin && userStore.loginUser?.userId) {
      connect();
    }
  });

  // 组件卸载时断开连接
  onUnmounted(() => {
    disconnect();
  });

  return {
    isConnected,
    connect,
    disconnect,
    sendMessage,
    sendReadReceipt,
  };
}
