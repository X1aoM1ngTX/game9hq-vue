import myAxios from "@/request";
import { useLoginUserStore } from "@/stores/useLoginUserStore";
import { getUserById } from "@/api/user";

interface NewsCreateRequest {
  newsTitle: string;
  newsContent: string;
  newsSummary: string;
  newsCoverImage: string;
}

interface NewsUpdateRequest {
  newsId: number;
  newsTitle: string;
  newsContent: string;
  newsSummary: string;
  newsCoverImage: string;
}

// API 路径前缀
const API_PREFIX = "/api/news";

// 资讯列表项接口
export interface NewsItem {
  newsId: number;
  newsTitle: string;
  newsContent: string;
  newsSummary: string;
  newsCoverImage: string;
  newsViews: number;
  newsPublishTime: string;
  newsAuthorId: number;
  newsStatus: number;
  newsCreateTime: string;
  newsUpdateTime: string;
  newsIsDelete: number;
}

// 带作者信息的资讯列表项接口
export interface NewsItemWithAuthor extends NewsItem {
  authorName?: string;
  authorAvatar?: string;
}

// 分页响应接口
export interface PageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}

// 定义通用响应接口
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 带作者信息的API响应接口
export interface NewsApiResponse<T> extends ApiResponse<T> {
  data: T;
  authors?: {
    [key: number]: {
      userNickname: string;
      userAvatar: string;
    };
  };
}

// 所有登录用户创建一个新的资讯
export const createNews = async (params: NewsCreateRequest) => {
  return await myAxios.post<ApiResponse<NewsItem>>(
    `${API_PREFIX}/create`,
    params,
  );
};

// 登录用户更新指定资讯的信息
export const updateNews = async (params: NewsUpdateRequest) => {
  return await myAxios.put<ApiResponse<NewsItem>>(
    `${API_PREFIX}/update/${params.newsId}`,
    params,
  );
};

// 登录用户逻辑删除指定资讯
export const deleteNews = (newsId: string) => {
  return myAxios.delete<ApiResponse<void>>(`${API_PREFIX}/delete/${newsId}`);
};

// 登录用户发布指定资讯
export const publishNews = (newsId: number) => {
  return myAxios.post<ApiResponse<void>>(`${API_PREFIX}/publish/${newsId}`);
};

// 登录用户将指定资讯设为草稿
export const draftNews = (newsId: number) => {
  return myAxios.post<ApiResponse<void>>(`${API_PREFIX}/draft/${newsId}`);
};

// 分页查询所有资讯列表
export const listNews = (): Promise<PageResponse<NewsItem>> => {
  return myAxios.get(`${API_PREFIX}/list`);
};

// 获取指定已发布资讯的详细信息
export const getNewsDetail = async (newsId: number) => {
  const response = await myAxios.get<NewsApiResponse<NewsItemWithAuthor>>(
    `${API_PREFIX}/get/${newsId}`,
  );

  // 如果后端没有返回作者信息，处理作者信息
  if (response.data && response.data.code === 0 && response.data.data) {
    const newsData = response.data.data;
    const userStore = useLoginUserStore();

    // 如果没有作者名称，获取作者信息
    if (!newsData.authorName) {
      // 如果是当前用户，直接使用用户信息
      if (newsData.newsAuthorId === userStore.loginUser?.userId) {
        newsData.authorName = userStore.loginUser.userNickname;
        newsData.authorAvatar = userStore.loginUser.userAvatar;
      } else {
        // 否则通过API获取用户信息
        try {
          const userResponse = await getUserById(newsData.newsAuthorId);
          if (
            userResponse.data &&
            userResponse.data.code === 0 &&
            userResponse.data.data
          ) {
            const userData = userResponse.data.data;
            newsData.authorName =
              userData.userNickname || userData.userName || "匿名用户";
            newsData.authorAvatar = userData.userAvatar || "";
          } else {
            newsData.authorName = "匿名用户";
            newsData.authorAvatar = "";
          }
        } catch (error) {
          console.error("获取作者信息失败:", error);
          newsData.authorName = "匿名用户";
          newsData.authorAvatar = "";
        }
      }
    }
  }

  return response;
};

// 获取草稿资讯的详细信息
export const getDraftNews = (newsId: number) => {
  return myAxios.get(`${API_PREFIX}/get/draft/${newsId}`);
};

// 上传资讯图片
export const uploadImage = (params: FormData) => {
  return myAxios.post<ApiResponse<string>>(`${API_PREFIX}/upload`, params, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 获取当前用户的草稿资讯列表
export const listMyDrafts = async () => {
  return await myAxios.get<ApiResponse<PageResponse<NewsItem>>>(
    `${API_PREFIX}/my/drafts`,
  );
};

// 获取当前用户的已发布资讯列表
export const listMyPublishedNews = async () => {
  return await myAxios.get<ApiResponse<PageResponse<NewsItem>>>(
    `${API_PREFIX}/my/published`,
  );
};

// 分页查询已发布的资讯列表
export const listPublishedNews = async (): Promise<
  PageResponse<NewsItemWithAuthor>
> => {
  const { data } = await myAxios.get<NewsApiResponse<PageResponse<NewsItem>>>(
    `${API_PREFIX}/list/published`,
  );
  console.log("API原始响应:", data);

  const userStore = useLoginUserStore();
  const authorCache = new Map(); // 缓存已获取的作者信息，避免重复请求

  // 处理每条资讯的作者信息
  const newsWithAuthorsPromises = data.data.records.map(
    async (news: NewsItem) => {
      // 创建带作者信息的资讯对象
      const newsWithAuthor: NewsItemWithAuthor = {
        ...news,
        authorName: "",
        authorAvatar: "",
      };

      // 如果是当前用户创建的资讯
      if (news.newsAuthorId === userStore.loginUser?.userId) {
        newsWithAuthor.authorName = userStore.loginUser.userNickname;
        newsWithAuthor.authorAvatar = userStore.loginUser.userAvatar;
        return newsWithAuthor;
      }

      // 如果已经缓存过该作者信息
      if (authorCache.has(news.newsAuthorId)) {
        const cachedAuthor = authorCache.get(news.newsAuthorId);
        newsWithAuthor.authorName = cachedAuthor.name;
        newsWithAuthor.authorAvatar = cachedAuthor.avatar;
        return newsWithAuthor;
      }

      // 否则通过API获取用户信息
      try {
        const userResponse = await getUserById(news.newsAuthorId);
        if (
          userResponse.data &&
          userResponse.data.code === 0 &&
          userResponse.data.data
        ) {
          const userData = userResponse.data.data;
          const authorName =
            userData.userNickname || userData.userName || "匿名用户";
          const authorAvatar = userData.userAvatar || "";

          // 缓存作者信息
          authorCache.set(news.newsAuthorId, {
            name: authorName,
            avatar: authorAvatar,
          });

          newsWithAuthor.authorName = authorName;
          newsWithAuthor.authorAvatar = authorAvatar;
        } else {
          newsWithAuthor.authorName = "匿名用户";
        }
      } catch (error) {
        console.error(`获取作者(ID:${news.newsAuthorId})信息失败:`, error);
        newsWithAuthor.authorName = "匿名用户";
      }

      return newsWithAuthor;
    },
  );

  // 等待所有作者信息获取完成
  const newsWithAuthors = await Promise.all(newsWithAuthorsPromises);

  return {
    records: newsWithAuthors,
    total: data.data.total,
    size: data.data.size,
    current: data.data.current,
  };
};
