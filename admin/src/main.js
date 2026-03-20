import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Element Plus 配置
app.use(ElementPlus, {
  locale: zhCn,
  size: 'default'
})

// 自定义主题色
app.use((app) => {
  app.config.globalProperties.$ELEMENT = {
    size: 'default',
    zIndex: 3000
  }
})

app.use(router)
app.mount('#app')
