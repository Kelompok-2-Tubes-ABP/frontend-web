import axios from 'axios'

export const API_BASE = 'https://backend-financeapi.up.railway.app'

const api = axios.create({
  baseURL: `${API_BASE}/api`,
   headers: {
    'Content-Type': 'application/json'
  }
})

export default api
