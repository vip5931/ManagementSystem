<template>
  <a-layout-header class="flex items-center justify-between px-4 header-wrapper">
    <div class="text-lg font-bold text-white">Management System</div>
    <user-dropdown @logout="$emit('logout')" />
  </a-layout-header>
</template>

<script setup lang="ts">
import UserDropdown from './UserDropdown.vue'

defineEmits<{
  (e: 'logout'): void
}>()
</script>

<style scoped>
.header-wrapper {
  height: 64px;
  line-height: 64px;
  background: #001529;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}
</style> 
