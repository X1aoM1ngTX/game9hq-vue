import myAxios from "@/request";

// 添加游戏到愿望单
export const addGameToWishlist = (gameId: number) => {
  return myAxios.post("/api/wishlist/add", { gameId });
};

// 从愿望单移除游戏
export const removeGameFromWishlist = (gameId: number) => {
  return myAxios.post("/api/wishlist/remove", { gameId });
};

// 获取当前用户的愿望单
export const getMyWishlist = () => {
  return myAxios.get("/api/wishlist/my");
};
