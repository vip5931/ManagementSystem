import request from '@/utils/request'
import type { Role } from '@/types/api'

// 获取所有角色列表
export const getRoles = () => {
  return request<Role[]>({
    url: '/roles',
    method: 'get'
  })
}

// 创建角色
export interface CreateRoleParams {
  role_name: string
  description: string
  menu_ids: number[]
  permissions: string[]
  status?: number
  created_by?: number
}

export const createRole = (data: CreateRoleParams) => {
  return request<Role>({
    url: '/roles',
    method: 'post',
    data
  })
}

// 更新角色
export const updateRole = (id: number, data: Partial<CreateRoleParams>) => {
  return request<Role>({
    url: `/roles/${id}`,
    method: 'put',
    data
  })
}

// 删除角色
export const deleteRole = (id: number) => {
  return request({
    url: `/roles/${id}`,
    method: 'delete'
  })
}

// 获取角色的菜单权限
export const getRoleMenus = (roleId: number) => {
  return request<number[]>({
    url: `/roles/${roleId}/menus`,
    method: 'get'
  })
}

// 更新角色的菜单权限
export const updateRoleMenus = (roleId: number, menuIds: number[]) => {
  return request({
    url: `/roles/${roleId}/menus`,
    method: 'post',
    data: { menuIds }
  })
}

// 获取可选菜单列表
export interface MenuOption {
  value: string
  title: string
  children?: MenuOption[]
}

export const getMenuOptions = () => {
  return request<MenuOption[]>({
    url: '/menus/options',
    method: 'get'
  })
}

// 获取角色已选择的菜单
export const getSelectedMenus = (roleId: number) => {
  return request<number[]>({
    url: `/menus/selected/${roleId}`,
    method: 'get'
  })
} 
