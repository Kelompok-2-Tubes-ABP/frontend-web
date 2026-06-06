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
import UserOnBoard from '@/views/User/UserOnBoard.vue'
import UserLogin from '@/views/User/UserLogin.vue'
import UserRegister from '@/views/User/UserRegister.vue'
import UserForgotPass from '@/views/User/UserForgotPass.vue'
import UserDashboard from '@/views/User/UserDashboard.vue'
import UserTransaction from '@/views/User/UserTransaction.vue'
import UserBudget from '@/views/User/UserBudget.vue'
import UserTabungan from '@/views/User/UserTabungan.vue'
import UserInvestasi from '@/views/User/UserInvestasi.vue'
import UserHutang from '@/views/User/UserHutang.vue'
import UserRecurring from '@/views/User/UserRecurring.vue'
import UserBill from '@/views/User/UserBill.vue'
import UserInsights from '@/views/User/UserInsights.vue'
import UserChatBot from '@/views/User/UserChatBot.vue'
import UserPengaturan from '@/views/User/UserPengaturan.vue'
import UserNotifikasi from '@/views/User/UserNotifikasi.vue'

const routes = [
  {
    path: '/adminLogin',
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
    component: AdminTransactions,
    meta: { requiresAuth: true }
  },

  {
    path: '/adminInvestments',
    name: 'AdminInvestments',
    component: AdminInvestments,
    meta: { requiresAuth: true }
  },

  {
  path: '/adminBudgets',
  name: 'AdminBudgets',
  component: AdminBudgets,
  meta: { requiresAuth: true }
  },

  {
  path: '/adminAnalytics',
  name: 'AdminAnalytics',
  component: AdminAnalytics,
  meta: { requiresAuth: true }
  },

  {
  path: '/adminNotifications',
  name: 'AdminNotifications',
  component: AdminNotifications,
  meta: { requiresAuth: true }
  },

  {
  path: '/adminAuditLogs',
  name: 'AdminAudit',
  component: AdminAuditLogs,
  meta: { requiresAuth: true }
  },

  {path: '/', name: 'UserOnBoard', component: UserOnBoard, meta: { requiresAuth: false }},
  {path: '/userLogin', name: 'UserLogin', component: UserLogin, meta: { requiresAuth: false }},
  {path: '/userRegister', name: 'UserRegister', component: UserRegister, meta: { requiresAuth: false }},
  {path: '/userForgotPass', name: 'userForgotPass', component: UserForgotPass, meta: { requiresAuth: false }},
  {path: '/userDashboard', name: 'userDashboard', component: UserDashboard, meta: { requiresAuth: true }},
  {path: '/userTransaction', name: 'userTransaction', component: UserTransaction, meta: { requiresAuth: true }},
  {path: '/userBudget', name: 'userBudget', component: UserBudget, meta: { requiresAuth: true }},
  {path: '/userTabungan', name: 'userTabungan', component: UserTabungan, meta: { requiresAuth: true }},
  {path: '/userInvestasi', name: 'userInvestasi', component: UserInvestasi, meta: { requiresAuth: true }},
  {path: '/userHutang', name: 'userHutang', component: UserHutang, meta: { requiresAuth: true }},
  {path: '/userRecurring', name: 'userRecurring', component: UserRecurring, meta: { requiresAuth: true }},
  {path: '/userBill', name: 'userBill', component: UserBill, meta: { requiresAuth: true }},
  {path: '/userInsights', name: 'userInsights', component: UserInsights, meta: { requiresAuth: true }},
  {path: '/userChatBot', name: 'userChatBot', component: UserChatBot, meta: { requiresAuth: true }},
  {path: '/userPengaturan', name: 'userPengaturan', component: UserPengaturan, meta: { requiresAuth: true }},
  {path: '/userNotifikasi', name: 'userNotifikasi', component: UserNotifikasi, meta: { requiresAuth: true }}


]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const isTokenExpired = (token) => {
  if (!token) return true

  try {
    const payloadBase64 = token.split('.')[1]

    if (!payloadBase64) return true

    const payload = JSON.parse(atob(payloadBase64))
    const expiredTime = payload.exp * 1000

    return Date.now() >= expiredTime
  } catch (error) {
    console.error('Invalid token:', error)
    return true
  }
}

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const tokenExpired = token ? isTokenExpired(token) : true

  // kalau token ada tapi expired
  if (token && tokenExpired) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')

    return '/'
  }

  // kalau halaman butuh login tapi tidak ada token
  if (to.meta.requiresAuth && !token) {
    return '/'
  }

  // kalau sudah login tapi buka onboarding/login
  if (
    (to.path === '/' || to.path === '/userLogin') &&
    token &&
    !tokenExpired
  ) {
    return '/userDashboard'
  }

  return true
})

export default router