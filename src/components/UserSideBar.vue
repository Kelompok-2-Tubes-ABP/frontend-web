<script setup>
import { RouterLink } from "vue-router";

import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Target,
  BarChart3,
  ArrowLeftRight,
  Repeat,
  Receipt,
  MessageSquare,
  Settings,
  Bell,
  Moon,
  
} from "lucide-vue-next";

const menus = [
  { path:'/userDashboard',name: "Dashboard", icon: LayoutDashboard },
  { path:'/userTransaction',name: "Transaksi", icon: Wallet },
  { path:'/userBudget',name: "Budget", icon: TrendingUp },
  { path:'/userTabungan',name: "Tabungan", icon: Target },
  { path:'/userInvestasi',name: "Investasi", icon: BarChart3 },
  { path:'/userHutang',name: "Hutang", icon: ArrowLeftRight },
  { path:'/userRecurring',name: "Recurring", icon: Repeat },
  { path:'/userBill',name: "Bill Reminder", icon: Receipt },
  { path:'/userInsights',name: "Insights", icon: TrendingUp },
  { path:'/userChatBot',name: "AI Chatbot", icon: MessageSquare },
  { path:'/userNotifikasi',name: "Notifikasi", icon: Bell },
  { path:'/userPengaturan',name: "Pengaturan", icon: Settings }

];
</script>

<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="logo-section">
      <h1>FinanceApp</h1>
      <p>Kelola keuanganmu</p>
    </div>

    <!-- Profile Card -->
    <div class="profile-card">
      <div class="avatar">O</div>

      <div class="profile-info">
        <h3>Orcas</h3>
        <span>Rp 8.450.000</span>
      </div>
    </div>

    <!-- Menu -->
    <nav class="menu">
      <routerLink
        v-for="item in menus"
        :key="item.name"
        :to="item.path"
        class="menu-item"
        active-class="active"
      >
        <component :is="item.icon" :size="20" />
        <span>{{ item.name }}</span>
      </routerLink>
    </nav>

    <!-- Dark Mode -->
    <button class="dark-mode-btn">
      <Moon :size="18" />
      <span>Mode Gelap</span>
    </button>
  </aside>
</template>



<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: #f5f5f5;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e5e5;
  position: fixed;
}

/* Logo */

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-section h1 {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0;
}

.logo-section p {
  color: #7c8aa5;
  margin-top: 4px;
  font-size: 20px;
}

/* Profile */
.profile-card {
  margin-top: 24px;
  background: #eceef3;
  border-radius: 18px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #4f46e5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.profile-info h3 {
  margin: 0;
  font-size: 22px;
  color: #1f2937;
}

.profile-info span {
  color: #6b7280;
  font-size: 20px;
}

/* Menu */
.menu {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
  padding: 14px 16px;
  border-radius: 16px;
  color: #1f2937;
  transition: 0.2s;
  font-size: 20px;
  font-weight: 500;
}

.menu-item:hover {
  background: #e5e7eb;
}

.menu-item.active {
  background: #4f46e5;
  color: white;
}

/* Dark Mode */
.dark-mode-btn {
  width: 100%;
  padding: 14px;
  border-radius: 16px;
  border: 2px solid #4f46e5;
  background: transparent;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  font-size: 20px;
  font-weight: 500;
  transition: 0.2s;

  margin-top: 20px;
  margin-bottom: 40px;
}

.dark-mode-btn:hover {
  background: #4f46e5;
  color: white;
}
</style>