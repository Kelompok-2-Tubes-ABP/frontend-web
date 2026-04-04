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
import LineChart from '@/components/LineChart.vue'
import PieChart from '@/components/PieChart.vue'
import { ref } from 'vue'
import router from '@/router';
const activeRange = ref('daily') 
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
            <a>
                <img :src="iconTransactions" class="icon-sidebar">
                Transactions
            </a>
            <a>
                <img :src="iconInvestments" class="icon-sidebar">
                Investments
            </a>
            <a>
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
            <div class="logout">
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
          <p>Total Users</p>
          <h2>12,453</h2>
        </div>
        <div class="card">
          <p>Total Transactions</p>
          <h2>8,234</h2>
        </div>
        <div class="card">
          <p>Total Revenue</p>
          <h2>$175,340</h2>
        </div>
        <div class="card">
          <p>Active Sessions</p>
          <h2>2,847</h2>
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
        <div class="chart-toggle">
          <button 
            :class="{ active: activeRange === 'Daily' }"
            @click="activeRange = 'Daily'"
          >
            Daily
          </button>
          <button 
            :class="{ active: activeRange === 'Monthly' }"
            @click="activeRange = 'Monthly'"
          >
            Monthly
          </button>
        </div>
        <div class="chart-content">
          <LineChart :range="activeRange" />
        </div>
        </div>

        <div class="chart-box">
          <h4 class="chart-title">
            Top Categories
          </h4>
          <div class="chart-content">
            <PieChart />
          </div>

          <div class="legend-pie">
            <div class="legend-item">
              <div class="left">
                <span class="dot blue"></span>
                <span>Investments</span>
              </div>
              <b>35%</b>
            </div>

            <div class="legend-item">
              <div class="left">
                <span class="dot green"></span>
                <span>Transfers</span>
              </div>
              <b>28%</b>
            </div>

            <div class="legend-item">
              <div class="left">
                <span class="dot yellow"></span>
                <span>Bills</span>
              </div>
              <b>22%</b>
            </div>

            <div class="legend-item">
              <div class="left">
                <span class="dot red"></span>
                <span>Shopping</span>
              </div>
              <b>15%</b>
            </div>
          </div>
        </div>
      </div>
    

      <!-- Activity -->
      <div class="activity">
        <h3>Recent Activities</h3>
        <div class="item">
          <span>John Doe - New investment</span>
          <b>$5,000</b>
        </div>
        <div class="item">
          <span>Jane Smith - Withdrawal</span>
          <b>$2,500</b>
        </div>
        <div class="item">
          <span>Mike Johnson - Account created</span>
          <b>-</b>
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
  padding: 20px 30px;
}

/* Header */
.header {
  display: flex;
  gap: 10px;   
  margin-bottom: 20px;
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
}

.card h2 {
  margin-top: 10px;
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

.chart-toggle {
  width: fit-content;
  background: #f1f5f9;
  padding: 4px;
  margin-bottom: 18px;
  border-radius: 18px;
  display: flex;
  gap: 4px;
}

.chart-toggle button {
  border: none;
  padding: 6px 12px;
  border-radius: 16px;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
}

.chart-toggle button.active {
  background: white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
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