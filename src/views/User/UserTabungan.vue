<script setup>
import { ref, computed, onMounted } from 'vue'
import UserSideBar from '@/components/UserSideBar.vue'
import iconGoal from '@/assets/User/icon-goalBudget.svg'

const API_BASE = 'http://localhost:8000'

/* =========================
   MODAL STATE
========================= */
const showTargetModal = ref(false)
const showDanaModal = ref(false)

/* =========================
   DELETE ALERT STATE
========================= */
const showDeleteAlert = ref(false)
const selectedDeleteTarget = ref(null)
const deletingGoal = ref(false)
const deleteError = ref('')

/* =========================
   LOADING / MESSAGE
========================= */
const loadingGoals = ref(false)
const savingTarget = ref(false)
const savingDana = ref(false)

const goalError = ref('')
const goalSuccess = ref('')
const listError = ref('')

const danaError = ref('')
const danaSuccess = ref('')

/* =========================
   DATA TARGET TABUNGAN
========================= */
const savingGoals = ref([])

/* =========================
   TARGET FORM
========================= */
const namaTarget = ref('')
const targetJumlah = ref('')
const sudahTerkumpul = ref('')
const deadline = ref('')

/* =========================
   TAMBAH DANA FORM
========================= */
const selectedTarget = ref(null)
const tambahanDana = ref('')

/* =========================
   FORMAT RUPIAH
========================= */
const formatRupiah = (value) => {
  if (!value) return ''

  const number = String(value).replace(/\D/g, '')

  return new Intl.NumberFormat('id-ID').format(Number(number || 0))
}

const formatRupiahDisplay = (value) => {
  if (!value) return '0'

  return new Intl.NumberFormat('id-ID').format(Math.round(Number(value || 0)))
}

const cleanRupiah = (value) => {
  return Number(String(value || '').replace(/\D/g, ''))
}

/* =========================
   FORMAT DATE
========================= */
const formatDate = (dateValue) => {
  if (!dateValue) return '-'

  return new Date(dateValue).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/* =========================
   TOTAL TERKUMPUL
========================= */
const totalTerkumpul = computed(() => {
  return savingGoals.value.reduce((total, item) => {
    return total + Number(item.goal?.current_amount || 0)
  }, 0)
})

/* =========================
   HELPER
========================= */
const getProgress = (item) => {
  const progress = Number(item?.progress || 0)

  return Math.min(Math.round(progress), 100)
}

const getRealProgress = (item) => {
  return Math.round(Number(item?.progress || 0))
}

const getSisaTarget = (item) => {
  const target = Number(item.goal?.target_amount || 0)
  const current = Number(item.goal?.current_amount || 0)

  return Math.max(target - current, 0)
}

/* =========================
   CHECK TARGET COMPLETED
========================= */
const isGoalCompleted = (item) => {
  const target = Number(item.goal?.target_amount || 0)
  const current = Number(item.goal?.current_amount || 0)

  return target > 0 && current >= target
}

/* =========================
   FETCH LIST TARGET TABUNGAN
   GET /savings_goal/get
========================= */
const fetchSavingGoals = async () => {
  loadingGoals.value = true
  listError.value = ''

  try {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE}/savings_goal/get`, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    const data = await response.json()
    console.log('Savings goal list:', data)

    if (!response.ok) {
      throw new Error(
        data.detail ||
          data.error ||
          data.message ||
          'Gagal mengambil data target tabungan'
      )
    }

    savingGoals.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Gagal mengambil target tabungan:', error)
    listError.value =
      error.message || 'Terjadi kesalahan saat mengambil target tabungan'
    savingGoals.value = []
  } finally {
    loadingGoals.value = false
  }
}

/* =========================
   SAVE TARGET TABUNGAN
   POST /savings_goal/
========================= */
const saveTarget = async () => {
  goalError.value = ''
  goalSuccess.value = ''

  if (!namaTarget.value.trim()) {
    goalError.value = 'Nama target wajib diisi'
    return
  }

  if (!targetJumlah.value) {
    goalError.value = 'Target jumlah wajib diisi'
    return
  }

  if (!deadline.value) {
    goalError.value = 'Deadline wajib diisi'
    return
  }

  const selectedDate = new Date(`${deadline.value}T23:59:59`)
  const today = new Date()

  if (selectedDate <= today) {
    goalError.value = 'Deadline harus di masa depan'
    return
  }

  const targetAmount = cleanRupiah(targetJumlah.value)
  const currentAmount = cleanRupiah(sudahTerkumpul.value || '0')

  if (targetAmount <= 0) {
    goalError.value = 'Target jumlah harus lebih dari 0'
    return
  }

  if (currentAmount < 0) {
    goalError.value = 'Dana terkumpul tidak valid'
    return
  }

  if (currentAmount > targetAmount) {
    goalError.value = 'Dana terkumpul tidak boleh lebih besar dari target'
    return
  }

  savingTarget.value = true

  try {
    const token = localStorage.getItem('token')

    const targetDateISO = new Date(`${deadline.value}T23:59:59+07:00`).toISOString()

    const payload = {
      name: namaTarget.value.trim(),
      target_amount: targetAmount,
      target_date: targetDateISO,
      initial_amount: currentAmount,
    }

    console.log('Payload savings goal:', payload)

    const response = await fetch(`${API_BASE}/savings_goal/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : {}

    if (!response.ok) {
      throw new Error(
        data.detail ||
          data.error ||
          data.message ||
          'Gagal menambahkan target tabungan'
      )
    }

    goalSuccess.value = 'Target tabungan berhasil ditambahkan'

    await fetchSavingGoals()

    setTimeout(() => {
      resetTargetModal()
    }, 700)
  } catch (error) {
    console.error('Gagal menambahkan target tabungan:', error)
    goalError.value =
      error.message || 'Terjadi kesalahan saat menyimpan target tabungan'
  } finally {
    savingTarget.value = false
  }
}

/* =========================
   OPEN MODAL TAMBAH DANA
========================= */
const openDanaModal = (item) => {
  if (isGoalCompleted(item)) {
    return
  }

  selectedTarget.value = item
  tambahanDana.value = ''
  danaError.value = ''
  danaSuccess.value = ''
  showDanaModal.value = true
}

/* =========================
   SAVE TAMBAH DANA
   POST /savings_goal/:id/contribute
========================= */
const saveDana = async () => {
  danaError.value = ''
  danaSuccess.value = ''

  if (!selectedTarget.value?.goal?.id) {
    danaError.value = 'Target tabungan tidak ditemukan'
    return
  }

  if (isGoalCompleted(selectedTarget.value)) {
    danaError.value = 'Target sudah tercapai, tidak perlu menambahkan dana lagi'
    return
  }

  if (!tambahanDana.value) {
    danaError.value = 'Jumlah tambahan dana wajib diisi'
    return
  }

  const amount = cleanRupiah(tambahanDana.value)
  const sisaTarget = getSisaTarget(selectedTarget.value)

  if (amount <= 0) {
    danaError.value = 'Jumlah dana harus lebih dari 0'
    return
  }

  if (amount > sisaTarget) {
    danaError.value = `Dana tambahan tidak boleh lebih dari sisa target Rp ${formatRupiahDisplay(sisaTarget)}`
    return
  }

  savingDana.value = true

  try {
    const token = localStorage.getItem('token')
    const goalId = selectedTarget.value.goal.id

    const response = await fetch(`${API_BASE}/savings_goal/${goalId}/contribute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        amount,
      }),
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : {}

    if (!response.ok) {
      throw new Error(
        data.detail ||
          data.error ||
          data.message ||
          'Gagal menambahkan dana'
      )
    }

    danaSuccess.value = 'Dana berhasil ditambahkan'

    await fetchSavingGoals()

    setTimeout(() => {
      resetDanaModal()
    }, 700)
  } catch (error) {
    console.error('Gagal menambahkan dana:', error)
    danaError.value =
      error.message || 'Terjadi kesalahan saat menambahkan dana'
  } finally {
    savingDana.value = false
  }
}

/* =========================
   OPEN DELETE ALERT
========================= */
const openDeleteAlert = (item) => {
  selectedDeleteTarget.value = item
  deleteError.value = ''
  showDeleteAlert.value = true
}

const closeDeleteAlert = () => {
  if (deletingGoal.value) return

  selectedDeleteTarget.value = null
  deleteError.value = ''
  showDeleteAlert.value = false
}

/* =========================
   FORCE CLOSE DELETE ALERT
========================= */
const forceCloseDeleteAlert = () => {
  selectedDeleteTarget.value = null
  deleteError.value = ''
  showDeleteAlert.value = false
}

/* =========================
   DELETE TARGET TABUNGAN
   DELETE /savings_goal/:id
========================= */
const deleteSavingGoal = async () => {
  deleteError.value = ''

  if (!selectedDeleteTarget.value?.goal?.id) {
    deleteError.value = 'Target tabungan tidak ditemukan'
    return
  }

  deletingGoal.value = true

  try {
    const token = localStorage.getItem('token')
    const goalId = selectedDeleteTarget.value.goal.id

    const response = await fetch(`${API_BASE}/savings_goal/${goalId}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : {}

    if (!response.ok) {
      throw new Error(
        data.detail ||
          data.error ||
          data.message ||
          'Gagal menghapus target tabungan'
      )
    }

    savingGoals.value = savingGoals.value.filter((item) => {
      return item.goal?.id !== goalId
    })

    if (selectedTarget.value?.goal?.id === goalId) {
      resetDanaModal()
    }

    forceCloseDeleteAlert()
  } catch (error) {
    console.error('Gagal menghapus target tabungan:', error)
    deleteError.value =
      error.message || 'Terjadi kesalahan saat menghapus target tabungan'
  } finally {
    deletingGoal.value = false
  }
}

/* =========================
   RESET FORM
========================= */
const resetTargetModal = () => {
  showTargetModal.value = false

  namaTarget.value = ''
  targetJumlah.value = ''
  sudahTerkumpul.value = ''
  deadline.value = ''

  goalError.value = ''
  goalSuccess.value = ''
  savingTarget.value = false
}

const resetDanaModal = () => {
  showDanaModal.value = false

  selectedTarget.value = null
  tambahanDana.value = ''

  danaError.value = ''
  danaSuccess.value = ''
  savingDana.value = false
}

/* =========================
   QUICK NOMINAL
========================= */
const pilihNominal = (nominal) => {
  if (!selectedTarget.value) return

  const sisaTarget = getSisaTarget(selectedTarget.value)
  const finalNominal = Math.min(nominal, sisaTarget)

  tambahanDana.value = new Intl.NumberFormat('id-ID').format(finalNominal)
}

onMounted(() => {
  fetchSavingGoals()
})
</script>

<template>
  <div class="dashboard-layout">
    <!-- SIDEBAR -->
    <UserSideBar />

    <!-- MAIN -->
    <div class="main-wrapper">
      <!-- HEADER -->
      <div class="topbar">
        <div class="top-header">
          <div class="title-area">
            <div class="title-row">
              <h1>Target Tabungan</h1>

              <button class="add-btn" @click="showTargetModal = true">
                ＋ Tambah
              </button>
            </div>

            <div class="date-row">
              <p>
                Sudah terkumpul total:
                Rp {{ formatRupiahDisplay(totalTerkumpul) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- CONTENT -->
      <main class="content-scroll">
        <!-- MOTIVATION -->
        <section class="motivation-box">
          <p class="motivation-label">
            Motivasi Hari Ini
          </p>

          <h2>
            Konsisten adalah kunci
          </h2>

          <span>
            Terus tambah dana sedikit demi sedikit agar target tabunganmu tercapai.
          </span>
        </section>

        <!-- GRID -->
        <section class="saving-grid">
          <div v-if="loadingGoals" class="saving-card empty-card">
            Loading target tabungan...
          </div>

          <div v-else-if="listError" class="saving-card empty-card error-text">
            {{ listError }}
          </div>

          <div v-else-if="savingGoals.length === 0" class="saving-card empty-card">
            Belum ada target tabungan.
          </div>

          <div
            v-else
            v-for="item in savingGoals"
            :key="item.goal.id"
            class="saving-card"
          >
            <div class="saving-top">
              <div class="saving-top-tittle">
                <img :src="iconGoal" />
                <h3>{{ item.goal.name }}</h3>
              </div>

              <span :class="isGoalCompleted(item) ? 'safe' : 'danger'">
                {{ isGoalCompleted(item) ? '● Tercapai' : '● On Progress' }}
              </span>
            </div>

            <!-- CIRCLE -->
            <div class="circle-progress">
              <div
                class="circle"
                :style="{ '--progress': getProgress(item) }"
              >
                <span>{{ getRealProgress(item) }}%</span>
              </div>
            </div>

            <!-- DETAIL -->
            <div class="saving-detail">
              <div>
                <p>Target</p>
                <h4>Rp {{ formatRupiahDisplay(item.goal.target_amount) }}</h4>
              </div>

              <div>
                <p>Terkumpul</p>
                <h4 class="green-text">
                  Rp {{ formatRupiahDisplay(item.goal.current_amount) }}
                </h4>
              </div>

              <div>
                <p>Sisa</p>
                <h4>Rp {{ formatRupiahDisplay(getSisaTarget(item)) }}</h4>
              </div>

              <div>
                <p>Deadline</p>
                <h4>{{ formatDate(item.goal.target_date || item.goal.deadline) }}</h4>
              </div>

              <div>
                <p>Dibutuhkan / Bulan</p>
                <h4>Rp {{ formatRupiahDisplay(item.monthly_needed) }}</h4>
              </div>
            </div>

            <button
              v-if="!isGoalCompleted(item)"
              class="card-btn"
              @click="openDanaModal(item)"
            >
              Tambah Dana
            </button>

            <div v-else class="completed-box">
              Target sudah tercapai
            </div>

            <button
              class="delete-card-btn"
              @click="openDeleteAlert(item)"
            >
              Hapus
            </button>
          </div>
        </section>
      </main>

      <!-- MODAL TARGET -->
      <div
        v-if="showTargetModal"
        class="modal-overlay"
      >
        <div class="modal-card">
          <div class="modal-header">
            <h3>Tambah Target Tabungan</h3>

            <button
              class="close-btn"
              @click="resetTargetModal"
            >
              ✕
            </button>
          </div>

          <div class="modal-section">
            <h4>Nama Target</h4>

            <input
              v-model="namaTarget"
              type="text"
              class="input-field"
              placeholder="Contoh: Emergency Fund"
            />
          </div>

          <div class="modal-section">
            <h4>Target Jumlah</h4>

            <input
              v-model="targetJumlah"
              type="text"
              class="input-field"
              placeholder="Rp 0"
              @input="targetJumlah = formatRupiah(targetJumlah)"
            />
          </div>

          <div class="modal-section">
            <h4>Deadline</h4>

            <input
              v-model="deadline"
              type="date"
              class="input-field"
            />
          </div>

          <p v-if="goalError" class="error-text">
            {{ goalError }}
          </p>

          <p v-if="goalSuccess" class="success-text">
            {{ goalSuccess }}
          </p>

          <button
            class="save-btn"
            :disabled="savingTarget"
            @click="saveTarget"
          >
            {{ savingTarget ? 'Menyimpan...' : 'Simpan Target' }}
          </button>
        </div>
      </div>

      <!-- MODAL TAMBAH DANA -->
      <div
        v-if="showDanaModal"
        class="modal-overlay"
      >
        <div class="modal-card">
          <div class="modal-header">
            <h3>Tambah Dana</h3>

            <button
              class="close-btn"
              @click="resetDanaModal"
            >
              ✕
            </button>
          </div>

          <div v-if="selectedTarget" class="target-info">
            <h4>
              {{ selectedTarget.goal.name }}
            </h4>

            <div class="circle-progress">
              <div
                class="circle"
                :style="{ '--progress': getProgress(selectedTarget) }"
              >
                <span>{{ getRealProgress(selectedTarget) }}%</span>
              </div>
            </div>

            <p class="progress-text">
              Rp {{ formatRupiahDisplay(selectedTarget.goal.current_amount) }}
              dari
              Rp {{ formatRupiahDisplay(selectedTarget.goal.target_amount) }}
            </p>

            <p class="sisa-modal-text">
              Sisa target:
              Rp {{ formatRupiahDisplay(getSisaTarget(selectedTarget)) }}
            </p>
          </div>

          <div class="modal-section">
            <h4>Jumlah Tambahan Dana</h4>

            <input
              v-model="tambahanDana"
              type="text"
              class="input-field"
              placeholder="Rp 0"
              @input="tambahanDana = formatRupiah(tambahanDana)"
            />
          </div>

          <div class="quick-grid">
            <button class="quick-btn" @click="pilihNominal(50000)">
              50.000
            </button>

            <button class="quick-btn" @click="pilihNominal(100000)">
              100.000
            </button>

            <button class="quick-btn" @click="pilihNominal(500000)">
              500.000
            </button>

            <button class="quick-btn" @click="pilihNominal(1000000)">
              1.000.000
            </button>
          </div>

          <p v-if="danaError" class="error-text">
            {{ danaError }}
          </p>

          <p v-if="danaSuccess" class="success-text">
            {{ danaSuccess }}
          </p>

          <button
            class="save-btn"
            :disabled="savingDana"
            @click="saveDana"
          >
            {{ savingDana ? 'Menyimpan...' : 'Simpan Dana' }}
          </button>
        </div>
      </div>

      <!-- CUSTOM DELETE ALERT -->
      <div v-if="showDeleteAlert" class="custom-alert-overlay">
        <div class="custom-alert-card">
          <div class="custom-alert-icon">
            !
          </div>

          <h3>Hapus Target?</h3>

          <p>
            Target tabungan
            <strong>{{ selectedDeleteTarget?.goal?.name || 'ini' }}</strong>
            akan dihapus permanen dan tidak bisa dikembalikan.
          </p>

          <div class="custom-alert-detail" v-if="selectedDeleteTarget">
            <span>Target</span>

            <strong>
              Rp {{ formatRupiahDisplay(selectedDeleteTarget.goal.target_amount) }}
            </strong>
          </div>

          <p v-if="deleteError" class="alert-error-text">
            {{ deleteError }}
          </p>

          <div class="custom-alert-actions">
            <button
              class="alert-cancel-btn"
              :disabled="deletingGoal"
              @click="closeDeleteAlert"
            >
              Batal
            </button>

            <button
              class="alert-delete-btn"
              :disabled="deletingGoal"
              @click="deleteSavingGoal"
            >
              {{ deletingGoal ? 'Menghapus...' : 'Ya, Hapus' }}
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

/* MAIN */
.main-wrapper {
  flex: 1;
  margin-left: 300px;
  padding-top: 180px;
}

/* HEADER */
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
}

.title-area {
  width: 100%;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
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

/* CONTENT */
.content-scroll {
  padding: 30px;
  overflow-y: auto;
}

/* MOTIVATION */
.motivation-box {
  background: #f59e0b;
  color: white;
  padding: 24px;
  border-radius: 22px;
  margin-bottom: 24px;
}

.motivation-label {
  font-size: 20px;
  opacity: 0.9;
}

.motivation-box h2 {
  margin-top: 8px;
  font-size: 40px;
}

.motivation-box span {
  display: block;
  margin-top: 10px;
  font-size: 20px;
}

/* GRID */
.saving-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

/* CARD */
.saving-card {
  background: white;
  border-radius: 22px;
  padding: 22px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.empty-card {
  grid-column: span 2;
  text-align: center;
  color: #64748b;
  font-size: 20px;
}

.saving-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.saving-top h3 {
  font-size: 24px;
  color: #1e293b;
}

.saving-top img {
  width: 32px;
  height: 32px;
  margin-right: 10px;
}

.saving-top-tittle {
  display: flex;
  align-items: center;
  gap: 10px;
}

.safe {
  background: #dcfce7;
  color: #16a34a;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}

.danger {
  background: #fee2e2;
  color: #dc2626;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}

/* CIRCLE */
.circle-progress {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}

.circle {
  --progress: 0;

  width: 95px;
  height: 95px;
  border-radius: 50%;

  background:
    conic-gradient(
      #10b981 calc(var(--progress) * 1%),
      #e5e7eb 0
    );

  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;

  font-weight: 700;
  color: #1e293b;
}

.circle::before {
  content: '';
  position: absolute;
  width: 74px;
  height: 74px;
  border-radius: 50%;
  background: white;
}

.circle span {
  position: relative;
  z-index: 2;
  font-size: 20px;
}

.progress-text {
  margin-top: 12px;
  color: #64748b;
  font-size: 20px;
}

.sisa-modal-text {
  margin-top: 8px;
  color: #10b981;
  font-size: 18px;
  font-weight: 700;
}

/* DETAIL */
.saving-detail {
  display: grid;
  gap: 14px;
}

.saving-detail p {
  font-size: 20px;
  color: #94a3b8;
  margin: 0 0 4px;
}

.saving-detail h4 {
  color: #1e293b;
  font-size: 20px;
  margin: 0;
}

.green-text {
  color: #10b981 !important;
}

/* BUTTON */
.card-btn {
  width: 100%;
  margin-top: 24px;
  border: none;
  background: #4f46e5;
  color: white;
  padding: 14px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 600;
  font-size: 20px;
}

.card-btn:hover {
  opacity: 0.9;
}

.completed-box {
  width: 100%;
  margin-top: 24px;
  background: #dcfce7;
  color: #16a34a;
  padding: 14px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 20px;
  text-align: center;
  box-sizing: border-box;
}

.delete-card-btn {
  width: 100%;
  margin-top: 12px;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  padding: 14px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 700;
  font-size: 20px;
}

.delete-card-btn:hover {
  opacity: 0.9;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 9999;
}

.modal-card {
  width: 520px;
  max-height: 92vh;
  overflow-y: auto;
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  animation: popup 0.2s ease;
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
  background: none;
  font-size: 18px;
  cursor: pointer;
}

.modal-section {
  margin-bottom: 24px;
}

.modal-section h4 {
  font-size: 20px;
  color: #1e293b;
  margin-bottom: 12px;
}

.input-field {
  width: 100%;
  height: 58px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px;
  font-size: 18px;
  outline: none;
  box-sizing: border-box;
}

/* QUICK */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.quick-btn {
  border: none;
  background: #eef2ff;
  color: #4338ca;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
}

.quick-btn:hover {
  opacity: 0.9;
}

/* TARGET INFO */
.target-info {
  background: #f8fafc;
  padding: 22px;
  border-radius: 18px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.target-info h4 {
  font-size: 24px;
  color: #1e293b;
  margin-bottom: 18px;
}

/* MESSAGE */
.error-text {
  color: #dc2626;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.success-text {
  color: #16a34a;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

/* SAVE */
.save-btn {
  width: 100%;
  border: none;
  background: #4f46e5;
  color: white;
  padding: 16px;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
}

.save-btn:hover {
  opacity: 0.9;
}

.save-btn:disabled,
.card-btn:disabled,
.delete-card-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
  color: #dc2626;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px !important;
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
  font-size: 20px;
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
  .saving-grid {
    grid-template-columns: 1fr;
  }

  .empty-card {
    grid-column: span 1;
  }

  .topbar {
    left: 0;
    width: 100%;
  }

  .main-wrapper {
    margin-left: 0;
  }

  .modal-card {
    width: 90%;
  }

  .quick-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .custom-alert-card {
    width: 100%;
  }

  .custom-alert-actions {
    flex-direction: column;
  }
}
</style>