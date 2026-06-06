<script setup>
import { ref, computed, onMounted } from "vue";
import UserSidebar from "@/components/UserSideBar.vue";

import iconMakanan from "@/assets/User/icon-makanan.svg";
import iconTransportasi from "@/assets/User/icon-transportasi.svg";
import iconHiburan from "@/assets/User/icon-hiburan.svg";
import iconBelanja from "@/assets/User/icon-belanja.svg";
import iconTagihan from "@/assets/User/icon-tagihan.svg";
import iconKesehatan from "@/assets/User/icon-kesehatan.svg";
import iconInvestasi from "@/assets/User/icon-investasi.svg";
import iconPemasukan from "@/assets/User/icon-pemasukan.svg";
import iconLainnya from "@/assets/User/icon-lainya.svg";

const API_BASE = "http://localhost:8000";

/* =========================
   MODAL TAMBAH STATE
========================= */
const showModal = ref(false);
const amount = ref("");
const deskripsi = ref("");
const akun = ref("");
const selectedCategory = ref("");
const transactionType = ref("expense");
const savingTransaction = ref(false);
const saveError = ref("");

/* =========================
   MODAL DETAIL / EDIT / DELETE STATE
========================= */
const showDetailModal = ref(false);
const selectedTransaction = ref(null);
const editAmount = ref("");
const updatingTransaction = ref(false);
const deletingTransaction = ref(false);
const detailError = ref("");
const detailSuccess = ref("");

/* =========================
   CUSTOM DELETE ALERT STATE
========================= */
const showDeleteAlert = ref(false);

const openDeleteAlert = () => {
  detailError.value = "";

  if (!selectedTransaction.value) {
    detailError.value = "Transaksi tidak ditemukan";
    return;
  }

  showDeleteAlert.value = true;
};

const closeDeleteAlert = () => {
  if (deletingTransaction.value) return;
  showDeleteAlert.value = false;
};

/* =========================
   MONTH FILTER
========================= */
const currentYear = new Date().getFullYear();

const selectedMonthFilter = ref(
  new Date().toLocaleString("en-US", { month: "long" })
);

const loadingSummary = ref(false);
const summaryError = ref("");

const summary = ref({
  income: 0,
  outcome: 0,
  net: 0,
});

const months = [
  { label: "Jan", value: "January", idLabel: "Januari", monthNumber: "01" },
  { label: "Feb", value: "February", idLabel: "Februari", monthNumber: "02" },
  { label: "Mar", value: "March", idLabel: "Maret", monthNumber: "03" },
  { label: "Apr", value: "April", idLabel: "April", monthNumber: "04" },
  { label: "Mei", value: "May", idLabel: "Mei", monthNumber: "05" },
  { label: "Jun", value: "June", idLabel: "Juni", monthNumber: "06" },
  { label: "Jul", value: "July", idLabel: "Juli", monthNumber: "07" },
  { label: "Agu", value: "August", idLabel: "Agustus", monthNumber: "08" },
  { label: "Sep", value: "September", idLabel: "September", monthNumber: "09" },
  { label: "Okt", value: "October", idLabel: "Oktober", monthNumber: "10" },
  { label: "Nov", value: "November", idLabel: "November", monthNumber: "11" },
  { label: "Des", value: "December", idLabel: "Desember", monthNumber: "12" },
];

const selectedMonthObject = computed(() => {
  return months.find((month) => month.value === selectedMonthFilter.value);
});

const selectedMonthKey = computed(() => {
  if (!selectedMonthObject.value) return "";
  return `${currentYear}-${selectedMonthObject.value.monthNumber}`;
});

const formatSelectedMonthYear = computed(() => {
  if (!selectedMonthObject.value) return `${currentYear}`;
  return `${selectedMonthObject.value.idLabel} ${currentYear}`;
});

/* =========================
   FORMAT CURRENCY
========================= */
const formatCurrency = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(number));
};

const cleanAmount = (value) => {
  return Number(String(value || "").replace(/\D/g, "")) || 0;
};

const formatRupiah = (value) => {
  const number = String(value || "").replace(/\D/g, "");
  return new Intl.NumberFormat("id-ID").format(Number(number || 0));
};

const formattedIncome = computed(() => {
  return formatCurrency(summary.value.income);
});

const formattedOutcome = computed(() => {
  return formatCurrency(summary.value.outcome);
});

const formattedNet = computed(() => {
  const net = Number(summary.value.net || 0);

  if (net > 0) {
    return `+${formatCurrency(net)}`;
  }

  if (net < 0) {
    return `-${formatCurrency(net)}`;
  }

  return formatCurrency(net);
});

const netClass = computed(() => {
  const net = Number(summary.value.net || 0);

  if (net < 0) return "expense";
  return "income";
});

/* =========================
   FETCH MONTHLY SUMMARY
   Backend pakai nama bulan: June, July, dst
========================= */
const fetchMonthlySummary = async () => {
  loadingSummary.value = true;
  summaryError.value = "";

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE}/transaction/getMonthly?month=${encodeURIComponent(
        selectedMonthFilter.value
      )}`,
      {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(
        data.Error ||
          data.error ||
          data.message ||
          "Gagal mengambil data summary"
      );
    }

    summary.value = {
      income: data.Message?.income || 0,
      outcome: data.Message?.outcome || 0,
      net: data.Message?.net || 0,
    };
  } catch (error) {
    console.error(error);
    summaryError.value =
      error.message || "Terjadi kesalahan saat mengambil data summary";
  } finally {
    loadingSummary.value = false;
  }
};

const changeMonth = async (monthValue) => {
  selectedMonthFilter.value = monthValue;
  selectedFilterCategory.value = "All";

  await Promise.all([fetchMonthlySummary(), fetchTransactions()]);
};

/* =========================
   FETCH LIST TRANSAKSI
========================= */
const transactions = ref([]);
const loadingTransactions = ref(false);
const transactionError = ref("");
const selectedFilterCategory = ref("All");

const categoryNameMap = {
  food: "Makanan",
  transport: "Transportasi",
  shopping: "Belanja",
  bills: "Tagihan",
  health: "Kesehatan",
  entertainment: "Hiburan",
  education: "Edukasi",
  investment: "Investasi",

  // Kategori pemasukan hanya memakai satu kategori:
  // category yang dikirim ke backend: "pendapatan".
  income: "Pendapatan",
  gaji: "Pendapatan",
  salary: "Pendapatan",
  pendapatan: "Pendapatan",
  revenue: "Pendapatan",

  other: "Lainnya",
};

const categoryIconMap = {
  food: iconMakanan,
  transport: iconTransportasi,
  shopping: iconBelanja,
  bills: iconTagihan,
  health: iconKesehatan,
  entertainment: iconHiburan,
  education: iconLainnya,
  investment: iconInvestasi,

  income: iconPemasukan,
  gaji: iconPemasukan,
  salary: iconPemasukan,
  pendapatan: iconPemasukan,
  revenue: iconPemasukan,

  other: iconLainnya,
};

const getCategoryLabel = (category) => {
  return categoryNameMap[category] || category || "Lainnya";
};

const getCategoryIcon = (category) => {
  return categoryIconMap[category] || iconLainnya;
};

const getTransactionId = (item) => {
  return item?.id || item?._id || item?.ID || item?.transaction_id || "";
};

const getTransactionTimestamp = (item) => {
  const dateValue =
    item?.date ||
    item?.created_at ||
    item?.createdAt ||
    item?.updated_at ||
    item?.updatedAt;

  if (!dateValue || String(dateValue).startsWith("0001-01-01")) return 0;

  const timestamp = new Date(dateValue).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const formatTransactionTime = (dateValue) => {
  if (!dateValue || String(dateValue).startsWith("0001-01-01")) return "-";

  return new Date(dateValue).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTransactionDate = (dateValue) => {
  if (!dateValue || String(dateValue).startsWith("0001-01-01")) return "-";

  return new Date(dateValue).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatTransactionAmount = (amountValue, type) => {
  const formatted = formatCurrency(amountValue);

  if (type === "income") {
    return `+${formatted}`;
  }

  if (type === "expense") {
    return `-${formatted}`;
  }

  return formatted;
};

/* =========================
   NORMALIZE MONTH KEY
   Request add: "June"
   Response BE: "2026-06"
   Filter FE: "2026-06"
========================= */
const normalizeMonthToKey = (monthValue, fallbackYear = currentYear) => {
  if (!monthValue) return "";

  const raw = String(monthValue).trim();

  // Response BE: 2026-06
  if (/^\d{4}-\d{2}$/.test(raw)) {
    return raw;
  }

  // Jaga-jaga kalau BE return 2026-6
  if (/^\d{4}-\d{1}$/.test(raw)) {
    const [year, month] = raw.split("-");
    return `${year}-${String(month).padStart(2, "0")}`;
  }

  const lower = raw.toLowerCase();

  // Request / kemungkinan response: June, june, Jun, Juni
  const foundMonth = months.find((month) => {
    return (
      month.value.toLowerCase() === lower ||
      month.idLabel.toLowerCase() === lower ||
      month.label.toLowerCase() === lower
    );
  });

  if (foundMonth) {
    return `${fallbackYear}-${foundMonth.monthNumber}`;
  }

  return "";
};

const getTransactionMonthKey = (item) => {
  // PRIORITAS UTAMA:
  // Pakai field month dari backend.
  // Kalau backend balik "2026-06", langsung cocok.
  // Kalau backend balik "June", dinormalisasi jadi "2026-06".
  if (item?.month) {
    const yearFromDate =
      item?.date && !String(item.date).startsWith("0001-01-01")
        ? new Date(item.date).getFullYear()
        : currentYear;

    const normalizedMonth = normalizeMonthToKey(item.month, yearFromDate);

    if (normalizedMonth) {
      return normalizedMonth;
    }
  }

  // Kalau backend punya month_key
  if (item?.month_key) {
    const normalizedMonth = normalizeMonthToKey(item.month_key, currentYear);

    if (normalizedMonth) {
      return normalizedMonth;
    }
  }

  // Fallback terakhir ke date
  if (item?.date && !String(item.date).startsWith("0001-01-01")) {
    const date = new Date(item.date);

    if (!Number.isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");

      return `${year}-${month}`;
    }
  }

  if (item?.created_at && !String(item.created_at).startsWith("0001-01-01")) {
    const date = new Date(item.created_at);

    if (!Number.isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");

      return `${year}-${month}`;
    }
  }

  return "";
};

const monthFilteredTransactions = computed(() => {
  return transactions.value.filter((item) => {
    return getTransactionMonthKey(item) === selectedMonthKey.value;
  });
});

const transactionCategories = computed(() => {
  const uniqueCategories = [
    ...new Set(monthFilteredTransactions.value.map((item) => item.category)),
  ];

  return [
    { label: "All", value: "All" },
    ...uniqueCategories.map((category) => ({
      label: getCategoryLabel(category),
      value: category,
    })),
  ];
});

const filteredTransactions = computed(() => {
  let result = [];

  if (selectedFilterCategory.value === "All") {
    result = [...monthFilteredTransactions.value];
  } else {
    result = monthFilteredTransactions.value.filter(
      (item) => item.category === selectedFilterCategory.value
    );
  }

  return result.sort((a, b) => {
    return getTransactionTimestamp(b) - getTransactionTimestamp(a);
  });
});

const fetchTransactions = async () => {
  loadingTransactions.value = true;
  transactionError.value = "";

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/transaction/`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    console.log("Fetch Transactions Response:", data);

    if (!response.ok) {
      throw new Error(
        data.Error ||
          data.error ||
          data.message ||
          "Gagal mengambil data transaksi"
      );
    }

    const fetchedTransactions =
      data["Transaction Retrieved Successfully!!"] ||
      data.Message ||
      data.transactions ||
      data.data ||
      [];

    transactions.value = Array.isArray(fetchedTransactions)
      ? fetchedTransactions
      : [];

    return transactions.value;
  } catch (error) {
    console.error(error);
    transactionError.value =
      error.message || "Terjadi kesalahan saat mengambil transaksi";

    return [];
  } finally {
    loadingTransactions.value = false;
  }
};

/* =========================
   CATEGORY MODAL
========================= */
const expenseCategories = [
  { name: "Makanan", value: "food", icon: iconMakanan },
  { name: "Transportasi", value: "transport", icon: iconTransportasi },
  { name: "Belanja", value: "shopping", icon: iconBelanja },
  { name: "Tagihan", value: "bills", icon: iconTagihan },
  { name: "Kesehatan", value: "health", icon: iconKesehatan },
  { name: "Hiburan", value: "entertainment", icon: iconHiburan },
  { name: "Investasi", value: "investment", icon: iconInvestasi },
  { name: "Lainnya", value: "other", icon: iconLainnya },
];

const incomeCategories = [
  { name: "Pendapatan", value: "pendapatan", icon: iconPemasukan },
];

const categoryList = computed(() => {
  return transactionType.value === "income"
    ? incomeCategories
    : expenseCategories;
});

const setTransactionType = (type) => {
  transactionType.value = type;
  selectedCategory.value = "";
};

/* =========================
   RESET MODAL TAMBAH
========================= */
const resetModal = () => {
  amount.value = "";
  deskripsi.value = "";
  akun.value = "";
  selectedCategory.value = "";
  transactionType.value = "expense";
  saveError.value = "";
  savingTransaction.value = false;
  showModal.value = false;
};

/* =========================
   SIMPAN TRANSAKSI BARU
   POST /transaction/new
========================= */
const saveTransaction = async () => {
  saveError.value = "";

  if (!amount.value) {
    saveError.value = "Jumlah transaksi wajib diisi";
    return;
  }

  if (!selectedCategory.value) {
    saveError.value = "Kategori wajib dipilih";
    return;
  }

  if (!deskripsi.value.trim()) {
    saveError.value = "Deskripsi wajib diisi";
    return;
  }

  if (!selectedMonthFilter.value) {
    saveError.value = "Bulan transaksi tidak valid";
    return;
  }

  savingTransaction.value = true;

  try {
    const token = localStorage.getItem("token");

    const payload = {
      amount: cleanAmount(amount.value),
      category: selectedCategory.value,
      description: deskripsi.value.trim(),
      account_id: akun.value.trim(),
      type: transactionType.value,
      month: selectedMonthFilter.value,
    };

    console.log("Create Transaction Payload:", payload);

    const response = await fetch(`${API_BASE}/transaction/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(
        data.Error ||
          data.error ||
          data.message ||
          "Gagal menambahkan transaksi"
      );
    }

    resetModal();

    await fetchTransactions();
    await fetchMonthlySummary();
  } catch (error) {
    console.error(error);
    saveError.value =
      error.message || "Terjadi kesalahan saat menambahkan transaksi";
  } finally {
    savingTransaction.value = false;
  }
};

/* =========================
   OPEN DETAIL TRANSAKSI
========================= */
const openTransactionDetail = (item) => {
  selectedTransaction.value = item;
  editAmount.value = formatRupiah(String(item.amount || 0));
  detailError.value = "";
  detailSuccess.value = "";
  showDetailModal.value = true;
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedTransaction.value = null;
  editAmount.value = "";
  detailError.value = "";
  detailSuccess.value = "";
  updatingTransaction.value = false;
  deletingTransaction.value = false;
};

/* =========================
   UPDATE AMOUNT TRANSAKSI
   PATCH /transaction/update/:id
========================= */
const updateTransactionAmount = async () => {
  detailError.value = "";
  detailSuccess.value = "";

  if (!selectedTransaction.value) {
    detailError.value = "Transaksi tidak ditemukan";
    return;
  }

  const transactionId = getTransactionId(selectedTransaction.value);

  if (!transactionId) {
    detailError.value = "ID transaksi tidak ditemukan";
    return;
  }

  if (!editAmount.value) {
    detailError.value = "Amount wajib diisi";
    return;
  }

  const newAmount = cleanAmount(editAmount.value);

  if (newAmount <= 0) {
    detailError.value = "Amount harus lebih dari 0";
    return;
  }

  updatingTransaction.value = true;

  try {
    const token = localStorage.getItem("token");

    const payload = {
      amount: newAmount,
    };

    const response = await fetch(
      `${API_BASE}/transaction/update/${transactionId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      }
    );

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(
        data.Error ||
          data.error ||
          data.message ||
          "Gagal mengupdate transaksi"
      );
    }

    detailSuccess.value = "Total transaksi berhasil diupdate";

    await fetchTransactions();
    await fetchMonthlySummary();

    setTimeout(() => {
      closeDetailModal();
    }, 700);
  } catch (error) {
    console.error(error);
    detailError.value =
      error.message || "Terjadi kesalahan saat mengupdate transaksi";
  } finally {
    updatingTransaction.value = false;
  }
};

/* =========================
   DELETE TRANSAKSI
   DELETE /transaction/delete/:id
========================= */
const deleteTransaction = async () => {
  detailError.value = "";
  detailSuccess.value = "";

  if (!selectedTransaction.value) {
    detailError.value = "Transaksi tidak ditemukan";
    return;
  }

  const transactionId = getTransactionId(selectedTransaction.value);

  if (!transactionId) {
    detailError.value = "ID transaksi tidak ditemukan";
    return;
  }

  deletingTransaction.value = true;

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE}/transaction/delete/${transactionId}`,
      {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(
        data.Error ||
          data.error ||
          data.message ||
          "Gagal menghapus transaksi"
      );
    }

    await fetchTransactions();
    await fetchMonthlySummary();

    showDeleteAlert.value = false;
    closeDetailModal();
  } catch (error) {
    console.error(error);
    detailError.value =
      error.message || "Terjadi kesalahan saat menghapus transaksi";
    showDeleteAlert.value = false;
  } finally {
    deletingTransaction.value = false;
  }
};

onMounted(() => {
  fetchMonthlySummary();
  fetchTransactions();
});
</script>

<template>
  <div class="page">
    <UserSidebar />

    <main class="main-content">
      <div class="topbar">
        <div class="top-header">
          <div class="title-area">
            <div class="title-row">
              <h1>Transaksi</h1>

              <div class="topbar-actions">
                <button class="add-btn" @click="showModal = true">
                  ＋ Tambah
                </button>
              </div>
            </div>

            <div class="month-row">
              <button
                v-for="month in months"
                :key="month.value"
                class="month-btn"
                :class="{ active: selectedMonthFilter === month.value }"
                @click="changeMonth(month.value)"
              >
                {{ month.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="summaryError" class="error-box">
        {{ summaryError }}
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <p>Pemasukan</p>

          <h2 class="income">
            {{ formattedIncome }}
          </h2>
        </div>

        <div class="summary-card">
          <p>Pengeluaran</p>

          <h2 class="expense">
            {{ formattedOutcome }}
          </h2>
        </div>

        <div class="summary-card">
          <p>Selisih</p>

          <h2 :class="netClass">
            {{ formattedNet }}
          </h2>
        </div>
      </div>

      <div class="category-filter">
        <button
          v-for="category in transactionCategories"
          :key="category.value"
          :class="{ active: selectedFilterCategory === category.value }"
          @click="selectedFilterCategory = category.value"
        >
          {{ category.label }}
        </button>
      </div>

      <div class="transaction-wrapper">
        <div class="date-label">
          Daftar Transaksi {{ formatSelectedMonthYear }}
        </div>

        <div v-if="loadingTransactions" class="empty-state">
          Loading transaksi...
        </div>

        <div v-else-if="transactionError" class="empty-state error-text">
          {{ transactionError }}
        </div>

        <div v-else-if="filteredTransactions.length === 0" class="empty-state">
          Tidak ada transaksi pada bulan ini.
        </div>

        <div
          v-else
          v-for="item in filteredTransactions"
          :key="getTransactionId(item)"
          class="transaction-item"
          @click="openTransactionDetail(item)"
        >
          <div class="left">
            <div class="icon-circle">
              <img
                :src="getCategoryIcon(item.category)"
                :alt="getCategoryLabel(item.category)"
                class="transaction-icon-img"
              />
            </div>

            <div>
              <h4>{{ item.description }}</h4>

              <p>
                {{ getCategoryLabel(item.category) }} •
                {{ formatTransactionDate(item.date || item.created_at) }}
              </p>
            </div>
          </div>

          <div class="right">
            <h4
              :class="{
                green: item.type === 'income',
                red: item.type === 'expense'
              }"
            >
              {{ formatTransactionAmount(item.amount, item.type) }}
            </h4>

            <p>{{ formatTransactionTime(item.date || item.created_at) }}</p>
          </div>
        </div>
      </div>

      <div v-if="showModal" class="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Tambah Transaksi</h3>

            <button class="close-btn" @click="resetModal">
              ✕
            </button>
          </div>

          <div class="selected-month-box">
            Transaksi akan masuk ke bulan:
            <strong>{{ formatSelectedMonthYear }}</strong>
            <br />
          </div>

          <div class="amount-box">
            <p>Jumlah</p>

            <div
              class="amount-input-wrapper"
              :class="{ filled: amount.length > 0 }"
            >
              <span>Rp</span>

              <input
                type="text"
                v-model="amount"
                @input="amount = formatRupiah(amount)"
                class="amount-input"
                placeholder="0"
              />
            </div>
          </div>

          <div class="transaction-type">
            <button
              type="button"
              class="type-btn"
              :class="{ 'active-expense': transactionType === 'expense' }"
              @click="setTransactionType('expense')"
            >
              ↘ Pengeluaran
            </button>

            <button
              type="button"
              class="type-btn"
              :class="{ 'active-income': transactionType === 'income' }"
              @click="setTransactionType('income')"
            >
              ↗ Pemasukan
            </button>
          </div>

          <div class="modal-section">
            <h4>Kategori</h4>

            <div class="category-grid">
              <div
                v-for="item in categoryList"
                :key="item.value"
                class="category-item"
                :class="{ 'active-category': selectedCategory === item.value }"
                @click="selectedCategory = item.value"
              >
                <span
                  class="category-icon"
                  :class="{ 'income-icon': transactionType === 'income' }"
                >
                  <img
                    :src="item.icon"
                    :alt="item.name"
                    class="category-icon-img"
                  />
                </span>

                <p>{{ item.name }}</p>
              </div>
            </div>
          </div>

          <div class="modal-section">
            <h4>Deskripsi</h4>

            <input
              v-model="deskripsi"
              type="text"
              placeholder="Contoh: Dinner"
              class="input-field"
            />
          </div>

          <p v-if="saveError" class="save-error">
            {{ saveError }}
          </p>

          <button
            class="save-btn"
            :disabled="savingTransaction"
            @click="saveTransaction"
          >
            {{ savingTransaction ? "Menyimpan..." : "Simpan Transaksi" }}
          </button>
        </div>
      </div>

      <div v-if="showDetailModal" class="modal-overlay">
        <div class="modal-card detail-modal">
          <div class="modal-header">
            <h3>Detail Transaksi</h3>

            <button class="close-btn" @click="closeDetailModal">
              ✕
            </button>
          </div>

          <div v-if="selectedTransaction" class="detail-content">
            <div class="detail-top">
              <div class="icon-circle detail-icon">
                <img
                  :src="getCategoryIcon(selectedTransaction.category)"
                  :alt="getCategoryLabel(selectedTransaction.category)"
                  class="transaction-icon-img"
                />
              </div>

              <div>
                <h4>{{ selectedTransaction.description }}</h4>

                <p>
                  {{ getCategoryLabel(selectedTransaction.category) }} •
                  {{
                    selectedTransaction.type === "income"
                      ? "Pemasukan"
                      : "Pengeluaran"
                  }}
                </p>
              </div>
            </div>

            <div class="detail-info-grid">
              <div>
                <p>Tanggal</p>

                <h4>
                  {{
                    formatTransactionDate(
                      selectedTransaction.date || selectedTransaction.created_at
                    )
                  }}
                </h4>
              </div>

              <div>
                <p>Waktu</p>

                <h4>
                  {{
                    formatTransactionTime(
                      selectedTransaction.date || selectedTransaction.created_at
                    )
                  }}
                </h4>
              </div>
            </div>

            <div class="amount-box edit-amount-box">
              <p>Total</p>

              <div
                class="amount-input-wrapper"
                :class="{ filled: editAmount.length > 0 }"
              >
                <span>Rp</span>

                <input
                  type="text"
                  v-model="editAmount"
                  @input="editAmount = formatRupiah(editAmount)"
                  class="amount-input"
                  placeholder="0"
                />
              </div>
            </div>

            <p v-if="detailError" class="save-error">
              {{ detailError }}
            </p>

            <p v-if="detailSuccess" class="success-text">
              {{ detailSuccess }}
            </p>

            <div class="detail-actions">
              <button
                class="delete-btn"
                :disabled="deletingTransaction || updatingTransaction"
                @click="openDeleteAlert"
              >
                Hapus Transaksi
              </button>

              <button
                class="update-btn"
                :disabled="updatingTransaction || deletingTransaction"
                @click="updateTransactionAmount"
              >
                {{ updatingTransaction ? "Mengupdate..." : "Perbarui Total" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showDeleteAlert" class="custom-alert-overlay">
        <div class="custom-alert-card">
          <div class="custom-alert-icon">
            !
          </div>

          <h3>Hapus Transaksi?</h3>

          <p>
            Transaksi
            <strong>
              {{ selectedTransaction?.description || "ini" }}
            </strong>
            akan dihapus permanen dan tidak bisa dikembalikan.
          </p>

          <div class="custom-alert-detail" v-if="selectedTransaction">
            <span>
              {{ getCategoryLabel(selectedTransaction.category) }}
            </span>

            <strong
              :class="{
                green: selectedTransaction.type === 'income',
                red: selectedTransaction.type === 'expense'
              }"
            >
              {{
                formatTransactionAmount(
                  selectedTransaction.amount,
                  selectedTransaction.type
                )
              }}
            </strong>
          </div>

          <div class="custom-alert-actions">
            <button
              class="alert-cancel-btn"
              :disabled="deletingTransaction"
              @click="closeDeleteAlert"
            >
              Batal
            </button>

            <button
              class="alert-delete-btn"
              :disabled="deletingTransaction"
              @click="deleteTransaction"
            >
              {{ deletingTransaction ? "Menghapus..." : "Hapus" }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  background: #f5f6fa;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
}

.main-content {
  flex: 1;
  padding: 28px;
  margin-left: 300px;
  padding-top: 220px;
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

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-right: 70px;
}

.add-btn {
  width: 300px;
  height: 50px;
  background: #4f46e5;
  color: white;
  border: none;
  padding: 12px 18px;
  margin: 0;
  border-radius: 14px;
  cursor: pointer;
  font-size: 20px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
  transition: 0.2s ease;
}

.add-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.month-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 30px;
  margin-bottom: 16px;
}

.month-btn {
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #2563eb;
  padding: 9px 16px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
  transition: 0.2s ease;
}

.month-btn:hover {
  background: #dbeafe;
  color: #1d4ed8;
  border-color: #93c5fd;
  transform: translateY(-1px);
}

.month-btn.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.error-box {
  background: #fee2e2;
  color: #b91c1c;
  padding: 14px 18px;
  border-radius: 14px;
  margin-bottom: 18px;
  font-size: 16px;
  font-weight: 600;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 18px;
}

.summary-card {
  background: white;
  padding: 24px;
  border-radius: 22px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.summary-card p {
  color: #6b7280;
  margin-bottom: 10px;
  font-size: 20px;
}

.summary-card h2 {
  font-size: 34px;
}

.income {
  color: #10b981;
}

.expense {
  color: #ef4444;
}

.category-filter {
  display: flex;
  gap: 10px;
  padding-bottom: 30px;
  padding-top: 30px;
  flex-wrap: wrap;
}

.category-filter button {
  border: none;
  background: #ececf8;
  color: #6b7280;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 20px;
  transition: 0.2s ease;
}

.category-filter button:hover {
  background: #e0e7ff;
  color: #4f46e5;
}

.category-filter button.active {
  background: #e0e7ff;
  color: #4f46e5;
  font-weight: 700;
}

.transaction-wrapper {
  background: white;
  border-radius: 24px;
  padding: 26px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.date-label {
  color: #6b7280;
  margin-bottom: 20px;
  font-size: 20px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
  font-size: 22px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: 0.2s ease;
}

.transaction-item:hover {
  background: #f8fafc;
  padding-left: 14px;
  padding-right: 14px;
  border-radius: 16px;
}

.transaction-item:last-child {
  border-bottom: none;
}

.left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-circle {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.transaction-icon-img {
  width: 45px;
  height: 45px;
  object-fit: contain;
}

.left h4 {
  color: #111827;
  margin-bottom: 4px;
}

.left p,
.right p {
  color: #6b7280;
  font-size: 20px;
}

.month-debug {
  font-size: 14px !important;
  color: #94a3b8 !important;
  margin-top: 4px;
}

.right {
  text-align: right;
}

.right h4 {
  color: #111827;
  margin-bottom: 4px;
}

.green {
  color: #10b981 !important;
}

.red {
  color: #ef4444 !important;
}

.empty-state {
  padding: 28px 0;
  text-align: center;
  color: #6b7280;
  font-size: 18px;
  font-weight: 600;
}

.error-text {
  color: #ef4444;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-card {
  width: 700px;
  max-height: 92vh;
  overflow-y: auto;
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  animation: popup 0.2s ease;
}

.detail-modal {
  width: 620px;
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

.close-btn {
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
}

.selected-month-box {
  background: #eef2ff;
  color: #3730a3;
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 18px;
}

.selected-month-box strong {
  color: #1e1b4b;
}

.selected-month-box small {
  display: inline-block;
  margin-top: 6px;
  color: #64748b;
  font-size: 14px;
}

.amount-box {
  background: #f8fafc;
  border-radius: 18px;
  padding: 24px;
  text-align: center;
  margin-bottom: 18px;
}

.amount-box p {
  color: #6b7280;
  margin-bottom: 8px;
  font-size: 20px;
}

.amount-input-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.amount-input-wrapper.filled {
  justify-content: center;
  padding-left: 20px;
}

.amount-input-wrapper span {
  font-size: 32px;
  color: #111827;
  font-weight: 600;
}

.amount-input {
  border: none;
  background: transparent;
  font-size: 42px;
  font-weight: 700;
  color: #111827;
  outline: none;
  width: 280px;
}

.amount-input::placeholder {
  color: #9ca3af;
}

.transaction-type {
  display: flex;
  gap: 12px;
  margin-bottom: 22px;
}

.type-btn {
  flex: 1;
  height: 60px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 20px;
  font-weight: 600;
  background: #f1f5f9;
  color: #6b7280;
  transition: all 0.25s ease;
}

.active-expense {
  background: #ef4444;
  color: white;
  box-shadow: 0 6px 18px rgba(239, 68, 68, 0.25);
}

.active-income {
  background: #10b981;
  color: white;
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.25);
}

.modal-section {
  margin-bottom: 18px;
}

.modal-section h4 {
  margin-bottom: 12px;
  color: #374151;
  font-size: 18px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.category-item {
  background: #f1f5f9;
  border-radius: 16px;
  padding: 14px;
  text-align: center;
  cursor: pointer;
  transition: 0.2s;
  border: 2px solid transparent;
}

.category-item:hover {
  background: #ede9fe;
}

.category-item p {
  margin-top: 8px;
  font-size: 18px;
}

.category-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  background: #e5e7eb;
}

.category-icon-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.income-icon {
  background: #d1fae5;
}

.category-item.active-category {
  background: #ede9fe;
  border: 2px solid #4f46e5;
}

.input-field {
  width: 100%;
  height: 60px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  outline: none;
  box-sizing: border-box;
  font-size: 18px;
}

.input-field:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
}

.save-error {
  color: #ef4444;
  font-size: 15px;
  font-weight: 600;
  margin-top: -6px;
  margin-bottom: 14px;
}

.success-text {
  color: #16a34a;
  font-size: 15px;
  font-weight: 600;
  margin-top: -6px;
  margin-bottom: 14px;
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
  margin-top: 10px;
}

.save-btn:hover {
  opacity: 0.9;
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail-top {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
  padding: 18px;
  border-radius: 18px;
}

.detail-top h4 {
  font-size: 24px;
  color: #111827;
  margin: 0 0 4px;
}

.detail-top p {
  color: #6b7280;
  font-size: 18px;
  margin: 0;
}

.detail-icon {
  width: 64px;
  height: 64px;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.detail-info-grid div {
  background: #f8fafc;
  padding: 14px;
  border-radius: 14px;
}

.detail-info-grid p {
  color: #6b7280;
  font-size: 20px;
  margin: 0 0 6px;
}

.detail-info-grid h4 {
  color: #111827;
  font-size: 20px;
  margin: 0;
  word-break: break-word;
}

.edit-amount-box {
  margin-bottom: 0;
}

.detail-actions {
  display: flex;
  gap: 12px;
}

.delete-btn,
.update-btn {
  flex: 1;
  border: none;
  padding: 16px;
  border-radius: 16px;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
}

.delete-btn {
  background: #fee2e2;
  color: #dc2626;
}

.update-btn {
  background: #4f46e5;
  color: white;
}

.delete-btn:hover,
.update-btn:hover {
  opacity: 0.9;
}

.delete-btn:disabled,
.update-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

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

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .category-filter {
    flex-wrap: wrap;
  }
}

@media (max-width: 900px) {
  .main-content {
    margin-left: 0;
    padding-top: 180px;
  }

  .topbar {
    left: 0;
    width: 100%;
  }

  .topbar-actions {
    margin-right: 0;
  }

  .add-btn {
    width: 180px;
  }

  .modal-card {
    width: 92%;
  }

  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .transaction-item {
    align-items: flex-start;
    gap: 14px;
  }

  .left p,
  .right p {
    font-size: 16px;
  }

  .detail-info-grid {
    grid-template-columns: 1fr;
  }

  .detail-actions {
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