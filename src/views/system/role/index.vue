<template>
  <div>
    <a-card title="角色管理" :bordered="false">
      <template #extra>
        <a-button
          type="primary"
          @click="showCreateModal()"
          v-if="hasPermission"
        >
          新增角色
        </a-button>
      </template>

      <div v-if="!hasPermission" class="py-8 text-center text-gray-500">
        暂无权限访问此功能
      </div>

      <a-table
        v-else
        :columns="columns"
        :data-source="roleList"
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
              <!-- <a-button type="link" @click="showMenuPermissionModal(record)">菜单权限</a-button> -->
              <a-button type="link" @click="showEditModal(record)"
                >编辑</a-button
              >
              <a-popconfirm
                title="确定要删除此角色吗？"
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

    <!-- 新增/编辑角色弹窗 -->
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
        <a-form-item label="角色名称" name="role_name">
          <a-input
            v-model:value="formState.role_name"
            placeholder="请输入角色名称"
          />
        </a-form-item>
        <a-form-item label="角色描述" name="description">
          <a-input
            v-model:value="formState.description"
            placeholder="请输入角色描述"
          />
        </a-form-item>
        <a-form-item label="菜单权限" name="menu_ids">
          <a-tree
            v-model:checkedKeys="formState.menu_ids"
            :tree-data="menuOptions"
            checkable
            :defaultExpandAll="true"
            :expandedKeys="expandedKeys"
            :autoExpandParent="true"
            :selectedKeys="[]"
            :fieldNames="{
              title: 'title',
              key: 'key',
              children: 'children',
            }"
            style="max-height: 400px; overflow-y: auto"
          />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formState.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="权限" name="permissions">
          <a-select
            v-model:value="formState.permissions"
            mode="multiple"
            placeholder="请选择权限"
            style="width: 100%"
            :options="permissionOptions"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 菜单权限弹窗 -->
    <a-modal
      v-model:open="menuPermissionModalVisible"
      title="设置菜单权限"
      @ok="handleMenuPermissionOk"
      @cancel="handleMenuPermissionCancel"
      :confirmLoading="menuPermissionModalLoading"
      ok-text="确定"
      cancel-text="取消"
      width="600px"
    >
      <div class="menu-permission-tree">
        <a-tree
          v-model:checkedKeys="checkedMenuKeys"
          :tree-data="menuOptions"
          checkable
          :defaultExpandAll="true"
          :expandedKeys="expandedKeys"
          :autoExpandParent="true"
          :selectedKeys="[]"
          :fieldNames="{
            title: 'title',
            key: 'key',
            children: 'children',
          }"
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { message } from "ant-design-vue";
import type { TableColumnsType } from "ant-design-vue";
import type { Role } from "@/types/api";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  updateRoleMenus,
  getMenuOptions,
  getSelectedMenus,
} from "@/api/role";
import { getMenuTree } from "@/api/menu";
import { useUserStore } from "@/stores/user";
import type { MenuOption } from "@/api/role";
import dayjs from "dayjs";

// 表格列定义
const columns: TableColumnsType = [
  {
    title: "角色名称",
    dataIndex: "role_name",
    key: "role_name",
    width: "150px",
  },
  {
    title: "角色描述",
    dataIndex: "description",
    key: "description",
    width: "200px",
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
  return userStore.hasPermission("manage_roles");
});

// 数据加载和表格数据
const loading = ref(false);
const roleList = ref<Role[]>([]);

// 加载角色列表
const loadRoleList = async () => {
  if (!hasPermission.value) return;

  try {
    loading.value = true;
    const data = await getRoles();
    roleList.value = data;
  } catch (error: any) {
    console.error("Failed to load roles:", error);
    message.error("加载角色数据失败");
  } finally {
    loading.value = false;
  }
};

// 表单相关
const modalVisible = ref(false);
const modalLoading = ref(false);
const modalTitle = ref("新增角色");
const formRef = ref();
const currentId = ref<number>();

const formState = ref({
  role_name: "",
  description: "",
  menu_ids: [],
  permissions: [],
  status: 1,
});

// 表单验证规则
const rules = {
  role_name: [{ required: true, message: "请输入角色名称" }],
  description: [{ required: true, message: "请输入角色描述" }],
  menu_ids: [{ required: true, type: "array", message: "请选择菜单权限" }],
  permissions: [{ required: true, type: "array", message: "请选择权限" }],
  status: [{ required: true, message: "请选择状态" }],
};

// 菜单权限相关
const menuPermissionModalVisible = ref(false);
const menuPermissionModalLoading = ref(false);
const checkedMenuKeys = ref<string[]>([]);
const currentRole = ref<Role>();

// 转换菜单数据为树形结构
const menuOptions = ref<MenuOption[]>([]);

// 添加展开节点的控制
const expandedKeys = ref<string[]>([]);

// 加载菜单选项
const loadMenuOptions = async () => {
  try {
    const data = await getMenuOptions();
    menuOptions.value = data;
    // 设置所有节点为展开状态
    expandedKeys.value = data.map((item) => item.value);
    console.log("Menu options loaded:", data);
  } catch (error) {
    console.error("Failed to load menu options:", error);
    message.error("加载菜单选项失败");
    throw error;
  }
};

// 系统内置权限列表
const permissionOptions = [
  { label: '用户管理', value: 'manage_users' },
  { label: '角色管理', value: 'manage_roles' },
  { label: '菜单管理', value: 'manage_menus' },
  { label: '数据录入', value: 'data_input' },
  { label: '信息录入', value: 'info_input' }
]

// 显示新增弹窗
const showCreateModal = () => {
  if (!hasPermission.value) {
    message.error("暂无权限执行此操作");
    return;
  }
  modalTitle.value = "新增角色";
  currentId.value = undefined;
  formState.value = {
    role_name: "",
    description: "",
    menu_ids: [],
    permissions: [],
    status: 1,
  };
  modalVisible.value = true;
};

// 显示编辑弹窗
const showEditModal = async (record: Role) => {
  if (!hasPermission.value) {
    message.error("暂无权限执行此操作");
    return;
  }

  try {
    // 先加载菜单选项
    if (menuOptions.value.length === 0) {
      await loadMenuOptions();
    }

    // 再获取角色已选择的菜单
    const selectedMenus = await getSelectedMenus(record.id);

    modalTitle.value = "编辑角色";
    currentId.value = record.id;
    formState.value = {
      role_name: record.role_name,
      description: record.description,
      menu_ids: selectedMenus,
      permissions: record.permissions || [],
      status: record.status ?? 1,
    };

    modalVisible.value = true;
  } catch (error) {
    console.error("Failed to load data:", error);
    message.error("加载数据失败");
  }
};

// 显示菜单权限弹窗
const showMenuPermissionModal = async (record: Role) => {
  if (!hasPermission.value) {
    message.error("暂无权限执行此操作");
    return;
  }

  try {
    // 先加载菜单选项
    if (menuOptions.value.length === 0) {
      await loadMenuOptions();
    }

    // 再获取角色已选择的菜单
    const selectedMenus = await getSelectedMenus(record.id);

    currentRole.value = record;
    checkedMenuKeys.value = selectedMenus;
    menuPermissionModalVisible.value = true;
  } catch (error) {
    console.error("Failed to load data:", error);
    message.error("加载数据失败");
  }
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

    // 构造提交的数据，添加创建人ID，并将菜单ID转换回数字
    const submitData = {
      ...formState.value,
      menu_ids: formState.value.menu_ids.map(Number),
      created_by: userStore.userInfo?.id,
    };

    if (currentId.value) {
      await updateRole(currentId.value, submitData);
      message.success("更新成功");
    } else {
      await createRole(submitData);
      message.success("创建成功");
    }

    modalVisible.value = false;
    loadRoleList();
  } catch (error: any) {
    console.error("Failed to save role:", error);
    message.error(error.message || "操作失败");
  } finally {
    modalLoading.value = false;
  }
};

// 处理菜单权限确认
const handleMenuPermissionOk = async () => {
  if (!currentRole.value) return;

  try {
    menuPermissionModalLoading.value = true;
    const menuIds = checkedMenuKeys.value.map(Number);
    await updateRoleMenus(currentRole.value.id, menuIds);
    message.success("更新成功");
    menuPermissionModalVisible.value = false;
    loadRoleList();
  } catch (error: any) {
    message.error(error.message || "更新失败");
  } finally {
    menuPermissionModalLoading.value = false;
  }
};

// 处理删除
const handleDelete = async (record: Role) => {
  if (!hasPermission.value) {
    message.error("暂无权限执行此操作");
    return;
  }
  try {
    await deleteRole(record.id);
    message.success("删除成功");
    loadRoleList();
  } catch (error: any) {
    message.error(error.message || "删除失败");
  }
};

// 处理弹窗取消
const handleModalCancel = () => {
  modalVisible.value = false;
  formRef.value?.resetFields();
};

// 处理菜单权限取消
const handleMenuPermissionCancel = () => {
  menuPermissionModalVisible.value = false;
  currentRole.value = undefined;
  checkedMenuKeys.value = [];
};

// 修改初始化逻辑
onMounted(async () => {
  try {
    await Promise.all([loadRoleList(), loadMenuOptions()]);
  } catch (error) {
    console.error("Failed to initialize:", error);
  }
});
</script>

<style scoped>
/* 添加树形组件的样式 */
:deep(.ant-tree) {
  background: transparent;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  padding: 4px 8px;
}

:deep(.ant-tree-treenode) {
  padding: 4px 0;
}

/* 添加操作按钮的样式 */
:deep(.ant-btn-link) {
  padding: 4px 10px; /* 增加按钮内边距 */
  height: 28px; /* 增加按钮高度 */
  font-size: 14px; /* 增加字体大小 */
}

:deep(.space-x-2 > *) {
  margin-right: 8px !important; /* 增加按钮间距 */
}

/* 修改树节点的样式 */
:deep(.ant-tree-node-content-wrapper) {
  &:hover {
    background-color: #f5f5f5 !important;
  }

  &.ant-tree-node-selected {
    background-color: transparent !important;
  }
}

/* 修改复选框的样式 */
:deep(.ant-tree-checkbox-checked .ant-tree-checkbox-inner) {
  background-color: #1890ff;
  border-color: #1890ff;
}

/* 添加菜单权限树的样式 */
.menu-permission-tree {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
}

/* 修改树节点的样式 */
:deep(.ant-tree) {
  background: transparent;
}

:deep(.ant-tree-treenode) {
  padding: 4px 0;
  &:hover {
    background-color: #f5f5f5;
  }
}

:deep(.ant-tree-node-content-wrapper) {
  &:hover {
    background-color: transparent !important;
  }

  &.ant-tree-node-selected {
    background-color: transparent !important;
  }
}

/* 修改复选框的样式 */
:deep(.ant-tree-checkbox-checked .ant-tree-checkbox-inner) {
  background-color: #1890ff;
  border-color: #1890ff;
}

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
</style>
