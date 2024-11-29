import type { App } from 'vue'
import {
  Button,
  Input,
  Form,
  Layout,
  Menu,
  Table,
  Card,
  Modal,
  Dropdown,
  Avatar,
  Popconfirm,
  message,
  notification,
  TreeSelect,
  Select,
  InputNumber,
  Tag,
  Radio,
  Tree
} from 'ant-design-vue'

// 组件列表
const components = [
  Button,
  Input,
  Form,
  Layout,
  Menu,
  Table,
  Card,
  Modal,
  Dropdown,
  Avatar,
  Popconfirm,
  TreeSelect,
  Select,
  InputNumber,
  Tag,
  Radio,
  Tree
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
