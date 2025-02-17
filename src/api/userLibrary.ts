import myAxios from "@/request";

// 添加游戏到用户游戏库
export const addGameToUserLibrary = (gameId: number) => {
  return myAxios.post("/api/userLibrary/addGameToLibrary", { gameId });
};

export const removeGameFromUserLibrary = (gameId: number) => {
  return myAxios.post("/api/userLibrary/removeGameFromLibrary", { gameId });
};

export const getUserLibrary = () => {
  return myAxios.get("/api/userLibrary/listUserGames");
};
