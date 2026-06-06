<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'

import iconRegister from '@/assets/User/icon-register.svg'
import iconUsn from '@/assets/User/icon-usn.svg'
import iconEmail from '@/assets/User/icon-email.svg'
import iconMata from '@/assets/User/icon-mata.svg'

const router = useRouter()

const API_BASE_URL = 'http://localhost:8000'

const step = ref('register')
// step: 'register' | 'otp'

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const agree = ref(false)

const otpDigits = ref(['', '', '', '', '', ''])

const errors = ref({})
const isLoading = ref(false)
const isResending = ref(false)
const successMessage = ref('')

const otp = computed(() => otpDigits.value.join(''))

const goLogin = () => {
  router.push('/userLogin')
}

const validateForm = () => {
  errors.value = {}

  if (!username.value) {
    errors.value.username = 'Username wajib diisi'
  }

  if (!email.value) {
    errors.value.email = 'Email wajib diisi'
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    errors.value.email = 'Format email tidak valid'
  }

  if (!password.value) {
    errors.value.password = 'Password wajib diisi'
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password.value)) {
    errors.value.password =
      'Password harus memiliki 1 huruf besar, 1 huruf kecil, 1 angka, dan minimal 8 karakter'
  }

  if (!confirmPassword.value) {
    errors.value.confirmPassword = 'Konfirmasi password wajib diisi'
  } else if (confirmPassword.value !== password.value) {
    errors.value.confirmPassword = 'Password tidak sama'
  }

  if (!agree.value) {
    errors.value.agree = 'Harus menyetujui syarat & ketentuan'
  }

  return Object.keys(errors.value).length === 0
}

const submitForm = async () => {
  if (!validateForm()) return

  errors.value = {}
  successMessage.value = ''
  isLoading.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      errors.value.general =
        data.message || data.error || 'Register gagal'
      return
    }

    successMessage.value = 'Kode OTP sudah dikirim ke email kamu'
    step.value = 'otp'

    nextTick(() => {
      const firstInput = document.querySelector('#otp-0')
      firstInput?.focus()
    })
  } catch (error) {
    console.error(error)
    errors.value.general = 'Tidak dapat terhubung ke server'
  } finally {
    isLoading.value = false
  }
}

const handleOtpInput = (event, index) => {
  const value = event.target.value.replace(/\D/g, '')

  otpDigits.value[index] = value.slice(-1)

  if (value && index < 5) {
    nextTick(() => {
      const nextInput = document.querySelector(`#otp-${index + 1}`)
      nextInput?.focus()
    })
  }
}

const handleOtpKeydown = (event, index) => {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    nextTick(() => {
      const prevInput = document.querySelector(`#otp-${index - 1}`)
      prevInput?.focus()
    })
  }
}

const handleOtpPaste = (event) => {
  event.preventDefault()

  const pastedText = event.clipboardData
    .getData('text')
    .replace(/\D/g, '')
    .slice(0, 6)

  otpDigits.value = ['', '', '', '', '', '']

  pastedText.split('').forEach((digit, index) => {
    otpDigits.value[index] = digit
  })

  nextTick(() => {
    const focusIndex = pastedText.length >= 6 ? 5 : pastedText.length
    const input = document.querySelector(`#otp-${focusIndex}`)
    input?.focus()
  })
}

const verifyOtp = async () => {
  errors.value = {}
  successMessage.value = ''

  if (otp.value.length !== 6) {
    errors.value.otp = 'Kode OTP harus 6 digit'
    return
  }

  isLoading.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify/code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: otp.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      errors.value.otp =
        data.message || data.error || 'Kode OTP salah atau sudah expired'
      return
    }

    alert('Register berhasil!')
    router.push('/userLogin')
  } catch (error) {
    console.error(error)
    errors.value.otp = 'Tidak dapat terhubung ke server'
  } finally {
    isLoading.value = false
  }
}

const resendOtp = async () => {
  errors.value = {}
  successMessage.value = ''
  isResending.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify/resend`, {
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
      errors.value.otp =
        data.message || data.error || 'Gagal mengirim ulang kode OTP'
      return
    }

    otpDigits.value = ['', '', '', '', '', '']
    successMessage.value = 'Kode OTP baru sudah dikirim ke email kamu'

    nextTick(() => {
      const firstInput = document.querySelector('#otp-0')
      firstInput?.focus()
    })
  } catch (error) {
    console.error(error)
    errors.value.otp = 'Tidak dapat terhubung ke server'
  } finally {
    isResending.value = false
  }
}

const cancelOtp = () => {
  step.value = 'register'
  otpDigits.value = ['', '', '', '', '', '']
  errors.value = {}
  successMessage.value = ''
}
</script>

<template>
  <div class="page">
    <div class="card">
      <div class="header">
        <div class="logo-box">
          <img :src="iconRegister">
        </div>

        <h1 v-if="step === 'register'">Buat Akun</h1>
        <h1 v-else>Verifikasi OTP</h1>

        <p v-if="step === 'register'">
          Mulai Perjalanan Finansialmu
        </p>

        <p v-else>
          Masukkan 6 digit kode yang dikirim ke email
        </p>
      </div>

      <div v-if="errors.general" class="general-error">
        {{ errors.general }}
      </div>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <!-- REGISTER FORM -->
      <template v-if="step === 'register'">
        <form class="form" @submit.prevent="submitForm">
          <div class="input-group">
            <img
              :src="iconUsn"
              alt=""
              class="input-icon"
            >

            <input
              v-model="username"
              type="text"
              placeholder="Username"
            >

            <span class="error" v-if="errors.username">
              {{ errors.username }}
            </span>
          </div>

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

            <span class="error" v-if="errors.email">
              {{ errors.email }}
            </span>
          </div>

          <div class="input-group-pass">
            <img
              :src="iconMata"
              alt=""
              class="eye-icon"
              @click="showPassword = !showPassword"
            >

            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
            >

            <small class="password-hint">
              Gunakan minimal 8 karakter, 1 huruf besar, 1 huruf kecil, dan 1 angka
            </small>

            <span class="error" v-if="errors.password">
              {{ errors.password }}
            </span>
          </div>

          <div class="input-group-pass">
            <img
              :src="iconMata"
              alt=""
              class="eye-icon"
              @click="showConfirmPassword = !showConfirmPassword"
            >

            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Konfirmasi Password"
            >

            <span class="error" v-if="errors.confirmPassword">
              {{ errors.confirmPassword }}
            </span>
          </div>
        </form>

        <label class="checkbox">
          <input v-model="agree" type="checkbox">
          <p>Saya setuju dengan <span>Syarat & Ketentuan</span></p>
        </label>

        <span class="error" v-if="errors.agree">
          {{ errors.agree }}
        </span>

        <button :disabled="isLoading" @click="submitForm">
          {{ isLoading ? 'Loading...' : 'Daftar' }}
        </button>

        <label>
          Sudah punya akun? <span @click="goLogin">Masuk</span>
        </label>
      </template>

      <!-- OTP FORM -->
      <template v-else>
        <div class="otp-info">
          Kode OTP dikirim ke:
          <strong>{{ email }}</strong>
        </div>

        <div class="otp-wrapper">
          <input
            v-for="(_, index) in otpDigits"
            :id="`otp-${index}`"
            :key="index"
            v-model="otpDigits[index]"
            class="otp-input"
            type="text"
            inputmode="numeric"
            maxlength="1"
            @input="handleOtpInput($event, index)"
            @keydown="handleOtpKeydown($event, index)"
            @paste="handleOtpPaste"
          >
        </div>

        <span class="error otp-error" v-if="errors.otp">
          {{ errors.otp }}
        </span>

        <button :disabled="isLoading" @click="verifyOtp">
          {{ isLoading ? 'Memverifikasi...' : 'Verifikasi OTP' }}
        </button>

        <div class="otp-actions">
          <button
            class="resend-btn"
            :disabled="isResending"
            @click="resendOtp"
          >
            {{ isResending ? 'Mengirim...' : 'Resend Kode' }}
          </button>

          <button
            class="cancel-btn"
            @click="cancelOtp"
          >
            Cancel
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.page {
  width: 100%;
  height: 100vh;
  background: #f3f4f6;
  display: flex;
  justify-content: center;
  align-items: center;
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

/* CARD */
.card {
  width: 550px;
  background: white;
  border-radius: 20px;
  padding: 32px 28px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 18px;
  animation: fadeUp 0.8s ease;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.97);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* HEADER */
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-bottom: 30px;
}

.logo-box {
  width: 280px;
  height: 100px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(12px);
}

.logo-box img {
  width: 42px;
  height: 42px;
  background: #ede9fe;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 10px;
}

.header h1 {
  font-size: 42px;
  font-weight: 550;
  color: #1f2937;
  margin-bottom: 10px;
}

.header p {
  font-size: 24px;
  color: #6b7280;
  margin-top: 6px;
}

/* FORM */
.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.input-group,
.input-group-pass {
  position: relative;
}

.input-group input {
  width: 100%;
  height: 62px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding-left: 48px;
  padding-right: 48px;
  box-sizing: border-box;
  font-size: 22px;
  outline: none;
}

.input-group input:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.12);
}

.input-group-pass input {
  width: 100%;
  height: 62px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding-left: 18px;
  padding-right: 48px;
  box-sizing: border-box;
  font-size: 22px;
  outline: none;
}

.input-group-pass input:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.12);
}

.password-hint {
  display: block;
  margin-top: 6px;
  padding-left: 4px;
  font-size: 16px;
  color: #6b7280;
  line-height: 1.4;
}

/* ICON IMAGE */
.input-icon {
  position: absolute;
  left: 16px;
  top: 31px;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.eye-icon {
  position: absolute;
  right: 16px;
  top: 31px;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  cursor: pointer;
  opacity: 0.7;
  transition: 0.2s;
}

.eye-icon:hover {
  opacity: 1;
}

/* CHECKBOX */
.checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  color: #4b5563;
  margin-bottom: 0px;
}

.checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox p {
  margin: 0;
}

.checkbox span {
  color: #8b5cf6;
  font-weight: 600;
  cursor: pointer;
}

/* OTP */
.otp-info {
  text-align: center;
  font-size: 18px;
  color: #6b7280;
  line-height: 1.5;
}

.otp-info strong {
  color: #1f2937;
}

.otp-wrapper {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 4px;
  margin-bottom: 4px;
}

.otp-input {
  width: 62px;
  height: 62px;
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

.otp-error {
  text-align: center;
  padding-left: 0;
}

.otp-actions {
  display: flex;
  gap: 12px;
}

.otp-actions button {
  flex: 1;
}

/* BUTTON */
button {
  width: 100%;
  height: 54px;
  border: none;
  border-radius: 14px;
  background: #8b5cf6;
  color: white;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

button:hover {
  background: #7c3aed;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.resend-btn {
  background: #ede9fe;
  color: #7c3aed;
}

.resend-btn:hover {
  background: #ddd6fe;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

/* ERROR & SUCCESS */
.error {
  color: #ef4444;
  font-size: 18px;
  font-weight: 500;
  display: block;
  margin-top: 6px;
  padding-left: 4px;
  animation: fadeError 0.2s ease;
}

.general-error {
  background: #fee2e2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 600;
  text-align: center;
}

.success-message {
  background: #dcfce7;
  color: #16a34a;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
}

/* FOOTER */
.card label:last-child {
  text-align: center;
  font-size: 18px;
  color: #6b7280;
}

.card label:last-child span {
  color: #8b5cf6;
  font-weight: 600;
  cursor: pointer;
}

.input-group,
.input-group-pass,
.checkbox,
button,
.card label:last-child {
  animation: fadeItem 0.8s ease;
}

.input-group:nth-child(1) {
  animation-delay: 0.1s;
}

.input-group:nth-child(2) {
  animation-delay: 0.2s;
}

.input-group-pass:nth-child(3) {
  animation-delay: 0.2s;
}

.input-group-pass:nth-child(4) {
  animation-delay: 0.2s;
}

button {
  animation-delay: 0.2s;
}

@keyframes fadeItem {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* supaya delay bekerja */
.input-group,
.input-group-pass,
.checkbox,
button,
.card label:last-child {
  animation-fill-mode: both;
}

@keyframes fadeError {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
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
    padding: 28px 22px;
  }

  .header h1 {
    font-size: 34px;
  }

  .header p {
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

  .otp-actions {
    flex-direction: column;
  }
}
</style>