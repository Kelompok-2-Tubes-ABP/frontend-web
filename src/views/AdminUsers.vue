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
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";
const currentPage = ref(1);
const perPage = 15;
const search = ref("");
const status = ref("");
const users = ref([]);
const totalUsers = ref(0); 

const totalPages = computed(() => {
  return Math.ceil(totalUsers.value / perPage);
});

watch([currentPage, search, status], () => {
  fetchUsers()
})

const fetchUsers = async () => {
  try {
    const token = localStorage.getItem('token')

    const res = await axios.get('http://localhost:8080/admin/users', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        page: currentPage.value,
        limit: perPage,
        search: search.value,
        status: status.value
      }
    })

    console.log('USERS:', res.data)

    const list = res.data.data
    const meta = res.data.meta

    users.value = list.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      status: u.status,
      joinDate: u.join_date,
      balance: `$${(u.balance || 0).toLocaleString()}`
    }))

    totalUsers.value = meta.total

  } catch (err) {
    console.error('Error fetch users:', err)

    // handle token expired
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
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


const openDropdownId = ref(null)
const showModal = ref(false)
const selectedUserId = ref(null)
const actionType = ref('') // 'delete' | 'disable'

const handleClickOutside = (e) => {
  if (!e.target.closest('.dropdown')) {
    openDropdownId.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
// notif
const notification = ref({
  show: false,
  message: '',
  type: '' // success | error
})

const toggleDropdown = (id) => {
  openDropdownId.value =
    openDropdownId.value === id ? null : id
}

const openConfirm = (id, type) => {
  selectedUserId.value = id
  actionType.value = type
  showModal.value = true
  openDropdownId.value = null
}

const handleAction = async () => {
  try {
    const token = localStorage.getItem('token')

    if (actionType.value === 'disable') {
      await axios.patch(
        `http://localhost:8080/admin/users/${selectedUserId.value}/disable`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      showNotif('User berhasil di-disable', 'success')
    }

    if (actionType.value === 'delete') {
      await axios.delete(
        `http://localhost:8080/admin/users/${selectedUserId.value}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      showNotif('User berhasil dihapus', 'success')
    }

    fetchUsers()
  } catch (err) {
    showNotif('Aksi gagal!', 'error')
  } finally {
    showModal.value = false
  }
}

const showNotif = (msg, type) => {
  notification.value = {
    show: true,
    message: msg,
    type
  }

  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}
onMounted(() => {
  fetchUsers()
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
            <a class="active">
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
            <span class="role-badge">Superadmin</span>
            <img :src="iconNotifications2" class="icon-header">
            <div class="avatar">AD</div>
            <div class="username">Admin User</div>
            </div>
        </div>

        <!-- Title -->
        <h1>User Management</h1>
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
                <tr v-for="u in users" :key="u.id">
                <td>#{{ u.id }}</td>
                <td>{{ u.name }}</td>
                <td>{{ u.email }}</td>

                <td>
                    <span :class="['badge', (u.status || '').toLowerCase()]">
                    {{ u.status }}
                    </span>
                </td>

                <td>{{ u.joinDate }}</td>
                <td class="bold">{{ u.balance }}</td>

                <td class="action">
                  <div class="dropdown">
                    <span @click="toggleDropdown(u.id)">⋮</span>

                    <div v-if="openDropdownId === u.id" class="dropdown-menu">
                      <div @click="openConfirm(u.id, 'disable')" 
                          v-if="u.status !== 'Disabled'">
                        Disable
                      </div>
                      <div @click="openConfirm(u.id, 'delete')">Delete</div>
                    </div>
                  </div>
                </td>
                </tr>
            </tbody>
            </table>

            <!-- Footer -->
            <div class="footer">
           <p class="info">
            Showing 
            {{ (currentPage - 1) * perPage + 1 }} 
            to 
            {{ Math.min(currentPage * perPage, totalUsers) }} 
            of 
            {{ totalUsers }} Users
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
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>Konfirmasi</h3>
        <p>
          Yakin mau
          {{ actionType === 'delete' ? 'menghapus' : 'disable' }} user ini?
        </p>

        <div class="modal-actions">
          <button @click="showModal = false">Batal</button>
          <button class="danger" @click="handleAction">
            Ya, lanjutkan
          </button>
        </div>
      </div>
    </div>

    <div 
      v-if="notification.show" 
      :class="['notif', notification.type]"
    >
      {{ notification.message }}
    </div>
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
  font-size:20px;
}

td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  text-align: left;
  font-size:20px;
}

.action {
  width: 100px;
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
  font-size: 20px;
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
  font-size: 20px;
}

.pagination button {
  margin-left: 5px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 20px;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination .active {
  background: #2563eb;
  color: white;
}

/* dropdown */
.dropdown {
  position: relative;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  z-index: 10;
}

.dropdown-menu div {
  padding: 8px 12px;
  cursor: pointer;
}

.dropdown-menu div:hover {
  background: #f3f4f6;
}

/* modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 300px;
  text-align: center;
}

.modal-actions {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
}

.modal-actions button {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.modal-actions .danger {
  background: #ef4444;
  color: white;
}

/* notif */
.notif {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  color: white;
  z-index: 999;
}

.notif.success {
  background: #10b981;
}

.notif.error {
  background: #ef4444;
}

.modal-overlay {
  z-index: 9999;
}

</style>