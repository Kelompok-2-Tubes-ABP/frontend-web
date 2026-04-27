import { createRouter, createWebHistory } from 'vue-router'
import AdminRegister from '../views/AdminRegister.vue'
import AdminLogin from '@/views/AdminLogin.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import AdminUsers from '@/views/AdminUsers.vue'
import AdminTransactions from '@/views/AdminTransactions.vue'
import AdminInvestments from '@/views/AdminInvestments.vue'
import AdminBudgets from '@/views/AdminBudgets.vue'
import AdminAnalytics from '@/views/AdminAnalytics.vue'
import AdminNotifications from '@/views/AdminNotifications.vue'
import AdminAuditLogs from '@/views/AdminAuditLogs.vue'

const routes = [
  {
    path: '/',
    name: 'AdminLogin',
    component: AdminLogin
  },

  {
    path: '/adminRegister',
    name: 'AdminRegister',
    component: AdminRegister
  },

  {
  path: '/adminDashboard',
  name: 'AdminDashboard',
  component: AdminDashboard,
  meta: { requiresAuth: true }
  },

  {
    path: '/adminUsers',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: { requiresAuth: true }
  },

  {
    path: '/adminTransactions',
    name: 'AdminTransactions',
    component: AdminTransactions
  },

  {
    path: '/adminInvestments',
    name: 'AdminInvestments',
    component: AdminInvestments
  },

  {
  path: '/adminBudgets',
  name: 'AdminBudgets',
  component: AdminBudgets
  },

  {
  path: '/adminAnalytics',
  name: 'AdminAnalytics',
  component: AdminAnalytics
  },

  {
  path: '/adminNotifications',
  name: 'AdminNotifications',
  component: AdminNotifications
  },

  {
  path: '/adminAuditLogs',
  name: 'AdminAudit',
  component: AdminAuditLogs
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  // kalau butuh login tapi gak ada token
  if (to.meta.requiresAuth && !token) {
    next('/') // balik ke login page
  } 
  // kalau sudah login tapi buka login page
  else if (to.path === '/' && token) {
    next('/adminDashboard')
  }
  else {
    next()
  }
})

export default router