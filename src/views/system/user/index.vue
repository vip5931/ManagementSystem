<template>
  <div>
    <a-card title="用户管理" :bordered="false">
      <template #extra>
        <a-button 
          type="primary" 
          @click="showCreateModal()"
          v-if="hasPermission"
        >
          新增用户
        </a-button>
      </template>

      <div v-if="!hasPermission" class="py-8 text-center text-gray-500">
        暂无权限访问此功能
      </div>
      
      <a-table
        v-else
        :columns="columns"
        :data-source="userList"
        :loading="loading"
        :pagination="false"
        :row-key="record => record.id"
        :scroll="{ x: 1200 }"
        bordered
        class="custom-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">
              {{ record.status === 1 ? '启用' : '禁用' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <div class="space-x-2">
              <a-button type="link" @click="showEditModal(record)">编辑</a-button>
              <a-button 
                type="link" 
                @click="handleStatusChange(record)"
              >
                {{ record.status === 1 ? '禁用' : '启用' }}
              </a-button>
              <a-popconfirm
                title="确定要删除此用户吗？"
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

    <!-- 新增/编辑用户弹窗 -->
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
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="formState.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item 
          label="密码" 
          name="password"
          :required="!currentId"
        >
          <a-input-password 
            v-model:value="formState.password" 
            placeholder="请输入密码" 
          />
        </a-form-item>
        <a-form-item label="角色" name="role_id">
          <a-select
            v-model:value="formState.role_id"
            placeholder="请选择角色"
            style="width: 100%"
          >
            <a-select-option 
              v-for="role in roleList" 
              :key="role.id" 
              :value="role.id"
            >
              {{ role.role_name }}
            </a-select-option>
          </a-select>
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
import type { User } from '@/types/api'
import { getUsers, createUser, updateUser, deleteUser, updateUserStatus } from '@/api/user'
import { getRoles } from '@/api/role'
import { useUserStore } from '@/stores/user'
import dayjs from 'dayjs'

// 表格列定义
const columns: TableColumnsType = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    width: '150px',
  },
  {
    title: '角色',
    dataIndex: 'role_name',
    key: 'role_name',
    width: '150px',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: '80px',
    align: 'center',
  },
  {
    title: '创建人',
    dataIndex: 'created_by_name',
    key: 'created_by_name',
    width: '100px',
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: '150px',
    customRender: ({ text }) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'
  },
  {
    title: '更新人',
    dataIndex: 'updated_by_name',
    key: 'updated_by_name',
    width: '100px',
  },
  {
    title: '更新时间',
    dataIndex: 'updated_at',
    key: 'updated_at',
    width: '150px',
    customRender: ({ text }) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'
  },
  {
    title: '操作',
    key: 'action',
    width: '220px',
    fixed: 'right',
    align: 'center',
  },
]

// 检查权限
const userStore = useUserStore()
const hasPermission = computed(() => {
  return userStore.hasPermission('manage_users')
})

// 数据加载和表格数据
const loading = ref(false)
const userList = ref<User[]>([])
const roleList = ref<Role[]>([])

// 加载用户列表
const loadUserList = async () => {
  if (!hasPermission.value) return
  
  try {
    loading.value = true
    const data = await getUsers()
    userList.value = data
  } catch (error: any) {
    console.error('Failed to load users:', error)
    message.error('加载用户数据失败')
  } finally {
    loading.value = false
  }
}

// 加载角色列表
const loadRoleList = async () => {
  try {
    const data = await getRoles()
    roleList.value = data
  } catch (error) {
    console.error('Failed to load roles:', error)
    message.error('加载角色数据失败')
  }
}

// 表单相关
const modalVisible = ref(false)
const modalLoading = ref(false)
const modalTitle = ref('新增用户')
const formRef = ref()
const currentId = ref<number>()

const formState = ref({
  username: '',
  password: '',
  role_id: undefined,
  status: 1
})

// 表单验证规则
const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码', trigger: 'change' }],
  role_id: [{ required: true, message: '请选择角色' }],
  status: [{ required: true, message: '请选择状态' }],
}

// 显示新增弹窗
const showCreateModal = () => {
  if (!hasPermission.value) {
    message.error('暂无权限执行此操作')
    return
  }
  modalTitle.value = '新增用户'
  currentId.value = undefined
  formState.value = {
    username: '',
    password: '',
    role_id: undefined,
    status: 1
  }
  modalVisible.value = true
}

// 显示编辑弹窗
const showEditModal = (record: User) => {
  if (!hasPermission.value) {
    message.error('暂无权限执行此操作')
    return
  }
  modalTitle.value = '编辑用户'
  currentId.value = record.id
  formState.value = {
    username: record.username,
    password: '', // 编辑时密码为空
    role_id: record.role_id,
    status: record.status
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
    
    const submitData = {
      ...formState.value,
      created_by: userStore.userInfo?.id
    }
    
    // 如果是编辑且密码为空，则不提交密码字段
    if (currentId.value && !submitData.password) {
      delete submitData.password
    }
    
    if (currentId.value) {
      await updateUser(currentId.value, submitData)
      message.success('更新成功')
    } else {
      await createUser(submitData)
      message.success('创建成功')
    }
    
    modalVisible.value = false
    loadUserList()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  } finally {
    modalLoading.value = false
  }
}

// 处理状态变更
const handleStatusChange = async (record: User) => {
  if (!hasPermission.value) {
    message.error('暂无权限执行此操作')
    return
  }
  try {
    await updateUserStatus(record.id, record.status === 1 ? 0 : 1)
    message.success('状态更新成功')
    loadUserList()
  } catch (error: any) {
    message.error(error.message || '状态更新失败')
  }
}

// 处理删除
const handleDelete = async (record: User) => {
  if (!hasPermission.value) {
    message.error('暂无权限执行此操作')
    return
  }
  try {
    await deleteUser(record.id)
    message.success('删除成功')
    loadUserList()
  } catch (error: any) {
    message.error(error.message || '删除失败')
  }
}

// 处理弹窗取消
const handleModalCancel = () => {
  modalVisible.value = false
  formRef.value?.resetFields()
}

// 初始化
onMounted(async () => {
  try {
    await Promise.all([
      loadUserList(),
      loadRoleList()
    ])
  } catch (error) {
    console.error('Failed to initialize:', error)
  }
})
</script>

<style scoped>
/* 添加表格样式 */
:deep(.custom-table) {
  /* 表格边框 */
  .ant-table {
    border: 1px solid #f0f0f0;
  }

  /* 表头样式 */
  .ant-table-thead > tr > th {
    background-color: #fafafa;
    border-bottom: 2px solid #f0f0f0;
    font-weight: 600;
  }

  /* 单元格边框 */
  .ant-table-tbody > tr > td {
    border: 1px solid #f0f0f0;
  }

  /* 鼠标悬停行的背景色 */
  .ant-table-tbody > tr:hover > td {
    background-color: #fafafa;
  }
}

/* 添加操作按钮的样式 */
:deep(.ant-btn-link) {
  padding: 4px 10px;
  height: 28px;
  font-size: 14px;
}

:deep(.space-x-2 > *) {
  margin-right: 8px !important;
}
</style> 
