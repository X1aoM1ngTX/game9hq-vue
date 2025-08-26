import { ref, onMounted, onUnmounted } from "vue";
import { useLoginUserStore } from "@/stores/useLoginUserStore";
import { useChatStore } from "@/stores/chat";
import { ChatMessageVO } from "@/api/chat";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

export function useWebSocket() {
  const userStore = useLoginUserStore();
  const chatStore = useChatStore();

  const stompClient = ref<any>(null);
  const isConnected = ref(false);

  // 连接WebSocket
  const connect = () => {
    if (!userStore.hasLogin || !userStore.loginUser?.userToken) {
      console.error("用户未登录，无法连接WebSocket");
      return;
    }

    console.log("正在连接WebSocket...");

    const socket = new SockJS(
      `http://localhost:8080/ws?token=${userStore.loginUser.userToken}`
    );
    stompClient.value = Stomp.over(socket);

    // 设置调试日志
    stompClient.value.debug = (str: string) => {
      console.log("WebSocket Debug:", str);
    };

    stompClient.value.connect(
      {},
      () => {
        isConnected.value = true;
        chatStore.setConnected(true);
        console.log("WebSocket连接成功");

        // 订阅个人消息队列
        subscribeToMessages();
        subscribeToConfirm();
        subscribeToRead();
        subscribeToOffline();
      },
      (error: any) => {
        console.error("WebSocket连接失败:", error);
        isConnected.value = false;
        chatStore.setConnected(false);

        // 3秒后重连
        setTimeout(() => {
          console.log("尝试重新连接WebSocket...");
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
        const chatMessage: ChatMessageVO = JSON.parse(message.body);
        chatStore.addMessage(chatMessage);
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
        console.log("消息已读:", chatMessage);
      }
    );
  };

  // 订阅离线消息
  const subscribeToOffline = () => {
    if (!stompClient.value || !userStore.loginUser?.userId) return;

    stompClient.value.subscribe(
      `/user/${userStore.loginUser.userId}/queue/offline`,
      (message: any) => {
        const chatMessage: ChatMessageVO = JSON.parse(message.body);
        chatStore.addMessage(chatMessage);
      }
    );
  };

  // 发送消息
  const sendMessage = (message: ChatMessageVO) => {
    if (!stompClient.value || !isConnected.value) {
      console.error("WebSocket未连接");
      return false;
    }

    stompClient.value.send("/app/chat.send", {}, JSON.stringify(message));

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
      console.log("WebSocket连接已断开");
    }
  };

  // 组件挂载时连接
  onMounted(() => {
    if (userStore.hasLogin && userStore.loginUser?.userToken) {
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
