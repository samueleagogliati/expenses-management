import { createApp } from 'vue'
import App from './App.vue'
import router from '../server/router/router'
import Vue3Toastify from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './style.css'
import { initializeTheme } from './utils/theme'

initializeTheme()
const app = createApp(App)
app.use(Vue3Toastify, {
  autoClose: 2000,
  position: 'top-right',
  theme: 'auto',
  pauseOnHover: true,
  closeOnClick: true,
  transition: 'slide',
})
app.use(router)
app.mount('#app')
