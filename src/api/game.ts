import myAxios from "@/request";

interface GameCreateRequest {
  gameName: string;
  gamePrice: number;
  gameStock: number;
}
// 添加游戏
export const createGame = async (params: GameCreateRequest) => {
  return await myAxios.post("/api/game/createGame", params);
};

// 删除游戏
export const deleteGame = (gameId: string) => {
  return myAxios.post(
    "/api/game/deleteGame",
    { gameId },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

// 更新游戏
export const updateGame = (params: any) => {
  return myAxios.put("/api/game/updateGame", params, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// 更新游戏状态
export const updateGameStatus = (params: {
  gameId: string | number;
  status: number;
}) => {
  return myAxios.put(
    "/api/game/setGameRemovedStatus",
    {
      gameId: params.gameId,
      gameIsRemoved: params.status,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

// 搜索游戏
export const searchGames = (params: any) => {
  return myAxios.post(
    "/api/game/list/page",
    {
      current: 1,
      pageSize: 10,
      ...params,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

// 添加文件上传接口
export const uploadFile = (params: any) => {
  return myAxios.post("/api/game/upload", params, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};

// 游戏详情接口
export interface GameDetailVO {
  gameId: number;
  gameName: string;
  gamePrice: number;
  gameCover: string;
  gameStock: number;
  gameDescription: string;
  gameDiscount: number;
  gameDiscountedPrices: number;
  gameDev: string;
  gamePub: string;
  gameReleaseDate: string;
  gameSaleEndTime: string;
  gameIsRemoved: number;
  gameOnSale: number;
}

// 获取游戏详情
export const getGameDetail = (gameId: string | number) => {
  return myAxios.get<GameDetailVO>(`/api/game/${gameId}`);
};
