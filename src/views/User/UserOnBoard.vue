<script setup>
import UserOnBoard from '@/assets/User/user-onboard.svg';
import iconOnBoard from '@/assets/User/icon-onboard.svg';
import iconOnBoard2 from '@/assets/User/icon-onboard2.svg';
import iconOnBoard3 from '@/assets/User/icon-onboard3.svg';
import router from '@/router';

const goLogin = () =>{
  router.push('/userLogin')
};

const goRegister = () => {
  router.push('/userRegister')
}

</script>
<template>
  <div class="auth-page">
    <!-- Decorative Icons -->
    <div class="icon top-left">
      <img :src="iconOnBoard">
    </div>
    <div class="icon top-right">
      <img :src="iconOnBoard3">
    </div>
    <div class="icon bottom-left">
      <img :src="iconOnBoard2">
    </div>

    <!-- Main Content -->
    <div class="auth-container">

      <!-- Content Tengah -->
      <div class="content">
        <div class="logo-box">
          <img :src="UserOnBoard">
        </div>

        <h1>FinanceApp</h1>
        <p>Kelola keuangan, capai tujuan hidupmu</p>
      </div>

      <!-- Button Bottom -->
      <div class="buttons">
        <button @click="goLogin" class="btn login">Masuk</button>
        <button @click="goRegister" class="btn register">Daftar</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.auth-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;

  background: linear-gradient(
    135deg,
    #4f8cff 0%,
    #6c63ff 50%,
    #9b4dff 100%
  );

  font-family: "Poppins", sans-serif;
}

/* Decorative Icons */
.icon {
  position: absolute;
  color: rgba(255, 255, 255, 0.2);
}

.icon img{
  width: 80px;
}

.top-left {
  top: 80px;
  left: 50px;
}

.top-right {
  top: 150px;
  right: 90px;
}

.bottom-left {
  bottom: 100px;
  left: 70px;
}

/* Main Layout */
.auth-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 60px 30px;
  box-sizing: border-box;
  color: white;
}

/* Content Tengah */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

/* Logo */
.logo-box {
  width: 130px;
  height: 130px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(12px);
  margin-bottom: 0px;
}

.logo-box img {
  width: 70px;
}

/* Title */
.auth-container h1 {
  font-family: 'Inter', sans-serif;
  font-size: 64px;
  font-weight: 500;
  margin-bottom:  0px;
}

/* Subtitle */
.auth-container p {
  color: whitesmoke;
  font-weight: 100;
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  opacity: 0.9;
  line-height: 1.5;
  margin-top: 5px;
}

/* Bottom Buttons */
.buttons {
  width: 100%;
  max-width: 500px;

  display: flex;
  flex-direction: column;
  gap: 18px;

  margin-bottom: 20px;
}

/* Button */
.btn {
  height: 72px;
  border-radius: 999px;

  font-size: 24px;
  font-weight: 600;

  cursor: pointer;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    background 0.25s ease;
}

/* Login */
.login {
  border: none;
  background: white;
  color: #5a54ff;
}

.login:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255,255,255,0.25);
}

/* Register */
.register {
  background: transparent;
  border: 4px solid rgba(255, 255, 255, 0.8);
  color: white;
}

.register:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
}

/* Responsive */
@media (max-width: 768px) {
  .auth-container h1 {
    font-size: 42px;
  }

  .auth-container p {
    font-size: 18px;
  }

  .buttons {
    max-width: 100%;
  }

  .btn {
    height: 60px;
    font-size: 18px;
  }

  .logo-box {
    width: 90px;
    height: 90px;
  }

  .logo-box span {
    font-size: 42px;
  }
}

/* =========================
   PAGE ANIMATION
========================= */

.content {
  animation: fadeCenter 1s ease;
}

.logo-box {
  animation: popUp 0.8s ease;
}

.auth-container h1 {
  animation: fadeUp 1s ease;
}

.auth-container p {
  animation: fadeUp 1.2s ease;
}

.buttons {
  animation: slideBottom 1.4s ease;
}

/* Floating Icons */
.top-left {
  animation: float1 4s ease-in-out infinite;
}

.top-right {
  animation: float2 5s ease-in-out infinite;
}

.bottom-left {
  animation: float3 6s ease-in-out infinite;
}

/* =========================
   KEYFRAMES
========================= */

@keyframes fadeCenter {
  from {
    opacity: 0;
    transform: scale(0.96);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes popUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.7);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(25px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideBottom {
  from {
    opacity: 0;
    transform: translateY(40px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Floating Decorative Icons */

@keyframes float1 {
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-18px);
  }

  100% {
    transform: translateY(0px);
  }
}

@keyframes float2 {
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(15px);
  }

  100% {
    transform: translateY(0px);
  }
}

@keyframes float3 {
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-12px);
  }

  100% {
    transform: translateY(0px);
  }
}
</style>