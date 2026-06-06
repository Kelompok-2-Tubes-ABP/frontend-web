<script setup>
import { ref, onMounted } from "vue";
import { API_BASE } from '../../services/api.js';
// Import Icons
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

// Import Chart Components
import BarChart from '@/components/charts/BarChart.vue';
import LineChart from '@/components/charts/LineChart.vue';
import PieChart from '@/components/charts/PieChart.vue';
import GroupedBarChart from '@/components/charts/GroupedBarChart.vue';

// State
const isSidebarOpen = ref(false);
const isLoading = ref(true);
const error = ref(null);

// Data mapped for the components
const topSpendersData = ref([]);
const categoryData = ref([]);
const savingsData = ref([]);
const summaryStats = ref({ totalVolume: '$0', avgTransaction: '$0', totalUsers: '0', successRate: '0%' });

// Data formatted specifically for the reusable LineChart component
const priceTrendsChart = ref({ labels: [], datasets: [] });
const userGrowthChart = ref({ labels: [], datasets: [] });

// Fetch from Go Backend
const fetchAnalytics = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token'); 
    const response = await fetch(`${API_BASE}/admin/analytics`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error('Failed to fetch analytics. Check admin token.');
    const result = await response.json();
    const data = result.data; 
    
    // 1. Summary Stats (Bottom Stats from Backend)
    const stats = data.bottom_stats || {};
    summaryStats.value = {
      totalVolume: `$${(stats.total_volume || 0).toLocaleString()}`,
      avgTransaction: `$${(stats.avg_transaction || 0).toLocaleString()}`,
      totalUsers: (stats.total_users || 0).toLocaleString(),
      successRate: `${stats.success_rate || 0}%`
    };
    
    // 2. Top Spenders (Bar Chart)
    topSpendersData.value = (data.top_spenders || []).map(ts => ({ 
      name: ts.name || 'Unknown', 
      amount: ts.total_spent || 0 
    }));

    // 3. Category Distribution (Pie Chart)
    const pieColors = ['#1e3a8a', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    categoryData.value = (data.category_distribution || []).map((cat, i) => ({
      name: cat._id || 'Other', 
      value: Math.round(cat.percentage || 0), 
      color: pieColors[i % pieColors.length]
    }));

    // 4. User Growth (Line Chart - Single Line)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const growthData = data.user_growth_trend || [];
    userGrowthChart.value = {
      labels: growthData.map(ug => monthNames[(ug._id || 1) - 1] || `Month ${ug._id}`),
      datasets: [{ 
        name: 'Total Users', 
        color: '#1e3a8a', 
        values: growthData.map(ug => ug.total_users || 0) 
      }]
    };

    // 5. Price Trends (Line Chart - Multiple Lines)
    const priceData = data.price_trends || [];
    priceTrendsChart.value = {
      labels: priceData.map(pt => pt.month),
      datasets: [
        { name: 'Stocks', color: '#1e3a8a', values: priceData.map(pt => pt.Stocks || 0) },
        { name: 'Crypto', color: '#f59e0b', values: priceData.map(pt => pt.Cryptocurrency || 0) },
        { name: 'Commodities', color: '#10b981', values: priceData.map(pt => pt.Commodities || 0) }
      ]
    };

    // 6. Savings Progress (Grouped Bar Chart)
    savingsData.value = (data.savings_progress || []).map(sp => ({
      week: sp.week,
      target: sp.target || 0,
      actual: sp.actual || 0
    }));
    
  } catch (err) {
    error.value = err.message;
    console.error("Analytics Fetch Error:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchAnalytics);

const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value; };
const closeSidebarOnMobile = () => { if (window.innerWidth < 1024) isSidebarOpen.value = false; };

// Logout API
const handleLogout = async () => {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  try {
    await fetch(`${API_BASE}/admin/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('token');
    window.location.href = '/';
  }
};
</script>

<template>
  <div class="layout" :class="{ 'sidebar-open': isSidebarOpen }">
    <!-- Sidebar Toggle & Overlay -->
    <button class="sidebar-toggle" @click="toggleSidebar" :class="{ 'active': isSidebarOpen }">
      <svg v-if="!isSidebarOpen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
    <div v-if="isSidebarOpen" class="sidebar-overlay" @click="closeSidebarOnMobile"></div>

    <!-- Sidebar (Exact match to Budgets page) -->
    <aside class="sidebar">
      <div class="brand"><img :src="FintechLogo" class="logo" alt="Logo"><div class="titlelogo">FinTech</div></div>
      <nav>
        <a @click.prevent="$router.push('/adminDashboard'); closeSidebarOnMobile()"><img :src="iconDashboard" class="icon-sidebar" alt=""> Dashboard</a>
        <a @click.prevent="$router.push('/adminUsers'); closeSidebarOnMobile()"><img :src="iconUsers" class="icon-sidebar" alt=""> Users</a>
        <a @click.prevent="$router.push('/adminTransactions'); closeSidebarOnMobile()"><img :src="iconTransactions" class="icon-sidebar" alt=""> Transactions</a>
        <a @click.prevent="$router.push('/adminInvestments'); closeSidebarOnMobile()"><img :src="iconInvestments" class="icon-sidebar" alt=""> Investments</a>
        <a @click.prevent="$router.push('/adminBudgets'); closeSidebarOnMobile()"><img :src="iconBudgets" class="icon-sidebar" alt=""> Budgets</a>
        <a class="active"><img :src="iconAnalytics" class="icon-sidebar" alt=""> Analytics</a>
        <a @click.prevent="$router.push('/adminNotifications'); closeSidebarOnMobile()"><img :src="iconNotifications" class="icon-sidebar" alt=""> Notifications</a>
        <a @click.prevent="$router.push('/adminAudit'); closeSidebarOnMobile()"><img :src="iconAuditLogs" class="icon-sidebar" alt=""> Audit Logs</a>
      </nav>
      <div class="logout" @click="handleLogout"><img :src="iconLogout" class="icon-sidebar" alt=""> Logout</div>
    </aside>

    <!-- Main Content -->
    <main class="main">
      <!-- Header (Exact match to Budgets page) -->
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

      <!-- Loading & Error States -->
      <div v-if="isLoading" class="loading-state"><p>Loading analytics data from backend...</p></div>
      <div v-else-if="error" class="error-state">
        <p>Failed to load analytics: {{ error }}</p>
        <button @click="fetchAnalytics">Retry</button>
      </div>

      <!-- Data Loaded -->
      <template v-else>
        <h1>Analytics & Reports</h1>
        <p class="subtitle">Comprehensive insights and data visualization</p>

        <!-- Summary Cards (Figma Layout) -->
        <div class="summary-cards">
          <div class="stat-card">
            <p class="stat-label">Total Volume</p>
            <h2 class="stat-number">{{ summaryStats.totalVolume }}</h2>
            <div class="stat-footer"><span class="stat-subtitle">↗ Platform-wide</span></div>
          </div>
          <div class="stat-card">
            <p class="stat-label">Avg. Transaction</p>
            <h2 class="stat-number">{{ summaryStats.avgTransaction }}</h2>
            <div class="stat-footer"><span class="stat-subtitle">Per transaction</span></div>
          </div>
          <div class="stat-card">
            <p class="stat-label">Total Users</p>
            <h2 class="stat-number">{{ summaryStats.totalUsers }}</h2>
            <div class="stat-footer"><span class="stat-subtitle">Active accounts</span></div>
          </div>
          <div class="stat-card">
            <p class="stat-label">Success Rate</p>
            <h2 class="stat-number text-success">{{ summaryStats.successRate }}</h2>
            <div class="stat-footer"><span class="stat-subtitle">Transaction success</span></div>
          </div>
        </div>

        <!-- Top Spenders (Figma Layout) -->
        <div class="section-card">
          <h2 class="section-title">Top Spenders</h2>
          <BarChart :data="topSpendersData" />
        </div>

        <!-- Charts Grid (Figma Layout) -->
        <div class="charts-grid">
          <div class="section-card">
            <h2 class="section-title">Price Trends by Asset Type</h2>
            <LineChart :labels="priceTrendsChart.labels" :datasets="priceTrendsChart.datasets" />
          </div>

          <div class="section-card">
            <h2 class="section-title">Category Distribution</h2>
            <PieChart :data="categoryData" />
          </div>

          <div class="section-card">
            <h2 class="section-title">Savings Progress (Target vs Actual)</h2>
            <GroupedBarChart :data="savingsData" />
          </div>

          <div class="section-card">
            <h2 class="section-title">User Growth Trend</h2>
            <LineChart :labels="userGrowthChart.labels" :datasets="userGrowthChart.datasets" />
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>

.layout { display: flex; height: 100vh; font-family: 'Inter', sans-serif; background: #f5f7fb; position: relative; }
.sidebar { width: 250px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 20px; flex-shrink: 0; }
.brand { display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 100px; margin-top: 20px; }
.logo { width: 50px; height: 50px; display: block; color: black; }
.titlelogo { font-size: 30px; font-weight: bold; margin: 0; line-height: 1; }
.sidebar nav a { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; margin-bottom: 20px; cursor: pointer; opacity: 0.9; font-size: 20px; text-decoration: none; color: white; }
.icon-sidebar { width: 30px; height: 30px; flex-shrink: 0; }
.sidebar nav a:hover, .sidebar nav .active { background: #3b82f6; }
.logout { display: flex; align-items: center; gap: 10px; margin-top: auto; cursor: pointer; font-size: 20px; }

.main { flex: 1; padding: 0 30px 20px 30px; overflow-y: auto; }
.header { background-color: #ffffff; border-bottom: 1px solid #e5e7eb; padding: 16px 30px; display: flex; gap: 20px; align-items: center; margin: 0 -30px 24px -30px; }
.header input { width: 300px; font-size: 24px; padding: 10px; border-radius: 8px; border: 1px solid #ddd; }
.user { margin-left: auto; display: flex; align-items: center; gap: 30px; cursor: pointer; }
.icon-header { width: 30px; height: 30px; padding: 10px; cursor: pointer; }
.role-badge { background: #e0e7ff; color: #3730a3; padding: 5px 10px; border-radius: 8px; font-size: 20px; }
.avatar { width: 45px; height: 45px; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold; font-size: 20px; }
.username { display: flex; align-items: center; gap: 5px; font-size: 20px; }

h1 { font-size: 36px; margin: 0 0 8px 0; font-weight: 700; color: #111827; letter-spacing: -0.5px; }
.subtitle { color: #6b7280; margin: 0 0 30px 0; font-size: 16px; font-weight: 400; }

.summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
.stat-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.stat-label { margin: 0; color: #6b7280; font-size: 14px; font-weight: 500; }
.stat-number { margin: 8px 0; font-size: 40px; font-weight: 700; color: #111827; line-height: 1; }
.text-success { color: #10b981; }
.stat-footer { display: flex; align-items: center; gap: 6px; margin-top: 8px; }
.stat-subtitle { font-size: 13px; font-weight: 500; color: #10b981; }

.section-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 20px; }
.section-title { font-size: 20px; font-weight: 700; margin: 0 0 24px 0; color: #111827; letter-spacing: -0.3px; }
.charts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }

.loading-state, .error-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; color: #6b7280; font-size: 16px; }
.error-state { color: #ef4444; }
.error-state button { margin-top: 15px; padding: 8px 16px; background: #1e3a8a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }

.sidebar-toggle { display: none; position: fixed; left: 0; top: 50%; transform: translateY(-50%); z-index: 1001; background: #1e3a8a; color: white; border: none; border-radius: 0 8px 8px 0; padding: 12px 8px; cursor: pointer; align-items: center; justify-content: center; box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; width: 36px; height: 48px; }
.sidebar-toggle.active { left: 250px; border-radius: 8px 0 0 8px; }
.sidebar-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); z-index: 999; }

@media (max-width: 1024px) {
  .sidebar-toggle { display: flex; }
  .layout.sidebar-open .sidebar-overlay { display: block; }
  .sidebar { position: fixed; top: 0; left: 0; height: 100vh; max-height: 100vh; width: 260px; z-index: 1000; transform: translateX(-100%); transition: transform 0.3s ease; overflow: hidden; padding: 12px; box-sizing: border-box; display: flex; flex-direction: column; }
  .layout.sidebar-open .sidebar { transform: translateX(0); }
  .brand { margin-bottom: 20px; margin-top: 5px; flex-shrink: 0; }
  .logo { width: 32px; height: 32px; }
  .titlelogo { font-size: 18px; }
  .sidebar nav { flex: 1; overflow-y: auto; margin-bottom: 10px; }
  .sidebar nav a { padding: 10px 12px; margin-bottom: 4px; font-size: 14px; }
  .icon-sidebar { width: 22px; height: 22px; }
  .logout { margin-top: auto; font-size: 14px; padding: 10px 12px; flex-shrink: 0; }
  
  .main { width: 100%; padding: 0 15px 20px 15px; }
  .header { margin: 0 -15px 24px -15px; padding: 16px 15px; }
  .header input { width: 200px; font-size: 16px; }
  .icon-header { width: 24px; height: 24px; padding: 8px; }
  .role-badge { font-size: 14px; }
  .avatar { width: 36px; height: 36px; font-size: 14px; }
  .username { font-size: 14px; }
  
  h1 { font-size: 28px; }
  .subtitle { font-size: 14px; }
  
  .summary-cards { grid-template-columns: repeat(2, 1fr); }
  .charts-grid { grid-template-columns: 1fr; }
}
</style>