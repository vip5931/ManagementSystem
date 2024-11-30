<template>
  <a-card title="角色管理">
    <a-tree
      v-model:checked-keys="checkedKeys"
      :tree-data="menuTree"
      checkable
      :defaultExpandAll="true"
      :check-strictly="false"
      :fieldNames="{ key: 'id', title: 'name' }"
      @check="handleCheck"
    />
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue/es';
import type { RoleFormState } from '@/types/api';

interface TreeNode {
  id: number;
  name: string;
  children?: TreeNode[];
}

interface MenuAccess {
  role_id: number;
  menu_id: number;
  access_type: 'full' | 'partial';
}

const checkedKeys = ref<number[]>([]);
const halfCheckedKeys = ref<number[]>([]);
const menuTree = ref<TreeNode[]>([]);

const formState = reactive<RoleFormState>({
  role_name: '',
  description: '',
  menu_ids: [],
  permissions: [],
  status: 1
});

// 处理树选择
const handleCheck = (checked: number[], e: any) => {
  checkedKeys.value = checked;
  halfCheckedKeys.value = e.halfCheckedKeys || [];
};

// 转换为后端需要的格式
const convertToMenuAccess = (roleId: number): MenuAccess[] => {
  const menuAccess: MenuAccess[] = [];
  
  // 处理完全选中的节点
  checkedKeys.value.forEach(menuId => {
    menuAccess.push({
      role_id: roleId,
      menu_id: menuId,
      access_type: 'full'
    });
  });
  
  // 处理半选中的节点
  halfCheckedKeys.value.forEach(menuId => {
    menuAccess.push({
      role_id: roleId,
      menu_id: menuId,
      access_type: 'partial'
    });
  });
  
  return menuAccess;
};

// 保存角色菜单权限
const saveRoleMenus = async () => {
  try {
    const menuAccess = convertToMenuAccess(formState.id);
    
    await submitRole({
      ...formState,
      menuAccess  // 传递新的数据结构
    });
    
    message.success('保存成功');
  } catch (error) {
    message.error('保存失败');
  }
};

// 初始化树的选中状态
const initTreeChecked = (menuAccess: MenuAccess[]) => {
  const fullAccess: number[] = [];
  const partialAccess: number[] = [];
  
  menuAccess.forEach(item => {
    if (item.access_type === 'full') {
      fullAccess.push(item.menu_id);
    } else {
      partialAccess.push(item.menu_id);
    }
  });
  
  checkedKeys.value = fullAccess;
  halfCheckedKeys.value = partialAccess;
};

// 获取角色菜单数据
const getRoleMenus = async (roleId: number) => {
  try {
    const res = await fetchRoleMenus(roleId);
    initTreeChecked(res);
  } catch (error) {
    message.error('获取角色菜单失败');
  }
};
</script>

<script lang="ts">
// 添加类型声明
declare module '@/types/api' {
  interface RoleFormState {
    id?: number;
    role_name: string;
    description: string;
    menu_ids: number[];
    permissions: string[];
    status: number;
  }
}
</script>
