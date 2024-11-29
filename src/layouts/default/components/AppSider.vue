<template>
  <a-layout-sider width="200" class="bg-white">
    <a-menu
      v-model:selectedKeys="selectedKeys"
      v-model:openKeys="openKeys"
      mode="inline"
      :items="menuItems"
      @select="handleSelect"
      @openChange="handleOpenChange"
    />
  </a-layout-sider>
</template>

<script setup lang="ts">
import { useMenu } from '../hooks/useMenu'

const {
  selectedKeys,
  openKeys,
  menuItems,
  handleSelect,
  handleOpenChange
} = useMenu()
</script>

<style scoped>
:deep(.ant-layout-sider) {
  border-right: 1px solid #f0f0f0;
}
</style> 
