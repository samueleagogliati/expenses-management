import { createRouter, createWebHistory } from 'vue-router'
import { toast } from 'vue3-toastify'
import { getValidToken } from '../../src/utils/session'

const routes = [
  {
    path: '/expenses',
    component: () => import('../../src/pages/Expenses.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    component: () => import('../../src/pages/Calendar.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    component: () => import('../../src/pages/LoginPage.vue'),
  },
  {
    path: '/signup',
    component: () => import('../../src/pages/SignupPage.vue'),
  },
  {
    path: '/chart',
    component: () => import('../../src/pages/Chart.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    component: () => import('../../src/pages/SettingsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/groups',
    component: () => import('../../src/pages/Groups.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/groups/:group_id',
    component: () => import('../../src/pages/ShowGroup.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, left: 0 }
  },
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    if (!getValidToken()) {
      toast.error('Effettuare il login!')
      return '/login'
    }
  }
  return true
})

export default router
