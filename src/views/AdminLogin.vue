<script setup>
import { ref } from "vue";
import router from "@/router";
import adminRegister from "@/assets/admin-register.svg"
import inputMail from "@/assets/icon-inputmail.svg"
import inputPass from "@/assets/icon-inputpass.svg"
import eyeOn from '@/assets/icon-eyeon.svg'
import eyeOff from '@/assets/icon-eyeoff.svg'
import axios from "axios";
const showPassword = ref(false)
const successMessage = ref("")
const errorMessage = ref("")


const form = ref({
  email: "",
  password: "",
  agree: false
})

const errors = ref({
  email: "",
  password: "",
  agree: ""
})

const submitForm = async() => {
  Object.keys(errors.value).forEach(key => errors.value[key] = "")

  let valid = true

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

  if (!valid) return

  try{
    const res = await axios.post("http://localhost:8080/admin/login", {
      email: form.value.email,
      password: form.value.password
    })
    console.log("Data:", res.data)
    localStorage.setItem('token', res.data.token)
    console.log('TOKEN:', res.data.token)
    errorMessage.value = ""
    successMessage.value = "Berhasil Login!"
    setTimeout(() => {successMessage.value = ""}, 3000)
    setTimeout(() => {router.push("/adminDashboard")}, 3000)
    } catch (error) {
    console.error("Error:", error)
      if (error.response) {
        errorMessage.value = error.response?.data?.message || "Email atau password salah"
      } else {
        errorMessage.value = "Terjadi kesalahan. Silakan coba lagi."
      }
  }
  
}
</script>

<template>
  <div class="container">
    <div class="card">
       <img :src="adminRegister" class="icon">
      <h2>Admin Login</h2>
      <p class="subtitle">FinTech Admin Dashboard</p>

      <div class="form">
        <div class="field">
          <label>Email Address</label>
            <div class="input-wrapper">
              <img :src="inputMail" class="input-icon" />
              <input v-model="form.email" placeholder="Email Address" />
            </div>
            <span class="error" v-if="errors.email">{{ errors.email }}</span>
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
      </div>
            <button @click="submitForm">Login</button>

            <div v-if="successMessage" class="success-alert">
            {{ successMessage }}
            </div>
            <div v-if="errorMessage" class="error-alert">
            {{ errorMessage }}
            </div>

            <p>Secure admin access only</p>
    </div>
    <P class = "copyright">© 2026 FinTech Admin Dashboard. All rights reserved.</P>
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

.card p{
  text-align: center;
  font-size: 20px;
  color: #6b7280;
  margin-top: 20px;
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
  width: 100%;
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
  width: 93%;
  
}

.field {
  flex: 1; 
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
  min-width: 0;
  padding: 0 10px;
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
  margin-bottom: 30px;
  margin-top: 30px;
}

.checkbox input {
  width: 16px;
  height: 16px;
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
}

button:hover {
  background: #243a8a;
}
.card .login{
  text-align: center;
  margin-top: 30px;
  font-size: 20px;
  color: black;
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

.error-alert {
  background: #ff3131;
  color: #ffffff;
  border: 1px solid #ea0c0c;
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
</style>