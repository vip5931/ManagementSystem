import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { setupAntd } from './plugins/antd'
import { useUserStore } from '@/stores/user'

// 引入样式
import 'ant-design-vue/dist/reset.css'
import './styles/index.less'
import 'uno.css'

const app = createApp(App)

// 注册插件
setupAntd(app)
app.use(router)
app.use(pinia)

// 初始化用户状态
const userStore = useUserStore()
await userStore.initState()

app.mount('#app')
