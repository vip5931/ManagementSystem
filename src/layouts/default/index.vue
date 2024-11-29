<template>
  <a-layout class="min-h-screen">
    <app-header @logout="showLogoutModal" />
    <a-layout>
      <app-sider />
      <a-layout>
        <a-layout-content class="p-6">
          <router-view></router-view>
        </a-layout-content>
      </a-layout>
    </a-layout>

    <!-- 退出确认弹窗 -->
    <a-modal
      v-model:open="logoutModalVisible"
      title="确认退出"
      :closable="false"
      @ok="handleLogout"
      ok-text="确定"
      cancel-text="取消"
    >
      <p>确定要退出登录吗？</p>
    </a-modal>
  </a-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import { logout } from '@/api/user'
import AppHeader from './components/AppHeader.vue'
import AppSider from './components/AppSider.vue'

const router = useRouter()
const userStore = useUserStore()
const logoutModalVisible = ref(false)

// 显示退出确认弹窗
const showLogoutModal = () => {
  logoutModalVisible.value = true
}

// 处理退出登录
const handleLogout = async () => {
  try {
    await logout()
    userStore.logout()
    message.success('退出成功')
    router.push('/login')
  } catch (error: any) {
    message.error(error.message || '退出失败')
  } finally {
    logoutModalVisible.value = false
  }
}
</script>

<style scoped>
:deep(.ant-layout-content) {
  background: #fff;
  padding: 24px;
  margin: 16px;
  min-height: 280px;
}
</style> 
