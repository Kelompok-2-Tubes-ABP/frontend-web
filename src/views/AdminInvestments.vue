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
import { ref, computed, watch, onMounted } from "vue";
import { API_BASE } from '../../services/api.js';
const isSidebarOpen = ref(false);
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value; };
const closeSidebarOnMobile = () => { if (window.innerWidth < 1024) isSidebarOpen.value = false; };
import axios from 'axios';
const currentPage = ref(1);
const perPage = 10;
const search = ref("");
const status = ref("");
const investments = ref([])
const stats = ref({
  totalInvested: 0,
  currentValue: 0,
  gainLoss: 0,
  performance: 0
})

const fetchInvestments = async () => {
  try {
    const token = localStorage.getItem('token')

    const res = await axios.get(`${API_BASE}/admin/investments`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        search: search.value,
        status: status.value
      }
    })

    console.log('INVESTMENTS:', res.data.data)

    const list = res.data.data || []

    investments.value = list.map(i => ({
      id: i.id,
      user: i.user_name || '-', // karena kosong
      asset: `${i.asset_name} (${i.asset_symbol})`,
      invested: i.invested, // ✅ FIX
      current: i.current_value,
      change: i.change_percent,
      status: i.status,
      date: i.date
    }))

  } catch (err) {
    console.error('Error fetch investments:', err)
  }
}

const fetchStats = async () => {
  try {
    const token = localStorage.getItem('token')

    const res = await axios.get(`${API_BASE}/admin/investments/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    console.log('STATS:', res.data)

    const s = res.data.data

    stats.value = {
      totalInvested: s.total_invested,
      currentValue: s.current_value,
      gainLoss: s.total_gain_loss, // ✅ FIX
      performance: s.performance
    }

  } catch (err) {
    console.error('Error fetch stats:', err)
  }
}

const handleLogout = async () => {
  try {
    const token = localStorage.getItem('token')

    await axios.post(`${API_BASE}/admin/logout`, {}, {
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


onMounted(() => {
  fetchInvestments()
  fetchStats()
})

watch([search, status], () => {
  fetchInvestments()
  currentPage.value = 1;
})

const totalPages = computed(() => {
  return Math.ceil(investments.value.length / perPage);
});

const paginatedInvestments = computed(() => {
  const start = (currentPage.value - 1) * perPage
  const end = start + perPage
  return investments.value.slice(start, end)
})
</script>

<template>
  <div class="layout" :class="{ 'sidebar-open': isSidebarOpen }">
    <!-- Sidebar Toggle Button -->
    <button class="sidebar-toggle" @click="toggleSidebar" :class="{ 'active': isSidebarOpen }">
      <svg v-if="!isSidebarOpen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
    <div v-if="isSidebarOpen" class="sidebar-overlay" @click="closeSidebarOnMobile"></div>

    <!-- Sidebar -->
    <aside class="sidebar">
        <div class="brand">
            <img :src="FintechLogo" class="logo">
            <div class="titlelogo">FinTech</div>
        </div>
        <nav>
            <a @click.prevent="$router.push('/adminDashboard')">
                <img :src="iconDashboard" class="icon-sidebar">
                Dashboard
            </a>
            <a @click.prevent="$router.push('/adminUsers')  ">
                <img :src="iconUsers" class="icon-sidebar">
                Users
            </a>
            <a @click.prevent="$router.push('/adminTransactions')">
                <img :src="iconTransactions" class="icon-sidebar">
                Transactions
            </a>
            <a class='active'>
                <img :src="iconInvestments" class="icon-sidebar">
                Investments
            </a>
            <a @click.prevent="$router.push('/adminBudgets')">
                <img :src="iconBudgets" class="icon-sidebar">
                Budgets
            </a>
            <a @click.prevent="$router.push('/adminAnalytics')">
                <img :src="iconAnalytics" class="icon-sidebar">
                Analytics
            </a>
            <a @click.prevent="$router.push('/adminNotifications')">
                <img :src="iconNotifications" class="icon-sidebar">
                Notifications
            </a>
            <a @click.prevent="$router.push('/adminAudit')">
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
            <span class="role-badge">Superadmin</span>
            <img :src="iconNotifications2" class="icon-header">
            <div class="avatar">AD</div>
            <div class="username">Admin User</div>
            </div>
        </div>

        <!-- Title -->
        <h1>Investment Management</h1>
        <p class="subtitle">Track and manage user investments</p>


        <div class="cards">
          <div class="card">
            <p>Total Invested</p>
            <h2>${{ stats.totalInvested }}</h2>
          </div>
          <div class="card">
            <p>Current Value</p>
            <h2>${{ stats.currentValue }}</h2>
          </div>
          <div class="card">
            <p>Total Gain/Loss</p>
            <h2 style="color:green">${{ stats.gainLoss }}</h2>
          </div>
          <div class="card">
            <p>Performance</p>
            <h2 style="color:green">${{ stats.performance.toFixed(2) }}</h2>
          </div>
      </div>

        <!-- Cards -->
        <div class="card">
            <h2>Investment Portfolio </h2>

            <!-- Filter -->
            <div class="filter">
            <input
                type="text"
                placeholder="Search Investments..."
                v-model="search"
            />

            <select v-model="status">
                <option value="">All Status</option>
                <option>Active</option>
                <option>Closed</option>
            </select>
            </div>

            <!-- Table -->
            <table>
            <thead>
                <tr>
                <th>ID</th>
                <th>User</th>
                <th>Asset</th>
                <th>Invested</th>
                <th>Current Value</th>
                <th>Change</th>
                <th>Price Trend</th>
                <th>Status</th>
                <th>Date</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="u in paginatedInvestments" :key="u.id">
                <td>#{{ u.id }}</td>
                <td>{{ u.user }}</td>
                <td>{{ u.asset }}</td>
                <td>${{ u.invested}}</td>
                <td>${{ u.current}}</td>
                <td>{{ u.change }}%</td>
                <td></td>
                <td>
                    <span :class="['badge', u.status.toLowerCase()]">
                    {{ u.status }}
                    </span>
                </td>

                <td>{{ u.date }}</td>
                </tr>
            </tbody>
            </table>

            <!-- Footer -->
            <div class="footer">
           <p class="info">
            Showing 
            {{ (currentPage - 1) * perPage + 1 }} 
            to 
            {{ Math.min(currentPage * perPage, investments.length) }} 
            of 
            {{ investments.length }} Investments
          </p>
              <div class="pagination">
                <button 
                  :disabled="currentPage === 1"
                  @click="currentPage--"
                >
                  Previous
                </button>

                <button
                  v-for="page in totalPages"
                  :key="page"
                  :class="{ active: page === currentPage }"
                  @click="currentPage = page"
                >
                  {{ page }}
                </button>

                <button 
                  :disabled="currentPage === totalPages"
                  @click="currentPage++"
                >
                  Next
                </button>
              </div>
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

.role-badge {
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

.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.card h2 {
  margin-top: 10px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

/* Filter */
.filter {
  display: flex;
  gap: 10px;
  margin: 15px 0;
  width: 100%;
}

.filter input {
  width: 700px;
  padding: 10px;
  border-radius: 8px;
  font-size: 20px;
  border: 1px solid #ddd;
}

.filter select {
  width: 300px;
  font-size: 20px;
  border: 1px solid #ddd;
}

/* Table */
table {
  width: 100%;
  border-collapse: collapse;
}

th {
  padding: 12px;
  border-bottom: 1px solid #eee;
  background-color: #F3F4F680;
  text-align: left;
}

td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.action {
  width: 50px;
  text-align: center;
}

.bold {
  font-weight: bold;
}

.action {
  cursor: pointer;
}

/* Badge */
.badge {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
}

.badge.active {
  background: #dcfce7;
  color: green;
}

.badge.disabled {
  background: #fee2e2;
  color: red;
}

.badge.pending {
  background: #fef9c3;
  color: orange;
}

/* Footer */
.footer {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.pagination button {
  margin-left: 5px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination .active {
  background: #2563eb;
  color: white;
}

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
  
  .cards { grid-template-columns: repeat(2, 1fr); }
}
</style>
