import myAxios from "@/request";

interface GameCreateRequest {
  gameName: string;
  gamePrice: number;
  gameStock: number;
}

interface GameDiscountRequest {
  gameId: string | number;
  discount: number;
  saleStartTime: string | null;
  saleEndTime: string | null;
  gameOnSale: boolean;
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

/**
 * 设置游戏折扣
 * @param data 折扣信息
 */
export const setGameDiscount = (data: GameDiscountRequest) => {
  return myAxios.post("/api/game/discount", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
