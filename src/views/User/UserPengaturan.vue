<script setup>
import UserSideBar from '@/components/UserSideBar.vue'

/* =========================
   SETTINGS DATA
========================= */
const accountMenus = [
  {
    id: 1,
    icon: '👤',
    title: 'Edit Profil',
    desc: 'Ubah informasi pribadi kamu',
    danger: false
  },
  {
    id: 2,
    icon: '🔒',
    title: 'Ganti Password',
    desc: 'Perbarui password akun kamu',
    danger: false
  },
  {
    id: 3,
    icon: '🗑',
    title: 'Hapus Akun',
    desc: 'Hapus akun dan semua data',
    danger: true
  }
]

const preferenceMenus = [
  {
    id: 1,
    icon: '☀️',
    title: 'Dark Mode',
    desc: 'Aktifkan tema gelap',
    action: 'Aktifkan'
  },
  {
    id: 2,
    icon: '🌐',
    title: 'Bahasa',
    desc: 'Indonesia'
  },
  {
    id: 3,
    icon: '💱',
    title: 'Mata Uang Utama',
    desc: 'IDR - Rupiah'
  }
]

const notificationMenus = [
  {
    id: 1,
    title: 'Budget Warning',
    desc: 'Notifikasi saat budget hampir habis'
  },
  {
    id: 2,
    title: 'Bill Reminders',
    desc: 'Pengingat tagihan yang akan jatuh tempo'
  },
  {
    id: 3,
    title: 'Goal Alerts',
    desc: 'Notifikasi milestone target tabungan'
  },
  {
    id: 4,
    title: 'AI Insights',
    desc: 'Notifikasi insight keuangan dari AI'
  }
]

const dataMenus = [
  {
    id: 1,
    icon: '⬇️',
    title: 'Export CSV',
    desc: 'Download data transaksi',
    disabled: false
  },
  {
    id: 2,
    icon: '⚙️',
    title: 'Webhook Settings',
    desc: 'Coming soon',
    disabled: true
  }
]

const aboutMenus = [
  {
    id: 1,
    icon: '💜',
    title: 'Versi App',
    desc: 'v1.0.0'
  },
  {
    id: 2,
    icon: '🛡',
    title: 'Privacy Policy',
    desc: 'Kebijakan privasi kami'
  },
  {
    id: 3,
    icon: '📄',
    title: 'Syarat & Ketentuan',
    desc: 'Ketentuan penggunaan'
  }
]
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
          <h1>Pengaturan</h1>
        </div>
      </div>

      <!-- CONTENT SCROLL -->
      <main class="content-scroll">
        <!-- AKUN -->
        <section class="setting-card">
          <h3>Akun</h3>

          <div class="setting-list">
            <button
              v-for="item in accountMenus"
              :key="item.id"
              class="setting-item"
              :class="{ danger: item.danger }"
            >
              <div class="setting-left">
                <div class="setting-icon">
                  {{ item.icon }}
                </div>

                <div>
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.desc }}</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        <!-- PREFERENSI -->
        <section class="setting-card">
          <h3>Preferensi</h3>

          <div class="setting-list">
            <div
              v-for="item in preferenceMenus"
              :key="item.id"
              class="setting-item"
            >
              <div class="setting-left">
                <div class="setting-icon">
                  {{ item.icon }}
                </div>

                <div>
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.desc }}</p>
                </div>
              </div>

              <button
                v-if="item.action"
                class="outline-btn"
              >
                {{ item.action }}
              </button>
            </div>
          </div>
        </section>

        <!-- NOTIFIKASI -->
        <section class="setting-card">
          <h3>Notifikasi</h3>

          <div class="setting-list compact">
            <div
              v-for="item in notificationMenus"
              :key="item.id"
              class="setting-item no-icon"
            >
              <div>
                <h4>{{ item.title }}</h4>
                <p>{{ item.desc }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- DATA -->
        <section class="setting-card">
          <h3>Data</h3>

          <div class="setting-list">
            <button
              v-for="item in dataMenus"
              :key="item.id"
              class="setting-item"
              :class="{ disabled: item.disabled }"
            >
              <div class="setting-left">
                <div class="setting-icon">
                  {{ item.icon }}
                </div>

                <div>
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.desc }}</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        <!-- TENTANG -->
        <section class="setting-card">
          <h3>Tentang</h3>

          <div class="setting-list">
            <button
              v-for="item in aboutMenus"
              :key="item.id"
              class="setting-item"
            >
              <div class="setting-left">
                <div class="setting-icon">
                  {{ item.icon }}
                </div>

                <div>
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.desc }}</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        <!-- LOGOUT -->
        <section class="logout-card">
          <button class="logout-btn">
            ↪ Keluar
          </button>
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

/* MAIN - MENGIKUTI TEMPLATE */
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
  font-size: 38px;
  font-weight: 700;
  color: #1e293b;
}

/* CONTENT */
.content-scroll {
  padding: 0 30px 40px;
}

/* CARD */
.setting-card,
.logout-card {
  background: white;
  border-radius: 22px;
  padding: 24px 26px;
  margin-bottom: 22px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.setting-card h3 {
  margin: 0 0 22px;
  color: #1e293b;
  font-size: 15px;
  font-weight: 700;
}

/* LIST */
.setting-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-list.compact {
  gap: 18px;
}

/* ITEM */
.setting-item {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  text-align: left;

  display: flex;
  align-items: center;
  justify-content: space-between;

  cursor: pointer;
}

.setting-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.setting-icon {
  width: 24px;
  height: 24px;
  color: #4f46e5;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 15px;
  flex-shrink: 0;
}

.setting-item h4 {
  margin: 0 0 4px;
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;
}

.setting-item p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
}

.setting-item:hover h4 {
  color: #4f46e5;
}

/* NO ICON */
.setting-item.no-icon {
  cursor: default;
}

.setting-item.no-icon:hover h4 {
  color: #1e293b;
}

/* DANGER */
.setting-item.danger h4,
.setting-item.danger .setting-icon {
  color: #ef4444;
}

.setting-item.danger:hover h4 {
  color: #dc2626;
}

/* DISABLED */
.setting-item.disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.setting-item.disabled:hover h4 {
  color: #1e293b;
}

/* OUTLINE BUTTON */
.outline-btn {
  width: 90px;
  height: 38px;
  border: 2px solid #4f46e5;
  border-radius: 10px;
  background: transparent;
  color: #4f46e5;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.outline-btn:hover {
  background: #4f46e5;
  color: white;
}

/* LOGOUT */
.logout-card {
  padding: 22px;
}

.logout-btn {
  width: 100%;
  height: 54px;
  border: none;
  border-radius: 14px;
  background: #ef4444;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

.logout-btn:hover {
  background: #dc2626;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .dashboard-layout {
    min-height: 100vh;
  }

  .main-wrapper {
    margin-left: 0;
    padding-top: 120px;
  }

  .topbar {
    left: 0;
    width: 100%;
  }

  .top-header {
    justify-content: flex-start;
    padding-bottom: 32px;
  }

  .top-header h1 {
    font-size: 30px;
  }

  .content-scroll {
    max-width: 100%;
    padding: 0 16px 30px;
  }

  .setting-card,
  .logout-card {
    border-radius: 18px;
    padding: 22px;
  }

  .outline-btn {
    width: 84px;
    height: 36px;
  }
}
</style>