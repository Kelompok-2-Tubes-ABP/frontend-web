<script setup>
import { ref, nextTick } from 'vue'
import UserSideBar from '@/components/UserSideBar.vue'
const textareaRef = ref(null)


const autoResize = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

const handleEnter = (event) => {
  if (event.shiftKey) {
    return
  }

  event.preventDefault()
  sendMessage()
}

/* =========================
   CHAT STATE
========================= */
const message = ref('')
const chatBody = ref(null)
const showQuickPrompt = ref(true)

const quickPrompts = ref([
  '📊 Analisis pengeluaran bulan ini',
  '💡 Tips hemat untuk kategori makanan',
  '📈 Rekomendasikan strategi investasi',
  '🎯 Evaluasi progress tabungan saya',
  '⚠️ Tagihan apa yang harus dibayar minggu ini?',
  '💰 Berapa sisa budget saya?'
])

const chats = ref([
  {
    id: 1,
    sender: 'bot',
    text:
      'Halo! Saya siap bantu analisis keuangan kamu 🤖\nSaya bisa membantumu:\n• Analisis pengeluaran\n• Tips hemat dan investasi\n• Evaluasi progress tabungan\n• Rekomendasi budget\nAda yang ingin kamu tanyakan?',
    time: '10:09'
  }
])

/* =========================
   SEND MESSAGE
========================= */
const sendMessage = async (text = null) => {
  const finalMessage = text || message.value

  if (!finalMessage.trim()) return

  showQuickPrompt.value = false

  chats.value.push({
    id: Date.now(),
    sender: 'user',
    text: finalMessage,
    time: getCurrentTime()
  })

  message.value = ''
  

  await nextTick()
  if (textareaRef.value) {
    textareaRef.value.style.height = '64px'
  }
  scrollToBottom()

  setTimeout(async () => {
    chats.value.push({
      id: Date.now() + 1,
      sender: 'bot',
      text:
        'Baik, saya akan bantu analisis berdasarkan data keuangan kamu. Untuk saat ini, ini masih response dummy. Nanti bagian ini bisa disambungkan ke API backend atau AI kamu.',
      time: getCurrentTime()
    })

    await nextTick()
    scrollToBottom()
  }, 700)
}

/* =========================
   HELPER
========================= */
const getCurrentTime = () => {
  const now = new Date()
  return now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const scrollToBottom = () => {
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight
  }
}

const clearChat = () => {
  showQuickPrompt.value = true
  chats.value = [
    {
      id: 1,
      sender: 'bot',
      text:
        'Halo! Saya siap bantu analisis keuangan kamu 🤖\nSaya bisa membantumu:\n• Analisis pengeluaran\n• Tips hemat dan investasi\n• Evaluasi progress tabungan\n• Rekomendasi budget\nAda yang ingin kamu tanyakan?',
      time: getCurrentTime()
    }
  ]
}
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
            <h1>AI Finance Advisor 🤖</h1>
            <p>Powered by Gemma3 AI • Bahasa Indonesia</p>
          </div>

          <button class="delete-btn" @click="clearChat">
            🗑
          </button>
        </div>
      </div>

      <!-- CONTENT SCROLL -->
      <main class="content-scroll">
        <section class="chat-card">
          <!-- QUICK PROMPT -->
          <div v-if="showQuickPrompt" class="quick-area">
            <p>Coba tanya:</p>

            <div class="quick-list">
              <button
                v-for="item in quickPrompts"
                :key="item"
                class="quick-btn"
                @click="sendMessage(item)"
              >
                {{ item }}
              </button>
            </div>
          </div>

          <!-- CHAT BODY -->
          <div ref="chatBody" class="chat-body">
            <div
              v-for="item in chats"
              :key="item.id"
              class="chat-row"
              :class="{ user: item.sender === 'user' }"
            >
              <div
                class="chat-bubble"
                :class="{ user: item.sender === 'user' }"
              >
                <p>{{ item.text }}</p>
                <span>{{ item.time }}</span>
              </div>
            </div>
          </div>

          <!-- INPUT -->
          <div class="chat-input-wrapper">
            <textarea
            ref="textareaRef"
            v-model="message"
            placeholder="Tanya tentang keuanganmu..."
            rows="1"
            @input="autoResize"
            @keydown.enter="handleEnter"
            ></textarea>

            <button class="send-btn" @click="sendMessage()">
              ➤
            </button>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  height: 100vh;
  background: #f5f6fa;
  font-family: 'Inter', sans-serif;
}

/* MAIN */
.main-wrapper {
  flex: 1;
  margin-left: 300px;
  padding-top: 230px;
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
  background: rgba(245, 246, 250, 0.9);
  backdrop-filter: blur(10px);
  z-index: 1000;
  border-bottom: 3px solid #e5e7eb;
  padding-top: 30px;
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
  font-size: 38px;
  font-weight: 700;
  color: #1e293b;
}

.top-header p {
  margin: 6px 0 0;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.delete-btn {
  border: none;
  background: transparent;
  color: #ef4444;
  font-size: 40px;
  cursor: pointer;
  margin-right: 70px;
}

.delete-btn:hover {
  opacity: 0.7;
}

/* CONTENT */
.content-scroll {
  padding: 0 30px 40px;
}

/* CHAT CARD */
.chat-card {
  background: white;
  border-radius: 22px;
  height: 870px; /* gunakan height, bukan min-height */
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

  display: flex;
  flex-direction: column;
}

/* QUICK */
.quick-area {
  margin-bottom: 18px;
}

.quick-area p {
  margin: 0 0 10px;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.quick-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-btn {
  border: none;
  border-radius: 999px;
  background: #ede9fe;
  color: #4f46e5;
  padding: 8px 14px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
}

.quick-btn:hover {
  background: #ddd6fe;
}

/* CHAT BODY */
.chat-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
  margin-bottom: 18px;
}

.chat-body::-webkit-scrollbar {
  width: 6px;
}

.chat-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

.chat-row {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 12px;
  min-width: 0;
}

.chat-row.user {
  justify-content: flex-end;
  min-width: 0;
}

.chat-bubble {
  width: fit-content;
  max-width: 620px;
  min-width: 0;

  background: #eef2f7;
  border-radius: 16px;
  padding: 14px 16px;
  color: #1e293b;

  overflow-wrap: anywhere;
  word-break: break-word;
  white-space: normal;
}

.chat-bubble.user {
  background: #4f46e5;
  color: white;
}

.chat-bubble p {
  margin: 0;
  white-space: pre-wrap;

  font-size: 20px;
  line-height: 1.5;

  overflow-wrap: anywhere;
  word-break: break-word;
  max-width: 100%;
}

.chat-bubble span {
  display: block;
  margin-top: 12px;
  font-size: 16px;
  color: #94a3b8;
}

.chat-bubble.user span {
  color: #e0e7ff;
}

/* INPUT */
.chat-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 10px;

  margin-top: auto; /* ini yang bikin input tetap di bawah */
  flex-shrink: 0;
}

.chat-input-wrapper textarea {
  flex: 1;
  min-height: 64px;
  max-height: 160px;

  border: 1px solid #cbd5e1;
  border-radius: 12px;

  padding: 18px 16px;
  outline: none;

  font-size: 20px;
  line-height: 1.4;
  color: #1e293b;

  box-sizing: border-box;
  resize: none;

  overflow-y: auto;

  /* HILANGKAN ICON / SCROLLBAR */
  scrollbar-width: none;        /* Firefox */
  -ms-overflow-style: none;     /* Edge lama / IE */

  font-family: 'Inter', sans-serif;

  white-space: pre-wrap;
  word-break: break-word;
}

/* HILANGKAN SCROLLBAR DI CHROME / EDGE / SAFARI */
.chat-input-wrapper textarea::-webkit-scrollbar {
  display: none;
}

.chat-input-wrapper textarea:focus {
  border-color: #4f46e5;
}

.send-btn {
  width: 64px;
  height: 64px;
  border: none;
  border-radius: 12px;
  background: #a78bfa;
  color: white;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(167, 139, 250, 0.35);
  flex-shrink: 0;
}
.send-btn:hover {
  opacity: 0.9;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .main-wrapper {
    margin-left: 0;
    padding-top: 120px;
  }

  .content-scroll {
    max-width: 100%;
    padding: 0 16px 30px;
  }

  .chat-card {
    height: 600px;
    padding: 22px;
    border-radius: 18px;
  }

  .chat-body {
    flex: 1;
    min-height: 0;
    max-height: none;
  }

  .chat-bubble {
    max-width: 300px;
  }
}
</style>