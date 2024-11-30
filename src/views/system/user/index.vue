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
        :row-key="(record) => record.id"
        :scroll="{ x: 1200 }"
        bordered
        class="custom-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">
              {{ record.status === 1 ? "启用" : "禁用" }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <div class="space-x-2">
              <a-button type="link" @click="showEditModal(record)"
                >编辑</a-button
              >
              <a-button type="link" @click="handleStatusChange(record)">
                {{ record.status === 1 ? "禁用" : "启用" }}
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
      width="520px"
      class="user-modal"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
      >
        <!-- 用户名和修改密码按钮在同一行 -->
        <div class="form-row">
          <a-form-item label="用户名" name="username" class="username-item">
            <div class="input-with-button">
              <a-input
                v-model:value="formState.username"
                placeholder="请输入用户名"
                :disabled="!!currentId"
                class="custom-input"
              />
              <a-button 
                v-if="currentId"
                type="link" 
                @click="togglePasswordEdit"
                class="password-btn"
              >
                {{ showPasswordEdit ? '取消修改' : '修改密码' }}
              </a-button>
            </div>
          </a-form-item>
        </div>

        <!-- 密码输入框 -->
        <a-form-item 
          v-if="showPasswordEdit || !currentId"
          label="密码" 
          name="password"
          :rules="[{ required: !currentId || showPasswordEdit, message: '请输入密码' }]"
        >
          <a-input-password
            v-model:value="formState.password"
            placeholder="请输入密码"
            class="custom-input"
          />
        </a-form-item>

        <!-- 角色选择 -->
        <a-form-item label="角色" name="role_id">
          <a-select
            v-model:value="formState.role_id"
            placeholder="请选择角色"
            class="custom-select"
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

        <!-- 状态选择 -->
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formState.status" class="custom-radio-group">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { message } from "ant-design-vue";
import type { TableColumnsType } from "ant-design-vue";
import type { User } from "@/types/api";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
} from "@/api/user";
import { getRoles } from "@/api/role";
import { useUserStore } from "@/stores/user";
import dayjs from "dayjs";

// 表格列定义
const columns: TableColumnsType = [
  {
    title: "用户名",
    dataIndex: "username",
    key: "username",
    width: "150px",
  },
  {
    title: "角色",
    dataIndex: "role_name",
    key: "role_name",
    width: "150px",
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: "80px",
    align: "center",
  },
  {
    title: "创建人",
    dataIndex: "created_by_name",
    key: "created_by_name",
    width: "100px",
  },
  {
    title: "创建时间",
    dataIndex: "created_at",
    key: "created_at",
    width: "150px",
    customRender: ({ text }) =>
      text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-",
  },
  {
    title: "更新人",
    dataIndex: "updated_by_name",
    key: "updated_by_name",
    width: "100px",
  },
  {
    title: "更新时间",
    dataIndex: "updated_at",
    key: "updated_at",
    width: "150px",
    customRender: ({ text }) =>
      text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-",
  },
  {
    title: "操作",
    key: "action",
    width: "220px",
    fixed: "right",
    align: "center",
  },
];

// 检查权限
const userStore = useUserStore();
const hasPermission = computed(() => {
  return userStore.hasPermission("manage_users");
});

// 数据加载和表格数据
const loading = ref(false);
const userList = ref<User[]>([]);
const roleList = ref<Role[]>([]);

// 加载用户列表
const loadUserList = async () => {
  if (!hasPermission.value) return;

  try {
    loading.value = true;
    const data: any = await getUsers();
    userList.value = data;
  } catch (error: any) {
    console.error("Failed to load users:", error);
    message.error("加载用户数据失败");
  } finally {
    loading.value = false;
  }
};

// 加载角色列表
const loadRoleList = async () => {
  try {
    const data = await getRoles();
    roleList.value = data;
  } catch (error) {
    console.error("Failed to load roles:", error);
    message.error("加载角色数据失败");
  }
};

// 表单相关
const modalVisible = ref(false);
const modalLoading = ref(false);
const modalTitle = ref("新增用户");
const formRef = ref();
const currentId = ref<number>();

const formState = ref({
  username: "",
  password: "",
  role_id: undefined,
  status: 1,
});

// 表单验证规则
const rules = {
  username: [{ required: true, message: "请输入用户名" }],
  password: [{ required: true, message: "请输入密码", trigger: "change" }],
  role_id: [{ required: true, message: "请选择角色" }],
  status: [{ required: true, message: "请选择状态" }],
};

// 添加密码编辑状态控制
const showPasswordEdit = ref(false);

// 切换密码编辑状态
const togglePasswordEdit = () => {
  showPasswordEdit.value = !showPasswordEdit.value;
  if (!showPasswordEdit.value) {
    // 取消修改密码时清空密码字段
    formState.value.password = '';
    // 移除密码字段的验证
    formRef.value?.clearValidate('password');
  }
};

// 显示新增弹窗
const showCreateModal = () => {
  if (!hasPermission.value) {
    message.error("暂无权限执行此操作");
    return;
  }
  modalTitle.value = "新增用户";
  currentId.value = undefined;
  formState.value = {
    username: "",
    password: "",
    role_id: undefined,
    status: 1,
  };
  modalVisible.value = true;
};

// 显示编辑弹窗
const showEditModal = (record: User) => {
  if (!hasPermission.value) {
    message.error("暂无权限执行此操作");
    return;
  }
  modalTitle.value = "编辑用户";
  currentId.value = record.id;
  showPasswordEdit.value = false; // 重置密码编辑状态
  formState.value = {
    username: record.username,
    password: '', // 清空密码
    role_id: record.role_id,
    status: record.status,
  };
  modalVisible.value = true;
};

// 处理弹窗确认
const handleModalOk = async () => {
  if (!hasPermission.value) {
    message.error("暂无权限执行此操作");
    return;
  }
  try {
    await formRef.value.validate();
    modalLoading.value = true;

    const submitData = {
      ...formState.value,
      created_by: userStore.userInfo?.id,
    };

    // 如果是编辑模式且没有修改密码，删除密码字段
    if (currentId.value && !showPasswordEdit.value) {
      delete submitData.password;
    }

    if (currentId.value) {
      await updateUser(currentId.value, submitData);
      message.success("更新成功");
    } else {
      await createUser(submitData);
      message.success("创建成功");
    }

    modalVisible.value = false;
    loadUserList();
  } catch (error: any) {
    message.error(error.message || "操作失败");
  } finally {
    modalLoading.value = false;
  }
};

// 处理状态变更
const handleStatusChange = async (record: User) => {
  if (!hasPermission.value) {
    message.error("暂无权限执行此操作");
    return;
  }
  try {
    await updateUserStatus(record.id, record.status === 1 ? 0 : 1);
    message.success("状态更新成功");
    loadUserList();
  } catch (error: any) {
    message.error(error.message || "状态更新失败");
  }
};

// 处理删除
const handleDelete = async (record: User) => {
  if (!hasPermission.value) {
    message.error("暂无权限执行此操作");
    return;
  }
  try {
    await deleteUser(record.id);
    message.success("删除成功");
    loadUserList();
  } catch (error: any) {
    message.error(error.message || "删除失败");
  }
};

// 处理弹窗取消
const handleModalCancel = () => {
  modalVisible.value = false;
  showPasswordEdit.value = false; // 重置密码编辑状态
  formRef.value?.resetFields();
};

// 初始化
onMounted(async () => {
  try {
    await Promise.all([loadUserList(), loadRoleList()]);
  } catch (error) {
    console.error("Failed to initialize:", error);
  }
});
</script>

<style lang="less" scoped>
.user-modal {
  :deep(.ant-modal-body) {
    padding: 24px 32px;
  }

  :deep(.ant-form-item) {
    margin-bottom: 24px;
  }

  .form-row {
    position: relative;
    margin-bottom: 24px;

    .username-item {
      margin-bottom: 0;
    }

    .input-with-button {
      display: flex;
      align-items: center;
      gap: 8px;

      .custom-input {
        flex: 1;
      }

      .password-btn {
        padding: 0 8px;
        font-size: 14px;
        height: 32px;
        line-height: 32px;
        color: #1890ff;

        &:hover {
          color: #40a9ff;
        }
      }
    }
  }

  .custom-input,
  .custom-select {
    height: 32px;
    border-radius: 4px;
    border: 1px solid #d9d9d9;
  }

  .custom-radio-group {
    display: flex;
    gap: 32px;

    :deep(.ant-radio-wrapper) {
      font-size: 14px;
      color: #595959;
    }
  }

  :deep(.ant-form-item-label > label) {
    font-size: 14px;
    color: #262626;
    height: 32px;
    line-height: 32px;
  }

  :deep(.ant-select-selector) {
    height: 32px !important;
    padding: 0 11px !important;

    .ant-select-selection-search-input {
      height: 30px !important;
    }

    .ant-select-selection-item {
      line-height: 30px !important;
    }
  }
}

// 优化表单项间距
:deep(.ant-form-item-explain) {
  min-height: 24px;
  padding-top: 4px;
}
</style>
