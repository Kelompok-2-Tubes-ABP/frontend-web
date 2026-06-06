<script setup>
import { ref, computed, onMounted } from 'vue'
import UserSideBar from '@/components/UserSideBar.vue'
import { Calendar } from 'lucide-vue-next'

import iconMakanan from '@/assets/User/icon-makanan.svg'
import iconTransportasi from '@/assets/User/icon-transportasi.svg'
import iconHiburan from '@/assets/User/icon-hiburan.svg'
import iconBelanja from '@/assets/User/icon-belanja.svg'
import iconTagihan from '@/assets/User/icon-tagihan.svg'
import iconKesehatan from '@/assets/User/icon-kesehatan.svg'
import iconInvestasi from '@/assets/User/icon-investasi.svg'
import iconLainnya from '@/assets/User/icon-lainya.svg'

const API_BASE = 'http://localhost:8000'

/* =========================
   MODAL TAMBAH / EDIT CATEGORY BUDGET
========================= */
const showModal = ref(false)
const isEditCategoryBudget = ref(false)
const selectedCategoryBudgetId = ref('')

const selectedBudgetCategory = ref('')
const categoryBudgetLimit = ref('')
const categoryBudgetNotes = ref('')

const savingCategoryBudget = ref(false)
const categoryBudgetError = ref('')
const categoryBudgetSuccess = ref('')

/* =========================
   MODAL SET / EDIT BUDGET BULANAN
========================= */
const showBudgetModal = ref(false)
const budgetLimit = ref('')
const savingBudget = ref(false)
const budgetError = ref('')
const budgetSuccess = ref('')

/* =========================
   BUDGET BULANAN STATE
========================= */
const totalBudget = ref(0)
const totalTerpakai = ref(0)
const totalSisa = ref(0)
const statusBudget = ref('no_budget')
const loadingBudget = ref(false)
const percentageUsed = ref(0)

const currentBudgetId = ref('')
const hasMonthlyBudget = computed(() => !!currentBudgetId.value)

/* =========================
   CATEGORY BUDGET STATE
========================= */
const categoryBudgets = ref([])
const loadingCategoryBudgets = ref(false)
const categoryBudgetListError = ref('')

/* =========================
   CUSTOM DELETE ALERT
========================= */
const showDeleteAlert = ref(false)
const deleteType = ref('')
const deletingBudget = ref(false)
const deleteError = ref('')

const openDeleteMonthlyBudgetAlert = () => {
  budgetError.value = ''
  deleteError.value = ''

  if (!currentBudgetId.value) {
    budgetError.value = 'Budget bulanan tidak ditemukan'
    return
  }

  deleteType.value = 'monthly'
  showDeleteAlert.value = true
}

const openDeleteCategoryBudgetAlert = () => {
  categoryBudgetError.value = ''
  deleteError.value = ''

  if (!selectedCategoryBudgetId.value) {
    categoryBudgetError.value = 'Budget kategori tidak ditemukan'
    return
  }

  deleteType.value = 'category'
  showDeleteAlert.value = true
}

const closeDeleteAlert = () => {
  if (deletingBudget.value) return

  showDeleteAlert.value = false
  deleteType.value = ''
  deleteError.value = ''
}

const resetMonthlyBudgetState = () => {
  currentBudgetId.value = ''
  totalBudget.value = 0
  totalTerpakai.value = 0
  totalSisa.value = 0
  percentageUsed.value = 0
  statusBudget.value = 'no_budget'

  categoryBudgets.value = []
  selectedCategoryBudgetId.value = ''
  selectedBudgetCategory.value = ''
  categoryBudgetLimit.value = ''
  categoryBudgetNotes.value = ''
}

const deleteSelectedBudget = async () => {
  deleteError.value = ''

  let url = ''

  if (deleteType.value === 'monthly') {
    if (!currentBudgetId.value) {
      deleteError.value = 'Budget bulanan tidak ditemukan'
      return
    }

    url = `${API_BASE}/budget/${currentBudgetId.value}`
  }

  if (deleteType.value === 'category') {
    if (!selectedCategoryBudgetId.value) {
      deleteError.value = 'Budget kategori tidak ditemukan'
      return
    }

    url = `${API_BASE}/budget/category/${selectedCategoryBudgetId.value}`
  }

  if (!url) {
    deleteError.value = 'Tipe budget tidak valid'
    return
  }

  deletingBudget.value = true

  try {
    const token = localStorage.getItem('token')

    const response = await fetch(url, {
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
          'Gagal menghapus budget'
      )
    }

    if (deleteType.value === 'monthly') {
      showDeleteAlert.value = false
      resetBudgetModal()
      resetModal()
      resetMonthlyBudgetState()

      await fetchBudgetAllSpending()
    }

    if (deleteType.value === 'category') {
      showDeleteAlert.value = false

      const deletedId = selectedCategoryBudgetId.value

      categoryBudgets.value = categoryBudgets.value.filter((item) => {
        return item.id !== deletedId
      })

      resetModal()
    }

    deleteType.value = ''
  } catch (error) {
    console.error('Gagal menghapus budget:', error)
    deleteError.value = error.message || 'Terjadi kesalahan saat menghapus budget'
  } finally {
    deletingBudget.value = false
  }
}

/* =========================
   DATE
========================= */
const currentDate = new Date()

const currentMonthApi = computed(() => {
  const year = currentDate.getFullYear()
  const month = String(currentDate.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
})

const currentMonthText = computed(() => {
  return currentDate.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })
})

/* =========================
   CATEGORY MAP
========================= */
const categoryNameMap = {
  food: 'Makanan',
  transport: 'Transportasi',
  shopping: 'Belanja',
  bills: 'Tagihan',
  health: 'Kesehatan',
  entertainment: 'Hiburan',
  investment: 'Investasi',
  other: 'Lainnya',
}

const categoryIconMap = {
  food: iconMakanan,
  transport: iconTransportasi,
  shopping: iconBelanja,
  bills: iconTagihan,
  health: iconKesehatan,
  entertainment: iconHiburan,
  investment: iconInvestasi,
  other: iconLainnya,
}

const categoryOptions = [
  { value: 'food', label: 'Makanan', icon: iconMakanan },
  { value: 'transport', label: 'Transportasi', icon: iconTransportasi },
  { value: 'shopping', label: 'Belanja', icon: iconBelanja },
  { value: 'bills', label: 'Tagihan', icon: iconTagihan },
  { value: 'health', label: 'Kesehatan', icon: iconKesehatan },
  { value: 'entertainment', label: 'Hiburan', icon: iconHiburan },
  { value: 'investment', label: 'Investasi', icon: iconInvestasi },
  { value: 'other', label: 'Lainnya', icon: iconLainnya },
]

const formatCategory = (category) => {
  return categoryNameMap[category] || category || 'Lainnya'
}

const getCategoryIcon = (category) => {
  return categoryIconMap[category] || iconLainnya
}

/* =========================
   FORMAT
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
  return Number(String(value).replace(/\D/g, ''))
}

/* =========================
   COMPUTED BUDGET BULANAN
========================= */
const budgetPercentage = computed(() => {
  if (!totalBudget.value || totalBudget.value <= 0) return 0

  const percent = Number(percentageUsed.value || 0)

  return Math.min(Math.round(percent), 100)
})

const budgetStatusClass = computed(() => {
  if (statusBudget.value === 'over_budget') return 'danger'
  if (statusBudget.value === 'warning') return 'warning'
  if (statusBudget.value === 'no_budget') return 'warning'

  return 'safe'
})

const budgetStatusText = computed(() => {
  if (statusBudget.value === 'over_budget') return '● MELEBIHI'
  if (statusBudget.value === 'warning') return '● PERINGATAN'
  if (statusBudget.value === 'no_budget') return '● BELUM ADA'

  return '● AMAN'
})

const budgetInfoText = computed(() => {
  if (statusBudget.value === 'no_budget') {
    return 'Kamu belum mengatur budget bulan ini'
  }

  if (statusBudget.value === 'over_budget') {
    return 'Budget kamu sudah melebihi batas bulan ini ⚠️'
  }

  if (statusBudget.value === 'warning') {
    return 'Pengeluaranmu hampir mencapai batas budget'
  }

  return 'Pengeluaranmu masih aman 👍'
})

const remainingDays = computed(() => {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

  return Math.max(lastDay - now.getDate(), 0)
})

/* =========================
   HELPER CATEGORY BUDGET CARD
========================= */
const getCategoryBudgetPercentage = (item) => {
  const limit = Number(item.limit || 0)
  const spent = Number(item.spent || 0)

  if (limit <= 0) return 0

  return Math.min(Math.round((spent / limit) * 100), 100)
}

const getCategoryBudgetRealPercentage = (item) => {
  const limit = Number(item.limit || 0)
  const spent = Number(item.spent || 0)

  if (limit <= 0) return 0

  return Math.round((spent / limit) * 100)
}

const getCategoryBudgetStatusClass = (item) => {
  const percent = getCategoryBudgetRealPercentage(item)

  if (percent > 100) return 'danger'
  if (percent >= 80) return 'warning'

  return 'safe'
}

const getCategoryBudgetStatusText = (item) => {
  const percent = getCategoryBudgetRealPercentage(item)

  if (percent > 100) return '● Melebihi'
  if (percent >= 80) return '● Peringatan'

  return '● Aman'
}

const getCategoryBudgetFooterText = (item) => {
  const remaining = Number(item.limit || 0) - Number(item.spent || 0)

  if (remaining < 0) {
    return `Lebih Rp ${formatRupiahDisplay(Math.abs(remaining))}`
  }

  return `Sisa Rp ${formatRupiahDisplay(remaining)}`
}

/* =========================
   DUPLICATE CATEGORY CHECK
========================= */
const isCategoryAlreadyExists = (category) => {
  if (!category) return false

  return categoryBudgets.value.some((item) => {
    return item.month === currentMonthApi.value && item.category === category
  })
}

const selectBudgetCategory = (category) => {
  categoryBudgetError.value = ''

  if (isCategoryAlreadyExists(category)) {
    categoryBudgetError.value = `Budget kategori ${formatCategory(category)} sudah ada untuk bulan ini`
    selectedBudgetCategory.value = ''
    return
  }

  selectedBudgetCategory.value = category
}

/* =========================
   FETCH BUDGET BULANAN
========================= */
const fetchBudgetAllSpending = async () => {
  loadingBudget.value = true

  try {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE}/budget/all-spending`, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    const data = await response.json()
    console.log('Budget all spending:', data)

    if (!response.ok) {
      throw new Error(
        data.detail ||
          data.error ||
          data.message ||
          'Gagal mengambil data budget'
      )
    }

    const budgets = Array.isArray(data) ? data : []

    const currentBudget = budgets.find((item) => {
      return item.budget?.month === currentMonthApi.value
    })

    if (!currentBudget) {
      resetMonthlyBudgetState()
      return
    }

    currentBudgetId.value = currentBudget.budget?.id || ''
    totalBudget.value = currentBudget.budget?.limit || 0
    totalTerpakai.value = currentBudget.spending || 0
    totalSisa.value = currentBudget.remaining || 0
    percentageUsed.value = currentBudget.percentage_used || 0
    statusBudget.value = currentBudget.status || 'safe'
  } catch (error) {
    console.error('Gagal mengambil budget all spending:', error)
    resetMonthlyBudgetState()
  } finally {
    loadingBudget.value = false
  }
}

/* =========================
   FETCH CATEGORY BUDGET
========================= */
const fetchCategoryBudgets = async () => {
  if (!hasMonthlyBudget.value) {
    categoryBudgets.value = []
    return
  }

  loadingCategoryBudgets.value = true
  categoryBudgetListError.value = ''

  try {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE}/budget/category`, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    const data = await response.json()
    console.log('Category budgets:', data)

    if (!response.ok) {
      throw new Error(
        data.detail ||
          data.error ||
          data.message ||
          'Gagal mengambil data budget kategori'
      )
    }

    const budgets = Array.isArray(data) ? data : []

    categoryBudgets.value = budgets.filter((item) => {
      return item.month === currentMonthApi.value
    })
  } catch (error) {
    console.error('Gagal mengambil budget kategori:', error)
    categoryBudgetListError.value =
      error.message || 'Terjadi kesalahan saat mengambil budget kategori'
    categoryBudgets.value = []
  } finally {
    loadingCategoryBudgets.value = false
  }
}

/* =========================
   OPEN / CLOSE MONTHLY MODAL
========================= */
const openBudgetModal = () => {
  budgetError.value = ''
  budgetSuccess.value = ''

  budgetLimit.value = totalBudget.value
    ? formatRupiah(String(totalBudget.value))
    : ''

  showBudgetModal.value = true
}

const resetBudgetModal = () => {
  showBudgetModal.value = false
  budgetLimit.value = ''
  budgetError.value = ''
  budgetSuccess.value = ''
  savingBudget.value = false
}

/* =========================
   SAVE SET / EDIT BUDGET BULANAN
========================= */
const saveMonthlyBudget = async () => {
  budgetError.value = ''
  budgetSuccess.value = ''

  if (!budgetLimit.value) {
    budgetError.value = 'Limit budget wajib diisi'
    return
  }

  const limitValue = cleanRupiah(budgetLimit.value)

  if (limitValue <= 0) {
    budgetError.value = 'Limit budget harus lebih dari 0'
    return
  }

  savingBudget.value = true

  try {
    const token = localStorage.getItem('token')

    const isEdit = hasMonthlyBudget.value

    const url = isEdit
      ? `${API_BASE}/budget/${currentBudgetId.value}`
      : `${API_BASE}/budget/`

    const method = isEdit ? 'PATCH' : 'POST'

    const payload = isEdit
      ? {
          limit: limitValue,
        }
      : {
          month: currentMonthApi.value,
          limit: limitValue,
        }

    const response = await fetch(url, {
      method,
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
          (isEdit ? 'Gagal mengedit budget' : 'Gagal menyimpan budget')
      )
    }

    budgetSuccess.value = isEdit
      ? 'Budget bulanan berhasil diedit'
      : 'Budget bulanan berhasil disimpan'

    await fetchBudgetAllSpending()
    await fetchCategoryBudgets()
    resetBudgetModal()
  } catch (error) {
    console.error('Gagal menyimpan budget:', error)
    budgetError.value =
      error.message || 'Terjadi kesalahan saat menyimpan budget'
  } finally {
    savingBudget.value = false
  }
}

/* =========================
   OPEN / CLOSE CATEGORY MODAL
========================= */
const openAddCategoryBudgetModal = () => {
  if (!hasMonthlyBudget.value) return

  isEditCategoryBudget.value = false
  selectedCategoryBudgetId.value = ''

  selectedBudgetCategory.value = ''
  categoryBudgetLimit.value = ''
  categoryBudgetNotes.value = ''

  categoryBudgetError.value = ''
  categoryBudgetSuccess.value = ''

  showModal.value = true
}

const openEditCategoryBudgetModal = (item) => {
  isEditCategoryBudget.value = true
  selectedCategoryBudgetId.value = item.id

  selectedBudgetCategory.value = item.category
  categoryBudgetLimit.value = item.limit ? formatRupiah(String(item.limit)) : ''
  categoryBudgetNotes.value = item.notes || ''

  categoryBudgetError.value = ''
  categoryBudgetSuccess.value = ''

  showModal.value = true
}

const resetModal = () => {
  showModal.value = false

  isEditCategoryBudget.value = false
  selectedCategoryBudgetId.value = ''

  selectedBudgetCategory.value = ''
  categoryBudgetLimit.value = ''
  categoryBudgetNotes.value = ''

  categoryBudgetError.value = ''
  categoryBudgetSuccess.value = ''
  savingCategoryBudget.value = false
}

/* =========================
   SAVE ADD / EDIT CATEGORY BUDGET
========================= */
const saveCategoryBudget = async () => {
  categoryBudgetError.value = ''
  categoryBudgetSuccess.value = ''

  if (!hasMonthlyBudget.value) {
    categoryBudgetError.value = 'Set budget bulanan terlebih dahulu'
    return
  }

  if (!isEditCategoryBudget.value && !selectedBudgetCategory.value) {
    categoryBudgetError.value = 'Kategori wajib dipilih'
    return
  }

  if (!isEditCategoryBudget.value && isCategoryAlreadyExists(selectedBudgetCategory.value)) {
    categoryBudgetError.value = `Budget kategori ${formatCategory(selectedBudgetCategory.value)} sudah ada untuk bulan ini`
    return
  }

  if (!categoryBudgetLimit.value) {
    categoryBudgetError.value = 'Limit budget kategori wajib diisi'
    return
  }

  const limitValue = cleanRupiah(categoryBudgetLimit.value)

  if (limitValue <= 0) {
    categoryBudgetError.value = 'Limit budget harus lebih dari 0'
    return
  }

  if (limitValue >= totalBudget.value) {
    categoryBudgetError.value = 'Limit budget kategori tidak boleh melebihi limit budget bulanan'
    return
  }

  savingCategoryBudget.value = true

  try {
    const token = localStorage.getItem('token')
    const isEdit = isEditCategoryBudget.value

    const url = isEdit
      ? `${API_BASE}/budget/category/${selectedCategoryBudgetId.value}`
      : `${API_BASE}/budget/category`

    const method = isEdit ? 'PATCH' : 'POST'

    const payload = isEdit
      ? {
          limit: limitValue,
        }
      : {
          month: currentMonthApi.value,
          category: selectedBudgetCategory.value,
          limit: limitValue,
          notes: categoryBudgetNotes.value.trim(),
        }

    const response = await fetch(url, {
      method,
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
          (isEdit ? 'Gagal mengedit budget kategori' : 'Gagal menambahkan budget kategori')
      )
    }

    categoryBudgetSuccess.value = isEdit
      ? 'Budget kategori berhasil diedit'
      : 'Budget kategori berhasil ditambahkan'

    await fetchCategoryBudgets()

    setTimeout(() => {
      resetModal()
    }, 700)
  } catch (error) {
    console.error('Gagal menyimpan budget kategori:', error)
    categoryBudgetError.value =
      error.message || 'Terjadi kesalahan saat menyimpan budget kategori'
  } finally {
    savingCategoryBudget.value = false
  }
}

onMounted(async () => {
  await fetchBudgetAllSpending()

  if (hasMonthlyBudget.value) {
    await fetchCategoryBudgets()
  } else {
    categoryBudgets.value = []
  }
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
              <h1>Budget</h1>

              <button
                v-if="hasMonthlyBudget"
                class="add-btn"
                @click="openAddCategoryBudgetModal"
              >
                ＋ Tambah
              </button>
            </div>

            <div class="date-row">
              <span>
                <Calendar :size="30" />
              </span>

              <p>{{ currentMonthText }}</p>
            </div>
          </div>
        </div>
      </div>

      <main class="content-scroll">
        <section
          class="budget-card clickable-card"
          @click="openBudgetModal"
        >
          <div class="card-top">
            <div>
              <p class="label">Budget Bulanan</p>

              <h2 v-if="loadingBudget">
                Loading...
              </h2>

              <h2 v-else>
                Rp {{ formatRupiahDisplay(totalTerpakai) }}
                <span>
                  dari Rp {{ formatRupiahDisplay(totalBudget) }}
                </span>
              </h2>
            </div>

            <div class="status" :class="budgetStatusClass">
              {{ budgetStatusText }}
            </div>
          </div>

          <div class="percentage">
            {{ budgetPercentage }}%
          </div>

          <div class="progress-bar">
            <div
              class="progress-fill"
              :class="budgetStatusClass"
              :style="{ width: budgetPercentage + '%' }"
            ></div>
          </div>

          <div class="budget-footer">
            <span>{{ budgetPercentage }}% terpakai</span>
            <span>{{ remainingDays }} hari tersisa</span>
          </div>
        </section>

        <section class="info-box" :class="budgetStatusClass">
          {{ budgetInfoText }}
        </section>

        <section class="budget-grid">
          <div v-if="!hasMonthlyBudget" class="mini-card empty-card">
            Set budget bulanan terlebih dahulu untuk menambahkan budget kategori.
          </div>

          <div v-else-if="loadingCategoryBudgets" class="mini-card empty-card">
            Loading budget kategori...
          </div>

          <div v-else-if="categoryBudgetListError" class="mini-card empty-card error-text">
            {{ categoryBudgetListError }}
          </div>

          <div v-else-if="categoryBudgets.length === 0" class="mini-card empty-card">
            Belum ada budget kategori bulan ini.
          </div>

          <div
            v-else
            v-for="item in categoryBudgets"
            :key="item.id"
            class="mini-card clickable-card"
            @click="openEditCategoryBudgetModal(item)"
          >
            <div class="mini-top">
              <h3 class="mini-title">
                <span class="category-icon-box">
                  <img
                    :src="getCategoryIcon(item.category)"
                    :alt="formatCategory(item.category)"
                  />
                </span>

                {{ formatCategory(item.category) }}
              </h3>

              <span :class="getCategoryBudgetStatusClass(item)">
                {{ getCategoryBudgetStatusText(item) }}
              </span>
            </div>

            <p class="price">
              Rp {{ formatRupiahDisplay(item.spent) }} /
              Rp {{ formatRupiahDisplay(item.limit) }}
            </p>

            <div class="progress-bar small">
              <div
                class="progress-fill"
                :class="getCategoryBudgetStatusClass(item)"
                :style="{ width: getCategoryBudgetPercentage(item) + '%' }"
              ></div>
            </div>

            <div class="mini-footer">
              <span>{{ getCategoryBudgetFooterText(item) }}</span>
              <span>{{ getCategoryBudgetRealPercentage(item) }}%</span>
            </div>
          </div>
        </section>
      </main>

      <!-- MODAL TAMBAH / EDIT KATEGORI BUDGET -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3>
              {{ isEditCategoryBudget ? 'Edit Budget Kategori' : 'Tambah Budget Kategori' }}
            </h3>

            <button
              class="close-btn"
              @click="resetModal"
            >
              ✕
            </button>
          </div>

          <div class="modal-info">
            <p>Bulan</p>
            <h4>{{ currentMonthText }}</h4>
          </div>

          <div class="modal-section">
            <h4>Kategori</h4>

            <div v-if="!isEditCategoryBudget" class="category-grid">
              <div
                v-for="category in categoryOptions"
                :key="category.value"
                class="category-item"
                :class="{
                  active: selectedBudgetCategory === category.value,
                  disabled: isCategoryAlreadyExists(category.value)
                }"
                @click="selectBudgetCategory(category.value)"
              >
                <span class="category-modal-icon">
                  <img :src="category.icon" :alt="category.label" />
                </span>

                <p>{{ category.label }}</p>

                <small v-if="isCategoryAlreadyExists(category.value)">
                  Sudah ada
                </small>
              </div>
            </div>

            <div v-else class="selected-category-readonly">
              <span class="category-modal-icon">
                <img
                  :src="getCategoryIcon(selectedBudgetCategory)"
                  :alt="formatCategory(selectedBudgetCategory)"
                />
              </span>

              <strong>{{ formatCategory(selectedBudgetCategory) }}</strong>
            </div>
          </div>

          <div class="modal-section">
            <h4>Limit Budget</h4>

            <div class="rupiah-wrapper">
              <span>Rp</span>

              <input
                v-model="categoryBudgetLimit"
                type="text"
                @input="categoryBudgetLimit = formatRupiah(categoryBudgetLimit)"
                placeholder="0"
                class="input-field no-left-radius"
              />
            </div>
          </div>

          <p v-if="categoryBudgetError" class="error-text">
            {{ categoryBudgetError }}
          </p>

          <p v-if="categoryBudgetSuccess" class="success-text">
            {{ categoryBudgetSuccess }}
          </p>

          <div class="modal-action-row" v-if="isEditCategoryBudget">
            <button
              class="delete-budget-btn"
              :disabled="savingCategoryBudget || deletingBudget"
              @click="openDeleteCategoryBudgetAlert"
            >
              Hapus Budget Kategori
            </button>

            <button
              class="save-btn action-save-btn"
              :disabled="savingCategoryBudget || deletingBudget"
              @click="saveCategoryBudget"
            >
              {{ savingCategoryBudget ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>

          <button
            v-else
            class="save-btn"
            :disabled="savingCategoryBudget"
            @click="saveCategoryBudget"
          >
            {{ savingCategoryBudget ? 'Menyimpan...' : 'Simpan Budget Kategori' }}
          </button>
        </div>
      </div>

      <!-- MODAL SET / EDIT BUDGET BULANAN -->
      <div v-if="showBudgetModal" class="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3>
              {{ hasMonthlyBudget ? 'Edit Budget Bulanan' : 'Set Budget Bulanan' }}
            </h3>

            <button
              class="close-btn"
              @click="resetBudgetModal"
            >
              ✕
            </button>
          </div>

          <div class="modal-info">
            <p>Bulan</p>
            <h4>{{ currentMonthText }}</h4>
          </div>

          <div class="modal-section">
            <h4>Limit Budget</h4>

            <div class="rupiah-wrapper">
              <span>Rp</span>

              <input
                v-model="budgetLimit"
                type="text"
                @input="budgetLimit = formatRupiah(budgetLimit)"
                placeholder="0"
                class="input-field no-left-radius"
              />
            </div>
          </div>

          <p v-if="budgetError" class="error-text">
            {{ budgetError }}
          </p>

          <p v-if="budgetSuccess" class="success-text">
            {{ budgetSuccess }}
          </p>

          <div class="modal-action-row" v-if="hasMonthlyBudget">
            <button
              class="delete-budget-btn"
              :disabled="savingBudget || deletingBudget"
              @click="openDeleteMonthlyBudgetAlert"
            >
              Hapus Budget
            </button>

            <button
              class="save-btn action-save-btn"
              :disabled="savingBudget || deletingBudget"
              @click="saveMonthlyBudget"
            >
              {{ savingBudget ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>

          <button
            v-else
            class="save-btn"
            :disabled="savingBudget"
            @click="saveMonthlyBudget"
          >
            {{ savingBudget ? 'Menyimpan...' : 'Simpan Budget' }}
          </button>
        </div>
      </div>

      <!-- CUSTOM DELETE ALERT -->
      <div v-if="showDeleteAlert" class="custom-alert-overlay">
        <div class="custom-alert-card">
          <div class="custom-alert-icon">
            !
          </div>

          <h3>
            {{
              deleteType === 'monthly'
                ? 'Hapus Budget Bulanan?'
                : 'Hapus Budget Kategori?'
            }}
          </h3>

          <p v-if="deleteType === 'monthly'">
            Budget bulanan untuk
            <strong>{{ currentMonthText }}</strong>
            akan dihapus permanen dan semua budget kategori bulan ini akan hilang dari tampilan.
          </p>

          <p v-else>
            Budget kategori
            <strong>{{ formatCategory(selectedBudgetCategory) }}</strong>
            untuk {{ currentMonthText }} akan dihapus permanen dan tidak bisa dikembalikan.
          </p>

          <div class="custom-alert-detail">
            <span>
              {{
                deleteType === 'monthly'
                  ? 'Budget Bulanan'
                  : formatCategory(selectedBudgetCategory)
              }}
            </span>

            <strong>
              Rp {{
                deleteType === 'monthly'
                  ? formatRupiahDisplay(totalBudget)
                  : formatRupiahDisplay(cleanRupiah(categoryBudgetLimit))
              }}
            </strong>
          </div>

          <p v-if="deleteError" class="alert-error-text">
            {{ deleteError }}
          </p>

          <div class="custom-alert-actions">
            <button
              class="alert-cancel-btn"
              :disabled="deletingBudget"
              @click="closeDeleteAlert"
            >
              Batal
            </button>

            <button
              class="alert-delete-btn"
              :disabled="deletingBudget"
              @click="deleteSelectedBudget"
            >
              {{ deletingBudget ? 'Menghapus...' : 'Ya, Hapus' }}
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
  padding: 28px;
  margin-left: 300px;
  padding-top: 220px;
}

/* FIXED HEADER */
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
  gap: 8px;
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

/* SCROLL CONTENT */
.content-scroll {
  flex: 1;
  overflow-y: auto;
}

/* CARD */
.budget-card {
  background: white;
  border-radius: 22px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: 0.2s ease;
}

.clickable-card {
  cursor: pointer;
}

.clickable-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.label {
  color: #64748b;
  font-size: 20px;
  margin-bottom: 8px;
}

.budget-card h2 {
  font-size: 40px;
  font-weight: 700;
  color: #1e293b;
}

.budget-card h2 span {
  font-size: 22px;
  color: #94a3b8;
  font-weight: 500;
}

.percentage {
  margin-top: 18px;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

/* STATUS BADGE BUDGET BULANAN */
.status {
  font-size: 16px;
  padding: 10px 16px;
  border-radius: 999px;
  font-weight: 600;
}

.status.safe {
  background: #dcfce7;
  color: #16a34a;
}

.status.warning {
  background: #ffedd5;
  color: #ea580c;
}

.status.danger {
  background: #fee2e2;
  color: #dc2626;
}

/* STATUS BADGE KATEGORI */
.mini-top > span {
  font-size: 16px;
  padding: 10px 16px;
  border-radius: 999px;
  font-weight: 600;
}

.mini-top > span.safe {
  background: #dcfce7;
  color: #16a34a;
}

.mini-top > span.warning {
  background: #ffedd5;
  color: #ea580c;
}

.mini-top > span.danger {
  background: #fee2e2;
  color: #dc2626;
}

/* PROGRESS BAR */
.progress-bar {
  width: 100%;
  height: 10px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
  position: relative;
}

.progress-bar.small {
  height: 8px;
}

.progress-fill {
  height: 100%;
  width: 0%;
  padding: 0 !important;
  margin: 0;
  border-radius: 999px;
  display: block;
  transition: width 0.3s ease;
}

.progress-fill.safe {
  background: #10b981;
  color: transparent;
}

.progress-fill.warning {
  background: #f97316;
  color: transparent;
}

.progress-fill.danger {
  background: #ef4444;
  color: transparent;
}

.budget-footer {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  font-size: 20px;
  color: #94a3b8;
}

/* INFO BOX */
.info-box {
  margin-top: 22px;
  padding: 22px;
  border-radius: 18px;
  font-size: 20px;
  font-weight: 600;
}

.info-box.safe {
  background: #dff7ee;
  color: #10b981;
}

.info-box.warning {
  background: #ffedd5;
  color: #ea580c;
}

.info-box.danger {
  background: #fee2e2;
  color: #dc2626;
}

/* GRID */
.budget-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

/* MINI CARD */
.mini-card {
  background: white;
  border-radius: 20px;
  margin-bottom: 20px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.empty-card {
  grid-column: span 2;
  color: #64748b;
  font-size: 20px;
  text-align: center;
}

.mini-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mini-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-icon-box img {
  width: 45px;
  height: 45px;
  object-fit: contain;
}

.mini-top h3 {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
}

.price {
  margin: 14px 0 10px;
  color: #475569;
  font-size: 20px;
}

.mini-footer {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  font-size: 20px;
  color: #94a3b8;
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
  width: 620px;
  max-height: 92vh;
  overflow-y: auto;
  background: white;
  border-radius: 24px;
  padding: 24px;
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

.modal-info {
  background: #f8fafc;
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 24px;
}

.modal-info p {
  color: #64748b;
  font-size: 20px;
  margin: 0 0 4px;
}

.modal-info h4 {
  color: #1e293b;
  font-size: 30px;
  margin: 0 0 6px;
}

.modal-section {
  margin-bottom: 24px;
}

.modal-section h4 {
  font-size: 18px;
  color: #334155;
  margin-bottom: 10px;
}

.close-btn {
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
}

.rupiah-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
}

.rupiah-wrapper span {
  height: 60px;
  min-width: 70px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  font-size: 18px;
  font-weight: 700;
  border-right: 1px solid #e5e7eb;
}

.input-field {
  width: 100%;
  height: 60px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  outline: none;
  box-sizing: border-box;
  font-size: 18px;
}

.no-left-radius {
  border: none;
  border-radius: 0;
}

/* CATEGORY MODAL */
.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.category-item {
  background: #f1f5f9;
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 14px;
  text-align: center;
  cursor: pointer;
  transition: 0.2s ease;
  position: relative;
}

.category-item:hover {
  background: #ede9fe;
}

.category-item.active {
  background: #ede9fe;
  border-color: #4f46e5;
}

.category-item.disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background: #f8fafc;
}

.category-item.disabled:hover {
  background: #f8fafc;
}

.category-item small {
  display: block;
  margin-top: 6px;
  color: #dc2626;
  font-size: 15px;
  font-weight: 700;
}

.category-modal-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.category-modal-icon img {
  width: 45px;
  height: 45px;
  object-fit: contain;
}

.category-item p {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #334155;
}

.selected-category-readonly {
  height: 64px;
  width: 100%;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 0 16px;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: flex-start;

  gap: 14px;
  color: #1e293b;
  font-size: 18px;
  text-align: left;
}

.selected-category-readonly .category-modal-icon {
  margin: 0;
  flex-shrink: 0;
}

.selected-category-readonly strong {
  display: block;
  text-align: left;
  margin: 0;
}

.error-text {
  color: #dc2626;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
}

.success-text {
  color: #16a34a;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.save-btn {
  width: 100%;
  border: none;
  background: #4f46e5;
  color: white;
  padding: 16px;
  border-radius: 16px;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
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
  margin-top: 12px;
}

.modal-action-row button {
  flex: 1;
}

.action-save-btn {
  margin-top: 0;
}

.delete-budget-btn {
  width: 100%;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  padding: 16px;
  border-radius: 16px;
  font-size: 24px;
  font-weight: 700;
  cursor: pointer;
}

.delete-budget-btn:hover {
  opacity: 0.9;
}

.delete-budget-btn:disabled {
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
  .budget-grid {
    grid-template-columns: 1fr;
  }

  .empty-card {
    grid-column: span 1;
  }

  .top-header {
    padding: 20px;
  }

  .content-scroll {
    padding: 20px;
  }

  .budget-card h2 {
    font-size: 26px;
  }

  .modal-card {
    width: 92%;
  }

  .category-grid {
    grid-template-columns: repeat(2, 1fr);
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