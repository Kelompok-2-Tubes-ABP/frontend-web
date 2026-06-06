<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import iconEmail from '@/assets/User/icon-email.svg'

const router = useRouter()

const API_BASE_URL = 'http://localhost:8000'

const step = ref('email')
// step: 'email' | 'reset' | 'success'

const email = ref('')
const tokenDigits = ref(['', '', '', '', '', ''])
const newPassword = ref('')
const confirmPassword = ref('')

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const token = computed(() => tokenDigits.value.join(''))

const goBack = () => {
  router.back()
}

const goLogin = () => {
  router.push('/userLogin')
}

const sendReset = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value) {
    errorMessage.value = 'Email wajib diisi'
    return
  }

  loading.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || data.error || 'Gagal mengirim kode reset'
      return
    }

    successMessage.value = 'OTP reset berhasil dikirim ke email kamu'
    step.value = 'reset'
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Tidak dapat terhubung ke server'
  } finally {
    loading.value = false
  }
}

const handleTokenInput = (event, index) => {
  const value = event.target.value.replace(/\D/g, '')

  tokenDigits.value[index] = value.slice(-1)

  if (value && index < 5) {
    nextTick(() => {
      const nextInput = document.querySelector(`#otp-${index + 1}`)
      nextInput?.focus()
    })
  }
}

const handleTokenKeydown = (event, index) => {
  if (event.key === 'Backspace' && !tokenDigits.value[index] && index > 0) {
    nextTick(() => {
      const prevInput = document.querySelector(`#otp-${index - 1}`)
      prevInput?.focus()
    })
  }
}

const handleTokenPaste = (event) => {
  event.preventDefault()

  const pastedText = event.clipboardData
    .getData('text')
    .replace(/\D/g, '')
    .slice(0, 6)

  tokenDigits.value = ['', '', '', '', '', '']

  pastedText.split('').forEach((digit, index) => {
    tokenDigits.value[index] = digit
  })

  nextTick(() => {
    const focusIndex = pastedText.length >= 6 ? 5 : pastedText.length
    const input = document.querySelector(`#otp-${focusIndex}`)
    input?.focus()
  })
}

const confirmResetPassword = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (token.value.length !== 6) {
    errorMessage.value = 'Kode token harus 6 digit'
    return
  }

  if (!newPassword.value) {
    errorMessage.value = 'Password baru wajib diisi'
    return
  }

  if (newPassword.value.length < 8) {
    errorMessage.value = 'Password minimal 8 karakter'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Konfirmasi password tidak sama'
    return
  }

  loading.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        token: token.value,
        new_password: newPassword.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || data.error || 'Token salah atau password gagal diubah'
      return
    }

    step.value = 'success'
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Tidak dapat terhubung ke server'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <!-- BACK -->
    <div class="back-btn" @click="goBack">
      ← Kembali
    </div>

    <!-- CARD -->
    <div class="card">
      <h1>Lupa Password</h1>

      <p v-if="step === 'email'">
        Masukkan email untuk reset password
      </p>

      <p v-else-if="step === 'reset'">
        Masukkan kode reset dan password baru
      </p>

      <p v-else>
        Password berhasil diubah
      </p>

      <!-- ERROR -->
      <div v-if="errorMessage" class="alert error">
        {{ errorMessage }}
      </div>

      <!-- SUCCESS MESSAGE -->
      <div v-if="successMessage && step !== 'success'" class="alert success">
        {{ successMessage }}
      </div>

      <!-- STEP 1: EMAIL -->
      <template v-if="step === 'email'">
        <div class="input-group">
          <img
            :src="iconEmail"
            alt=""
            class="input-icon"
          >

          <input
            v-model="email"
            type="email"
            placeholder="Email"
          >
        </div>

        <button @click="sendReset" :disabled="loading">
          {{ loading ? 'Mengirim...' : 'Kirim Kode Reset' }}
        </button>
      </template>

      <!-- STEP 2: TOKEN + PASSWORD BARU -->
      <template v-else-if="step === 'reset'">
        <div class="otp-wrapper">
          <input
            v-for="(_, index) in tokenDigits"
            :id="`otp-${index}`"
            :key="index"
            v-model="tokenDigits[index]"
            class="otp-input"
            type="text"
            inputmode="numeric"
            maxlength="1"
            @input="handleTokenInput($event, index)"
            @keydown="handleTokenKeydown($event, index)"
            @paste="handleTokenPaste"
          >
        </div>

        <div class="input-group no-icon">
          <input
            v-model="newPassword"
            type="password"
            placeholder="Password baru"
          >
        </div>

        <div class="input-group no-icon">
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Konfirmasi password baru"
          >
        </div>

        <button @click="confirmResetPassword" :disabled="loading">
          {{ loading ? 'Memproses...' : 'Ganti Password' }}
        </button>
      </template>

      <!-- SUCCESS -->
      <template v-else-if="step === 'success'">
        <div class="success-box">
          <div class="success-icon">
            ✔
          </div>

          <h2>Password berhasil diubah!</h2>

          <span>
            Silakan login menggunakan password baru kamu
          </span>

          <button @click="goLogin">
            Kembali ke Login
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

.page {
  width: 100%;
  height: 100vh;
  background: #f3f4f6;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(
    135deg,
    #f5f3ff,
    #ede9fe,
    #f3f4f6
  );
  background-size: 300% 300%;
  animation: gradientMove 8s ease infinite;
}

/* BACK BUTTON */
.back-btn {
  position: absolute;
  top: 30px;
  left: 30px;
  font-size: 20px;
  font-weight: 700;
  color: #374151;
  cursor: pointer;
  transition: 0.2s;
}

.back-btn:hover {
  opacity: 0.7;
}

/* CARD */
.card {
  width: 520px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  animation: fadeUp 0.7s ease;
}

/* TITLE */
.card h1 {
  font-size: 42px;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin: 0;
}

/* SUBTITLE */
.card p {
  text-align: center;
  color: #6b7280;
  font-size: 24px;
  margin-top: 8px;
  margin-bottom: 20px;
}

/* ALERT */
.alert {
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
}

.alert.error {
  background: #fee2e2;
  color: #dc2626;
}

.alert.success {
  background: #dcfce7;
  color: #16a34a;
}

/* INPUT */
.input-group {
  position: relative;
  margin-top: 8px;
}

.input-group input {
  width: 100%;
  height: 58px;
  border: 1px solid #d1d5db;
  border-radius: 14px;
  padding-left: 46px;
  padding-right: 16px;
  box-sizing: border-box;
  font-size: 20px;
  outline: none;
  transition: 0.2s;
}

.input-group.no-icon input {
  padding-left: 16px;
}

.input-group input:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.12);
}

/* INPUT ICON */
.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
}

/* OTP INPUT */
.otp-wrapper {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.otp-input {
  width: 72px;
  height: 80px;
  border: 1px solid #d1d5db;
  border-radius: 14px;
  text-align: center;
  font-size: 26px;
  font-weight: 700;
  color: #1f2937;
  outline: none;
  transition: 0.2s;
  background: white;
}

.otp-input:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.12);
}

/* SUCCESS BOX */
.success-box {
  background: #ecfdf5;
  border-radius: 18px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: fadeSuccess 0.5s ease;
  margin-top: 18px;
}

.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  background: #22c55e;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  font-weight: bold;
}

.success-box h2 {
  margin: 0;
  color: #16a34a;
  font-size: 24px;
}

.success-box span {
  text-align: center;
  color: #6b7280;
  font-size: 20px;
}

/* BUTTON */
button {
  width: 100%;
  height: 58px;
  border: none;
  border-radius: 14px;
  background: #8b5cf6;
  color: white;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s;
}

button:hover {
  background: #7c3aed;
  transform: translateY(-2px);
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* ANIMATION */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeSuccess {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .card {
    width: 90%;
  }

  .card h1 {
    font-size: 32px;
  }

  .card p {
    font-size: 18px;
  }

  .otp-wrapper {
    gap: 8px;
  }

  .otp-input {
    width: 46px;
    height: 52px;
    font-size: 22px;
  }
}
</style>