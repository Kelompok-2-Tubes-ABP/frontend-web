<script setup>
import { ref, computed, onMounted } from 'vue'
import UserSideBar from '@/components/UserSideBar.vue'
import { Bell } from 'lucide-vue-next'
import iconBIll from '@/assets/User/icon-bill.svg'

/* =========================
  API CONFIG
========================= */
const API_BASE_URL = 'http://localhost:8000'

/* =========================
  DEFAULT ICON / COLOR
  Tidak ada input dari user.
========================= */
const DEFAULT_BILL_ICON = iconBIll
const DEFAULT_BILL_COLOR = '#4f46e5'
const DEFAULT_BILL_EMOJI = '🧾'

/* =========================
  MODAL STATE
========================= */
const showModal = ref(false)
const modalMode = ref('add') // add | edit
const selectedBillId = ref('')
const selectedBillDetail = ref(null)

/* =========================
  CONFIRM ALERT STATE
========================= */
const showConfirmAlert = ref(false)
const confirmType = ref('') // pay | delete
const selectedActionBill = ref(null)
const processingAction = ref(false)
const actionError = ref('')

/* =========================
  LOADING / MESSAGE
========================= */
const loadingBills = ref(false)
const loadingBillDetail = ref(false)
const savingBill = ref(false)
const deletingBill = ref(false)
const payingBill = ref(false)

const listError = ref('')
const formError = ref('')
const formSuccess = ref('')

/* =========================
  FORM ADD / EDIT BILL
========================= */
const name = ref('')
const description = ref('')
const amount = ref('')
const currency = ref('IDR')
const category = ref('Utilities')
const payTo = ref('')
const billingCycle = ref('monthly')
const dayOfMonth = ref(0)
const remindDaysBefore = ref(0)

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

const isEditMode = computed(() => modalMode.value === 'edit')

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

const formatDateTime = (value) => {
  if (!value || value === '0001-01-01T00:00:00Z') {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/* =========================
  HELPER
========================= */
const getBillId = (item) => {
  return item?.id || item?._id || item?.ID || item?.bill_id || ''
}

const normalizeBillDetail = (data, fallback = null) => {
  const raw =
    data?.bill ||
    data?.data ||
    data?.Message ||
    data?.message?.bill ||
    data ||
    {}

  const fallbackId = getBillId(fallback)
  const rawId = getBillId(raw)

  return {
    ...fallback,
    ...raw,
    id: rawId || fallbackId
  }
}

const getIconEmoji = () => {
  return DEFAULT_BILL_ICON
}

const getBillIconColor = () => {
  return DEFAULT_BILL_COLOR
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

const getBillStatusText = (item) => {
  const status = getBillStatus(item)

  if (status === 'sudah') return 'Sudah Bayar'
  if (status === 'terlambat') return 'Terlambat'
  return 'Belum Bayar'
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

const resetForm = () => {
  selectedBillId.value = ''
  selectedBillDetail.value = null
  name.value = ''
  description.value = ''
  amount.value = ''
  currency.value = 'IDR'
  category.value = 'Utilities'
  payTo.value = ''
  billingCycle.value = 'monthly'
  dayOfMonth.value = 0
  remindDaysBefore.value = 0
  formError.value = ''
  formSuccess.value = ''
  savingBill.value = false
  loadingBillDetail.value = false
}

const fillFormFromBill = (bill) => {
  const billId = getBillId(bill)

  selectedBillId.value = billId || selectedBillId.value
  selectedBillDetail.value = {
    ...bill,
    id: billId || selectedBillId.value
  }

  name.value = bill.name || ''
  description.value = bill.description || ''
  amount.value = bill.amount ? formatInputRupiah(String(bill.amount)) : ''
  currency.value = bill.currency || 'IDR'
  category.value = bill.category || 'Utilities'
  payTo.value = bill.pay_to || ''
  billingCycle.value = bill.billing_cycle || 'monthly'
  dayOfMonth.value = bill.day_of_month || 0
  remindDaysBefore.value = bill.remind_days_before || 0
}

const validateForm = () => {
  formError.value = ''

  if (!name.value.trim()) {
    formError.value = 'Nama tagihan wajib diisi'
    return false
  }

  if (!description.value.trim()) {
    formError.value = 'Description wajib diisi'
    return false
  }

  if (!amount.value) {
    formError.value = 'Amount wajib diisi'
    return false
  }

  if (cleanRupiah(amount.value) <= 0) {
    formError.value = 'Amount harus lebih dari 0'
    return false
  }

  if (!category.value.trim()) {
    formError.value = 'Category wajib diisi'
    return false
  }

  if (!payTo.value.trim()) {
    formError.value = 'Pay to wajib diisi'
    return false
  }

  if (!dayOfMonth.value || Number(dayOfMonth.value) < 1 || Number(dayOfMonth.value) > 31) {
    formError.value = 'Day of month harus antara 1 sampai 31'
    return false
  }

  if (Number(remindDaysBefore.value) < 0) {
    formError.value = 'Remind days before tidak valid'
    return false
  }

  return true
}

const buildPayload = () => {
  return {
    name: name.value.trim(),
    description: description.value.trim(),
    amount: cleanRupiah(amount.value),
    currency: currency.value,
    category: category.value.trim(),
    pay_to: payTo.value.trim(),
    billing_cycle: billingCycle.value,
    day_of_month: Number(dayOfMonth.value),
    remind_days_before: Number(remindDaysBefore.value),
    icon: DEFAULT_BILL_ICON,
    color: DEFAULT_BILL_COLOR
  }
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

    const text = await response.text()
    const data = text ? JSON.parse(text) : []

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
  OPEN ADD BILL MODAL
========================= */
const openAddModal = () => {
  resetForm()
  modalMode.value = 'add'
  showModal.value = true
}

/* =========================
  OPEN EDIT BILL MODAL
  GET /bill/:id
========================= */
const openEditModal = async (item) => {
  const billId = getBillId(item)

  if (!billId) {
    listError.value = 'ID bill tidak ditemukan'
    return
  }

  resetForm()
  modalMode.value = 'edit'
  selectedBillId.value = billId

  // Tampilkan data card langsung dulu supaya modal tidak kosong.
  fillFormFromBill({
    ...item,
    id: billId
  })

  showModal.value = true
  loadingBillDetail.value = true

  try {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE_URL}/bill/${billId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && {
          Authorization: `Bearer ${token}`
        })
      }
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : {}

    console.log('Bill detail:', data)

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Gagal mengambil detail bill')
    }

    const detail = normalizeBillDetail(data, item)

    // Pastikan bill id tetap dari card yang diklik kalau response detail tidak punya id.
    detail.id = getBillId(detail) || billId

    fillFormFromBill(detail)
  } catch (error) {
    console.error('Fetch bill detail error:', error)
    formError.value = error.message || 'Terjadi kesalahan saat mengambil detail bill'
  } finally {
    loadingBillDetail.value = false
  }
}

/* =========================
  CREATE BILL
  POST /bill/
========================= */
const createBill = async () => {
  formSuccess.value = ''

  if (!validateForm()) return

  savingBill.value = true

  try {
    const token = localStorage.getItem('token')
    const payload = buildPayload()

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

    const text = await response.text()
    const data = text ? JSON.parse(text) : {}

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Gagal menambahkan bill')
    }

    formSuccess.value = 'Bill berhasil ditambahkan'

    await fetchBills()

    setTimeout(() => {
      resetModal()
    }, 700)
  } catch (error) {
    console.error('Create bill error:', error)
    formError.value = error.message || 'Terjadi kesalahan saat menambahkan bill'
  } finally {
    savingBill.value = false
  }
}

/* =========================
  UPDATE BILL
  PATCH /bill/:id
========================= */
const updateBill = async () => {
  formSuccess.value = ''

  const billId = selectedBillId.value

  if (!billId) {
    formError.value = 'ID bill tidak ditemukan'
    return
  }

  if (!validateForm()) return

  savingBill.value = true

  try {
    const token = localStorage.getItem('token')
    const payload = buildPayload()

    console.log('Update bill id:', billId)
    console.log('Update bill payload:', payload)

    const response = await fetch(`${API_BASE_URL}/bill/${billId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && {
          Authorization: `Bearer ${token}`
        })
      },
      body: JSON.stringify(payload)
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : {}

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Gagal mengupdate bill')
    }

    formSuccess.value = 'Bill berhasil diupdate'

    await fetchBills()

    setTimeout(() => {
      resetModal()
    }, 700)
  } catch (error) {
    console.error('Update bill error:', error)
    formError.value = error.message || 'Terjadi kesalahan saat mengupdate bill'
  } finally {
    savingBill.value = false
  }
}

/* =========================
  PAY BILL
  PATCH /bill/:id/pay
========================= */
const openPayConfirm = (item) => {
  const billId = getBillId(item)

  selectedActionBill.value = {
    ...item,
    id: billId
  }

  confirmType.value = 'pay'
  actionError.value = ''
  showConfirmAlert.value = true
}

const payBill = async () => {
  if (!selectedActionBill.value) {
    actionError.value = 'Bill tidak ditemukan'
    return
  }

  const billId = getBillId(selectedActionBill.value)

  if (!billId) {
    actionError.value = 'ID bill tidak ditemukan'
    return
  }

  const payAmount = Number(selectedActionBill.value.amount || 0)

  if (payAmount <= 0) {
    actionError.value = 'Amount bill tidak valid'
    return
  }

  processingAction.value = true
  payingBill.value = true
  actionError.value = ''

  try {
    const token = localStorage.getItem('token')

    const payload = {
      amount: payAmount
    }

    console.log('Pay bill id:', billId)
    console.log('Pay bill payload:', payload)

    const response = await fetch(`${API_BASE_URL}/bill/${billId}/pay`, {
      method: 'PATCH',
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
      throw new Error(data.message || data.error || 'Gagal membayar tagihan')
    }

    console.log('Pay bill response:', data)

    // update langsung di frontend
    billList.value = billList.value.map((item) => {
      if (getBillId(item) === billId) {
        return {
          ...item,
          is_paid: true
        }
      }

      return item
    })

    // tutup alert secara langsung
    showConfirmAlert.value = false
    confirmType.value = ''
    selectedActionBill.value = null
    actionError.value = ''

    // refresh ulang dari backend
    await fetchBills()
  } catch (error) {
    console.error('Pay bill error:', error)
    actionError.value = error.message || 'Terjadi kesalahan saat membayar tagihan'
  } finally {
    processingAction.value = false
    payingBill.value = false
  }
}

/* =========================
  DELETE BILL
  DELETE /bill/:id
========================= */
const openDeleteConfirm = () => {
  const billId = selectedBillId.value

  if (!billId) {
    formError.value = 'ID bill tidak ditemukan'
    return
  }

  selectedActionBill.value = {
    ...(selectedBillDetail.value || {}),
    id: billId,
    name: name.value,
    amount: cleanRupiah(amount.value),
    currency: currency.value
  }

  confirmType.value = 'delete'
  actionError.value = ''
  showConfirmAlert.value = true
}

const deleteBill = async () => {
  if (!selectedActionBill.value) {
    actionError.value = 'Bill tidak ditemukan'
    return
  }

  const billId = getBillId(selectedActionBill.value)

  if (!billId) {
    actionError.value = 'ID bill tidak ditemukan'
    return
  }

  processingAction.value = true
  deletingBill.value = true
  actionError.value = ''

  try {
    const token = localStorage.getItem('token')

    console.log('Delete bill id:', billId)

    const response = await fetch(`${API_BASE_URL}/bill/${billId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && {
          Authorization: `Bearer ${token}`
        })
      }
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : {}

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Gagal menghapus bill')
    }

    // Hapus card dari list langsung tanpa nunggu fetch ulang
    billList.value = billList.value.filter((item) => {
      return getBillId(item) !== billId
    })

    // Tutup modal edit
    resetModal()

    // Tutup alert secara paksa setelah sukses delete
    showConfirmAlert.value = false
    confirmType.value = ''
    selectedActionBill.value = null
    actionError.value = ''

    // Refresh data dari backend
    await fetchBills()
  } catch (error) {
    console.error('Delete bill error:', error)
    actionError.value = error.message || 'Terjadi kesalahan saat menghapus bill'
  } finally {
    processingAction.value = false
    deletingBill.value = false
  }
}

/* =========================
  CONFIRM ACTION
========================= */
const confirmAction = async () => {
  if (confirmType.value === 'pay') {
    await payBill()
    return
  }

  if (confirmType.value === 'delete') {
    await deleteBill()
  }
}

const closeConfirmAlert = () => {
  if (processingAction.value) return

  showConfirmAlert.value = false
  confirmType.value = ''
  selectedActionBill.value = null
  actionError.value = ''
}

/* =========================
  RESET MODAL
========================= */
const resetModal = () => {
  showModal.value = false
  modalMode.value = 'add'
  resetForm()
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
    <UserSideBar />

    <div class="main-wrapper">
      <div class="topbar">
        <div class="top-header">
          <h1>Tagihan</h1>

          <button class="add-btn" @click="openAddModal">
            ＋ Tambah
          </button>
        </div>
      </div>

      <main class="content-scroll">
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
            :key="getBillId(item)"
            class="bill-card"
            :class="{
              urgent: isUrgent(item),
              paid: getBillStatus(item) === 'sudah'
            }"
            @click="openEditModal(item)"
          >
            <div class="bill-left">
              <div
                class="bill-icon"
                :style="{
                  background: getBillIconColor() + '22',
                  color: getBillIconColor()
                }"
              >
                <img :src="getIconEmoji()" alt="Bill Icon" />
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
                @click.stop="openPayConfirm(item)"
              >
                Tandai Bayar
              </button>
            </div>
          </div>
        </section>
      </main>

      <!-- MODAL ADD / EDIT BILL -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3>
              {{ isEditMode ? 'Edit Tagihan' : 'Tambah Tagihan' }}
            </h3>

            <button class="close-btn" @click="resetModal">
              ✕
            </button>
          </div>

          <div v-if="loadingBillDetail" class="loading-detail">
            Mengambil detail tagihan...
          </div>

          <template v-else>
            <!-- DETAIL DATA SESUAI CARD -->
            <section v-if="isEditMode && selectedBillDetail" class="detail-box">
              <div class="detail-title-row">
                <div>
                  <p>Bill ID</p>
                  <h4>{{ selectedBillId || '-' }}</h4>
                </div>

                <span
                  class="detail-status"
                  :class="{
                    paid: getBillStatus(selectedBillDetail) === 'sudah',
                    late: getBillStatus(selectedBillDetail) === 'terlambat',
                    unpaid: getBillStatus(selectedBillDetail) === 'belum'
                  }"
                >
                  {{ getBillStatusText(selectedBillDetail) }}
                </span>
              </div>

              <div class="detail-grid">
                <div>
                  <p>Nama</p>
                  <h4>{{ selectedBillDetail.name || '-' }}</h4>
                </div>

                <div>
                  <p>Amount</p>
                  <h4>{{ selectedBillDetail.currency || 'IDR' }} {{ formatRupiah(selectedBillDetail.amount) }}</h4>
                </div>

                <div>
                  <p>Category</p>
                  <h4>{{ selectedBillDetail.category || '-' }}</h4>
                </div>

                <div>
                  <p>Pay To</p>
                  <h4>{{ selectedBillDetail.pay_to || '-' }}</h4>
                </div>

                <div>
                  <p>Billing Cycle</p>
                  <h4>{{ getBillingCycleLabel(selectedBillDetail.billing_cycle) }}</h4>
                </div>

                <div>
                  <p>Day of Month</p>
                  <h4>{{ selectedBillDetail.day_of_month || '-' }}</h4>
                </div>

                <div>
                  <p>Next Due Date</p>
                  <h4>{{ formatDate(selectedBillDetail.next_due_date) }}</h4>
                </div>

                <div>
                  <p>Reminder</p>
                  <h4>{{ selectedBillDetail.remind_days_before || 0 }} hari sebelumnya</h4>
                </div>

                <div>
                  <p>Created At</p>
                  <h4>{{ formatDateTime(selectedBillDetail.created_at) }}</h4>
                </div>

                <div>
                  <p>Updated At</p>
                  <h4>{{ formatDateTime(selectedBillDetail.updated_at) }}</h4>
                </div>
              </div>

              <div class="detail-description">
                <p>Description</p>
                <h4>{{ selectedBillDetail.description || '-' }}</h4>
              </div>
            </section>

            <div class="modal-section">
              <h4>Nama Tagihan</h4>

              <input
                v-model="name"
                type="text"
                class="input-field"
                placeholder="Contoh: IndiHome Internet"
              />
            </div>

            <div class="modal-section">
              <h4>Description</h4>

              <textarea
                v-model="description"
                class="textarea-field"
                placeholder="Contoh: Tagihan internet rumah"
              ></textarea>
            </div>

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

            <div class="modal-section">
              <h4>Currency</h4>

              <select v-model="currency" class="input-field">
                <option value="IDR">IDR</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div class="modal-section">
              <h4>Category</h4>

              <div class="category-grid">
                <button
                  v-for="item in categories"
                  :key="item"
                  type="button"
                  class="category-btn"
                  :class="{ active: category === item }"
                  @click="category = item"
                >
                  {{ item }}
                </button>
              </div>
            </div>

            <div class="modal-section">
              <h4>Bayar ke</h4>

              <input
                v-model="payTo"
                type="text"
                class="input-field"
                placeholder="Contoh: Telkom Indonesia"
              />
            </div>

            <div class="modal-section">
              <h4>Billing Cycle</h4>

              <div class="cycle-grid">
                <button
                  v-for="item in billingCycles"
                  :key="item.value"
                  type="button"
                  class="cycle-btn"
                  :class="{ active: billingCycle === item.value }"
                  @click="billingCycle = item.value"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>

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

            <div class="modal-section">
              <h4>Ingatkan berapa hari sebelum</h4>

              <input
                v-model="remindDaysBefore"
                type="number"
                min="0"
                class="input-field"
                placeholder="Contoh: 3"
              />
            </div>

            <p v-if="formError" class="error-text">
              {{ formError }}
            </p>

            <p v-if="formSuccess" class="success-text">
              {{ formSuccess }}
            </p>

            <div v-if="isEditMode" class="modal-action-row">
              <button
                class="delete-btn"
                :disabled="savingBill || deletingBill"
                @click="openDeleteConfirm"
              >
                Hapus
              </button>

              <button
                class="save-btn action-save-btn"
                :disabled="savingBill || deletingBill"
                @click="updateBill"
              >
                {{ savingBill ? 'Mengupdate...' : 'Update Tagihan' }}
              </button>
            </div>

            <button
              v-else
              class="save-btn"
              :disabled="savingBill"
              @click="createBill"
            >
              {{ savingBill ? 'Menyimpan...' : 'Simpan Tagihan' }}
            </button>
          </template>
        </div>
      </div>

      <!-- CUSTOM CONFIRM ALERT -->
      <div v-if="showConfirmAlert" class="custom-alert-overlay">
        <div class="custom-alert-card">
          <div
            class="custom-alert-icon"
            :class="{ pay: confirmType === 'pay', delete: confirmType === 'delete' }"
          >
            {{ confirmType === 'pay' ? '✓' : '!' }}
          </div>

          <h3>
            {{ confirmType === 'pay' ? 'Bayar Tagihan?' : 'Hapus Tagihan?' }}
          </h3>

          <p v-if="confirmType === 'pay'">
            Tagihan
            <strong>{{ selectedActionBill?.name || 'ini' }}</strong>
            akan ditandai sebagai sudah dibayar.
          </p>

          <p v-else>
            Tagihan
            <strong>{{ selectedActionBill?.name || 'ini' }}</strong>
            dengan ID
            <strong>{{ getBillId(selectedActionBill) || '-' }}</strong>
            akan dihapus permanen dan tidak bisa dikembalikan.
          </p>

          <div v-if="selectedActionBill" class="custom-alert-detail">
            <span>{{ selectedActionBill.currency || 'IDR' }}</span>

            <strong>
              {{ formatRupiah(selectedActionBill.amount) }}
            </strong>
          </div>

          <p v-if="actionError" class="alert-error-text">
            {{ actionError }}
          </p>

          <div class="custom-alert-actions">
            <button
              class="alert-cancel-btn"
              :disabled="processingAction"
              @click="closeConfirmAlert"
            >
              Batal
            </button>

            <button
              class="alert-confirm-btn"
              :class="{ delete: confirmType === 'delete' }"
              :disabled="processingAction"
              @click="confirmAction"
            >
              <template v-if="confirmType === 'pay'">
                {{ payingBill ? 'Memproses...' : 'Bayar' }}
              </template>

              <template v-else>
                {{ deletingBill ? 'Menghapus...' : 'Hapus' }}
              </template>
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
  cursor: pointer;
  transition: 0.2s ease;
}

.bill-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
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
  flex-shrink: 0;
}

.bill-icon img {
  width: 28px;
  height: 28px;
}

.bill-left h3 {
  margin: 0 0 6px;
  color: #1e293b;
  font-size: 24px;
  font-weight: 700;
}

.desc-text {
  margin: 0 0 10px;
  color: #64748b;
  font-size: 18px;
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
  font-size: 16px;
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
  font-size: 16px;
  color: #64748b;
  font-weight: 600;
}

.bill-info.danger {
  color: #ef4444;
}

.meta-text {
  margin: 10px 0 0;
  color: #64748b;
  font-size: 16px;
}

.bill-right {
  text-align: right;
  min-width: 230px;
}

.bill-right h4 {
  margin: 0 0 6px;
  color: #1e293b;
  font-size: 24px;
  font-weight: 700;
}

.bill-right p {
  margin: 0 0 10px;
  color: #64748b;
  font-size: 16px;
}

.pay-btn {
  width: 140px;
  height: 42px;
  border: none;
  border-radius: 10px;
  background: #4f46e5;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
  margin: 10px;
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
  width: 720px;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 18px;
  padding: 24px 28px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  animation: popup 0.2s ease;
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

/* MODAL HEADER */
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
  font-weight: 700;
}

.close-btn {
  border: none;
  background: transparent;
  color: #334155;
  font-size: 22px;
  cursor: pointer;
}

.loading-detail {
  padding: 30px 0;
  text-align: center;
  color: #64748b;
  font-size: 18px;
  font-weight: 700;
}

/* DETAIL BOX */
.detail-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 24px;
}

.detail-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 16px;
}

.detail-title-row p,
.detail-grid p,
.detail-description p {
  margin: 0 0 6px;
  color: #64748b;
  font-size: 15px;
  font-weight: 700;
}

.detail-title-row h4,
.detail-grid h4,
.detail-description h4 {
  margin: 0;
  color: #1e293b;
  font-size: 17px;
  font-weight: 800;
  word-break: break-word;
}

.detail-status {
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
}

.detail-status.paid {
  background: #dcfce7;
  color: #16a34a;
}

.detail-status.unpaid {
  background: #fef3c7;
  color: #d97706;
}

.detail-status.late {
  background: #fee2e2;
  color: #dc2626;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.detail-grid div,
.detail-description {
  background: white;
  border-radius: 14px;
  padding: 14px;
}

.detail-description {
  margin-top: 14px;
}

/* FORM */
.modal-section {
  margin-bottom: 24px;
}

.modal-section h4 {
  margin: 0 0 10px;
  color: #1e293b;
  font-size: 20px;
  font-weight: 700;
}

.input-field {
  width: 100%;
  height: 56px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 18px;
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
.cycle-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.category-btn,
.cycle-btn {
  min-height: 50px;
  border: none;
  border-radius: 12px;
  background: #f1f5f9;
  color: #1e293b;
  text-align: left;
  padding: 0 14px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.category-btn:hover,
.cycle-btn:hover {
  background: #e0e7ff;
  color: #4f46e5;
}

.category-btn.active,
.cycle-btn.active {
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

/* SAVE */
.save-btn {
  width: 100%;
  height: 56px;
  border: none;
  border-radius: 14px;
  background: #4f46e5;
  color: white;
  font-size: 20px;
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

.modal-action-row {
  display: flex;
  gap: 12px;
}

.modal-action-row button {
  flex: 1;
}

.action-save-btn {
  width: auto;
}

.delete-btn {
  height: 56px;
  border: none;
  border-radius: 14px;
  background: #fee2e2;
  color: #dc2626;
  font-size: 20px;
  font-weight: 800;
  cursor: pointer;
}

.delete-btn:hover {
  opacity: 0.9;
}

.delete-btn:disabled {
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

/* CUSTOM ALERT */
.custom-alert-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 12000;
  padding: 20px;
}

.custom-alert-card {
  width: 470px;
  background: white;
  border-radius: 24px;
  padding: 28px;
  text-align: center;
  box-shadow: 0 25px 70px rgba(15, 23, 42, 0.25);
  animation: alertPop 0.2s ease;
}

@keyframes alertPop {
  from {
    transform: scale(0.94);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.custom-alert-icon {
  width: 84px;
  height: 84px;
  margin: 0 auto 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
  font-weight: 800;
}

.custom-alert-icon.pay {
  background: #dcfce7;
  color: #16a34a;
}

.custom-alert-icon.delete {
  background: #fee2e2;
  color: #dc2626;
}

.custom-alert-card h3 {
  font-size: 38px;
  color: #111827;
  margin: 0 0 10px;
}

.custom-alert-card p {
  font-size: 20px;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

.custom-alert-card p strong {
  color: #111827;
}

.custom-alert-detail {
  margin: 18px 0 22px;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 20px;
}

.custom-alert-detail span {
  color: #64748b;
  font-weight: 600;
}

.custom-alert-detail strong {
  color: #111827;
}

.alert-error-text {
  color: #dc2626 !important;
  font-size: 15px !important;
  font-weight: 700;
  margin-bottom: 16px !important;
}

.custom-alert-actions {
  display: flex;
  gap: 12px;
}

.alert-cancel-btn,
.alert-confirm-btn {
  flex: 1;
  border: none;
  padding: 14px;
  border-radius: 14px;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
}

.alert-cancel-btn {
  background: #f1f5f9;
  color: #475569;
}

.alert-confirm-btn {
  background: #16a34a;
  color: white;
}

.alert-confirm-btn.delete {
  background: #ef4444;
}

.alert-cancel-btn:hover,
.alert-confirm-btn:hover {
  opacity: 0.9;
}

.alert-cancel-btn:disabled,
.alert-confirm-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .modal-card {
    width: 92%;
  }

  .modal-action-row {
    flex-direction: column;
  }

  .custom-alert-card {
    width: 100%;
  }

  .custom-alert-actions {
    flex-direction: column;
  }
}
</style>
