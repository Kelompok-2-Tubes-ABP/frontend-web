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
import iconAuditSearch from '@/assets/icon-auditSearch.svg';
import { ref, computed, watch, onMounted } from "vue";
import axios from 'axios';

// Responsive sidebar state
const isSidebarOpen = ref(false);

// API State
const isLoading = ref(true);
const error = ref(null);

// Data State
const transactions = ref([]);
const stats = ref({ totalTransactions: 0, totalAmount: 0, pending: 0 });

// Filters
const search = ref('');
const selectedCategory = ref('All Categories');
const selectedStatus = ref('All Status');
const currentPage = ref(1);
const perPage = 10;

const categories = ['All Categories', 'Investment', 'Transfer', 'Bill Payment', 'Shopping'];
const statuses = ['All Status', 'Completed', 'Pending', 'Failed'];

// API Helpers
const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

// Fetch Stats
const fetchStats = async () => {
  try {
    const res = await axios.get('https://backend-financeapi.up.railway.app/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.data.status === 'success') {
      const qs = res.data.data.quick_stats;
      stats.value.totalTransactions = qs.total_transactions?.value || 0;
      stats.value.totalAmount = qs.total_revenue?.value || 0;
    }
  } catch (err) { console.error("Stats Fetch Error:", err); }
};

// Fetch All Transactions
const fetchTransactions = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const res = await axios.get('https://backend-financeapi.up.railway.app/admin/transactions/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    transactions.value = (res.data.data || []).map(trx => ({
      id: trx.id || trx._id,
      user: trx.user_name || 'Unknown',
      category: (trx.category || 'Other').toLowerCase(),
      amount: trx.amount || 0,
      status: trx.status || 'Pending',
      datetime: trx.date || new Date().toISOString()
    }));
  } catch (err) {
    error.value = err.message;
    console.error("Transactions Fetch Error:", err);
  } finally {
    isLoading.value = false;
  }
};

// Client-side filtering + sorting
const filteredTransactions = computed(() => {
  return transactions.value
    .filter(trx => {
      const keyword = search.value.toLowerCase();
      const matchSearch = !keyword || 
        (trx.id || '').toLowerCase().includes(keyword) ||
        (trx.user || '').toLowerCase().includes(keyword);
      const matchCategory = selectedCategory.value === 'All Categories' || trx.category === selectedCategory.value.toLowerCase();
      const matchStatus = selectedStatus.value === 'All Status' || trx.status === selectedStatus.value;
      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
});

const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / perPage));

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredTransactions.value.slice(start, start + perPage);
});

// Reset page on filter change
watch([search, selectedCategory, selectedStatus], () => { currentPage.value = 1; });

onMounted(() => {
  fetchStats();
  fetchTransactions();
});

// Toggle sidebar
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value; };
const closeSidebarOnMobile = () => { if (window.innerWidth < 1024) isSidebarOpen.value = false; };

// Logout
const handleLogout = async () => {
  try {
    await axios.post('https://backend-financeapi.up.railway.app/admin/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('token');
    window.location.href = '/';
  }
};

// Helpers
const formatDate = (dt) => {
  if (!dt) return '';
  const d = new Date(dt);
  return isNaN(d.getTime()) ? dt : d.toLocaleString();
};
</script>

<template>
  <div class="layout" :class="{ 'sidebar-open': isSidebarOpen }">
    <!-- Sidebar Toggle -->
    <button class="sidebar-toggle" @click="toggleSidebar" :class="{ 'active': isSidebarOpen }">
      <svg v-if="!isSidebarOpen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
    <div v-if="isSidebarOpen" class="sidebar-overlay" @click="closeSidebarOnMobile"></div>

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="brand"><img :src="FintechLogo" class="logo" alt="Logo"><div class="titlelogo">FinTech</div></div>
      <nav>
        <a @click.prevent="$router.push('/adminDashboard'); closeSidebarOnMobile()"><img :src="iconDashboard" class="icon-sidebar" alt=""> Dashboard</a>
        <a @click.prevent="$router.push('/adminUsers'); closeSidebarOnMobile()"><img :src="iconUsers" class="icon-sidebar" alt=""> Users</a>
        <a class="active"><img :src="iconTransactions" class="icon-sidebar" alt=""> Transactions</a>
        <a @click.prevent="$router.push('/adminInvestments'); closeSidebarOnMobile()"><img :src="iconInvestments" class="icon-sidebar" alt=""> Investments</a>
        <a @click.prevent="$router.push('/adminBudgets'); closeSidebarOnMobile()"><img :src="iconBudgets" class="icon-sidebar" alt=""> Budgets</a>
        <a @click.prevent="$router.push('/adminAnalytics'); closeSidebarOnMobile()"><img :src="iconAnalytics" class="icon-sidebar" alt=""> Analytics</a>
        <a @click.prevent="$router.push('/adminNotifications'); closeSidebarOnMobile()"><img :src="iconNotifications" class="icon-sidebar" alt=""> Notifications</a>
        <a @click.prevent="$router.push('/adminAudit'); closeSidebarOnMobile()"><img :src="iconAuditLogs" class="icon-sidebar" alt=""> Audit Logs</a>
      </nav>
      <div class="logout" @click="handleLogout"><img :src="iconLogout" class="icon-sidebar" alt=""> Logout</div>
    </aside>

    <!-- Main -->
    <main class="main">
      <!-- Header -->
      <div class="header">
        <div class="user">
          <span class="role-badge">Superadmin</span>
          <img :src="iconNotifications2" class="icon-header" alt="">
          <div class="avatar">AD</div>
          <div class="username">Admin User</div>
        </div>
      </div>

      <!-- Title -->
      <h1>Transaction Management</h1>
      <p class="subtitle">Monitor and manage all transactions</p>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="stat-card">
          <p class="stat-label">Total Transactions</p>
          <h2 class="stat-number">{{ stats.totalTransactions }}</h2>
        </div>
        <div class="stat-card">
          <p class="stat-label">Total Amount</p>
          <h2 class="stat-number">${{ stats.totalAmount.toLocaleString() }}</h2>
        </div>
        <div class="stat-card">
          <p class="stat-label">Pending</p>
          <h2 class="stat-number text-warning">{{ stats.pending }}</h2>
        </div>
      </div>

      <!-- Table Section -->
      <div class="section-card">
        <h2 class="section-title">Transaction List</h2>

        <!-- Filters -->
        <div class="filters">
          <div class="search-box">
            <img :src="iconAuditSearch" class="search-icon" alt="">
            <input v-model="search" type="text" placeholder="Search by ID, user..." />
          </div>
          <select v-model="selectedCategory" class="filter-select">
            <option v-for="cat in categories" :key="cat">{{ cat }}</option>
          </select>
          <select v-model="selectedStatus" class="filter-select">
            <option v-for="stat in statuses" :key="stat">{{ stat }}</option>
          </select>
        </div>

        <!-- Loading & Error -->
        <div v-if="isLoading" class="loading-state">Loading transactions...</div>
        <div v-else-if="error" class="empty-state" style="color: #ef4444;">Error: {{ error }}</div>

        <!-- Table -->
        <div v-else class="table-container">
          <div v-if="filteredTransactions.length === 0" class="empty-state">No transactions found.</div>
          <table v-else class="audit-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>User</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="trx in paginatedTransactions" :key="trx.id">
                <td class="timestamp">{{ trx.id }}</td>
                <td>{{ trx.user }}</td>
                <td>
                  <span class="category-badge" :class="trx.category.toLowerCase().replace(' ', '-')">
                    {{ trx.category }}
                  </span>
                </td>
                <td>${{ trx.amount.toLocaleString() }}</td>
                <td>
                  <span :class="['action-badge', trx.status.toLowerCase()]">
                    {{ trx.status }}
                  </span>
                </td>
                <td>{{ formatDate(trx.datetime) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="!isLoading && filteredTransactions.length > 0" class="pagination">
          <span class="showing">
            Showing {{ (currentPage - 1) * perPage + 1 }} to {{ Math.min(currentPage * perPage, filteredTransactions.length) }} of {{ filteredTransactions.length }} transactions
          </span>
          <div class="pagination-controls">
            <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">Previous</button>
            <button 
              v-for="page in totalPages" :key="page"
              :class="['page-number', { active: currentPage === page }]"
              @click="currentPage = page"
            >{{ page }}</button>
            <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">Next</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout { display: flex; height: 100vh; font-family: 'Inter', sans-serif; background: #f5f7fb; position: relative; }

/* Sidebar (Unchanged) */
.sidebar { width: 250px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 20px; flex-shrink: 0; }
.brand { display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 100px; margin-top: 20px; }
.logo { width: 50px; height: 50px; display: block; color: black; }
.titlelogo { font-size: 30px; font-weight: bold; margin: 0; line-height: 1; }
.sidebar nav a { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; margin-bottom: 20px; cursor: pointer; opacity: 0.9; font-size: 20px; text-decoration: none; color: white; }
.icon-sidebar { width: 30px; height: 30px; flex-shrink: 0; }
.sidebar nav a:hover, .sidebar nav .active { background: #3b82f6; }
.logout { display: flex; align-items: center; gap: 10px; margin-top: auto; cursor: pointer; font-size: 20px; }

/* Main & Header (Updated for consistency) */
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

/* Summary Cards */
.summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 25px; }
.stat-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.stat-label { margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 500; }
.stat-number { margin: 0; font-size: 40px; font-weight: 700; color: #111827; line-height: 1; }
.text-warning { color: #f59e0b; }

/* Section Card */
.section-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 20px; }
.section-title { font-size: 20px; font-weight: 700; margin: 0 0 24px 0; color: #111827; letter-spacing: -0.3px; }

/* Filters */
.filters { display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
.search-box { max-width: 320px; min-width: 200px; position: relative; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; }
.search-box input { width: 100%; padding: 10px 12px 10px 36px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
.search-box input:focus { border-color: #1e3a8a; }
.filter-select { padding: 10px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: white; cursor: pointer; outline: none; min-width: 140px; }
.filter-select:focus { border-color: #1e3a8a; }

/* Table */
.table-container { overflow-x: auto; margin-bottom: 20px; }
.audit-table { width: 100%; border-collapse: collapse; }
.audit-table th { text-align: left; padding: 12px; background: #f8fafc; border-bottom: 2px solid #e5e7eb; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
.audit-table td { padding: 16px 12px; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #374151; }
.audit-table tbody tr:hover { background: #f8fafc; }
.timestamp { font-family: 'Courier New', monospace; font-size: 13px; color: #6b7280; }

/* Category Badges */
.category-badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; }
.shopping { background: #ffe4e6; color: #9f1239; }
.investment { background: #dbeafe; color: #1e40af; }
.transfer { background: #d1fae5; color: #065f46; }
.bill-payment { background: #ede9fe; color: #5b21b6; }

.action-badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; }
.action-badge.completed { background: #d1fae5; color: #065f46; }
.action-badge.pending { background: #fef3c7; color: #92400e; }
.action-badge.failed { background: #fee2e2; color: #991b1b; }

/* Pagination */
.pagination { display: flex; justify-content: space-between; align-items: center; padding-top: 20px; border-top: 1px solid #e5e7eb; }
.showing { font-size: 13px; color: #6b7280; }
.pagination-controls { display: flex; gap: 8px; align-items: center; }
.page-btn { padding: 8px 16px; border: 1px solid #e5e7eb; background: white; border-radius: 6px; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.2s; }
.page-btn:hover:not(:disabled) { background: #f3f4f6; border-color: #d1d5db; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-number { padding: 8px 12px; border: 1px solid #e5e7eb; background: white; border-radius: 6px; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.2s; min-width: 36px; }
.page-number:hover { background: #f3f4f6; }
.page-number.active { background: #1e3a8a; color: white; border-color: #1e3a8a; }

/* States */
.loading-state, .empty-state { text-align: center; padding: 40px; color: #6b7280; font-size: 15px; }

/* Sidebar Toggle & Responsive */
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
  .filters { flex-direction: column; }
  .search-box { max-width: 100%; min-width: 100%; }
  .filter-select { width: 100%; }
  .pagination { flex-direction: column; gap: 15px; text-align: center; }
}

@media (max-width: 640px) {
  .summary-cards { grid-template-columns: 1fr; }
  .audit-table { font-size: 12px; }
  .audit-table th, .audit-table td { padding: 8px; }
}
</style>