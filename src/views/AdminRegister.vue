<script setup>
import { ref } from "vue"
import router from "@/router"
import adminRegister from "@/assets/admin-register.svg"
import inputName from "@/assets/icon-inputname.svg"
import inputMail from "@/assets/icon-inputmail.svg"
import inputPhone from "@/assets/icon-inputphone.svg"
import inputOrg from "@/assets/icon-inputorg.svg"
import inputPass from "@/assets/icon-inputpass.svg"
import eyeOn from '@/assets/icon-eyeon.svg'
import eyeOff from '@/assets/icon-eyeoff.svg'
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const successMessage = ref("")

const form = ref({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  organization: "",
  password: "",
  confirmPassword: "",
  agree: false
})

const errors = ref({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  organization: "",
  password: "",
  confirmPassword: "",
  agree: ""
})

const submitForm = () => {
  Object.keys(errors.value).forEach(key => errors.value[key] = "")

  let valid = true

  if (!form.value.firstName) {
    errors.value.firstName = "First name wajib diisi"
    valid = false
  }

  if(!form.value.lastName) {
    errors.value.lastName = "Last name wajib diisi"
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

  if(!form.value.organization) {
    errors.value.organization = "Organization wajib diisi"
    valid = false
  }

  if (form.value.password.length < 8) {
    errors.value.password = "Minimal 8 karakter"
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

  console.log("Data:", form.value)
  successMessage.value = "Account berhasil dibuat!"
  setTimeout(() => {successMessage.value = ""}, 3000)
  setTimeout(() => {router.push("/login")}, 3500)
    
}
</script>

<template>
  <div class="container">
    <div class="card">
      <p class="back">← Back to Login</p>
    
       <img :src="adminRegister" class="icon">
   
      <h2>Create Admin Account</h2>
      <p class="subtitle">Register for FinTech Admin Dashboard</p>

      <div class="form">
        <div class="row">
          <div class="field">
            <label>First Name</label>
              <div class="input-wrapper">
                <img :src= "inputName" class="input-icon" />
                <input v-model="form.firstName" placeholder="First Name" />
            </div>
            <span class="error" v-if="errors.firstName">{{ errors.firstName }}</span>
          </div>

          <div class="field">
            <label>Last Name</label>
              <div class="input-wrapper">
                <img :src="inputName" class="input-icon" />
                <input v-model="form.lastName" placeholder="Last Name" />
                <span class="error" v-if="errors.lastName">{{ errors.lastName }}</span>
              </div>  
          </div>
        </div>

        <div class="field">
          <label>Email Address</label>
            <div class="input-wrapper">
              <img :src="inputMail" class="input-icon" />
              <input v-model="form.email" placeholder="Email Address" />
            </div>
            <span class="error" v-if="errors.email">{{ errors.email }}</span>
        </div>

        <div class="row">
          <div class="field">
            <label>Phone Number (Optional)</label>
            <div class="input-wrapper">
              <img :src="inputPhone" class="input-icon" />
              <input v-model="form.phone" placeholder="Phone Number" />
            </div>
          </div>

          <div class="field">
            <label>Organization</label>
            <div class="input-wrapper">
              <img :src="inputOrg" class="input-icon" />
            <input v-model="form.organization" placeholder="Organization" />
            </div>
            <span class="error" v-if="errors.organization">{{ errors.organization }}</span>
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
      </div>

        <label class="checkbox">
          <input type="checkbox" v-model="form.agree" />
          I agree to the<a href="/terms">Terms and Conditions</a> and <a href="/privacy">Privacy Policy</a>
        </label>

        <button @click="submitForm">Create Account</button>

        <div v-if="successMessage" class="success-alert">
          {{ successMessage }}
        </div>

        <p class="login">
          Already have an account? <a href="/login">Login here</a>
        </p>
    </div>
  </div>
</template>

<style scoped>
.container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #eaf0f7;
}

.card {
  width: 100%;
  max-width: 800px;
  padding: 32px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
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
  margin-bottom: 18px;
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
  background: #ecfdf5; /* hijau soft */
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

/* animasi muncul */
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