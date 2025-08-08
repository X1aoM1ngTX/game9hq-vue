import myAxios from "@/request";

// 评论相关类型定义
export interface Review {
  reviewId: number;
  userId: number;
  userName: string;
  rating: number;
  content: string;
  createTime: string;
}

export interface ReviewResponse {
  records: Review[];
  total: number;
}

export interface ReviewRequest {
  gameId: number;
  rating: number;
  content: string;
}

export interface ReviewUpdateRequest {
  reviewId: number;
  rating: number;
  content: string;
}

/**
 * 获取游戏评论列表
 * @param gameId 游戏ID
 * @param current 当前页码
 * @param pageSize 每页数量
 */
export function getGameReviews(
  gameId: number,
  current: number,
  pageSize: number,
) {
  return myAxios.get("/api/game/review/page", {
    params: {
      gameId,
      current,
      pageSize,
    },
  });
}

/**
 * 获取游戏平均评分
 * @param gameId 游戏ID
 */
export function getGameAverageRating(gameId: number) {
  return myAxios.get("/api/game/review/average", {
    params: {
      gameId,
    },
  });
}

/**
 * 添加游戏评论
 * @param data 评论数据
 */
export function addGameReview(data: ReviewRequest) {
  return myAxios.post("/api/game/review/add", data);
}

/**
 * 更新游戏评论
 * @param data 评论数据
 */
export function updateGameReview(data: ReviewUpdateRequest) {
  return myAxios.post("/api/game/review/update", data);
}

/**
 * 删除游戏评论
 * @param reviewId 评论ID
 */
export function deleteGameReview(reviewId: number) {
  return myAxios.post("/api/game/review/delete", null, {
    params: {
      reviewId,
    },
  });
}
