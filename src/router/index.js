import { createRouter, createWebHistory } from 'vue-router'
import AdminRegister from '../views/AdminRegister.vue'
import AdminLogin from '@/views/AdminLogin.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import AdminUsers from '@/views/AdminUsers.vue'
import AdminTransactions from '@/views/AdminTransactions.vue'
import AdminInvestments from '@/views/AdminInvestments.vue'
import AdminBudgets from '@/views/AdminBudgets.vue'

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
  component: AdminDashboard
  },

  {
    path: '/adminUsers',
    name: 'AdminUsers',
    component: AdminUsers
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
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router