<template>
  <a-dropdown>
    <div class="flex items-center cursor-pointer hover:opacity-90">
      <a-avatar :size="32" class="mr-2">
        {{ userStore.userInfo?.username.charAt(0).toUpperCase() }}
      </a-avatar>
      <span class="text-white mr-1">{{ userStore.userInfo?.username }}</span>
      <DownOutlined class="text-white text-xs" />
    </div>
    <template #overlay>
      <a-menu>
        <a-menu-item key="settings">
          <SettingOutlined />
          <span>设置</span>
        </a-menu-item>
        <a-menu-divider />
        <a-menu-item key="logout" @click="handleLogoutClick">
          <LogoutOutlined />
          <span>退出登录</span>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { DownOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'

const emit = defineEmits<{
  (e: 'logout'): void
}>()

const userStore = useUserStore()

const handleLogoutClick = () => {
  emit('logout')
}
</script> 
