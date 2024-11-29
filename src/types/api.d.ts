export interface ResponseData<T = any> {
  code: number;
  success: boolean;
  message: string;
  data: T;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface UserInfo {
  id: number;
  username: string;
  role: Role;
  permissions: string[];
}

export interface MenuItem {
  id: number;
  name: string;
  icon?: string;
  path: string;
  component: string;
  meta?: {
    roles: string[];
    permission_code: string;
  };
  children?: MenuItem[];
  status?: number;
  parent_id?: number | null;
  permission_code?: string; // 添加这一行，使用可选属性
  children?: MenuItem[];
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
  menus: MenuItem[];
}

export interface Role {
  id: number;
  role_name: string;
  description: string;
  menu_ids: number[];
  permissions: string[];
  status?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  created_by_name?: string;
  updated_by_name?: string;
}

// 用户类型定义
export interface User {
  id: number;
  username: string;
  role_name: string;
  role_id: number;
  status: number;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  created_by_name?: string;
  updated_by_name?: string;
}
