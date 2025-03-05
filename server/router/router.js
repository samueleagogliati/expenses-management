import { createRouter, createWebHistory } from 'vue-router'
import IndexExpenses from '../../src/pages/IndexExpenses.vue'
import Calendar from '../../src/pages/Calendar.vue'
import LoginPage from '../../src/pages/LoginPage.vue'
import SignupPage from '../../src/pages/SignupPage.vue'
import Chart from '../../src/pages/Chart.vue'
import SettingsPage from '../../src/pages/SettingsPage.vue'
import Debts from '../../src/pages/Debts.vue'

import { jwtDecode } from 'jwt-decode'

const routes = [
  {
    path: '/expenses',
    component: IndexExpenses,
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    component: Calendar,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    component: LoginPage,
  },
  {
    path: '/signup',
    component: SignupPage,
  },
  {
    path: '/chart',
    component: Chart,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    component: SettingsPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/debts',
    component: Debts,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

function checkTokenValidity() {
  const token = localStorage.getItem('token')
  if (!token) {
    return false
  }
  const decodedToken = jwtDecode(token)
  const currentTime = Date.now() / 1000
  if (decodedToken.exp < currentTime) {
    return false
  }
  return true
}

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const isTokenValid = checkTokenValidity()
    if (isTokenValid) {
      next()
    } else {
      alert('Effettuare il login!')
      next('/login')
    }
  } else {
    next()
  }
})

export default router
