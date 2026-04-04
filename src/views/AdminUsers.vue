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
import { ref, computed } from "vue";

const search = ref("");
const status = ref("");

const users = ref([
  { id: 1, name: "John Doe", email: "john.doe@example.com", status: "Active", joinDate: "2024-01-15", balance: "$12,450" },
  { id: 2, name: "Jane Smith", email: "jane.smith@example.com", status: "Active", joinDate: "2024-02-20", balance: "$8,230" },
  { id: 3, name: "Mike Johnson", email: "mike.j@example.com", status: "Disabled", joinDate: "2024-01-08", balance: "$5,120" },
  { id: 4, name: "Sarah Wilson", email: "sarah.w@example.com", status: "Active", joinDate: "2024-03-12", balance: "$15,890" },
  { id: 5, name: "Tom Brown", email: "tom.brown@example.com", status: "Pending", joinDate: "2024-03-14", balance: "$2,340" },
]);

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const s = search.value.toLowerCase();

    const matchSearch =
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s);

    const matchStatus =
      !status.value || u.status === status.value;

    return matchSearch && matchStatus;
  });
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
            <a class="active">
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
        <p class="subtitle">Manage and monitor user accounts</p>

        <!-- Cards -->
        <div class="card">
            <h2>User List</h2>

            <!-- Filter -->
            <div class="filter">
            <input
                type="text"
                placeholder="Search by name or email..."
                v-model="search"
            />

            <select v-model="status">
                <option value="">All Status</option>
                <option>Active</option>
                <option>Disabled</option>
                <option>Pending</option>
            </select>
            </div>

            <!-- Table -->
            <table>
            <thead>
                <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Join Date</th>
                <th>Balance</th>
                <th class="action">Actions</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="u in filteredUsers" :key="u.id">
                <td>#{{ u.id }}</td>
                <td>{{ u.name }}</td>
                <td>{{ u.email }}</td>

                <td>
                    <span :class="['badge', u.status.toLowerCase()]">
                    {{ u.status }}
                    </span>
                </td>

                <td>{{ u.joinDate }}</td>
                <td class="bold">{{ u.balance }}</td>

                <td class="action">⋮</td>
                </tr>
            </tbody>
            </table>

            <!-- Footer -->
            <div class="footer">
            <span>Showing {{ filteredUsers.length }} users</span>

            <div class="pagination">
                <button disabled>Previous</button>
                <button class="active">1</button>
                <button>2</button>
                <button>Next</button>
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
  display: flex;
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

.pagination .active {
  background: #2563eb;
  color: white;
}

</style>