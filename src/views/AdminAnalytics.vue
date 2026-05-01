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
import { ref } from "vue";

// Responsive sidebar state
const isSidebarOpen = ref(false);

// Top Spenders Data
const topSpenders = ref([
  { name: 'John Doe', amount: 12500 },
  { name: 'Jane Smith', amount: 10200 },
  { name: 'Sarah Wilson', amount: 9800 },
  { name: 'Mike Johnson', amount: 8500 },
  { name: 'Emily Davis', amount: 8200 },
  { name: 'David Lee', amount: 6800 }
]);

// Price Trends Data
const priceTrends = ref([
  { month: 'Jan', stocks: 125, crypto: 110, commodities: 115 },
  { month: 'Feb', stocks: 145, crypto: 115, commodities: 120 },
  { month: 'Mar', stocks: 140, crypto: 120, commodities: 125 },
  { month: 'Apr', stocks: 160, crypto: 125, commodities: 130 },
  { month: 'May', stocks: 175, crypto: 130, commodities: 135 },
  { month: 'Jun', stocks: 185, crypto: 135, commodities: 140 }
]);

// Category Distribution Data
const categoryDistribution = ref([
  { name: 'Investments', value: 30, color: '#1e3a8a' },
  { name: 'Transfers', value: 24, color: '#10b981' },
  { name: 'Bills', value: 19, color: '#f59e0b' },
  { name: 'Shopping', value: 16, color: '#ef4444' },
  { name: 'Dining', value: 11, color: '#8b5cf6' }
]);

// Savings Progress Data
const savingsProgress = ref([
  { week: 'Week 1', target: 5000, actual: 4800 },
  { week: 'Week 2', target: 10000, actual: 9500 },
  { week: 'Week 3', target: 15000, actual: 14200 },
  { week: 'Week 4', target: 20000, actual: 19500 }
]);

// User Growth Data
const userGrowth = ref([
  { month: 'Jan', users: 8500 },
  { month: 'Feb', users: 9200 },
  { month: 'Mar', users: 10100 },
  { month: 'Apr', users: 11200 },
  { month: 'May', users: 12300 },
  { month: 'Jun', users: 13453 }
]);

// Summary Stats
const totalVolume = ref('$115,000');
const avgTransaction = ref('$1,247');
const totalUsers = ref('12,453');
const successRate = ref('97.3%');

// Toggle sidebar
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// Close sidebar when clicking outside on mobile
const closeSidebarOnMobile = () => {
  if (window.innerWidth < 1024) {
    isSidebarOpen.value = false;
  }
};

// Generate Report
const generateReport = () => {
  console.log('Generating report...');
  // Add report generation logic here
};

// Helpers
const maxSpenders = Math.max(...topSpenders.value.map(s => s.amount));
const maxPrice = 220;
const maxSavings = 20000;
const maxUsers = 14000;
</script>

<template>
  <div class="layout" :class="{ 'sidebar-open': isSidebarOpen }">
    <!-- Sidebar Toggle Button -->
    <button 
      class="sidebar-toggle" 
      @click="toggleSidebar"
      :aria-label="isSidebarOpen ? 'Close sidebar' : 'Open sidebar'"
      :class="{ 'active': isSidebarOpen }"
    >
      <svg v-if="!isSidebarOpen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6"/>
      </svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>

    <!-- Sidebar Overlay for Mobile -->
    <div v-if="isSidebarOpen" class="sidebar-overlay" @click="closeSidebarOnMobile"></div>

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="brand">
        <img :src="FintechLogo" class="logo" alt="Logo">
        <div class="titlelogo">FinTech</div>
      </div>
      <nav>
        <a @click.prevent="$router.push('/adminDashboard'); closeSidebarOnMobile()">
          <img :src="iconDashboard" class="icon-sidebar" alt="">
          Dashboard
        </a>
        <a @click.prevent="$router.push('/adminUsers'); closeSidebarOnMobile()">
          <img :src="iconUsers" class="icon-sidebar" alt="">
          Users
        </a>
        <a @click.prevent="$router.push('/adminTransactions'); closeSidebarOnMobile()">
          <img :src="iconTransactions" class="icon-sidebar" alt="">
          Transactions
        </a>
        <a @click.prevent="$router.push('/adminInvestments'); closeSidebarOnMobile()">
          <img :src="iconInvestments" class="icon-sidebar" alt="">
          Investments
        </a>
        <a @click.prevent="$router.push('/adminBudgets'); closeSidebarOnMobile()">
          <img :src="iconBudgets" class="icon-sidebar" alt="">
          Budgets
        </a>
        <a class="active">
          <img :src="iconAnalytics" class="icon-sidebar" alt="">
          Analytics
        </a>
        <a @click.prevent="$router.push('/adminNotifications'); closeSidebarOnMobile()">
          <img :src="iconNotifications" class="icon-sidebar" alt="">
          Notifications
        </a>
        <a @click.prevent="$router.push('/adminAudit'); closeSidebarOnMobile()">
          <img :src="iconAuditLogs" class="icon-sidebar" alt="">
          Audit Logs
        </a>
      </nav>
      <div class="logout" @click="closeSidebarOnMobile()">
        <img :src="iconLogout" class="icon-sidebar" alt="">
        Logout
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main">
      <!-- Header -->
      <div class="header">
        <img :src="iconHeader" class="icon-header" alt="">
        <input type="text" placeholder="Search users, transactions..." />
        <div class="user">
          <span class="role-badge">Superadmin</span>
          <img :src="iconNotifications2" class="icon-header" alt="">
          <div class="avatar">AD</div>
          <div class="username">Admin User</div>
        </div>
      </div>

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>Analytics & Reports</h1>
          <p class="subtitle">Comprehensive insights and data visualization</p>
        </div>
        <button class="generate-btn" @click="generateReport">
          <span>📊</span>
          Generate Report (PDF/CSV)
        </button>
      </div>

      <!-- Top Spenders Chart -->
      <div class="section-card">
        <h2 class="section-title">Top Spenders</h2>
        <div class="bar-chart">
          <div class="chart-container">
            <div 
              v-for="(spender, index) in topSpenders" 
              :key="index"
              class="bar-item"
            >
              <div 
                class="bar"
                :style="{ height: (spender.amount / maxSpenders * 200) + 'px' }"
              ></div>
              <span class="bar-label">{{ spender.name }}</span>
            </div>
          </div>
          <div class="y-axis">
            <span>14000</span>
            <span>10500</span>
            <span>7000</span>
            <span>3500</span>
            <span>0</span>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="charts-grid">
        <!-- Price Trends -->
        <div class="section-card">
          <h2 class="section-title">Price Trends by Asset Type</h2>
          <div class="line-chart">
            <div class="chart-area">
              <svg viewBox="0 0 600 200" class="chart-svg">
                <!-- Stocks Line -->
                <polyline
                  fill="none"
                  stroke="#1e3a8a"
                  stroke-width="2"
                  :points="priceTrends.map((d, i) => `${i * 100 + 50},${200 - (d.stocks / maxPrice * 200)}`).join(' ')"
                />
                <circle
                  v-for="(d, i) in priceTrends"
                  :key="'stocks-' + i"
                  :cx="i * 100 + 50"
                  :cy="200 - (d.stocks / maxPrice * 200)"
                  r="4"
                  fill="#1e3a8a"
                />
                
                <!-- Crypto Line -->
                <polyline
                  fill="none"
                  stroke="#f59e0b"
                  stroke-width="2"
                  :points="priceTrends.map((d, i) => `${i * 100 + 50},${200 - (d.crypto / maxPrice * 200)}`).join(' ')"
                />
                <circle
                  v-for="(d, i) in priceTrends"
                  :key="'crypto-' + i"
                  :cx="i * 100 + 50"
                  :cy="200 - (d.crypto / maxPrice * 200)"
                  r="4"
                  fill="#f59e0b"
                />
                
                <!-- Commodities Line -->
                <polyline
                  fill="none"
                  stroke="#10b981"
                  stroke-width="2"
                  :points="priceTrends.map((d, i) => `${i * 100 + 50},${200 - (d.commodities / maxPrice * 200)}`).join(' ')"
                />
                <circle
                  v-for="(d, i) in priceTrends"
                  :key="'commodities-' + i"
                  :cx="i * 100 + 50"
                  :cy="200 - (d.commodities / maxPrice * 200)"
                  r="4"
                  fill="#10b981"
                />
              </svg>
              <div class="x-axis">
                <span v-for="month in priceTrends" :key="month.month">{{ month.month }}</span>
              </div>
            </div>
            <div class="legend">
              <span class="legend-item"><span class="dot" style="background: #1e3a8a"></span> Stocks</span>
              <span class="legend-item"><span class="dot" style="background: #f59e0b"></span> Cryptocurrency</span>
              <span class="legend-item"><span class="dot" style="background: #10b981"></span> Commodities</span>
            </div>
          </div>
        </div>

        <!-- Category Distribution -->
        <div class="section-card">
          <h2 class="section-title">Category Distribution</h2>
          <div class="pie-chart">
            <svg viewBox="0 0 200 200" class="pie-svg">
              <circle
                v-for="(category, index) in categoryDistribution"
                :key="index"
                :r="80"
                cx="100"
                cy="100"
                :fill="category.color"
                :stroke-dasharray="`${category.value * 5.02} ${502 - category.value * 5.02}`"
                :stroke-dashoffset="`${-categoryDistribution.slice(0, index).reduce((acc, c) => acc + c.value * 5.02, 0)}`"
                fill="none"
                stroke-width="60"
              />
            </svg>
            <div class="pie-labels">
              <div 
                v-for="category in categoryDistribution" 
                :key="category.name"
                class="pie-label"
              >
                <span class="label-dot" :style="{ background: category.color }"></span>
                <span>{{ category.name }} {{ category.value }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Savings Progress -->
        <div class="section-card">
          <h2 class="section-title">Savings Progress (Target vs Actual)</h2>
          <div class="bar-chart-grouped">
            <div class="chart-container">
              <div 
                v-for="(week, index) in savingsProgress" 
                :key="index"
                class="bar-group"
              >
                <div class="bar-pair">
                  <div 
                    class="bar target"
                    :style="{ height: (week.target / maxSavings * 200) + 'px' }"
                  ></div>
                  <div 
                    class="bar actual"
                    :style="{ height: (week.actual / maxSavings * 200) + 'px' }"
                  ></div>
                </div>
                <span class="bar-label">{{ week.week }}</span>
              </div>
            </div>
            <div class="y-axis">
              <span>20000</span>
              <span>15000</span>
              <span>10000</span>
              <span>5000</span>
              <span>0</span>
            </div>
            <div class="legend">
              <span class="legend-item"><span class="dot" style="background: #e5e7eb"></span> Target</span>
              <span class="legend-item"><span class="dot" style="background: #10b981"></span> Actual</span>
            </div>
          </div>
        </div>

        <!-- User Growth -->
        <div class="section-card">
          <h2 class="section-title">User Growth Trend</h2>
          <div class="line-chart">
            <div class="chart-area">
              <svg viewBox="0 0 600 200" class="chart-svg">
                <polyline
                  fill="none"
                  stroke="#1e3a8a"
                  stroke-width="2"
                  :points="userGrowth.map((d, i) => `${i * 100 + 50},${200 - (d.users / maxUsers * 200)}`).join(' ')"
                />
                <circle
                  v-for="(d, i) in userGrowth"
                  :key="i"
                  :cx="i * 100 + 50"
                  :cy="200 - (d.users / maxUsers * 200)"
                  r="4"
                  fill="#1e3a8a"
                />
              </svg>
              <div class="x-axis">
                <span v-for="month in userGrowth" :key="month.month">{{ month.month }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="summary-stats">
        <div class="stat-box">
          <p class="stat-label">Total Volume</p>
          <h3 class="stat-value">{{ totalVolume }}</h3>
        </div>
        <div class="stat-box">
          <p class="stat-label">Avg. Transaction</p>
          <h3 class="stat-value">{{ avgTransaction }}</h3>
        </div>
        <div class="stat-box">
          <p class="stat-label">Total Users</p>
          <h3 class="stat-value">{{ totalUsers }}</h3>
        </div>
        <div class="stat-box">
          <p class="stat-label">Success Rate</p>
          <h3 class="stat-value success">{{ successRate }}</h3>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  font-family: 'Inter', sans-serif;
  background: #f5f7fb;
  position: relative;
}

/* Sidebar Styles */
.sidebar {
  width: 250px;
  background: #1e3a8a;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px;
  flex-shrink: 0;
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
  text-decoration: none;
  color: white;
}

.icon-sidebar {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
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

/* Main Content */
.main {
  flex: 1;
  padding: 0 30px 20px 30px; 
  overflow-y: auto;
}

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
  font-size: 14px;
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
  width: 24px;
  height: 24px;
  padding: 8px;
  cursor: pointer;
}

.role-badge {
  background: #e0e7ff;
  color: #3730a3;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
}

.avatar {
  width: 40px;
  height: 40px;
  background: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  font-size: 14px;
}

.username {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 500;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

h1 {
  font-size: 28px;
  margin: 0 0 8px 0;
  font-weight: 700;
  color: #111827;
}

.subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
  font-weight: 400;
}

.generate-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #1e3a8a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.generate-btn:hover {
  background: #3b82f6;
  transform: translateY(-1px);
}

.section-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 20px 0;
  color: #111827;
}

/* Bar Chart */
.bar-chart {
  display: flex;
  gap: 20px;
  padding: 20px 0;
}

.chart-container {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 20px;
  padding: 0 20px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.bar {
  width: 60px;
  background: #1e3a8a;
  border-radius: 8px 8px 0 0;
  transition: height 0.3s ease;
}

.bar-label {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 200px;
  font-size: 11px;
  color: #9ca3af;
  padding: 5px 0;
}

/* Line Chart */
.line-chart {
  padding: 20px 0;
}

.chart-area {
  position: relative;
}

.chart-svg {
  width: 100%;
  height: 200px;
}

.x-axis {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding: 0 50px;
  font-size: 12px;
  color: #9ca3af;
}

.legend {
  display: flex;
  gap: 20px;
  margin-top: 15px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* Pie Chart */
.pie-chart {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 20px 0;
}

.pie-svg {
  width: 200px;
  height: 200px;
  transform: rotate(-90deg);
}

.pie-labels {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pie-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
}

.label-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

/* Grouped Bar Chart */
.bar-chart-grouped {
  display: flex;
  gap: 20px;
  padding: 20px 0;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.bar-pair {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  height: 200px;
}

.bar.target {
  background: #e5e7eb;
  width: 25px;
  border-radius: 4px 4px 0 0;
}

.bar.actual {
  background: #10b981;
  width: 25px;
  border-radius: 4px 4px 0 0;
}

/* Summary Stats */
.summary-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.stat-box {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.stat-label {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.stat-value.success {
  color: #10b981;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

/* Sidebar Toggle */
.sidebar-toggle {
  display: none; 
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1001;
  background: #1e3a8a;
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  padding: 12px 8px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 36px;
  height: 48px;
}

.sidebar-toggle:hover {
  background: #3b82f6;
  transform: translateY(-50%) translateX(2px);
}

.sidebar-toggle.active {
  left: 250px;
  border-radius: 8px 0 0 8px;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar-toggle {
    display: flex;
  }
  
  .layout.sidebar-open .sidebar-overlay {
    display: block;
  }
  
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    max-height: 100vh;
    width: 260px;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    overflow: hidden;
    padding: 12px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }
  
  .layout.sidebar-open .sidebar {
    transform: translateX(0);
  }
  
  .brand {
    margin-bottom: 20px;
    margin-top: 5px;
    flex-shrink: 0;
  }
  
  .logo {
    width: 32px;
    height: 32px;
  }
  
  .titlelogo {
    font-size: 18px;
  }
  
  .sidebar nav {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 10px;
  }
  
  .sidebar nav a {
    padding: 10px 12px;
    margin-bottom: 4px;
    font-size: 14px;
  }
  
  .icon-sidebar {
    width: 22px;
    height: 22px;
  }
  
  .logout {
    margin-top: auto;
    font-size: 14px;
    padding: 10px 12px;
    flex-shrink: 0;
  }
  
  .main {
    width: 100%;
    padding: 0 15px 20px 15px;
  }
  
  .header {
    margin: 0 -15px 24px -15px;
    padding: 16px 15px;
  }
  
  .header input {
    width: 200px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .generate-btn {
    width: 100%;
    justify-content: center;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .bar {
    width: 40px;
  }
  
  .pie-chart {
    flex-direction: column;
    gap: 20px;
  }
  
  .pie-labels {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}

@media (max-width: 640px) {
  .summary-stats {
    grid-template-columns: 1fr;
  }
  
  .bar-chart,
  .bar-chart-grouped {
    overflow-x: auto;
  }
  
  .chart-container {
    min-width: 400px;
  }
}
</style>