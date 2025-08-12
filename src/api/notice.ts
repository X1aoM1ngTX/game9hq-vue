import myAxios from "@/request";
import type { AxiosResponse } from "axios";

/**
 * 公告类型枚举
 */
export enum NoticeType {
  NORMAL = 0, // 普通公告
  IMPORTANT = 1, // 重要公告
  SYSTEM = 2, // 系统公告
  ACTIVITY = 3, // 活动公告
}

/**
 * 公告状态枚举
 */
export enum NoticeStatus {
  DRAFT = 0, // 草稿
  PUBLISHED = 1, // 已发布
  EXPIRED = 2, // 已过期
}

/**
 * 公告基础接口
 */
export interface INotice {
  noticeId?: number;
  noticeTitle: string;
  noticeContent: string;
  noticeType: NoticeType;
  noticeStatus?: NoticeStatus;
  noticeCreatorId?: number;
  noticeCreateTime?: string;
  noticePublishTime?: string;
  noticeExpireTime?: string | null;
  noticeIsDelete?: 0 | 1;
}

/**
 * 创建公告请求
 */
export interface INoticeCreateRequest {
  noticeTitle: string;
  noticeContent: string;
  noticeType: NoticeType;
  noticeExpireTime?: string | null;
}

/**
 * 更新公告请求
 */
export interface INoticeUpdateRequest extends INoticeCreateRequest {
  noticeId: number;
  noticeStatus?: NoticeStatus;
}

/**
 * 公告查询参数
 */
export interface INoticeQueryParams {
  pageNum?: number;
  pageSize?: number;
  status?: NoticeStatus;
  type?: NoticeType;
  creatorId?: number;
  title?: string;
}

/**
 * 公告分页结果
 */
export interface INoticePage {
  records: INotice[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// API 请求配置
const API_CONFIG = {
  timeout: 10000, // 10秒超时
};

// API 路径前缀
const API_PREFIX = "/api/notices";

// 统一响应类型
type ApiResponse<T> = Promise<AxiosResponse<T>>;

/**
 * 创建公告
 */
export const createNotice = (
  noticeData: INoticeCreateRequest
): ApiResponse<INotice> => {
  return myAxios.post(`${API_PREFIX}/create`, noticeData, API_CONFIG);
};

/**
 * 更新公告
 */
export const updateNotice = (
  id: number,
  noticeData: INoticeUpdateRequest
): ApiResponse<INotice> => {
  console.log(`发送更新请求: ${API_PREFIX}/${id}`, noticeData);
  return myAxios.put(`${API_PREFIX}/update/${id}`, noticeData, API_CONFIG);
};

/**
 * 获取公告详情
 */
export const getNoticeDetail = (id: number): ApiResponse<INotice> => {
  return myAxios.get(`${API_PREFIX}/get/${id}`, API_CONFIG);
};

/**
 * 分页查询公告列表
 */
export const getNoticeList = (
  params: INoticeQueryParams
): ApiResponse<INoticePage> => {
  return myAxios.get(`${API_PREFIX}/list`, { ...API_CONFIG, params });
};

/**
 * 发布公告
 */
export const publishNotice = (id: number): ApiResponse<void> => {
  return myAxios.post(`${API_PREFIX}/publish/${id}`, null, API_CONFIG);
};

/**
 * 将公告设为草稿
 */
export const draftNotice = (id: number): ApiResponse<void> => {
  return myAxios.post(`${API_PREFIX}/draft/${id}`, null, API_CONFIG);
};

/**
 * 获取有效的公告列表
 */
export const getActiveNotices = (): ApiResponse<INotice[]> => {
  return myAxios.get(`${API_PREFIX}/list/active`, API_CONFIG);
};

/**
 * 获取指定类型的有效公告
 */
export const getActiveNoticesByType = (
  type: NoticeType
): ApiResponse<INotice[]> => {
  return myAxios.get(`${API_PREFIX}/list/active/${type}`, API_CONFIG);
};

/**
 * 删除公告
 */
export const deleteNotice = (id: number): ApiResponse<void> => {
  return myAxios.delete(`${API_PREFIX}/delete/${id}`, API_CONFIG);
};

/**
 * 批量删除公告
 * @param ids 公告ID列表
 */
export const batchDeleteNotices = (ids: number[]): ApiResponse<void> => {
  return myAxios.delete(`${API_PREFIX}/delete/batch`, {
    ...API_CONFIG,
    params: { ids },
  });
};
