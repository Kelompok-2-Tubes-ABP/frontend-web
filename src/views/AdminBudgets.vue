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
import { ref, computed } from "vue";

// Responsive sidebar state
const isSidebarOpen = ref(false);

// Budget Tracking Data
const budgets = ref([
  { id: 1, user: "John Doe", category: "Groceries", period: "Monthly • 2026-03-01 to 2026-03-31", spent: 650, limit: 800, status: "Safe" },
  { id: 2, user: "Jane Smith", category: "Entertainment", period: "Monthly • 2026-03-01 to 2026-03-31", spent: 520, limit: 500, status: "Over Budget" },
  { id: 3, user: "Mike Johnson", category: "Transportation", period: "Monthly • 2026-03-01 to 2026-03-31", spent: 385, limit: 400, status: "Near Limit" },
  { id: 4, user: "Sarah Wilson", category: "Healthcare", period: "Monthly • 2026-03-01 to 2026-03-31", spent: 450, limit: 1000, status: "Safe" },
  { id: 5, user: "Tom Brown", category: "Shopping", period: "Monthly • 2026-03-01 to 2026-03-31", spent: 720, limit: 600, status: "Over Budget" },
  { id: 6, user: "Emily Davis", category: "Dining", period: "Monthly • 2026-03-01 to 2026-03-31", spent: 280, limit: 450, status: "Safe" }
]);

// Savings Goals Data
const savingsGoals = ref([
  { id: 1, user: "John Doe", goal: "Vacation Fund", targetDate: "2026-07-01", saved: 3200, target: 5000, status: "On track" },
  { id: 2, user: "Jane Smith", goal: "Emergency Fund", targetDate: "2026-12-31", saved: 8500, target: 10000, status: "On track" },
  { id: 3, user: "Sarah Wilson", goal: "New Car", targetDate: "2027-06-01", saved: 6200, target: 15000, status: "On track" },
  { id: 4, user: "Tom Brown", goal: "Home Renovation", targetDate: "2026-10-15", saved: 12000, target: 20000, status: "On track" }
]);

// Computed
const totalBudgets = computed(() => budgets.value.length);
const overBudget = computed(() => budgets.value.filter(b => b.status === "Over Budget").length);
const savingsGoalsCount = computed(() => savingsGoals.value.length);

// Helpers
const getPercentage = (spent, limit) => Math.min((spent / limit) * 100, 100);
const getSavingsPercentage = (saved, target) => ((saved / target) * 100).toFixed(1);
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
</script>

<template>
  <div class="layout" :class="{ 'sidebar-open': isSidebarOpen }">
    <!-- Sidebar Toggle Button (Left Center) - Only visible on mobile/tablet -->
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
        <a class="active">
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

    <!-- Main -->
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
        <div class="budget-list">
          <div v-for="budget in budgets" :key="budget.id" class="budget-item">
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
        <div class="savings-list">
          <div v-for="goal in savingsGoals" :key="goal.id" class="savings-item">
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

/* ========================================
   DESKTOP STYLES (Default - Mobile First Override)
   ======================================== */

/* Sidebar - Desktop Default */
.sidebar {
  width: 250px;
  background: #1e3a8a;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px;
  flex-shrink: 0; /* Prevent shrinking */
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

/* Main Content - Desktop Default */
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

/* Section Card */
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

/* Status Badge */
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

/* Progress Bar */
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

/* Sidebar Overlay for Mobile */
.sidebar-overlay {
  display: none; /* Hidden by default (desktop) */
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
  /* Show toggle button */
  .sidebar-toggle {
    display: flex;
  }
  
  /* Show overlay when sidebar is open */
  .layout.sidebar-open .sidebar-overlay {
    display: block;
  }
  
  /* Sidebar - Tablet/Mobile */
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
  
  /* Compact brand area - MAJOR REDUCTION */
  .brand {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px; /* Reduced from 100px */
    margin-top: 5px;
    flex-shrink: 0; /* Prevent shrinking */
  }
  
  .logo {
    width: 32px;
    height: 32px;
  }
  
  .titlelogo {
    font-size: 18px;
  }
  
  /* Navigation - compact */
  .sidebar nav {
    flex: 1; /* Take available space */
    overflow-y: auto; /* Allow nav to scroll if needed */
    margin-bottom: 10px;
  }
  
  .sidebar nav a {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    margin-bottom: 4px; /* Reduced gap */
    cursor: pointer;
    opacity: 0.9;
    font-size: 14px; /* Smaller font */
    text-decoration: none;
    color: white;
    white-space: nowrap;
  }
  
  .icon-sidebar {
    width: 22px;
    height: 22px;
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
    margin-top: auto; /* Push to bottom */
    cursor: pointer;
    font-size: 14px;
    padding: 10px 12px;
    border-radius: 8px;
    flex-shrink: 0; /* Prevent shrinking */
    white-space: nowrap;
  }
  
  /* Main content - full width on mobile */
  .main {
    width: 100%;
  }
  
  .summary-cards { 
    grid-template-columns: repeat(2, 1fr); 
  }
}

@media (max-width: 640px) {
  .sidebar {
    width: 80%; /* Reduced from 85% */
    max-width: 240px; /* Reduced from 280px */
    padding: 10px;
  }
  
  .sidebar-toggle {
    left: 0;
    top: 10px;
    transform: none;
    border-radius: 0 8px 8px 0;
    z-index: 1002;
    width: 30px;
    height: 36px;
    padding: 6px 5px;
  }
  
  .sidebar-toggle.active {
    left: 80%;
    max-width: 240px;
    border-radius: 8px 0 0 8px;
    margin-left: -30px;
  }
  
  /* Even more compact for mobile */
  .brand {
    margin-bottom: 15px;
    margin-top: 0;
    gap: 6px;
  }
  
  .logo {
    width: 28px;
    height: 28px;
  }
  
  .titlelogo {
    font-size: 16px;
  }
  
  .sidebar nav a {
    padding: 10px 10px;
    font-size: 13px;
    margin-bottom: 3px;
    min-height: 44px; /* WCAG minimum */
  }
  
  .icon-sidebar {
    width: 20px;
    height: 20px;
  }
  
  .logout {
    padding: 10px 10px;
    font-size: 13px;
    min-height: 44px;
  }
}

/* Small Mobile: Maximum compression */
@media (max-width: 480px) {
  .sidebar {
    width: 85%;
    max-width: 220px;
    padding: 8px;
  }
  
  .sidebar-toggle.active {
    left: 85%;
    max-width: 220px;
  }
  
  .brand {
    margin-bottom: 10px;
    margin-top: 0;
  }
  
  .logo {
    width: 24px;
    height: 24px;
  }
  
  .titlelogo {
    font-size: 14px;
  }
  
  .sidebar nav a {
    padding: 9px 8px;
    font-size: 12px;
    margin-bottom: 2px;
    gap: 8px;
  }
  
  .icon-sidebar {
    width: 18px;
    height: 18px;
  }
  
  .logout {
    font-size: 12px;
    padding: 9px 8px;
    gap: 8px;
  }
}

/* Extra small screens or short viewports */
@media (max-height: 600px) and (max-width: 1024px) {
  .brand {
    margin-bottom: 8px;
    margin-top: 0;
  }
  
  .logo {
    width: 24px;
    height: 24px;
  }
  
  .titlelogo {
    font-size: 14px;
  }
  
  .sidebar nav a {
    padding: 8px 10px;
    font-size: 12px;
    margin-bottom: 2px;
    min-height: 40px;
  }
  
  .logout {
    padding: 8px 10px;
    font-size: 12px;
    min-height: 40px;
  }
}

/* Ensure proper scrolling when needed */
@media (max-width: 1024px) {
  .sidebar::-webkit-scrollbar {
    width: 4px;
  }
  
  .sidebar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .sidebar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
  
  .sidebar {
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Ensure nav can scroll independently if needed */
  .sidebar nav {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
  }
}

/* Improve touch targets on mobile */
@media (hover: none) and (pointer: coarse) {
  .sidebar nav a,
  .logout {
    min-height: 44px;
    display: flex;
    align-items: center;
  }
  
  .sidebar-toggle {
    min-height: 44px;
    min-width: 44px;
  }
}

@media (min-width: 1025px) and (max-height: 900px) {
  .sidebar {
    height: 100vh;
    max-height: 100vh;
    overflow: hidden; /* Stops the whole sidebar from scrolling */
    display: flex;
    flex-direction: column;
    padding: 15px; /* Reduced from 20px */
  }

  /* COMPACT BRAND AREA */
  .brand {
    margin-bottom: 15px !important; /* Reduced from 100px */
    margin-top: 5px;
  }

  .logo {
    width: 35px; /* Reduced from 50px */
    height: 35px;
  }

  .titlelogo {
    font-size: 20px; /* Reduced from 30px */
  }

  /* COMPACT NAVIGATION */
  .sidebar nav {
    flex: 1; /* Fills remaining space */
    overflow-y: auto; /* Only scrolls if strictly necessary */
    margin-bottom: 10px;
  }

  .sidebar nav a {
    margin-bottom: 5px; /* Reduced from 20px - HUGE SPACE SAVINGS */
    padding: 8px 10px;
    font-size: 15px; /* Reduced from 20px */
  }

  .icon-sidebar {
    width: 22px; /* Reduced from 30px */
    height: 22px;
  }

  /* LOCK LOGOUT TO BOTTOM */
  .logout {
    margin-top: auto; /* Pushes to bottom */
    flex-shrink: 0;
    padding: 10px;
    font-size: 15px; /* Reduced from 20px */
  }
  
  /* Scrollbar styling for the inner nav just in case */
  .sidebar nav::-webkit-scrollbar {
    width: 4px;
  }
  
  .sidebar nav::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
}

@media (min-width: 1024px) and (max-width: 1280px) {
  /* Reduce padding on the sidebar container */
  .sidebar {
    padding: 15px; 
  }

  /* COMPACT BRAND AREA: Reduce 100px margin to 30px */
  .brand {
    margin-bottom: 30px !important;
    margin-top: 10px;
  }

  .logo {
    width: 40px;
    height: 40px;
  }

  .titlelogo {
    font-size: 22px;
  }

  /* COMPACT NAVIGATION: Reduce 20px margin to 8px */
  .sidebar nav a {
    margin-bottom: 8px !important;
    font-size: 16px; /* Reduced from 20px */
    padding: 8px 12px;
  }

  .icon-sidebar {
    width: 24px; /* Reduced from 30px */
    height: 24px;
  }

  /* COMPACT LOGOUT */
  .logout {
    font-size: 16px; /* Reduced from 20px */
    padding: 10px 12px;
  }
}
</style>