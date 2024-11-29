import request from "@/utils/request";
import type { User, LoginParams, LoginResponse } from "@/types/api";

// 登录
export const login = (data: LoginParams) => {
  return request<LoginResponse>({
    url: "/auth/login",
    method: "post",
    data,
  });
};

// 获取当前用户信息
export const getCurrentUser = () => {
  return request<LoginResponse>({
    url: "/auth/current",
    method: "get",
  });
};

// 登出
export const logout = () => {
  return request({
    url: "/auth/logout",
    method: "post",
  });
};

// 获取用户列表
export const getUsers = () => {
  return request<User[]>({
    url: "/users",
    method: "get",
  });
};

// 创建用户参数类型
export interface CreateUserParams {
  username: string;
  password: string;
  role_id: number;
  status: number;
}

// 创建用户
export const createUser = (data: CreateUserParams) => {
  return request<User>({
    url: "/users",
    method: "post",
    data,
  });
};

// 更新用户
export interface UpdateUserParams
  extends Partial<Omit<CreateUserParams, "password">> {
  password?: string;
}

export const updateUser = (id: number, data: UpdateUserParams) => {
  return request<User>({
    url: `/users/${id}`,
    method: "put",
    data,
  });
};

// 删除用户
export const deleteUser = (id: number) => {
  return request({
    url: `/users/${id}`,
    method: "delete",
  });
};

// 修改用户状态
export const updateUserStatus = (id: number, status: number) => {
  return request({
    url: `/users/${id}/status`,
    method: "patch",
    data: { status },
  });
};
