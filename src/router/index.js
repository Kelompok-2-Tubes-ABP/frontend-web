import { createRouter, createWebHistory } from 'vue-router'
import AdminRegister from '../views/AdminRegister.vue'

const routes = [
  {
    path: '/',
    name: 'AdminRegister',
    component: AdminRegister
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router