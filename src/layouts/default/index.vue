<template>
  <a-layout class="main-layout">
    <app-header @logout="showLogoutModal" />
    <a-layout>
      <app-sider />
      <a-layout>
        <a-layout-content class="main-content">
          <div class="content-wrapper">
            <router-view></router-view>
          </div>
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

<style lang="less" scoped>
.main-layout {
  height: 100vh;
  overflow: hidden;

  .main-content {
    height: calc(100vh - 64px);  // 减去头部高度
    margin-top: 64px;  // 头部高度
    padding: 24px;
    overflow: hidden;  // 防止外层滚动
    background: #f0f2f5;

    .content-wrapper {
      height: 100%;
      overflow-y: auto;  // 内容区域可滚动
      background: #fff;
      border-radius: 2px;
      padding: 24px;

      // 美化滚动条
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 3px;

        &:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      }

      &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05);
      }
    }
  }
}
</style> 
