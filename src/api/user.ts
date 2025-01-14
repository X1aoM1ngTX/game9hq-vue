import myAxios from "@/request";

interface UserRegisterRequest {
  userName: string;
  userPassword: string;
  userEmail: string;
}

export const userRegister = async (params: UserRegisterRequest) => {
  return await myAxios.post("/api/game/register", params);
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
