<template>
  <div>
    <a-card title="菜单管理" :bordered="false">
      <template #extra>
        <a-button 
          type="primary" 
          @click="showCreateModal()"
          v-if="hasPermission"
        >
          新增菜单
        </a-button>
      </template>

      <div v-if="!hasPermission" class="py-8 text-center text-gray-500">
        暂无权限访问此功能
      </div>
      
      <a-table
        v-else
        :columns="columns"
        :data-source="menuList"
        :loading="loading"
        :pagination="false"
        :row-key="record => record.id.toString()"
        :indent-size="24"
        :expanded-row-keys="expandedKeys"
        @expand="handleExpand"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <span class="flex items-center">
              <component :is="record.icon" v-if="record.icon" class="mr-2" />
              {{ record.name }}
            </span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">
              {{ record.status === 1 ? '启用' : '禁用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="space-x-2">
              <a-button type="link" @click="showCreateModal(record)">添加子菜单</a-button>
              <a-button type="link" @click="showEditModal(record)">编辑</a-button>
              <a-popconfirm
                title="确定要删除此菜单吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record)"
              >
                <a-button type="link" danger>删除</a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑菜单弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :confirmLoading="modalLoading"
      ok-text="确定"
      cancel-text="取消"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="上级菜单" name="parent_id">
          <a-tree-select
            v-model:value="formState.parent_id"
            :tree-data="menuTreeData"
            placeholder="请选择上级菜单，不选则为一级菜单"
            allow-clear
            :disabled="!!currentParentId"
            :tree-default-expand-all="true"
          />
        </a-form-item>
        <a-form-item label="菜单名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入菜单名称" />
        </a-form-item>
        <a-form-item label="路由路径" name="path">
          <a-input v-model:value="formState.path" placeholder="请输入路由路径" />
        </a-form-item>
        <a-form-item label="组件路径" name="component">
          <a-input v-model:value="formState.component" placeholder="请输入组件路径" />
        </a-form-item>
        <a-form-item label="图标" name="icon">
          <a-select 
            v-model:value="formState.icon" 
            placeholder="请选择图标" 
            allow-clear
            :show-search="true"
            :filter-option="filterIcon"
            style="width: 100%"
          >
            <a-select-option v-for="icon in iconList" :key="icon" :value="icon">
              <div class="flex items-center">
                <component :is="icon" class="mr-2" />
                <span>{{ iconNameMap[icon] || icon }}</span>
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item 
          label="权限编码" 
          name="permission_code"
          extra="请输入权限编码，例如：manage_menus、ceshi_ceshi"
        >
          <a-input 
            v-model:value="formState.permission_code" 
            placeholder="请输入权限编码" 
          >
            <template #prefix>
              <KeyOutlined />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formState.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import type { MenuItem } from '@/types/api'
import type { CreateMenuParams } from '@/api/menu'
import { getMenuTree, createMenu, updateMenu, deleteMenu } from '@/api/menu'
import * as Icons from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { KeyOutlined } from '@ant-design/icons-vue'

const userStore = useUserStore()

// 检查是否有菜单管理权限
const hasPermission = computed(() => {
  return userStore.hasPermission('manage_menus')
})

// 表格列定义
const columns: TableColumnsType = [
  {
    title: '菜单名称',
    dataIndex: 'name',
    key: 'name',
    width: '250px',
    align: 'left',
  },
  {
    title: '路由路径',
    dataIndex: 'path',
    key: 'path',
    width: '200px',
    ellipsis: true,
  },
  {
    title: '组件路径',
    dataIndex: 'component',
    key: 'component',
    width: '200px',
    ellipsis: true,
  },
  {
    title: '权限编码',
    dataIndex: ['meta', 'permission_code'],
    key: 'permission_code',
    width: '150px',
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: '80px',
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    width: '280px',
    fixed: 'right',
    align: 'center',
  },
]

// 添加图标搜索过滤函数
const filterIcon = (input: string, option: any) => {
  const iconName = option.value?.toLowerCase()
  const searchText = input.toLowerCase()
  const chineseName = iconNameMap[option.value] || ''
  
  return iconName.includes(searchText) || 
         chineseName.toLowerCase().includes(searchText)
}

// 图标中文映射
const iconNameMap: Record<string, string> = {
  HomeOutlined: '首页',
  UserOutlined: '用户',
  TeamOutlined: '团队',
  FileOutlined: '文件',
  FolderOutlined: '文件夹',
  SettingOutlined: '设置',
  DashboardOutlined: '仪表盘',
  AppstoreOutlined: '应用',
  MenuOutlined: '菜单',
  BarsOutlined: '列表',
  TableOutlined: '表格',
  FormOutlined: '表单',
  ProfileOutlined: '详情',
  CheckOutlined: '检查',
  LockOutlined: '锁定',
  KeyOutlined: '密钥',
  ToolOutlined: '工具',
  GiftOutlined: '礼物',
  TrophyOutlined: '奖杯',
}

// 可用图标列表
const iconList = Object.keys(Icons)
  .filter(key => key.endsWith('Outlined'))
  .sort((a, b) => {
    const aName = iconNameMap[a] || a
    const bName = iconNameMap[b] || b
    return aName.localeCompare(bName)
  })

// 数据加载和表格数据
const loading = ref(false)
const menuList = ref<MenuItem[]>([])

// 获取菜单树数据
const loadMenuTree = async () => {
  if (!hasPermission.value) {
    return
  }
  
  try {
    loading.value = true
    const data = await getMenuTree()
    menuList.value = data
  } catch (error: any) {
    console.error('Failed to load menu tree:', error)
    if (error.response?.status === 403) {
      message.error('暂无权限访问此功能')
    } else {
      message.error('加载菜单数据失败')
    }
  } finally {
    loading.value = false
  }
}

// 表单相关
const modalVisible = ref(false)
const modalLoading = ref(false)
const modalTitle = ref('新增菜单')
const formRef = ref()
const currentId = ref<number>()
const currentParentId = ref<number | null>(null)

const formState = ref({
  parent_id: null,
  name: '',
  path: '',
  component: '',
  icon: undefined,
  permission_code: '',
  status: 1
})

// 修改表单验证规则
const rules = {
  name: [{ required: true, message: '请输入菜单名称' }],
  path: [{ required: true, message: '请输入路由路径' }],
  component: [{ required: true, message: '请输入组件路径' }],
  permission_code: [{ required: true, message: '请输入权限编码' }],
}

// 转换菜单数据为树选择器数据
const menuTreeData = computed(() => {
  const convert = (menus: MenuItem[]): any[] => {
    return menus.map(menu => ({
      value: menu.key,
      title: menu.name,
      children: menu.children?.length ? convert(menu.children) : undefined
    }))
  }
  
  return [
    {
      value: 'root',
      title: '顶级菜单',
    },
    ...convert(menuList.value)
  ]
})

// 显示新增弹窗
const showCreateModal = (parentMenu?: MenuItem) => {
  if (!hasPermission.value) {
    message.error('暂无权限执行此操作')
    return
  }
  modalTitle.value = parentMenu ? `新增 ${parentMenu.name} 的子菜单` : '新增菜单'
  currentId.value = undefined
  currentParentId.value = parentMenu?.key ?? null
  
  formState.value = {
    parent_id: parentMenu?.key ?? null,
    name: '',
    path: '',
    component: '',
    icon: undefined,
    permission_code: '',
    status: 1
  }
  modalVisible.value = true
}

// 显示编辑弹窗
const showEditModal = (record: MenuItem) => {
  if (!hasPermission.value) {
    message.error('暂无权限执行此操作')
    return
  }
  modalTitle.value = '编辑菜单'
  currentId.value = record.id
  formState.value = {
    parent_id: record.parent_id || null,
    name: record.name,
    path: record.path,
    component: record.component,
    icon: record.icon,
    permission_code: record.meta?.permission_code || '',
    status: record.status ?? 1
  }
  modalVisible.value = true
}

// 处理弹窗确认
const handleModalOk = async () => {
  if (!hasPermission.value) {
    message.error('暂无权限执行此操作')
    return
  }
  try {
    await formRef.value.validate()
    modalLoading.value = true
    
    // 构造提交的数据
    const submitData = {
      parent_id: formState.value.parent_id === 'root' ? null : formState.value.parent_id,
      name: formState.value.name,
      path: formState.value.path,
      component: formState.value.component,
      icon: formState.value.icon,
      permission_code: formState.value.permission_code,
      status: formState.value.status,
    }
    
    if (currentId.value) {
      await updateMenu(currentId.value, submitData)
      message.success('更新成功')
    } else {
      await createMenu(submitData)
      message.success('创建成功')
    }
    
    modalVisible.value = false
    loadMenuTree()
  } catch (error: any) {
    console.error('Failed to save menu:', error)
    message.error(error.message || '操作失败')
  } finally {
    modalLoading.value = false
  }
}

// 处理弹窗取消
const handleModalCancel = () => {
  modalVisible.value = false
  formRef.value?.resetFields()
}

// 处理删除
const handleDelete = async (record: MenuItem) => {
  if (!hasPermission.value) {
    message.error('暂无权限执行此操作')
    return
  }
  try {
    await deleteMenu(record.id)
    message.success('删除成功')
    loadMenuTree()
  } catch (error: any) {
    message.error(error.message || '删除失败')
  }
}

// 修改展开行的控制
const expandedKeys = ref<string[]>([])

// 处理展开/收起
const handleExpand = (expanded: boolean, record: MenuItem) => {
  const key = record.id.toString()
  if (expanded) {
    expandedKeys.value = [...expandedKeys.value, key]
  } else {
    expandedKeys.value = expandedKeys.value.filter(k => k !== key)
  }
}

onMounted(() => {
  loadMenuTree()
})
</script>

<style scoped>
:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-table-row-indent + .ant-table-row-expand-icon) {
  margin-top: 2px;
}

:deep(.ant-table-cell) {
  vertical-align: middle !important;
}

:deep(.ant-select-selection-item) {
  display: flex !important;
  align-items: center !important;
}

:deep(.ant-select-item-option-content) {
  display: flex !important;
  align-items: center !important;
}
</style> 
