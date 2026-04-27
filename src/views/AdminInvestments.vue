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
import { ref, computed, watch } from "vue";
const currentPage = ref(1);
const perPage = 10;
const search = ref("");
const status = ref("");
const data = ref([
  {id: "INV001", user: "John Doe", asset: "Apple Inc (AAPL)", invested: 15000, current: 16500, change: 10, status: "Active", date: "2026-01-15",},
  {id: "INV002", user: "Jane Smith", asset: "Bitcoin (BTC)", invested: 25000, current: 27800, change: 11.2, status: "Active", date: "2026-02-20",},
  {id: "INV003", user: "Mike Johnson", asset: "Tesla Inc (TSLA)", invested: 12000, current: 11200, change: -6.7, status: "Active", date: "2026-01-08",},
  {id: "INV004", user: "Sarah Wilson", asset: "S&P 500 ETF", invested: 30000, current: 32400, change: 8, status: "Active", date: "2026-03-12",},
  {id: "INV005", user: "Tom Brown", asset: "Ethereum (ETH)", invested: 8000, current: 7200, change: -10, status: "Closed", date: "2026-02-05",},
  {id: "INV006", user: "Emily Davis", asset: "Amazon (AMZN)", invested: 20000, current: 22600, change: 13, status: "Active", date: "2026-01-28",},
]);

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / perPage);
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  const end = start + perPage;
  return filteredData.value.slice(start, end);
});

const filteredData = computed(() => {
  return data.value.filter(u => {
    const s = search.value.toLowerCase(); 

    const matchSearch =
      u.user.toLowerCase().includes(s) ||
      u.asset.toLowerCase().includes(s);

    const matchStatus =
      !status.value || u.status === status.value;

    return matchSearch && matchStatus;
  });
});

watch([search, status], () => {
  currentPage.value = 1;
});
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
            <h2>$110,000</h2>
          </div>
          <div class="card">
            <p>Current Value</p>
            <h2>$117,700</h2>
          </div>
          <div class="card">
            <p>Total Gain/Loss</p>
            <h2 style="color:green">$7,700</h2>
          </div>
          <div class="card">
            <p>Performance</p>
            <h2 style="color:green">7.00%</h2>
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
                <tr v-for="u in paginatedUsers" :key="u.id">
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
            {{ Math.min(currentPage * perPage, filteredData.length) }} 
            of 
            {{ filteredData.length }} Users
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

</style>