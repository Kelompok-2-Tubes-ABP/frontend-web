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
import iconBudgetActive from '@/assets/icon-budgetActive.svg';
import iconBudgetAttention from '@/assets/icon-budgetsAttention.svg';
import { API_BASE } from '../../services/api.js';
import { ref, computed, onMounted } from "vue";

// Responsive sidebar state
const isSidebarOpen = ref(false);

// API State
const isLoading = ref(true);
const error = ref(null);

// Data State (Replaced hardcoded arrays with empty refs)
const budgets = ref([]);
const savingsGoals = ref([]);
const stats = ref({
  totalBudgets: 0,
  overBudget: 0,
  savingsGoalsCount: 0
});

// Computed (Now pulls from the fetched stats)
const totalBudgets = computed(() => stats.value.totalBudgets);
const overBudget = computed(() => stats.value.overBudget);
const savingsGoalsCount = computed(() => stats.value.savingsGoalsCount);

// Helpers (Unchanged)
const getPercentage = (spent, limit) => limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
const getSavingsPercentage = (saved, target) => target > 0 ? ((saved / target) * 100).toFixed(1) : 0;
const getRemaining = (spent, limit) => limit - spent;
const getToGo = (saved, target) => target - saved;

const getStatusClass = (status) => {
  if (status === "Safe") return "safe";
  if (status === "Over Budget") return "over";
  if (status === "Near Limit") return "near";
  return "";
};

const getProgressBarClass = (status) => {
  if (status === "Safe") return "progress-safe";
  if (status === "Over Budget") return "progress-over";
  if (status === "Near Limit") return "progress-near";
  return "";
};

// ==========================================
// API FETCHING LOGIC
// ==========================================
const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// 1. Fetch Global Stats
const fetchStats = async () => {
  const res = await fetch(`${API_BASE}/admin/budget-savings/stats`, { headers });
  if (!res.ok) throw new Error('Failed to fetch stats');
  const result = await res.json();
  if (result.status === 'success') {
    stats.value = {
      totalBudgets: result.data.total_budgets,
      overBudget: result.data.over_budget,
      savingsGoalsCount: result.data.savings_goals
    };
  }
};

// 2. Fetch All User Budgets
const fetchBudgets = async () => {
  // We request limit=50 to show a good amount on the admin page
  const res = await fetch(`${API_BASE}/admin/budgets?limit=50`, { headers });
  if (!res.ok) throw new Error('Failed to fetch budgets');
  const result = await res.json();
  
  if (result.status === 'success') {
    budgets.value = result.data.map(b => ({
      user: b.user_name,
      category: b.category,
      period: `Monthly • ${b.month}`,
      spent: b.spent,
      limit: b.limit,
      status: b.status
    }));
  }
};

// 3. Fetch All Savings Goals
const fetchSavings = async () => {
  const res = await fetch(`${API_BASE}/admin/savings-goals?limit=50`, { headers });
  if (!res.ok) throw new Error('Failed to fetch savings goals');
  const result = await res.json();
  
  if (result.status === 'success') {
    savingsGoals.value = result.data.map(g => ({
      user: g.user_name,
      goal: g.goal_name,
      targetDate: g.target_date,
      saved: g.current_amount,
      target: g.target_amount,
      status: g.status
    }));
  }
};

// Master fetch function
const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // Run all 3 API calls in parallel for speed
    await Promise.all([fetchStats(), fetchBudgets(), fetchSavings()]);
  } catch (err) {
    error.value = err.message;
    console.error("Budgets Fetch Error:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

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

// Logout API
const handleLogout = async () => {
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

    <aside class="sidebar">
      <div class="brand">
        <img :src="FintechLogo" class="logo" alt="Logo">
        <div class="titlelogo">FinTech</div>
      </div>
      <nav>
        <a @click.prevent="$router.push('/adminDashboard'); closeSidebarOnMobile()">
          <img :src="iconDashboard" class="icon-sidebar" alt=""> Dashboard
        </a>
        <a @click.prevent="$router.push('/adminUsers'); closeSidebarOnMobile()">
          <img :src="iconUsers" class="icon-sidebar" alt=""> Users
        </a>
        <a @click.prevent="$router.push('/adminTransactions'); closeSidebarOnMobile()">
          <img :src="iconTransactions" class="icon-sidebar" alt=""> Transactions
        </a>
        <a @click.prevent="$router.push('/adminInvestments'); closeSidebarOnMobile()">
          <img :src="iconInvestments" class="icon-sidebar" alt=""> Investments
        </a>
        <a class="active">
          <img :src="iconBudgets" class="icon-sidebar" alt=""> Budgets
        </a>
        <a @click.prevent="$router.push('/adminAnalytics'); closeSidebarOnMobile()">
          <img :src="iconAnalytics" class="icon-sidebar" alt=""> Analytics
        </a>
        <a @click.prevent="$router.push('/adminNotifications'); closeSidebarOnMobile()">
          <img :src="iconNotifications" class="icon-sidebar" alt=""> Notifications
        </a>
        <a @click.prevent="$router.push('/adminAudit'); closeSidebarOnMobile()">
          <img :src="iconAuditLogs" class="icon-sidebar" alt=""> Audit Logs
        </a>
      </nav>
      <div class="logout" @click="handleLogout">
        <img :src="iconLogout" class="icon-sidebar" alt=""> Logout
      </div>
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

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state" style="text-align: center; padding: 50px; color: #6b7280;">
        <p>Loading budgets and savings data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state" style="text-align: center; padding: 50px; color: #ef4444;">
        <p>Failed to load data: {{ error }}</p>
        <button @click="fetchData" style="margin-top: 10px; padding: 8px 16px; background: #1e3a8a; color: white; border: none; border-radius: 6px; cursor: pointer;">Retry</button>
      </div>

      <!-- Data Loaded -->
      <template v-else>
        <!-- Title -->
        <h1>Budget & Savings</h1>
        <p class="subtitle">Monitor user budgets and savings goals</p>

        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="stat-card">
            <p class="stat-label">Total Budgets</p>
            <h2 class="stat-number">{{ totalBudgets }}</h2>
            <div class="stat-footer">
              <img :src="iconBudgetActive" class="stat-icon active" alt="">
              <span class="stat-subtitle active">Active this month</span>
            </div>
          </div>
          <div class="stat-card">
            <p class="stat-label">Over Budget</p>
            <h2 class="stat-number text-over">{{ overBudget }}</h2>
            <div class="stat-footer">
              <img :src="iconBudgetAttention" class="stat-icon attention" alt="">
              <span class="stat-subtitle over">Needs attention</span>
            </div>
          </div>
          <div class="stat-card">
            <p class="stat-label">Savings Goals</p>
            <h2 class="stat-number">{{ savingsGoalsCount }}</h2>
            <div class="stat-footer">
              <img :src="iconBudgetActive" class="stat-icon active" alt="">
              <span class="stat-subtitle active">In progress</span>
            </div>
          </div>
        </div>

        <!-- Budget Tracking Section -->
        <div class="section-card">
          <h2 class="section-title">Budget Tracking</h2>
          <div v-if="budgets.length === 0" style="text-align: center; color: #9ca3af; padding: 20px;">No budgets found.</div>
          <div v-else class="budget-list">
            <!-- Changed :key to index because Go backend doesn't return the MongoDB _id here -->
            <div v-for="(budget, index) in budgets" :key="index" class="budget-item">
              <div class="budget-header">
                <div class="budget-info">
                  <div class="user-with-badge">
                    <span class="budget-user">{{ budget.user }}</span>
                    <span class="category-badge">{{ budget.category }}</span>
                  </div>
                  <span class="budget-period">{{ budget.period }}</span>
                </div>
                <div class="budget-amounts">
                  <span class="budget-total">${{ budget.spent }} / ${{ budget.limit }}</span>
                  <span :class="['status-badge', getStatusClass(budget.status)]">{{ budget.status }}</span>
                </div>
              </div>
              <div class="progress-container">
                <div class="progress-bar">
                  <div 
                    :class="['progress-fill', getProgressBarClass(budget.status)]" 
                    :style="{ width: getPercentage(budget.spent, budget.limit) + '%' }"
                  ></div>
                </div>
                <div class="progress-details">
                  <span class="percentage">{{ getPercentage(budget.spent, budget.limit).toFixed(1) }}% used</span>
                  <span class="remaining" :class="{ negative: getRemaining(budget.spent, budget.limit) < 0 }">
                    ${{ Math.abs(getRemaining(budget.spent, budget.limit)) }} 
                    {{ getRemaining(budget.spent, budget.limit) < 0 ? 'over' : 'remaining' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Savings Goals Section -->
        <div class="section-card">
          <h2 class="section-title">Savings Goals Progress</h2>
          <div v-if="savingsGoals.length === 0" style="text-align: center; color: #9ca3af; padding: 20px;">No savings goals found.</div>
          <div v-else class="savings-list">
            <!-- Changed :key to index -->
            <div v-for="(goal, index) in savingsGoals" :key="index" class="savings-item">
              <div class="savings-header">
                <div class="savings-info">
                  <span class="savings-user">{{ goal.user }}</span>
                  <span class="savings-goal">{{ goal.goal }}</span>
                  <span class="savings-date">Target: {{ goal.targetDate }}</span>
                </div>
                <div class="savings-amounts">
                  <span class="savings-total">${{ goal.saved }} / ${{ goal.target }}</span>
                  <span class="savings-percent">{{ getSavingsPercentage(goal.saved, goal.target) }}% complete</span>
                </div>
              </div>
              <div class="progress-container">
                <div class="progress-bar">
                  <div 
                    class="progress-fill progress-savings" 
                    :style="{ width: getSavingsPercentage(goal.saved, goal.target) + '%' }"
                  ></div>
                </div>
                <div class="progress-details">
                  <span class="percentage on-track">↗ On track</span>
                  <span class="to-go">${{ getToGo(goal.saved, goal.target) }} to go</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
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

h1 {
  font-size: 36px;
  margin: 0 0 8px 0;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.5px;
}

.subtitle {
  color: #6b7280;
  margin: 0 0 30px 0;
  font-size: 16px;
  font-weight: 400;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 25px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.stat-label {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.stat-number {
  margin: 8px 0;
  font-size: 40px;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.stat-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.stat-icon {
  width: 14px;
  height: 14px;
}

.stat-icon.active {
  color: #10b981;
}

.stat-icon.attention {
  color: #ef4444;
}

.stat-subtitle {
  font-size: 13px;
  font-weight: 500;
}

.stat-subtitle.active {
  color: #10b981;
}

.stat-subtitle.over {
  color: #ef4444;
}

.text-over {
  color: #ef4444;
}

.section-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 24px 0;
  color: #111827;
  letter-spacing: -0.3px;
}

.budget-list, .savings-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.budget-item, .savings-item {
  padding-bottom: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.budget-item:last-child, .savings-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.budget-header, .savings-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 15px;
}

.budget-info, .savings-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.user-with-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.budget-user, .savings-user {
  font-weight: 700;
  font-size: 16px;
  color: #111827;
}

.category-badge {
  background: #f3f4f6;
  color: #4b5563;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.budget-category, .savings-goal {
  font-size: 14px;
  color: #6b7280;
}

.budget-period, .savings-date {
  font-size: 13px;
  color: #9ca3af;
}

.budget-amounts, .savings-amounts {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.budget-total, .savings-total {
  font-weight: 700;
  font-size: 16px;
  color: #111827;
}

.savings-percent {
  font-size: 13px;
  color: #6b7280;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.safe { 
  background: #dcfce7; 
  color: #10b981; 
}

.status-badge.over { 
  background: #fee2e2; 
  color: #ef4444; 
}

.status-badge.near { 
  background: #fef9c3; 
  color: #f59e0b; 
}

.progress-container { 
  margin-top: 12px; 
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-fill.progress-safe { background: #10b981; }
.progress-fill.progress-over { background: #ef4444; }
.progress-fill.progress-near { background: #f59e0b; }
.progress-fill.progress-savings { background: #2563eb; }

.progress-details {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.percentage { 
  color: #6b7280; 
}

.percentage.on-track { 
  color: #10b981; 
}

.remaining, .to-go { 
  color: #6b7280; 
}

.remaining.negative { 
  color: #ef4444; 
  font-weight: 500; 
}


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

.sidebar-toggle svg {
  transition: transform 0.2s ease;
}

.sidebar-toggle:hover svg {
  transform: scale(1.1);
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
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

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
</style>