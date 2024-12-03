import type { App } from 'vue'
import * as antd from 'ant-design-vue'
const {
  Button: AButton,
  Input: AInput,
  Form: AForm,
  Layout: ALayout,
  Menu: AMenu,
  Table: ATable,
  Card: ACard,
  Modal: AModal,
  Dropdown: ADropdown,
  Avatar: AAvatar,
  Popconfirm: APopconfirm,
  message,
  notification,
  TreeSelect: ATreeSelect,
  Select: ASelect,
  InputNumber: AInputNumber,
  Tag: ATag,
  Radio: ARadio,
  Tree: ATree,
  Switch: ASwitch
} = antd

// 组件列表
const components = [
  AButton,
  AInput,
  AForm,
  ALayout,
  AMenu,
  ATable,
  ACard,
  AModal,
  ADropdown,
  AAvatar,
  APopconfirm,
  ATreeSelect,
  ASelect,
  AInputNumber,
  ATag,
  ARadio,
  ATree,
  ASwitch
]

export function setupAntd(app: App<Element>) {
  components.forEach(component => {
    app.use(component)
  })

  // 挂载全局方法
  app.config.globalProperties.$message = message
  app.config.globalProperties.$notification = notification
}

// 声明全局方法的类型
declare module 'vue' {
  export interface ComponentCustomProperties {
    $message: typeof message
    $notification: typeof notification
  }
} 
