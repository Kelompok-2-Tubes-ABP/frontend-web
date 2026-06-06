<script setup>
import { ref, computed } from 'vue'
import UserSideBar from '@/components/UserSideBar.vue'

/* =========================
   DATA NOTIFIKASI
========================= */
const notificationGroups = ref([
  {
    group: 'Hari Ini',
    items: [
      {
        id: 1,
        icon: '!',
        iconClass: 'red',
        title: 'Budget terlampaui',
        desc: 'Budget Makanan 100% terlampaui',
        time: '14:30',
        unread: true
      },
      {
        id: 2,
        icon: '!',
        iconClass: 'orange',
        title: 'Budget hampir habis',
        desc: 'Budget Transportasi 80% terpakai',
        time: '10:15',
        unread: true
      },
      {
        id: 3,
        icon: '💵',
        iconClass: 'yellow',
        title: 'Tagihan jatuh tempo',
        desc: 'PLN jatuh tempo besok, Rp 350.000',
        time: '08:00',
        unread: true
      }
    ]
  },
  {
    group: 'Kemarin',
    items: [
      {
        id: 4,
        icon: '🎯',
        iconClass: 'green',
        title: 'Goal milestone',
        desc: 'Tabungan Laptop 50% tercapai 🎉',
        time: '2 Mei, 16:45',
        unread: false
      },
      {
        id: 5,
        icon: '↻',
        iconClass: 'purple',
        title: 'Recurring executed',
        desc: 'Langganan Netflix Rp 54.000 dicatat',
        time: '2 Mei, 12:00',
        unread: false
      },
      {
        id: 6,
        icon: '💡',
        iconClass: 'yellow',
        title: 'New insight',
        desc: 'AI menemukan pola baru di pengeluaran kamu',
        time: '2 Mei, 09:30',
        unread: false
      }
    ]
  },
  {
    group: 'Minggu Ini',
    items: [
      {
        id: 7,
        icon: '↙',
        iconClass: 'red',
        title: 'Debt reminder',
        desc: 'Hutang ke Andi jatuh tempo 3 hari lagi',
        time: '1 Mei, 10:00',
        unread: false
      },
      {
        id: 8,
        icon: '↗',
        iconClass: 'green',
        title: 'Achievement unlocked',
        desc: 'Kamu sudah menabung 5 kali minggu ini 🏆',
        time: '30 Apr, 18:20',
        unread: false
      },
      {
        id: 9,
        icon: '💵',
        iconClass: 'yellow',
        title: 'Bill paid',
        desc: 'Pembayaran Internet Rp 350.000 berhasil dicatat',
        time: '29 Apr, 14:10',
        unread: false
      }
    ]
  }
])

/* =========================
   COMPUTED
========================= */
const unreadCount = computed(() => {
  return notificationGroups.value.reduce((total, group) => {
    return total + group.items.filter((item) => item.unread).length
  }, 0)
})

/* =========================
   ACTION
========================= */
const markAllAsRead = () => {
  notificationGroups.value = notificationGroups.value.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      unread: false
    }))
  }))
}
</script>

<template>
  <div class="dashboard-layout">
    <!-- SIDEBAR -->
    <UserSideBar />

    <!-- MAIN -->
    <div class="main-wrapper">
      <!-- TOPBAR FIXED -->
      <div class="topbar">
        <div class="top-header">
          <div>
            <h1>Notifikasi</h1>
            <p>{{ unreadCount }} notifikasi belum dibaca</p>
          </div>

          <button class="read-btn" @click="markAllAsRead">
            Tandai Semua Dibaca
          </button>
        </div>
      </div>

      <!-- CONTENT SCROLL -->
      <main class="content-scroll">
        <section
          v-for="group in notificationGroups"
          :key="group.group"
          class="notification-group"
        >
          <h3>{{ group.group }}</h3>

          <div class="notification-list">
            <div
              v-for="item in group.items"
              :key="item.id"
              class="notification-card"
              :class="{ unread: item.unread }"
            >
              <div
                class="notif-icon"
                :class="item.iconClass"
              >
                {{ item.icon }}
              </div>

              <div class="notif-content">
                <div class="notif-header">
                  <h4>{{ item.title }}</h4>

                  <span
                    v-if="item.unread"
                    class="new-badge"
                  >
                    Baru
                  </span>
                </div>

                <p>{{ item.desc }}</p>
                <small>{{ item.time }}</small>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f6fa;
  font-family: 'Inter', sans-serif;
}

/* MAIN */
.main-wrapper {
  flex: 1;
  margin-left: 300px;
  padding-top: 200px;
}

/* TOPBAR FIXED */
.topbar {
  position: fixed;
  top: 0;
  left: 300px;
  width: calc(100% - 300px);
  display: flex;
  flex-direction: column;
  padding: 10px 28px;
  padding-top: 30px;
  background: rgba(245, 246, 250, 0.9);
  backdrop-filter: blur(10px);
  z-index: 1000;
  border-bottom: 3px solid #e5e7eb;
}

.top-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 66px;
}

.top-header h1 {
  margin: 0;
  color: #1e293b;
  font-size: 38px;
  font-weight: 700;
}

.top-header p {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
}

/* BUTTON */
.read-btn {
  min-width: 170px;
  height: 42px;
  border: 2px solid #4f46e5;
  border-radius: 10px;
  background: transparent;
  color: #4f46e5;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  margin-right: 60px;
}

.read-btn:hover {
  background: #4f46e5;
  color: white;
}

/* CONTENT */
.content-scroll {
  padding: 0 30px 45px;
}

/* GROUP */
.notification-group {
  margin-bottom: 24px;
}

.notification-group h3 {
  margin: 0 0 12px;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* CARD */
.notification-card {
  min-height: 112px;
  background: white;
  border-radius: 20px;
  padding: 24px 28px;

  display: flex;
  align-items: center;
  gap: 18px;

  border: 2px solid transparent;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.notification-card.unread {
  border-color: #4f46e5;
}

/* ICON */
.notif-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.notif-icon.red {
  background: #fee2e2;
  color: #ef4444;
}

.notif-icon.orange {
  background: #ffedd5;
  color: #f97316;
}

.notif-icon.yellow {
  background: #fef3c7;
  color: #f59e0b;
}

.notif-icon.green {
  background: #dcfce7;
  color: #10b981;
}

.notif-icon.purple {
  background: #ede9fe;
  color: #4f46e5;
}

/* CONTENT NOTIF */
.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.notif-header h4 {
  margin: 0;
  color: #1e293b;
  font-size: 14px;
  font-weight: 700;
}

.notif-content p {
  margin: 6px 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.4;
}

.notif-content small {
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
}

/* BADGE */
.new-badge {
  min-width: 42px;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #ede9fe;
  color: #4f46e5;

  font-size: 10px;
  font-weight: 700;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .main-wrapper {
    margin-left: 0;
    padding-top: 140px;
  }

  .topbar {
    left: 0;
    width: 100%;
  }

  .top-header {
    max-width: 100%;
    padding-bottom: 36px;
  }

  .top-header h1 {
    font-size: 30px;
  }

  .top-header p {
    font-size: 12px;
  }

  .read-btn {
    min-width: 140px;
    height: 38px;
    font-size: 11px;
  }

  .content-scroll {
    max-width: 100%;
    padding: 0 16px 35px;
  }

  .notification-card {
    min-height: 100px;
    padding: 20px;
    border-radius: 18px;
  }

  .notif-header h4 {
    font-size: 13px;
  }

  .notif-content p {
    font-size: 12px;
  }
}
</style>