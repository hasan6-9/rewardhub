import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || null)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isFaculty = computed(() => user.value?.role === 'faculty')
  const isStudent = computed(() => user.value?.role === 'student')

  // Actions
  async function login(credentials) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.login(credentials)
      token.value = response.token
      user.value = response.user
      
      // Persist token
      localStorage.setItem('token', response.token)
      
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(userData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.register(userData)
      token.value = response.token
      user.value = response.user
      
      // Persist token
      localStorage.setItem('token', response.token)
      
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    if (!token.value) return
    
    loading.value = true
    error.value = null
    
    try {
      const response = await api.getProfile()
      user.value = response.user
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch profile'
      // If token is invalid, logout
      if (err.response?.status === 401) {
        logout()
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    token,
    user,
    loading,
    error,
    // Getters
    isAuthenticated,
    userRole,
    isAdmin,
    isFaculty,
    isStudent,
    // Actions
    login,
    register,
    fetchProfile,
    logout,
    clearError,
  }
})
