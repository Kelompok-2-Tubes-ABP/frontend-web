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

// Responsive sidebar state
const isSidebarOpen = ref(false);

// Audit Logs Data
const auditLogs = ref([
  {
    id: 1,
    timestamp: '2026-03-15 10:23:45',
    actor: 'Admin User',
    role: 'admin',
    actionType: 'Create',
    targetData: 'User Account #12458',
    ipAddress: '192.168.1.100',
    details: 'Created new user account'
  },
  {
    id: 2,
    timestamp: '2026-03-15 09:15:22',
    actor: 'John Doe',
    role: 'user',
    actionType: 'Update',
    targetData: 'Profile Settings',
    ipAddress: '203.45.67.89',
    details: 'Updated email address'
  },
  {
    id: 3,
    timestamp: '2026-03-14 04:30:18',
    actor: 'Moderator Jane',
    role: 'admin',
    actionType: 'Delete',
    targetData: 'Transaction #TRX987',
    ipAddress: '192.168.1.101',
    details: 'Deleted fraudulent transaction'
  },
  {
    id: 4,
    timestamp: '2026-03-14 02:45:33',
    actor: 'Sarah Wilson',
    role: 'user',
    actionType: 'Create',
    targetData: 'Investment #INV234',
    ipAddress: '45.123.78.90',
    details: 'Created new investment'
  },
  {
    id: 5,
    timestamp: '2026-03-13 11:20:05',
    actor: 'Admin User',
    role: 'admin',
    actionType: 'Update',
    targetData: 'System Settings',
    ipAddress: '192.168.1.100',
    details: 'Modified security settings'
  },
  {
    id: 6,
    timestamp: '2026-03-13 08:15:47',
    actor: 'Mike Johnson',
    role: 'user',
    actionType: 'Delete',
    targetData: 'Budget #BDG123',
    ipAddress: '112.78.45.23',
    details: 'Deleted monthly budget'
  },
  {
    id: 7,
    timestamp: '2026-03-12 05:30:12',
    actor: 'Moderator Jane',
    role: 'admin',
    actionType: 'Update',
    targetData: 'User Account #12450',
    ipAddress: '192.168.1.101',
    details: 'Disabled user account'
  },
  {
    id: 8,
    timestamp: '2026-03-12 03:22:58',
    actor: 'Emily Davis',
    role: 'user',
    actionType: 'Create',
    targetData: 'Transaction #TRX1234',
    ipAddress: '78.90.123.45',
    details: 'New transfer transaction'
  }
]);

// Pagination
const currentPage = ref(1);
const itemsPerPage = 8;

// Filters
const searchQuery = ref('');
const selectedAction = ref('All Actions');
const selectedActor = ref('All Actors');

// Computed
const totalLogs = computed(() => auditLogs.value.length);
const adminActions = computed(() => auditLogs.value.filter(log => log.role === 'admin').length);
const userActions = computed(() => auditLogs.value.filter(log => log.role === 'user').length);
const deleteActions = computed(() => auditLogs.value.filter(log => log.actionType === 'Delete').length);

const filteredLogs = computed(() => {
  return auditLogs.value.filter(log => {
    const matchesSearch = searchQuery.value === '' || 
      log.actor.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      log.targetData.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      log.ipAddress.includes(searchQuery.value);
    
    const matchesAction = selectedAction.value === 'All Actions' || 
      log.actionType === selectedAction.value;
    
    const matchesActor = selectedActor.value === 'All Actors' || 
      log.role === selectedActor.value.toLowerCase();
    
    return matchesSearch && matchesAction && matchesActor;
  });
});

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredLogs.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / itemsPerPage));

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

// Export logs
const exportLogs = () => {
  console.log('Exporting logs...');
  // Add export logic here
};

// Get action type class
const getActionClass = (type) => {
  const classes = {
    'Create': 'action-create',
    'Update': 'action-update',
    'Delete': 'action-delete'
  };
  return classes[type] || '';
};

// Change page
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};
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
        <a @click.prevent="$router.push('/adminAnalytics'); closeSidebarOnMobile()">
          <img :src="iconAnalytics" class="icon-sidebar" alt="">
          Analytics
        </a>
        <a @click.prevent="$router.push('/adminNotifications'); closeSidebarOnMobile()">
          <img :src="iconNotifications" class="icon-sidebar" alt="">
          Notifications
        </a>
        <a class="active">
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
          <h1>Audit Logs</h1>
          <p class="subtitle">Track all system actions and user activities</p>
        </div>
        <button class="export-btn" @click="exportLogs">
          <span>📥</span>
          Export Logs
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="stat-card">
          <p class="stat-label">Total Logs</p>
          <h2 class="stat-number">{{ totalLogs }}</h2>
        </div>
        <div class="stat-card">
          <p class="stat-label">Admin Actions</p>
          <h2 class="stat-number text-admin">{{ adminActions }}</h2>
        </div>
        <div class="stat-card">
          <p class="stat-label">User Actions</p>
          <h2 class="stat-number text-user">{{ userActions }}</h2>
        </div>
        <div class="stat-card">
          <p class="stat-label">Delete Actions</p>
          <h2 class="stat-number text-delete">{{ deleteActions }}</h2>
        </div>
      </div>

      <!-- Activity Log Section -->
      <div class="section-card">
        <h2 class="section-title">Activity Log</h2>
        
        <!-- Filters -->
        <div class="filters">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search by actor, target, or IP..."
            />
          </div>
          <select v-model="selectedAction" class="filter-select">
            <option>All Actions</option>
            <option>Create</option>
            <option>Update</option>
            <option>Delete</option>
          </select>
          <select v-model="selectedActor" class="filter-select">
            <option>All Actors</option>
            <option>admin</option>
            <option>user</option>
          </select>
        </div>

        <!-- Table -->
        <div class="table-container">
          <table class="audit-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor / Admin Name</th>
                <th>Action Type</th>
                <th>Target Data</th>
                <th>IP Address</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in paginatedLogs" :key="log.id">
                <td class="timestamp">{{ log.timestamp }}</td>
                <td>
                  <div class="actor-name">{{ log.actor }}</div>
                  <span :class="['role-badge-small', log.role]">{{ log.role }}</span>
                </td>
                <td>
                  <span :class="['action-badge', getActionClass(log.actionType)]">
                    {{ log.actionType }}
                  </span>
                </td>
                <td>{{ log.targetData }}</td>
                <td class="ip-address">{{ log.ipAddress }}</td>
                <td>{{ log.details }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <span class="showing">Showing 1 to {{ paginatedLogs.length }} of {{ filteredLogs.length }} logs</span>
          <div class="pagination-controls">
            <button 
              class="page-btn" 
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              Previous
            </button>
            <button 
              v-for="page in totalPages" 
              :key="page"
              :class="['page-number', { active: currentPage === page }]"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
            <button 
              class="page-btn" 
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
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

.export-btn {
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

.export-btn:hover {
  background: #3b82f6;
  transform: translateY(-1px);
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.stat-label {
  margin: 0 0 8px 0;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
}

.stat-number {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.text-admin {
  color: #8b5cf6;
}

.text-user {
  color: #1e3a8a;
}

.text-delete {
  color: #ef4444;
}

/* Section Card */
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

/* Filters */
.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
}

.search-box input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-box input:focus {
  border-color: #1e3a8a;
}

.filter-select {
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  outline: none;
  min-width: 140px;
}

.filter-select:focus {
  border-color: #1e3a8a;
}

/* Table */
.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

.audit-table {
  width: 100%;
  border-collapse: collapse;
}

.audit-table th {
  text-align: left;
  padding: 12px;
  background: #f8fafc;
  border-bottom: 2px solid #e5e7eb;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.audit-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #374151;
}

.audit-table tbody tr:hover {
  background: #f8fafc;
}

.timestamp {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #6b7280;
}

.actor-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.role-badge-small {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge-small.admin {
  background: #f3e8ff;
  color: #7c3aed;
}

.role-badge-small.user {
  background: #e0e7ff;
  color: #4f46e5;
}

.action-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.action-create {
  background: #d1fae5;
  color: #065f46;
}

.action-update {
  background: #dbeafe;
  color: #1e40af;
}

.action-delete {
  background: #fee2e2;
  color: #991b1b;
}

.ip-address {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #6b7280;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.showing {
  font-size: 13px;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-number {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 36px;
}

.page-number:hover {
  background: #f3f4f6;
}

.page-number.active {
  background: #1e3a8a;
  color: white;
  border-color: #1e3a8a;
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
  
  .export-btn {
    width: 100%;
    justify-content: center;
  }
  
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filters {
    flex-direction: column;
  }
  
  .search-box {
    min-width: 100%;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .pagination {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}

@media (max-width: 640px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .audit-table {
    font-size: 12px;
  }
  
  .audit-table th,
  .audit-table td {
    padding: 8px;
  }
}
</style>