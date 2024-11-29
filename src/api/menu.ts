import request from '@/utils/request'
import type { MenuItem } from '@/types/api'

export interface CreateMenuParams {
  parent_id: string | null
  name: string
  path: string
  component: string
  icon?: string
  permission_code: string
  status: number
}

// 转换后端菜单数据为前端所需格式
export const convertMenuData = (menu: any): MenuItem => {
  return {
    id: menu.id,
    key: menu.id.toString(),
    name: menu.name || menu.label,
    path: menu.path,
    component: menu.component,
    icon: menu.icon,
    meta: {
      roles: menu.meta?.roles || [],
      permission_code: menu.meta?.permission_code || menu.permission_code || ''
    },
    children: menu.children?.map(convertMenuData),
    status: menu.status ?? 1,
    parent_id: menu.parent_id === 'root' ? null : menu.parent_id
  }
}

export const getMenuTree = async () => {
  const data = await request<any[]>({
    url: '/menus/tree',
    method: 'get'
  })
  return data.map(convertMenuData)
}

export const createMenu = (data: CreateMenuParams) => {
  return request<MenuItem>({
    url: '/menus',
    method: 'post',
    data
  })
}

export const updateMenu = (id: string, data: Partial<CreateMenuParams>) => {
  return request<MenuItem>({
    url: `/menus/${id}`,
    method: 'put',
    data
  })
}

export const deleteMenu = (id: number) => {
  return request({
    url: `/menus/${id}`,
    method: 'delete'
  })
} 
