import myAxios from "@/request";

// 添加游戏到用户游戏库
export const addGameToUserLibrary = (gameId: number) => {
  return myAxios.post("/api/userLibrary/addGameToLibrary", { gameId });
};

// 移除用户游戏库中的游戏
export const removeGameFromUserLibrary = (gameId: number) => {
  return myAxios.post("/api/userLibrary/removeGameFromLibrary", { gameId });
};

// 获取用户游戏库
export const getSelfLibrary = () => {
  return myAxios.get("/api/userLibrary/listSelfGames");
};

export const getUserLibrary = (userId?: string | number) => {
  return myAxios.get(`/api/userLibrary/listUserGames/${userId}`);
};
