import { createApp } from 'vue'
import App from './App.vue'
import '@popperjs/core'
import router from '../server/router/router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import 'jquery'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
