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

// Active tab
const activeTab = ref('alerts');

// Notifications Data
const notifications = ref([
  {
    id: 1,
    type: 'warning',
    title: 'High Transaction Volume Detected',
    description: 'Unusual activity detected for user #12453. Please review.',
    timestamp: '2026-03-15 10:23 AM',
    badges: ['Warning', 'New']
  },
  {
    id: 2,
    type: 'error',
    title: 'Payment Gateway Error',
    description: 'Multiple failed transactions reported. Gateway may be down.',
    timestamp: '2026-03-15 09:15 AM',
    badges: ['Error', 'New']
  },
  {
    id: 3,
    type: 'info',
    title: 'System Maintenance Scheduled',
    description: 'Scheduled maintenance on March 20, 2026 at 2:00 AM UTC.',
    timestamp: '2026-03-14 04:30 PM',
    badges: ['Info']
  },
  {
    id: 4,
    type: 'success',
    title: 'Database Backup Completed',
    description: 'Daily backup completed successfully. All data secured.',
    timestamp: '2026-03-14 02:00 AM',
    badges: ['Success']
  },
  {
    id: 5,
    type: 'warning',
    title: 'Low Storage Warning',
    description: 'Storage usage at 85%. Consider adding more capacity.',
    timestamp: '2026-03-13 11:20 AM',
    badges: ['Warning']
  }
]);

// Failed Logs Data
const failedLogs = ref([
  {
    id: 1,
    action: 'Transaction Processing',
    user: 'John Doe',
    error: 'Gateway timeout after 30s',
    timestamp: '2026-03-15 09:15 AM',
    canRetry: true
  },
  {
    id: 2,
    action: 'User Authentication',
    user: 'Jane Smith',
    error: 'Invalid credentials attempted 3 times',
    timestamp: '2026-03-15 08:42 AM',
    canRetry: false
  },
  {
    id: 3,
    action: 'File Upload',
    user: 'Mike Johnson',
    error: 'File size exceeds limit (15MB)',
    timestamp: '2026-03-14 03:20 PM',
    canRetry: true
  },
  {
    id: 4,
    action: 'Payment Processing',
    user: 'Sarah Wilson',
    error: 'Insufficient funds',
    timestamp: '2026-03-14 11:05 AM',
    canRetry: false
  },
  {
    id: 5,
    action: 'API Request',
    user: 'System',
    error: 'Rate limit exceeded',
    timestamp: '2026-03-13 06:30 PM',
    canRetry: true
  }
]);

// Computed
const totalAlerts = ref(5);
const failedActions = ref(5);
const unreadCount = ref(2);
const canRetryCount = ref(2);

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

// Helper functions
const getTypeIcon = (type) => {
  const icons = {
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
    success: '✅'
  };
  return icons[type] || 'ℹ️';
};

const getBadgeClass = (badge) => {
  const classes = {
    'Warning': 'badge-warning',
    'Error': 'badge-error',
    'Info': 'badge-info',
    'Success': 'badge-success',
    'New': 'badge-new'
  };
  return classes[badge] || '';
};

const retryAction = (id) => {
  console.log('Retrying action:', id);
  // Add retry logic here
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
        <a class="active">
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

      <!-- Page Title -->
      <h1>Notifications & Logs</h1>
      <p class="subtitle">System alerts and failed action logs</p>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <span class="stat-icon-alert">🔔</span>
          </div>
          <div class="stat-content">
            <p class="stat-label">Total Alerts</p>
            <h2 class="stat-number">{{ totalAlerts }}</h2>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <span class="stat-icon-error">❌</span>
          </div>
          <div class="stat-content">
            <p class="stat-label">Failed Actions</p>
            <h2 class="stat-number text-error">{{ failedActions }}</h2>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <span class="stat-icon-unread">📩</span>
          </div>
          <div class="stat-content">
            <p class="stat-label">Unread</p>
            <h2 class="stat-number text-warning">{{ unreadCount }}</h2>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <span class="stat-icon-retry">🔄</span>
          </div>
          <div class="stat-content">
            <p class="stat-label">Can Retry</p>
            <h2 class="stat-number text-success">{{ canRetryCount }}</h2>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
        <button 
          :class="['tab', { active: activeTab === 'alerts' }]"
          @click="activeTab = 'alerts'"
        >
          System Alerts
        </button>
        <button 
          :class="['tab', { active: activeTab === 'logs' }]"
          @click="activeTab = 'logs'"
        >
          Failed Logs
        </button>
      </div>

      <!-- System Alerts Section -->
      <div v-if="activeTab === 'alerts'" class="section-card">
        <h2 class="section-title">System Alerts</h2>
        <div class="alerts-list">
          <div v-for="alert in notifications" :key="alert.id" class="alert-item">
            <div class="alert-icon">
              <span>{{ getTypeIcon(alert.type) }}</span>
            </div>
            <div class="alert-content">
              <div class="alert-header">
                <h3 class="alert-title">{{ alert.title }}</h3>
                <div class="alert-badges">
                  <span 
                    v-for="badge in alert.badges" 
                    :key="badge"
                    :class="['badge', getBadgeClass(badge)]"
                  >
                    {{ badge }}
                  </span>
                </div>
              </div>
              <p class="alert-description">{{ alert.description }}</p>
              <span class="alert-time">{{ alert.timestamp }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Failed Logs Section -->
      <div v-if="activeTab === 'logs'" class="section-card">
        <h2 class="section-title">Failed Action Logs</h2>
        <div class="logs-list">
          <div v-for="log in failedLogs" :key="log.id" class="log-item">
            <div class="log-content">
              <div class="log-header">
                <h3 class="log-title">{{ log.action }}</h3>
                <span v-if="log.canRetry" class="retry-badge">Can Retry</span>
              </div>
              <div class="log-details">
                <span class="log-user">User: {{ log.user }}</span>
                <span class="log-error">{{ log.error }}</span>
              </div>
              <span class="log-time">{{ log.timestamp }}</span>
            </div>
            <div class="log-actions" v-if="log.canRetry">
              <button class="retry-btn" @click="retryAction(log.id)">
                Retry
              </button>
            </div>
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

h1 {
  font-size: 28px;
  margin: 0 0 8px 0;
  font-weight: 700;
  color: #111827;
}

.subtitle {
  color: #6b7280;
  margin: 0 0 30px 0;
  font-size: 14px;
  font-weight: 400;
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
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 24px;
}

.stat-icon-alert {
  background: #dbeafe;
}

.stat-icon-error {
  background: #fee2e2;
}

.stat-icon-unread {
  background: #fef3c7;
}

.stat-icon-retry {
  background: #d1fae5;
}

.stat-content {
  flex: 1;
}

.stat-label {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
}

.stat-number {
  margin: 4px 0 0 0;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.text-error {
  color: #ef4444;
}

.text-warning {
  color: #f59e0b;
}

.text-success {
  color: #10b981;
}

/* Tabs */
.tabs-container {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0;
}

.tab {
  padding: 10px 20px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab:hover {
  color: #1e3a8a;
}

.tab.active {
  color: #1e3a8a;
  border-bottom-color: #1e3a8a;
  font-weight: 600;
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
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 20px 0;
  color: #111827;
}

/* Alerts List */
.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alert-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #e2e8f0;
  transition: all 0.2s;
}

.alert-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.alert-item:nth-child(1) {
  border-left-color: #f59e0b;
  background: #fffbeb;
}

.alert-item:nth-child(2) {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.alert-item:nth-child(3) {
  border-left-color: #3b82f6;
  background: #eff6ff;
}

.alert-item:nth-child(4) {
  border-left-color: #10b981;
  background: #ecfdf5;
}

.alert-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.alert-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.alert-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.badge-error {
  background: #fee2e2;
  color: #991b1b;
}

.badge-info {
  background: #dbeafe;
  color: #1e40af;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.badge-new {
  background: #2563eb;
  color: white;
}

.alert-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.alert-time {
  font-size: 12px;
  color: #9ca3af;
}

/* Logs List */
.logs-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.log-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.log-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.log-content {
  flex: 1;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.log-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.retry-badge {
  padding: 3px 10px;
  background: #d1fae5;
  color: #065f46;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.log-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.log-user {
  font-size: 13px;
  color: #6b7280;
}

.log-error {
  font-size: 13px;
  color: #ef4444;
  font-weight: 500;
}

.log-time {
  font-size: 12px;
  color: #9ca3af;
}

.log-actions {
  flex-shrink: 0;
}

.retry-btn {
  padding: 8px 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
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
    font-size: 14px;
  }
  
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  h1 {
    font-size: 24px;
  }
}

@media (max-width: 640px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .alert-item, .log-item {
    flex-direction: column;
  }
  
  .alert-header {
    flex-direction: column;
  }
  
  .log-actions {
    width: 100%;
  }
  
  .retry-btn {
    width: 100%;
  }
}
</style>