<script setup>
import FintechLogo from '@/assets/fintech-logo.svg';
import iconDashboard from '@/assets/icon-dashboard.svg';
import iconUsers from '@/assets/icon-users.svg';
import iconTransactions from '@/assets/icon-transactions.svg';
import iconInvestments from '@/assets/icon-investments.svg';
import iconBudgets from '@/assets/icon-budgets.svg';
import iconAnalytics from '@/assets/icon-analytics.svg';
import iconNotifications from '@/assets/icon-notifications.svg';
import iconAuditLogs from '@/assets/icon-audit-logs.svg';
import iconLogout from '@/assets/icon-logout.svg';
import iconHeader from '@/assets/icon-header.svg';
import iconNotifications2 from '@/assets/icon-notifications2.svg';
import iconTotalUsers from '@/assets/icon-totaluser.svg';
import iconTotalTransactions from '@/assets/icon-totaltransactions.svg';
import iconTotalRevenue from '@/assets/icon-totalrevenue.svg';
import iconActiveSessions from '@/assets/icon-activesessions.svg';
import LineChart from '@/components/LineChart.vue'
import PieChart from '@/components/PieChart.vue'
import MiniChart from '@/components/MiniChart.vue'
import { ref,onMounted } from 'vue'
import axios from 'axios'

// state utama
const stats = ref({
  totalUsers: 0,
  totalTransactions: 0,
  totalRevenue: 0,
  activeSessions: 0
})

const chartData = ref({
  labels: [],
  revenue: [],
  transactions: []
})

const getColor = (percent) => {
  return percent >= 0 ? '#22c55e' : '#ef4444' // hijau / merah
}

const quickStatsRaw = ref({})
const topCategories = ref([])
const activities = ref([])
const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

// fetch function
const fetchDashboard = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('http://localhost:8080/admin/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  
    const data = res.data.data
    console.log('Dashboard Data', res.data.data)
    quickStatsRaw.value = data.quick_stats
    // ✅ QUICK STATS
    stats.value = {
      totalUsers: data.quick_stats.total_users?.value || 0,
      totalTransactions: data.quick_stats.total_transactions?.value || 0,
      totalRevenue: data.quick_stats.total_revenue?.value || 0,
      activeSessions: data.quick_stats.active_sessions?.value || 0
    }

    // ✅ MINI CHART (ambil history daily)
    miniCharts.value = {
      users: (data.quick_stats.total_users?.history?.daily || []).map(i => i.value),
      transactions: (data.quick_stats.total_transactions?.history?.daily || []).map(i => i.value),
      revenue: (data.quick_stats.total_revenue?.history?.daily || []).map(i => i.value),
      sessions: (data.quick_stats.active_sessions?.history?.daily || []).map(i => i.value)
    }

    // ✅ MAIN CHART (mapping array jadi format chart)
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    chartData.value = {
      labels: data.chart_data.map(item => days[item._id - 1]),
      revenue: data.chart_data.map(item => item.revenue),
      transactions: data.chart_data.map(item => item.transactions)
  }

    // ✅ PIE CHART
    topCategories.value = data.top_categories.map(item => ({
      name: item._id,
      value: Math.round(item.percentage)
    }))

    // ✅ ACTIVITIES (mapping ulang)
    activities.value = data.recent_activities.map(item => ({
      name: item.actor_name,
      action: item.action_type,
      detail: item.details,
      time: item.timestamp
    }))

  } catch (err) {
    console.error(err)
  }
}

const handleLogout = async () => {
  try {
    const token = localStorage.getItem('token')

    await axios.post('http://localhost:8080/admin/logout', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

  } catch (err) {
    console.error('Logout error:', err)
  } finally {
    // tetap hapus token walaupun request gagal
    localStorage.removeItem('token')
    window.location.href = '/'
  }
}

const miniCharts = ref({
  users: [],
  transactions: [],
  revenue: [],
  sessions: []
})

// lifecycle
onMounted(() => {
  fetchDashboard()
})
</script>

<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
        <div class="brand">
            <img :src="FintechLogo" class="logo">
            <div class="titlelogo">FinTech</div>
        </div>
        <nav>
            <a class="active">
                <img :src="iconDashboard" class="icon-sidebar">
                Dashboard
            </a>
            <a @click.prevent="$router.push('/adminUsers')">
                <img :src="iconUsers" class="icon-sidebar">
                Users
            </a>
            <a @click.prevent="$router.push('/adminTransactions')">
                <img :src="iconTransactions" class="icon-sidebar">
                Transactions
            </a>
            <a @click.prevent="$router.push('/adminInvestments')">
                <img :src="iconInvestments" class="icon-sidebar">
                Investments
            </a>
            <a @click.prevent="$router.push('/adminBudgets')">
                <img :src="iconBudgets" class="icon-sidebar">
                Budgets
            </a>
            <a>
                <img :src="iconAnalytics" class="icon-sidebar">
                Analytics
            </a>
            <a>
                <img :src="iconNotifications" class="icon-sidebar">
                Notifications
            </a>
            <a>
                <img :src="iconAuditLogs" class="icon-sidebar">
                Audit Logs
            </a>
        </nav>
            <div class="logout" @click="handleLogout">
                <img :src="iconLogout" class="icon-sidebar">
                Logout
            </div>
       
    </aside>

    <!-- Main -->
    <main class="main">
      <!-- Header -->
      <div class="header">
        <img :src="iconHeader" class="icon-header">
        <input type="text" placeholder="Search users, transactions..." />
        <div class="user">
          <span class="badge">Superadmin</span>
          <img :src="iconNotifications2" class="icon-header">
          <div class="avatar">AD</div>
          <div class="username">Admin User</div>
        </div>
      </div>

      <!-- Title -->
      <h1>Dashboard Overview</h1>
      <p class="subtitle">Welcome back, Admin. Here's what's happening today.</p>

      <!-- Cards -->
      <div class="cards">
        <div class="card">
          <div class="icon-card">
            <p style="padding-right:70px">Total Users</p>
            <img :src="iconTotalUsers" class="icon-stats">
          </div>
          <h2>{{ stats.totalUsers }}</h2>
          <small 
            :style="{ color: getColor(quickStatsRaw.total_users?.change_percent || 0) }"
          >
            {{ quickStatsRaw.total_users?.change_percent || 0 }}% 
            vs last month
            {{ quickStatsRaw.total_users?.change_percent > 0 ? '↑' : '↓' }}
          </small>

          <MiniChart 
            :data="miniCharts.users" 
            :color="getColor(quickStatsRaw.total_users?.change_percent || 0)"
          />
        </div>
        <div class="card">
          <div class="icon-card">
            <p>Total Transactions</p>
            <img :src="iconTotalTransactions" class="icon-stats">
          </div>
          <h2>{{ stats.totalTransactions }}</h2>
          <small 
            :style="{ color: getColor(quickStatsRaw.total_transactions?.change_percent || 0) }"
          >
            {{ quickStatsRaw.total_transactions?.change_percent || 0 }}% 
            vs last month
            {{ quickStatsRaw.total_transactions?.change_percent > 0 ? '↑' : '↓' }}
          </small>

          <MiniChart 
            :data="miniCharts.transactions" 
            :color="getColor(quickStatsRaw.total_transactions?.change_percent || 0)"
          />
        </div>
        <div class="card">
          <div class="icon-card">
             <p style="padding-right:45px;">Total Revenue</p>
             <img :src="iconTotalRevenue" class="icon-stats">
          </div>
          <h2>${{ (stats.totalRevenue || 0).toLocaleString() }}</h2>
          <small 
            :style="{ color: getColor(quickStatsRaw.total_revenue?.change_percent || 0) }"
          >
            {{ quickStatsRaw.total_revenue?.change_percent || 0 }}% 
            vs last month
            {{ quickStatsRaw.total_revenue?.change_percent > 0 ? '↑' : '↓' }}
          </small>

          <MiniChart 
            :data="miniCharts.revenue" 
            :color="getColor(quickStatsRaw.total_revenue?.change_percent || 0)"
          />
        </div>
        <div class="card">
          <div class="icon-card">
            <p style="padding-right: 30px;">Active Sessions</p>
            <img :src="iconActiveSessions" class="icon-stats">
          </div>
          <h2>{{ stats.activeSessions }}</h2>
          <small 
            :style="{ color: getColor(quickStatsRaw.active_sessions?.change_percent || 0) }"
          >
            {{ quickStatsRaw.active_sessions?.change_percent || 0 }}% 
            vs last month
            {{ quickStatsRaw.active_sessions?.change_percent > 0 ? '↑' : '↓' }}
          </small>

          <MiniChart 
            :data="miniCharts.sessions" 
            :color="getColor(quickStatsRaw.active_sessions?.change_percent || 0)"
          />
        </div>
      </div>

      <!-- Charts -->
      <div class="charts">
        <div class="chart-box large">
        <div class="chart-title">
          <h4>
            Revenue & Transactions Overview
          </h4>
        </div>
        <div class="chart-content">
          <LineChart :data="chartData" />
        </div>
        </div>

        <div class="chart-box">
          <h4 class="chart-title">
            Top Categories
          </h4>
          <div class="chart-content">
            <PieChart :data="topCategories" />
          </div>

          <div class="legend-pie">
            <div 
              class="legend-item"
              v-for="cat in topCategories"
              :key="cat.name"
            >
              <div class="left">
                <span 
                  class="dot"
                  :class="{
                    blue: cat.name === 'Investments',
                    green: cat.name === 'Transfers',
                    yellow: cat.name === 'Bills',
                    red: cat.name === 'Shopping'
                  }"
                ></span>
                <span>{{ cat.name }}</span>
              </div>
              <b>{{ cat.value }}%</b>
            </div>
          </div>
        </div>
      </div>
    

      <!-- Activity -->
      <div class="activity">
        <h3>Recent Activities</h3>
        <div class="item" v-for="item in activities" :key="item.time">
          <span>
            {{ item.name }} - {{ item.action }}
            <small>({{ item.detail }})</small>
          </span>
          <b>{{ formatDate(item.time) }}</b>
        </div>
      </div>
    </main>
  </div>
</template>



<style scoped>
/* Layout */
.layout {
  display: flex;
  height: 100vh;
  font-family: 'Inter', sans-serif;
  background: #f5f7fb;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: #1e3a8a;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.brand {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 100px;
  margin-top: 20px;
}

.logo {
  width: 50px;
  height: 50px;
  display: block;
  color: black;
}

.titlelogo {
  font-size: 30px;
  font-weight: bold;
  margin: 0;
  line-height: 1; 
}

.sidebar nav a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  cursor: pointer;
  opacity: 0.9;
  font-size: 20px;

}

.icon-sidebar {
  width: 30px;
  height: 30px;
}

.sidebar nav a:hover {
  background: #3b82f6;
}

.sidebar nav .active {
  background: #3b82f6;
}

.logout {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  cursor: pointer;
  font-size: 20px;
}

/* Main */
.main {
  flex: 1;
  padding: 0 30px 20px 30px; 
  overflow-y: auto;
}

/* Header */
.header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 30px;
  display: flex;
  gap: 20px;
  align-items: center;
  margin: 0 -30px 24px -30px; 
}

.header input {
  width: 300px;
  font-size: 24px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.user {
  margin-left: auto; 
  display: flex;
  align-items: center;
  gap: 30px;
  cursor: pointer;
}

.icon-header {
  width: 30px;
  height: 30px;
  padding: 10px;
  cursor: pointer;
}

.badge {
  background: #e0e7ff;
  color: #3730a3;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 20px;
}

.avatar {
  width: 45px;
  height: 45px;
  background: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  font-size: 20px;
}

.username {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 20px;
}

/* Title */
h1 {
  font-size: 50px;
  margin: 0;
  font-weight: 600;
}

.subtitle {
  color: gray;
  margin-bottom: 20px;
  font-size: 24px;
  margin-top: 15px;
}

/* Cards */
.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.card {
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  font-size: 20px;
}

.card h2 {
  margin-top: 10px;
}

.icon-card{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 60%;
}

.icon-stats {
  width: 30px;
  height: 30px;
  margin-top: 5px;
}
/* Charts */
.charts {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.chart-content {
  flex: 1;
  position: relative;
  min-height: 0;
}

.chart-content :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
  display: block;

}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  color: rgb(46, 44, 44);
  font-size: 20px
}

.chart-box {
  background: white;
  height: 500px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  padding: 15px;
  color: #aaa;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.legend-pie {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
  color: black;
}

.legend-item .left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #aaa;
}

/* dot warna */
.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}

.blue { background: #1d4ed8; }
.green { background: #10b981; }
.yellow { background: #f59e0b; }
.red { background: #ef4444; }

.chart-box.large {
  height: 500px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  border-radius: 12px;
  padding: 15px;
  overflow: hidden;
}

/* Activity */
.activity {
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.activity .item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.activity .item:last-child {
  border-bottom: none;
}

</style>