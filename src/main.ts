import { App, createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import globalComponents from '@/components'
import { initializeNews } from '@/hooks/news'
import router from './router'
import store from './store'
import i18n from './locale'
import directive from './directive'
import Apps from './App.vue'
import '@arco-design/web-vue/dist/arco.css'
import '@/assets/style/global.less'
import '@/api/interceptor'

const app: App = createApp(Apps)

app.config.errorHandler = (err, vm, info) => {
  console.error(err, info)
  // Optionally show an error message to users
}

app.use(ArcoVue, {})
app.use(ArcoVueIcon)

app.use(router)
app.use(store)
app.use(i18n)
app.use(globalComponents)
app.use(directive)

initializeNews()

app.mount('#app')
