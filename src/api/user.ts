import myAxios from "@/request";

// 用户注册请求参数接口
interface RegisterParams {
  userName: string;
  userPassword: string;
  userCheckPassword: string;
  userEmail: string;
  verifyCode: string;
}

// 用户登录请求参数接口
interface LoginParams {
  userName: string;
  userPassword: string;
}

// 用户信息修改参数接口
interface UserModifyParams {
  userName: string;
  userNickname: string; // 添加昵称字段
  userEmail: string;
  userPhone: string;
  userProfile?: string; // 添加个人介绍字段
}

// 管理员更新用户信息参数接口
interface AdminUpdateUserParams {
  userId: string;
  userName: string;
  userNickname: string; // 添加昵称字段
  userEmail: string;
  userPhone: string;
  userIsAdmin: number;
}

/**
 * 用户注册
 * @param params 注册参数
 */
export const userRegister = async (params: RegisterParams) => {
  return await myAxios.post("/api/user/register", params);
};

/**
 * 用户登录
 * @param params 登录参数
 */
export const userLogin = async (params: LoginParams) => {
  return await myAxios.post("/api/user/login", params);
};

/**
 * 用户登出
 */
export const userLogout = async () => {
  return await myAxios.post("/api/user/logout");
};

/**
 * 获取当前登录用户信息
 */
export const getCurrentUser = () => {
  return myAxios.get("/api/user/current");
};

/**
 * 修改用户信息
 * @param params 用户信息修改参数
 */
export const userModify = async (params: UserModifyParams) => {
  return await myAxios.post("/api/user/modify", params, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * 管理员更新用户信息
 * @param params 用户信息更新参数
 */
export const adminUpdateUser = async (params: AdminUpdateUserParams) => {
  return await myAxios.post("/api/user/adminUpdate", params, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * 搜索用户
 * @param params 搜索参数
 */
export const searchUsers = async (params: { userName: string }) => {
  return await myAxios.get("/api/user/search", { params });
};

/**
 * 删除用户
 * @param id 用户ID
 */
export const deleteUser = async (userId: string | number) => {
  return await myAxios.post(
    "/api/user/delete",
    { userId },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

/**
 * 发送邮箱验证码
 * @param params 包含目标邮箱的参数
 */
export const sendVerifyCode = (params: { toEmail: string }) => {
  return myAxios.post("/api/user/sendEmailCode", params);
};

/**
 * 验证验证码
 * @param params 验证参数
 */
export const verifyCode = (params: { email: string; code: string }) => {
  return myAxios.post("/api/user/verifyCode", params);
};

/**
 * 重置密码
 * @param params 重置密码参数
 */
export const resetPassword = (params: {
  email: string;
  verifyCode: string;
  newPassword: string;
}) => {
  return myAxios.post("/api/user/resetPassword", params);
};

/**
 * 上传用户头像
 * @param formData 包含文件的 FormData 对象
 */
export const updateAvatar = (formData: FormData) => {
  return myAxios.post("/api/user/updateAvatar", formData);
};

/**
 * 批量导入用户
 * @param users 用户列表
 */
export const batchImportUsers = (users: any[]) => {
  return myAxios.post("/api/user/batchImportUsers", { users });
};

/**
 * 批量导入游戏
 * @param games 游戏列表
 */
export const batchImportGames = (games: any[]) => {
  return myAxios.post("/api/user/batchImportGames", { games });
};
