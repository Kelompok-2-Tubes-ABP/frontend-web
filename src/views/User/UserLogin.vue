<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import iconRegister from '@/assets/User/icon-register.svg'
import iconEmail from '@/assets/User/icon-email.svg'
import iconMata from '@/assets/User/icon-mata.svg'

const showPassword = ref(false)
const router = useRouter()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)

const errors = ref({})
const isLoading = ref(false)
const alertMessage = ref('')
const alertType = ref('')

const goRegister = () => {
  router.push('/userRegister')
}

const goForgot = () => {
  router.push('/userForgotPass')
}

/*
  Membantu Vue membaca value dari autofill Chrome.
  Kadang secara visual input sudah terisi,
  tapi v-model belum langsung membaca nilainya.
*/
const syncAutofill = () => {
  const emailInput = document.getElementById('username')
  const passwordInput = document.getElementById('current-password')

  if (emailInput?.value) {
    email.value = emailInput.value
  }

  if (passwordInput?.value) {
    password.value = passwordInput.value
  }
}

onMounted(() => {
  setTimeout(syncAutofill, 300)
  setTimeout(syncAutofill, 800)
  setTimeout(syncAutofill, 1500)

  setTimeout(() => {
    const savedEmail = localStorage.getItem('remember_email')

    if (savedEmail && !email.value) {
      email.value = savedEmail
      rememberMe.value = true
    }
  }, 1800)
})

const validateForm = () => {
  syncAutofill()

  errors.value = {}

  if (!email.value) {
    errors.value.email = 'Email wajib diisi'
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    errors.value.email = 'Format email tidak valid'
  }

  if (!password.value) {
    errors.value.password = 'Password wajib diisi'
  }

  return Object.keys(errors.value).length === 0
}

const submitLogin = async () => {
  syncAutofill()

  if (!validateForm()) return

  alertMessage.value = ''
  alertType.value = ''

  try {
    isLoading.value = true

    /*
      Endpoint login tetap dipakai di sini.
      Yang dihapus hanya action form,
      bukan fetch endpoint login-nya.
    */
    const response = await fetch('https://backend-financeapi.up.railway.app/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        email: email.value.trim(),
        password: password.value
      })
    })

    const data = await response.json().catch(() => ({}))

    console.log('STATUS:', response.status)
    console.log('RESPONSE:', data)

    if (!response.ok) {
      alertType.value = 'error'
      alertMessage.value =
        data.error || data.message || 'Email atau password salah'
      return
    }

    const token = data.token || data.access_token

    if (!token) {
      alertType.value = 'error'
      alertMessage.value = 'Token tidak ditemukan dari backend'
      return
    }

    localStorage.setItem('token', token)

    /*
      Remember Me hanya simpan email.
      Password tidak disimpan manual.
      Password disimpan oleh Google/Chrome Password Manager
      kalau user memilih Save Password dari browser.
    */
    if (rememberMe.value) {
      localStorage.setItem('remember_email', email.value.trim())
    } else {
      localStorage.removeItem('remember_email')
    }

    alertType.value = 'success'
    alertMessage.value = 'Login berhasil!'

    setTimeout(() => {
      router.push('/userDashboard')
    }, 3000)
  } catch (error) {
    console.error('Login error:', error)

    alertType.value = 'error'
    alertMessage.value =
      'Gagal terhubung ke server. Pastikan backend Go berjalan dan CORS sudah aktif.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="card">
      <div class="header">
        <div class="logo-box">
          <img :src="iconRegister" alt="Register Icon">
        </div>

        <h1>Selamat Datang Kembali</h1>
        <p>Masuk ke akun FinanceApp kamu</p>
      </div>

      <!-- 
        Form tidak pakai action ke backend.
        Login tetap lewat fetch di submitLogin().
      -->
      <form
        id="login-form"
        class="form"
        autocomplete="on"
        method="post"
        action="/userLogin"
        @submit.prevent="submitLogin"
      >
        <div class="input-group">
          <img
            :src="iconEmail"
            alt=""
            class="input-icon"
          >

          <input
            id="username"
            v-model="email"
            type="email"
            name="username"
            autocomplete="username"
            placeholder="Email"
            autocapitalize="none"
            spellcheck="false"
            @input="syncAutofill"
            @change="syncAutofill"
            @focus="syncAutofill"
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
            id="current-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            name="password"
            autocomplete="current-password"
            placeholder="Password"
            @input="syncAutofill"
            @change="syncAutofill"
            @focus="syncAutofill"
          >

          <span class="error" v-if="errors.password">
            {{ errors.password }}
          </span>
        </div>

        <div class="remember-forgot">
          <label class="checkbox">
            <input
              v-model="rememberMe"
              type="checkbox"
              name="remember"
            >
            <p>Ingat saya</p>
          </label>

          <label class="lupaPassword">
            <span @click="goForgot">Lupa password?</span>
          </label>
        </div>

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Memproses...' : 'Masuk' }}
        </button>
      </form>

      <div
        v-if="alertMessage"
        class="custom-alert"
        :class="alertType"
      >
        {{ alertMessage }}
      </div>

      <label>
        Belum punya akun? <span @click="goRegister">Daftar</span>
      </label>
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

.input-group {
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

.input-group-pass {
  position: relative;
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

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* CHECKBOX */
.checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  color: #4b5563;
  margin-bottom: 16px;
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

.lupaPassword {
  font-size: 18px;
  margin-bottom: 16px;
}

.lupaPassword span {
  color: #8b5cf6;
  font-weight: 600;
  cursor: pointer;
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

.error {
  color: #ef4444;
  font-size: 18px;
  font-weight: 500;
  display: block;
  margin-top: 6px;
  padding-left: 4px;
  animation: fadeError 0.2s ease;
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
  animation-fill-mode: both;
}

.input-group:nth-child(1) {
  animation-delay: 0.1s;
}

.input-group-pass:nth-child(2) {
  animation-delay: 0.2s;
}

button {
  animation-delay: 0.1s;
}

.custom-alert {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  animation: fadeAlert 0.3s ease;
  box-sizing: border-box;
}

.custom-alert.success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.custom-alert.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

@keyframes fadeAlert {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
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
</style>