<template>
  <div v-if="modelValue" class="dialog-wrapper">
    <div class="dialog-mask" @click="handleClose"></div>
    <div class="dialog" :style="{ width: width }">
      <div class="dialog-header">
        <div class="dialog-title">{{ title }}</div>
        <div class="dialog-close" @click="handleClose">
          <close-outlined />
        </div>
      </div>
      <div class="dialog-body">
        <slot></slot>
      </div>
      <div class="dialog-footer">
        <a-space size="middle">
          <a-button @click="handleClose">取消</a-button>
          <a-button type="primary" @click="handleConfirm">确定</a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CloseOutlined } from '@ant-design/icons-vue/lib/icons'

defineOptions({
  name: 'Dialog'
})

const props = defineProps<{
  modelValue: boolean
  title: string
  width?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
}>()

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped lang="less">
.dialog-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.45);
}

.dialog {
  position: relative;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08);
  min-width: 320px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  padding: 16px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dialog-close {
  font-size: 16px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.45);
  transition: color 0.2s;
  
  &:hover {
    color: rgba(0, 0, 0, 0.88);
  }
}

.dialog-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.dialog-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: flex-end;
}
</style> 
