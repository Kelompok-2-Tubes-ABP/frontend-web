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
const perPage = 8;

// Data awal
const transactions = ref([
  {    id: 'TRX001',    user: 'John Doe',    category: 'Investment',    amount: 5000,    status: 'Completed',    datetime: '2026-03-14 10:23:00'  },
  {    id: 'TRX002',    user: 'Jane Smith',    category: 'Transfer',    amount: 2500,    status: 'Completed',    datetime: '2026-03-14 09:15:00'  },
  {    id: 'TRX003',    user: 'Mike Johnson',    category: 'Bill Payment',    amount: 850,    status: 'Pending',    datetime: '2026-03-13 16:30:00'  },
  {    id: 'TRX004',    user: 'Sarah Wilson',    category: 'Investment',    amount: 7200,    status: 'Completed',    datetime: '2026-03-13 14:45:00'},
  {    id: 'TRX005',    user: 'Tom Brown',    category: 'Shopping',    amount: 320,    status: 'Failed',    datetime: '2026-03-13 11:20:00'},
  {    id: 'TRX006',    user: 'Emily Davis',    category: 'Transfer',    amount: 1500,    status: 'Completed',    datetime: '2026-03-12 15:15:00'},
])

// FILTER STATE
const search = ref('')
const selectedCategory = ref('All Categories')
const selectedStatus = ref('All Status')

// OPTIONS
const categories = ['All Categories', 'Investment', 'Transfer', 'Bill Payment', 'Shopping']
const statuses = ['All Status', 'Completed', 'Pending', 'Failed']

// 🔥 FILTER + SORT
const filteredTransactions = computed(() => {
  return transactions.value
    .filter(trx => {
      // SEARCH
      const keyword = search.value.toLowerCase()
      const matchSearch =
        trx.id.toLowerCase().includes(keyword) ||
        trx.user.toLowerCase().includes(keyword)

      // CATEGORY
      const matchCategory =
        selectedCategory.value === 'All Categories' ||
        trx.category === selectedCategory.value

      // STATUS
      const matchStatus =
        selectedStatus.value === 'All Status' ||
        trx.status === selectedStatus.value
      return matchSearch && matchCategory && matchStatus
    })
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime)) // terbaru
})

    // FORMAT
    const formatDate = (dt) => new Date(dt).toLocaleString()

    // total halaman
    const totalPages = computed(() => {
      return Math.ceil(filteredTransactions.value.length / perPage)
    })

    // data per halaman
    const paginatedTransactions = computed(() => {
      const start = (currentPage.value - 1) * perPage
      const end = start + perPage
      return filteredTransactions.value.slice(start, end)
    })

    // reset ke page 1 kalau filter berubah
    watch([search, selectedCategory, selectedStatus], () => {
      currentPage.value = 1
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
            <a @click.prevent="$router.push('/adminDashboard')">
                <img :src="iconDashboard" class="icon-sidebar">
                Dashboard
            </a>
            <a @click.prevent="$router.push('/adminUsers')">
                <img :src="iconUsers" class="icon-sidebar">
                Users
            </a>
            <a class= "active">
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
      <h1>Transaction Management</h1>
      <p class="subtitle">Monitor and manage all transactions</p>

      <!-- Cards -->
      <div class="cards">
        <div class="card">
          <p>Total Transactions</p>
          <h2>10</h2>
        </div>
        <div class="card">
          <p>Total Amount</p>
          <h2>$31,200</h2>
        </div>
        <div class="card">
          <p>Pending</p>
          <h2 style="color:orange">2</h2>
        </div>
      </div>

      <div class="container">
        <h2>Transaction List</h2>

        <!-- FILTER BAR -->
        <div class="filters">
          <input v-model="search" placeholder="Search by ID or user..." />

          <select v-model="selectedCategory">
            <option v-for="cat in categories" :key="cat">{{ cat }}</option>
          </select>

          <select v-model="selectedStatus">
            <option v-for="stat in statuses" :key="stat">{{ stat }}</option>
          </select>
        </div>

        <!-- TABLE -->
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>User</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date & Time</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="trx in paginatedTransactions" :key="trx.id">
              <td>{{ trx.id }}</td>
              <td>{{ trx.user }}</td>
              <td>
                <span
                  class="category-badge"
                  :class="{
                    investment: trx.category === 'Investment',
                    transfer: trx.category === 'Transfer',
                    'bill-payment': trx.category === 'Bill Payment',
                    shopping: trx.category === 'Shopping'
                  }"
                >
                  {{ trx.category }}
                </span>
              </td>
              <td>${{ trx.amount.toLocaleString() }}</td>
              <td>
                <span :class="['badge', trx.status.toLowerCase()]">
                  {{ trx.status }}
                </span>
              </td>
              <td>{{ formatDate(trx.datetime) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p class="info">
            Showing 
            {{ (currentPage - 1) * perPage + 1 }} 
            to 
            {{ Math.min(currentPage * perPage, filteredTransactions.length) }} 
            of 
            {{ filteredTransactions.length }} transactions
          </p>

          <div class="pagination">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1"
            >
              Previous
            </button>

            <span
              v-for="page in totalPages"
              :key="page"
              @click="currentPage = page"
              :class="{ active: currentPage === page }"
            >
              {{ page }}
            </span>

            <button 
              @click="currentPage++" 
              :disabled="currentPage === totalPages"
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

/* Cards */
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

.container {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.filters input,
.filters select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

th{
  background-color: #F3F4F680;
  padding: 24px;
  text-align: left;
  border-bottom: 1px solid #eee;
} 

td {
  padding: 24px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
}

.completed {
  background: #d1fae5;
  color: #065f46;
}

.pending {
  background: #fef3c7;
  color: #92400e;
}

.failed {
  background: #fee2e2;
  color: #991b1b;
}

.category-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

/* warna category */
.investment {
  background: #dbeafe;
  color: #1e40af;
}

.transfer {
  background: #ede9fe;
  color: #5b21b6;
}

.bill-payment {
  background: #fef9c3;
  color: #854d0e;
}

.shopping {
  background: #ffe4e6;
  color: #9f1239;
}

.footer {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.pagination button{
  margin-left: 5px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.pagination span {
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #ddd;
  background: white;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination span.active {
  background: #2563eb;
  color: white;
  border: none;
}
</style>