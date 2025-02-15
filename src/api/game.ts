import myAxios from "@/request";

// 游戏创建请求参数接口
interface GameCreateRequest {
  gameName: string;
  gamePrice: number;
  gameStock: number;
}

// 游戏状态更新参数接口
interface GameStatusUpdateRequest {
  gameId: string | number;
  status: number;
}

// 游戏搜索参数接口
interface GameSearchRequest {
  gameName?: string;
  current: number;
  pageSize: number;
}

// 游戏详情返回数据接口
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

/**
 * 创建新游戏
 * @param params 游戏创建参数
 */
export const createGame = async (params: GameCreateRequest) => {
  return await myAxios.post("/api/game/createGame", params);
};

/**
 * 删除游戏
 * @param gameId 游戏ID
 */
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

/**
 * 更新游戏信息
 * @param params 游戏更新参数
 */
export const updateGame = (params: Partial<GameDetailVO>) => {
  return myAxios.put("/api/game/updateGame", params, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * 更新游戏上下架状态
 * @param params 状态更新参数
 */
export const updateGameStatus = (params: GameStatusUpdateRequest) => {
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

/**
 * 搜索游戏列表
 * @param params 搜索参数
 */
export const searchGames = (params: Partial<GameSearchRequest>) => {
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
 * 上传游戏封面
 * @param params FormData 包含文件数据
 */
export const uploadFile = (params: FormData) => {
  return myAxios.post("/api/game/upload", params, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};

/**
 * 获取游戏详情
 * @param gameId 游戏ID
 */
export const getGameDetail = (gameId: string | number) => {
  return myAxios.get<GameDetailVO>(`/api/game/${gameId}`);
};
