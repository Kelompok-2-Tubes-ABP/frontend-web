<script setup>
import { ref, computed, onMounted } from 'vue'
import UserSideBar from '@/components/UserSideBar.vue'
import { API_BASE } from '../../../services/api.js'
import iconEditProfile from '@/assets/User/icon-editporfile.svg'
import axios from 'axios'

const token = localStorage.getItem('token') || sessionStorage.getItem('token')

/* =========================
   PROFILE DATA
========================= */
const profile = ref({
  username: '',
  email: '',
  role: '',
  created_at: '',
})

const isLoading = ref(true)

const profileInitial = computed(() => {
  const name = profile.value.username || 'User'
  return name.charAt(0).toUpperCase()
})

const formattedJoinDate = computed(() => {
  return formatDate(profile.value.created_at)
})

/* =========================
   MODAL STATE
========================= */
const showEditProfileModal = ref(false)
const showChangePasswordModal = ref(false)

const editProfileForm = ref({
  username: '',
  email: '',
})

const passwordForm = ref({
  current_password: '',
  new_password: '',
  confirm_password: '',
})

const profileError = ref('')
const profileSuccess = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')
const isUpdating = ref(false)

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
    year: 'numeric',
  })
}

/* =========================
   FETCH PROFILE
========================= */
const fetchProfile = async () => {
  isLoading.value = true

  try {
    const res = await axios.get(`${API_BASE}/profile/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = res.data.Message || res.data.message || res.data.user || {}

    console.log('Fetched profile data:', data)

    profile.value = {
      username: data.username || '',
      email: data.email || '',
      role: data.role || '-',
      created_at: data.created_at || data.CreatedAt || '',
    }
  } catch (err) {
    console.error('Error fetching profile:', err)
  } finally {
    isLoading.value = false
  }
}

/* =========================
   EDIT PROFILE
========================= */
const openEditProfile = () => {
  editProfileForm.value = {
    username: profile.value.username,
    email: profile.value.email,
  }

  profileError.value = ''
  profileSuccess.value = ''
  showEditProfileModal.value = true
}

const closeEditProfileModal = () => {
  showEditProfileModal.value = false
  profileError.value = ''
  profileSuccess.value = ''
}

const submitEditProfile = async () => {
  profileError.value = ''
  profileSuccess.value = ''

  if (!editProfileForm.value.username.trim()) {
    profileError.value = 'Username wajib diisi'
    return
  }

  if (!editProfileForm.value.email.trim()) {
    profileError.value = 'Email wajib diisi'
    return
  }

  isUpdating.value = true

  try {
    const updates = {}

    if (
      editProfileForm.value.username.trim() &&
      editProfileForm.value.username.trim() !== profile.value.username
    ) {
      updates.username = editProfileForm.value.username.trim()
    }

    if (
      editProfileForm.value.email.trim() &&
      editProfileForm.value.email.trim() !== profile.value.email
    ) {
      updates.email = editProfileForm.value.email.trim()
    }

    if (Object.keys(updates).length === 0) {
      profileError.value = 'Tidak ada perubahan'
      isUpdating.value = false
      return
    }

    const res = await axios.patch(`${API_BASE}/profile/`, updates, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const updatedUser = res.data.user || res.data.Message || res.data.message || {}

    profile.value = {
      username: updatedUser.username || editProfileForm.value.username,
      email: updatedUser.email || editProfileForm.value.email,
      role: updatedUser.role || profile.value.role,
      created_at: updatedUser.created_at || profile.value.created_at,
    }
    window.dispatchEvent(new Event("sidebar-updated"))
    profileSuccess.value = 'Profil berhasil diperbarui!'

    setTimeout(() => {
      closeEditProfileModal()
      fetchProfile(true)
    }, 1500)
  } catch (err) {
    profileError.value =
      err.response?.data?.error ||
      err.response?.data?.Error ||
      err.response?.data?.message ||
      'Gagal memperbarui profil'
  } finally {
    isUpdating.value = false
  }
}

/* =========================
   CHANGE PASSWORD
========================= */
const openChangePassword = () => {
  passwordForm.value = {
    current_password: '',
    new_password: '',
    confirm_password: '',
  }

  passwordError.value = ''
  passwordSuccess.value = ''
  showChangePasswordModal.value = true
}

const closeChangePasswordModal = () => {
  showChangePasswordModal.value = false
  passwordError.value = ''
  passwordSuccess.value = ''
}

const submitChangePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (!passwordForm.value.current_password || !passwordForm.value.new_password) {
    passwordError.value = 'Semua field wajib diisi'
    return
  }

  if (passwordForm.value.new_password.length < 8) {
    passwordError.value = 'Password baru minimal 8 karakter'
    return
  }

  if (!/[A-Z]/.test(passwordForm.value.new_password)) {
    passwordError.value = 'Password baru harus mengandung minimal 1 huruf besar'
    return
  }

  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    passwordError.value = 'Password baru tidak sama'
    return
  }

  isUpdating.value = true

  try {
    await axios.post(
      `${API_BASE}/profile/change-password`,
      {
        current_password: passwordForm.value.current_password,
        new_password: passwordForm.value.new_password,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    passwordSuccess.value = 'Password berhasil diubah!'

    setTimeout(() => {
      closeChangePasswordModal()
    }, 1500)
  } catch (err) {
    passwordError.value =
      err.response?.data?.error ||
      err.response?.data?.Error ||
      err.response?.data?.message ||
      'Gagal mengubah password'
  } finally {
    isUpdating.value = false
  }
}

onMounted(fetchProfile)
</script>

<template>
  <div class="dashboard-layout">
    <UserSideBar />

    <div class="main-wrapper">
      <div class="topbar">
        <div class="top-header">
          <h1>Pengaturan</h1>
        </div>
      </div>

      <main class="content-scroll">
        <!-- AKUN -->
        <section class="setting-card">
          <h3>Akun</h3>

          <div class="setting-list">
            <button class="setting-item" @click="openEditProfile">
              <div class="setting-left">
                <div class="setting-icon">
                  <img :src="iconEditProfile" alt="Edit Profile" />
                </div>

                <div>
                  <h4>Edit Profil</h4>
                  <p>Ubah informasi pribadi kamu</p>
                </div>
              </div>
            </button>

            <button class="setting-item" @click="openChangePassword">
              <div class="setting-left">
                <div class="setting-icon">
                  <img :src="iconEditProfile" alt="Ganti Password" />
                </div>

                <div>
                  <h4>Ganti Password</h4>
                  <p>Perbarui password akun kamu</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        <!-- PREVIEW DATA -->
        <section class="setting-card">
          <h3>Data Profil</h3>

          <div v-if="isLoading" class="loading-text">
            Mengambil data profil...
          </div>

          <div v-else class="setting-list compact">
            <div class="setting-item no-icon">
              <div>
                <h4>Username</h4>
                <p>{{ profile.username || '-' }}</p>
              </div>
            </div>

            <div class="setting-item no-icon">
              <div>
                <h4>Email</h4>
                <p>{{ profile.email || '-' }}</p>
              </div>
            </div>

            <div class="setting-item no-icon">
              <div>
                <h4>Role</h4>
                <p>{{ profile.role || '-' }}</p>
              </div>
            </div>

            <div class="setting-item no-icon">
              <div>
                <h4>Bergabung Sejak</h4>
                <p>{{ formattedJoinDate }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- TENTANG -->
        <section class="setting-card">
          <h3>Tentang</h3>

          <div class="setting-list compact">
            <div class="setting-item no-icon">
              <div class="setting-left">
                <div class="setting-icon">
                  <img :src="iconEditProfile" alt="Versi App" />
                </div>

                <div>
                  <h4>Versi App</h4>
                  <p>v1.0.0</p>
                </div>
              </div>
            </div>

            <div class="setting-item no-icon">
              <div class="setting-left">
                <div class="setting-icon">
                  <img :src="iconEditProfile" alt="Privacy Policy" />
                </div>

                <div>
                  <h4>Privacy Policy</h4>
                  <p>Kebijakan privasi kami</p>
                </div>
              </div>
            </div>

            <div class="setting-item no-icon">
              <div class="setting-left">
                <div class="setting-icon">
                  <img :src="iconEditProfile" alt="Syarat & Ketentuan" />
                </div>

                <div>
                  <h4>Syarat & Ketentuan</h4>
                  <p>Ketentuan penggunaan</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- EDIT PROFILE MODAL -->
    <Transition name="modal">
      <div
        v-if="showEditProfileModal"
        class="modal-overlay"
        @click.self="closeEditProfileModal"
      >
        <div class="modal profile-modal">
          <div class="modal-profile-header">
            <div class="profile-avatar">
              {{ profileInitial }}
            </div>

            <h3>{{ profile.username || 'User' }}</h3>
            <p>Edit informasi profil kamu</p>
          </div>

          <div class="profile-info-list">
            <div class="profile-info-item">
              <span>Role</span>
              <strong>{{ profile.role || '-' }}</strong>
            </div>

            <div class="profile-info-item">
              <span>Email</span>
              <strong>{{ profile.email || '-' }}</strong>
            </div>

            <div class="profile-info-item">
              <span>Bergabung Sejak</span>
              <strong>{{ formattedJoinDate }}</strong>
            </div>
          </div>

          <div class="modal-field">
            <label>Username</label>
            <input
              v-model="editProfileForm.username"
              type="text"
              placeholder="Username"
            />
          </div>

          <div class="modal-field">
            <label>Email</label>
            <input
              v-model="editProfileForm.email"
              type="email"
              placeholder="Email"
            />
          </div>

          <div v-if="profileError" class="modal-error">
            {{ profileError }}
          </div>

          <div v-if="profileSuccess" class="modal-success">
            {{ profileSuccess }}
          </div>

          <div class="modal-actions">
            <button class="modal-cancel" @click="closeEditProfileModal">
              Batal
            </button>

            <button
              class="modal-confirm"
              @click="submitEditProfile"
              :disabled="isUpdating"
            >
              {{ isUpdating ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- CHANGE PASSWORD MODAL -->
    <Transition name="modal">
      <div
        v-if="showChangePasswordModal"
        class="modal-overlay"
        @click.self="closeChangePasswordModal"
      >
        <div class="modal">
          <h3>Ganti Password</h3>

          <div class="modal-field">
            <label>Password Lama</label>
            <input
              v-model="passwordForm.current_password"
              type="password"
              placeholder="Masukkan password lama"
            />
          </div>

          <div class="modal-field">
            <label>Password Baru</label>
            <input
              v-model="passwordForm.new_password"
              type="password"
              placeholder="Minimal 8 karakter, 1 huruf besar"
            />
          </div>

          <div class="modal-field">
            <label>Konfirmasi Password Baru</label>
            <input
              v-model="passwordForm.confirm_password"
              type="password"
              placeholder="Ulangi password baru"
            />
          </div>

          <div v-if="passwordError" class="modal-error">
            {{ passwordError }}
          </div>

          <div v-if="passwordSuccess" class="modal-success">
            {{ passwordSuccess }}
          </div>

          <div class="modal-actions">
            <button class="modal-cancel" @click="closeChangePasswordModal">
              Batal
            </button>

            <button
              class="modal-confirm"
              @click="submitChangePassword"
              :disabled="isUpdating"
            >
              {{ isUpdating ? 'Mengubah...' : 'Ubah Password' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f6fa;
  font-family: 'Inter', sans-serif;
}

.main-wrapper {
  flex: 1;
  margin-left: 300px;
  padding-top: 200px;
}

.topbar {
  position: fixed;
  top: 0;
  left: 300px;
  width: calc(100% - 300px);
  display: flex;
  flex-direction: column;
  padding: 10px 28px;
  padding-top: 30px;
  background: rgba(245, 246, 250, 0.9);
  backdrop-filter: blur(10px);
  z-index: 1000;
  border-bottom: 3px solid #e5e7eb;
}

.top-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 90px;
}

.top-header h1 {
  margin: 0;
  font-size: 38px;
  font-weight: 700;
  color: #1e293b;
}

.content-scroll {
  padding: 0 30px 40px;
}

.setting-card {
  background: white;
  border-radius: 22px;
  padding: 24px 26px;
  margin-bottom: 22px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.setting-card h3 {
  margin: 0 0 22px;
  color: #1e293b;
  font-size: 28px;
  font-weight: 700;
}

.setting-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-list.compact {
  gap: 18px;
}

.setting-item {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: opacity 0.2s;
}

.setting-item:active {
  opacity: 0.7;
}

.setting-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.setting-icon {
  width: 24px;
  height: 24px;
  color: #4f46e5;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  flex-shrink: 0;
}

.setting-icon img {
  width: 30px;
  height: 30px;
  display: block;
  object-fit: contain;
}

.setting-item h4 {
  margin: 0 0 4px;
  color: #1e293b;
  font-size: 20px;
  font-weight: 600;
}

.setting-item p {
  margin: 0;
  color: #64748b;
  font-size: 18px;
  line-height: 1.4;
}

.setting-item:hover h4 {
  color: #4f46e5;
}

.setting-item.no-icon {
  cursor: default;
}

.setting-item.no-icon:hover h4 {
  color: #1e293b;
}

.loading-text {
  color: #64748b;
  font-size: 20px;
}

/* =========================
   MODAL TRANSITION
========================= */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

/* =========================
   MODAL
========================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
  padding: 20px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal {
  background: white;
  border-radius: 18px;
  padding: 28px 32px;
  width: 100%;
  max-width: 460px;
  box-sizing: border-box;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease;
}

.profile-modal {
  max-width: 500px;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal h3 {
  margin: 0 0 20px;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

/* =========================
   EDIT PROFILE MODAL HEADER
========================= */
.modal-profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 22px;
  margin-bottom: 22px;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
}

.profile-avatar {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 34px;
  font-weight: 800;
  margin-bottom: 14px;
  box-shadow: 0 8px 18px rgba(79, 70, 229, 0.25);
}

.modal-profile-header h3 {
  margin: 0;
  font-size: 24px;
  color: #1e293b;
}

.modal-profile-header p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 18px;
}

/* =========================
   PROFILE INFO LIST
========================= */
.profile-info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.profile-info-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px 16px;
}

.profile-info-item span {
  color: #64748b;
  font-size: 18px;
  font-weight: 600;
}

.profile-info-item strong {
  color: #1e293b;
  font-size: 18px;
  font-weight: 700;
  text-align: right;
  word-break: break-word;
}

/* =========================
   MODAL FORM
========================= */
.modal-field {
  margin-bottom: 20px;
}

.modal-field label {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.modal-field input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  font-size: 18px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.modal-field input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
}

.modal-error {
  color: #ef4444;
  font-size: 20px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #fee2e2;
  border-radius: 6px;
}

.modal-success {
  color: #10b981;
  font-size: 20px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #d1fae5;
  border-radius: 6px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.modal-cancel,
.modal-confirm {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.modal-cancel {
  background: #f3f4f6;
  color: #374151;
}

.modal-cancel:hover {
  background: #e5e7eb;
}

.modal-confirm {
  background: #4f46e5;
  color: white;
}

.modal-confirm:hover {
  background: #4338ca;
}

.modal-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* =========================
   RESPONSIVE
========================= */
@media (max-width: 900px) {
  .main-wrapper {
    margin-left: 0;
    padding-top: 120px;
  }

  .topbar {
    left: 0;
    width: 100%;
  }

  .top-header {
    justify-content: flex-start;
    padding-bottom: 32px;
  }

  .top-header h1 {
    font-size: 30px;
  }

  .content-scroll {
    max-width: 100%;
    padding: 0 16px 30px;
  }

  .setting-card {
    border-radius: 18px;
    padding: 22px;
  }

  .modal {
    max-width: 100%;
    padding: 24px;
  }

  .profile-info-item {
    flex-direction: column;
    gap: 6px;
  }

  .profile-info-item strong {
    text-align: left;
  }
}
</style>