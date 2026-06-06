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
import iconNotifAlert from '@/assets/icon-notifAlert.svg';
import iconNotifFailed from '@/assets/icon-notifFailed.svg';
import iconNotifUnread from '@/assets/icon-notifUnread.svg';
import iconNotifCanRetry from '@/assets/icon-notifCanRetry.svg';
import { ref, computed, onMounted } from "vue";

// Responsive sidebar state
const isSidebarOpen = ref(false);

// Active tab
const activeTab = ref('alerts');

// API State
const isLoading = ref(true);
const error = ref(null);

// Data State
const stats = ref({ totalAlerts: 0, failedActions: 0, unread: 0, canRetry: 0 });
const notifications = ref([]);
const failedLogs = ref([]);

// Computed
const totalAlerts = computed(() => stats.value.totalAlerts);
const failedActions = computed(() => stats.value.failedActions);
const unreadCount = computed(() => stats.value.unread);
const canRetryCount = computed(() => stats.value.canRetry);

// API Helpers
const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleString();
};

// Fetch Functions
const fetchStats = async () => {
  const res = await fetch('http://localhost:8080/admin/alerts/stats', { headers });
  if (!res.ok) throw new Error('Failed to fetch alert stats');
  const result = await res.json();
  if (result.status === 'success') {
    stats.value = {
      totalAlerts: result.data.total_alerts || 0,
      failedActions: result.data.failed_actions || 0,
      unread: result.data.unread || 0,
      canRetry: result.data.can_retry || 0
    };
  }
};

const fetchAlerts = async () => {
  const res = await fetch('http://localhost:8080/admin/alerts?type=system_alert&limit=50', { headers });
  if (!res.ok) throw new Error('Failed to fetch alerts');
  const result = await res.json();
  if (result.status === 'success') {
    notifications.value = (result.data || []).map(alert => {
      // Determine type for icon/color based on backend data
      let type = 'info';
      if (alert.severity === 'warning' || alert.type === 'warning') type = 'warning';
      else if (alert.severity === 'error' || alert.type === 'error') type = 'error';
      else if (alert.severity === 'success' || alert.type === 'success') type = 'success';
      
      return {
        id: alert.id || alert._id,
        type: type,
        title: alert.title || alert.message || 'System Alert',
        description: alert.description || alert.details || alert.message || '',
        timestamp: formatTime(alert.created_at),
        isRead: alert.is_read || false,
        badges: [
           type.charAt(0).toUpperCase() + type.slice(1),
           ...(alert.is_read ? [] : ['New']) // Add 'New' badge if unread
        ]
      };
    });
  }
};

const fetchFailedLogs = async () => {
  const res = await fetch('http://localhost:8080/admin/alerts?type=failed_action&limit=50', { headers });
  if (!res.ok) throw new Error('Failed to fetch failed logs');
  const result = await res.json();
  if (result.status === 'success') {
    failedLogs.value = (result.data || []).map(log => ({
      id: log.id || log._id,
      action: log.action || log.action_type || log.title || 'Unknown Action',
      user: log.user || log.actor_name || log.target_data || 'System',
      error: log.error || log.details || log.description || 'Unknown error',
      timestamp: formatTime(log.created_at),
      canRetry: log.can_retry || false
    }));
  }
};

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // Fetch all 3 endpoints in parallel
    await Promise.all([fetchStats(), fetchAlerts(), fetchFailedLogs()]);
  } catch (err) {
    error.value = err.message;
    console.error("Notifications Fetch Error:", err);
  } finally {
    isLoading.value = false;
  }
};

// Mark alert as read (Calls your PATCH /admin/alerts/:id/read endpoint)
const markAsRead = async (id) => {
  try {
    const res = await fetch(`http://localhost:8080/admin/alerts/${id}/read`, {
      method: 'PATCH',
      headers
    });
    if (res.ok) {
      const alert = notifications.value.find(a => a.id === id);
      if (alert && !alert.isRead) {
        alert.isRead = true;
        alert.badges = alert.badges.filter(b => b !== 'New');
        stats.value.unread = Math.max(0, stats.value.unread - 1);
      }
    }
  } catch (err) {
    console.error("Failed to mark as read:", err);
  }
};

const retryAction = (id) => {
  console.log('Retrying action:', id);
  // Add retry logic here when your backend team adds the retry endpoint
};

onMounted(fetchData);

// Toggle sidebar
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value; };
const closeSidebarOnMobile = () => { if (window.innerWidth < 1024) isSidebarOpen.value = false; };

// Logout API
const handleLogout = async () => {
  try {
    await fetch('http://localhost:8080/admin/logout', {
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

// Helper functions
const getTypeIcon = (type) => {
  const icons = {
    warning: iconNotifUnread,
    error: iconNotifFailed,
    info: iconNotifAlert,
    success: iconNotifCanRetry
  };
  return icons[type] || iconNotifAlert;
};

const getBadgeClass = (badge) => {
  const classes = {
    'Warning': 'badge-warning', 'Error': 'badge-error', 'Info': 'badge-info',
    'Success': 'badge-success', 'New': 'badge-new'
  };
  return classes[badge] || '';
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
      <div class="logout" @click="handleLogout">
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
              <img :src="iconNotifAlert" class="stat-svg-icon" alt="Alert">
            </div>
          <div class="stat-content">
            <p class="stat-label">Total Alerts</p>
            <h2 class="stat-number">{{ totalAlerts }}</h2>
          </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon-wrapper">
              <img :src="iconNotifFailed" class="stat-svg-icon" alt="Failed">
            </div>
          <div class="stat-content">
            <p class="stat-label">Failed Actions</p>
            <h2 class="stat-number text-error">{{ failedActions }}</h2>
          </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon-wrapper">
              <img :src="iconNotifUnread" class="stat-svg-icon" alt="Unread">
            </div>
          <div class="stat-content">
            <p class="stat-label">Unread</p>
            <h2 class="stat-number text-warning">{{ unreadCount }}</h2>
          </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon-wrapper">
              <img :src="iconNotifCanRetry" class="stat-svg-icon" alt="Can Retry">
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
        
        <div v-if="isLoading" class="loading-state">Loading alerts...</div>
        <div v-else-if="error" class="empty-state" style="color: #ef4444;">Error: {{ error }}</div>
        <div v-else-if="notifications.length === 0" class="empty-state">No system alerts found.</div>
        
        <div v-else class="alerts-list">
          <!-- Added dynamic classes and click-to-mark-as-read -->
          <div 
            v-for="alert in notifications" 
            :key="alert.id" 
            :class="['alert-item', alert.type, { 'is-read': alert.isRead }]"
            @click="!alert.isRead && markAsRead(alert.id)"
          >
            <div class="alert-icon">
              <img :src="getTypeIcon(alert.type)" class="alert-svg-icon" alt="">
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
        
        <div v-if="isLoading" class="loading-state">Loading logs...</div>
        <div v-else-if="failedLogs.length === 0" class="empty-state">No failed logs found.</div>
        
        <div v-else class="logs-list">
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
.layout { display: flex; height: 100vh; font-family: 'Inter', sans-serif; background: #f5f7fb; position: relative; }

/* Sidebar Styles (Unchanged) */
.sidebar { width: 250px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 20px; flex-shrink: 0; }
.brand { display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 100px; margin-top: 20px; }
.logo { width: 50px; height: 50px; display: block; color: black; }
.titlelogo { font-size: 30px; font-weight: bold; margin: 0; line-height: 1; }
.sidebar nav a { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; margin-bottom: 20px; cursor: pointer; opacity: 0.9; font-size: 20px; text-decoration: none; color: white; }
.icon-sidebar { width: 30px; height: 30px; flex-shrink: 0; }
.sidebar nav a:hover, .sidebar nav .active { background: #3b82f6; }
.logout { display: flex; align-items: center; gap: 10px; margin-top: auto; cursor: pointer; font-size: 20px; }

/* Main Content & Header (Updated for consistency with Budgets/Analytics) */
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
.summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 25px; }
.stat-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 16px; }
.stat-icon-wrapper { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 24px; background: #f0f4ff; }
.stat-svg-icon { width: 24px; height: 24px; }
.alert-svg-icon { width: 22px; height: 22px; }
.stat-content { flex: 1; }
.stat-label { margin: 0; color: #6b7280; font-size: 13px; font-weight: 500; }
.stat-number { margin: 4px 0 0 0; font-size: 28px; font-weight: 700; color: #111827; line-height: 1; }
.text-error { color: #ef4444; }
.text-warning { color: #f59e0b; }
.text-success { color: #10b981; }

/* Tabs */
.tabs-container { display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 0; }
.tab { padding: 10px 20px; background: none; border: none; font-size: 14px; font-weight: 500; color: #6b7280; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; }
.tab:hover { color: #1e3a8a; }
.tab.active { color: #1e3a8a; border-bottom-color: #1e3a8a; font-weight: 600; }

/* Section Card */
.section-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 20px; }
.section-title { font-size: 20px; font-weight: 700; margin: 0 0 24px 0; color: #111827; letter-spacing: -0.3px; }

/* Alerts List (FIXED: Colors now map to alert.type, not position) */
.alerts-list { display: flex; flex-direction: column; gap: 16px; }
.alert-item { display: flex; gap: 16px; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #e2e8f0; transition: all 0.2s; cursor: pointer; }
.alert-item:hover { transform: translateX(4px); }

/* Dynamic Colors based on Type */
.alert-item.warning { border-left-color: #f59e0b; background: #fffbeb; }
.alert-item.error { border-left-color: #ef4444; background: #fef2f2; }
.alert-item.info { border-left-color: #3b82f6; background: #eff6ff; }
.alert-item.success { border-left-color: #10b981; background: #ecfdf5; }

/* Read State */
.alert-item.is-read { opacity: 0.75; background: #ffffff !important; border-left-color: #cbd5e1 !important; }

.alert-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.alert-content { flex: 1; }
.alert-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 8px; }
.alert-title { font-size: 15px; font-weight: 600; color: #111827; margin: 0; }
.alert-badges { display: flex; gap: 6px; flex-wrap: wrap; }
.badge { padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
.badge-warning { background: #fef3c7; color: #92400e; }
.badge-error { background: #fee2e2; color: #991b1b; }
.badge-info { background: #dbeafe; color: #1e40af; }
.badge-success { background: #d1fae5; color: #065f46; }
.badge-new { background: #2563eb; color: white; }
.alert-description { font-size: 14px; color: #6b7280; margin: 0 0 8px 0; line-height: 1.5; }
.alert-time { font-size: 12px; color: #9ca3af; }

/* Logs List */
.logs-list { display: flex; flex-direction: column; gap: 16px; }
.log-item { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; transition: all 0.2s; }
.log-item:hover { background: #f1f5f9; border-color: #cbd5e1; }
.log-content { flex: 1; }
.log-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 8px; }
.log-title { font-size: 15px; font-weight: 600; color: #111827; margin: 0; }
.retry-badge { padding: 3px 10px; background: #d1fae5; color: #065f46; border-radius: 12px; font-size: 11px; font-weight: 600; }
.log-details { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.log-user { font-size: 13px; color: #6b7280; }
.log-error { font-size: 13px; color: #ef4444; font-weight: 500; }
.log-time { font-size: 12px; color: #9ca3af; }
.log-actions { flex-shrink: 0; }
.retry-btn { padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.retry-btn:hover { background: #1d4ed8; transform: translateY(-1px); }

/* States */
.loading-state, .empty-state { text-align: center; padding: 40px; color: #6b7280; font-size: 15px; }

/* Sidebar Toggle & Responsive (Updated for consistency) */
.sidebar-toggle { display: none; position: fixed; left: 0; top: 50%; transform: translateY(-50%); z-index: 1001; background: #1e3a8a; color: white; border: none; border-radius: 0 8px 8px 0; padding: 12px 8px; cursor: pointer; align-items: center; justify-content: center; box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; width: 36px; height: 48px; }
.sidebar-toggle:hover { background: #3b82f6; transform: translateY(-50%) translateX(2px); }
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
}

@media (max-width: 640px) {
  .summary-cards { grid-template-columns: 1fr; }
  .stat-card { padding: 16px; }
  .alert-item, .log-item { flex-direction: column; }
  .alert-header { flex-direction: column; }
  .log-actions { width: 100%; }
  .retry-btn { width: 100%; }
}
</style>