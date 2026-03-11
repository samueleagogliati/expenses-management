import { createApp } from 'vue'
import App from './App.vue'
import '@popperjs/core'
import router from '../server/router/router'
import Vue3Toastify from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import 'jquery'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const app = createApp(App)
app.use(Vue3Toastify, {
  autoClose: 2000,
  position: 'top-right',
  theme: 'auto',
  pauseOnHover: true,
  closeOnClick: true,
  transition: 'slide',
})
app.use(ElementPlus)
app.use(router)
app.mount('#app')
