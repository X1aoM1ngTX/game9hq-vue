import myAxios from "@/request";

interface UserRegisterRequest {
  userName: string;
  userPassword: string;
  userEmail: string;
}

export const userRegister = async (params: UserRegisterRequest) => {
  return await myAxios.post("/api/user/register", params);
};

export const userLogin = async (params: any) => {
  return await myAxios.post("/api/user/login", params);
};

export const userLogout = async (params: any) => {
  return await myAxios.post("/api/user/logout", params);
};

export const getCurrentUser = async () => {
  return await myAxios.get("/api/user/current");
};

export const updateUser = async (params: any) => {
  return await myAxios.post("/api/user/update", params);
};

export const adminUpdateUser = async (params: {
  userId: string;
  userIsAdmin: number;
}) => {
  return await myAxios.post(
    "/api/user/adminUpdate",
    {
      userId: params.userId,
      userIsAdmin: params.userIsAdmin,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const searchUsers = async (username: any) => {
  return await myAxios.get("/api/user/search", {
    params: {
      username: username,
    },
  });
};

export const deleteUser = async (id: string) => {
  return await myAxios.post(
    "/api/user/delete",
    { id },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

interface EmailSendToUserRequest {
  organization: string;
  email: string;
  title: string;
  content: string;
}

// 发送验证码
export const sendVerifyCode = (params: EmailSendToUserRequest) => {
  return myAxios.post("/user/sendEmail", params);
};

// 验证验证码
export const verifyCode = (params: { email: string; code: string }) => {
  return myAxios.post("/user/verifyCode", params);
};

// 重置密码
export const resetPassword = (params: {
  email: string;
  verifyCode: string;
  newPassword: string;
}) => {
  return myAxios.post("/user/resetPassword", params);
};
