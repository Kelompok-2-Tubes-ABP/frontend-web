<script setup>
import { ref, computed, onMounted } from 'vue'
import UserSideBar from '@/components/UserSideBar.vue'
import iconNotifAlert from '@/assets/icon-notifAlert.svg'
import iconTransaction from '@/assets/User/icon-transaction.svg'
import iconBill from '@/assets/User/icon-bill.svg'
import iconTrendingDown from '@/assets/User/icon-TrendingDown.svg'
import iconGoal from '@/assets/User/icon-goals.svg'
import iconNotifications from '@/assets/icon-notifications.svg'

const API_BASE = 'http://localhost:8080/api/notifications/feed'
const token = localStorage.getItem('token') || sessionStorage.getItem('token')

const notificationGroups = ref([])
const isLoading = ref(true)


const getNotifStyle = (type) => {
  switch (type) {
    case 'budget': return { iconSrc: iconNotifAlert, iconClass: 'red' }
    case 'transaction': return { iconSrc: iconTransaction, iconClass: 'green' }
    case 'bill': return { iconSrc: iconBill, iconClass: 'yellow' }
    case 'debt': return { iconSrc: iconTrendingDown, iconClass: 'red' }
    case 'goal': return { iconSrc: iconGoal, iconClass: 'green' }
    case 'security': return { iconSrc: iconNotifAlert, iconClass: 'purple' }
    case 'system': return { iconSrc: iconNotifAlert, iconClass: 'yellow' }
    default: return { iconSrc: iconNotifications, iconClass: 'purple' }
  }
}

// Format ISO date string to readable time
const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  
  if (isToday) {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }
  
  const yesterday = new Date()
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Kemarin, ' + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }
  
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ', ' + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const groupNotificationsByDate = (notifications) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 7)

  const groups = {
    'Hari Ini': [],
    'Kemarin': [],
    'Minggu Ini': [],
    'Lebih Lama': []
  }

  notifications.forEach(notif => {
    const notifDate = new Date(notif.created_at)
    const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate())

    if (notifDay.getTime() === today.getTime()) {
      groups['Hari Ini'].push(notif)
    } else if (notifDay.getTime() === yesterday.getTime()) {
      groups['Kemarin'].push(notif)
    } else if (notifDay > sevenDaysAgo) {
      groups['Minggu Ini'].push(notif)
    } else {
      groups['Lebih Lama'].push(notif)
    }
  })

  // Filter out empty groups and return as array
  return Object.keys(groups)
    .filter(key => groups[key].length > 0)
    .map(key => ({ group: key, items: groups[key] }))
}

const fetchNotifications = async () => {
  isLoading.value = true
  try {
    const response = await fetch(API_BASE, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch')
    const data = await response.json()
    
  
    const mappedNotifications = data.notifications.map(notif => ({
      id: notif.id,
      title: notif.title,
      desc: notif.message,
      time: formatTime(notif.created_at),
      unread: !notif.is_read,
      link: notif.link,
      type: notif.type,
      created_at: notif.created_at, 
      ...getNotifStyle(notif.type)
    }))
    
    notificationGroups.value = groupNotificationsByDate(mappedNotifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
  } finally {
    isLoading.value = false
  }
}

const markAllAsRead = async () => {
  try {
    await fetch(`${API_BASE}/read-all`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    // Update local state optimistically
    notificationGroups.value = notificationGroups.value.map(group => ({
      ...group,
      items: group.items.map(item => ({ ...item, unread: false }))
    }))
  } catch (error) {
    console.error('Failed to mark all as read', error)
  }
}

const handleCardClick = async (item) => {
  // Mark as read via API if it's currently unread
  if (item.unread) {
    try {
      await fetch(`${API_BASE}/${item.id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      item.unread = false // Update local state
    } catch (error) {
      console.error('Failed to mark as read', error)
    }
  }
  
  // Redirect if the notification has a link
  if (item.link) {
    window.location.href = item.link
  }
}

const unreadCount = computed(() => {
  return notificationGroups.value.reduce((total, group) => {
    return total + group.items.filter((item) => item.unread).length
  }, 0)
})

onMounted(() => {
  fetchNotifications()
})
</script>

<template>
  <div class="dashboard-layout">
    <!-- SIDEBAR -->
    <UserSideBar />

    <!-- MAIN -->
    <div class="main-wrapper">
      <!-- TOPBAR FIXED -->
      <div class="topbar">
        <div class="top-header">
          <div>
            <h1>Notifikasi</h1>
            <p>{{ unreadCount }} notifikasi belum dibaca</p>
          </div>

          <button 
            class="read-btn" 
            @click="markAllAsRead"
            :disabled="unreadCount === 0"
            :style="{ opacity: unreadCount === 0 ? 0.5 : 1, cursor: unreadCount === 0 ? 'not-allowed' : 'pointer' }"
          >
            Tandai Semua Dibaca
          </button>
        </div>
      </div>

      <!-- CONTENT SCROLL -->
      <main class="content-scroll" v-if="!isLoading">
        <div v-if="notificationGroups.length === 0" class="empty-state">
          <p>Tidak ada notifikasi saat ini.</p>
        </div>

        <section
          v-for="group in notificationGroups"
          :key="group.group"
          class="notification-group"
        >
          <h3>{{ group.group }}</h3>

          <div class="notification-list">
            <div
              v-for="item in group.items"
              :key="item.id"
              class="notification-card"
              :class="{ unread: item.unread }"
              @click="handleCardClick(item)"
            >
              <div
                class="notif-icon"
                :class="item.iconClass"
              >
                <img :src="item.iconSrc" class="notif-svg-icon" alt="">
              </div>

              <div class="notif-content">
                <div class="notif-header">
                  <h4>{{ item.title }}</h4>

                  <span
                    v-if="item.unread"
                    class="new-badge"
                  >
                    Baru
                  </span>
                </div>

                <p>{{ item.desc }}</p>
                <small>{{ item.time }}</small>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <!-- Loading State -->
      <main class="content-scroll" v-else>
        <div class="empty-state">
          <p>Memuat notifikasi...</p>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f6fa;
  font-family: 'Inter', sans-serif;
}

/* MAIN */
.main-wrapper {
  flex: 1;
  margin-left: 300px;
  padding-top: 200px;
}

/* TOPBAR FIXED */
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
  padding-bottom: 66px;
}

.top-header h1 {
  margin: 0;
  color: #1e293b;
  font-size: 38px;
  font-weight: 700;
}

.top-header p {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
}

/* BUTTON */
.read-btn {
  min-width: 170px;
  height: 42px;
  border: 2px solid #4f46e5;
  border-radius: 10px;
  background: transparent;
  color: #4f46e5;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  margin-right: 60px;
  transition: all 0.2s ease;
}

.read-btn:hover:not(:disabled) {
  background: #4f46e5;
  color: white;
}

/* CONTENT */
.content-scroll {
  padding: 0 30px 45px;
}

/* GROUP */
.notification-group {
  margin-bottom: 24px;
}

.notification-group h3 {
  margin: 0 0 12px;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* CARD */
.notification-card {
  min-height: 112px;
  background: white;
  border-radius: 20px;
  padding: 24px 28px;

  display: flex;
  align-items: center;
  gap: 18px;

  border: 2px solid transparent;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  
  /* Interactive styles */
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  background: #fafafa;
}

.notification-card.unread {
  border-color: #4f46e5;
}

.notification-card.unread:hover {
  background: #f8f7ff; /* Slight purple tint for unread on hover */
}

/* ICON */
.notif-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.notif-icon.red {
  background: #fee2e2;
  color: #ef4444;
}

.notif-icon.orange {
  background: #ffedd5;
  color: #f97316;
}

.notif-icon.yellow {
  background: #fef3c7;
  color: #f59e0b;
}

.notif-icon.green {
  background: #dcfce7;
  color: #10b981;
}

.notif-icon.purple {
  background: #ede9fe;
  color: #4f46e5;
}

.notif-svg-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

/* CONTENT NOTIF */
.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.notif-header h4 {
  margin: 0;
  color: #1e293b;
  font-size: 14px;
  font-weight: 700;
}

.notif-content p {
  margin: 6px 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.4;
}

.notif-content small {
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
}

/* BADGE */
.new-badge {
  min-width: 42px;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #ede9fe;
  color: #4f46e5;

  font-size: 10px;
  font-weight: 700;
}

/* EMPTY STATE */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
  font-size: 14px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .main-wrapper {
    margin-left: 0;
    padding-top: 140px;
  }

  .topbar {
    left: 0;
    width: 100%;
  }

  .top-header {
    max-width: 100%;
    padding-bottom: 36px;
  }

  .top-header h1 {
    font-size: 30px;
  }

  .top-header p {
    font-size: 12px;
  }

  .read-btn {
    min-width: 140px;
    height: 38px;
    font-size: 11px;
    margin-right: 0;
  }

  .content-scroll {
    max-width: 100%;
    padding: 0 16px 35px;
  }

  .notification-card {
    min-height: 100px;
    padding: 20px;
    border-radius: 18px;
  }

  .notif-header h4 {
    font-size: 13px;
  }

  .notif-content p {
    font-size: 12px;
  }
}
</style>