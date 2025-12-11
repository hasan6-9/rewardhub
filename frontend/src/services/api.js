import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

// API Service
export default {
  // ==================== AUTH ====================
  async login(credentials) {
    const response = await apiClient.post('/api/auth/login', credentials)
    return response.data
  },

  async register(userData) {
    const response = await apiClient.post('/api/auth/register', userData)
    return response.data
  },

  async getProfile() {
    // UPDATED: Matches GET /api/auth/profile
    const response = await apiClient.get('/api/auth/profile')
    return response.data
  },

  // ==================== USERS (ADMIN) ====================
  // UPDATED: Users are under /api/admin/users
  async getAllUsers(params) {
    const response = await apiClient.get('/api/admin/users', { params })
    return response.data
  },

  async createUser(userData) {
    const response = await apiClient.post('/api/admin/users', userData)
    return response.data
  },

  async updateUser(userId, userData) {
    const response = await apiClient.put(`/api/admin/users/${userId}`, userData)
    return response.data
  },

  async deleteUser(userId) {
    const response = await apiClient.delete(`/api/admin/users/${userId}`)
    return response.data
  },

  // ==================== ACHIEVEMENTS ====================
  async getAllAchievements() {
    const response = await apiClient.get('/api/achievements')
    return response.data
  },

  async getMyAchievements() {
    const response = await apiClient.get('/api/student-achievements')
    return response.data
  },

  async createAchievement(achievementData) {
    // UPDATED: Admin creates via /api/admin/achievements
    const response = await apiClient.post('/api/admin/achievements', achievementData)
    return response.data
  },

  async updateAchievement(achievementId, achievementData) {
    const response = await apiClient.put(`/api/admin/achievements/${achievementId}`, achievementData)
    return response.data
  },

  async deleteAchievement(achievementId) {
    const response = await apiClient.delete(`/api/admin/achievements/${achievementId}`)
    return response.data
  },

  async awardAchievement(awardData) {
    const response = await apiClient.post('/api/student-achievements', awardData)
    return response.data
  },

  // ==================== REWARDS (Previously PERKS) ====================
  // UPDATED: Backend uses /api/rewards
  async getAllPerks() {
    const response = await apiClient.get('/api/rewards')
    return response.data
  },

  async createPerk(perkData) {
    const response = await apiClient.post('/api/admin/perks', perkData)
    return response.data
  },

  async updatePerk(perkId, perkData) {
    const response = await apiClient.put(`/api/admin/perks/${perkId}`, perkData)
    return response.data
  },

  async deletePerk(perkId) {
    const response = await apiClient.delete(`/api/admin/perks/${perkId}`)
    return response.data
  },

  async redeemPerk(redemptionData) {
    // UPDATED: Matches POST /api/redemptions with body { rewardId, walletAddress }
    const response = await apiClient.post('/api/redemptions', redemptionData)
    return response.data
  },

  async getMyRedemptions(studentId) {
    const response = await apiClient.get(`/api/redemptions/student/${studentId}`)
    return response.data
  },

  // ==================== WALLET ====================

  async getNonce() {
    // UPDATED: Matches POST /api/users/wallet/nonce (Authenticated, no body needed if user inferred from token)
    const response = await apiClient.post('/api/users/wallet/nonce')
    return response.data
  },

  async verifySignature(signatureData) {
    // UPDATED: Matches POST /api/users/wallet/verify { address, signature }
    const response = await apiClient.post('/api/users/wallet/verify', signatureData)
    return response.data
  },

  async disconnectWallet() {
    const response = await apiClient.post('/api/users/wallet/disconnect')
    return response.data
  },

  async getWalletStatus() {
    const response = await apiClient.get('/api/users/wallet/status')
    return response.data
  },

  // ==================== STATS ====================
  async getDashboardStats() {
    const response = await apiClient.get('/api/admin/dashboard-stats')
    return response.data
  },

  // ==================== FACULTY ====================
  async getAllStudents() {
    // Faculty-accessible endpoint to list students for awarding achievements
    const response = await apiClient.get('/api/admin/students')
    return response.data
  },
}
