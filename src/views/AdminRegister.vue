<script setup>
import { ref } from "vue"
import router from "@/router"
import adminRegister from "@/assets/admin-register.svg"
import inputName from "@/assets/icon-inputname.svg"
import inputMail from "@/assets/icon-inputmail.svg"
import inputPhone from "@/assets/icon-inputphone.svg"
import inputPass from "@/assets/icon-inputpass.svg"
import eyeOn from '@/assets/icon-eyeon.svg'
import eyeOff from '@/assets/icon-eyeoff.svg'
import axios from "axios"
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const successMessage = ref("")

const form = ref({
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  agree: false
})

const errors = ref({
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  agree: ""
})

const submitForm = async () => {
  Object.keys(errors.value).forEach(key => errors.value[key] = "")

  let valid = true

  if (!form.value.username) {
    errors.value.username = "Username wajib diisi"
    valid = false
  }

  if (!form.value.email) {
    errors.value.email = "Email wajib diisi"
    valid = false
  }

  if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = "Email tidak valid"
    valid = false
  }

  if (form.value.password.length < 8) {
    errors.value.password = "Minimal 8 karakter"
    valid = false
  }

  if (!/[A-Z]/.test(form.value.password)) {
  errors.value.password = "Harus mengandung minimal 1 huruf besar"
  valid = false
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = "Password tidak sama"
    valid = false
  }

  if (!form.value.agree) {
    errors.value.agree = "Harus setuju Terms and Conditions"
    valid = false
  }

  if (!valid) return

  try {
    const res = await axios.post("http://localhost:8080/auth/register", {
      username: form.value.username,
      email: form.value.email,
      password: form.value.password
    })

    console.log(res.data)
    showOTPModal.value = true
    otpCode.value = ""
    otpError.value = ""
    startResendTimer()

  } catch (error) {
    console.error(error)

    if (error.response) {
      alert(error.response.data.message)
    } else {
      alert("Gagal konek ke server")
    }
  }
}

const verifyOTP = async () => {
  otpError.value = ""

  if (!otpCode.value) {
    otpError.value = "Kode wajib diisi"
    return
  }

  try {
    const res = await axios.post("http://localhost:8080/auth/verify/code", {
      code: otpCode.value
    })

    console.log(res.data)
    showOTPModal.value = false
    successMessage.value = "Account berhasil dibuat!"

    setTimeout(() => {
      successMessage.value = ""
      router.push("/")
    }, 3000)

  } catch (error) {
    otpError.value = error.response?.data?.message || "OTP salah"
  }
}
const showOTPModal = ref(false)
const otpCode = ref("")
const otpError = ref("")
const resendTimer = ref(60)
const isResendDisabled = ref(true)
let intervalId = null
const resendSuccess = ref("")

const resendOTP = async () => {
  try {
    await axios.post("http://localhost:8080/auth/verify/resend", {
      email: form.value.email
    })

    resendSuccess.value = "Kode OTP berhasil dikirim ulang!"
    startResendTimer()

    // hilang otomatis setelah 3 detik
    setTimeout(() => {
      resendSuccess.value = ""
    }, 3000)

  } catch (error) {
    alert(error.response?.data?.message || "Gagal resend OTP")
  }
}

const startResendTimer = () => {
  if (intervalId) clearInterval(intervalId) // 🔥 penting

  resendTimer.value = 60
  isResendDisabled.value = true

  intervalId = setInterval(() => {
    resendTimer.value--

    if (resendTimer.value <= 0) {
      clearInterval(intervalId)
      intervalId = null
      isResendDisabled.value = false
    }
  }, 1000)
}
</script>

<template>
  <div class="container">
    <div class="card">
      <p class="back"  @click="router.push('/')" >← Back to Login</p>
     
    
       <img :src="adminRegister" class="icon">
   
      <h2>Create Admin Account</h2>
      <p class="subtitle">Register for FinTech Admin Dashboard</p>

      <div class="form">
          <div class="field">
            <label>Username</label>
              <div class="input-wrapper">
                <img :src= "inputName" class="input-icon" />
                <input v-model="form.username" placeholder="Username" />
            </div>
            <span class="error" v-if="errors.username">{{ errors.username }}</span>
          </div>

          <div class="field">
            <label>Email Address</label>
              <div class="input-wrapper">
                <img :src="inputMail" class="input-icon" />
                <input v-model="form.email" placeholder="Email Address" />
              </div>
              <span class="error" v-if="errors.email">{{ errors.email }}</span>
          </div>
        
          <div class="field">
            <label>Phone Number (Optional)</label>
            <div class="input-wrapper">
              <img :src="inputPhone" class="input-icon" />
              <input v-model="form.phone" placeholder="Phone Number" />
            </div>
          </div>
        
        <div class="field">
          <label>Password</label>
          <div class="input-wrapper">
            <img :src="inputPass" class="input-icon" />

            <input 
              :type="showPassword ? 'text' : 'password'"
              v-model="form.password" 
              placeholder="Password" 
            />

            <img 
              :src="showPassword ? eyeOff : eyeOn"
              class="eye-icon"
              @click="showPassword = !showPassword"
            />
          </div>
          <span class="error" v-if="errors.password">{{ errors.password }}</span>
        </div>

        <div class="field">
          <label>Confirm Password</label>
          <div class="input-wrapper">
            <img :src="inputPass" class="input-icon" />

            <input 
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="form.confirmPassword" 
              placeholder=" Confirm Password" 
            />

            <img 
              :src="showConfirmPassword ? eyeOff : eyeOn"
              class="eye-icon"
              @click="showConfirmPassword = !showConfirmPassword"
            />
          </div>  
          <span class="error" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</span>
        </div>
        <label class="checkbox">
          <input type="checkbox" v-model="form.agree" />
          I agree to the<a href="/terms">Terms and Conditions</a> and <a href="/privacy">Privacy Policy</a>
        </label>
        <span class="error" v-if="errors.agree">{{ errors.agree }}</span>
      </div>  

        <button @click="submitForm">Create Account</button>

        <div v-if="successMessage" class="success-alert">
          {{ successMessage }}
        </div>

        <p class="login">
          Already have an account? <a href="/">Login here</a>
        </p>
        <P class = "copyright">© 2026 FinTech Admin Dashboard. All rights reserved.</P>
      </div>
    </div>


  <div v-if="showOTPModal" class="modal-overlay">
    <div class="modal">
      <h3>Verifikasi Email</h3>
      <p>Masukkan kode yang dikirim ke email kamu</p>

      <input 
        v-model="otpCode" 
        placeholder="Masukkan kode OTP"
      />
      <span class="error" v-if="otpError">{{ otpError }}</span>
      <div v-if="resendSuccess" class="success-resend">
        {{ resendSuccess }}
      </div>

      <p class="resend-text">
        Tidak menerima kode?
        <button 
          class="resend-btn" 
          :disabled="isResendDisabled"
          @click="resendOTP"
        >
          Kirim Ulang
        </button>
      </p>

      <p v-if="isResendDisabled" class="timer">
        Kirim ulang dalam {{ resendTimer }} detik
      </p>

      <div class="modal-actions">
        <button class="verify-btn" @click="verifyOTP">Verifikasi</button>
        <button class="cancel-btn" @click="showOTPModal = false">Batal</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
   height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: #eaf0f7;;
}

.container .copyright {
  text-align: center;
  font-size: 20px;
  color: #6b7280;
}

.card {
  width: 100%;
  max-width: 800px;
  padding: 32px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
  animation: fadeIn 1s ease-in-out;
}

.back {
  font-size: 24px;
  color: #6b7280;
  margin-bottom: 20px;
  cursor: pointer;
}

.icon {
  width: 80px;
  height: 80px;
  background: #2f4bb2;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.input-wrapper {
  position: relative;
  width: 143%;
}

.input-wrapper input {
  padding-left: 40px;
  width: 100%;

}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  opacity: 0.6;
  pointer-events: none;
}

.eye-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  opacity: 0.6;
  cursor: pointer;
}

h2 {
  text-align: center;
  font-size: 40px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0px;
}

.subtitle {
  text-align: center;
  font-size: 25px;
  color: #6b7280;
  margin-bottom: 50px;
}

.form {
  width: 100%;
  max-width: fit-content;
}

.row {
  display: flex;
  gap: 100px;
  }

.field {
  flex: 1; 
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
  min-width: 0;
}


.field label {
  font-size: 22px;
  color: #000000;
  margin-bottom: 6px;
  font-weight: 520;
}

input {
  width: 100%;
  padding: 11px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 22px;
  background: #f9fafb;
  transition: 0.2s;
}

input:focus {
  outline: none;
  border-color: #2f4bb2;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(47, 75, 178, 0.1);
}

.hint {
  font-size: 20px;
  color: #9ca3af;
  margin-top: -10px;
  margin-bottom: 12px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  color: #374151;
  margin-top: 30px;
}

.checkbox input {
  width: 16px;
  height: 16px;
}

.error {
  color: #dc2626;
  font-size: 18px;
  display: block;
  margin-top: 10px;
  margin-bottom: 20px;
}

button {
  width: 100%;
  padding: 12px;
  background: #2f4bb2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 30px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
  margin-top: 10px;
}

button:hover {
  background: #243a8a;
}
.login{
  text-align: center;
  margin-top: 30px;
  font-size: 20px;
}

a[href]{
  color: #2f4bb2;
  text-decoration: none;
}

.field span {
  color: #dc2626;
  font-size: 18px;
  display: block;
  font-weight: 500;
  margin-top: 5px;
  margin-bottom: 0px;
  animation: fadeIn 0.2s ease-in-out;

}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-alert {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #10b981;
  padding: 16px 16px;
  border-radius: 8px;
  font-size: 25px;
  margin-bottom: 20px;
  margin-top: 10px;
  text-align: center;
  animation: fadeSlide 0.3s ease;
}

@keyframes fadeSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 400px;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.modal h3 {
  font-size: 26px;
  margin-bottom: 10px;
}

.modal p {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 20px;
}

.modal input {
  width: 100%;
  padding: 12px;
  font-size: 20px;
  margin-bottom: 10px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.verify-btn {
  flex: 1;
  background: #2f4bb2;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
}

.cancel-btn {
  flex: 1;
  background: #e5e7eb;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
}

.cancel-btn:hover{
  background:red;
  transform: translateY(-1px);
}

.resend-text {
  margin-top: 10px;
  font-size: 16px;
}

.resend-btn {
  background: #2f4bb2;
  border: none;
  color: #ffffff;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.resend-btn:hover:not(:disabled) {
  background: #243a8a;
  transform: translateY(-1px);
}

.resend-btn:disabled {
  background: #d1d5db;
  color: #6b7280;
  cursor: not-allowed;
  transform: none;
}

.timer {
  font-size: 14px;
  color: #6b7280;
  margin-top: 5px;
}

.success-resend {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #10b981;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  margin-top: 10px;
  animation: fadeSlide 0.3s ease;
}
</style>