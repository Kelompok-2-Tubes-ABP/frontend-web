<script setup>
import { ref, onMounted, computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import axios from "axios";
import { API_BASE } from "../../services/api.js";
import iconLogout from "../assets/User/icon-logout.svg";

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
  { path:'/userChatBot',name: "AI Chatbot", icon: MessageSquare },
  { path:'/userNotifikasi',name: "Notifikasi", icon: Bell },
  { path:'/userPengaturan',name: "Pengaturan", icon: Settings }

];

const router = useRouter();
const username = ref("");
const avatarLetter = computed(() => {
  const name = username.value || "";
  return name ? name.charAt(0).toUpperCase() : "U";
});

const fetchProfile = async () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) return;
  try {
    const res = await axios.get(`${API_BASE}/profile/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = res.data.Message || res.data.message;
    username.value = data.username || "";
  } catch (err) {
    console.error("Error fetching profile:", err);
  }
};

const handleLogout = async () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  try {
    await axios.post(
      `${API_BASE}/auth/logout`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  } catch (err) {
    console.error("Logout error:", err);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    router.push("/");
  }
};

onMounted(fetchProfile);
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
      <div class="avatar">{{ avatarLetter }}</div>

      <div class="profile-info">
        <h3>{{ username || 'User' }}</h3>
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

    <!-- Logout Button (bottom) -->
    <div class="sidebar-logout">
      <button class="logout-btn" @click="handleLogout">
        <img :src="iconLogout" alt="Keluar" class="logout-icon" />
        <span>Keluar</span>
      </button>
    </div>
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

/* Sidebar Logout */
.sidebar-logout {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.logout-btn {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 14px;
  background: #ef4444;
  color: white;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.logout-icon {
  width: 22px;
  height: 22px;
  display: block;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.logout-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
}

.logout-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}
</style>