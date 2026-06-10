<script setup>
import { ref, computed, onMounted } from 'vue'
import UserSideBar from '@/components/UserSideBar.vue'

/* =========================
   API CONFIG
========================= */
const API_BASE_URL = 'https://backend-financeapi.up.railway.app'

/* =========================
   MODAL STATE
========================= */
const showModal = ref(false)
const showDetailModal = ref(false)
const showBuyModal = ref(false)

/* =========================
   LOADING & ERROR
========================= */
const loadingPortfolio = ref(false)
const loadingCreate = ref(false)
const loadingDetail = ref(false)
const loadingDeleteId = ref(null)
const loadingUpdatePrice = ref(false)
const loadingBuy = ref(false)

const portfolioError = ref('')
const createError = ref('')
const createSuccess = ref('')
const detailError = ref('')
const deleteError = ref('')
const updatePriceError = ref('')
const updatePriceSuccess = ref('')
const buyError = ref('')
const buySuccess = ref('')

/* =========================
   FILTER
========================= */
const selectedFilter = ref('all')

/* =========================
   SELECTED INVESTMENT DETAIL
========================= */
const selectedInvestment = ref(null)
const selectedBuyInvestment = ref(null)

/* =========================
   PORTFOLIO DATA
========================= */
const portfolioCurrency = ref('idr')
const lastUpdate = ref('-')

const portfolioSummary = ref({
  by_type: {
    crypto: 0,
    stock: 0
  },
  gain_loss: 0,
  gain_loss_percent: 0,
  total_cost: 0,
  total_investments: 0,
  total_value: 0
})

/* =========================
   INVESTMENT LIST
========================= */
const investments = ref([])

/* =========================
   FORM CREATE INVESTMENT
========================= */
const jenisInvestasi = ref('Crypto')
const namaInvestasi = ref('')
const symbolInvestasi = ref('')
const jumlahKepemilikan = ref('')
const averageCost = ref('')
const currentPrice = ref('')
const currency = ref('IDR')
const exchange = ref('')
const notes = ref('')

/* =========================
   UPDATE PRICE FORM
========================= */
const newPrice = ref('')

/* =========================
   BUY TRANSACTION FORM
========================= */
const buyQuantity = ref('')
const buyPrice = ref('')
const buyFee = ref('')
const buyCurrency = ref('IDR')
const buyNotes = ref('')

/* =========================
   FORMAT CURRENCY DISPLAY
========================= */
const formatCurrency = (value, currencyCode = 'IDR') => {
  const number = Number(value || 0)

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currencyCode || 'IDR',
    minimumFractionDigits: currencyCode === 'USD' ? 2 : 0,
    maximumFractionDigits: currencyCode === 'USD' ? 2 : 0
  }).format(number)
}

const formatRupiah = (value) => {
  return formatCurrency(value, 'IDR')
}

/* =========================
   FORMAT DATE
========================= */
const formatDate = (value) => {
  if (
    !value ||
    value === '0001-01-01T00:00:00Z' ||
    String(value).startsWith('0001-01-01')
  ) {
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
   FORMAT DATETIME
========================= */
const formatDateTime = (value) => {
  if (
    !value ||
    value === '0001-01-01T00:00:00Z' ||
    String(value).startsWith('0001-01-01')
  ) {
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

const getPurchaseDate = (investment) => {
  if (!investment) return '-'

  const purchaseDate = investment.purchase_date
  const createdAt = investment.created_at

  if (
    purchaseDate &&
    purchaseDate !== '0001-01-01T00:00:00Z' &&
    !String(purchaseDate).startsWith('0001-01-01')
  ) {
    return formatDate(purchaseDate)
  }

  if (
    createdAt &&
    createdAt !== '0001-01-01T00:00:00Z' &&
    !String(createdAt).startsWith('0001-01-01')
  ) {
    return formatDate(createdAt)
  }

  return '-'
}

/* =========================
   DECIMAL INPUT
========================= */
const toDecimalNumber = (value) => {
  const cleaned = String(value || '')
    .trim()
    .replace(',', '.')

  return Number(cleaned) || 0
}

/* =========================
   MONEY INPUT
========================= */
const toMoneyNumber = (value) => {
  const raw = String(value || '').trim()

  if (!raw) return 0

  if (raw.includes(',')) {
    return Number(raw.replace(/\./g, '').replace(',', '.')) || 0
  }

  const decimalPattern = /^\d+\.\d{1,2}$/

  if (decimalPattern.test(raw)) {
    return Number(raw) || 0
  }

  return Number(raw.replace(/\./g, '')) || 0
}

/* =========================
   SYMBOL ICON
========================= */
const getInvestmentIcon = (investment) => {
  const symbol = investment?.symbol?.toUpperCase()

  if (symbol === 'BTC') return '₿'
  if (symbol === 'ETH') return 'Ξ'
  if (symbol === 'SOL') return '◎'
  if (investment?.type === 'stock') return '📈'

  return symbol?.charAt(0) || '?'
}

/* =========================
   PROFIT / LOSS SUMMARY
========================= */
const isPortfolioProfit = computed(() => {
  return portfolioSummary.value.gain_loss >= 0
})

const portfolioProfitLossText = computed(() => {
  const gainLoss = portfolioSummary.value.gain_loss
  const percent = portfolioSummary.value.gain_loss_percent || 0
  const sign = gainLoss >= 0 ? '+' : '-'

  return `${sign}${formatRupiah(Math.abs(gainLoss))} (${sign}${Math.abs(percent).toFixed(2)}%)`
})

/* =========================
   FILTERED INVESTMENTS
========================= */
const filteredInvestments = computed(() => {
  if (selectedFilter.value === 'all') {
    return investments.value
  }

  return investments.value.filter((item) => item.type === selectedFilter.value)
})

/* =========================
   FETCH PORTFOLIO
   GET /investment/portfolio
========================= */
const fetchPortfolio = async () => {
  loadingPortfolio.value = true
  portfolioError.value = ''

  try {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE_URL}/investment/portfolio`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && {
          Authorization: `Bearer ${token}`
        })
      }
    })

    const data = await response.json()
    console.log('Portfolio data:', data)

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Gagal mengambil data portfolio')
    }

    portfolioCurrency.value = data.currency || 'idr'
    lastUpdate.value = data.last_update || '-'

    investments.value = Array.isArray(data.investments) ? data.investments : []

    portfolioSummary.value = {
      by_type: {
        crypto: data.summary?.by_type?.crypto || 0,
        stock: data.summary?.by_type?.stock || 0
      },
      gain_loss: data.summary?.gain_loss || 0,
      gain_loss_percent: data.summary?.gain_loss_percent || 0,
      total_cost: data.summary?.total_cost || 0,
      total_investments: data.summary?.total_investments || 0,
      total_value: data.summary?.total_value || 0
    }
  } catch (error) {
    console.error('Fetch portfolio error:', error)
    portfolioError.value = error.message
  } finally {
    loadingPortfolio.value = false
  }
}

/* =========================
   CREATE INVESTMENT
   POST /investment/
========================= */
const createInvestment = async () => {
  createError.value = ''
  createSuccess.value = ''

  if (!namaInvestasi.value.trim()) {
    createError.value = 'Nama investasi wajib diisi'
    return
  }

  if (!symbolInvestasi.value.trim()) {
    createError.value = 'Symbol investasi wajib diisi'
    return
  }

  if (!jumlahKepemilikan.value) {
    createError.value = 'Quantity wajib diisi'
    return
  }

  if (!averageCost.value) {
    createError.value = 'Average cost wajib diisi'
    return
  }

  if (!currentPrice.value) {
    createError.value = 'Current price wajib diisi'
    return
  }

  loadingCreate.value = true

  try {
    const token = localStorage.getItem('token')

    const payload = {
      name: namaInvestasi.value.trim(),
      symbol: symbolInvestasi.value.trim().toUpperCase(),
      type: jenisInvestasi.value === 'Crypto' ? 'crypto' : 'stock',
      quantity: toDecimalNumber(jumlahKepemilikan.value),
      average_cost: toMoneyNumber(averageCost.value),
      current_price: toMoneyNumber(currentPrice.value),
      currency: currency.value,
      exchange: exchange.value.trim(),
      notes: notes.value.trim()
    }

    console.log('Create investment payload:', payload)

    const response = await fetch(`${API_BASE_URL}/investment/`, {
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
      throw new Error(data.message || data.error || 'Gagal menambahkan investasi')
    }

    createSuccess.value = 'Investasi berhasil ditambahkan'

    resetModal()

    await fetchPortfolio()
  } catch (error) {
    console.error('Create investment error:', error)
    createError.value = error.message
  } finally {
    loadingCreate.value = false
  }
}

/* =========================
   FETCH DETAIL INVESTMENT
   GET /investment/:id
========================= */
const fetchInvestmentDetail = async (investmentId) => {
  loadingDetail.value = true
  detailError.value = ''
  updatePriceError.value = ''
  updatePriceSuccess.value = ''

  try {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE_URL}/investment/${investmentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && {
          Authorization: `Bearer ${token}`
        })
      }
    })

    const data = await response.json()
    console.log('Investment detail:', data)

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Gagal mengambil detail investasi')
    }

    selectedInvestment.value = data
    newPrice.value = data.current_price ? String(data.current_price) : ''
  } catch (error) {
    console.error('Fetch investment detail error:', error)
    detailError.value = error.message
  } finally {
    loadingDetail.value = false
  }
}

/* =========================
   OPEN DETAIL MODAL
========================= */
const openInvestmentDetail = async (investment) => {
  selectedInvestment.value = investment
  showDetailModal.value = true

  await fetchInvestmentDetail(investment.id)
}

/* =========================
   CLOSE DETAIL MODAL
========================= */
const closeDetailModal = () => {
  showDetailModal.value = false
  selectedInvestment.value = null
  detailError.value = ''
  updatePriceError.value = ''
  updatePriceSuccess.value = ''
  newPrice.value = ''
}

/* =========================
   OPEN BUY MODAL FROM CARD
========================= */
const openBuyModal = (investment) => {
  selectedBuyInvestment.value = investment

  buyQuantity.value = ''
  buyPrice.value = investment.current_price ? String(investment.current_price) : ''
  buyFee.value = ''
  buyCurrency.value = investment.currency || 'IDR'
  buyNotes.value = ''

  buyError.value = ''
  buySuccess.value = ''
  showBuyModal.value = true
}

/* =========================
   CLOSE BUY MODAL
========================= */
const closeBuyModal = () => {
  showBuyModal.value = false
  selectedBuyInvestment.value = null

  buyQuantity.value = ''
  buyPrice.value = ''
  buyFee.value = ''
  buyCurrency.value = 'IDR'
  buyNotes.value = ''
  buyError.value = ''
  buySuccess.value = ''
}

/* =========================
   UPDATE CURRENT PRICE
   PUT /investment/:id/price
========================= */
const updateCurrentPrice = async () => {
  updatePriceError.value = ''
  updatePriceSuccess.value = ''

  if (!selectedInvestment.value?.id) {
    updatePriceError.value = 'ID investasi tidak ditemukan'
    return
  }

  if (!newPrice.value) {
    updatePriceError.value = 'Harga baru wajib diisi'
    return
  }

  const price = toMoneyNumber(newPrice.value)

  if (price <= 0) {
    updatePriceError.value = 'Harga baru harus lebih dari 0'
    return
  }

  loadingUpdatePrice.value = true

  try {
    const token = localStorage.getItem('token')

    const payload = {
      new_price: price
    }

    console.log('Update price payload:', payload)

    const response = await fetch(`${API_BASE_URL}/investment/${selectedInvestment.value.id}/price`, {
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
    let data = null

    try {
      data = text ? JSON.parse(text) : null
    } catch (err) {
      console.warn('Response update price bukan JSON:', text)
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
        data?.error ||
        data?.detail ||
        text ||
        'Gagal update current price'
      )
    }

    updatePriceSuccess.value =
      data?.message ||
      data?.Message ||
      'Current price berhasil diupdate'

    await Promise.all([
      fetchInvestmentDetail(selectedInvestment.value.id),
      fetchPortfolio()
    ])
    showDetailModal.value = false
  } catch (error) {
    console.error('Update current price error:', error)
    updatePriceError.value = error.message
  } finally {
    loadingUpdatePrice.value = false
  }
}

/* =========================
   BUY INVESTMENT TRANSACTION
   POST /investment/transaction
========================= */
const buyInvestment = async () => {
  buyError.value = ''
  buySuccess.value = ''

  if (!selectedBuyInvestment.value?.id) {
    buyError.value = 'ID investasi tidak ditemukan'
    return
  }

  if (!buyQuantity.value) {
    buyError.value = 'Quantity beli wajib diisi'
    return
  }

  if (!buyPrice.value) {
    buyError.value = 'Harga beli wajib diisi'
    return
  }

  const quantity = toDecimalNumber(buyQuantity.value)
  const price = toMoneyNumber(buyPrice.value)
  const fee = toMoneyNumber(buyFee.value || '0')

  if (quantity <= 0) {
    buyError.value = 'Quantity harus lebih dari 0'
    return
  }

  if (price <= 0) {
    buyError.value = 'Harga harus lebih dari 0'
    return
  }

  loadingBuy.value = true

  try {
    const token = localStorage.getItem('token')

    const payload = {
      investment_id: selectedBuyInvestment.value.id,
      type: 'buy',
      quantity,
      price,
      fee,
      currency: buyCurrency.value,
      notes: buyNotes.value.trim()
    }

    console.log('Buy investment payload:', payload)

    const response = await fetch(`${API_BASE_URL}/investment/transaction`, {
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
      throw new Error(data.message || data.error || 'Gagal membeli investasi')
    }

    buySuccess.value = 'Transaksi buy berhasil ditambahkan'

    await fetchPortfolio()

    setTimeout(() => {
      closeBuyModal()
    }, 600)
  } catch (error) {
    console.error('Buy investment error:', error)
    buyError.value = error.message
  } finally {
    loadingBuy.value = false
  }
}

/* =========================
   DELETE INVESTMENT FROM CARD
   DELETE /investment/:id
========================= */
const deleteInvestmentFromCard = async (investment) => {
  deleteError.value = ''

  if (!investment?.id) {
    deleteError.value = 'ID investasi tidak ditemukan'
    return
  }

  loadingDeleteId.value = investment.id

  try {
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE_URL}/investment/${investment.id}`, {
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
      throw new Error(data?.message || data?.error || 'Gagal menghapus investasi')
    }

    if (selectedInvestment.value?.id === investment.id) {
      closeDetailModal()
    }

    await fetchPortfolio()
  } catch (error) {
    console.error('Delete investment error:', error)
    deleteError.value = error.message
  } finally {
    loadingDeleteId.value = null
  }
}

/* =========================
   RESET CREATE MODAL
========================= */
const resetModal = () => {
  showModal.value = false

  jenisInvestasi.value = 'Crypto'
  namaInvestasi.value = ''
  symbolInvestasi.value = ''
  jumlahKepemilikan.value = ''
  averageCost.value = ''
  currentPrice.value = ''
  currency.value = 'IDR'
  exchange.value = ''
  notes.value = ''

  createError.value = ''
  createSuccess.value = ''
}

/* =========================
   LIFECYCLE
========================= */
onMounted(() => {
  fetchPortfolio()
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
              <h1>Portofolio</h1>

              <button class="add-btn" @click="showModal = true">
                ＋ Tambah
              </button>
            </div>

            <div class="date-row">
              <p>Updated: {{ lastUpdate }}</p>
            </div>
          </div>
        </div>
      </div>

      <main class="content-scroll">
        <section class="portfolio-card">
          <p class="portfolio-label">
            Total Portfolio Value
          </p>

          <div v-if="loadingPortfolio" class="summary-loading">
            Mengambil data portfolio...
          </div>

          <div v-else>
            <h2>
              {{ formatRupiah(portfolioSummary.total_value) }}
            </h2>

            <div class="portfolio-info">
              <div>
                <span>Invested</span>
                <h4>
                  {{ formatRupiah(portfolioSummary.total_cost) }}
                </h4>
              </div>

              <div>
                <span>P/L</span>

                <h4 :class="isPortfolioProfit ? 'profit' : 'loss'">
                  {{ portfolioProfitLossText }}
                </h4>
              </div>

              <div>
                <span>Total Investasi</span>
                <h4>
                  {{ portfolioSummary.total_investments }} aset
                </h4>
              </div>
            </div>

            <div class="portfolio-type-row">
              <div class="type-summary-card">
                <span>Crypto</span>
                <h4>
                  {{ formatRupiah(portfolioSummary.by_type.crypto) }}
                </h4>
              </div>

              <div class="type-summary-card">
                <span>Saham</span>
                <h4>
                  {{ formatRupiah(portfolioSummary.by_type.stock) }}
                </h4>
              </div>
            </div>
          </div>

          <p v-if="portfolioError" class="summary-error">
            {{ portfolioError }}
          </p>

          <p v-if="deleteError" class="delete-error">
            {{ deleteError }}
          </p>
        </section>

        <div class="filter-row">
          <button
            class="filter"
            :class="{ active: selectedFilter === 'all' }"
            @click="selectedFilter = 'all'"
          >
            Semua
          </button>

          <button
            class="filter"
            :class="{ active: selectedFilter === 'crypto' }"
            @click="selectedFilter = 'crypto'"
          >
            Crypto
          </button>

          <button
            class="filter"
            :class="{ active: selectedFilter === 'stock' }"
            @click="selectedFilter = 'stock'"
          >
            Saham
          </button>
        </div>

        <section class="investment-list">
          <div v-if="loadingPortfolio" class="list-loading">
            Mengambil data investasi...
          </div>

          <div v-else-if="portfolioError" class="list-error">
            {{ portfolioError }}
          </div>

          <div v-else-if="filteredInvestments.length === 0" class="empty-card">
            Belum ada data investasi
          </div>

          <div
            v-for="investment in filteredInvestments"
            :key="investment.id"
            class="investment-card"
            @click="openInvestmentDetail(investment)"
          >
            <div class="investment-top">
              <div class="investment-left">
                <div
                  class="coin-icon"
                  :class="{ eth: investment.symbol?.toUpperCase() === 'ETH' }"
                >
                  {{ getInvestmentIcon(investment) }}
                </div>

                <div>
                  <div class="investment-title-row">
                    <h3>
                      {{ investment.symbol }}
                    </h3>

                    <span class="badge">
                      {{ investment.type === 'crypto' ? 'Crypto' : 'Saham' }}
                    </span>

                    <span v-if="investment.is_active" class="live">
                      ● LIVE
                    </span>
                  </div>

                  <p>
                    {{ investment.name }}
                  </p>
                </div>
              </div>

              <div class="investment-profit">
                <h3 :class="investment.gain_loss >= 0 ? 'profit' : 'loss'">
                  {{ investment.gain_loss >= 0 ? '+' : '-' }}{{ formatCurrency(Math.abs(investment.gain_loss || 0), investment.currency || 'IDR') }}
                </h3>

                <span :class="investment.gain_loss_percent >= 0 ? 'profit-percent' : 'loss-percent'">
                  {{ investment.gain_loss_percent >= 0 ? '+' : '-' }}{{ Math.abs(investment.gain_loss_percent || 0).toFixed(2) }}%
                </span>
              </div>
            </div>

            <div class="investment-bottom">
              <div class="detail-item">
                <p>Holdings</p>
                <h4>
                  {{ investment.quantity }} {{ investment.symbol }}
                </h4>
              </div>

              <div class="detail-item">
                <p>Value</p>
                <h4>
                  {{ formatCurrency(investment.total_value, investment.currency || 'IDR') }}
                </h4>
              </div>

              <div class="detail-item">
                <p>Avg Cost</p>
                <h4>
                  {{ formatCurrency(investment.average_cost, investment.currency || 'IDR') }}
                </h4>
              </div>

              <div class="detail-item">
                <p>Current</p>
                <h4>
                  {{ formatCurrency(investment.current_price, investment.currency || 'IDR') }}
                </h4>
              </div>
            </div>

            <!-- ACTION DI BAWAH CARD -->
            <div class="investment-card-actions">
              <button
                class="card-buy-btn"
                @click.stop="openBuyModal(investment)"
              >
                Buy Investment
              </button>

              <button
                class="card-delete-btn"
                :disabled="loadingDeleteId === investment.id"
                @click.stop="deleteInvestmentFromCard(investment)"
              >
                {{ loadingDeleteId === investment.id ? 'Menghapus...' : 'Delete Investment' }}
              </button>
            </div>
          </div>
        </section>
      </main>

      <!-- MODAL TAMBAH INVESTASI -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Tambah Investasi</h3>

            <button class="close-btn" @click="resetModal">
              ✕
            </button>
          </div>

          <div class="modal-section">
            <h4>Jenis Investasi</h4>

            <div class="type-grid">
              <button
                class="type-btn"
                :class="{ active: jenisInvestasi === 'Crypto' }"
                @click="jenisInvestasi = 'Crypto'"
              >
                Crypto
              </button>

              <button
                class="type-btn"
                :class="{ active: jenisInvestasi === 'Saham' }"
                @click="jenisInvestasi = 'Saham'"
              >
                Saham
              </button>
            </div>
          </div>

          <div class="modal-section">
            <h4>Nama Investasi</h4>

            <input
              v-model="namaInvestasi"
              type="text"
              class="input-field"
              placeholder="Contoh: Bitcoin"
            />
          </div>

          <div class="modal-section">
            <h4>Symbol Investasi</h4>

            <input
              v-model="symbolInvestasi"
              type="text"
              class="input-field"
              placeholder="Contoh: BTC"
            />
          </div>

          <div class="modal-section">
            <h4>Quantity</h4>

            <input
              v-model="jumlahKepemilikan"
              type="text"
              inputmode="decimal"
              class="input-field"
              placeholder="Contoh: 0.1"
            />
          </div>

          <div class="modal-section">
            <h4>Average Cost</h4>

            <input
              v-model="averageCost"
              type="text"
              inputmode="decimal"
              class="input-field"
              placeholder="Contoh: 50000"
            />
          </div>

          <div class="modal-section">
            <h4>Current Price</h4>

            <input
              v-model="currentPrice"
              type="text"
              inputmode="decimal"
              class="input-field"
              placeholder="Contoh: 65000"
            />
          </div>

          <div class="modal-section">
            <h4>Currency</h4>

            <select v-model="currency" class="input-field">
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div class="modal-section">
            <h4>Exchange</h4>

            <input
              v-model="exchange"
              type="text"
              class="input-field"
              placeholder="Contoh: Binance"
            />
          </div>

          <div class="modal-section">
            <h4>Notes</h4>

            <textarea
              v-model="notes"
              class="textarea-field"
              placeholder="Contoh: HODL mode"
            ></textarea>
          </div>

          <p v-if="createError" class="create-error">
            {{ createError }}
          </p>

          <p v-if="createSuccess" class="create-success">
            {{ createSuccess }}
          </p>

          <div class="action-row">
            <button
              class="save-btn"
              :disabled="loadingCreate"
              @click="createInvestment"
            >
              {{ loadingCreate ? 'Menyimpan...' : 'Simpan Investasi' }}
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL DETAIL INVESTASI -->
      <div v-if="showDetailModal" class="modal-overlay">
        <div class="modal-card detail-modal-card">
          <div class="modal-header">
            <h3>Detail Investasi</h3>

            <button class="close-btn" @click="closeDetailModal">
              ✕
            </button>
          </div>

          <div v-if="loadingDetail" class="detail-loading">
            Mengambil detail investasi...
          </div>

          <div v-else-if="detailError" class="detail-error">
            {{ detailError }}
          </div>

          <div v-else-if="selectedInvestment">
            <div class="detail-header-box">
              <div
                class="coin-icon detail-icon"
                :class="{ eth: selectedInvestment.symbol?.toUpperCase() === 'ETH' }"
              >
                {{ getInvestmentIcon(selectedInvestment) }}
              </div>

              <div>
                <h2>
                  {{ selectedInvestment.symbol }}
                </h2>

                <p>
                  {{ selectedInvestment.name }}
                </p>

                <span class="badge">
                  {{ selectedInvestment.type === 'crypto' ? 'Crypto' : 'Saham' }}
                </span>
              </div>
            </div>

            <div class="detail-data-list">
              <div class="detail-data-item">
                <span>ID</span>
                <strong>{{ selectedInvestment.id }}</strong>
              </div>

              <div class="detail-data-item">
                <span>Quantity</span>
                <strong>{{ selectedInvestment.quantity }} {{ selectedInvestment.symbol }}</strong>
              </div>

              <div class="detail-data-item">
                <span>Average Cost</span>
                <strong>{{ formatCurrency(selectedInvestment.average_cost, selectedInvestment.currency || 'IDR') }}</strong>
              </div>

              <div class="detail-data-item">
                <span>Current Price</span>
                <strong>{{ formatCurrency(selectedInvestment.current_price, selectedInvestment.currency || 'IDR') }}</strong>
              </div>

              <div class="detail-data-item">
                <span>Total Value</span>
                <strong>{{ formatCurrency(selectedInvestment.total_value, selectedInvestment.currency || 'IDR') }}</strong>
              </div>

              <div class="detail-data-item">
                <span>Total Cost</span>
                <strong>{{ formatCurrency(selectedInvestment.total_cost, selectedInvestment.currency || 'IDR') }}</strong>
              </div>

              <div class="detail-data-item">
                <span>Gain / Loss</span>
                <strong :class="selectedInvestment.gain_loss >= 0 ? 'profit' : 'loss'">
                  {{ selectedInvestment.gain_loss >= 0 ? '+' : '-' }}{{ formatCurrency(Math.abs(selectedInvestment.gain_loss || 0), selectedInvestment.currency || 'IDR') }}
                </strong>
              </div>

              <div class="detail-data-item">
                <span>Gain / Loss Percent</span>
                <strong :class="selectedInvestment.gain_loss_percent >= 0 ? 'profit' : 'loss'">
                  {{ selectedInvestment.gain_loss_percent >= 0 ? '+' : '-' }}{{ Math.abs(selectedInvestment.gain_loss_percent || 0).toFixed(2) }}%
                </strong>
              </div>

              <div class="detail-data-item">
                <span>Currency</span>
                <strong>{{ selectedInvestment.currency || '-' }}</strong>
              </div>

              <div class="detail-data-item">
                <span>Exchange</span>
                <strong>{{ selectedInvestment.exchange || '-' }}</strong>
              </div>

              <div class="detail-data-item">
                <span>Purchase Date</span>
                <strong>{{ getPurchaseDate(selectedInvestment) }}</strong>
              </div>

              <div class="detail-data-item">
                <span>Last Price Update</span>
                <strong>{{ formatDateTime(selectedInvestment.last_price_update) }}</strong>
              </div>

              <div class="detail-data-item">
                <span>Status</span>
                <strong>
                  {{ selectedInvestment.is_active ? 'Aktif' : 'Tidak Aktif' }}
                </strong>
              </div>

              <div class="detail-data-item">
                <span>Notes</span>
                <strong>{{ selectedInvestment.notes || '-' }}</strong>
              </div>
            </div>

            <!-- UPDATE PRICE TETAP DI MODAL DETAIL -->
            <div class="sub-form-card">
              <h3>Update Current Price</h3>

              <div class="modal-section">
                <h4>New Price</h4>

                <input
                  v-model="newPrice"
                  type="text"
                  inputmode="decimal"
                  class="input-field"
                  placeholder="Contoh: 67500.25"
                />
              </div>

              <p v-if="updatePriceError" class="delete-error">
                {{ updatePriceError }}
              </p>

              <p v-if="updatePriceSuccess" class="create-success">
                {{ updatePriceSuccess }}
              </p>

              <button
                class="update-price-btn"
                :disabled="loadingUpdatePrice"
                @click="updateCurrentPrice"
              >
                {{ loadingUpdatePrice ? 'Mengupdate...' : 'Update Current Price' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL BUY INVESTMENT -->
      <div v-if="showBuyModal" class="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Buy Investment</h3>

            <button class="close-btn" @click="closeBuyModal">
              ✕
            </button>
          </div>

          <div v-if="selectedBuyInvestment" class="buy-target-box">
            <h2>{{ selectedBuyInvestment.symbol }}</h2>
            <p>{{ selectedBuyInvestment.name }}</p>
            <span>{{ selectedBuyInvestment.type === 'crypto' ? 'Crypto' : 'Saham' }}</span>
          </div>

          <div class="modal-section">
            <h4>Quantity</h4>

            <input
              v-model="buyQuantity"
              type="text"
              inputmode="decimal"
              class="input-field"
              placeholder="Contoh: 0.5"
            />
          </div>

          <div class="modal-section">
            <h4>Price</h4>

            <input
              v-model="buyPrice"
              type="text"
              inputmode="decimal"
              class="input-field"
              placeholder="Contoh: 65000"
            />
          </div>

          <div class="modal-section">
            <h4>Fee</h4>

            <input
              v-model="buyFee"
              type="text"
              inputmode="decimal"
              class="input-field"
              placeholder="Contoh: 500"
            />
          </div>

          <div class="modal-section">
            <h4>Currency</h4>

            <select v-model="buyCurrency" class="input-field">
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div class="modal-section">
            <h4>Notes</h4>

            <textarea
              v-model="buyNotes"
              class="textarea-field"
              placeholder="Contoh: DCA Bitcoin mingguan"
            ></textarea>
          </div>

          <p v-if="buyError" class="delete-error">
            {{ buyError }}
          </p>

          <p v-if="buySuccess" class="create-success">
            {{ buySuccess }}
          </p>

          <button
            class="buy-submit-btn"
            :disabled="loadingBuy"
            @click="buyInvestment"
          >
            {{ loadingBuy ? 'Memproses...' : 'Simpan Buy Transaction' }}
          </button>
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
  font-weight: 800;
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

/* PORTFOLIO */
.portfolio-card {
  background: white;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.portfolio-label {
  color: #94a3b8;
  font-size: 24px;
}

.portfolio-card h2 {
  font-size: 46px;
  color: #1e293b;
  margin-top: 10px;
  margin-bottom: 0;
}

.portfolio-info {
  display: flex;
  gap: 44px;
  margin-top: 22px;
  flex-wrap: wrap;
}

.portfolio-info span {
  color: #94a3b8;
  font-size: 20px;
}

.portfolio-info h4 {
  margin-top: 6px;
  font-size: 22px;
}

.profit {
  color: #10b981 !important;
}

.loss {
  color: #ef4444 !important;
}

.portfolio-type-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  margin-top: 24px;
}

.type-summary-card {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 20px;
}

.type-summary-card span {
  color: #94a3b8;
  font-size: 18px;
}

.type-summary-card h4 {
  color: #1e293b;
  font-size: 24px;
  margin: 8px 0 0;
}

.summary-loading,
.list-loading,
.detail-loading {
  margin-top: 14px;
  font-size: 22px;
  color: #64748b;
}

.summary-error,
.list-error,
.create-error,
.delete-error,
.detail-error {
  margin-top: 14px;
  color: #ef4444;
  font-size: 18px;
  font-weight: 700;
}

.create-success {
  margin-top: 14px;
  color: #10b981;
  font-size: 18px;
  font-weight: 700;
}

/* FILTER */
.filter-row {
  display: flex;
  gap: 12px;
  margin: 24px 0;
}

.filter {
  border: none;
  background: white;
  color: #64748b;
  font-size: 22px;
  padding: 12px 18px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
}

.filter.active {
  background: #eef2ff;
  color: #4338ca;
}

/* INVESTMENT LIST */
.investment-list {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.empty-card {
  background: white;
  border-radius: 22px;
  padding: 28px;
  color: #64748b;
  font-size: 22px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.investment-card {
  background: white;
  border-radius: 22px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  cursor: pointer;
  transition: 0.2s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.investment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
}

/* TOP INVESTMENT */
.investment-top {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 22px;
}

.investment-left {
  display: flex;
  align-items: center;
  gap: 18px;
}

.investment-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.investment-title-row h3 {
  margin: 0;
  font-size: 28px;
  color: #1e293b;
}

.investment-left p {
  margin-top: 6px;
  color: #64748b;
  font-size: 22px;
}

.investment-profit {
  text-align: right;
}

.investment-profit h3 {
  margin: 0;
  font-size: 24px;
}

.profit-percent {
  display: block;
  color: #10b981;
  font-size: 18px;
  font-weight: 700;
}

.loss-percent {
  display: block;
  color: #ef4444;
  font-size: 18px;
  font-weight: 700;
}

/* BOTTOM INVESTMENT */
.investment-bottom {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.detail-item {
  background: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-item p {
  margin: 0;
  font-size: 20px;
  color: #94a3b8;
}

.detail-item h4 {
  margin: 0;
  font-size: 20px;
  color: #1e293b;
  font-weight: 800;
  text-align: right;
}

/* ACTION CARD */
.investment-card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  padding-top: 18px;
  border-top: 1px solid #e5e7eb;
}

.card-buy-btn,
.card-delete-btn {
  width: 100%;
  height: 56px;
  border: none;
  border-radius: 14px;
  color: white;
  font-size: 20px;
  font-weight: 800;
  cursor: pointer;
}

.card-buy-btn {
  background: #10b981;
}

.card-delete-btn {
  background: #ef4444;
}

.card-buy-btn:hover,
.card-delete-btn:hover {
  opacity: 0.9;
}

.card-delete-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.coin-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #fef3c7;
  color: #b45309;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 800;
  font-size: 26px;
}

.eth {
  background: #ede9fe;
  color: #6d28d9;
}

.badge {
  background: #f1f5f9;
  color: #64748b;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 700;
}

.live {
  color: #10b981;
  font-size: 15px;
  font-weight: 700;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  font-family: 'Inter', sans-serif;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
}

.modal-card {
  width: 620px;
  max-height: 92vh;
  overflow-y: auto;
  background: white;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  animation: popup 0.2s ease;
}

.detail-modal-card {
  width: 760px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 22px;
  margin: -28px -28px 26px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 32px;
  color: #1e293b;
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
  font-size: 24px;
  cursor: pointer;
}

.modal-section {
  margin-bottom: 22px;
}

.modal-section h4 {
  margin-bottom: 10px;
  color: #1e293b;
  font-size: 20px;
}

.input-field {
  width: 100%;
  height: 60px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px;
  font-size: 20px;
  outline: none;
  box-sizing: border-box;
  background: white;
}

.textarea-field {
  width: 100%;
  min-height: 110px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px;
  font-size: 20px;
  outline: none;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
  resize: vertical;
}

/* TYPE */
.type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.type-btn {
  height: 60px;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 800;
  font-size: 22px;
  transition: 0.2s ease;
}

.type-btn:first-child {
  background: #fff7ed;
  color: #ea580c;
}

.type-btn:first-child.active {
  background: #f97316;
  color: white;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25);
}

.type-btn:last-child {
  background: #eff6ff;
  color: #2563eb;
}

.type-btn:last-child.active {
  background: #2563eb;
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

/* ACTION */
.action-row {
  display: flex;
  gap: 16px;
  margin-top: 30px;
}

.save-btn {
  flex: 1;
  height: 60px;
  border: none;
  background: #4f46e5;
  color: white;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 800;
  font-size: 22px;
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* DETAIL MODAL */
.detail-header-box {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 18px;
  margin-bottom: 22px;
}

.detail-icon {
  width: 72px;
  height: 72px;
  font-size: 30px;
}

.detail-header-box h2 {
  margin: 0;
  font-size: 36px;
  color: #1e293b;
}

.detail-header-box p {
  margin: 4px 0 8px;
  color: #64748b;
  font-size: 22px;
}

.detail-data-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-data-item {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 18px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
}

.detail-data-item span {
  color: #64748b;
  font-size: 20px;
}

.detail-data-item strong {
  color: #1e293b;
  font-size: 20px;
  text-align: right;
  word-break: break-word;
}

.sub-form-card {
  margin-top: 26px;
  padding: 22px;
  background: #f8fafc;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
}

.sub-form-card h3 {
  margin: 0 0 18px;
  font-size: 26px;
  color: #1e293b;
}

.update-price-btn,
.buy-submit-btn {
  width: 100%;
  height: 58px;
  border: none;
  border-radius: 14px;
  color: white;
  cursor: pointer;
  font-size: 21px;
  font-weight: 800;
}

.update-price-btn {
  background: #2563eb;
}

.buy-submit-btn {
  background: #10b981;
}

.update-price-btn:disabled,
.buy-submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.buy-target-box {
  background: #f8fafc;
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 24px;
}

.buy-target-box h2 {
  margin: 0;
  color: #1e293b;
  font-size: 34px;
}

.buy-target-box p {
  margin: 6px 0;
  color: #64748b;
  font-size: 22px;
}

.buy-target-box span {
  display: inline-block;
  background: #eef2ff;
  color: #4338ca;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 16px;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .main-wrapper {
    margin-left: 0;
  }

  .topbar {
    left: 0;
    width: 100%;
  }

  .add-btn {
    margin-right: 0;
    width: 240px;
    font-size: 18px;
  }

  .investment-card {
    flex-direction: column;
    gap: 24px;
  }

  .portfolio-type-row {
    grid-template-columns: 1fr;
  }

  .modal-card,
  .detail-modal-card {
    width: 92%;
  }

  .detail-data-item {
    flex-direction: column;
    gap: 6px;
  }

  .detail-data-item strong {
    text-align: left;
  }

  .investment-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .investment-profit {
    text-align: left;
  }

  .investment-card-actions {
    grid-template-columns: 1fr;
  }
}
</style>