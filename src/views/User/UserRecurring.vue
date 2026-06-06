<script setup>
import { ref, onMounted } from 'vue'
import UserSideBar from '@/components/UserSideBar.vue'
import iconRecurring from '@/assets/User/icon-recurring.svg'

/* =========================
   API CONFIG
========================= */
const API_BASE_URL = 'http://localhost:8000'

/* =========================
   MODAL STATE
========================= */
const showModal = ref(false)
const showEditModal = ref(false)
const showDeleteAlert = ref(false)

/* =========================
   LOADING & ERROR
========================= */
const loadingSummary = ref(false)
const loadingList = ref(false)
const loadingCreate = ref(false)
const loadingUpdate = ref(false)
const loadingActionId = ref(null)
const deletingRecurring = ref(false)

const summaryError = ref('')
const listError = ref('')
const createError = ref('')
const createSuccess = ref('')
const updateError = ref('')
const updateSuccess = ref('')
const actionError = ref('')
const actionSuccess = ref('')
const deleteError = ref('')

/* =========================
   SUMMARY DATA
========================= */
const recurringSummary = ref({
  active_count: 0,
  monthly_expenses: 0,
  monthly_income: 0,
  net_monthly_cashflow: 0,
  paused_count: 0,
  total_recurring: 0
})

/* =========================
   LIST DATA
========================= */
const recurringList = ref([])

/* =========================
   FORM ADD
========================= */
const name = ref('')
const amount = ref('')
const type = ref('outcome')
const category = ref('')
const accountId = ref('')
const frequency = ref('monthly')
const interval = ref(1)
const note = ref('')

/* =========================
   FORM EDIT
========================= */
const selectedRecurring = ref(null)
const editName = ref('')
const editAmount = ref('')
const editType = ref('outcome')
const editCategory = ref('')
const editAccountId = ref('')
const editFrequency = ref('monthly')
const editInterval = ref(1)
const editNote = ref('')

/* =========================
   DELETE SELECTED
========================= */
const selectedDeleteRecurring = ref(null)

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
   DATE HELPER
   Berikutnya disesuaikan frequency + interval
========================= */
const getValidStartDate = (item) => {
  if (item?.start_date && item.start_date !== '0001-01-01T00:00:00Z') {
    return new Date(item.start_date)
  }

  if (item?.created_at && item.created_at !== '0001-01-01T00:00:00Z') {
    return new Date(item.created_at)
  }

  return new Date()
}

const addIntervalByFrequency = (dateValue, frequencyValue, intervalValue) => {
  const date = new Date(dateValue)
  const finalInterval = Number(intervalValue || 1)

  if (frequencyValue === 'daily') {
    date.setDate(date.getDate() + finalInterval)
  } else if (frequencyValue === 'weekly') {
    date.setDate(date.getDate() + finalInterval * 7)
  } else if (frequencyValue === 'monthly') {
    date.setMonth(date.getMonth() + finalInterval)
  } else if (frequencyValue === 'yearly') {
    date.setFullYear(date.getFullYear() + finalInterval)
  } else {
    date.setMonth(date.getMonth() + finalInterval)
  }

  return date
}

const getComputedNextRunDate = (item) => {
  const startDate = getValidStartDate(item)

  return addIntervalByFrequency(
    startDate,
    item?.frequency || 'monthly',
    item?.interval || 1
  )
}

/* =========================
   LABEL HELPER
========================= */
const getTypeLabel = (value) => {
  if (value === 'income') return 'PEMASUKAN'
  if (value === 'outcome') return 'PENGELUARAN'
  return value || '-'
}

const getFrequencyLabel = (value) => {
  if (value === 'daily') return 'Harian'
  if (value === 'weekly') return 'Mingguan'
  if (value === 'monthly') return 'Bulanan'
  if (value === 'yearly') return 'Tahunan'
  return value || '-'
}

const getIntervalLabel = (item) => {
  const value = Number(item?.interval || 1)
  const freq = item?.frequency

  if (freq === 'daily') return `${value} hari sekali`
  if (freq === 'weekly') return `${value} minggu sekali`
  if (freq === 'monthly') return `${value} bulan sekali`
  if (freq === 'yearly') return `${value} tahun sekali`

  return `${value} interval`
}

/* =========================
   FETCH SUMMARY
   GET /recurring/summary
========================= */
const fetchRecurringSummary = async () => {
  loadingSummary.value = true
  summaryError.value = ''

  try {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE_URL}/recurring/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && {
          Authorization: `Bearer ${token}`
        })
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Gagal mengambil summary recurring')
    }

    recurringSummary.value = {
      active_count: data.active_count || 0,
      monthly_expenses: data.monthly_expenses || 0,
      monthly_income: data.monthly_income || 0,
      net_monthly_cashflow: data.net_monthly_cashflow || 0,
      paused_count: data.paused_count || 0,
      total_recurring: data.total_recurring || 0
    }
  } catch (error) {
    console.error('Fetch recurring summary error:', error)
    summaryError.value = error.message
  } finally {
    loadingSummary.value = false
  }
}

/* =========================
   FETCH LIST
   GET /recurring/
========================= */
const fetchRecurringList = async () => {
  loadingList.value = true
  listError.value = ''

  try {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE_URL}/recurring/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && {
          Authorization: `Bearer ${token}`
        })
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Gagal mengambil list recurring')
    }

    recurringList.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Fetch recurring list error:', error)
    listError.value = error.message
  } finally {
    loadingList.value = false
  }
}

/* =========================
   CREATE RECURRING
   POST /recurring/
========================= */
const createRecurring = async () => {
  createError.value = ''
  createSuccess.value = ''

  if (!name.value.trim()) {
    createError.value = 'Nama recurring wajib diisi'
    return
  }

  if (!amount.value) {
    createError.value = 'Jumlah wajib diisi'
    return
  }

  if (!category.value.trim()) {
    createError.value = 'Kategori wajib diisi'
    return
  }

  if (!interval.value || Number(interval.value) <= 0) {
    createError.value = 'Interval harus lebih dari 0'
    return
  }

  loadingCreate.value = true

  try {
    const token = localStorage.getItem('token')

    const payload = {
      name: name.value.trim(),
      amount: cleanRupiah(amount.value),
      type: type.value,
      category: category.value.trim(),
      account_id: accountId.value.trim(),
      frequency: frequency.value,
      interval: Number(interval.value) || 1,
      note: note.value.trim()
    }

    const response = await fetch(`${API_BASE_URL}/recurring/`, {
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
      throw new Error(data.message || data.error || 'Gagal menambahkan recurring')
    }

    createSuccess.value = 'Recurring berhasil ditambahkan'

    resetModal()

    await Promise.all([
      fetchRecurringSummary(),
      fetchRecurringList()
    ])
  } catch (error) {
    console.error('Create recurring error:', error)
    createError.value = error.message
  } finally {
    loadingCreate.value = false
  }
}

/* =========================
   OPEN EDIT MODAL
========================= */
const openEditModal = (item) => {
  selectedRecurring.value = item

  editName.value = item.name || ''
  editAmount.value = formatRupiah(item.amount || 0)
  editType.value = item.type || 'outcome'
  editCategory.value = item.category || ''
  editAccountId.value = item.account_id || ''
  editFrequency.value = item.frequency || 'monthly'
  editInterval.value = item.interval || 1
  editNote.value = item.note || item.description || ''

  updateError.value = ''
  updateSuccess.value = ''
  actionError.value = ''
  actionSuccess.value = ''

  showEditModal.value = true
}

/* =========================
   UPDATE RECURRING
   PUT /recurring/:id
========================= */
const updateRecurring = async () => {
  updateError.value = ''
  updateSuccess.value = ''

  if (!selectedRecurring.value?.id) {
    updateError.value = 'ID recurring tidak ditemukan'
    return
  }

  if (!editName.value.trim()) {
    updateError.value = 'Nama recurring wajib diisi'
    return
  }

  if (!editAmount.value) {
    updateError.value = 'Jumlah wajib diisi'
    return
  }

  if (!editCategory.value.trim()) {
    updateError.value = 'Kategori wajib diisi'
    return
  }

  if (!editInterval.value || Number(editInterval.value) <= 0) {
    updateError.value = 'Interval harus lebih dari 0'
    return
  }

  loadingUpdate.value = true

  try {
    const token = localStorage.getItem('token')

    const payload = {
      name: editName.value.trim(),
      amount: cleanRupiah(editAmount.value),
      type: editType.value,
      category: editCategory.value.trim(),
      account_id: editAccountId.value.trim(),
      frequency: editFrequency.value,
      interval: Number(editInterval.value) || 1,
      note: editNote.value.trim()
    }

    const response = await fetch(`${API_BASE_URL}/recurring/${selectedRecurring.value.id}`, {
      method: 'PUT',
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
      throw new Error(data.message || data.error || 'Gagal update recurring')
    }

    updateSuccess.value = 'Recurring berhasil diupdate'

    await Promise.all([
      fetchRecurringSummary(),
      fetchRecurringList()
    ])

    setTimeout(() => {
      resetEditModal()
    }, 700)
  } catch (error) {
    console.error('Update recurring error:', error)
    updateError.value = error.message
  } finally {
    loadingUpdate.value = false
  }
}

/* =========================
   PAUSE / RESUME
========================= */
const toggleRecurringStatus = async () => {
  actionError.value = ''
  actionSuccess.value = ''

  const item = selectedRecurring.value

  if (!item?.id) {
    actionError.value = 'ID recurring tidak ditemukan'
    return
  }

  const action = item.is_active ? 'pause' : 'resume'

  loadingActionId.value = item.id

  try {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE_URL}/recurring/${item.id}/${action}`, {
      method: 'POST',
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
      throw new Error(data.message || data.error || `Gagal ${action} recurring`)
    }

    actionSuccess.value = item.is_active
      ? 'Recurring berhasil dipause'
      : 'Recurring berhasil diresume'

    selectedRecurring.value = {
      ...selectedRecurring.value,
      is_active: !selectedRecurring.value.is_active
    }

    await Promise.all([
      fetchRecurringSummary(),
      fetchRecurringList()
    ])
  } catch (error) {
    console.error('Toggle recurring error:', error)
    actionError.value = error.message
  } finally {
    loadingActionId.value = null
  }
}

/* =========================
   DELETE ALERT
========================= */
const openDeleteAlert = () => {
  if (!selectedRecurring.value) return

  selectedDeleteRecurring.value = selectedRecurring.value
  deleteError.value = ''
  showDeleteAlert.value = true
}

const closeDeleteAlert = () => {
  if (deletingRecurring.value) return

  selectedDeleteRecurring.value = null
  deleteError.value = ''
  showDeleteAlert.value = false
}

/* =========================
   DELETE RECURRING
========================= */
const deleteRecurring = async () => {
  actionError.value = ''
  actionSuccess.value = ''
  deleteError.value = ''

  const item = selectedDeleteRecurring.value

  if (!item?.id) {
    deleteError.value = 'ID recurring tidak ditemukan'
    return
  }

  deletingRecurring.value = true
  loadingActionId.value = item.id

  try {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE_URL}/recurring/${item.id}`, {
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
      throw new Error(data.message || data.error || 'Gagal menghapus recurring')
    }

    actionSuccess.value = 'Recurring berhasil dihapus'

    closeDeleteAlert()
    resetEditModal()

    await Promise.all([
      fetchRecurringSummary(),
      fetchRecurringList()
    ])
  } catch (error) {
    console.error('Delete recurring error:', error)
    deleteError.value = error.message
  } finally {
    deletingRecurring.value = false
    loadingActionId.value = null
  }
}

/* =========================
   RESET FORM
========================= */
const resetModal = () => {
  showModal.value = false

  name.value = ''
  amount.value = ''
  type.value = 'outcome'
  category.value = ''
  accountId.value = ''
  frequency.value = 'monthly'
  interval.value = 1
  note.value = ''

  createError.value = ''
  createSuccess.value = ''
}

const resetEditModal = () => {
  showEditModal.value = false

  selectedRecurring.value = null
  editName.value = ''
  editAmount.value = ''
  editType.value = 'outcome'
  editCategory.value = ''
  editAccountId.value = ''
  editFrequency.value = 'monthly'
  editInterval.value = 1
  editNote.value = ''

  updateError.value = ''
  updateSuccess.value = ''
}

/* =========================
   LIFECYCLE
========================= */
onMounted(() => {
  fetchRecurringSummary()
  fetchRecurringList()
})
</script>

<template>
  <div class="dashboard-layout">
    <UserSideBar />

    <div class="main-wrapper">
      <div class="topbar">
        <div class="top-header">
          <div class="title-area">
            <div class="title-row">
              <h1>Transaksi Berulang </h1>

              <button class="add-btn" @click="showModal = true">
                ＋ Tambah
              </button>
            </div>

            <div class="date-row">
              <p v-if="loadingSummary">
                Mengambil summary recurring...
              </p>

              <p v-else>
                {{ recurringSummary.active_count }} aktif •
                {{ recurringSummary.paused_count }} pause •
                Total: {{ recurringSummary.total_recurring }} recurring
              </p>
            </div>
          </div>
        </div>
      </div>

      <main class="content-scroll">
        <section class="summary-grid">
          <div class="summary-card">
            <p>Monthly Expenses</p>
            <h2 class="red-text">
              Rp {{ formatRupiah(recurringSummary.monthly_expenses) }}
            </h2>
          </div>

          <div class="summary-card">
            <p>Monthly Income</p>
            <h2 class="green-text">
              Rp {{ formatRupiah(recurringSummary.monthly_income) }}
            </h2>
          </div>

          <div class="summary-card">
            <p>Net Cashflow</p>
            <h2 :class="recurringSummary.net_monthly_cashflow >= 0 ? 'green-text' : 'red-text'">
              Rp {{ formatRupiah(recurringSummary.net_monthly_cashflow) }}
            </h2>
          </div>

          <div class="summary-card">
            <p>Total Recurring</p>
            <h2>
              {{ recurringSummary.total_recurring }}
            </h2>
          </div>
        </section>

        <p v-if="summaryError" class="error-text">
          {{ summaryError }}
        </p>

        <p v-if="actionError" class="error-text">
          {{ actionError }}
        </p>

        <p v-if="actionSuccess" class="success-text">
          {{ actionSuccess }}
        </p>

        <section class="recurring-list">
          <div v-if="loadingList" class="empty-card">
            Mengambil data recurring...
          </div>

          <div v-else-if="listError" class="empty-card error-text">
            {{ listError }}
          </div>

          <div v-else-if="recurringList.length === 0" class="empty-card">
            Belum ada transaksi berulang
          </div>

          <div
            v-for="item in recurringList"
            v-else
            :key="item.id"
            class="recurring-card"
            :class="{ inactive: !item.is_active }"
            @click="openEditModal(item)"
          >
            <div class="recurring-main">
              <div class="recurring-left">
                <div class="icon-circle">
                  <img :src="iconRecurring" alt="Recurring Icon" class="icon" />
                </div>
                <div>
                  <h3 style="font-size:24px">{{ item.name }}</h3>

                  <div class="badge-row">
                    <span
                      class="badge"
                      :class="item.type === 'income' ? 'income-badge' : 'outcome-badge'"
                    >
                      {{ getTypeLabel(item.type) }}
                    </span>

                    <span class="badge frequency-badge">
                      {{ getFrequencyLabel(item.frequency) }}
                      • {{ getIntervalLabel(item) }}
                    </span>

                    <span
                      class="badge"
                      :class="item.is_active ? 'active-badge' : 'inactive-badge'"
                    >
                      {{ item.is_active ? 'AKTIF' : 'PAUSE' }}
                    </span>
                  </div>

                  <p class="category-text">
                    {{ item.category || '-' }}
                  </p>

                  <p v-if="item.note || item.description" class="note-text">
                    {{ item.note || item.description }}
                  </p>
                </div>
              </div>

              <div class="recurring-right">
                <h4 :class="item.type === 'income' ? 'green-text' : 'red-text'">
                  {{ item.type === 'income' ? '+' : '-' }} Rp {{ formatRupiah(item.amount) }}
                </h4>

                <p>
                  Berikutnya: {{ formatDate(getComputedNextRunDate(item)) }}
                </p>

                <p>
                  Mulai: {{ formatDate(getValidStartDate(item)) }}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- MODAL ADD -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Tambah Transaksi Berulang</h3>

            <button class="close-btn" @click="resetModal">
              ✕
            </button>
          </div>

          <div class="modal-section">
            <h4>Nama</h4>

            <input
              v-model="name"
              type="text"
              class="input-field"
              placeholder="Contoh: Langganan Netflix"
            />
          </div>

          <div class="modal-section">
            <h4>Jumlah</h4>

            <div class="currency-input">
              <span>Rp</span>

              <input
                v-model="amount"
                type="text"
                placeholder="0"
                @input="amount = formatInputRupiah(amount)"
              />
            </div>
          </div>

          <div class="modal-section">
            <h4>Tipe</h4>

            <div class="type-grid">
              <button
                class="type-btn expense-btn"
                :class="{ active: type === 'outcome' }"
                @click="type = 'outcome'"
              >
                Pengeluaran
              </button>

              <button
                class="type-btn income-btn"
                :class="{ active: type === 'income' }"
                @click="type = 'income'"
              >
                Pemasukan
              </button>
            </div>
          </div>

          <div class="modal-section">
            <h4>Kategori</h4>

            <input
              v-model="category"
              type="text"
              class="input-field"
              placeholder="Contoh: Entertainment"
            />
          </div>

          <div class="modal-section">
            <h4>Frequency</h4>

            <div class="frequency-grid">
              <button
                class="frequency-btn"
                :class="{ active: frequency === 'daily' }"
                @click="frequency = 'daily'"
              >
                Daily
              </button>

              <button
                class="frequency-btn"
                :class="{ active: frequency === 'weekly' }"
                @click="frequency = 'weekly'"
              >
                Weekly
              </button>

              <button
                class="frequency-btn"
                :class="{ active: frequency === 'monthly' }"
                @click="frequency = 'monthly'"
              >
                Monthly
              </button>

              <button
                class="frequency-btn"
                :class="{ active: frequency === 'yearly' }"
                @click="frequency = 'yearly'"
              >
                Yearly
              </button>
            </div>
          </div>

          <div class="modal-section">
            <h4>Interval</h4>

            <input
              v-model="interval"
              type="number"
              min="1"
              class="input-field"
              placeholder="Contoh: 1"
            />
          </div>

          <div class="modal-section">
            <h4>Note</h4>

            <textarea
              v-model="note"
              class="textarea-field"
              placeholder="Contoh: Paket Premium 4K"
            ></textarea>
          </div>

          <p v-if="createError" class="error-text">
            {{ createError }}
          </p>

          <p v-if="createSuccess" class="success-text">
            {{ createSuccess }}
          </p>

          <button
            class="save-btn"
            :disabled="loadingCreate"
            @click="createRecurring"
          >
            {{ loadingCreate ? 'Menyimpan...' : 'Simpan Transaksi' }}
          </button>
        </div>
      </div>

      <!-- MODAL EDIT + ACTION -->
      <div v-if="showEditModal" class="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Edit Transaksi Berulang</h3>

            <button class="close-btn" @click="resetEditModal">
              ✕
            </button>
          </div>

          <div v-if="selectedRecurring" class="selected-info-box">
            <div>
              <h3>{{ selectedRecurring.name }}</h3>

              <p>
                {{ getTypeLabel(selectedRecurring.type) }}
                •
                {{ getFrequencyLabel(selectedRecurring.frequency) }}
                •
                {{ getIntervalLabel(selectedRecurring) }}
              </p>

              <p>
                Berikutnya:
                {{ formatDate(getComputedNextRunDate(selectedRecurring)) }}
              </p>
            </div>

            <span :class="selectedRecurring.is_active ? 'status-active' : 'status-paused'">
              {{ selectedRecurring.is_active ? 'AKTIF' : 'PAUSE' }}
            </span>
          </div>

          <div class="modal-section">
            <h4>Nama</h4>

            <input
              v-model="editName"
              type="text"
              class="input-field"
            />
          </div>

          <div class="modal-section">
            <h4>Jumlah</h4>

            <div class="currency-input">
              <span>Rp</span>

              <input
                v-model="editAmount"
                type="text"
                placeholder="0"
                @input="editAmount = formatInputRupiah(editAmount)"
              />
            </div>
          </div>

          <div class="modal-section">
            <h4>Tipe</h4>

            <div class="type-grid">
              <button
                class="type-btn expense-btn"
                :class="{ active: editType === 'outcome' }"
                @click="editType = 'outcome'"
              >
                Pengeluaran
              </button>

              <button
                class="type-btn income-btn"
                :class="{ active: editType === 'income' }"
                @click="editType = 'income'"
              >
                Pemasukan
              </button>
            </div>
          </div>

          <div class="modal-section">
            <h4>Kategori</h4>

            <input
              v-model="editCategory"
              type="text"
              class="input-field"
            />
          </div>

          <div class="modal-section">
            <h4>Frequency</h4>

            <div class="frequency-grid">
              <button
                class="frequency-btn"
                :class="{ active: editFrequency === 'daily' }"
                @click="editFrequency = 'daily'"
              >
                Daily
              </button>

              <button
                class="frequency-btn"
                :class="{ active: editFrequency === 'weekly' }"
                @click="editFrequency = 'weekly'"
              >
                Weekly
              </button>

              <button
                class="frequency-btn"
                :class="{ active: editFrequency === 'monthly' }"
                @click="editFrequency = 'monthly'"
              >
                Monthly
              </button>

              <button
                class="frequency-btn"
                :class="{ active: editFrequency === 'yearly' }"
                @click="editFrequency = 'yearly'"
              >
                Yearly
              </button>
            </div>
          </div>

          <div class="modal-section">
            <h4>Interval</h4>

            <input
              v-model="editInterval"
              type="number"
              min="1"
              class="input-field"
            />
          </div>

          <div class="modal-section">
            <h4>Note</h4>

            <textarea
              v-model="editNote"
              class="textarea-field"
            ></textarea>
          </div>

          <p v-if="updateError" class="error-text">
            {{ updateError }}
          </p>

          <p v-if="updateSuccess" class="success-text">
            {{ updateSuccess }}
          </p>

          <p v-if="actionError" class="error-text">
            {{ actionError }}
          </p>

          <p v-if="actionSuccess" class="success-text">
            {{ actionSuccess }}
          </p>

          <button
            class="save-btn"
            :disabled="loadingUpdate"
            @click="updateRecurring"
          >
            {{ loadingUpdate ? 'Mengupdate...' : 'Update Transaksi' }}
          </button>

          <div class="modal-action-row">
            <button
              class="pause-btn"
              :disabled="loadingActionId === selectedRecurring?.id"
              @click="toggleRecurringStatus"
            >
              {{
                loadingActionId === selectedRecurring?.id
                  ? 'Loading...'
                  : selectedRecurring?.is_active
                    ? 'Pause Recurring'
                    : 'Resume Recurring'
              }}
            </button>

            <button
              class="delete-btn"
              :disabled="loadingActionId === selectedRecurring?.id"
              @click="openDeleteAlert"
            >
              Hapus Recurring
            </button>
          </div>
        </div>
      </div>

      <!-- CUSTOM DELETE ALERT -->
      <div v-if="showDeleteAlert" class="custom-alert-overlay">
        <div class="custom-alert-card">
          <div class="custom-alert-icon">
            !
          </div>

          <h3>Hapus Recurring?</h3>

          <p>
            Transaksi berulang
            <strong>{{ selectedDeleteRecurring?.name || 'ini' }}</strong>
            akan dihapus permanen dan tidak bisa dikembalikan.
          </p>

          <div v-if="selectedDeleteRecurring" class="custom-alert-detail">
            <span>Nominal</span>

            <strong>
              Rp {{ formatRupiah(selectedDeleteRecurring.amount) }}
            </strong>
          </div>

          <p v-if="deleteError" class="alert-error-text">
            {{ deleteError }}
          </p>

          <div class="custom-alert-actions">
            <button
              class="alert-cancel-btn"
              :disabled="deletingRecurring"
              @click="closeDeleteAlert"
            >
              Batal
            </button>

            <button
              class="alert-delete-btn"
              :disabled="deletingRecurring"
              @click="deleteRecurring"
            >
              {{ deletingRecurring ? 'Menghapus...' : 'Ya, Hapus' }}
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

.top-header,
.title-area {
  width: 100%;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 21px;
}

.top-header h1 {
  font-size: 38px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.date-row {
  display: flex;
  align-items: center;
  color: #64748b;
  font-size: 20px;
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
  padding: 22px;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.summary-card p {
  margin: 0 0 10px;
  color: #64748b;
  font-size: 20px;
  font-weight: 600;
}

.summary-card h2 {
  margin: 0;
  color: #1e293b;
  font-size: 28px;
}

.green-text {
  color: #10b981 !important;
}

.red-text {
  color: #ef4444 !important;
}

.recurring-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-card {
  background: white;
  border-radius: 24px;
  padding: 34px 28px;
  text-align: center;
  color: #64748b;
  font-size: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.recurring-card {
  background: white;
  border-radius: 24px;
  padding: 28px;
  min-height: 96px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  cursor: pointer;
  transition: 0.2s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.recurring-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
}

.recurring-card.inactive {
  opacity: 0.55;
}

.recurring-main {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
  align-items: center;
}

.recurring-left {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 160px;
}

.icon-circle {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #eef2ff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 26px;
}

.icon-circle img{
  width: 28px;
  height: 28px;
}

.recurring-left h3 {
  margin: 0 0 8px;
  color: #1e293b;
  font-size: 22px;
  font-weight: 700;
}

.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 700;
}

.frequency-badge {
  background: #eef2ff;
  color: #64748b;
}

.income-badge {
  background: #dcfce7;
  color: #10b981;
}

.outcome-badge {
  background: #fee2e2;
  color: #ef4444;
}

.active-badge,
.status-active {
  background: #dcfce7;
  color: #10b981;
}

.inactive-badge,
.status-paused {
  background: #f1f5f9;
  color: #64748b;
}

.category-text,
.note-text {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 16px;
}

.recurring-right {
  text-align: right;
}

.recurring-right h4 {
  margin: 0 0 8px;
  color: #1e293b;
  font-size: 24px;
  font-weight: 700;
}

.recurring-right p {
  margin: 4px 0;
  color: #64748b;
  font-size: 18px;
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
  width: 650px;
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

.selected-info-box {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
}

.selected-info-box h3 {
  margin: 0;
  color: #1e293b;
  font-size: 22px;
}

.selected-info-box p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 15px;
}

.status-active,
.status-paused {
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
}

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
  background: white;
}

.textarea-field {
  width: 100%;
  min-height: 100px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
  resize: vertical;
}

.input-field:focus,
.currency-input:focus-within,
.textarea-field:focus {
  border-color: #4f46e5;
}

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

.type-grid,
.frequency-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.type-btn,
.frequency-btn {
  height: 56px;
  border: none;
  border-radius: 12px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.expense-btn.active {
  background: #ef4444;
  color: white;
}

.income-btn.active {
  background: #10b981;
  color: white;
}

.frequency-btn:hover {
  background: #e0e7ff;
  color: #4f46e5;
}

.frequency-btn.active {
  background: #4f46e5;
  color: white;
}

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

.modal-action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 14px;
}

.pause-btn,
.delete-btn {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 14px;
  color: white;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
}

.pause-btn {
  background: #f59e0b;
}

.delete-btn {
  background: #ef4444;
}

.pause-btn:hover,
.delete-btn:hover {
  opacity: 0.9;
}

.pause-btn:disabled,
.delete-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

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

/* CUSTOM DELETE ALERT */
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
  background: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  font-weight: 800;
}

.custom-alert-card h3 {
  font-size: 34px;
  color: #111827;
  margin: 0 0 10px;
}

.custom-alert-card p {
  font-size: 19px;
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
  font-size: 18px;
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
  margin: 0 0 16px !important;
}

.custom-alert-actions {
  display: flex;
  gap: 12px;
}

.alert-cancel-btn,
.alert-delete-btn {
  flex: 1;
  border: none;
  padding: 14px;
  border-radius: 14px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
}

.alert-cancel-btn {
  background: #f1f5f9;
  color: #475569;
}

.alert-delete-btn {
  background: #ef4444;
  color: white;
}

.alert-cancel-btn:hover,
.alert-delete-btn:hover {
  opacity: 0.9;
}

.alert-cancel-btn:disabled,
.alert-delete-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .main-wrapper {
    margin-left: 0;
    padding-top: 170px;
  }

  .topbar {
    left: 0;
    width: 100%;
  }

  .add-btn {
    width: 180px;
    margin-right: 0;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .recurring-main {
    grid-template-columns: 1fr;
    align-items: flex-start;
  }

  .recurring-right {
    width: 100%;
    text-align: left;
  }

  .modal-action-row {
    grid-template-columns: 1fr;
  }

  .modal-card {
    width: 92%;
  }

  .type-grid,
  .frequency-grid {
    grid-template-columns: 1fr;
  }

  .custom-alert-card {
    width: 100%;
  }

  .custom-alert-actions {
    flex-direction: column;
  }
}
</style>