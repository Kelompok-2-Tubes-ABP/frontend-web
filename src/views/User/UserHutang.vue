<script setup>
import { ref, computed, onMounted } from 'vue'
import UserSideBar from '@/components/UserSideBar.vue'

/* =========================
   API CONFIG
========================= */
const API_BASE_URL = 'http://localhost:8000'

/* =========================
   MODAL STATE
========================= */
const showModal = ref(false)
const showConfirmAlert = ref(false)

/* =========================
   LOADING & ERROR
========================= */
const loadingSummary = ref(false)
const loadingDebts = ref(false)
const loadingCreate = ref(false)
const loadingPayId = ref(null)
const loadingDeleteId = ref(null)

const summaryError = ref('')
const debtsError = ref('')
const createError = ref('')
const createSuccess = ref('')
const actionError = ref('')
const actionSuccess = ref('')

/* =========================
   CUSTOM CONFIRM ALERT
========================= */
const confirmAlert = ref({
  type: 'pay',
  title: '',
  message: '',
  confirmText: '',
  cancelText: 'Batal',
  item: null
})

/* =========================
   DEBT SUMMARY
========================= */
const debtSummary = ref({
  by_type: {
    loan: 0,
    personal: 0
  },
  total_debt: 0,
  total_debts: 0,
  total_monthly_payment: 0
})

/* =========================
   DEBT LIST
========================= */
const debtList = ref([])

/* =========================
   FORM CREATE DEBT
========================= */
const debtName = ref('')
const creditor = ref('')
const debtType = ref('loan')
const paymentAmount = ref('')
const tenorMonths = ref('')
const paymentFrequency = ref('monthly')
const interestRate = ref('')
const notes = ref('')

/* =========================
   FILTER
========================= */
const filterAktif = ref('semua')

/* =========================
   FILTERED LIST
========================= */
const filteredList = computed(() => {
  if (filterAktif.value === 'semua') {
    return debtList.value
  }

  return debtList.value.filter((item) => item.type === filterAktif.value)
})

/* =========================
   TOTAL PAYMENT + INTEREST
========================= */
const totalPaymentWithInterest = computed(() => {
  return debtList.value
    .filter((item) => item.is_active && !item.is_paid_off)
    .reduce((total, item) => total + getPaymentWithInterest(item), 0)
})

/* =========================
   FORMAT RUPIAH
========================= */
const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID').format(Number(value || 0))
}

const formatInputRupiah = (value) => {
  const number = String(value || '').replace(/\D/g, '')
  return new Intl.NumberFormat('id-ID').format(number)
}

/* =========================
   CONVERT RUPIAH INPUT
========================= */
const toRupiahNumber = (value) => {
  return Number(String(value || '').replace(/\./g, '').replace(/,/g, '')) || 0
}

/* =========================
   CONVERT DECIMAL INPUT
========================= */
const toDecimalNumber = (value) => {
  return Number(String(value || '').replace(',', '.')) || 0
}

/* =========================
   FORMAT DATE
========================= */
const formatDate = (value) => {
  if (!value || value === '0001-01-01T00:00:00Z') {
    return '-'
  }

  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

/* =========================
   DATE HELPERS
========================= */
const getValidStartDate = (item) => {
  if (item.start_date && item.start_date !== '0001-01-01T00:00:00Z') {
    return new Date(item.start_date)
  }

  if (item.created_at && item.created_at !== '0001-01-01T00:00:00Z') {
    return new Date(item.created_at)
  }

  return new Date()
}

const addFrequencyToDate = (dateValue, frequency, count) => {
  const date = new Date(dateValue)
  const amount = Number(count || 0)

  if (frequency === 'weekly') {
    date.setDate(date.getDate() + amount * 7)
  } else if (frequency === 'yearly') {
    date.setFullYear(date.getFullYear() + amount)
  } else {
    date.setMonth(date.getMonth() + amount)
  }

  return date
}

const getComputedEndDate = (item) => {
  const startDate = getValidStartDate(item)
  const tenor = getTenorCount(item)

  return addFrequencyToDate(startDate, item.payment_frequency, tenor)
}

const getComputedNextPaymentDate = (item) => {
  if (item.is_paid_off) {
    return null
  }

  const startDate = getValidStartDate(item)
  const paidInstallments = getPaidInstallments(item)
  const nextInstallmentNumber = paidInstallments + 1

  return addFrequencyToDate(startDate, item.payment_frequency, nextInstallmentNumber)
}

/* =========================
   FREQUENCY LABEL
========================= */
const getFrequencyLabel = (frequency) => {
  if (frequency === 'monthly') return 'Bulanan'
  if (frequency === 'weekly') return 'Mingguan'
  if (frequency === 'yearly') return 'Tahunan'

  return '-'
}

const getTenorUnitLabel = (frequency) => {
  if (frequency === 'monthly') return 'bulan'
  if (frequency === 'weekly') return 'minggu'
  if (frequency === 'yearly') return 'tahun'

  return 'periode'
}

const getNextPaymentLabel = (frequency) => {
  if (frequency === 'monthly') return 'Pembayaran bulan berikutnya'
  if (frequency === 'weekly') return 'Pembayaran minggu berikutnya'
  if (frequency === 'yearly') return 'Pembayaran tahun berikutnya'

  return 'Pembayaran berikutnya'
}

/* =========================
   PAYMENT WITH INTEREST
========================= */
const getPaymentWithInterest = (item) => {
  const payment = Number(item.payment_amount || 0)
  const interest = Number(item.interest_rate || 0)

  return Math.round(payment + (payment * interest / 100))
}

/* =========================
   TENOR & PAYMENT COUNT
========================= */
const getTenorCount = (item) => {
  return Number(item.tenor_months || item.remaining_payments || 0)
}

const getPaidInstallments = (item) => {
  const paymentWithInterest = getPaymentWithInterest(item)
  const totalPaid = Number(item.total_paid || 0)

  if (paymentWithInterest <= 0) {
    return 0
  }

  return Math.floor(totalPaid / paymentWithInterest)
}

const getRemainingPayments = (item) => {
  if (item.is_paid_off) {
    return 0
  }

  const tenor = getTenorCount(item)
  const paidInstallments = getPaidInstallments(item)

  return Math.max(tenor - paidInstallments, 0)
}

const getTotalEstimatedPayment = (item) => {
  const paymentWithInterest = getPaymentWithInterest(item)
  const tenor = getTenorCount(item)

  return paymentWithInterest * tenor
}

/* =========================
   CALCULATE PROGRESS
========================= */
const getProgress = (item) => {
  const tenor = getTenorCount(item)
  const paidInstallments = getPaidInstallments(item)

  if (tenor <= 0) {
    return 0
  }

  return Math.min(Math.round((paidInstallments / tenor) * 100), 100)
}

/* =========================
   GET REMAINING DAYS
========================= */
const getRemainingDays = (dateValue) => {
  if (!dateValue) return 0

  const today = new Date()
  const target = new Date(dateValue)

  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)

  const diffTime = target - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays > 0 ? diffDays : 0
}

/* =========================
   FETCH DEBT SUMMARY
========================= */
const fetchDebtSummary = async () => {
  loadingSummary.value = true
  summaryError.value = ''

  try {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE_URL}/debt/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && {
          Authorization: `Bearer ${token}`
        })
      }
    })

    const data = await response.json()

    console.log('Debt summary:', data)

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Gagal mengambil summary hutang')
    }

    debtSummary.value = {
      by_type: {
        loan: data.by_type?.loan || 0,
        personal: data.by_type?.personal || 0
      },
      total_debt: data.total_debt || 0,
      total_debts: data.total_debts || 0,
      total_monthly_payment: data.total_monthly_payment || 0
    }
  } catch (error) {
    console.error('Fetch debt summary error:', error)
    summaryError.value = error.message
  } finally {
    loadingSummary.value = false
  }
}

/* =========================
   FETCH DEBT LIST
========================= */
const fetchDebts = async () => {
  loadingDebts.value = true
  debtsError.value = ''

  try {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE_URL}/debt/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && {
          Authorization: `Bearer ${token}`
        })
      }
    })

    const data = await response.json()

    console.log('Debt list:', data)

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Gagal mengambil list debt')
    }

    debtList.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Fetch debts error:', error)
    debtsError.value = error.message
  } finally {
    loadingDebts.value = false
  }
}

/* =========================
   CREATE DEBT
========================= */
const createDebt = async () => {
  createError.value = ''
  createSuccess.value = ''

  if (!debtName.value.trim()) {
    createError.value = 'Nama debt wajib diisi'
    return
  }

  if (!creditor.value.trim()) {
    createError.value = 'Creditor wajib diisi'
    return
  }

  if (!paymentAmount.value) {
    createError.value = 'Payment amount wajib diisi'
    return
  }

  if (!tenorMonths.value) {
    createError.value = 'Tenor wajib diisi'
    return
  }

  loadingCreate.value = true

  try {
    const token = localStorage.getItem('token')

    const payload = {
      name: debtName.value.trim(),
      creditor: creditor.value.trim(),
      type: debtType.value,
      payment_amount: toRupiahNumber(paymentAmount.value),
      tenor_months: Number(tenorMonths.value) || 0,
      payment_frequency: paymentFrequency.value,
      interest_rate: toDecimalNumber(interestRate.value),
      notes: notes.value.trim()
    }

    console.log('Create debt payload:', payload)

    const response = await fetch(`${API_BASE_URL}/debt/`, {
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
      throw new Error(data.message || data.error || 'Gagal menambahkan hutang')
    }

    createSuccess.value = 'Hutang berhasil ditambahkan'

    resetModal()

    await Promise.all([
      fetchDebtSummary(),
      fetchDebts()
    ])
  } catch (error) {
    console.error('Create debt error:', error)
    createError.value = error.message
  } finally {
    loadingCreate.value = false
  }
}

/* =========================
   OPEN PAY CONFIRM
========================= */
const openPayConfirm = (item) => {
  actionError.value = ''
  actionSuccess.value = ''

  confirmAlert.value = {
    type: 'pay',
    title: 'Konfirmasi Pembayaran',
    message: `Bayar cicilan ${item.name} sebesar Rp ${formatRupiah(getPaymentWithInterest(item))}? Nominal ini sudah termasuk bunga ${item.interest_rate || 0}%.`,
    confirmText: 'Ya, Bayar',
    cancelText: 'Batal',
    item
  }

  showConfirmAlert.value = true
}

/* =========================
   OPEN DELETE CONFIRM
========================= */
const openDeleteConfirm = (item) => {
  actionError.value = ''
  actionSuccess.value = ''

  confirmAlert.value = {
    type: 'delete',
    title: 'Hapus Debt?',
    message: `Debt "${item.name}" akan dihapus permanen. Data yang sudah dihapus tidak bisa dikembalikan.`,
    confirmText: 'Hapus',
    cancelText: 'Batal',
    item
  }

  showConfirmAlert.value = true
}

/* =========================
   CLOSE CONFIRM
========================= */
const closeConfirmAlert = () => {
  showConfirmAlert.value = false

  confirmAlert.value = {
    type: 'pay',
    title: '',
    message: '',
    confirmText: '',
    cancelText: 'Batal',
    item: null
  }
}

/* =========================
   CONFIRM ACTION
========================= */
const confirmAction = async () => {
  const item = confirmAlert.value.item

  if (confirmAlert.value.type === 'pay') {
    closeConfirmAlert()
    await payDebt(item)
    return
  }

  if (confirmAlert.value.type === 'delete') {
    closeConfirmAlert()
    await deleteDebt(item)
  }
}

/* =========================
   PAY DEBT
========================= */
const payDebt = async (item) => {
  actionError.value = ''
  actionSuccess.value = ''

  if (!item?.id) {
    actionError.value = 'ID debt tidak ditemukan'
    return
  }

  const amount = getPaymentWithInterest(item)

  if (amount <= 0) {
    actionError.value = 'Nominal pembayaran tidak valid'
    return
  }

  loadingPayId.value = item.id

  try {
    const token = localStorage.getItem('token')

    const payload = {
      amount
    }

    console.log('Pay debt payload:', payload)

    const response = await fetch(`${API_BASE_URL}/debt/${item.id}/pay`, {
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
      throw new Error(data.message || data.error || 'Gagal melakukan pembayaran debt')
    }

    actionSuccess.value = `Pembayaran ${item.name} berhasil. Sisa bayar akan diperbarui.`

    await Promise.all([
      fetchDebtSummary(),
      fetchDebts()
    ])
  } catch (error) {
    console.error('Pay debt error:', error)
    actionError.value = error.message
  } finally {
    loadingPayId.value = null
  }
}

/* =========================
   DELETE DEBT
========================= */
const deleteDebt = async (item) => {
  actionError.value = ''
  actionSuccess.value = ''

  if (!item?.id) {
    actionError.value = 'ID debt tidak ditemukan'
    return
  }

  loadingDeleteId.value = item.id

  try {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE_URL}/debt/${item.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && {
          Authorization: `Bearer ${token}`
        })
      }
    })

    let data = null
    const text = await response.text()

    if (text) {
      data = JSON.parse(text)
    }

    if (!response.ok) {
      throw new Error(data?.message || data?.error || 'Gagal menghapus debt')
    }

    actionSuccess.value = `${item.name} berhasil dihapus`

    await Promise.all([
      fetchDebtSummary(),
      fetchDebts()
    ])
  } catch (error) {
    console.error('Delete debt error:', error)
    actionError.value = error.message
  } finally {
    loadingDeleteId.value = null
  }
}

/* =========================
   RESET FORM
========================= */
const resetModal = () => {
  showModal.value = false

  debtName.value = ''
  creditor.value = ''
  debtType.value = 'loan'
  paymentAmount.value = ''
  tenorMonths.value = ''
  paymentFrequency.value = 'monthly'
  interestRate.value = ''
  notes.value = ''
  createError.value = ''
  createSuccess.value = ''
}

/* =========================
   LIFECYCLE
========================= */
onMounted(() => {
  fetchDebtSummary()
  fetchDebts()
})
</script>

<template>
  <div class="dashboard-layout">
    <UserSideBar />

    <div class="main-wrapper">
      <div class="topbar">
        <div class="top-header">
          <h1>Hutang</h1>

          <button class="add-btn" @click="showModal = true">
            ＋ Tambah
          </button>
        </div>
      </div>

      <main class="content-scroll">
        <section class="summary-grid">
          <div class="summary-card">
            <p>Total Hutang Loan</p>

            <div v-if="loadingSummary" class="loading-text">
              Loading...
            </div>

            <h2 v-else class="red-text">
              Rp {{ formatRupiah(debtSummary.by_type.loan) }}
            </h2>
          </div>

          <div class="summary-card">
            <p>Total Hutang Personal</p>

            <div v-if="loadingSummary" class="loading-text">
              Loading...
            </div>

            <h2 v-else class="red-text">
              Rp {{ formatRupiah(debtSummary.by_type.personal) }}
            </h2>
          </div>

          <div class="summary-card">
            <p>Total Hutang</p>

            <div v-if="loadingSummary" class="loading-text">
              Loading...
            </div>

            <h2 v-else class="red-text">
              Rp {{ formatRupiah(debtSummary.total_debt) }}
            </h2>
          </div>

          <div class="summary-card">
            <p>Total Cicilan + Bunga</p>

            <div v-if="loadingDebts" class="loading-text">
              Loading...
            </div>

            <h2 v-else class="red-text">
              Rp {{ formatRupiah(totalPaymentWithInterest) }}
            </h2>
          </div>
        </section>

        <p v-if="summaryError" class="summary-error">
          {{ summaryError }}
        </p>

        <p v-if="actionError" class="list-error">
          {{ actionError }}
        </p>

        <p v-if="actionSuccess" class="action-success">
          {{ actionSuccess }}
        </p>

        <section class="small-summary-row">
          <div class="small-summary-card">
            <span>Total Data Hutang</span>
            <strong>{{ debtSummary.total_debts }} hutang</strong>
          </div>

          <div class="small-summary-card">
            <span>Status Summary</span>
            <strong>{{ loadingSummary ? 'Memuat...' : 'Terupdate' }}</strong>
          </div>
        </section>

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
            :class="{ active: filterAktif === 'loan' }"
            @click="filterAktif = 'loan'"
          >
            Loan
          </button>

          <button
            class="filter-btn"
            :class="{ active: filterAktif === 'personal' }"
            @click="filterAktif = 'personal'"
          >
            Personal
          </button>
        </div>

        <section class="debt-list">
          <div v-if="loadingDebts" class="list-loading">
            Mengambil data debt...
          </div>

          <div v-else-if="debtsError" class="list-error">
            {{ debtsError }}
          </div>

          <div v-else-if="filteredList.length === 0" class="empty-card">
            Belum ada data debt
          </div>

          <div
            v-for="item in filteredList"
            :key="item.id"
            class="debt-card"
          >
            <div class="debt-top">
              <div class="profile-area">
                <div>
                  <h3>{{ item.name }}</h3>

                  <div class="badge-row">
                    <span
                      class="badge"
                      :class="item.type === 'loan' ? 'badge-red' : 'badge-green'"
                    >
                      {{ item.type === 'loan' ? 'LOAN' : 'PERSONAL' }}
                    </span>

                    <span
                      class="badge badge-blue"
                      v-if="item.is_active && !item.is_paid_off"
                    >
                      AKTIF
                    </span>

                    <span
                      class="badge badge-lunas"
                      v-else
                    >
                      LUNAS
                    </span>
                  </div>

                  <p class="creditor-text">
                    Creditor: {{ item.creditor || '-' }}
                  </p>
                </div>
              </div>

              <div class="amount-area">
                <p>Original: Rp {{ formatRupiah(item.original_amount) }}</p>

                <h4 :class="item.current_balance === 0 ? 'green-text' : 'red-text'">
                  Rp {{ formatRupiah(item.current_balance) }}
                </h4>
              </div>
            </div>

            <div class="progress-info">
              <p>Progress Pembayaran</p>
            </div>

            <p class="percent-text">
              {{ getProgress(item) }}%
            </p>

            <div class="progress-bar">
              <div
                class="progress-fill"
                :class="item.type === 'loan' ? 'fill-red' : 'fill-green'"
                :style="{ width: getProgress(item) + '%' }"
              ></div>
            </div>

            <div class="debt-meta-grid">
              <div class="meta-item">
                <span>Cicilan Pokok</span>
                <strong>Rp {{ formatRupiah(item.payment_amount) }}</strong>
              </div>

              <div class="meta-item">
                <span>Cicilan + Bunga</span>
                <strong>Rp {{ formatRupiah(getPaymentWithInterest(item)) }}</strong>
              </div>

              <div class="meta-item">
                <span>Frequency</span>
                <strong>{{ getFrequencyLabel(item.payment_frequency) }}</strong>
              </div>

              <div class="meta-item">
                <span>Tenor</span>
                <strong>
                  {{ getTenorCount(item) }} {{ getTenorUnitLabel(item.payment_frequency) }}
                </strong>
              </div>

              <div class="meta-item">
                <span>Sisa Bayar</span>
                <strong>{{ getRemainingPayments(item) }}x</strong>
              </div>

              <div class="meta-item">
                <span>Bunga</span>
                <strong>{{ item.interest_rate || 0 }}%</strong>
              </div>

              <div class="meta-item">
                <span>Total Dibayar</span>
                <strong>Rp {{ formatRupiah(item.total_paid) }}</strong>
              </div>

              <div class="meta-item">
                <span>Estimasi Total + Bunga</span>
                <strong>Rp {{ formatRupiah(getTotalEstimatedPayment(item)) }}</strong>
              </div>
            </div>

            <div class="due-row">
              <span>{{ getNextPaymentLabel(item.payment_frequency) }}</span>

              <strong v-if="!item.is_paid_off">
                {{ formatDate(getComputedNextPaymentDate(item)) }}
                ({{ getRemainingDays(getComputedNextPaymentDate(item)) }} hari lagi)
              </strong>

              <strong v-else>
                Lunas
              </strong>
            </div>

            <div class="due-row">
              <span>Mulai - Selesai</span>

              <strong>
                {{ formatDate(getValidStartDate(item)) }} - {{ formatDate(getComputedEndDate(item)) }}
              </strong>
            </div>

            <p v-if="item.notes" class="notes-text">
              {{ item.notes }}
            </p>

            <button
              v-if="!item.is_paid_off"
              class="action-btn pay-btn"
              :disabled="loadingPayId === item.id"
              @click="openPayConfirm(item)"
            >
              {{ loadingPayId === item.id ? 'Membayar...' : `Bayar Rp ${formatRupiah(getPaymentWithInterest(item))}` }}
            </button>

            <button
              class="action-btn delete-btn"
              :disabled="loadingDeleteId === item.id"
              @click="openDeleteConfirm(item)"
            >
              {{ loadingDeleteId === item.id ? 'Menghapus...' : 'Hapus' }}
            </button>
          </div>
        </section>
      </main>

      <button class="floating-btn" @click="showModal = true">
        ＋
      </button>

      <!-- MODAL CREATE DEBT -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Tambah Debt</h3>

            <button class="close-btn" @click="resetModal">
              ✕
            </button>
          </div>

          <div class="type-grid">
            <button
              class="type-btn debt-type"
              :class="{ active: debtType === 'loan' }"
              @click="debtType = 'loan'"
            >
              LOAN
            </button>

            <button
              class="type-btn personal-type"
              :class="{ active: debtType === 'personal' }"
              @click="debtType = 'personal'"
            >
              PERSONAL
            </button>
          </div>

          <div class="modal-section">
            <h4>Nama Debt</h4>

            <input
              v-model="debtName"
              type="text"
              class="input-field"
              placeholder="Contoh: Kredit HP flagship"
            />
          </div>

          <div class="modal-section">
            <h4>Creditor</h4>

            <input
              v-model="creditor"
              type="text"
              class="input-field"
              placeholder="Contoh: Ibox"
            />
          </div>

          <div class="modal-section">
            <h4>Payment Amount</h4>

            <div class="currency-input">
              <span>Rp</span>

              <input
                v-model="paymentAmount"
                type="text"
                inputmode="numeric"
                placeholder="0"
                @input="paymentAmount = formatInputRupiah(paymentAmount)"
              />
            </div>
          </div>

          <div class="modal-section">
            <h4>
              Tenor
              <small>
                (mengikuti frequency)
              </small>
            </h4>

            <input
              v-model="tenorMonths"
              type="number"
              min="1"
              class="input-field"
              :placeholder="
                paymentFrequency === 'weekly'
                  ? 'Contoh: 12 minggu'
                  : paymentFrequency === 'yearly'
                    ? 'Contoh: 2 tahun'
                    : 'Contoh: 12 bulan'
              "
            />
          </div>

          <div class="modal-section">
            <h4>Payment Frequency</h4>

            <select
              v-model="paymentFrequency"
              class="input-field"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div class="modal-section">
            <h4>Bunga</h4>

            <div class="percent-input">
              <input
                v-model="interestRate"
                type="text"
                inputmode="decimal"
                placeholder="Contoh: 1.2"
              />

              <span>%</span>
            </div>
          </div>

          <div class="modal-section">
            <h4>Notes</h4>

            <textarea
              v-model="notes"
              class="textarea-field"
              placeholder="Contoh: Cicilan lewat creditor Ibox"
            ></textarea>
          </div>

          <p v-if="createError" class="create-error">
            {{ createError }}
          </p>

          <p v-if="createSuccess" class="create-success">
            {{ createSuccess }}
          </p>

          <button
            class="save-btn"
            :disabled="loadingCreate"
            @click="createDebt"
          >
            {{ loadingCreate ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>

      <!-- CUSTOM CONFIRM ALERT -->
      <div v-if="showConfirmAlert" class="custom-alert-overlay">
        <div class="custom-alert-card">
          <div
            class="alert-icon"
            :class="confirmAlert.type === 'delete' ? 'alert-danger' : 'alert-primary'"
          >
            {{ confirmAlert.type === 'delete' ? '!' : '✓' }}
          </div>

          <h3>{{ confirmAlert.title }}</h3>

          <p>{{ confirmAlert.message }}</p>

          <div class="alert-action-row">
            <button class="alert-cancel-btn" @click="closeConfirmAlert">
              {{ confirmAlert.cancelText }}
            </button>

            <button
              class="alert-confirm-btn"
              :class="confirmAlert.type === 'delete' ? 'confirm-danger' : 'confirm-primary'"
              @click="confirmAction"
            >
              {{ confirmAlert.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  height: 100vh;
  background: #f5f6fa;
  font-family: 'Inter', sans-serif;
}

.main-wrapper {
  flex: 1;
  margin-left: 300px;
  padding-top: 180px;
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
  padding-top: 30px;
}

.top-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 87px;
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

.content-scroll {
  padding: 30px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 24px;
}

.summary-card {
  background: white;
  padding: 28px;
  border-radius: 22px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.summary-card p {
  margin: 0 0 10px;
  color: #64748b;
  font-size: 20px;
}

.summary-card h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 500;
}

.loading-text,
.list-loading {
  font-size: 18px;
  color: #64748b;
}

.summary-error,
.create-error,
.list-error {
  color: #ef4444;
  background: #fee2e2;
  padding: 12px 16px;
  border-radius: 14px;
  margin: 0 0 20px;
  font-weight: 600;
}

.action-success,
.create-success {
  color: #10b981;
  background: #dcfce7;
  padding: 12px 16px;
  border-radius: 14px;
  margin: 0 0 20px;
  font-weight: 600;
}

.small-summary-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  margin-bottom: 24px;
}

.small-summary-card {
  background: white;
  border-radius: 18px;
  padding: 18px 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #64748b;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  font-size: 18px;
}

.small-summary-card strong {
  color: #1e293b;
}

.red-text {
  color: #ef4444;
}

.green-text {
  color: #10b981;
}

.filter-row {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.filter-btn {
  border: none;
  padding: 8px 14px;
  border-radius: 999px;
  background: #eef2ff;
  color: #64748b;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
}

.filter-btn.active {
  color: #4f46e5;
  background: #e0e7ff;
}

.debt-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-card {
  background: white;
  border-radius: 22px;
  padding: 24px;
  color: #64748b;
  font-size: 18px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.debt-card {
  background: white;
  border-radius: 22px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.debt-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.profile-area {
  display: flex;
  align-items: center;
  gap: 14px;
}

.profile-area h3 {
  margin: 0 0 8px;
  color: #1e293b;
  font-size: 22px;
}

.creditor-text {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 18px;
}

.badge-row {
  display: flex;
  gap: 8px;
}

.badge {
  padding: 10px 12px;
  margin-bottom: 10px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
}

.badge-red {
  background: #fee2e2;
  color: #ef4444;
}

.badge-green {
  background: #dcfce7;
  color: #10b981;
}

.badge-blue {
  background: #eef2ff;
  color: #4f46e5;
}

.badge-lunas {
  background: #dcfce7;
  color: #16a34a;
}

.amount-area {
  text-align: right;
}

.amount-area p {
  margin: 0 0 10px;
  color: #1e293b;
  font-size: 18px;
}

.amount-area h4 {
  margin: 0;
  font-weight: 500;
  font-size: 22px;
}

.progress-info {
  color: #64748b;
  font-size: 18px;
}

.progress-info p {
  margin: 0 0 12px;
}

.percent-text {
  margin: 0 0 6px;
  color: #64748b;
  font-size: 18px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
}

.fill-red {
  background: #ef4444;
}

.fill-green {
  background: #10b981;
}

.debt-meta-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-top: 20px;
}

.meta-item {
  background: #f8fafc;
  border-radius: 14px;
  padding: 14px;
}

.meta-item span {
  display: block;
  color: #64748b;
  font-size: 18px;
  margin-bottom: 6px;
}

.meta-item strong {
  color: #1e293b;
  font-size: 17px;
}

.due-row {
  margin-top: 18px;
  display: flex;
  justify-content: space-between;
  color: #64748b;
  font-size: 18px;
}

.due-row strong {
  color: #1e293b;
  font-weight: 500;
}

.notes-text {
  margin-top: 18px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 14px;
  color: #64748b;
  font-size: 14px;
}

.action-btn {
  width: 100%;
  height: 46px;
  margin-top: 20px;
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.pay-btn {
  background: #4f46e5;
  font-size: 18px;
}

.delete-btn {
  background: #ef4444;
  font-size: 18px;
  margin-top: 12px;
}

.floating-btn {
  position: fixed;
  right: 36px;
  bottom: 36px;
  width: 58px;
  height: 58px;
  border: none;
  border-radius: 50%;
  background: #3730a3;
  color: white;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(55, 48, 163, 0.3);
}

.modal-overlay,
.custom-alert-overlay {
  position: fixed;
  font-family: 'Inter', sans-serif;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-card {
  width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  animation: popup 0.2s ease;
}

.custom-alert-card {
  width: 420px;
  background: white;
  border-radius: 24px;
  padding: 28px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.18);
  animation: popup 0.2s ease;
}

.alert-icon {
  width: 68px;
  height: 68px;
  margin: 0 auto 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 34px;
  font-weight: 800;
}

.alert-primary {
  background: #4f46e5;
}

.alert-danger {
  background: #ef4444;
}

.custom-alert-card h3 {
  margin: 0 0 10px;
  color: #1e293b;
  font-size: 26px;
}

.custom-alert-card p {
  margin: 0;
  color: #64748b;
  font-size: 16px;
  line-height: 1.6;
}

.alert-action-row {
  display: flex;
  gap: 14px;
  margin-top: 26px;
}

.alert-cancel-btn,
.alert-confirm-btn {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 700;
  font-size: 16px;
}

.alert-cancel-btn {
  background: #f1f5f9;
  color: #334155;
}

.confirm-primary {
  background: #4f46e5;
  color: white;
}

.confirm-danger {
  background: #ef4444;
  color: white;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  margin: -24px -24px 23px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  color: #1e293b;
  font-size: 28px;
}

.modal-card::-webkit-scrollbar {
  width: 6px;
}

.modal-card::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

@keyframes popup {
  from {
    transform: scale(0.95);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.close-btn {
  border: none;
  background: transparent;
  color: #334155;
  font-size: 20px;
  cursor: pointer;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.type-btn {
  min-height: 54px;
  border: none;
  border-radius: 12px;
  background: #f1f5f9;
  color: #64748b;
  font-weight: 700;
  font-size: 20px;
  cursor: pointer;
}

.debt-type.active {
  background: #ef4444;
  color: white;
}

.personal-type.active {
  background: #4f46e5;
  color: white;
}

.modal-section {
  margin-bottom: 20px;
}

.modal-section h4 {
  margin: 0 0 8px;
  color: #1e293b;
  font-size: 20px;
}

.modal-section small {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.input-field {
  width: 100%;
  height: 50px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 0 14px;
  font-size: 18px;
  outline: none;
  box-sizing: border-box;
  background: white;
}

.input-field:focus,
.currency-input:focus-within,
.percent-input:focus-within,
.textarea-field:focus {
  border-color: #4f46e5;
}

.currency-input,
.percent-input {
  width: 100%;
  height: 50px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  box-sizing: border-box;
  font-size: 18px;
}

.currency-input span,
.percent-input span {
  color: #64748b;
  font-weight: 600;
}

.currency-input input,
.percent-input input {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  font-size: 18px;
  padding-left: 10px;
  background: transparent;
}

.percent-input input {
  padding-left: 0;
}

.textarea-field {
  width: 100%;
  min-height: 100px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 14px;
  font-size: 18px;
  outline: none;
  resize: none;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

.save-btn {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 14px;
  background: #4f46e5;
  color: white;
  font-weight: 700;
  font-size: 20px;
  cursor: pointer;
}

.save-btn:hover {
  opacity: 0.9;
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .main-wrapper {
    margin-left: 0;
    padding-top: 120px;
  }

  .topbar {
    left: 0;
    width: 100%;
  }

  .add-btn {
    margin-right: 0;
  }

  .summary-grid,
  .small-summary-row,
  .debt-meta-grid {
    grid-template-columns: 1fr;
  }

  .debt-top {
    flex-direction: column;
    gap: 20px;
  }

  .amount-area {
    text-align: left;
  }

  .modal-card,
  .custom-alert-card {
    width: 90%;
  }

  .type-grid,
  .alert-action-row {
    grid-template-columns: 1fr;
    flex-direction: column;
  }
}
</style>