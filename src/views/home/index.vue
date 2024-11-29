<template>
  <div>
    <a-card class="mb-4">
      <div class="text-2xl font-bold">
        欢迎使用后台管理系统
      </div>
    </a-card>
    
    <div class="grid grid-cols-4 gap-4">
      <a-card>
        <template #title>总用户数</template>
        <div class="text-2xl font-bold text-blue-500">1,234</div>
      </a-card>
      
      <a-card>
        <template #title>今日活跃</template>
        <div class="text-2xl font-bold text-green-500">234</div>
      </a-card>
      
      <a-card>
        <template #title>订单总数</template>
        <div class="text-2xl font-bold text-purple-500">5,234</div>
      </a-card>
      
      <a-card>
        <template #title>销售额</template>
        <div class="text-2xl font-bold text-orange-500">¥12,234</div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
// 这里可以添加业务逻辑
</script> 
