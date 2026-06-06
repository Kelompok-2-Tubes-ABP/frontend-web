<script setup>
import { ref, onMounted, computed } from 'vue'
import UserSidebar from '@/components/UserSideBar.vue'
import TrendingUp from '@/assets/User/icon-TrendingUp.svg'
import TrendingDown from '@/assets/User/icon-TrendingDown.svg'
import EyeIcon from '@/assets/User/button.svg'
import TransactionIcon from '@/assets/User/icon-transaction.svg'
import BudgetIcon from '@/assets/User/icon-budgets.svg'
import GoalIcon from '@/assets/User/icon-goals.svg'
import ChatBotIcon from '@/assets/User/icon-chatbot.svg'
import { Bell } from 'lucide-vue-next'
import router from '@/router'
import iconMakanan from '@/assets/User/icon-makanan.svg'
import iconTransportasi from '@/assets/User/icon-transportasi.svg'
import iconHiburan from '@/assets/User/icon-hiburan.svg'
import iconBelanja from '@/assets/User/icon-belanja.svg'
import iconTagihan from '@/assets/User/icon-tagihan.svg'
import iconKesehatan from '@/assets/User/icon-kesehatan.svg'
import iconInvestasi from '@/assets/User/icon-investasi.svg'
import iconPemasukan from '@/assets/User/icon-pemasukan.svg'
import iconLainnya from '@/assets/User/icon-lainya.svg' 

const userName = ref('')
const loadingProfile = ref(false)

const currentDate = ref('')
const currentMonthYear = ref('')

const totalSaldo = ref(0)
const totalPemasukan = ref(0)
const totalPengeluaran = ref(0)

const totalBudget = ref(0)
const totalTerpakai = ref(0)
const totalSisa = ref(0)
const statusBudget = ref('')

const activeTabungan = ref(0)
const topSavingGoals = ref([])

const categoryPengeluaran = ref('')
const amountPengeluaran = ref(0)
const percentageTransaction = ref(0)

const recentTransactions = ref([])

const formatCurrentDate = () => {
  const date = new Date()

  currentDate.value = date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  currentMonthYear.value = date.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })
}

const formatRupiah = (value) => {
  if (!value) return '0'

  return new Intl.NumberFormat('id-ID').format(Math.round(value))
}

const formatCategory = (category) => {
  const categories = {
    food: 'Makanan',
    transport: 'Transportasi',
    entertainment: 'Hiburan',
    shopping: 'Belanja',
    bills: 'Tagihan',
    health: 'Kesehatan',
    education: 'Pendidikan',
    salary: 'Gaji',
    freelance: 'Freelance',
    investment: 'Investasi',
    gift: 'Hadiah',
    income: 'Pemasukan',
    other: 'Lainnya',
  }

  return categories[category] || category
}

const formatTransactionDate = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()

  const time = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  if (isToday) {
    return `Hari ini, ${time}`
  }

  const formattedDate = date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return `${formattedDate}, ${time}`
}

const isIncomeTransaction = (category) => {
  const incomeCategories = ['salary', 'freelance', 'investment', 'gift', 'income']

  return incomeCategories.includes(category)
}

const budgetPercentage = computed(() => {
  if (!totalBudget.value || totalBudget.value <= 0) return 0

  const percent = (totalTerpakai.value / totalBudget.value) * 100

  return Math.min(Math.round(percent), 100)
})

const getTransactionIcon = (category) => {
  const icons = {
    food: iconMakanan,
    transport: iconTransportasi,
    entertainment: iconHiburan,
    shopping: iconBelanja,
    bills: iconTagihan,
    health: iconKesehatan,
    education: iconLainnya,

    salary: iconPemasukan,
    freelance: iconPemasukan,
    income: iconPemasukan,
    gift: iconPemasukan,

    investment: iconInvestasi,
    other: iconLainnya,
  }

  return icons[category] || iconLainnya
}

const fetchUserProfile = async () => {
  try {
    loadingProfile.value = true

    const token = localStorage.getItem('token')

    const response = await fetch('http://localhost:8000/profile/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    console.log('Data profil pengguna:', data)
    if (!response.ok) {
      throw new Error(data.detail || 'Gagal memuat profil pengguna')
    }

    userName.value = data.Message?.username || 'User'
  } catch (error) {
    console.error('Gagal memuat profil pengguna:', error)
    userName.value = 'User'
  } finally {
    loadingProfile.value = false
  }
}

const fetchSaldo = async () => {
  try {
    loadingProfile.value = true

    const token = localStorage.getItem('token')

    const response = await fetch('http://localhost:8000/analytics/quick', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    console.log('Data saldo summary:', data)
    if (!response.ok) {
      throw new Error(data.detail || 'Gagal memuat ringkasan keuangan')
    }

    totalSaldo.value = data.data?.net_worth || 0
    totalPemasukan.value = data.data?.month_income || 0
    totalPengeluaran.value = data.data?.month_spending || 0
  } catch (error) {
    console.error('Gagal memuat ringkasan keuangan:', error)
  } finally {
    loadingProfile.value = false
  }
}

const fetchBudget = async () => {
  try {
    loadingProfile.value = true

    const token = localStorage.getItem('token')

    const response = await fetch('http://localhost:8000/budget/summary', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    console.log('Data budget summary:', data)

    if (!response.ok) {
      throw new Error(data.detail || 'Gagal memuat data budget')
    }

    totalBudget.value = data.total_budgeted || 0
    totalTerpakai.value = data.total_spent || 0
    totalSisa.value = data.total_remaining || 0
    statusBudget.value = data.status || 'no_budget'
  } catch (error) {
    console.error('Gagal memuat data budget:', error)
  } finally {
    loadingProfile.value = false
  }
}

const fetchSavingSummary = async () => {
  try {
    loadingProfile.value = true

    const token = localStorage.getItem('token')
    const response = await fetch('http://localhost:8000/savings_goal/summary', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    console.log('Data saving summary:', data)

    if (!response.ok) {
      throw new Error(data.detail || 'Gagal memuat data tabungan')
    }

    activeTabungan.value = data.active_goals || 0
  } catch (error) {
    console.error('Gagal memuat data tabungan:', error)
  } finally {
    loadingProfile.value = false
  }
}

const fetchSavingGoals = async () => {
  try {
    loadingProfile.value = true

    const token = localStorage.getItem('token')

    const response = await fetch('http://localhost:8000/savings_goal/get', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    console.log('Data top saving goals:', data)

    if (!response.ok) {
      throw new Error(data.detail || 'Gagal memuat data tabungan')
    }

    topSavingGoals.value = data
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 2)
  } catch (error) {
    console.error('Gagal memuat data tabungan:', error)
    topSavingGoals.value = []
  } finally {
    loadingProfile.value = false
  }
}

const fetchPengeluaranTerbesar = async () => {
  try {
    loadingProfile.value = true

    const token = localStorage.getItem('token')

    const response = await fetch('http://localhost:8000/analytics/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    console.log('Data pengeluaran terbesar:', data)

    if (!response.ok) {
      throw new Error(data.detail || 'Gagal memuat data pengeluaran terbesar')
    }

    const expenseBreakdown = data.data?.expense_breakdown || []

    if (expenseBreakdown.length > 0) {
      const biggestExpense = expenseBreakdown.reduce((max, item) => {
        return item.percentage > max.percentage ? item : max
      })

      categoryPengeluaran.value = biggestExpense.category
      amountPengeluaran.value = biggestExpense.amount
      percentageTransaction.value = Math.round(biggestExpense.percentage || 0)
    } else {
      categoryPengeluaran.value = ''
      amountPengeluaran.value = 0
      percentageTransaction.value = 0
    }
  } catch (error) {
    console.error('Gagal memuat data pengeluaran terbesar:', error)
  } finally {
    loadingProfile.value = false
  }
}

const fetchRecentTransactions = async () => {
  try {
    loadingProfile.value = true

    const token = localStorage.getItem('token')

    const response = await fetch('http://localhost:8000/transaction/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    console.log('Data recent transactions:', data)

    if (!response.ok) {
      throw new Error(data.detail || 'Gagal memuat transaksi terakhir')
    }

    const transactions = data['Transaction Retrieved Successfully!!'] || []

    recentTransactions.value = transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4)
  } catch (error) {
    console.error('Gagal memuat transaksi terakhir:', error)
    recentTransactions.value = []
  } finally {
    loadingProfile.value = false
  }
}

onMounted(() => {
  fetchUserProfile()
  formatCurrentDate()
  fetchSaldo()
  fetchBudget()
  fetchSavingSummary()
  fetchSavingGoals()
  fetchPengeluaranTerbesar()
  fetchRecentTransactions()
})
</script>

<template>
  <div class="dashboard-page">
    <!-- SIDEBAR -->
    <UserSidebar />

    <!-- MAIN CONTENT -->
    <main class="main-wrapper">
      <!-- TOPBAR -->
      <div class="topbar">
        <div class="topbar-header">
          <div>
            <h1>
              Halo,
              <span v-if="loadingProfile">...</span>
              <span v-else>{{ userName }}</span>
            </h1>

            <p>{{ currentDate }}</p>
          </div>

          <div class="notif" @click="router.push('/userNotifikasi')">
            <Bell :size="32" />
          </div>
        </div>
      </div>

      <!-- SALDO CARD -->
      <div class="saldo-card">
        <div>
          <p>Total Saldo</p>
          <h1>Rp {{ formatRupiah(totalSaldo) }}</h1>

          <div class="saldo-info">
            <div>
              <img :src="TrendingUp" />
              <div>
                <small>Pemasukan</small>
                <h4>Rp {{ formatRupiah(totalPemasukan) }}</h4>
              </div>
            </div>

            <div>
              <img :src="TrendingDown" />
              <div>
                <small>Pengeluaran</small>
                <h4>Rp {{ formatRupiah(totalPengeluaran) }}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- QUICK ACTION -->
      <div class="quick-actions">
        <div class="action-card" @click="router.push('/userTransaction')">
          <img :src="TransactionIcon" />
          <p>Transaksi</p>
        </div>

        <div class="action-card" @click="router.push('/userTabungan')">
          <img :src="GoalIcon" />
          <p>Goals</p>
        </div>

        <div class="action-card" @click="router.push('/userBudget')">
          <img :src="BudgetIcon" />
          <p>Budget</p>
        </div>

        <div class="action-card" @click="router.push('/userInvestasi')">
          <img :src="BudgetIcon" />
          <p>Investasi</p>
        </div>

        <div class="action-card" @click="router.push('/userChatBot')">
          <img :src="ChatBotIcon" />
          <p>AI Chat</p>
        </div>
      </div>

      <!-- GRID CARDS -->
      <div class="grid-cards">
        <!-- BUDGET -->
        <div class="small-card">
          <div class="card-header">
            <h3>Budget Bulan Ini</h3>

            <span
              class="badge green"
              v-if="statusBudget !== 'no_budget'"
            >
              {{ statusBudget }}
            </span>
          </div>

          <p>{{ currentMonthYear }}</p>

          <template v-if="statusBudget !== 'no_budget'">
            <h4>
              Rp {{ formatRupiah(totalTerpakai) }} /
              Rp {{ formatRupiah(totalBudget) }}
            </h4>

            <div class="progress">
              <div
                class="progress-fill"
                :style="{ width: budgetPercentage + '%' }"
              ></div>
            </div>

            <small>
              {{ budgetPercentage }}% terpakai, sisa Rp {{ formatRupiah(totalSisa) }}
            </small>
          </template>

          <template v-else>
            <small>Belom ada budget bulan ini</small>
          </template>
        </div>

        <!-- TARGET -->
        <div class="small-card">
          <div class="card-header">
            <h3>Target Tabungan</h3>

            <span
              class="badge purple"
              v-if="activeTabungan > 0"
            >
              {{ activeTabungan }} Aktif
            </span>
          </div>

          <div
            v-for="goal in topSavingGoals"
            :key="goal.goal.id"
            class="goal-progress-item"
          >
            <div class="target-item">
              <div>
                <p>{{ goal.goal.name }}</p>
              </div>

              <span>{{ Math.round(goal.progress) }}%</span>
            </div>

            <div class="progress">
              <div
                class="progress-fill green-fill"
                :style="{ width: Math.min(goal.progress, 100) + '%' }"
              ></div>
            </div>
          </div>

          <div v-if="topSavingGoals.length === 0">
            <small>Belum ada target tabungan aktif</small>
          </div>
        </div>

        <!-- PENGELUARAN -->
        <div class="small-card">
          <div class="card-header">
            <h3>Pengeluaran Terbesar</h3>

            <span
              class="badge orange"
              v-if="categoryPengeluaran"
            >
              {{ formatCategory(categoryPengeluaran) }}
            </span>
          </div>

          <div v-if="categoryPengeluaran" class="expense-item">
            <div class="left-expense">
              <div class="icon-box">
                <img
                  :src="getTransactionIcon(categoryPengeluaran)"
                  :alt="formatCategory(categoryPengeluaran)"
                />
              </div>

              <div>
                <p>{{ formatCategory(categoryPengeluaran) }}</p>
                <small>{{ percentageTransaction }}% dari total</small>
              </div>
            </div>

            <h4>Rp {{ formatRupiah(amountPengeluaran) }}</h4>
          </div>

          <div v-else>
            <small>Belum ada data pengeluaran bulan ini</small>
          </div>
        </div>
      </div>

      <!-- INVESTASI -->
      <div class="invest-card">
        <div class="card-header">
          <div>
            <h3>Portofolio Investasi</h3>
            <p>Total Nilai</p>
            <h2>Rp 25.650.000</h2>
          </div>

          <div class="profit">
            <small>+12.5%</small>
            <h3>+Rp 3.650.000</h3>
          </div>
        </div>

        <div class="chart-bars">
          <div v-for="i in 10" :key="i" class="bar"></div>
        </div>
      </div>

      <!-- TRANSAKSI -->
      <div class="transaction-card">
        <div class="card-header">
          <h3>Transaksi Terakhir</h3>
          <span class="lihat" @click="router.push('/userTransaction')">
            Lihat Semua
          </span>
        </div>

        <div
          v-for="transaction in recentTransactions"
          :key="transaction.id"
          class="transaction-item"
        >
          <div class="left-transaction">
            <div class="icon-box">
              <img 
                :src="getTransactionIcon(transaction.category)" 
                :alt="formatCategory(transaction.category)"
              />
            </div>

            <div>
              <h4>{{ transaction.description }}</h4>
              <p>
                {{ formatCategory(transaction.category) }} •
                {{ formatTransactionDate(transaction.date) }}
              </p>
            </div>
          </div>

          <h4 :class="{ income: isIncomeTransaction(transaction.category), expense: !isIncomeTransaction(transaction.category) }">
            {{ isIncomeTransaction(transaction.category) ? '+' : '-' }}Rp
            {{ formatRupiah(transaction.amount) }}
          </h4>
        </div>

        <div v-if="recentTransactions.length === 0">
          <small>Belum ada transaksi terakhir</small>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-page {
  display: flex;
  background: #f5f6fa;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

.main-wrapper {
  flex: 1;
  padding: 28px;
  margin-left: 300px;
  padding-top: 200px;
}

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
}

.topbar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.topbar h1 {
  font-size: 38px;
  color: #111827;
  margin-bottom: 0;
}

.topbar p {
  font-size: 20px;
  color: #6b7280;
}

.notif {
  margin-bottom: 30px;
  cursor: pointer;
  margin-right: 70px;
}

.saldo-card {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 24px;
  padding: 28px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 24px;
}

.saldo-card h1 {
  font-size: 42px;
  margin: 10px 0 24px;
}

.saldo-card p {
  margin: 0;
  font-size: 24px;
  opacity: 0.9;
}

.saldo-info {
  display: flex;
  gap: 24px;
}

.saldo-info > div {
  display: flex;
  gap: 10px;
  align-items: center;
}

.saldo-info img {
  width: 48px;
  height: 48px;
}

.saldo-info small {
  font-size: 24px;
}

.saldo-info h4 {
  font-size: 18px;
}

.eye-icon {
  width: 48px;
  height: 48px;
  cursor: pointer;
  color: white;
}

.quick-actions {
  display: flex;
  gap: 14px;
  margin-bottom: 24px;
}

.action-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  width: 90px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
}

.action-card img {
  width: 58px;
  height: 58px;
}

.action-card span {
  font-size: 22px;
}

.action-card p {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 600;
}

.grid-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 24px;
}

.small-card,
.invest-card,
.transaction-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  font-size: 20px;
}

.small-card small {
  margin: 0;
  color: #6b7280;
  font-size: 18px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  font-size: 18px;
}

.badge {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 16px;
}

.green {
  background: #dcfce7;
  color: #16a34a;
}

.purple {
  background: #ede9fe;
  color: #7c3aed;
}

.orange {
  background: #ffedd5;
  color: #ea580c;
}

.progress {
  width: 100%;
  height: 10px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-fill {
  height: 100%;
  background: #8b5cf6;
  transition: width 0.3s ease;
}

.green-fill {
  background: #10b981;
}

.purple-fill {
  background: #8b5cf6;
}

.goal-progress-item {
  margin-bottom: 14px;
}

.target-item,
.expense-item,
.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.left-expense {
  display: flex;
  align-items: center;
  gap: 14px;
}

.icon-box img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.invest-card {
  margin-bottom: 24px;
}

.profit {
  text-align: right;
  color: #10b981;
}

.profit small {
  font-size: 18px;
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: 8px;
  margin-top: 20px;
}

.bar {
  flex: 1;
  height: 70px;
  background: #bbf7d0;
  border-radius: 8px 8px 0 0;
}

.transaction-item {
  padding: 14px 0;
  border-bottom: 1px solid #f3f4f6;
}

.left-transaction {
  display: flex;
  align-items: center;
  gap: 14px;
}

.icon-box {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #f3f4f6;
  display: flex;
  justify-content: center;
  align-items: center;
}

.income {
  color: #10b981;
}

.expense {
  color: #ef4444;
}

.lihat {
  color: #8b5cf6;
  cursor: pointer;
}

@media (max-width: 1200px) {
  .grid-cards {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    flex-wrap: wrap;
  }
}
</style>