import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from '@/api/ajax.js'
// 导入WebSocket
// import SocketService from './api/socket_service' // 3-7 注释了这里
//导入mock
// import './mock/' // 打包或后端测试需要注释掉这里

// 引入element-ui
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 引入element图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import '@/permission' // permission control

const app = createApp(App)
app.use(ElementPlus)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(store).use(router)
app.mount('#app')
app.config.globalProperties.$axios=axios;  //配置axios的全局引用
// 连接服务器
// SocketService.Instance.connect() // 3-7 注释了这里
// app.config.globalProperties.$socket=SocketService.Instance;  //将SocketService实例对象挂载到Vue的原型上 // 3-7 注释了这里
app.config.globalProperties.$echarts = window.echarts // 将echarts对象挂载到Vue的原型上