<script setup>
import { ref, computed, onMounted } from 'vue'
import UserSideBar from '@/components/UserSideBar.vue'
import { Bell } from 'lucide-vue-next'

/* =========================
  API CONFIG
========================= */
const API_BASE_URL = 'http://localhost:8000'

/* =========================
  MODAL STATE
========================= */
const showModal = ref(false)

/* =========================
  LOADING / MESSAGE
========================= */
const loadingBills = ref(false)
const savingBill = ref(false)

const listError = ref('')
const createError = ref('')
const createSuccess = ref('')

/* =========================
  FORM ADD BILL
========================= */
const name = ref('')
const description = ref('')
const amount = ref('')
const currency = ref('IDR')
const category = ref('Utilities')
const payTo = ref('')
const billingCycle = ref('monthly')
const dayOfMonth = ref(1)
const remindDaysBefore = ref(3)
const icon = ref('wifi')
const color = ref('#FF0000')

/* =========================
  FILTER
========================= */
const filterAktif = ref('semua')

/* =========================
  BILL LIST FROM API
========================= */
const billList = ref([])

/* =========================
  OPTIONS
========================= */
const categories = [
  'Utilities',
  'Internet',
  'Electricity',
  'Water',
  'Streaming',
  'Phone',
  'Rent',
  'Insurance',
  'Education',
  'Other'
]

const billingCycles = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Yearly', value: 'yearly' }
]

const iconOptions = [
  { label: 'WiFi', value: 'wifi', emoji: '📡' },
  { label: 'Listrik', value: 'electricity', emoji: '💡' },
  { label: 'Air', value: 'water', emoji: '💧' },
  { label: 'TV', value: 'tv', emoji: '📺' },
  { label: 'Musik', value: 'music', emoji: '🎵' },
  { label: 'Rumah', value: 'home', emoji: '🏠' },
  { label: 'Mobil', value: 'car', emoji: '🚗' },
  { label: 'Tagihan', value: 'bill', emoji: '🧾' }
]

/* =========================
  COMPUTED
========================= */
const dueThisWeek = computed(() => {
  return billList.value.filter((item) => {
    if (item.is_paid) return false

    const days = getRemainingDays(item.next_due_date)
    return days >= 0 && days <= 7
  }).length
})

const filteredBills = computed(() => {
  if (filterAktif.value === 'semua') {
    return billList.value
  }

  if (filterAktif.value === 'belum') {
    return billList.value.filter((item) => !item.is_paid && !isOverdue(item))
  }

  if (filterAktif.value === 'sudah') {
    return billList.value.filter((item) => item.is_paid)
  }

  return billList.value.filter((item) => !item.is_paid && isOverdue(item))
})

/* =========================
  FORMAT RUPIAH
========================= */
const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID').format(Number(value || 0))
}

const formatInputRupiah = (value) => {
  const number = String(value || '').replace(/\D/g, '')
  return new Intl.NumberFormat('id-ID').format(Number(number || 0))
}

const cleanRupiah = (value) => {
  return Number(String(value || '').replace(/\D/g, '')) || 0
}

/* =========================
  FORMAT DATE
========================= */
const formatDate = (value) => {
  if (!value || value === '0001-01-01T00:00:00Z') {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

/* =========================
  HELPER
========================= */
const getIconEmoji = (iconName) => {
  const found = iconOptions.find((item) => item.value === iconName)
  return found ? found.emoji : '🧾'
}

const getBillingCycleLabel = (value) => {
  if (value === 'monthly') return 'Bulanan'
  if (value === 'weekly') return 'Mingguan'
  if (value === 'yearly') return 'Tahunan'
  return value || '-'
}

const getRemainingDays = (dateValue) => {
  if (!dateValue) return 0

  const today = new Date()
  const target = new Date(dateValue)

  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)

  const diffTime = target - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const isOverdue = (item) => {
  if (item.is_paid) return false
  return getRemainingDays(item.next_due_date) < 0
}

const getBillStatus = (item) => {
  if (item.is_paid) return 'sudah'
  if (isOverdue(item)) return 'terlambat'
  return 'belum'
}

const getBillInfo = (item) => {
  if (item.is_paid) {
    return 'Sudah dibayar'
  }

  const days = getRemainingDays(item.next_due_date)

  if (days < 0) {
    return `Terlambat ${Math.abs(days)} hari!`
  }

  if (days === 0) {
    return 'Jatuh tempo hari ini!'
  }

  return `${days} hari lagi`
}

const isUrgent = (item) => {
  if (item.is_paid) return false

  const days = getRemainingDays(item.next_due_date)
  return days <= Number(item.remind_days_before || 0)
}

/* =========================
  FETCH LIST BILL
  GET /bill/
========================= */
const fetchBills = async () => {
  loadingBills.value = true
  listError.value = ''

  try {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE_URL}/bill/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && {
          Authorization: `Bearer ${token}`
        })
      }
    })

    const data = await response.json()

    console.log('Bill list:', data)

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Gagal mengambil list bill')
    }

    billList.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Fetch bill error:', error)
    listError.value = error.message || 'Terjadi kesalahan saat mengambil bill'
    billList.value = []
  } finally {
    loadingBills.value = false
  }
}

/* =========================
  CREATE BILL
  POST /bill/
========================= */
const createBill = async () => {
  createError.value = ''
  createSuccess.value = ''

  if (!name.value.trim()) {
    createError.value = 'Nama tagihan wajib diisi'
    return
  }

  if (!description.value.trim()) {
    createError.value = 'Description wajib diisi'
    return
  }

  if (!amount.value) {
    createError.value = 'Amount wajib diisi'
    return
  }

  if (!category.value.trim()) {
    createError.value = 'Category wajib diisi'
    return
  }

  if (!payTo.value.trim()) {
    createError.value = 'Pay to wajib diisi'
    return
  }

  if (!dayOfMonth.value || Number(dayOfMonth.value) < 1 || Number(dayOfMonth.value) > 31) {
    createError.value = 'Day of month harus antara 1 sampai 31'
    return
  }

  if (Number(remindDaysBefore.value) < 0) {
    createError.value = 'Remind days before tidak valid'
    return
  }

  savingBill.value = true

  try {
    const token = localStorage.getItem('token')

    const payload = {
      name: name.value.trim(),
      description: description.value.trim(),
      amount: cleanRupiah(amount.value),
      currency: currency.value,
      category: category.value.trim(),
      pay_to: payTo.value.trim(),
      billing_cycle: billingCycle.value,
      day_of_month: Number(dayOfMonth.value),
      remind_days_before: Number(remindDaysBefore.value),
      icon: icon.value,
      color: color.value
    }

    console.log('Create bill payload:', payload)

    const response = await fetch(`${API_BASE_URL}/bill/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && {
          Authorization: `Bearer ${token}`
        })
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Gagal menambahkan bill')
    }

    createSuccess.value = 'Bill berhasil ditambahkan'

    await fetchBills()

    setTimeout(() => {
      resetModal()
    }, 700)
  } catch (error) {
    console.error('Create bill error:', error)
    createError.value = error.message || 'Terjadi kesalahan saat menambahkan bill'
  } finally {
    savingBill.value = false
  }
}

/* =========================
  RESET MODAL
========================= */
const resetModal = () => {
  showModal.value = false

  name.value = ''
  description.value = ''
  amount.value = ''
  currency.value = 'IDR'
  category.value = 'Utilities'
  payTo.value = ''
  billingCycle.value = 'monthly'
  dayOfMonth.value = 1
  remindDaysBefore.value = 3
  icon.value = 'wifi'
  color.value = '#FF0000'

  createError.value = ''
  createSuccess.value = ''
}

/* =========================
  LIFECYCLE
========================= */
onMounted(() => {
  fetchBills()
})
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
          <h1>Tagihan</h1>

          <button class="add-btn" @click="showModal = true">
            ＋ Tambah
          </button>
        </div>
      </div>

      <!-- CONTENT SCROLL -->
      <main class="content-scroll">
        <!-- ALERT -->
        <section class="alert-box">
          <Bell :size="22" />

          <p v-if="loadingBills">
            Mengambil data tagihan...
          </p>

          <p v-else>
            {{ dueThisWeek }} tagihan jatuh tempo minggu ini!
          </p>
        </section>

        <p v-if="listError" class="error-text">
          {{ listError }}
        </p>

        <!-- FILTER -->
        <div class="filter-row">
          <button
            class="filter-btn"
            :class="{ active: filterAktif === 'semua' }"
            @click="filterAktif = 'semua'"
          >
            Semua
          </button>

          <button
            class="filter-btn"
            :class="{ active: filterAktif === 'belum' }"
            @click="filterAktif = 'belum'"
          >
            Belum Bayar
          </button>

          <button
            class="filter-btn"
            :class="{ active: filterAktif === 'sudah' }"
            @click="filterAktif = 'sudah'"
          >
            Sudah Bayar
          </button>

          <button
            class="filter-btn"
            :class="{ active: filterAktif === 'terlambat' }"
            @click="filterAktif = 'terlambat'"
          >
            Terlambat
          </button>
        </div>

        <!-- LIST -->
        <section class="bill-list">
          <div v-if="loadingBills" class="empty-card">
            Mengambil data bill...
          </div>

          <div v-else-if="filteredBills.length === 0" class="empty-card">
            Belum ada data bill
          </div>

          <div
            v-for="item in filteredBills"
            v-else
            :key="item.id"
            class="bill-card"
            :class="{
              urgent: isUrgent(item),
              paid: getBillStatus(item) === 'sudah'
            }"
          >
            <!-- LEFT -->
            <div class="bill-left">
              <div
                class="bill-icon"
                :style="{
                  background: item.color ? item.color + '22' : '#eef2ff',
                  color: item.color || '#4f46e5'
                }"
              >
                {{ getIconEmoji(item.icon) }}
              </div>

              <div>
                <h3>{{ item.name }}</h3>

                <p class="desc-text">
                  {{ item.description || '-' }}
                </p>

                <div class="badge-row">
                  <span
                    class="badge"
                    :class="{
                      'badge-warning': getBillStatus(item) === 'belum',
                      'badge-paid': getBillStatus(item) === 'sudah',
                      'badge-late': getBillStatus(item) === 'terlambat'
                    }"
                  >
                    <template v-if="getBillStatus(item) === 'belum'">
                      BELUM BAYAR
                    </template>

                    <template v-else-if="getBillStatus(item) === 'sudah'">
                      ✅ SUDAH BAYAR
                    </template>

                    <template v-else>
                      🔴 TERLAMBAT
                    </template>
                  </span>

                  <span
                    class="bill-info"
                    :class="{ danger: isUrgent(item) }"
                  >
                    {{ getBillInfo(item) }}
                  </span>

                  <span class="bill-info">
                    {{ getBillingCycleLabel(item.billing_cycle) }}
                  </span>
                </div>

                <p class="meta-text">
                  Kategori: {{ item.category || '-' }} • Bayar ke: {{ item.pay_to || '-' }}
                </p>
              </div>
            </div>

            <!-- RIGHT -->
            <div class="bill-right">
              <h4>
                {{ item.currency || 'IDR' }} {{ formatRupiah(item.amount) }}
              </h4>

              <p>
                Jatuh tempo: {{ formatDate(item.next_due_date) }}
              </p>

              <p>
                Reminder: {{ item.remind_days_before || 0 }} hari sebelumnya
              </p>

              <button
                v-if="!item.is_paid"
                class="pay-btn"
              >
                Tandai Bayar
              </button>
            </div>
          </div>
        </section>
      </main>

      <!-- MODAL ADD BILL -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-card">
          <!-- HEADER -->
          <div class="modal-header">
            <h3>Tambah Tagihan</h3>

            <button class="close-btn" @click="resetModal">
              ✕
            </button>
          </div>

          <!-- NAME -->
          <div class="modal-section">
            <h4>Nama Tagihan</h4>

            <input
              v-model="name"
              type="text"
              class="input-field"
              placeholder="Contoh: IndiHome Internet"
            />
          </div>

          <!-- DESCRIPTION -->
          <div class="modal-section">
            <h4>Description</h4>

            <textarea
              v-model="description"
              class="textarea-field"
              placeholder="Contoh: Tagihan internet rumah"
            ></textarea>
          </div>

          <!-- AMOUNT -->
          <div class="modal-section">
            <h4>Amount</h4>

            <div class="currency-input">
              <span>Rp</span>

              <input
                v-model="amount"
                type="text"
                inputmode="numeric"
                placeholder="0"
                @input="amount = formatInputRupiah(amount)"
              />
            </div>
          </div>

          <!-- CURRENCY -->
          <div class="modal-section">
            <h4>Currency</h4>

            <select v-model="currency" class="input-field">
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <!-- CATEGORY -->
          <div class="modal-section">
            <h4>Category</h4>

            <div class="category-grid">
              <button
                v-for="item in categories"
                :key="item"
                class="category-btn"
                :class="{ active: category === item }"
                @click="category = item"
              >
                {{ item }}
              </button>
            </div>
          </div>

          <!-- PAY TO -->
          <div class="modal-section">
            <h4>Bayar ke</h4>

            <input
              v-model="payTo"
              type="text"
              class="input-field"
              placeholder="Contoh: Telkom Indonesia"
            />
          </div>

          <!-- BILLING CYCLE -->
          <div class="modal-section">
            <h4>Billing Cycle</h4>

            <div class="cycle-grid">
              <button
                v-for="item in billingCycles"
                :key="item.value"
                class="cycle-btn"
                :class="{ active: billingCycle === item.value }"
                @click="billingCycle = item.value"
              >
                {{ item.label }}
              </button>
            </div>
          </div>

          <!-- DAY OF MONTH -->
          <div class="modal-section">
            <h4>Tanggal jatuh tempo</h4>

            <input
              v-model="dayOfMonth"
              type="number"
              min="1"
              max="31"
              class="input-field"
              placeholder="Contoh: 1"
            />
          </div>

          <!-- REMIND DAYS BEFORE -->
          <div class="modal-section">
            <h4>Ingkatkan berapa hari sebelum</h4>

            <input
              v-model="remindDaysBefore"
              type="number"
              min="0"
              class="input-field"
              placeholder="Contoh: 3"
            />
          </div>

          <p v-if="createError" class="error-text">
            {{ createError }}
          </p>

          <p v-if="createSuccess" class="success-text">
            {{ createSuccess }}
          </p>

          <!-- BUTTON -->
          <button
            class="save-btn"
            :disabled="savingBill"
            @click="createBill"
          >
            {{ savingBill ? 'Menyimpan...' : 'Simpan Tagihan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  height: 105vh;
  background: #f5f6fa;
  font-family: 'Inter', sans-serif;
}

/* MAIN */
.main-wrapper {
  flex: 1;
  margin-left: 300px;
  padding-top: 180px;
}

/* TOPBAR */
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

.add-btn {
  width: 300px;
  height: 50px;
  background: #4f46e5;
  color: white;
  border: none;
  padding: 12px 18px;
  margin: 0 70px 0 0;
  border-radius: 14px;
  cursor: pointer;
  font-size: 20px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
}

.add-btn:hover {
  opacity: 0.9;
}

/* CONTENT */
.content-scroll {
  padding: 30px;
}

/* ALERT */
.alert-box {
  background: #ffedd5;
  color: #ea580c;
  border-radius: 24px;
  padding: 26px 28px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.alert-box span {
  font-size: 24px;
}

.alert-box p {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

/* FILTER */
.filter-row {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.filter-btn {
  border: none;
  padding: 10px 16px;
  border-radius: 999px;
  background: #eef2ff;
  color: #64748b;
  font-weight: 700;
  cursor: pointer;
  font-size: 16px;
}

.filter-btn.active {
  color: #4f46e5;
  background: #e0e7ff;
}

/* LIST */
.bill-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-card {
  background: white;
  border-radius: 22px;
  padding: 28px;
  text-align: center;
  color: #64748b;
  font-size: 20px;
  font-weight: 600;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.bill-card {
  background: white;
  border-radius: 22px;
  padding: 28px 24px;
  min-height: 105px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.bill-card.urgent {
  border: 2px solid #ef4444;
}

.bill-card.paid {
  opacity: 0.9;
}

.bill-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.bill-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #eef2ff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
}

.bill-left h3 {
  margin: 0 0 6px;
  color: #1e293b;
  font-size: 21px;
  font-weight: 700;
}

.desc-text {
  margin: 0 0 10px;
  color: #64748b;
  font-size: 15px;
}

.badge-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.badge {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.badge-warning {
  background: #fef3c7;
  color: #f59e0b;
}

.badge-paid {
  background: #dcfce7;
  color: #10b981;
}

.badge-late {
  background: #fee2e2;
  color: #ef4444;
}

.bill-info {
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
}

.bill-info.danger {
  color: #ef4444;
}

.meta-text {
  margin: 10px 0 0;
  color: #64748b;
  font-size: 14px;
}

.bill-right {
  text-align: right;
  min-width: 230px;
}

.bill-right h4 {
  margin: 0 0 6px;
  color: #1e293b;
  font-size: 20px;
  font-weight: 700;
}

.bill-right p {
  margin: 0 0 10px;
  color: #64748b;
  font-size: 14px;
}

.pay-btn {
  width: 140px;
  height: 42px;
  border: none;
  border-radius: 10px;
  background: #4f46e5;
  color: white;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
}

.pay-btn:hover {
  opacity: 0.9;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  font-family: 'Inter', sans-serif;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
}

.modal-card {
  width: 620px;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 18px;
  padding: 24px 28px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
}

.modal-card::-webkit-scrollbar {
  width: 6px;
}

.modal-card::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

/* MODAL HEADER */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 28px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 24px;
  font-weight: 700;
}

.close-btn {
  border: none;
  background: transparent;
  color: #334155;
  font-size: 22px;
  cursor: pointer;
}

/* FORM */
.modal-section {
  margin-bottom: 24px;
}

.modal-section h4 {
  margin: 0 0 10px;
  color: #1e293b;
  font-size: 17px;
  font-weight: 700;
}

.input-field {
  width: 100%;
  height: 56px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
}

.input-field:focus,
.currency-input:focus-within,
.textarea-field:focus {
  border-color: #4f46e5;
}

/* CATEGORY */
.category-grid,
.cycle-grid,
.icon-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.category-btn,
.cycle-btn,
.icon-btn {
  min-height: 50px;
  border: none;
  border-radius: 12px;
  background: #f1f5f9;
  color: #1e293b;
  text-align: left;
  padding: 0 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.icon-btn span {
  margin-right: 8px;
}

.category-btn:hover,
.cycle-btn:hover,
.icon-btn:hover {
  background: #e0e7ff;
  color: #4f46e5;
}

.category-btn.active,
.cycle-btn.active,
.icon-btn.active {
  background: #4f46e5;
  color: white;
}

/* CURRENCY INPUT */
.currency-input {
  width: 100%;
  height: 56px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
}

.currency-input span {
  color: #64748b;
  font-weight: 700;
  margin-right: 10px;
}

.currency-input input {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
}

/* TEXTAREA */
.textarea-field {
  width: 100%;
  min-height: 100px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 16px;
  outline: none;
  resize: none;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

.color-input {
  width: 100%;
  height: 56px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 8px;
  background: white;
  cursor: pointer;
}

/* SAVE */
.save-btn {
  width: 100%;
  height: 56px;
  border: none;
  border-radius: 14px;
  background: #4f46e5;
  color: white;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
}

.save-btn:hover {
  opacity: 0.9;
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* MESSAGE */
.error-text {
  color: #ef4444;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}

.success-text {
  color: #10b981;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .main-wrapper {
    margin-left: 0;
    padding-top: 150px;
  }

  .topbar {
    left: 0;
    width: 100%;
  }

  .top-header {
    padding-bottom: 40px;
  }

  .add-btn {
    width: 180px;
    margin-right: 0;
  }

  .bill-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
  }

  .bill-right {
    width: 100%;
    text-align: left;
  }

  .category-grid,
  .cycle-grid,
  .icon-grid {
    grid-template-columns: 1fr;
  }

  .modal-card {
    width: 92%;
  }
}
</style>