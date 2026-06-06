<script setup>
import { ref } from 'vue'
import UserSideBar from '@/components/UserSideBar.vue'

/* =========================
   DATA INSIGHTS
========================= */
const healthScore = ref(75)

const insightCards = ref([
  {
    id: 1,
    icon: '💡',
    iconClass: 'yellow',
    badges: ['Urgent', 'Saving Opportunity'],
    title: 'Hemat Kopi, Nabung Lebih Banyak',
    description:
      'Pengeluaran kopi kamu Rp 450.000/bulan. Dengan mengurangi 30%, kamu bisa hemat Rp 135.000 dan tambahkan ke tabungan MacBook!',
    action: 'Lihat Tips Hemat',
    actionIcon: '→'
  },
  {
    id: 2,
    icon: '↗',
    iconClass: 'green',
    badges: ['Normal', 'Achievement'],
    title: 'Target Liburan Hampir Tercapai!',
    description:
      'Hanya Rp 2.500.000 lagi untuk mencapai target tabungan liburan. Tetap semangat!',
    action: 'Lihat Detail',
    actionIcon: '→'
  },
  {
    id: 3,
    icon: '!',
    iconClass: 'orange',
    badges: ['Urgent', 'Budget Alert'],
    title: 'Budget Makanan Hampir Habis',
    description:
      'Kamu sudah menggunakan 85% budget makanan bulan ini. Pertimbangkan untuk masak di rumah lebih sering.',
    action: 'Lihat Budget',
    actionIcon: '→'
  },
  {
    id: 4,
    icon: '⚙',
    iconClass: 'blue',
    badges: ['Info', 'Monthly Summary'],
    title: 'Pengeluaran Turun 15%',
    description:
      'Pengeluaran bulan ini turun 15% dibanding bulan lalu. Pertahankan kebiasaan baikmu!',
    action: 'Lihat Analisis',
    actionIcon: '→'
  }
])

const expenseAnalysis = ref([
  {
    id: 1,
    name: 'Makanan & Minuman',
    amount: 1250000,
    percent: 49.0,
    colorClass: 'orange'
  },
  {
    id: 2,
    name: 'Transportasi',
    amount: 500000,
    percent: 19.6,
    colorClass: 'purple'
  },
  {
    id: 3,
    name: 'Belanja',
    amount: 450000,
    percent: 17.6,
    colorClass: 'red'
  },
  {
    id: 4,
    name: 'Tagihan',
    amount: 300000,
    percent: 11.8,
    colorClass: 'deep-orange'
  },
  {
    id: 5,
    name: 'Hiburan',
    amount: 50000,
    percent: 2.0,
    colorClass: 'green'
  }
])

/* =========================
   FORMAT RUPIAH
========================= */
const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID').format(value)
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
          <h1>Spending Insights 💡</h1>
        </div>
      </div>

      <!-- CONTENT SCROLL -->
      <main class="content-scroll">
        <!-- HEALTH SCORE CARD -->
        <section class="score-card">
          <h3>Financial Health Score</h3>

          <div class="score-wrapper">
            <div class="score-circle">
              <div class="score-inner">
                <h2>{{ healthScore }}</h2>
                <p>Sehat</p>
              </div>
            </div>

            <p class="score-status">
              Finansial Sehat ✅
            </p>
          </div>
        </section>

        <!-- INSIGHT CARDS -->
        <section class="insight-list">
          <div
            v-for="item in insightCards"
            :key="item.id"
            class="insight-card"
          >
            <div
              class="insight-icon"
              :class="item.iconClass"
            >
              {{ item.icon }}
            </div>

            <div class="insight-content">
              <div class="badge-row">
                <span
                  v-for="badge in item.badges"
                  :key="badge"
                  class="badge"
                  :class="{
                    urgent: badge === 'Urgent',
                    normal: badge === 'Normal',
                    info: badge === 'Info',
                    saving: badge === 'Saving Opportunity',
                    achievement: badge === 'Achievement',
                    budget: badge === 'Budget Alert',
                    summary: badge === 'Monthly Summary'
                  }"
                >
                  {{ badge }}
                </span>
              </div>

              <h3>{{ item.title }}</h3>

              <p>{{ item.description }}</p>

              <button class="action-btn">
                {{ item.action }} {{ item.actionIcon }}
              </button>
            </div>
          </div>
        </section>

        <!-- ANALISIS PENGELUARAN -->
        <section class="analysis-card">
          <h3>Analisis Pengeluaran</h3>

          <div class="analysis-list">
            <div
              v-for="item in expenseAnalysis"
              :key="item.id"
              class="analysis-item"
            >
              <div class="analysis-header">
                <span>{{ item.name }}</span>

                <p>
                  Rp {{ formatRupiah(item.amount) }}
                  <small>({{ item.percent }}%)</small>
                </p>
              </div>

              <div class="progress-track">
                <div
                  class="progress-fill"
                  :class="item.colorClass"
                  :style="{ width: item.percent + '%' }"
                ></div>
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
  height: 100%;
  background: #f5f6fa;
  font-family: 'Inter', sans-serif;
}

/* MAIN */
.main-wrapper {
  flex: 1;
  margin-left: 300px;
  padding-top: 200px;
}

/* TOPBAR - FIXED MENGIKUTI TEMPLATE */
.topbar {
  position: fixed;
  top: 0;
  left: 300px;
  width: calc(100% - 300px);
  display: flex;
  flex-direction: column;
  padding: 10px 28px;
  background: rgba(245, 246, 250, 0.9);
  backdrop-filter: blur(10px);
  z-index: 1000;
  border-bottom: 3px solid #e5e7eb;
  padding-top: 30px;
}

.top-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 86px;
}

.top-header h1 {
  margin: 0;
  font-size: 38px;
  font-weight: 700;
  color: #1e293b;
}

.content-scroll {
  padding: 30px;
}

/* SCORE CARD */
.score-card {
  background: white;
  border-radius: 22px;
  padding: 24px 28px;
  min-height: 190px;
  margin-bottom: 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.score-card h3 {
  margin: 0;
  color: #1e293b;
  font-size: 14px;
  font-weight: 700;
}

.score-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 18px;
}

.score-circle {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: conic-gradient(
    #14b8a6 0deg 270deg,
    #e2e8f0 270deg 360deg
  );
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.score-circle::before {
  content: '';
  position: absolute;
  width: 82px;
  height: 82px;
  border-radius: 50%;
  background: white;
}

.score-inner {
  position: relative;
  text-align: center;
  z-index: 2;
}

.score-inner h2 {
  margin: 0;
  color: #1e293b;
  font-size: 30px;
  font-weight: 600;
}

.score-inner p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 13px;
}

.score-status {
  margin: 14px 0 0;
  color: #10b981;
  font-size: 13px;
  font-weight: 700;
}

/* INSIGHT LIST */
.insight-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.insight-card {
  background: white;
  border-radius: 22px;
  padding: 28px 24px;
  min-height: 105px;
  display: flex;
  align-items: flex-start;
  gap: 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.insight-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 700;
}

.insight-icon.yellow {
  background: #fff7ed;
  color: #f59e0b;
}

.insight-icon.green {
  background: #ecfdf5;
  color: #10b981;
}

.insight-icon.orange {
  background: #fff7ed;
  color: #f97316;
}

.insight-icon.blue {
  background: #eef2ff;
  color: #4f46e5;
}

.insight-content {
  flex: 1;
}

.badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.badge {
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
}

.badge.urgent {
  background: #fee2e2;
  color: #ef4444;
}

.badge.normal {
  background: #ffedd5;
  color: #f97316;
}

.badge.info {
  background: #e0e7ff;
  color: #4f46e5;
}

.badge.saving,
.badge.achievement,
.badge.budget,
.badge.summary {
  background: #f1f5f9;
  color: #64748b;
}

.insight-content h3 {
  margin: 0 0 8px;
  color: #1e293b;
  font-size: 17px;
  font-weight: 700;
}

.insight-content p {
  margin: 0 0 12px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.action-btn {
  border: none;
  background: transparent;
  color: #4f46e5;
  font-size: 13px;
  font-weight: 700;
  padding: 0;
  cursor: pointer;
}

.action-btn:hover {
  text-decoration: underline;
}

/* ANALYSIS */
.analysis-card {
  background: white;
  border-radius: 22px;
  padding: 26px 24px;
  margin-top: 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.analysis-card h3 {
  margin: 0 0 22px;
  color: #1e293b;
  font-size: 15px;
  font-weight: 700;
}

.analysis-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.analysis-header span {
  color: #1e293b;
  font-size: 13px;
  font-weight: 700;
}

.analysis-header p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.analysis-header small {
  color: #64748b;
}

.progress-track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #eef2f7;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
}

.progress-fill.orange {
  background: #f59e0b;
}

.progress-fill.purple {
  background: #4f46e5;
}

.progress-fill.red {
  background: #ef4444;
}

.progress-fill.deep-orange {
  background: #f97316;
}

.progress-fill.green {
  background: #10b981;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .dashboard-layout {
    height: auto;
    min-height: 100vh;
  }

  .main-wrapper {
    margin-left: 0;
    padding-top: 110px;
  }

  .topbar {
    left: 0;
    width: 100%;
  }

  .top-header {
    padding-bottom: 30px;
  }

  .top-header h1 {
    font-size: 28px;
  }

  .content-scroll {
    max-width: 100%;
    padding: 0 16px 30px;
  }

  .score-card,
  .insight-card,
  .analysis-card {
    border-radius: 18px;
  }

  .insight-card {
    padding: 22px 18px;
  }
}
</style>