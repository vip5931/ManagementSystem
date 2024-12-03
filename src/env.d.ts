/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue' {
  import type { DefineComponent } from '@vue/runtime-core'
  const component: DefineComponent<{}, {}, any>
  export default component
  export * from '@vue/runtime-core'
}

declare module '@ant-design/icons-vue' {
  export const PlusOutlined: any
  export const ThunderboltOutlined: any
  export const RiseOutlined: any
  export const BarChartOutlined: any
  export const TeamOutlined: any
} 
